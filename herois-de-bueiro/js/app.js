// Roteador (#hash), ações dos botões e ligação dos campos com os dados.
(function (HB) {
  const R = HB.R, UI = HB.UI, S = HB.S, F = HB.F, M = HB.M, D = HB.D, esc = UI.esc;
  const raiz = () => UI.$('#app');
  const estado = { rota: '', busca: '', filtro: 'todos', aba: 'combate', abaMesa: 'herois', ajuste: 0 };

  // ---------- Rotas ----------
  function rota() { return (location.hash || '#inicio').slice(1); }
  function render() {
    const r = rota();
    if (r !== estado.rota) { const mesmaFamilia = r.split('-')[0] === estado.rota.split('-')[0]; estado.rota = r; if (!mesmaFamilia) { estado.busca = ''; estado.filtro = 'todos'; } estado.aba = 'combate'; estado.ajuste = 0; estado.ultimo = null; window.scrollTo(0, 0); }
    const [nome, ...resto] = r.split('-'), id = resto.join('-');
    let html;
    if (nome === 'herois') html = F.listaHerois(estado);
    else if (nome === 'heroi') { const h = S.pegar('herois', id); html = h ? F.ficha(h, estado) : naoAchou('Esse herói não existe mais.', '#herois'); }
    else if (nome === 'campanhas') html = M.paginaCampanhas();
    else if (nome === 'mesa') { const c = S.pegar('campanhas', id); html = c ? M.mesa(c, estado) : naoAchou('Essa campanha não existe mais.', '#campanhas'); }
    else if (nome === 'viloes') html = F.paginaViloes(estado);
    else if (nome === 'vilao') { const v = F.pegarVilao(id); html = v ? F.fichaVilao(v, estado) : naoAchou('Esse vilão não existe mais.', '#viloes'); }
    else if (nome === 'regras') html = paginaRegras();
    else html = paginaInicio();
    const foco = document.activeElement && document.activeElement.id;
    raiz().innerHTML = html;
    if (foco) { const el = document.getElementById(foco); if (el && el.matches('input,textarea')) { el.focus(); if (el.setSelectionRange && el.type !== 'number') { const n = el.value.length; el.setSelectionRange(n, n); } } }
    document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('ativo', a.dataset.sec === secao(nome)));
  }
  const secao = n => ({ heroi: 'herois', herois: 'herois', campanhas: 'campanhas', mesa: 'campanhas', viloes: 'viloes', vilao: 'viloes', regras: 'regras' })[n] || '';
  const naoAchou = (t, volta) => `<section class="pagina"><div class="vazio-grande"><p>${esc(t)}</p><a class="btn" href="${volta}">Voltar</a></div></section>`;

  function paginaInicio() {
    const nh = S.lista('herois').length, nc = S.lista('campanhas').length;
    return `<section class="inicio">
      <div class="capa-hq">
        <div class="capa-texto"><p class="capa-selo">Playtest · sistema completo</p>
          <h1 class="titulo-capa">Heróis<br><span>de Bueiro</span></h1>
          <p class="capa-sub">Fichas, campanhas e combate para a sua mesa. Classe, origem e atributos entram; vida, mana, defesa e iniciativa saem calculadas.</p>
          <div class="capa-botoes"><a class="btn primario grande" href="#herois">${nh ? 'Ver meus heróis' : 'Criar um herói'}</a><a class="btn grande" href="#campanhas">${nc ? 'Abrir campanhas' : 'Montar uma campanha'}</a></div></div>
        <div class="capa-arte" aria-hidden="true"><div class="balao">POW!</div><div class="tampa"><span></span><span></span><span></span><span></span></div></div>
      </div>
      <div class="inicio-cartoes">
        <a class="cartao-atalho" href="#herois"><b>Heróis</b><span>${nh} ficha${nh === 1 ? '' : 's'}. Hexágono de atributos, maestrias, poderes, inventário e reputação.</span></a>
        <a class="cartao-atalho" href="#campanhas"><b>Mesa do Mestre</b><span>${nc} campanha${nc === 1 ? '' : 's'}. Iniciativa automática, alvo e dano em um clique, ganchos de cena.</span></a>
        <a class="cartao-atalho" href="#viloes"><b>Vilões</b><span>Bestiário base com ${F.BESTIARIO.length} ameaças e espaço para os vilões da sua mesa.</span></a>
        <a class="cartao-atalho" href="#regras"><b>Regras</b><span>Tabelas de dados, classes, origens, elementos e reputação para consulta.</span></a>
      </div></section>`;
  }

  function paginaRegras() {
    const t = (cab, linhas) => `<div class="tabela-rolagem"><table class="tabela-regra"><thead><tr>${cab.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${linhas.map(l => `<tr>${l.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    return `<section class="pagina regras">
      <h1 class="titulo-hq">Regras</h1>
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
    if (r.startsWith('heroi-')) { const h = S.pegar('herois', r.slice(6)); return h && { o: h, d: R.derivados(h), heroi: true }; }
    if (r.startsWith('vilao-')) { const v = F.pegarVilao(r.slice(6)); return v && { o: v, d: F.derivVilao(v) }; }
    return d ? null : null;
  }

  function mudarRecurso(alvo, recurso, delta) {
    const ps = alvo.split(':');
    if (ps[0] === 'heroi') {
      const h = S.pegar('herois', ps[1]); if (!h) return;
      const d = R.derivados(h), max = recurso === 'pv' ? d.pvMax : d.manaMax;
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

  function rolarAttrDe(o, d, attr, campanhaId) {
    const aj = estado.ajuste | 0;
    const r = D.teste(nomeQuem(o), attr, d.niv[attr] | 0, aj);
    if (attr === 'CAR' && R.ORIGENS[o.origem] && R.ORIGENS[o.origem].semCarisma) r.nota = (r.nota ? r.nota + ' · ' : '') + 'Android: não vale para Mentir, Persuadir ou Intimidar';
    UI.resultado(r, campanhaId);
    if (aj) { estado.ajuste = 0; render(); }
  }

  function escolherHerois(titulo, jaTem, aoConfirmar) {
    const hs = S.lista('herois').filter(h => !jaTem.includes(h.id));
    if (!hs.length) { UI.janela(titulo, `<p>${S.lista('herois').length ? 'Todos os heróis já estão aqui.' : 'Você ainda não tem heróis.'}</p>`, [{ rotulo: 'Criar herói', classe: 'primario', acao: f => { f(); location.hash = '#herois'; } }, { rotulo: 'Fechar', acao: f => f() }]); return; }
    UI.janela(titulo, `<div class="lista-escolha">${hs.map(h => `<label class="escolha">${UI.foto(h.foto, h.nome)}<span><b>${esc(h.nome)}</b><small>${esc(F.nomeClasse(h))}</small></span><input type="checkbox" value="${h.id}"></label>`).join('')}</div>`,
      [{ rotulo: 'Cancelar', acao: f => f() }, { rotulo: 'Adicionar', classe: 'primario', acao: (f, j) => { const ids = [...j.querySelectorAll('input:checked')].map(i => i.value); f(); if (ids.length) aoConfirmar(ids); } }]);
  }

  function novoCombate(c, nome) {
    const cb = { id: S.novoId(), nome: nome || 'Combate ' + ((c.combates || []).length + 1), rodada: 1, turno: 0, parts: (c.herois || []).map(id => ({ uid: S.novoId(), tipo: 'heroi', ref: id })) };
    c.combates = (c.combates || []).concat(cb);
    estado.combate = cb.id; estado.abaMesa = 'combates'; estado.sel = null;
    S.salvar('campanhas', c, 200); render();
  }

  // ---------- Ações ----------
  const A = {
    'novo-heroi'() { const h = S.salvar('herois', F.novoHeroi(), 0); location.hash = '#heroi-' + h.id; },
    'duplicar-heroi'(el) { const x = docDe(el); const n = S.clone(x.o); delete n.id; n.nome += ' (cópia)'; n.criado = Date.now(); S.salvar('herois', n, 0); location.hash = '#heroi-' + n.id; },
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
      if (d > 0 && der.gastos + R.CUSTO_NIVEL > der.total) return UI.aviso('Sem pontos sobrando. Aumente o total ou tire de outro atributo.', 'info');
      h.base[a] = novo; S.salvar('herois', h); render();
    },
    ajuste(el) { estado.ajuste = Math.max(-5, Math.min(5, (estado.ajuste | 0) + +el.dataset.d)); render(); },
    'ajuste-fixo'(el) { estado.ajuste = +el.dataset.v; render(); },
    'rolar-attr'(el) { const f = fonteAtual(); if (f) rolarAttrDe(f.o, f.d, el.dataset.attr); },
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
    'remover-item'(el) { const x = docDe(el); x.o[el.dataset.campo].splice(+el.dataset.i, 1); S.salvar(x.col, x.o); render(); },
    'rolar-ataque'(el) {
      const f = fonteAtual(); if (!f) return;
      const a = f.o.ataques[+el.dataset.i];
      UI.resultado(D.ataque(nomeQuem(f.o), a.nome || 'Ataque', f.d.maestria[a.maestria] | 0, f.d.niv[a.attr] | 0, a.bonus | 0));
    },
    'usar-poder'(el) {
      const x = docDe(el), h = x.o, p = h.poderes[+el.dataset.i], d = R.derivados(h), m = F.manaAtual(h, d), custo = p.custo | 0;
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
    filtro(el) { estado.filtro = el.dataset.v; render(); },
    'novo-vilao'() { const v = S.salvar('viloes', F.novoVilao(), 0); location.hash = '#vilao-' + v.id; },
    'duplicar-vilao'() {
      const v = F.pegarVilao(rota().slice(6)); const n = S.clone(v); delete n.id; delete n.base; n.nome += v.base ? '' : ' (cópia)';
      S.salvar('viloes', n, 0); location.hash = '#vilao-' + n.id;
    },
    'apagar-vilao'(el) { const x = docDe(el); UI.confirmar('Apagar vilão', `Apagar ${x.o.nome}? Combates que já usam esse vilão mantêm a cópia deles.`, 'Apagar', () => { S.apagar('viloes', x.id); location.hash = '#viloes'; }); },

    // Campanhas
    'nova-campanha'() {
      UI.janela('Nova campanha', '<label class="campo"><span>Nome</span><input id="nc-nome" placeholder="Os Ratos da Linha Vermelha"></label>', [
        { rotulo: 'Cancelar', acao: f => f() },
        { rotulo: 'Criar', classe: 'primario', acao: (f, j) => { const nome = j.querySelector('#nc-nome').value.trim() || 'Nova campanha'; f(); const c = S.salvar('campanhas', { nome, criada: Date.now(), herois: [], combates: [], ganchos: [], rolagens: [] }, 0); estado.abaMesa = 'herois'; location.hash = '#mesa-' + c.id; } },
      ]);
    },
    'apagar-campanha'(el) { const c = S.pegar('campanhas', el.dataset.id); UI.confirmar('Apagar campanha', `Apagar ${c.nome}? Os heróis continuam salvos; combates, ganchos e rolagens somem.`, 'Apagar', () => { S.apagar('campanhas', c.id); render(); }); },
    'aba-mesa'(el) { estado.abaMesa = el.dataset.aba; render(); },
    'mesa-add-herois'() { const c = campanhaAtual(); escolherHerois('Adicionar heróis à campanha', c.herois || [], ids => { c.herois = (c.herois || []).concat(ids); S.salvar('campanhas', c, 0); render(); }); },
    'mesa-tirar-heroi'(el) { const c = campanhaAtual(); c.herois = c.herois.filter(i => i !== el.dataset.id); S.salvar('campanhas', c, 0); render(); },
    'mesa-rolar-attr'(el) { const c = campanhaAtual(), h = S.pegar('herois', el.dataset.heroi); rolarAttrDe(h, R.derivados(h), el.dataset.attr, c.id); },
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
      cb.turno = t; cb.rodada = r; estado.sel = null; estado.ultimo = null; S.salvar('campanhas', c, 200); render();
    },
    'sel-part'(el) { estado.sel = el.dataset.uid; estado.ultimo = null; render(); },
    'mover-part'(el) {
      const c = campanhaAtual(), cb = combateAtual(c), ord = M.ordenar(c, cb), i = ord.findIndex(p => p.uid === el.dataset.uid), j = i + +el.dataset.d;
      if (j < 0 || j >= ord.length) return;
      const a = ord[i], b = ord[j];
      if (a.agi !== b.agi || R.ordemClasse(a.classe) !== R.ordemClasse(b.classe)) return UI.aviso('Só dá para trocar a ordem de quem empatou na Agilidade e na classe.', 'info');
      ord.forEach((p, k) => { cb.parts.find(x => x.uid === p.uid).desempate = k; });
      cb.parts.find(x => x.uid === a.uid).desempate = j; cb.parts.find(x => x.uid === b.uid).desempate = i;
      S.salvar('campanhas', c, 200); render();
    },
    'tirar-part'(el) { const c = campanhaAtual(), cb = combateAtual(c); cb.parts = cb.parts.filter(p => p.uid !== el.dataset.uid); estado.sel = null; S.salvar('campanhas', c, 0); render(); },
    'combate-add-herois'() {
      const c = campanhaAtual(), cb = combateAtual(c);
      escolherHerois('Adicionar heróis ao combate', cb.parts.filter(p => p.tipo === 'heroi').map(p => p.ref), ids => {
        ids.forEach(id => cb.parts.push({ uid: S.novoId(), tipo: 'heroi', ref: id }));
        c.herois = [...new Set((c.herois || []).concat(ids))]; S.salvar('campanhas', c, 0); render();
      });
    },
    'combate-add-viloes'() { estado.busca = ''; estado.filtro = 'todos'; abrirEscolhaViloes(); },
    'ver-vilao'(el) { UI.fechar(); location.hash = '#vilao-' + el.dataset.id; },
    'add-vilao-combate'(el) {
      const c = campanhaAtual(), cb = combateAtual(c), v = S.clone(F.pegarVilao(el.dataset.id));
      const iguais = cb.parts.filter(p => p.tipo === 'vilao' && p.v.id === v.id).length;
      cb.parts.push({ uid: S.novoId(), tipo: 'vilao', v, nome: v.nome + (iguais ? ' ' + (iguais + 1) : ''), pv: v.pvMax | 0, mana: v.manaMax | 0 });
      S.salvar('campanhas', c, 200); render(); UI.aviso(v.nome + ' entrou no combate.', 'info');
    },
    'part-rolar-attr'(el) {
      const c = campanhaAtual(), cb = combateAtual(c), p = M.participante(c, cb.parts.find(x => x.uid === el.dataset.uid));
      UI.resultado(D.teste(p.nome, el.dataset.attr, p.d.niv[el.dataset.attr] | 0, 0), c.id);
    },
    'part-atacar'(el) {
      const c = campanhaAtual(), cb = combateAtual(c), ord = M.ordenar(c, cb);
      const p = ord.find(x => x.uid === el.dataset.uid), a = p.fonte.ataques[+el.dataset.i];
      const sel = UI.$('#pp-alvo'), alvo = sel ? ord.find(x => x.uid === sel.value) : null;
      const r = D.ataque(p.nome, a.nome || 'Ataque', p.d.maestria[a.maestria] | 0, p.d.niv[a.attr] | 0, a.bonus | 0, alvo ? alvo.def : null);
      if (alvo) r.titulo += ' → ' + alvo.nome;
      UI.resultado(r, c.id);
      estado.ultimo = alvo ? { de: p.uid, alvo: alvo.uid, alvoNome: alvo.nome, dano: r.dano.total, texto: r.acertou ? `Acertou ${alvo.nome} (${r.total} contra Defesa ${alvo.def}).` : `Errou ${alvo.nome} (${r.total} contra Defesa ${alvo.def}).` } : null;
      render();
    },
    'aplicar-dano'() {
      const c = campanhaAtual(), cb = combateAtual(c), u = estado.ultimo; if (!u) return;
      estado.ultimo = null;
      mudarRecurso(`part:${c.id}:${cb.id}:${u.alvo}`, 'pv', -u.dano);
    },
    'part-poder'(el) {
      const c = campanhaAtual(), cb = combateAtual(c), p = M.participante(c, cb.parts.find(x => x.uid === el.dataset.uid));
      const pod = p.fonte.poderes[+el.dataset.i], custo = pod.custo | 0;
      if (custo > p.mana) return UI.aviso(`Mana insuficiente: ${pod.nome} custa ${custo} e restam ${p.mana}.`, 'info');
      mudarRecurso(`part:${c.id}:${cb.id}:${p.uid}`, 'mana', -custo);
      UI.aviso(`${p.nome} usou ${pod.nome}: −${custo} Mana.`, 'info');
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
      const r = D.teste(h.nome, attr, R.derivados(h).niv[attr], 0, attr === 'INT' ? 'Plano de invasão' : 'Tocaia');
      const dt = attr === 'INT' ? (g.dt == null ? 8 : g.dt) : (g.percepcao == null ? 8 : g.percepcao);
      r.alvoDef = dt; r.acertou = r.total >= dt; r.nota = 'contra ' + dt;
      if (k === 'sucessos') g.usadas = (g.usadas | 0) + 1;
      if (r.acertou) g[k] = (g[k] | 0) + 1;
      UI.resultado(r, c.id); S.salvar('campanhas', c, 0); render();
    },
    'rolar-rapido'(el) { const c = campanhaAtual(); UI.resultado(D.livre('Mestre', el.dataset.expr), c && c.id); },
  };

  function abrirEscolhaViloes() {
    const j = UI.janela('Adicionar vilões ao combate', `<div id="escolha-viloes">${F.listaViloes(estado, true)}</div>`, [{ rotulo: 'Pronto', classe: 'primario', acao: f => f() }]);
    j.classList.add('larga');
  }

  const SUBMITS = {
    'rolar-livre'(form) {
      const expr = form.expr.value, f = fonteAtual(), c = campanhaAtual();
      const r = D.livre(f ? nomeQuem(f.o) : 'Mestre', expr);
      if (!r) return UI.aviso('Não entendi a expressão. Use algo como 2d6+3 ou 1d10+1d8.');
      UI.resultado(r, c && c.id);
    },
  };
  const CHANGES = {
    'escolher-combate'(el) { estado.combate = el.value; estado.sel = null; estado.ultimo = null; render(); },
    'escolher-alvo'(el) { estado.alvo = el.value; },
  };

  // ---------- Eventos ----------
  function ligar() {
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-act]');
      if (!el || el.disabled) return;
      const f = A[el.dataset.act];
      if (f) { e.preventDefault(); f(el, e); if (UI.$('#escolha-viloes') && /filtro|add-vilao/.test(el.dataset.act)) UI.$('#escolha-viloes').innerHTML = F.listaViloes(estado, true); }
    });
    document.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('g[data-act]')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
      if (e.key === 'Escape') UI.fechar();
    });
    document.addEventListener('submit', e => {
      const f = e.target.dataset.actSubmit; if (!f) return;
      e.preventDefault(); SUBMITS[f](e.target);
    });
    document.addEventListener('input', e => {
      const el = e.target;
      if (el.matches('[data-busca]')) {
        estado.busca = el.value;
        const box = UI.$('#escolha-viloes');
        if (box && box.contains(el)) { box.innerHTML = F.listaViloes(estado, true); const n = box.querySelector('[data-busca]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
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
        const x = docDe(el);
        UI.lerFoto(el.files[0], el.matches('[data-capa]') ? 900 : 220).then(url => { x.o[el.matches('[data-capa]') ? 'capa' : 'foto'] = url; S.salvar(x.col, x.o, 0); render(); })
          .catch(() => UI.aviso('Não consegui abrir essa imagem. Tente um JPG ou PNG.'));
      }
      if (el.matches('[data-f-part]')) render();
    });
    document.addEventListener('focusout', () => { if (pendente) setTimeout(() => { if (!document.activeElement || !document.activeElement.matches('input,textarea,select')) { pendente = false; render(); } }, 0); });
    window.addEventListener('hashchange', () => { UI.fechar(); render(); });
  }

  function gravarCampo(el, rerender) {
    const x = docDe(el); if (!x) return;
    let v = el.type === 'checkbox' ? el.checked : el.value;
    if (el.type === 'number' || el.hasAttribute('data-num')) v = v === '' ? 0 : +v;
    setCaminho(x.o, el.dataset.f, v);
    // Mudou a classe ou a origem: limpa escolhas que não valem mais.
    if (el.dataset.f === 'classe') { x.o.escolhas.classe = {}; x.o.escolhas.maestria = ''; }
    if (el.dataset.f === 'origem') { x.o.escolhas.origem = {}; x.o.elementos = []; x.o.formaBestial = false; }
    S.salvar(x.col, x.o, rerender ? 300 : 800);
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
    UI.janela('Backup das fichas', `<p>Copie o texto abaixo e guarde num arquivo. Para restaurar, cole um backup no campo de baixo e clique em Importar.</p>
      <label class="campo"><span>Seus dados</span><textarea id="bk-saida" rows="6" readonly>${esc(S.exportar())}</textarea></label>
      <label class="campo"><span>Importar backup</span><textarea id="bk-entrada" rows="4" placeholder='{"sistema":"herois-de-bueiro", …}'></textarea></label>`, [
      { rotulo: 'Copiar', acao: (f, j) => { const t = j.querySelector('#bk-saida'); navigator.clipboard.writeText(t.value).then(() => UI.aviso('Backup copiado.', 'info')).catch(() => { t.focus(); t.select(); UI.aviso('Texto selecionado: use Ctrl+C para copiar.', 'info'); }); } },
      { rotulo: 'Importar', classe: 'primario', acao: (f, j) => { try { const n = S.importar(j.querySelector('#bk-entrada').value); f(); render(); UI.aviso(`${n} registros importados.`, 'info'); } catch (e) { UI.aviso(e.message || 'Backup inválido.'); } } },
    ]);
  }

  async function iniciar() {
    ligar();
    UI.$('#btn-backup').addEventListener('click', backup);
    raiz().innerHTML = '<p class="carregando">Abrindo o bueiro…</p>';
    await S.iniciar(aoMudarRemoto);
    const st = UI.$('#status-salvo');
    st.textContent = S.modo === 'nuvem' ? 'Salvo para a mesa' : 'Salvo neste navegador';
    st.title = S.modo === 'nuvem' ? 'Fichas e campanhas ficam numa base compartilhada com quem tem acesso de edição a esta página.' : 'As fichas ficam só neste navegador. Use o Backup para levar para outro lugar.';
    st.className = 'status ' + S.modo;
    render();
  }
  iniciar();
})(window.HB);
