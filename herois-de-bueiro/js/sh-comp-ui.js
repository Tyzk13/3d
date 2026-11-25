// Compêndio do Livro dos Ceifadores: página de consulta e "Adicionar do livro" na ficha.
(function (HB) {
  const UI = HB.UI, esc = UI.esc;
  const C = () => HB.SH_COMP || { entradas: [], armas: [] };
  const CUSTO_CICLO = { 1: 2, 2: 5, 3: 8, 4: 10, 5: 12 }; // PR por ciclo (tabela do capítulo Kido)
  const ehRegraKido = e => e.c === 'Kidos' && !/CICLO/.test(e.t.slice(0, 30));
  const textoArma = a => `${a.dano} ${a.tipo.toLowerCase()}, crítico ${a.crit}${a.crit < 20 ? '–20' : ''}; ${a.tracos}; ${a.maos} mão${a.maos > 1 ? 's' : ''}; ${a.preco} Kan`;

  // Para onde vai cada tipo de entrada.
  const DESTINOS = {
    habilidades: { titulo: 'Habilidades, aptidões e treinos', filtro: e => ['Zankensoki', 'Aptidões', 'Treinamentos'].includes(e.c),
      add: (h, e) => (h.habilidades = (h.habilidades || []).concat({ nome: e.n, desc: e.t })) },
    kidos: { titulo: 'Kidos', filtro: e => e.c === 'Kidos' && !ehRegraKido(e),
      add: (h, e) => { const m = e.t.match(/(\d)\s*°\s*CICLO/); h.kidos = (h.kidos || []).concat({ nome: e.n.replace(/^#(\d+)\s+/, (x, n) => (e.s === 'Bakudo' ? 'Bakudo' : 'Hado') + ' nº ' + n + ': '), custo: m ? CUSTO_CICLO[m[1]] || 0 : 0, desc: e.t }); } },
    inventario: { titulo: 'Itens e armas', filtro: e => e.c === 'Itens', armas: true,
      add: (h, e) => (h.inventario = (h.inventario || []).concat({ nome: e.n, qtd: 1, desc: e.arma ? textoArma(e.arma) : e.t })) },
    ataques: { titulo: 'Armas', filtro: () => false, armas: true,
      add: (h, e) => { const a = e.arma, dist = /alcance \[/i.test(a.tracos), fin = /fineza/i.test(a.tracos);
        h.ataques = (h.ataques || []).concat({ nome: a.n, tipo: dist ? 'distancia' : 'corpo', attr: dist || fin ? 'DES' : 'FOR', dano: a.dano === '—' ? '1d4' : a.dano.split('/')[0], bonus: 0, margem: a.crit, obs: a.tipo + '; ' + a.tracos }); } },
    shikai: { titulo: 'Efeitos e técnicas de Shikai', filtro: e => e.c === 'Zanpakuto' && /Shikai|Técnica|^$/.test(e.s) && !/Bankai/.test(e.s),
      add: (h, e) => { h.zanpakuto = h.zanpakuto || {}; h.zanpakuto.shikai = ((h.zanpakuto.shikai || '') + '\n• ' + e.n + ': ' + e.t).trim(); } },
    bankai: { titulo: 'Efeitos de Bankai', filtro: e => e.c === 'Zanpakuto' && /Bankai/.test(e.s),
      add: (h, e) => { h.zanpakuto = h.zanpakuto || {}; h.zanpakuto.bankai = ((h.zanpakuto.bankai || '') + '\n• ' + e.n + ': ' + e.t).trim(); } },
  };

  function itensDe(dest) {
    const d = DESTINOS[dest], xs = C().entradas.filter(d.filtro);
    return d.armas ? xs.concat(C().armas.map(a => ({ c: 'Armas', s: a.cat, n: a.n, t: textoArma(a), arma: a }))) : xs;
  }
  // Janela de busca; ao escolher, chama pronto(entrada).
  function seletor(dest, pronto) {
    const d = DESTINOS[dest], itens = itensDe(dest);
    const lista = filtro => itens.map((e, i) => ({ e, i })).filter(({ e }) => !filtro || (e.n + ' ' + e.s + ' ' + e.t).toLowerCase().includes(filtro))
      .map(({ e, i }) => `<div class="comp-item"><div><b>${esc(e.n)}</b><small>${esc([e.c, e.s].filter(Boolean).join(' · '))}</small><p>${esc(e.t.length > 220 ? e.t.slice(0, 220) + '…' : e.t)}</p></div>
        <button type="button" class="btn pequeno primario" data-comp="${i}">Adicionar</button></div>`).join('') || '<p class="vazio">Nada encontrado.</p>';
    const j = UI.janela('Adicionar do livro: ' + d.titulo, `<label class="campo"><span>Buscar</span><input id="comp-busca" placeholder="nome, efeito, palavra…" maxlength="60"></label>
      <div class="comp-lista" id="comp-lista">${lista('')}</div>`, [{ rotulo: 'Fechar', acao: f => f() }]);
    j.classList.add('larga');
    const inp = j.querySelector('#comp-busca');
    inp.addEventListener('input', () => { j.querySelector('#comp-lista').innerHTML = lista(inp.value.trim().toLowerCase()); });
    j.addEventListener('click', ev => {
      const b = ev.target.closest('[data-comp]'); if (!b) return;
      ev.stopPropagation(); const e = itens[+b.dataset.comp];
      pronto(e, d); b.textContent = 'Adicionado ✓'; b.disabled = true;
    });
  }

  // Página de consulta (#compendio).
  function pagina(estado) {
    const cats = ['Todas'].concat([...new Set(C().entradas.map(e => e.c))], ['Armas']);
    const f = cats.includes(estado.filtro) ? estado.filtro : 'Todas', busca = (estado.busca || '').toLowerCase();
    const xs = C().entradas.filter(e => (f === 'Todas' || e.c === f) && (!busca || (e.n + ' ' + e.s + ' ' + e.t).toLowerCase().includes(busca)));
    const armas = (f === 'Todas' || f === 'Armas') ? C().armas.filter(a => !busca || (a.n + ' ' + a.tracos).toLowerCase().includes(busca)) : [];
    const grupos = {}; xs.forEach(e => { const k = e.c + (e.s ? ' · ' + e.s : ''); (grupos[k] = grupos[k] || []).push(e); });
    return `<section class="pagina compendio"><div class="pagina-topo"><div><h1 class="titulo-hq">Compêndio</h1><p class="sub">Tudo do Livro dos Ceifadores para consulta: ${C().entradas.length} entradas e ${C().armas.length} armas. Na ficha, use "Adicionar do livro".</p></div>${HB.botaoLivro('sh')}</div>
      <div class="filtros" role="tablist">${cats.map(c => `<button class="aba ${f === c ? 'ativa' : ''}" data-act="filtro" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <label class="busca"><span class="sr">Buscar no compêndio</span><input id="busca-comp" data-busca placeholder="Buscar: Byakurai, postura, agarrar…" value="${esc(estado.busca || '')}"></label>
      ${Object.entries(grupos).map(([g, es]) => `<h2 class="secao">${esc(g)} <small>${es.length}</small></h2><div class="comp-grupo">${es.map(e => `<details class="comp-ent"><summary>${esc(e.n)}<small>p. ${e.p}</small></summary><p>${esc(e.t)}</p></details>`).join('')}</div>`).join('')}
      ${armas.length ? `<h2 class="secao">Armas <small>${armas.length}</small></h2><div class="tabela-rolagem"><table class="tabela-regra"><thead><tr><th>Arma</th><th>Dano</th><th>Crítico</th><th>Traços</th><th>Mãos</th><th>Preço</th></tr></thead><tbody>
        ${armas.map(a => `<tr><td><b>${esc(a.n)}</b><br><small>${esc(a.cat)}</small></td><td>${esc(a.dano)} ${esc(a.tipo.toLowerCase())}</td><td>${a.crit}${a.crit < 20 ? '–20' : ''}</td><td>${esc(a.tracos)}</td><td>${a.maos}</td><td>${esc(a.preco)}</td></tr>`).join('')}</tbody></table></div>` : ''}
      ${!xs.length && !armas.length ? '<p class="vazio">Nada encontrado.</p>' : ''}
      <p class="dica">Texto extraído do PDF do Livro dos Ceifadores v0.7b (projeto gratuito de fãs, de Setsugiri e equipe; Bleach é de Tite Kubo). Tabelas complexas podem sair resumidas: confira no livro.</p></section>`;
  }
  const botao = (dest, rotulo) => `<button type="button" class="btn pequeno comp-btn" data-act="comp-seletor" data-dest="${dest}">${esc(rotulo)}</button>`;

  const aplicar = (h, dest, e) => DESTINOS[dest].add(h, e);
  HB.SHC = { seletor, pagina, botao, aplicar, CUSTO_CICLO };
})(window.HB);
