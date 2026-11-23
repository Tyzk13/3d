// Campanhas e a Mesa do Mestre: heróis da campanha, combates com iniciativa, ganchos de cena, dados e anotações.
(function (HB) {
  const R = HB.R, UI = HB.UI, S = HB.S, F = HB.F, esc = UI.esc;

  // ---------- Lista de campanhas ----------
  function paginaCampanhas() {
    const sis = HB.Sistemas.ativo;
    const cs = HB.P.minhasCampanhas().filter(c => HB.Sistemas.doSistema(c, sis.id)).sort((a, b) => (b.criada || 0) - (a.criada || 0));
    const mestre = cs.filter(HB.P.ehMestre).length;
    return `<section class="pagina">
      <div class="pagina-topo"><div><h1 class="titulo-hq">Campanhas</h1><p class="sub">${cs.length} campanha${cs.length === 1 ? '' : 's'} de ${esc(sis.nome)} · mestre em ${mestre}</p></div>
        <div class="barra-acoes"><button class="btn" data-act="entrar-codigo">Entrar com código</button><button class="btn primario" data-act="nova-campanha">Nova campanha</button></div></div>
      ${cs.length ? `<div class="grade-campanhas">${cs.map(c => `<article class="cartao-campanha">
          <div class="cc-capa" ${c.capa ? `style="background-image:url('${c.capa}')"` : ''}><span class="cc-num">${(c.herois || []).length} heróis · ${1 + (c.membros || []).length} pessoas</span>
            ${HB.P.ehMestre(c) ? `<button class="icone cc-apagar" data-act="apagar-campanha" data-id="${c.id}" aria-label="Apagar campanha">✕</button>` : ''}</div>
          <div class="cc-info"><div><h3>${esc(c.nome)}</h3><small>Iniciada em ${new Date(c.criada || Date.now()).toLocaleDateString('pt-BR')} · <b class="papel ${HB.P.ehMestre(c) ? 'mestre' : ''}">${HB.P.ehMestre(c) ? 'Mestre' : HB.P.temEscudo(c) ? 'Jogador com escudo' : 'Jogador'}</b></small></div>
            <a class="btn pequeno primario" href="#campanha-${c.id}">Acessar</a></div></article>`).join('')}</div>`
        : `<div class="vazio-grande"><p class="titulo-hq">Nenhuma campanha</p><p>Crie uma campanha para ser o mestre, ou entre na de alguém com o código de convite.</p>
            <div class="barra-acoes"><button class="btn" data-act="entrar-codigo">Entrar com código</button><button class="btn primario" data-act="nova-campanha">Criar campanha</button></div></div>`}
    </section>`;
  }

  // ---------- Página da campanha (todos os participantes) ----------
  function capa(c, editavel) {
    return `<div class="mesa-capa" ${c.capa ? `style="background-image:linear-gradient(transparent, rgba(0,0,0,.78)), url('${c.capa}')"` : ''}>
        ${editavel ? `<input id="m-nome" class="mesa-nome" data-f="nome" value="${esc(c.nome)}" aria-label="Nome da campanha">` : `<h1 class="mesa-nome">${esc(c.nome)}</h1>`}
        ${editavel ? '<label class="btn pequeno">Foto de capa<input type="file" accept="image/*" data-capa hidden></label>' : ''}</div>`;
  }
  function paginaCampanha(c, estado) {
    if (!HB.P.ehMembro(c)) {
      return `<section class="pagina">${capa(c, false)}<div class="vazio-grande"><p>Você ainda não participa desta campanha.</p>
        <button class="btn primario" data-act="entrar-campanha" data-id="${c.id}">Entrar como jogador</button></div></section>`;
    }
    const aba = estado.abaCamp || 'herois', mestre = HB.P.ehMestre(c);
    const meus = S.lista('herois').filter(h => h.dono === HB.P.eu() && HB.Sistemas.doSistema(h, HB.Sistemas.idDe(c)) && !(c.herois || []).includes(h.id));
    let corpo;
    if (aba === 'jogadores') corpo = abaJogadores(c);
    else if (aba === 'combate') corpo = combateJogador(c);
    else {
      const hs = heroisDa(c);
      corpo = `${hs.length ? `<div class="grade-cartoes">${hs.map(h => cartaoHeroiCampanha(c, h)).join('')}</div>` : '<div class="vazio-grande"><p>Nenhum herói na campanha ainda. Cada jogador adiciona o seu.</p></div>'}`;
    }
    return `<section class="pagina mesa" data-doc="campanhas:${c.id}" data-campanha="${c.id}">
      ${capa(c, mestre)}
      <div class="acoes-campanha">
        ${HB.P.temEscudo(c) ? `<a class="btn primario" href="#escudo-${c.id}">Escudo do Mestre</a>` : ''}
        <button class="btn" data-act="add-meu-heroi" ${meus.length || !S.lista('herois').some(h => h.dono === HB.P.eu() && HB.Sistemas.doSistema(h, HB.Sistemas.idDe(c))) ? '' : 'disabled title="Todos os seus heróis já estão aqui"'}>Adicionar meu ${esc(nomeR(c, 'personagem'))}</button>
        ${mestre ? '<button class="btn" data-act="convidar">Convidar jogadores</button>' : ''}
      </div>
      <div class="mesa-grade">
        ${UI.painelResultados(c.rolagens || [], HB.P.temEscudo(c))}
        <div class="mesa-corpo">
          <div class="abas" role="tablist">${[['herois', nomeR(c, 'personagens')], ['jogadores', 'Jogadores'], ['combate', 'Combate']].map(([k, n]) => `<button role="tab" aria-selected="${aba === k}" class="aba ${aba === k ? 'ativa' : ''}" data-act="aba-camp" data-aba="${k}">${n}</button>`).join('')}</div>
          ${corpo}
        </div></div></section>`;
  }
  function cartaoHeroiCampanha(c, h) {
    const sis = SIS.de(h), d = sis.derivados(h), pode = h.dono === HB.P.eu() || HB.P.ehMestre(c);
    return `<article class="cartao-heroi">${UI.foto(h.foto, h.nome)}
      <div class="ch-info"><h3>${esc(h.nome)}</h3><p class="ch-classe">${esc(sis.nomeClasse(h))}</p>
        <p class="ch-meta">${esc(HB.A.nome(h.dono))}${(h.condicoes || []).length ? ' · ' + esc(h.condicoes.join(', ')) : ''}</p>
        <div class="ch-barras">${UI.barraMini('pv', F.pvAtual(h, d), d.pvMax)}${UI.barraMini('mana', F.manaAtual(h, d), d.manaMax)}</div></div>
      <div class="ch-acoes">${pode ? `<button class="btn pequeno perigo-txt" data-act="tirar-heroi-campanha" data-id="${h.id}">Tirar</button>` : ''}<a class="btn pequeno primario" href="#heroi-${h.id}">Ficha</a></div></article>`;
  }
  function abaJogadores(c) {
    const mestre = HB.P.ehMestre(c), pessoas = [c.mestre].concat(c.membros || []);
    return `<p class="dica">Só o mestre abre o Escudo do Mestre. Ele pode liberar o escudo para um jogador (para dividir a mesa ou ajudar no combate) e retirar quando quiser, ou passar o cargo de mestre.</p>
      <ul class="pessoas">${pessoas.map(id => {
        const ehM = id === c.mestre, esc_ = (c.escudo || []).includes(id), hs = heroisDa(c).filter(h => h.dono === id);
        return `<li class="pessoa"><div><b>${esc(HB.A.nome(id))}${id === HB.P.eu() ? ' (você)' : ''}</b>
            <small>${ehM ? 'Mestre' : esc_ ? 'Jogador com escudo' : 'Jogador'}${hs.length ? ' · ' + esc(hs.map(h => h.nome).join(', ')) : ''}</small></div>
          <div class="pessoa-acoes">${mestre && !ehM ? `
            <button class="btn pequeno ${esc_ ? '' : 'primario'}" data-act="escudo-toggle" data-id="${id}">${esc_ ? 'Retirar escudo' : 'Passar escudo'}</button>
            <button class="btn pequeno" data-act="tornar-mestre" data-id="${id}">Tornar mestre</button>
            <button class="btn pequeno perigo-txt" data-act="remover-membro" data-id="${id}">Remover</button>` : ''}
            ${!ehM && id === HB.P.eu() ? '<button class="btn pequeno perigo-txt" data-act="sair-campanha">Sair da campanha</button>' : ''}</div></li>`;
      }).join('')}</ul>`;
  }
  // Visão do jogador: ordem de iniciativa e estado de cada um; a vida exata dos vilões só se o mestre mostrar.
  function estadoVida(pv, max) {
    if (pv <= 0) return 'Caído'; const f = pv / Math.max(1, max);
    return f >= 1 ? 'Ileso' : f > 0.5 ? 'Ferido' : f > 0.2 ? 'Muito ferido' : 'Por um fio';
  }
  function combateJogador(c) {
    const cb = (c.combates || [])[(c.combates || []).length - 1];
    if (!cb) return '<div class="vazio-grande"><p>Nenhum combate em andamento.</p></div>';
    const ord = ordenar(c, cb), vez = ord.length ? ord[(cb.turno | 0) % ord.length] : null;
    return `<div class="iniciativa"><div class="ini-topo"><div><b>${esc(cb.nome)}</b><small>Rodada ${cb.rodada | 0}${vez ? ' · vez de ' + esc(vez.nome) : ''}</small></div></div>
      <ol class="ini-lista">${ord.map(p => `<li class="ini-item ${vez && p.uid === vez.uid ? 'vez' : ''} ${p.pv <= 0 ? 'caido' : ''}"><div class="ini-btn">${UI.foto(p.foto, p.nome)}
        <span class="ini-nome">${esc(p.nome)}${p.tipo === 'vilao' ? ' <small class="selo vil">vilão</small>' : ''}</span>
        ${p.tipo === 'heroi' || c.vidaViloes ? UI.barraMini('pv', p.pv, p.pvMax) : `<span class="estado-vida">${estadoVida(p.pv, p.pvMax)}</span>`}
        <span class="ini-agi">${valorIni(c, p)}</span></div></li>`).join('')}</ol></div>`;
  }

  // ---------- Escudo do Mestre ----------
  const ABAS = [['herois', 'Personagens'], ['combates', 'Combates'], ['ganchos', 'Ganchos'], ['dados', 'Dados'], ['anotacoes', 'Anotações']];
  function mesa(c, estado) {
    if (!HB.P.temEscudo(c)) return `<section class="pagina"><div class="vazio-grande"><p class="titulo-hq">Só o mestre</p><p>O Escudo do Mestre fica com o mestre da campanha. Ele pode passar o escudo para você na aba Jogadores.</p><a class="btn" href="#campanha-${c.id}">Voltar para a campanha</a></div></section>`;
    const aba = estado.abaMesa || 'herois';
    let corpo = '';
    if (aba === 'herois') corpo = abaHerois(c);
    else if (aba === 'combates') corpo = abaCombates(c, estado);
    else if (aba === 'ganchos') corpo = abaGanchos(c);
    else if (aba === 'dados') corpo = abaDados(c);
    else corpo = `<label class="campo"><span>Anotações do Mestre (os jogadores não veem)</span><textarea id="m-notas" rows="18" data-f="anotacoes" placeholder="NPCs, pistas, o que cada herói deve a quem…">${esc(c.anotacoes || '')}</textarea></label>`;
    return `<section class="pagina mesa" data-doc="campanhas:${c.id}" data-campanha="${c.id}">
      <div class="escudo-topo"><a class="voltar" href="#campanha-${c.id}">← ${esc(c.nome)}</a><span class="selo-escudo">Escudo do Mestre${HB.P.ehMestre(c) ? '' : ' · liberado pelo mestre'}</span></div>
      <div class="mesa-grade">
        ${UI.painelResultados(c.rolagens || [], true, `<label class="interruptor secreto"><input id="m-secreta" type="checkbox" data-act-change="rolagem-secreta" ${HB.rolagemSecreta ? 'checked' : ''}><span>Rolar em segredo</span></label>`)}
        <div class="mesa-corpo">
          <div class="abas" role="tablist">${ABAS.map(([k, n]) => `<button role="tab" aria-selected="${aba === k}" class="aba ${aba === k ? 'ativa' : ''}" data-act="aba-mesa" data-aba="${k}">${n}</button>`).join('')}</div>
          ${corpo}
        </div>
      </div></section>`;
  }

  function heroisDa(c) { return (c.herois || []).map(id => S.pegar('herois', id)).filter(Boolean); }

  const SIS = HB.Sistemas;
  const nomeR = (c, k) => SIS.de(c).rotulos[k];
  function abaHerois(c) {
    const hs = heroisDa(c);
    return `${hs.length ? `<div class="grade-escudo">${hs.map(h => cartaoEscudo(h)).join('')}</div>`
        : `<div class="vazio-grande"><p>Nenhum ${esc(nomeR(c, 'personagem'))} nesta campanha. Os jogadores adicionam os seus na página da campanha.</p></div>`}`;
  }
  function cartaoEscudo(h) {
    const sis = SIS.de(h), d = sis.derivados(h), cb = sis.combatente(h);
    let linha = esc(HB.A.nome(h.dono));
    if (sis.temReputacao) { const rep = R.REPUTACAO.estado(h.reputacao | 0); linha += ` · <span class="rep-mini ${rep.id}">Reputação ${esc(rep.nome)} (${(h.reputacao | 0) > 0 ? '+' : ''}${h.reputacao | 0})</span>`; }
    if (sis.id === 'sh') linha += ` · Quebras ${h.quebras | 0}/3`;
    return `<article class="escudo-heroi">
      <div class="eh-topo">${UI.foto(h.foto, h.nome)}<div><h3>${esc(h.nome)}</h3><p>${esc(sis.nomeClasse(h))}</p>
        <p class="rep-mini">${linha}</p>
        ${(h.condicoes || []).length ? `<p class="conds">${h.condicoes.map(x => `<span>${esc(x)}</span>`).join('')}</p>` : ''}</div></div>
      <div class="eh-attrs">${(cb.escudo || cb.testes).slice(0, 6).map(t => `<button class="eh-attr" data-act="mesa-rolar-attr" data-heroi="${h.id}" data-attr="${t.id}" title="Rolar ${esc(t.rotulo)}"><small>${esc(t.curto)}</small><b>${esc(t.mini)}</b></button>`).join('')}</div>
      <h4>Vida</h4>${UI.barra('pv', F.pvAtual(h, d), d.pvMax, 'heroi:' + h.id)}
      <h4>${esc(sis.rotulos.recurso)}</h4>${UI.barra('mana', F.manaAtual(h, d), d.manaMax, 'heroi:' + h.id)}
      <div class="eh-rodape">${cb.numeros.slice(0, 4).map(([r, v]) => `<span><small>${esc(r)}</small><b>${esc(v)}</b></span>`).join('')}
        <a href="#heroi-${h.id}">Ficha</a></div></article>`;
  }

  // ---------- Combates ----------
  function participante(c, p) {
    if (p.tipo === 'heroi') {
      const h = S.pegar('herois', p.ref); if (!h) return null;
      const sis = SIS.de(h), d = sis.derivados(h), cb = sis.combatente(h);
      return { ...p, nome: h.nome, foto: h.foto, classe: h.classe, agi: cb.agi, ordemClasse: cb.ordemClasse, pv: F.pvAtual(h, d), pvMax: d.pvMax, mana: F.manaAtual(h, d), manaMax: d.manaMax, def: cb.def, dureza: cb.dureza, cb, fonte: h, sis };
    }
    const sis = SIS.de(c), cb = sis.combatente(p.v);
    return { ...p, nome: p.nome || p.v.nome, foto: p.v.foto, classe: '', agi: cb.agi, ordemClasse: 9, pvMax: cb.pvMax, manaMax: cb.manaMax, def: cb.def, dureza: cb.dureza, cb, fonte: p.v, sis };
  }
  // Heróis de Bueiro: maior Agilidade, empate pela ordem das classes. Shinigamis & Hollows: iniciativa rolada, empate pela Destreza.
  // Nos dois, as setas desfazem o que ainda empatar.
  function ordenar(c, cb) {
    const rolada = SIS.de(c).iniciativa === 'rolada';
    return (cb.parts || []).map(p => participante(c, p)).filter(Boolean)
      .sort(rolada ? (a, b) => (b.ini | 0) - (a.ini | 0) || b.agi - a.agi || (a.desempate | 0) - (b.desempate | 0)
        : (a, b) => b.agi - a.agi || a.ordemClasse - b.ordemClasse || (a.desempate | 0) - (b.desempate | 0));
  }
  const valorIni = (c, p) => (SIS.de(c).iniciativa === 'rolada' ? (p.ini == null ? '–' : p.ini) : p.agi);

  function abaCombates(c, estado) {
    const sis = SIS.de(c), rolada = sis.iniciativa === 'rolada';
    const cbs = c.combates || [];
    const cb = cbs.find(x => x.id === estado.combate) || cbs[cbs.length - 1];
    const sel = `<div class="barra-acoes">
      ${cbs.length ? `<label class="campo"><span>Combate</span><select id="m-combate" data-act-change="escolher-combate">${cbs.map(x => `<option value="${x.id}" ${cb && x.id === cb.id ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></label>` : ''}
      <button class="btn primario" data-act="novo-combate">Novo combate</button>
      ${cb ? '<button class="btn perigo-txt" data-act="encerrar-combate">Encerrar</button>' : ''}
      ${cb && rolada ? '<button class="btn" data-act="rolar-iniciativa">Rolar iniciativa de novo</button>' : ''}
      <label class="interruptor"><input id="m-vida-viloes" type="checkbox" data-f="vidaViloes" ${c.vidaViloes ? 'checked' : ''}><span>Jogadores veem a vida das ${esc(sis.rotulos.ameacas.toLowerCase())}</span></label></div>`;
    if (!cb) return sel + `<div class="vazio-grande"><p>Nenhum combate. Crie um, adicione ${esc(sis.rotulos.personagens.toLowerCase())} e ${esc(sis.rotulos.ameacas.toLowerCase())}, e a ordem de iniciativa se monta sozinha.</p></div>`;
    const ord = ordenar(c, cb);
    const vez = ord.length ? ord[(cb.turno | 0) % ord.length] : null;
    const selId = estado.sel && ord.some(p => p.uid === estado.sel) ? estado.sel : vez && vez.uid;
    const ps = ord.find(p => p.uid === selId);
    return sel + `<div class="combate" data-combate="${cb.id}">
      <div class="iniciativa">
        <div class="ini-topo"><div><b>Iniciativa</b><small>Rodada ${cb.rodada | 0}</small></div>
          <div class="ini-botoes"><button class="btn pequeno" data-act="turno" data-d="-1">Voltar turno</button><button class="btn pequeno primario" data-act="turno" data-d="1">Próximo turno</button></div></div>
        <ol class="ini-lista">${ord.map(p => `<li class="ini-item ${vez && p.uid === vez.uid ? 'vez' : ''} ${p.uid === selId ? 'sel' : ''} ${p.pv <= 0 ? 'caido' : ''}">
          <button class="ini-btn" data-act="sel-part" data-uid="${p.uid}">${UI.foto(p.foto, p.nome)}
            <span class="ini-nome">${esc(p.nome)}${p.tipo === 'vilao' ? ` <small class="selo vil">${esc(sis.rotulos.ameaca)}</small>` : ''}${(p.tipo === 'heroi' ? p.fonte.condicoes || [] : p.condicoes || []).length ? ` <small class="cond-mini">${esc((p.tipo === 'heroi' ? p.fonte.condicoes : p.condicoes).join(', '))}</small>` : ''}</span>
            ${UI.barraMini('pv', p.pv, p.pvMax)}<span class="ini-agi" title="${rolada ? 'Iniciativa' : 'Nível de Agilidade'}">${valorIni(c, p)}</span></button>
          <span class="ini-mover"><button class="icone" data-act="mover-part" data-uid="${p.uid}" data-d="-1" aria-label="Subir">▲</button><button class="icone" data-act="mover-part" data-uid="${p.uid}" data-d="1" aria-label="Descer">▼</button></span></li>`).join('') || '<li class="vazio">Adicione participantes.</li>'}</ol>
        <div class="ini-add"><button class="btn largo" data-act="combate-add-herois">Adicionar ${esc(sis.rotulos.personagens.toLowerCase())}</button><button class="btn largo" data-act="combate-add-viloes">Adicionar ${esc(sis.rotulos.ameacas.toLowerCase())}</button></div>
        <p class="dica">${rolada ? 'Ordem: iniciativa rolada (1d20 + Percepção) ao entrar no combate. Empate: maior Destreza. As setas desfazem o que ainda empatar.'
          : 'Ordem: maior nível de Agilidade. Empate: Atirador, Lutador, Mago, Curandeiro, Tanker (Estrategista e vilões depois). As setas desfazem empates.'}</p>
      </div>
      <div class="painel-part">${ps ? painelParticipante(c, cb, ps, ord, estado) : '<p class="vazio">Escolha alguém na iniciativa.</p>'}</div></div>`;
  }

  function painelParticipante(c, cb, p, ord, estado) {
    const alvo = `part:${c.id}:${cb.id}:${p.uid}`, sis = p.sis, k = p.cb;
    const alvos = ord.filter(o => o.uid !== p.uid);
    const ult = estado.ultimo && estado.ultimo.de === p.uid ? estado.ultimo : null;
    const alvoAtual = estado.alvo && alvos.some(a => a.uid === estado.alvo) ? estado.alvo : (alvos.find(a => a.tipo !== p.tipo) || {}).uid;
    const m = estado.multi | 0;
    return `<div class="pp-topo">${UI.foto(p.foto, p.nome, 'grande')}<div><h3>${esc(p.nome)}</h3>
        <p>${esc(k.linha)}</p>
        <a href="#${p.tipo === 'heroi' ? 'heroi-' + p.ref : 'vilao-' + (p.v.id || '')}" ${p.tipo === 'vilao' && !p.v.id ? 'hidden' : ''}>Abrir ficha</a></div>
        <button class="icone" data-act="tirar-part" data-uid="${p.uid}" aria-label="Tirar do combate">✕</button></div>
      ${p.tipo === 'vilao' ? `<label class="campo linha"><span>Nome no combate</span><input id="pp-nome-${p.uid}" data-f-part="${p.uid}" value="${esc(p.nome)}"></label>` : ''}
      <h4>Vida</h4>${UI.barra('pv', p.pv, p.pvMax, alvo)}
      <h4>${esc(sis.rotulos.recurso)}</h4>${UI.barra('mana', p.mana, p.manaMax, alvo)}
      ${p.tipo === 'vilao' ? `<div class="condicoes pp-conds">${sis.condicoes.map(x => `<button class="cond ${(p.condicoes || []).includes(x) ? 'on' : ''}" data-act="cond-part" data-uid="${p.uid}" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>` : ''}
      <div class="pp-numeros">${k.numeros.map(([r, v]) => `<span><small>${esc(r)}</small><b>${esc(v)}</b></span>`).join('')}</div>
      <div class="pp-attrs ${k.testes.length > 6 ? 'muitos' : ''}">${k.testes.map(t => `<button class="eh-attr" data-act="part-rolar-attr" data-uid="${p.uid}" data-attr="${t.id}"><small>${esc(t.rotulo)}</small><b>${esc(t.texto)}</b></button>`).join('')}</div>
      <div class="pp-ataques"><div class="bloco-topo"><h3>Ataques</h3>
        ${alvos.length ? `<label class="campo"><span>Alvo</span><select id="pp-alvo" data-act-change="escolher-alvo">${alvos.map(a => `<option value="${a.uid}" ${a.uid === alvoAtual ? 'selected' : ''}>${esc(a.nome)} (Def ${a.def}${a.dureza ? ', Dureza ' + a.dureza : ''})</option>`).join('')}</select></label>` : ''}</div>
        ${k.multiAtaque ? `<div class="multi" role="group" aria-label="Ataque do turno">${['1º ataque', '2º (−5)', '3º+ (−10)'].map((t, i) => `<button class="chip ${m === i ? 'on' : ''}" data-act="sh-multi" data-v="${i}">${t}</button>`).join('')}</div>` : ''}
        ${k.ataques.map((a, i) => `<div class="pp-ataque"><div><b>${esc(a.nome)}</b><small>${esc(a.sub)}</small></div>
            <button class="btn pequeno primario" data-act="part-atacar" data-uid="${p.uid}" data-i="${i}">Atacar</button></div>`).join('') || '<p class="vazio">Sem ataques na ficha.</p>'}
        ${ult ? `<div class="pp-ultimo"><span>${esc(ult.texto)}</span>${ult.dano > 0 ? `<button class="btn pequeno perigo" data-act="aplicar-dano">Aplicar ${ult.dano} de dano em ${esc(ult.alvoNome)}${ult.dureza ? ` (já tirando Dureza ${ult.dureza})` : ''}</button>` : ''}</div>` : ''}
      </div>
      ${k.poderes.length ? `<div class="pp-poderes"><h3>${sis.id === 'sh' && p.tipo === 'heroi' ? 'Kidos' : 'Poderes'}</h3>${k.poderes.map((x, i) => `<div class="pp-ataque"><div><b>${esc(x.nome)}</b><small>${x.custo | 0} ${esc(sis.rotulos.recurso)}${x.desc ? ' · ' + esc(x.desc) : ''}</small></div><button class="btn pequeno" data-act="part-poder" data-uid="${p.uid}" data-i="${i}">Usar</button></div>`).join('')}</div>` : ''}`;
  }

  // ---------- Ganchos ----------
  function abaGanchos(c) {
    const gs = c.ganchos || [];
    return `<div class="barra-acoes">
        <button class="btn" data-act="novo-gancho" data-tipo="conflito">Gancho de Conflito</button>
        ${SIS.de(c).temReputacao ? '<button class="btn" data-act="novo-gancho" data-tipo="reputacao">Gancho de Reputação</button>' : ''}
        <button class="btn" data-act="novo-gancho" data-tipo="invasao">Gancho de Invasão</button></div>
      <p class="dica">As cenas se ligam por ganchos, como numa HQ. Conflito inicia uma disputa física, mental ou argumentativa; Reputação mexe na fama de um herói; Invasão segue as etapas de Preparação, Tocaia e Ação.</p>
      <div class="ganchos">${gs.map((g, i) => cartaoGancho(c, g, i)).reverse().join('') || '<p class="vazio">Nenhum gancho nesta campanha.</p>'}</div>`;
  }
  function cartaoGancho(c, g, i) {
    const f = k => `ganchos.${i}.${k}`;
    const topo = `<div class="g-topo"><span class="g-tipo ${g.tipo}">${{ conflito: 'Conflito', reputacao: 'Reputação', invasao: 'Invasão' }[g.tipo]}</span>
      <input id="g-t-${i}" class="item-nome" data-f="${f('titulo')}" value="${esc(g.titulo)}" placeholder="Título da cena">
      <button class="icone" data-act="apagar-gancho" data-i="${i}" aria-label="Apagar gancho">✕</button></div>`;
    let corpo = '';
    if (g.tipo === 'conflito') {
      corpo = `<div class="g-linha"><label class="campo"><span>Tipo de conflito</span><select id="g-s-${i}" data-f="${f('sub')}">${R.CONFLITOS.map(x => `<option ${x === g.sub ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
        <button class="btn pequeno" data-act="gancho-combate" data-i="${i}">Abrir combate desta cena</button></div>`;
    } else if (g.tipo === 'reputacao') {
      const hs = heroisDa(c);
      corpo = `<div class="g-linha">
        <label class="campo"><span>Herói</span><select id="g-h-${i}">${hs.map(h => `<option value="${h.id}">${esc(h.nome)}</option>`).join('')}</select></label>
        <label class="campo"><span>Ação</span><select id="g-a-${i}"><option value="1">Benéfica (+)</option><option value="0">Neutra</option><option value="-1">Maléfica (−)</option></select></label>
        <label class="campo"><span>Grau</span><select id="g-g-${i}"><option value="1">1 · 10 pts</option><option value="2">2 · 20 pts</option><option value="3">3 · 30 pts</option></select></label>
        <button class="btn pequeno primario" data-act="gancho-rep" data-i="${i}" ${hs.length ? '' : 'disabled'}>Registrar</button></div>
        <ul class="rep-hist">${(g.log || []).map(l => `<li><b class="${l.pts > 0 ? 'mais' : l.pts < 0 ? 'menos' : ''}">${l.pts > 0 ? '+' : ''}${l.pts}</b> ${esc(l.nome)}</li>`).join('')}</ul>`;
    } else {
      const sp = g.sucessos | 0, arm = g.armadilhas | 0;
      const vi = (g.vInv | 0), vd = (g.vDef | 0), dif = vi - vd;
      const cont = (k, rot) => `<div class="contador"><small>${rot}</small><button class="seta" data-act="gancho-cont" data-i="${i}" data-k="${k}" data-d="-1" aria-label="Menos">−</button><b>${g[k] | 0}</b><button class="seta" data-act="gancho-cont" data-i="${i}" data-k="${k}" data-d="1" aria-label="Mais">+</button></div>`;
      const hs = heroisDa(c);
      corpo = `<div class="g-linha"><label class="campo"><span>Invasores</span><input id="g-inv-${i}" data-f="${f('invasores')}" value="${esc(g.invasores || '')}"></label>
          <label class="campo"><span>Invadidos</span><input id="g-def-${i}" data-f="${f('invadidos')}" value="${esc(g.invadidos || '')}"></label></div>
        <div class="etapa"><h4>1 · Preparação</h4><p class="dica">Teste de Intelecto contínuo. O plano funciona com mais sucessos do que armadilhas na base.</p>
          <div class="g-linha">${cont('armadilhas', 'Armadilhas')}${cont('acoes', 'Ações do plano')}
            <label class="campo mini"><span>Dificuldade</span><input id="g-dt-${i}" type="number" data-f="${f('dt')}" value="${g.dt == null ? 8 : g.dt}"></label>
            <label class="campo"><span>Quem testa</span><select id="g-q-${i}">${hs.map(h => `<option value="${h.id}">${esc(h.nome)}</option>`).join('')}</select></label>
            <button class="btn pequeno" data-act="gancho-teste" data-i="${i}" data-attr="INT" data-k="sucessos" ${hs.length ? '' : 'disabled'}>Rolar Intelecto</button></div>
          <p class="g-status ${sp > arm ? 'ok' : ''}">${sp} sucesso${sp === 1 ? '' : 's'} · ${g.usadas | 0}/${g.acoes | 0} ações usadas · ${sp > arm ? 'plano pronto' : `precisa de ${arm + 1 - sp} a mais`}</p></div>
        <div class="etapa"><h4>2 · Tocaia</h4><p class="dica">Agilidade dos invasores contra a Percepção dos invadidos. Cada sucesso vale um sucesso garantido contra armadilhas.</p>
          <div class="g-linha"><label class="campo mini"><span>Percepção</span><input id="g-pe-${i}" type="number" data-f="${f('percepcao')}" value="${g.percepcao == null ? 8 : g.percepcao}"></label>
            <button class="btn pequeno" data-act="gancho-teste" data-i="${i}" data-attr="AGI" data-k="tocaia" ${hs.length ? '' : 'disabled'}>Rolar Agilidade</button>${cont('tocaia', 'Sucessos garantidos')}</div></div>
        <div class="etapa"><h4>3 · Ação</h4><div class="g-linha">${cont('vInv', 'Vantagens invasores')}${cont('vDef', 'Vantagens invadidos')}</div>
          <p class="g-status ${dif ? 'ok' : ''}">${dif > 0 ? `Invasores agem ${dif} ação${dif > 1 ? 'ões' : ''} antes do combate.` : dif < 0 ? `Invadidos agem ${-dif} ação${dif < -1 ? 'ões' : ''} antes do combate.` : 'Sem ações extras: combate normal.'}</p>
          <button class="btn pequeno" data-act="gancho-combate" data-i="${i}">Abrir combate da invasão</button></div>`;
    }
    return `<article class="gancho">${topo}${corpo}<textarea id="g-n-${i}" rows="2" data-f="${f('notas')}" placeholder="Notas da cena">${esc(g.notas || '')}</textarea></article>`;
  }

  function abaDados(c) {
    const sis = SIS.de(c);
    return `<div class="bloco"><form class="rolar-livre" data-act-submit="rolar-livre"><label class="sr" for="dados-expr">Expressão</label>
      <input id="dados-expr" name="expr" placeholder="${sis.id === 'sh' ? '1d20+5, 2d6+3…' : '1d10+1d6, 2d6+4…'}" autocomplete="off"><button class="btn primario">Rolar</button></form>
      <div class="dados-rapidos">${sis.dadosRapidos.map(x => `<button class="btn" data-act="rolar-rapido" data-expr="${esc(x.expr)}">${esc(x.rotulo)}${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</button>`).join('')}</div></div>`;
  }

  HB.M = { paginaCampanhas, paginaCampanha, mesa, ordenar, participante, heroisDa };
})(window.HB);
