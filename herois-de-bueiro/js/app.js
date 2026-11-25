// Roteador (#hash), ações dos botões e ligação dos campos com os dados.
(function (HB) {
  const R = HB.R, UI = HB.UI, S = HB.S, F = HB.F, M = HB.M, D = HB.D, esc = UI.esc;
  const raiz = () => UI.$('#app');
  const estado = { rota: '', busca: '', filtro: 'todos', aba: 'combate', abaMesa: 'herois', abaCamp: 'herois', ajuste: 0, multi: 0 };
  const P = HB.P, AU = HB.A, SI = HB.Sistemas;

  // ---------- Rotas ----------
  function rota() { return (location.hash || '#inicio').slice(1); }
  function render() {
    const r = rota();
    if (r !== estado.rota) { const mesmaFamilia = r.split('-')[0] === estado.rota.split('-')[0]; estado.rota = r; if (!mesmaFamilia) { estado.busca = ''; estado.filtro = 'todos'; } estado.aba = 'combate'; estado.ajuste = 0; estado.ultimo = null; window.scrollTo(0, 0); }
    const [nome, ...resto] = r.split('-'), id = resto.join('-');
    if (nome !== 'escudo' && nome !== 'mesa') HB.rolagemSecreta = false;
    let html;
    // Abrir uma ficha, ameaça ou campanha de outro livro troca o livro ativo.
    const doc = nome === 'heroi' ? S.pegar('herois', id) : nome === 'vilao' ? F.pegarVilao(id) : (nome === 'campanha' || nome === 'escudo' || nome === 'mesa') ? S.pegar('campanhas', id) : null;
    if (doc && SI.idDe(doc) !== SI.idAtivo) { SI.escolher(SI.idDe(doc)); desenharTopo(); }
    const precisaLivro = ['herois', 'campanhas', 'viloes', 'regras'].includes(nome);
    if (precisaLivro && !SI.ativo) { location.hash = '#inicio'; return; }
    if (!AU.usuario && nome !== 'regras') html = paginaLogin();
    else if (nome === 'herois') html = F.listaHerois(estado);
    else if (nome === 'heroi') { const h = S.pegar('herois', id); html = h ? SI.de(h).ficha(h, estado) : naoAchou('Essa ficha não existe mais.', '#herois'); }
    else if (nome === 'campanhas') html = M.paginaCampanhas();
    else if (nome === 'campanha') { const c = S.pegar('campanhas', id); if (c) P.assumirCampanhaSemMestre(c); html = c ? M.paginaCampanha(c, estado) : naoAchou('Essa campanha não existe mais.', '#campanhas'); }
    else if (nome === 'escudo' || nome === 'mesa') { const c = S.pegar('campanhas', id); if (c) P.assumirCampanhaSemMestre(c); html = c ? M.mesa(c, estado) : naoAchou('Essa campanha não existe mais.', '#campanhas'); }
    else if (nome === 'viloes') html = SI.ativo.paginaViloes(estado);
    else if (nome === 'vilao') { const v = F.pegarVilao(id); html = v ? SI.de(v).fichaVilao(v, estado) : naoAchou('Essa ameaça não existe mais.', '#viloes'); }
    else if (nome === 'regras') html = SI.ativo.regras();
    else html = paginaInicio();
    const foco = document.activeElement && document.activeElement.id;
    raiz().innerHTML = html;
    travarLeitura();
    raiz().querySelectorAll('input:not([type=number]):not([type=file]):not([type=checkbox]):not([type=range]):not([maxlength])').forEach(i => (i.maxLength = 200));
    raiz().querySelectorAll('textarea:not([maxlength])').forEach(t => (t.maxLength = 5000));
    if (foco) { const el = document.getElementById(foco); if (el && el.matches('input,textarea')) { el.focus(); if (el.setSelectionRange && el.type !== 'number') { const n = el.value.length; el.setSelectionRange(n, n); } } }
    document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('ativo', a.dataset.sec === secao(nome)));
  }
  const secao = n => ({ inicio: '',  heroi: 'herois', herois: 'herois', campanhas: 'campanhas', mesa: 'campanhas', campanha: 'campanhas', escudo: 'campanhas', viloes: 'viloes', vilao: 'viloes', regras: 'regras' })[n] || '';
  const naoAchou = (t, volta) => `<section class="pagina"><div class="vazio-grande"><p>${esc(t)}</p><a class="btn" href="${volta}">Voltar</a></div></section>`;

  // Fichas de outras pessoas: dá para ver, trocar de aba e rolar; não dá para mudar.
  const LIVRES = ['aba', 'rolar-attr', 'rolar-ataque', 'duplicar-vilao', 'filtro', 'sh-multi', 'ajuste', 'ajuste-fixo'];
  function travarLeitura() {
    raiz().querySelectorAll('.leitura').forEach(box => box.querySelectorAll('input,select,textarea,button').forEach(el => {
      if (el.closest('.rolar-livre') || LIVRES.includes(el.dataset.act)) return;
      el.disabled = true;
    }));
  }

  function paginaLogin() {
    const m = AU.modo;
    let corpo;
    const webview = /FBAN|FBAV|Instagram|WhatsApp|Line\/|; wv\)/i.test(navigator.userAgent);
    if (m === 'firebase') corpo = `${webview ? '<p class="faixa">Você abriu pelo app (WhatsApp, Instagram…). O Google não deixa entrar por aqui: toque nos três pontinhos e escolha "Abrir no navegador".</p>' : ''}<button class="btn primario grande largo" data-act="login-google"><span class="g-logo" aria-hidden="true">G</span> Entrar com Google</button>
      <div class="ou"><span>ou com e-mail</span></div>
      <form class="form-login" data-act-submit="login-email">
        <label class="campo"><span>E-mail</span><input id="lg-email" name="email" type="email" autocomplete="email" required></label>
        <label class="campo"><span>Senha</span><input id="lg-senha" name="senha" type="password" autocomplete="current-password" minlength="8" maxlength="128" required></label>
        <label class="campo"><span>Nome (só para criar conta)</span><input id="lg-nome" name="nome" autocomplete="nickname"></label>
        <div class="barra-acoes"><button class="btn primario" name="acao" value="entrar">Entrar</button><button class="btn" name="acao" value="criar">Criar conta</button></div></form>`;
    else if (m === 'erro') corpo = `<p class="faixa">Não consegui carregar o login (arquivos em vendor/firebase). Recarregue a página; se continuar, confira se a pasta vendor foi publicada junto com o site.</p>`;
    else if (m === 'claude') corpo = `<p>Esta página usa a sua conta do claude.ai. Entre no claude.ai (dá para entrar com o Google) e abra o link de novo.</p>`;
    else {
      const contas = AU.contasLocais();
      corpo = `<p class="dica">Modo de teste: a conta fica só neste navegador. Para login com Google de verdade, o site precisa do Firebase configurado (veja FIREBASE.md).</p>
        ${contas.length ? `<div class="contas">${contas.map(c => `<button class="btn" data-act="login-local" data-nome="${esc(c.nome)}">${esc(c.nome)}</button>`).join('')}</div>` : ''}
        <form class="form-login" data-act-submit="login-local"><label class="campo"><span>Seu nome</span><input id="lg-local" name="nome" required maxlength="40" placeholder="Como a mesa te chama"></label>
        <button class="btn primario">Entrar</button></form>`;
    }
    return `<section class="login"><div class="login-cartao"><h1 class="titulo-capa">RPG<span>HUB</span></h1>
      <p class="capa-sub">Entre para salvar seus heróis na sua conta e participar das campanhas da mesa.</p>${corpo}</div></section>`;
  }

  // Estante do RPGHUB: cada livro é um sistema.
  function paginaInicio() {
    const livros = SI.lista();
    const conta = id => ({ p: S.lista('herois').filter(h => SI.idDe(h) === id && h.dono === P.eu()).length, c: P.minhasCampanhas().filter(c => SI.idDe(c) === id).length });
    return `<section class="estante">
      <div class="estante-topo"><h1 class="titulo-capa">RPG<span>HUB</span></h1>
        <p class="capa-sub">Escolha o livro. Fichas, campanhas, ameaças e regras seguem o sistema dele; a conta, o Escudo do Mestre e o combate são os mesmos.</p></div>
      <div class="livros">${livros.map(l => { const n = conta(l.id); return `<div class="livro-item"><button class="livro livro-${esc(l.id)} ${SI.idAtivo === l.id ? 'aberto' : ''}" data-act="escolher-livro" data-id="${esc(l.id)}">
          <span class="livro-lombada" aria-hidden="true"></span>
          <span class="livro-capa"><span class="livro-selo">${esc(l.sub)}</span><b class="livro-nome">${esc(l.nome)}</b><span class="livro-desc">${esc(l.descricao)}</span>
            <span class="livro-rodape">${AU.usuario ? `${n.p} ficha${n.p === 1 ? '' : 's'} · ${n.c} campanha${n.c === 1 ? '' : 's'}` : 'Entre para ver suas fichas'}<i>${SI.idAtivo === l.id ? 'Aberto' : 'Abrir livro'}</i></span></span></button>
          ${l.livro ? `<p class="livro-pdf"><a href="${l.livro.pdf}" target="_blank" rel="noopener">Ler o livro em PDF</a> <small>${esc(l.livro.titulo)} · ${esc(l.livro.tamanho)}. ${esc(l.livro.creditos)}</small></p>` : ''}</div>`; }).join('')}</div>
    </section>`;
  }

  HB.paginaRegrasHB = () => paginaRegras();
  // Link para o PDF do livro (abre em outra aba; o navegador mostra e deixa baixar).
  HB.botaoLivro = id => { const l = (SI.lista().find(x => x.id === id) || {}).livro; return l ? `<a class="btn primario" href="${l.pdf}" target="_blank" rel="noopener">Ler o livro <small>PDF · ${esc(l.tamanho)}</small></a>` : ''; };
  function paginaRegras() {
    const t = (cab, linhas) => `<div class="tabela-rolagem"><table class="tabela-regra"><thead><tr>${cab.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${linhas.map(l => `<tr>${l.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    return `<section class="pagina regras">
      <div class="pagina-topo"><h1 class="titulo-hq">Regras</h1>${HB.botaoLivro('hb')}</div>
      <div class="regras-grade">
      <article class="bloco"><h2>Rolagem</h2><p>Todo teste rola <b>1d10</b> mais o dado do nível no atributo. Cada personagem começa com ${R.PONTOS_INICIAIS} pontos de atributo; cada nível custa ${R.CUSTO_NIVEL}. Classe e origem somam ou tiram níveis.</p>
        ${t(['Nível', 'Dado somado'], R.NIVEIS.map((n, i) => [i + ' · ' + n.nome, i ? R.dadoTexto(i) : '0']))}</article>
      <article class="bloco"><h2>Ataque e dano</h2><p>Ataque: <b>1d10 + bônus da maestria</b> (corpo a corpo, à distância ou magia). Dano: <b>dado do atributo usado + bônus da maestria</b>. Um soco com Força Comum causa 1d4 + maestria.</p>
        ${t(['Maestria', 'Bônus'], [0, 1, 2, 3, 4, 5].map(n => ['Nível ' + n, '+' + R.bonusMaestria(n)]))}
        <p class="dica">Na mesa, o ataque conta como acerto quando o total iguala ou passa a Defesa do alvo.</p></article>
      <article class="bloco largo"><h2>Classes</h2>${t(['Classe', 'Vida', 'Mana', 'Defesa', 'Bônus'], Object.values(R.CLASSES).map(c => [c.nome, `${c.pv[0]} + ${c.pv[1]}/Vigor`, `${c.mana[0]} + ${c.mana[1]}/Feitiçaria`, `${c.def} + Agilidade`,
        [Object.entries(c.fixo || {}).map(([a, v]) => `+${v} ${R.nomeAttr(a)}`).join(', '), (c.escolhas || []).map(e => `${e.rotulo} ${e.opcoes.map(R.nomeAttr).join(' ou ')}`).join(', '),
          c.maestria ? Object.entries(c.maestria).map(([m, v]) => `Nível ${v} em ${R.MAESTRIAS.find(x => x.id === m).nome}`).join('') : `Nível ${c.maestriaEscolha} na maestria escolhida`].filter(Boolean).join(' · ')]))}</article>
      <article class="bloco largo"><h2>Origens</h2><div class="origens">${Object.values(R.ORIGENS).map(o => `<div><h3>${esc(o.nome)}</h3><p>${esc(o.texto)}</p></div>`).join('')}</div></article>
      <article class="bloco"><h2>Elementos</h2><ul class="elementos">${Object.entries(R.ELEMENTOS).map(([k, v]) => `<li style="--el:${v.cor}"><b>${k}</b> domina ${v.vence} · perde para ${R.perdePara(k)}</li>`).join('')}</ul>
        <p>Variantes surgem de misturas (Fogo + Terra = Magma) ou derivações (Água → Gelo); a vantagem é situacional. Só a origem Elemental recebe benefícios físicos dos elementos.</p></article>
      <article class="bloco"><h2>Iniciativa</h2><p>Quem tem mais nível de Agilidade age primeiro. No empate: Atirador, Lutador, Mago, Curandeiro, Tanker.</p></article>
      <article class="bloco"><h2>Reputação</h2><p>Ações benéficas somam, maléficas subtraem: grau 1 vale 10 pontos, grau 2 vale 20 e grau 3 vale 30. Todo herói começa em 0.</p>
        ${t(['Reputação', 'Quando', 'Efeito'], [['Positiva', '+100 ou mais', '+1 Carisma com a população'], ['Neutra', 'entre −100 e +100', '+1 Carisma para intimidar civis'], ['Negativa', '−100 ou menos', '−2 Carisma com a população']])}</article>
      <article class="bloco"><h2>Ganchos de cena</h2><p><b>Conflito</b>: físico, mental ou argumentativo. <b>Reputação</b>: a fama do herói puxa a cena. <b>Invasão</b>: Preparação (plano com teste de Intelecto contínuo contra as armadilhas), Tocaia (Agilidade contra Percepção) e Ação (quem tem mais vantagens ganha ações antes do combate).</p></article>
      </div></section>`;
  }

  // ---------- Utilidades ----------
  function docDe(el) {
    const box = el.closest('[data-doc]'); if (!box) return null;
    const [col, id] = box.dataset.doc.split(':');
    const o = S.pegar(col, id); return o ? { col, id, o } : null;
  }
  function setCaminho(o, caminho, v) {
    const ps = caminho.split('.'); let x = o;
    for (let i = 0; i < ps.length - 1; i++) { const k = ps[i]; if (x[k] == null || typeof x[k] !== 'object') x[k] = /^\d+$/.test(ps[i + 1]) ? [] : {}; x = x[k]; }
    x[ps[ps.length - 1]] = v;
  }
  const campanhaAtual = () => { const el = UI.$('[data-campanha]'); return el ? S.pegar('campanhas', el.dataset.campanha) : null; };
  const combateAtual = c => { const cbs = c.combates || []; return cbs.find(x => x.id === estado.combate) || cbs[cbs.length - 1]; };
  const nomeQuem = o => o.nome || '';

  // Fonte de uma rolagem na tela atual (herói, vilão ou participante)
  function fonteAtual() {
    const d = UI.$('[data-doc]');
    const r = rota();
    if (r.startsWith('heroi-')) { const h = S.pegar('herois', r.slice(6)); return h && { o: h, sis: SI.de(h), heroi: true }; }
    if (r.startsWith('vilao-')) { const v = F.pegarVilao(r.slice(6)); return v && { o: v, sis: SI.de(v) }; }
    return d ? null : null;
  }

  function mudarRecurso(alvo, recurso, delta) {
    const ps = alvo.split(':');
    if (ps[0] === 'heroi') {
      const h = S.pegar('herois', ps[1]); if (!h) return;
      const d = SI.de(h).derivados(h), max = recurso === 'pv' ? d.pvMax : d.manaMax;
      const at = recurso === 'pv' ? F.pvAtual(h, d) : F.manaAtual(h, d);
      h[recurso] = Math.max(recurso === 'pv' ? -max : 0, Math.min(max, at + delta));
      S.salvar('herois', h, 500);
    } else {
      const c = S.pegar('campanhas', ps[1]); if (!c) return;
      const cb = (c.combates || []).find(x => x.id === ps[2]); if (!cb) return;
      const p = cb.parts.find(x => x.uid === ps[3]); if (!p) return;
      if (p.tipo === 'heroi') return mudarRecurso('heroi:' + p.ref, recurso, delta);
      const max = recurso === 'pv' ? p.v.pvMax | 0 : p.v.manaMax | 0;
      const at = p[recurso] == null ? max : p[recurso];
      p[recurso] = Math.max(recurso === 'pv' ? -max : 0, Math.min(max, at + delta));
      S.salvar('campanhas', c, 500);
    }
    render();
  }

  // Rolagens da ficha vão para o histórico da campanha do herói (o mestre vê no escudo).
  function campanhaDaFicha(o) {
    if (!o || !o.id || !S.pegar('herois', o.id)) return null;
    const c = P.campanhasDoHeroi(o).filter(P.ehMembro)[0];
    return c ? c.id : null;
  }
  function rolarAttrDe(o, attr, campanhaId) {
    if (campanhaId === undefined) campanhaId = campanhaDaFicha(o);
    const aj = estado.ajuste | 0;
    const r = SI.de(o).teste(o, attr, { ajuste: aj });
    if (!r) return;
    UI.resultado(r, campanhaId);
    if (aj) { estado.ajuste = 0; render(); }
  }
  // Iniciativa rolada (Shinigamis & Hollows) ao entrar no combate.
  function iniDe(c, part, fonte) { const sis = SI.de(c); if (sis.iniciativa === 'rolada' && fonte) part.ini = sis.rolarIniciativa(fonte); return part; }

  function escolherHerois(titulo, hs, aoConfirmar, semNada) {
    if (!hs.length) { UI.janela(titulo, `<p>${esc(semNada || 'Nenhum herói disponível. Crie um herói ou veja se ele já está aqui.')}</p>`, [{ rotulo: 'Fechar', acao: f => f() }, { rotulo: 'Criar herói', classe: 'primario', acao: f => { f(); A['novo-heroi'](); } }]); return; }
    UI.janela(titulo, `<div class="lista-escolha">${hs.map(h => `<label class="escolha">${UI.foto(h.foto, h.nome)}<span><b>${esc(h.nome)}</b><small>${esc(SI.de(h).nomeClasse(h))} · ${esc(AU.nome(h.dono))}</small></span><input type="checkbox" value="${esc(h.id)}"></label>`).join('')}</div>`,
      [{ rotulo: 'Cancelar', acao: f => f() }, { rotulo: 'Adicionar', classe: 'primario', acao: (f, j) => { const ids = [...j.querySelectorAll('input:checked')].map(i => i.value); f(); if (ids.length) aoConfirmar(ids); } }]);
  }

  function novoCombate(c, nome) {
    const cb = { id: S.novoId(), nome: nome || 'Combate ' + ((c.combates || []).length + 1), rodada: 1, turno: 0, parts: (c.herois || []).map(id => iniDe(c, { uid: S.novoId(), tipo: 'heroi', ref: id }, S.pegar('herois', id))) };
    c.combates = (c.combates || []).concat(cb);
    estado.combate = cb.id; estado.abaMesa = 'combates'; estado.sel = null;
    S.salvar('campanhas', c, 200); render();
  }

  // ---------- Ações ----------
  const A = {
    'novo-heroi'() { const sis = SI.ativo || SI.de(null); const h = sis.novoPersonagem(); h.sistema = sis.id; h.dono = P.eu(); h.jogador = AU.usuario.nome; S.salvar('herois', h, 0); location.hash = '#heroi-' + h.id; },
    'duplicar-heroi'(el) { const x = docDe(el); const n = S.clone(x.o); delete n.id; n.nome += ' (cópia)'; n.criado = Date.now(); n.dono = P.eu(); n.mestres = []; S.salvar('herois', n, 0); location.hash = '#heroi-' + n.id; },
    'assumir-heroi'(el) { const h = S.pegar('herois', el.dataset.id); h.dono = P.eu(); S.salvar('herois', h, 0); render(); UI.aviso(h.nome + ' agora é seu.', 'info'); },
    condicao(el) { const x = docDe(el), v = el.dataset.v, cs = x.o.condicoes || []; x.o.condicoes = cs.includes(v) ? cs.filter(c => c !== v) : cs.concat(v); S.salvar('herois', x.o, 300); render(); },
    'login-google'() { AU.entrarGoogle().catch(e => UI.aviso(erroLogin(e))); },
    'login-local'(el) { AU.entrarLocal(el.dataset.nome); depoisDoLogin(); },
    sair() { AU.sair(); },
    'apagar-heroi'(el) {
      const x = docDe(el);
      UI.confirmar('Apagar herói', `Apagar a ficha de ${x.o.nome}? Isso não tem volta.`, 'Apagar', () => {
        S.apagar('herois', x.id);
        S.lista('campanhas').forEach(c => { if ((c.herois || []).includes(x.id)) { c.herois = c.herois.filter(i => i !== x.id); (c.combates || []).forEach(cb => (cb.parts = cb.parts.filter(p => p.ref !== x.id))); S.salvar('campanhas', c, 100); } });
        location.hash = '#herois';
      });
    },
    aba(el) { estado.aba = el.dataset.aba; render(); },
    base(el) {
      const x = docDe(el), h = x.o, a = el.dataset.attr, d = +el.dataset.d;
      h.base = h.base || {}; const atual = h.base[a] | 0, novo = Math.max(0, Math.min(R.NIVEL_MAX, atual + d));
      const der = R.derivados(h);
      if (d > 0 && h.modoCalc !== 'manual' && der.gastos + R.CUSTO_NIVEL > der.total) return UI.aviso('Sem pontos sobrando. Aumente o total ou tire de outro atributo.', 'info');
      h.base[a] = novo; S.salvar('herois', h); render();
    },
    ajuste(el) { estado.ajuste = Math.max(-5, Math.min(5, (estado.ajuste | 0) + +el.dataset.d)); render(); },
    'ajuste-fixo'(el) { estado.ajuste = +el.dataset.v; render(); },
    'rolar-attr'(el) { const f = fonteAtual(); if (f) rolarAttrDe(f.o, el.dataset.attr, f.heroi ? undefined : null); },
    'forma-bestial'(el) {
      const x = docDe(el), h = x.o;
      if (!h.formaBestial) {
        const d = R.derivados(h), m = F.manaAtual(h, d);
        if (m < 5) return UI.aviso('Mana insuficiente: a transformação custa 5.', 'info');
        h.mana = m - 5;
      }
      h.formaBestial = !h.formaBestial; S.salvar('herois', h); render();
    },
    'adicionar-item'(el) {
      const x = docDe(el), k = el.dataset.campo;
      x.o[k] = (x.o[k] || []).concat(k === 'inventario' ? { nome: '', qtd: 1 } : { nome: '', custo: 0, desc: '' });
      S.salvar(x.col, x.o); render();
    },
    'novo-ataque'(el) { const x = docDe(el); if (!x) return; x.o.ataques = (x.o.ataques || []).concat({ nome: 'Soco', maestria: 'cac', attr: 'FOR', bonus: 0 }); S.salvar(x.col, x.o); render(); },
    'remover-item'(el) {
      const x = docDe(el), i = +el.dataset.i, k = el.dataset.campo; x.o[k].splice(i, 1);
      // Perícia escolhida pela ocupação (Ordem Paranormal II) acompanha a lista.
      if (k === 'pericias' && x.o.ocupEscolha !== '' && x.o.ocupEscolha != null) { const e = +x.o.ocupEscolha; x.o.ocupEscolha = e === i ? '' : e > i ? String(e - 1) : x.o.ocupEscolha; }
      S.salvar(x.col, x.o); render();
    },
    'rolar-ataque'(el) {
      const f = fonteAtual(); if (!f) return;
      const r = f.sis.ataque(f.o, +el.dataset.i, { multi: estado.multi });
      if (r) UI.resultado(r, f.heroi ? campanhaDaFicha(f.o) : null);
    },
    'usar-poder'(el) {
      const x = docDe(el), h = x.o, p = h.poderes[+el.dataset.i], d = SI.de(h).derivados(h), m = F.manaAtual(h, d), custo = p.custo | 0;
      if (custo > m) return UI.aviso(`Mana insuficiente: ${p.nome || 'o poder'} custa ${custo} e restam ${m}.`, 'info');
      h.mana = m - custo; S.salvar('herois', h); render(); UI.aviso(`${p.nome || 'Poder'} usado: −${custo} Mana.`, 'info');
    },
    'rep-registrar'(el) {
      const x = docDe(el), h = x.o;
      const pts = +UI.$('#rep-tipo').value * R.REPUTACAO.graus[UI.$('#rep-grau').value];
      h.reputacao = (h.reputacao | 0) + pts;
      h.repHist = [{ pts, desc: UI.$('#rep-desc').value.trim(), em: Date.now() }].concat(h.repHist || []).slice(0, 50);
      S.salvar('herois', h); render();
    },
    recurso(el) { mudarRecurso(el.dataset.alvo, el.dataset.recurso, +el.dataset.d); },
    // Clicar no número da barra: digita o valor de uma vez (dano/cura, gasto/recuperação).
    'recurso-valor'(el) {
      if (el.closest('.leitura')) return;
      const pv = el.dataset.recurso === 'pv', alvo = el.dataset.alvo, rec = el.dataset.recurso;
      const nome = pv ? 'Vida' : ((SI.ativo || SI.de(null)).rotulos.recurso);
      const aplicar = (j, sinal) => { const v = Math.abs(parseInt(j.querySelector('#rv-valor').value, 10) || 0); if (v) mudarRecurso(alvo, rec, sinal * v); };
      const jan = UI.janela(nome, `<label class="campo"><span>Quanto?</span><input id="rv-valor" type="number" min="0" inputmode="numeric" placeholder="12"></label>
        <p class="dica">Enter aplica ${pv ? 'dano' : 'gasto'}.</p>`, [
        { rotulo: pv ? 'Cura' : 'Recuperar', acao: (f, j) => { aplicar(j, 1); f(); } },
        { rotulo: pv ? 'Dano' : 'Gastar', classe: 'primario', acao: (f, j) => { aplicar(j, -1); f(); } },
      ]);
      const inp = jan.querySelector('#rv-valor'); inp.focus();
      inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); aplicar(jan, -1); UI.fechar(); } });
    },
    'cond-part'(el) {
      const c = campanhaAtual(), cb = combateAtual(c), p = cb.parts.find(x => x.uid === el.dataset.uid), v = el.dataset.v;
      p.condicoes = (p.condicoes || []).includes(v) ? p.condicoes.filter(x => x !== v) : (p.condicoes || []).concat(v);
      S.salvar('campanhas', c, 300); render();
    },
    filtro(el) { estado.filtro = el.dataset.v; render(); },
    'novo-vilao'() { const v = SI.ativo.novoVilao(); v.sistema = SI.ativo.id; v.dono = P.eu(); S.salvar('viloes', v, 0); location.hash = '#vilao-' + v.id; },
    'duplicar-vilao'() {
      const v = F.pegarVilao(rota().slice(6)); const n = S.clone(v); delete n.id; delete n.base; n.dono = P.eu(); n.nome += v.base ? '' : ' (cópia)';
      S.salvar('viloes', n, 0); location.hash = '#vilao-' + n.id;
    },
    'apagar-vilao'(el) { const x = docDe(el); UI.confirmar('Apagar vilão', `Apagar ${x.o.nome}? Combates que já usam esse vilão mantêm a cópia deles.`, 'Apagar', () => { S.apagar('viloes', x.id); location.hash = '#viloes'; }); },

    // Campanhas
    'nova-campanha'() {
      UI.janela('Nova campanha', '<label class="campo"><span>Nome</span><input id="nc-nome" placeholder="Os Ratos da Linha Vermelha"></label>', [
        { rotulo: 'Cancelar', acao: f => f() },
        { rotulo: 'Criar', classe: 'primario', acao: (f, j) => { const nome = j.querySelector('#nc-nome').value.trim() || 'Nova campanha'; f(); const c = S.salvar('campanhas', { nome, sistema: SI.ativo.id, criada: Date.now(), mestre: P.eu(), membros: [], escudo: [], codigo: P.novoCodigo(), herois: [], combates: [], ganchos: [], rolagens: [] }, 0); estado.abaCamp = 'herois'; location.hash = '#campanha-' + c.id; } },
      ]);
    },
    'apagar-campanha'(el) { const c = S.pegar('campanhas', el.dataset.id); UI.confirmar('Apagar campanha', `Apagar ${c.nome}? Os heróis continuam salvos; combates, ganchos e rolagens somem.`, 'Apagar', () => { S.apagar('campanhas', c.id); render(); }); },
    'aba-mesa'(el) { estado.abaMesa = el.dataset.aba; render(); },
    'aba-camp'(el) { estado.abaCamp = el.dataset.aba; render(); },
    'entrar-codigo'() {
      UI.janela('Entrar numa campanha', '<label class="campo"><span>Código de convite</span><input id="cod" maxlength="6" placeholder="K7Q2MX" style="text-transform:uppercase;letter-spacing:.2em"></label><p class="dica">Peça o código ao mestre. Ele aparece em Convidar jogadores.</p>', [
        { rotulo: 'Cancelar', acao: f => f() },
        { rotulo: 'Entrar', classe: 'primario', acao: (f, j) => {
          const cod = j.querySelector('#cod').value.trim().toUpperCase();
          const c = S.lista('campanhas').find(x => (x.codigo || '').toUpperCase() === cod);
          if (!c) return UI.aviso('Nenhuma campanha com esse código. Confira com o mestre.');
          f(); entrarNa(c);
        } }]);
    },
    'entrar-campanha'(el) { entrarNa(S.pegar('campanhas', el.dataset.id)); },
    convidar() {
      const c = campanhaAtual();
      if (!c.codigo) { c.codigo = P.novoCodigo(); S.salvar('campanhas', c, 0); }
      const link = location.href.split('#')[0] + '#campanha-' + c.id;
      UI.janela('Convidar jogadores', `<p>Passe o código para os jogadores. Eles entram em Campanhas, Entrar com código.</p>
        <p class="codigo-grande">${esc(c.codigo)}</p>
        <label class="campo"><span>Ou mande o link direto</span><input id="conv-link" readonly value="${esc(link)}"></label>
        ${AU.modo === 'claude' ? '<p class="dica">Nesta página publicada, cada jogador também precisa ter acesso ao link (menu Compartilhar do claude.ai, com permissão de edição).</p>' : ''}`, [
        { rotulo: 'Novo código', acao: (f, j) => { c.codigo = P.novoCodigo(); S.salvar('campanhas', c, 0); j.querySelector('.codigo-grande').textContent = c.codigo; } },
        { rotulo: 'Copiar código', classe: 'primario', acao: () => navigator.clipboard.writeText(c.codigo).then(() => UI.aviso('Código copiado.', 'info')).catch(() => UI.aviso('Copie o código à mão: ' + c.codigo, 'info')) }]);
    },
    'add-meu-heroi'() {
      const c = campanhaAtual();
      const hs = S.lista('herois').filter(h => h.dono === P.eu() && !(c.herois || []).includes(h.id));
      escolherHerois('Adicionar seus heróis', hs, ids => { c.herois = (c.herois || []).concat(ids); S.salvar('campanhas', c, 0); P.sincronizarHerois(c); render(); });
    },
    'tirar-heroi-campanha'(el) {
      const c = campanhaAtual(), id = el.dataset.id;
      c.herois = c.herois.filter(i => i !== id);
      c.ultimoHeroi = id; // as regras conferem que quem tira é o dono (ou o mestre)
      if (P.temEscudo(c)) (c.combates || []).forEach(cb => (cb.parts = cb.parts.filter(p => p.ref !== id)));
      S.salvar('campanhas', c, 0); render();
    },
    'escudo-toggle'(el) {
      const c = campanhaAtual(), id = el.dataset.id, tem = (c.escudo || []).includes(id);
      c.escudo = tem ? c.escudo.filter(x => x !== id) : (c.escudo || []).concat(id);
      S.salvar('campanhas', c, 0); P.sincronizarHerois(c); render();
      UI.aviso(tem ? `Escudo retirado de ${AU.nome(id)}.` : `${AU.nome(id)} agora abre o Escudo do Mestre.`, 'info');
    },
    'tornar-mestre'(el) {
      const c = campanhaAtual(), id = el.dataset.id;
      UI.confirmar('Passar o cargo de mestre', `${AU.nome(id)} vira o mestre desta campanha e você passa a jogador. Só o novo mestre pode desfazer.`, 'Passar', () => {
        c.membros = (c.membros || []).filter(x => x !== id).concat(c.mestre); c.escudo = (c.escudo || []).filter(x => x !== id); c.mestre = id;
        S.salvar('campanhas', c, 0); P.sincronizarHerois(c); render();
      });
    },
    'remover-membro'(el) {
      const c = campanhaAtual(), id = el.dataset.id;
      UI.confirmar('Remover jogador', `Tirar ${AU.nome(id)} da campanha? Os heróis dessa pessoa saem junto.`, 'Remover', () => {
        c.membros = (c.membros || []).filter(x => x !== id); c.escudo = (c.escudo || []).filter(x => x !== id);
        const saem = (c.herois || []).filter(hid => (S.pegar('herois', hid) || {}).dono === id);
        c.herois = c.herois.filter(hid => !saem.includes(hid)); (c.combates || []).forEach(cb => (cb.parts = cb.parts.filter(p => !saem.includes(p.ref))));
        S.salvar('campanhas', c, 0); P.sincronizarHerois(c); render();
      });
    },
    'sair-campanha'() {
      const c = campanhaAtual();
      UI.confirmar('Sair da campanha', `Sair de ${c.nome}? Suas fichas continuam salvas na sua conta; o mestre tira da mesa quando quiser.`, 'Sair', () => {
        const eu = P.eu(); c.membros = (c.membros || []).filter(x => x !== eu); c.escudo = (c.escudo || []).filter(x => x !== eu);
        S.salvar('campanhas', c, 0); location.hash = '#campanhas';
      });
    },
    'mesa-rolar-attr'(el) { const c = campanhaAtual(), h = S.pegar('herois', el.dataset.heroi); rolarAttrDe(h, el.dataset.attr, c.id); },
    'novo-combate'() {
      const c = campanhaAtual();
      UI.janela('Novo combate', '<label class="campo"><span>Nome</span><input id="ncb-nome" placeholder="Emboscada no viaduto"></label><p class="dica">Os heróis da campanha entram automaticamente. Vilões você adiciona depois.</p>',
        [{ rotulo: 'Cancelar', acao: f => f() }, { rotulo: 'Criar', classe: 'primario', acao: (f, j) => { const n = j.querySelector('#ncb-nome').value.trim(); f(); novoCombate(c, n); } }]);
    },
    'encerrar-combate'() {
      const c = campanhaAtual(), cb = combateAtual(c);
      UI.confirmar('Encerrar combate', `Encerrar ${cb.nome}? Ele sai da lista; a vida e a mana dos heróis ficam como estão.`, 'Encerrar', () => { c.combates = c.combates.filter(x => x.id !== cb.id); estado.combate = null; S.salvar('campanhas', c, 0); render(); });
    },
    turno(el) {
      const c = campanhaAtual(), cb = combateAtual(c), n = M.ordenar(c, cb).length; if (!n) return;
      let t = (cb.turno | 0) + +el.dataset.d, r = cb.rodada | 0 || 1;
      if (t >= n) { t = 0; r++; } if (t < 0) { if (r > 1) { t = n - 1; r--; } else t = 0; }
      cb.turno = t; cb.rodada = r; estado.sel = null; estado.ultimo = null; estado.multi = 0; S.salvar('campanhas', c, 200); render();
    },
    'sel-part'(el) { estado.sel = el.dataset.uid; estado.ultimo = null; render(); },
    'mover-part'(el) {
      const c = campanhaAtual(), cb = combateAtual(c), ord = M.ordenar(c, cb), i = ord.findIndex(p => p.uid === el.dataset.uid), j = i + +el.dataset.d;
      if (j < 0 || j >= ord.length) return;
      const a = ord[i], b = ord[j];
      const rolada = SI.de(c).iniciativa === 'rolada';
      const empate = rolada ? (a.ini | 0) === (b.ini | 0) && a.agi === b.agi : a.agi === b.agi && a.ordemClasse === b.ordemClasse;
      if (!empate) return UI.aviso(rolada ? 'Só dá para trocar a ordem de quem empatou na iniciativa e na Destreza.' : 'Só dá para trocar a ordem de quem empatou na Agilidade e na classe.', 'info');
      ord.forEach((p, k) => { cb.parts.find(x => x.uid === p.uid).desempate = k; });
      cb.parts.find(x => x.uid === a.uid).desempate = j; cb.parts.find(x => x.uid === b.uid).desempate = i;
      S.salvar('campanhas', c, 200); render();
    },
    'tirar-part'(el) { const c = campanhaAtual(), cb = combateAtual(c); cb.parts = cb.parts.filter(p => p.uid !== el.dataset.uid); estado.sel = null; S.salvar('campanhas', c, 0); render(); },
    'combate-add-herois'() {
      const c = campanhaAtual(), cb = combateAtual(c);
      const ja = cb.parts.filter(p => p.tipo === 'heroi').map(p => p.ref);
      escolherHerois('Adicionar heróis ao combate', M.heroisDa(c).filter(h => !ja.includes(h.id)), ids => {
        ids.forEach(id => cb.parts.push(iniDe(c, { uid: S.novoId(), tipo: 'heroi', ref: id }, S.pegar('herois', id))));
        S.salvar('campanhas', c, 0); render();
      }, 'Os jogadores precisam adicionar os heróis deles na página da campanha primeiro.');
    },
    'combate-add-viloes'() { estado.busca = ''; estado.filtro = 'todos'; abrirEscolhaViloes(); },
    'ver-vilao'(el) { UI.fechar(); location.hash = '#vilao-' + el.dataset.id; },
    'add-vilao-combate'(el) {
      const c = campanhaAtual(), cb = combateAtual(c), v = S.clone(F.pegarVilao(el.dataset.id));
      const iguais = cb.parts.filter(p => p.tipo === 'vilao' && p.v.id === v.id).length;
      cb.parts.push(iniDe(c, { uid: S.novoId(), tipo: 'vilao', v, nome: v.nome + (iguais ? ' ' + (iguais + 1) : ''), pv: v.pvMax | 0, mana: v.manaMax | 0 }, v));
      S.salvar('campanhas', c, 200); render(); UI.aviso(v.nome + ' entrou no combate.', 'info');
    },
    'part-rolar-attr'(el) {
      const c = campanhaAtual(), cb = combateAtual(c), p = M.participante(c, cb.parts.find(x => x.uid === el.dataset.uid));
      const r = p.sis.teste(p.fonte, el.dataset.attr, {}); if (!r) return;
      r.quem = p.nome; UI.resultado(r, c.id);
    },
    'part-atacar'(el) {
      const c = campanhaAtual(), cb = combateAtual(c), ord = M.ordenar(c, cb);
      const p = ord.find(x => x.uid === el.dataset.uid);
      const sel = UI.$('#pp-alvo'), alvo = sel ? ord.find(x => x.uid === sel.value) : null;
      const r = p.sis.ataque(p.fonte, +el.dataset.i, { alvoDef: alvo ? alvo.def : null, multi: estado.multi }); if (!r) return;
      r.quem = p.nome;
      if (alvo) r.titulo += ' → ' + alvo.nome;
      UI.resultado(r, c.id);
      const dano = alvo ? Math.max(0, r.dano.total - (alvo.dureza | 0)) : 0;
      const rotDef = p.sis.id === 'op2' ? 'DT' : 'Defesa';
      estado.ultimo = alvo ? { de: p.uid, alvo: alvo.uid, alvoNome: alvo.nome, dureza: alvo.dureza | 0, dano: r.acertou ? dano : 0,
        texto: r.desastre ? `Desastre contra ${alvo.nome}: erra e quem estiver ao alcance pode atacar como reação.` : r.acertou ? `${r.critico ? 'Crítico em' : 'Acertou'} ${alvo.nome} (${r.total} contra ${rotDef} ${alvo.def}).` : `Errou ${alvo.nome} (${r.total} contra ${rotDef} ${alvo.def}).` } : null;
      render();
    },
    'aplicar-dano'() {
      const c = campanhaAtual(), cb = combateAtual(c), u = estado.ultimo; if (!u) return;
      estado.ultimo = null;
      mudarRecurso(`part:${esc(c.id)}:${esc(cb.id)}:${u.alvo}`, 'pv', -u.dano);
    },
    'part-poder'(el) {
      const c = campanhaAtual(), cb = combateAtual(c), p = M.participante(c, cb.parts.find(x => x.uid === el.dataset.uid));
      const pod = p.cb.poderes[+el.dataset.i], custo = pod.custo | 0, rec = p.sis.rotulos.recurso;
      if (custo > p.mana) return UI.aviso(`${rec} insuficiente: ${pod.nome} custa ${custo} e restam ${p.mana}.`, 'info');
      mudarRecurso(`part:${esc(c.id)}:${esc(cb.id)}:${esc(p.uid)}`, 'mana', -custo);
      UI.aviso(`${p.nome} usou ${pod.nome}: −${custo} ${rec}.`, 'info');
    },
    'novo-gancho'(el) {
      const c = campanhaAtual(), tipo = el.dataset.tipo;
      const g = { tipo, titulo: '', notas: '', em: Date.now() };
      if (tipo === 'conflito') g.sub = 'Físico';
      if (tipo === 'invasao') Object.assign(g, { armadilhas: 2, acoes: 3, usadas: 0, sucessos: 0, tocaia: 0, vInv: 0, vDef: 0, dt: 8, percepcao: 8 });
      c.ganchos = (c.ganchos || []).concat(g); S.salvar('campanhas', c, 0); render();
    },
    'apagar-gancho'(el) { const c = campanhaAtual(); UI.confirmar('Apagar gancho', 'Apagar esta cena?', 'Apagar', () => { c.ganchos.splice(+el.dataset.i, 1); S.salvar('campanhas', c, 0); render(); }); },
    'gancho-combate'(el) { const c = campanhaAtual(), g = c.ganchos[+el.dataset.i]; novoCombate(c, g.titulo || (g.tipo === 'invasao' ? 'Invasão' : 'Conflito ' + (g.sub || ''))); },
    'gancho-rep'(el) {
      const c = campanhaAtual(), i = +el.dataset.i, g = c.ganchos[i];
      const h = S.pegar('herois', UI.$('#g-h-' + i).value); if (!h) return;
      const pts = +UI.$('#g-a-' + i).value * R.REPUTACAO.graus[UI.$('#g-g-' + i).value];
      h.reputacao = (h.reputacao | 0) + pts;
      h.repHist = [{ pts, desc: g.titulo || 'Gancho de reputação', em: Date.now() }].concat(h.repHist || []).slice(0, 50);
      g.log = [{ pts, nome: h.nome }].concat(g.log || []).slice(0, 20);
      S.salvar('herois', h, 0); S.salvar('campanhas', c, 0); render();
      UI.aviso(`${h.nome}: ${pts > 0 ? '+' : ''}${pts} de reputação (agora ${R.REPUTACAO.estado(h.reputacao).nome}).`, 'info');
    },
    'gancho-cont'(el) { const c = campanhaAtual(), g = c.ganchos[+el.dataset.i], k = el.dataset.k; g[k] = Math.max(0, (g[k] | 0) + +el.dataset.d); S.salvar('campanhas', c, 300); render(); },
    'gancho-teste'(el) {
      const c = campanhaAtual(), i = +el.dataset.i, g = c.ganchos[i], attr = el.dataset.attr, k = el.dataset.k;
      const h = S.pegar('herois', UI.$('#g-q-' + i).value); if (!h) return;
      if (k === 'sucessos' && (g.usadas | 0) >= (g.acoes | 0)) return UI.aviso('Acabaram as ações do plano. O Mestre pode liberar mais.', 'info');
      const sis = SI.de(h), r = sis.teste(h, sis.ganchoAttr[attr], {}); r.titulo = (attr === 'INT' ? 'Plano de invasão' : 'Tocaia') + ' · ' + r.titulo;
      const dt = attr === 'INT' ? (g.dt == null ? 8 : g.dt) : (g.percepcao == null ? 8 : g.percepcao);
      r.alvoDef = dt; r.acertou = r.total >= dt; r.nota = 'contra ' + dt;
      if (k === 'sucessos') g.usadas = (g.usadas | 0) + 1;
      if (r.acertou) g[k] = (g[k] | 0) + 1;
      UI.resultado(r, c.id); S.salvar('campanhas', c, 0); render();
    },
    'escolher-livro'(el) { SI.escolher(el.dataset.id); estado.busca = ''; estado.filtro = 'todos'; desenharTopo(); location.hash = '#herois'; },
    'rolar-iniciativa'() {
      const c = campanhaAtual(), cb = combateAtual(c), sis = SI.de(c);
      cb.parts.forEach(p => { const f = p.tipo === 'heroi' ? S.pegar('herois', p.ref) : p.v; if (f) p.ini = sis.rolarIniciativa(f); p.desempate = 0; });
      cb.turno = 0; S.salvar('campanhas', c, 0); render(); UI.aviso('Iniciativa rolada de novo para todos.', 'info');
    },
    'op-nova-pericia'(el) {
      const x = docDe(el); if (!x || el.closest('.leitura')) return;
      x.o.pericias = (x.o.pericias || []).concat({ nome: 'Nova perícia', cat: UI.$('#op-nova-cat').value, passo: 0 });
      S.salvar(x.col, x.o); render();
    },
    'modo-calc'(el) {
      const x = docDe(el); if (!x || el.closest('.leitura')) return;
      if (el.dataset.v === 'manual' && !x.o.manual) { const d = SI.de(x.o).derivados(x.o); x.o.manual = { pvMax: d.pvMax, manaMax: d.manaMax, defesa: d.defesa }; }
      x.o.modoCalc = el.dataset.v; S.salvar(x.col, x.o, 0); render();
      UI.aviso(el.dataset.v === 'manual' ? 'Modo manual: digite os números na aba Progressão.' : 'Modo automático: os números seguem o livro.', 'info');
    },
    'sh-multi'(el) { estado.multi = +el.dataset.v; render(); },
    'sh-passo'(el) {
      const x = docDe(el); if (!x || el.closest('.leitura')) return;
      const campo = el.dataset.f, ps = campo.split('.'); let o = x.o; for (let i = 0; i < ps.length - 1; i++) o = o[ps[i]] = o[ps[i]] || {};
      const k = ps[ps.length - 1];
      const lim = el.dataset.max != null ? [+(el.dataset.min || 0), +el.dataset.max] : campo.startsWith('afinidades') ? [0, 10] : campo.startsWith('atributos') ? [-5, 10] : [0, 99];
      o[k] = Math.max(lim[0], Math.min(lim[1], (o[k] | 0) + +el.dataset.d));
      S.salvar(x.col, x.o); render();
    },
    'sh-quebra'(el) { const x = docDe(el); if (!x) return; const v = +el.dataset.v; x.o.quebras = (x.o.quebras | 0) === v ? v - 1 : v; S.salvar(x.col, x.o, 300); render(); if (x.o.quebras >= 3) UI.aviso('Três Quebras: o destino foi destruído. Converse com o mestre.', 'info'); },
    'sh-adicionar'(el) {
      const x = docDe(el); if (!x) return; const k = el.dataset.campo;
      const doSis = SI.de(x.o).novoItem && SI.de(x.o).novoItem(x.col, k);
      const novo = doSis || { ataques: SI.de(x.o).id === 'sh' && x.col === 'viloes' ? { nome: 'Ataque', acerto: 3, dano: '1d6+3', tipoDano: 'Cortante', margem: 20 } : { nome: 'Novo ataque', tipo: 'corpo', attr: 'FOR', dano: '1d6', bonus: 0, margem: 20 },
        kidos: { nome: '', custo: 1, desc: '' }, habilidades: { nome: '', desc: '' }, inventario: { nome: '', qtd: 1 }, poderes: { nome: '', custo: 0, desc: '' } }[k] || {};
      x.o[k] = (x.o[k] || []).concat(novo); S.salvar(x.col, x.o); render();
    },
    'sh-usar-kido'(el) {
      const x = docDe(el), h = x.o, k = (h.kidos || [])[+el.dataset.i]; if (!k) return;
      const d = SI.de(h).derivados(h), m = F.manaAtual(h, d), custo = k.custo | 0;
      if (custo > m) return UI.aviso(`Reiryoku insuficiente: ${k.nome || 'o kido'} custa ${custo} e restam ${m}.`, 'info');
      h.mana = m - custo; S.salvar('herois', h); render(); UI.aviso(`${k.nome || 'Kido'}: −${custo} Reiryoku.`, 'info');
    },
    'sh-guia'(el) {
      const x = docDe(el); if (!x) return;
      SI.de(x.o).aplicarGuia(x.o, +UI.$('#sv-gnivel').value, +UI.$('#sv-gperfil').value);
      S.salvar(x.col, x.o, 0); render(); UI.aviso('Números preenchidos pelo Guia de Inimigos. Ajuste o que quiser.', 'info');
    },
    'rolar-rapido'(el) { const c = campanhaAtual(); UI.resultado(D.livre('Mestre', el.dataset.expr), c && c.id); },
  };

  function abrirEscolhaViloes() {
    const sis = SI.de(campanhaAtual());
    const j = UI.janela('Adicionar ' + sis.rotulos.ameacas.toLowerCase() + ' ao combate', `<div id="escolha-viloes">${sis.listaViloes(estado, true)}</div>`, [{ rotulo: 'Pronto', classe: 'primario', acao: f => f() }]);
    j.classList.add('larga');
  }

  const SUBMITS = {
    'rolar-livre'(form) {
      const expr = form.expr.value, f = fonteAtual(), c = campanhaAtual();
      const r = D.livre(f ? nomeQuem(f.o) : AU.usuario.nome, expr);
      if (!r) return UI.aviso('Não entendi a expressão. Use algo como 2d6+3 ou 1d10+1d8.');
      UI.resultado(r, c ? c.id : f && campanhaDaFicha(f.o));
    },
    'login-email'(form, ev) {
      const criar = ev.submitter && ev.submitter.value === 'criar';
      AU.entrarEmail(form.email.value.trim(), form.senha.value, criar, form.nome.value.trim()).catch(e => UI.aviso(erroLogin(e)));
    },
    'login-local'(form) { const n = form.nome.value.trim(); if (n) { AU.entrarLocal(n); depoisDoLogin(); } },
  };
  const CHANGES = {
    'escolher-combate'(el) { estado.combate = el.value; estado.sel = null; estado.ultimo = null; render(); },
    'escolher-alvo'(el) { estado.alvo = el.value; },
    'rolagem-secreta'(el) { HB.rolagemSecreta = el.checked; UI.aviso(el.checked ? 'Rolagens em segredo: só quem tem o escudo vê.' : 'Rolagens visíveis para a mesa.', 'info'); },
  };

  // ---------- Eventos ----------
  function ligar() {
    document.addEventListener('click', e => {
      // Atualização de outra pessoa que esperava a janela fechar.
      if (pendente && !UI.$('#janela')) setTimeout(() => { const a = document.activeElement; if (pendente && !UI.$('#janela') && !(a && a.matches('input,textarea,select'))) { pendente = false; render(); } }, 0);
      const menu = UI.$('.menu-conta[open]');
      if (menu && (!menu.contains(e.target) || e.target.closest('.menu-conta-caixa button'))) menu.open = false;
      const el = e.target.closest('[data-act]');
      if (!el || el.disabled) return;
      const f = A[el.dataset.act];
      if (f) { e.preventDefault(); f(el, e); if (UI.$('#escolha-viloes') && /filtro|add-vilao/.test(el.dataset.act)) UI.$('#escolha-viloes').innerHTML = SI.de(campanhaAtual()).listaViloes(estado, true); }
    });
    document.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('g[data-act]')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
      if (e.key === 'Escape') UI.fechar();
    });
    document.addEventListener('submit', e => {
      const f = e.target.dataset.actSubmit; if (!f) return;
      e.preventDefault(); SUBMITS[f](e.target, e);
    });
    document.addEventListener('input', e => {
      const el = e.target;
      if (el.matches('[data-busca]')) {
        estado.busca = el.value;
        const box = UI.$('#escolha-viloes');
        if (box && box.contains(el)) { box.innerHTML = SI.de(campanhaAtual()).listaViloes(estado, true); const n = box.querySelector('[data-busca]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
        else render();
        return;
      }
      if (el.matches('[data-f]') && el.type !== 'number' && el.tagName !== 'SELECT' && el.type !== 'checkbox') gravarCampo(el, false);
      if (el.matches('[data-f-part]')) {
        const c = campanhaAtual(), cb = combateAtual(c), p = cb.parts.find(x => x.uid === el.dataset.fPart);
        if (p) { p.nome = el.value; S.salvar('campanhas', c, 800); }
      }
    });
    document.addEventListener('change', e => {
      const el = e.target;
      if (el.matches('[data-act-change]')) return CHANGES[el.dataset.actChange](el);
      if (el.matches('[data-f]') && (el.type === 'number' || el.tagName === 'SELECT' || el.type === 'checkbox')) gravarCampo(el, true);
      if (el.matches('[data-foto], [data-capa]') && el.files[0]) {
        const x = docDe(el), ehCapa = el.matches('[data-capa]'), arq = el.files[0]; el.value = '';
        UI.recortarFoto(arq, ehCapa ? { w: 960, h: 320 } : { w: 360, h: 360 }).then(url => { if (!url) return; x.o[ehCapa ? 'capa' : 'foto'] = url; S.salvar(x.col, x.o, 0); render(); })
          .catch(() => UI.aviso('Não consegui abrir essa imagem. Tente um JPG ou PNG.'));
      }
      if (el.matches('[data-f-part]')) render();
    });
    document.addEventListener('focusout', () => { if (pendente) setTimeout(() => { if (!document.activeElement || !document.activeElement.matches('input,textarea,select')) { pendente = false; render(); } }, 0); });
    window.addEventListener('hashchange', () => { UI.fechar(); const m = UI.$('.menu-conta[open]'); if (m) m.open = false; render(); });
  }

  function gravarCampo(el, rerender) {
    const x = docDe(el); if (!x || el.closest('.leitura')) return;
    let v = el.type === 'checkbox' ? el.checked : el.value;
    if (el.type === 'number' || el.hasAttribute('data-num')) v = v === '' ? 0 : +v;
    setCaminho(x.o, el.dataset.f, v);
    // Mudou a classe ou a origem: limpa escolhas que não valem mais.
    if (el.dataset.f === 'classe') { x.o.escolhas.classe = {}; x.o.escolhas.maestria = ''; }
    if (el.dataset.f === 'origem') { x.o.escolhas.origem = {}; x.o.elementos = []; x.o.formaBestial = false; }
    S.salvar(x.col, x.o, rerender ? 300 : 800);
    const sis = SI.de(x.o); if (sis.aoMudarCampo) { sis.aoMudarCampo(x.o, el.dataset.f); S.salvar(x.col, x.o, rerender ? 300 : 800); }
    if (rerender) render();
  }

  // Mudança vinda de outra pessoa: redesenha, mas não no meio de uma digitação.
  let pendente = false;
  function aoMudarRemoto() {
    const a = document.activeElement;
    if (a && a.matches('input,textarea,select') && raiz().contains(a)) { pendente = true; return; }
    if (UI.$('#janela')) { pendente = true; return; }
    render();
  }

  function backup() {
    const nomeArq = 'backup-herois-de-bueiro-' + new Date().toISOString().slice(0, 10) + '.json';
    const n = S.lista('herois').length, nc = S.lista('campanhas').length, nv = S.lista('viloes').length;
    const podeBaixar = AU.modo !== 'claude'; // a página do claude.ai bloqueia downloads
    UI.janela('Backup', `<p>O backup leva <b>${n} heróis</b>, <b>${nc} campanhas</b> e <b>${nv} vilões</b> de todas as contas. Guarde o arquivo no seu computador antes de atualizar o site.</p>
      ${podeBaixar ? '' : `<label class="campo"><span>Seus dados</span><textarea id="bk-saida" rows="5" readonly>${esc(S.exportar())}</textarea></label>`}
      <label class="campo"><span>Restaurar de um arquivo de backup</span><input id="bk-arquivo" type="file" accept=".json,.txt,application/json,text/plain"></label>
      <label class="campo"><span>Ou cole o texto do backup</span><textarea id="bk-entrada" rows="3" placeholder='{"sistema":"herois-de-bueiro", …}'></textarea></label>
      <p class="dica">Restaurar grava por cima das fichas com o mesmo código e recria as que sumiram. Só a conta administradora restaura fichas de outros jogadores.</p>`, [
      podeBaixar
        ? { rotulo: 'Baixar backup', classe: 'primario', acao: () => {
            const url = URL.createObjectURL(new Blob([S.exportar()], { type: 'application/json' }));
            const a = document.createElement('a'); a.href = url; a.download = nomeArq; document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 2000); UI.aviso('Backup baixado: ' + nomeArq, 'info');
          } }
        : { rotulo: 'Copiar', classe: 'primario', acao: (f, j) => { const t = j.querySelector('#bk-saida'); navigator.clipboard.writeText(t.value).then(() => UI.aviso('Backup copiado.', 'info')).catch(() => { t.focus(); t.select(); UI.aviso('Texto selecionado: use Ctrl+C para copiar.', 'info'); }); } },
      { rotulo: 'Restaurar', acao: async (f, j) => {
          const arq = j.querySelector('#bk-arquivo').files[0];
          const txt = arq ? await arq.text() : j.querySelector('#bk-entrada').value;
          if (!txt.trim()) return UI.aviso('Escolha um arquivo de backup ou cole o texto.');
          UI.confirmar('Restaurar backup', 'As fichas do backup vão substituir as atuais com o mesmo código. Continuar?', 'Restaurar', () => {
            try { const q = S.importar(txt); render(); UI.aviso(`${q} registros restaurados.`, 'info'); } catch (e) { UI.aviso(e.message || 'Backup inválido.'); }
          });
        } },
    ]);
  }

  function entrarNa(c) {
    if (!c) return;
    if (!P.ehMembro(c)) { c.membros = (c.membros || []).concat(P.eu()); S.salvar('campanhas', c, 0); UI.aviso('Você entrou em ' + c.nome + '. Adicione seu herói.', 'info'); }
    estado.abaCamp = 'herois'; location.hash = '#campanha-' + c.id; render();
  }
  function erroLogin(e) {
    const c = (e && e.code) || '';
    if (/popup-closed|cancelled-popup/.test(c)) return 'Login cancelado.';
    if (/popup-blocked|operation-not-supported/.test(c)) return 'O navegador bloqueou a janela do Google. Abra o site direto no Chrome (não pelo link do WhatsApp) ou permita pop-ups para este site.';
    if (/disallowed-useragent|web-storage-unsupported/.test(c)) return 'Este navegador não permite o login do Google. Abra o site no Chrome ou no Safari.';
    if (/wrong-password|invalid-credential|user-not-found/.test(c)) return 'E-mail ou senha não conferem.';
    if (/email-already-in-use/.test(c)) return 'Esse e-mail já tem conta. Use Entrar.';
    if (/weak-password|password-does-not-meet/.test(c)) return 'Senha fraca: use pelo menos 8 caracteres, com letras e números.';
    if (/too-many-requests/.test(c)) return 'Muitas tentativas. Espere alguns minutos e tente de novo.';
    if (/unauthorized-domain/.test(c)) return 'Este endereço não está liberado no Firebase (Authentication > Settings > Authorized domains).';
    return 'Não deu para entrar (' + (c || 'erro') + ').';
  }

  // Nome do livro e rótulos do menu mudam com o sistema.
  function desenharTopo() {
    const sis = SI.ativo, chip = UI.$('#livro-atual');
    document.body.dataset.sistema = sis ? sis.id : '';
    if (chip) { chip.hidden = !sis; chip.textContent = sis ? sis.nome : ''; }
    UI.$('.nav').hidden = !sis;
    if (sis) { UI.$('[data-sec=herois]').textContent = sis.rotulos.personagens; UI.$('[data-sec=viloes]').textContent = sis.rotulos.ameacas; }
  }

  // Menu da conta no topo.
  function desenharConta() {
    const box = UI.$('#conta'), u = AU.usuario;
    if (!u) { box.innerHTML = ''; return; }
    const onde = S.modo === 'nuvem' ? (AU.modo === 'firebase' ? 'Salvo na sua conta' : 'Salvo na conta claude.ai') : 'Salvo neste navegador';
    box.innerHTML = `<details class="menu-conta"><summary>${UI.foto(u.foto, u.nome, 'avatar')}<span class="conta-nome">${esc(u.nome)}</span></summary>
      <div class="menu-conta-caixa"><p><b>${esc(u.nome)}</b><small>${esc(onde)}</small></p>
        <button class="btn pequeno largo" id="btn-backup">Backup</button>
        ${AU.modo === 'claude' ? '' : '<button class="btn pequeno largo perigo-txt" data-act="sair">Sair</button>'}</div></details>`;
    UI.$('#btn-backup').addEventListener('click', backup);
  }
  // Nomes das outras pessoas (claude.ai resolve sob demanda).
  function carregarNomes() {
    const ids = new Set();
    S.lista('campanhas').filter(P.ehMembro).forEach(c => [c.mestre].concat(c.membros || []).forEach(i => ids.add(i)));
    S.lista('herois').forEach(h => h.dono && ids.add(h.dono));
    S.lista('viloes').forEach(v => v.dono && ids.add(v.dono));
    const antes = JSON.stringify([...ids].map(AU.nome));
    AU.perfis([...ids]).then(() => { if (JSON.stringify([...ids].map(AU.nome)) !== antes) aoMudarRemoto(); });
  }
  function depoisDoLogin() { AU.publicarPerfil(); desenharConta(); carregarNomes(); render(); }

  async function iniciar() {
    ligar();
    if (SI.idAtivo) SI.escolher(SI.idAtivo);
    desenharTopo();
    raiz().innerHTML = '<p class="carregando">Abrindo o bueiro…</p>';
    await AU.iniciar();
    // Sem login no Firebase o banco recusa leituras: mostra a entrada primeiro (o login recarrega a página).
    if (!AU.usuario && AU.modo !== 'local' && AU.modo !== 'claude') { render(); return; }
    await S.iniciar(c => { if (c !== 'perfis') carregarNomes(); aoMudarRemoto(); });
    if (AU.usuario) depoisDoLogin(); else render();
  }
  iniciar();
})(window.HB);
