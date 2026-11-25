// Criação guiada (passo a passo) e Subir de nível, nos três livros.
// Automático: segue o livro (bônus aplicados, limites conferidos). Manual: valores livres.
(function (HB) {
  const UI = HB.UI, S = HB.S, esc = UI.esc;
  const st = { criar: null, nivel: null };

  // ---------- Ajudantes ----------
  const pegar = (o, c) => c.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o);
  function por(o, c, v) { const ps = c.split('.'); let x = o; ps.slice(0, -1).forEach((k, i) => { if (x[k] == null || typeof x[k] !== 'object') x[k] = /^\d+$/.test(ps[i + 1]) ? [] : {}; x = x[k]; }); x[ps[ps.length - 1]] = v; }
  const cartoes = (itens, campo, atual) => `<div class="cri-cartoes">${itens.map(i => `<button type="button" class="cri-cartao ${String(atual) === String(i.id) ? 'on' : ''}" data-act="cri-set" data-f="${campo}" data-v="${esc(i.id)}">
      <b>${esc(i.nome)}</b>${i.sub ? `<small>${esc(i.sub)}</small>` : ''}${i.desc ? `<span>${esc(i.desc)}</span>` : ''}</button>`).join('')}</div>`;
  const chips = (itens, campo, lista, max, bloq = []) => `<div class="cri-chips">${itens.map(i => { const on = lista.includes(i.id), off = !on && (bloq.includes(i.id) || (max && lista.length >= max));
      return `<button type="button" class="chip ${on ? 'on' : ''}" data-act="cri-toggle" data-f="${campo}" data-v="${esc(i.id)}" data-max="${max || 0}" ${off ? 'disabled' : ''}>${esc(i.nome)}</button>`; }).join('')}</div>`;
  const passo = (campo, valor, rot, min, max) => `<div class="passo"><button type="button" class="seta" data-act="cri-passo" data-f="${campo}" data-d="-1" data-min="${min}" data-max="${max}" aria-label="Diminuir ${esc(rot)}">−</button><b>${valor}</b><button type="button" class="seta" data-act="cri-passo" data-f="${campo}" data-d="1" data-min="${min}" data-max="${max}" aria-label="Aumentar ${esc(rot)}">+</button></div>`;
  const ok = msg => ({ ok: true, msg }), falta = msg => ({ ok: false, msg });
  const linha = (rot, val) => `<div class="cri-linha"><span>${esc(rot)}</span><b>${val}</b></div>`;

  // ---------- Passo comum: identidade e modo ----------
  const passoIdentidade = sis => ({
    titulo: 'Quem é e como montar',
    html: h => `<label class="campo"><span>Nome do ${esc(sis.rotulos.personagem)}</span><input id="cri-nome" data-w="nome" value="${esc(h.nome)}" maxlength="200"></label>
      <label class="campo"><span>Jogador</span><input id="cri-jogador" data-w="jogador" value="${esc(h.jogador || '')}" maxlength="200"></label>
      <h3>Modo</h3>${cartoes([
        { id: 'auto', nome: 'Automático', desc: 'Segue o livro: bônus de classe, origem e divisão aplicados sozinhos, pontos e limites conferidos.' },
        { id: 'manual', nome: 'Manual', desc: 'Você define os valores livremente. A ficha não cobra pontos; dá para ajustar tudo depois.' }], 'modoCalc', h.modoCalc === 'manual' ? 'manual' : 'auto')}
      <p class="dica"><button type="button" class="link" data-act="cri-pular">Pular a criação guiada e abrir uma ficha em branco</button></p>`,
    valido: h => (h.nome && h.nome.trim() ? ok('Pronto. Próximo passo: ' + 'escolhas do livro.') : falta('Dê um nome ao personagem.')),
  });

  // ---------- Heróis de Bueiro ----------
  function passosHB(sis) {
    const R = HB.R;
    const bonusTxt = def => [Object.entries(def.fixo || {}).map(([a, v]) => (v > 0 ? '+' : '') + v + ' ' + R.nomeAttr(a)).join(', '), (def.escolhas || []).map(e => e.rotulo + ' ' + (e.tipo === 'pacote' ? e.opcoes.map(o => o.nome).join(' ou ') : e.opcoes.map(R.nomeAttr).join(' ou '))).join('; ')].filter(Boolean).join('; ');
    const escolhas = (def, alvo, h) => (def && def.escolhas || []).map(e => {
      const v = pegar(h, alvo + '.' + e.id) || '';
      const ops = e.tipo === 'pacote' ? e.opcoes.map(o => `<option value="${o.id}" ${o.id === v ? 'selected' : ''}>${esc(o.nome)}</option>`).join('')
        : e.opcoes.filter(a => !e.diferenteDe || a !== pegar(h, alvo + '.' + e.diferenteDe) || a === v).map(a => `<option value="${a}" ${a === v ? 'selected' : ''}>${esc(R.nomeAttr(a))}</option>`).join('');
      return `<label class="campo"><span>${esc(e.rotulo)}</span><select id="cri-${alvo.replace(/\./g, '-')}-${e.id}" data-w="${alvo}.${e.id}" data-re><option value="">Escolha…</option>${ops}</select></label>`;
    }).join('');
    const faltaEscolha = (def, alvo, h) => (def && def.escolhas || []).some(e => !pegar(h, alvo + '.' + e.id));
    return [passoIdentidade(sis),
      { titulo: 'Classe', html: h => { const c = R.CLASSES[h.classe];
          return cartoes(Object.entries(R.CLASSES).map(([k, v]) => ({ id: k, nome: v.nome, sub: v.resumo, desc: bonusTxt(v) + (v.maestria ? ' · maestria: ' + Object.entries(v.maestria).map(([m, n]) => R.MAESTRIAS.find(x => x.id === m).curto + ' ' + n).join('') : ' · maestria nível 2 à escolha') })), 'classe', h.classe)
            + (c ? `<div class="escolhas">${escolhas(c, 'escolhas.classe', h)}${c.maestriaEscolha ? `<label class="campo"><span>Maestria nível ${c.maestriaEscolha}</span><select id="cri-maestria" data-w="escolhas.maestria" data-re><option value="">Escolha…</option>${R.MAESTRIAS.map(m => `<option value="${m.id}" ${h.escolhas.maestria === m.id ? 'selected' : ''}>${esc(m.nome)}</option>`).join('')}</select></label>` : ''}</div>` : ''); },
        valido: h => { const c = R.CLASSES[h.classe]; if (!c) return falta('Escolha uma classe.'); if (faltaEscolha(c, 'escolhas.classe', h) || (c.maestriaEscolha && !h.escolhas.maestria)) return falta('Complete as escolhas da classe.'); return ok(c.nome + ' escolhido.'); } },
      { titulo: 'Origem', html: h => { const o = R.ORIGENS[h.origem];
          return cartoes(Object.entries(R.ORIGENS).map(([k, v]) => ({ id: k, nome: v.nome, sub: bonusTxt(v), desc: v.texto })), 'origem', h.origem)
            + (o ? `<div class="escolhas">${escolhas(o, 'escolhas.origem', h)}${o.elemento ? Array.from({ length: o.elemento }, (_, i) => `<label class="campo"><span>${o.elemento === 1 ? 'Elemento principal' : 'Elemento ' + (i + 1)}</span><select id="cri-el-${i}" data-w="elementos.${i}" data-re><option value="">Escolha…</option>${Object.keys(R.ELEMENTOS).map(e => `<option ${e === (h.elementos || [])[i] ? 'selected' : ''}>${e}</option>`).join('')}</select></label>`).join('') : ''}</div>` : ''); },
        valido: h => { const o = R.ORIGENS[h.origem]; if (!o) return falta('Escolha uma origem.'); if (faltaEscolha(o, 'escolhas.origem', h)) return falta('Complete as escolhas da origem.'); if (o.elemento && (h.elementos || []).filter(Boolean).length < o.elemento) return falta('Escolha o elemento.'); return ok(o.nome + ' escolhido.'); } },
      { titulo: 'Atributos', html: h => { const d = R.derivados(h), man = h.modoCalc === 'manual';
          return `${man ? '<p class="dica">Manual: compre os níveis que quiser.</p>' : `<p class="pontos-grande ${d.gastos > d.total ? 'ruim' : d.gastos === d.total ? 'ok' : ''}">${d.gastos} / ${d.total} pontos · cada nível custa ${R.CUSTO_NIVEL}</p>`}
            <div class="cri-attrs">${R.TODOS.map(a => { const m = d.mods[a], n = d.niv[a];
              return `<div class="cri-attr"><b>${esc(R.nomeAttr(a))}</b>${passo('base.' + a, (h.base || {})[a] | 0, R.nomeAttr(a), 0, 5)}
                ${linha('Classe', (m.classe > 0 ? '+' : '') + m.classe)}${linha('Origem', (m.origem > 0 ? '+' : '') + m.origem)}${linha('Final', esc(R.NIVEIS[n].nome) + ' · ' + (n ? R.dadoTexto(n) : '—'))}</div>`; }).join('')}</div>`; },
        valido: h => { const d = R.derivados(h); if (h.modoCalc === 'manual') return ok('Atributos definidos.'); if (d.gastos > d.total) return falta('Pontos demais: tire ' + (d.gastos - d.total) + '.'); return d.gastos < d.total ? ok('Sobram ' + (d.total - d.gastos) + ' pontos; dá para continuar e distribuir depois.') : ok('Todos os pontos distribuídos.'); } },
      { titulo: 'Resumo', html: h => { const d = R.derivados(h);
          return `<div class="cri-resumo">${linha('Classe · Origem', esc(HB.F.nomeClasse(h)))}${linha('Vida', d.pvMax)}${linha('Mana', d.manaMax)}${linha('Defesa', d.defesa)}
            ${R.MAESTRIAS.map(m => linha(m.nome, '+' + R.bonusMaestria(d.maestria[m.id]))).join('')}${R.TODOS.map(a => linha(R.nomeAttr(a), '1d10' + (d.niv[a] ? ' + ' + R.dadoTexto(d.niv[a]) : ''))).join('')}</div>
            <p class="dica">Poderes, inventário e foto você completa na ficha.</p>`; },
        valido: () => ok('Tudo certo. Crie a ficha.') },
    ];
  }

  // ---------- Shinigamis & Hollows ----------
  function passosSH(sis) {
    const X = HB.SH, nomeP = id => X.PERICIAS.find(p => p.id === id).nome;
    const soma = h => X.TODOS.reduce((s, a) => s + X.val(h, a), 0);
    const cri = h => (h._cri = Object.assign({ divPericias: [], livres: [], trs: [], extraAttr: 'INT' }, h._cri || {}));
    return [passoIdentidade(sis),
      { titulo: 'Divisão da Gotei 13 (opcional)', html: h => cartoes([{ id: 0, nome: 'Sem divisão', sub: 'Atributos: quaisquer · perícias à escolha', desc: 'Sem característica de divisão.' }]
          .concat(X.DIVISOES.map(d => ({ id: d.n, nome: X.nomeDivisao(d.n), sub: 'Atributos: ' + (d.nota || d.attrs.map(X.nomeAttr).join(' e ')), desc: d.car }))), 'divisao', h.divisao | 0),
        valido: h => ok(h.divisao ? X.nomeDivisao(h.divisao) + ' escolhida.' : 'Sem divisão. Os 3 pontos extras e as 2 perícias extras ficam livres.') },
      { titulo: 'Ponto de Partida', html: h => cartoes(Object.entries(X.PARTIDAS).map(([k, p]) => ({ id: k, nome: p.nome, sub: p.pv + ' de vida + CON · Afinidade: ' + p.afin.map(a => X.CAMINHOS.find(c => c.id === a).nome).join(' e '), desc: p.chave + '. ' + p.bonus })), 'partida', h.partida || ''),
        valido: h => (X.PARTIDAS[h.partida] ? ok(X.PARTIDAS[h.partida].nome + ' escolhido.') : falta('Escolha um Ponto de Partida.')) },
      { titulo: 'Origem especial e clã (opcional)', html: h => `<h3>Vizard</h3>${cartoes([{ id: 'nao', nome: 'Só shinigami', desc: 'Sem poderes de hollow.' },
            { id: 'sim', nome: 'Vizard', sub: 'com aprovação do Narrador', desc: 'Hollow interior e máscara: na Hollowficação, +1 em Força, Destreza e Constituição e acesso ao Cero. É crime digno de execução na Soul Society.' }], '_cri.vizard', (h._cri && h._cri.vizard) || 'nao')}
          <h3>Clã</h3>${cartoes([{ id: '', nome: 'Nenhum' }].concat(Object.entries(X.CLAS).map(([k, c]) => ({ id: k, nome: c.nome, sub: 'narrativo', desc: c.texto }))), 'cla', h.cla || '')}
          <p class="dica">Clãs podem substituir a divisão ou somar a ela, se o Narrador permitir. No livro (v0.7b) ainda não têm regras próprias.</p>`,
        valido: h => ok([h._cri && h._cri.vizard === 'sim' ? 'Vizard' : 'Shinigami', h.cla ? X.CLAS[h.cla].nome : ''].filter(Boolean).join(' · ') + '.') },
      { titulo: 'Atributos', html: h => { const div = X.DIVISOES.find(d => d.n === (h.divisao | 0)), man = h.modoCalc === 'manual', t = soma(h);
          return `${man ? '<p class="dica">Manual: valores livres de −5 a 10.</p>' : `<p class="pontos-grande ${t > 10 ? 'ruim' : t === 10 ? 'ok' : ''}">${t} / 10 pontos (7 iniciais + 3 ${div ? 'da divisão' : 'extras'}) · máximo 4 em um atributo</p>
            <p class="dica">${div ? 'Pontos da divisão: ' + esc(div.nota || div.attrs.map(X.nomeAttr).join(' e ')) : 'Sem divisão: os 3 pontos extras vão em quaisquer atributos'} (no máximo 2 no mesmo).</p>`}
            <div class="cri-attrs">${X.ATRIBUTOS.map(a => `<div class="cri-attr"><b>${a.nome}</b>${passo('atributos.' + a.id, X.sinal(X.val(h, a.id)), a.nome, man ? -5 : 0, man ? 10 : 4)}${linha('Teste', '1d20 ' + X.sinal(X.val(h, a.id)))}</div>`).join('')}</div>`; },
        valido: h => { if (h.modoCalc === 'manual') return ok('Atributos definidos.'); const t = soma(h); if (t > 10) return falta('Pontos demais: tire ' + (t - 10) + '.'); return t < 10 ? ok('Sobram ' + (10 - t) + ' pontos; dá para distribuir depois.') : ok('Todos os pontos distribuídos.'); } },
      { titulo: 'Perícias', html: h => { const c = cri(h), div = X.DIVISOES.find(d => d.n === (h.divisao | 0)), man = h.modoCalc === 'manual';
          const todas = X.PERICIAS.map(p => ({ id: p.id, nome: p.nome + (p.treino ? '*' : '') }));
          if (man) return `<p class="dica">Manual: marque todas as perícias treinadas.</p>${chips(todas, '_cri.livres', c.livres, 0)}`;
          const nExtra = Math.max(0, X.val(h, c.extraAttr)), nLivres = 3 + nExtra;
          const opDiv = div && div.pericias ? div.pericias.map(id => ({ id, nome: nomeP(id) })) : todas;
          return `<h3>${div ? 'Da divisão' : 'Extras (sem divisão)'}: escolha 2 <small>${c.divPericias.length}/2</small></h3>${chips(opDiv, '_cri.divPericias', c.divPericias, 2, c.livres)}
            <h3>Perícias extras vêm de</h3>${cartoes([{ id: 'INT', nome: 'Inteligência', sub: 'estudo · ' + Math.max(0, X.val(h, 'INT')) + ' perícia(s)' }, { id: 'SAB', nome: 'Sabedoria', sub: 'vivência · ' + Math.max(0, X.val(h, 'SAB')) + ' perícia(s)' }], '_cri.extraAttr', c.extraAttr)}
            <h3>À escolha: ${nLivres} <small>(3 + ${nExtra} de ${c.extraAttr}) · ${c.livres.length}/${nLivres}</small></h3>${chips(todas, '_cri.livres', c.livres, nLivres, c.divPericias)}
            <p class="dica">* exige treinamento para ser usada.</p>`; },
        valido: h => { const c = cri(h); if (h.modoCalc === 'manual') return ok(c.livres.length + ' perícias treinadas.'); const n = 3 + Math.max(0, X.val(h, c.extraAttr));
          if (c.divPericias.length < 2) return falta('Escolha as 2 perícias da divisão.'); if (c.livres.length < n) return falta('Escolha mais ' + (n - c.livres.length) + ' perícia(s).'); return ok('Perícias selecionadas.'); } },
      { titulo: 'Testes de resistência', html: h => { const c = cri(h), man = h.modoCalc === 'manual'; return `<p class="dica">${man ? 'Manual: marque os treinados.' : 'Escolha 2 para ser treinado.'}</p>${chips(X.TRS.map(t => ({ id: t.id, nome: t.nome + ' (' + t.attr + ')' })), '_cri.trs', c.trs, man ? 0 : 2)}`; },
        valido: h => { const c = cri(h); return h.modoCalc === 'manual' || c.trs.length === 2 ? ok('Testes escolhidos.') : falta('Escolha ' + (2 - c.trs.length) + ' teste(s).'); } },
      { titulo: 'Zanpakuto', html: h => { const z = h.zanpakuto;
          return `<p class="dica"><b>Zanpakuto</b>: a espada ceifadora de almas. O nome é o do espírito que vive nela (o personagem ainda não sabe).</p>
            <label class="campo"><span>Nome do espírito</span><input id="cri-zan" data-w="zanpakuto.nome" value="${esc(z.nome || '')}" maxlength="200"></label>
            <h3>Forma selada</h3>${cartoes(Object.entries(X.FORMAS).map(([k, f]) => ({ id: k, nome: f.nome, sub: f.dano + ' ' + f.tipo.toLowerCase() + ' · crítico ' + f.crit + (f.crit < 20 ? '–20' : ''), desc: f.tracos })), 'zanpakuto.forma', z.forma)}
            <h3>Tipo</h3>${cartoes(X.TIPOS_ZANPAKUTO.map(t => ({ id: t, nome: t })), 'zanpakuto.tipo', z.tipo || '')}`; },
        valido: h => (h.zanpakuto.tipo ? ok('Zanpakuto pronta. Shikai e bankai vêm com o tempo.') : falta('Escolha o tipo da zanpakuto.')) },
      { titulo: 'Resumo', html: h => { const d = X.derivados(h), c = cri(h);
          return `<div class="cri-resumo">${linha('Divisão · Partida', esc(sis.nomeClasse(h)))}${linha('Vida', d.pvMax)}${linha('Reiryoku', d.manaMax)}${linha('Defesa', d.defesa)}${linha('Bônus de treino', '+' + d.bt)}
            ${linha('Perícias treinadas', esc(c.divPericias.concat(c.livres).map(nomeP).join(', ') || '—'))}${linha('Testes treinados', esc(c.trs.map(t => X.TRS.find(x => x.id === t).nome).join(', ') || '—'))}
            ${linha('Origem', esc((c.vizard === 'sim' ? 'Shinigami · Vizard' : 'Shinigami') + (h.cla ? ' · ' + X.CLAS[h.cla].nome : '')))}
            ${linha('Zanpakuto', esc((h.zanpakuto.nome || 'sem nome') + ' · ' + X.FORMAS[h.zanpakuto.forma].nome))}</div><p class="dica">Kidos, habilidades e foto você completa na ficha. Começa com 50 mil Kan.</p>`; },
        valido: () => ok('Tudo certo. Crie a ficha.') },
    ];
  }
  function finalizarSH(h) {
    const c = h._cri || {}; delete h._cri;
    h.vizard = c.vizard === 'sim';
    (c.divPericias || []).concat(c.livres || []).forEach(id => { h.pericias[id] = { grau: 1, outros: 0 }; });
    (c.trs || []).forEach(id => { h.trs[id] = { grau: 1, outros: 0 }; });
  }

  // ---------- Ordem Paranormal II ----------
  function passosOP2(sis) {
    const O = HB.OP2, dado = O.dado;
    return [passoIdentidade(sis),
      { titulo: 'Perfil', html: h => cartoes(Object.entries(O.PERFIS).map(([k, p]) => ({ id: k, nome: p.nome, sub: 'Nível 1: ' + p.unica[0], desc: p.unica[1] })), 'perfil', h.perfil || ''),
        valido: h => (O.PERFIS[h.perfil] ? ok(O.PERFIS[h.perfil].nome + ' escolhido.') : falta('Escolha um perfil.')) },
      { titulo: 'Ocupação', html: h => { const oc = O.OCUPACOES[h.ocupacao];
          return cartoes(Object.entries(O.OCUPACOES).map(([k, o]) => ({ id: k, nome: o.nome, sub: o.hab, desc: o.texto })), 'ocupacao', h.ocupacao || '')
            + (oc && oc.pericia ? `<label class="campo"><span>Perícia que sobe para d6</span><select id="cri-ocesc" data-w="ocupEscolha" data-re><option value="">Escolha…</option>${h.pericias.map((p, i) => p.cat === oc.pericia ? `<option value="${i}" ${String(i) === String(h.ocupEscolha) ? 'selected' : ''}>${esc(p.nome)}</option>` : '').join('')}</select></label>` : ''); },
        valido: h => { const oc = O.OCUPACOES[h.ocupacao]; if (!oc) return falta('Escolha uma ocupação.'); if (oc.pericia && (h.ocupEscolha === '' || h.ocupEscolha == null)) return falta('Escolha a perícia da ocupação.'); return ok(oc.nome + ' escolhida.'); } },
      { titulo: 'Atributos', html: h => { const d = O.derivados(h), man = h.modoCalc === 'manual';
          return `${man ? '<p class="dica">Manual: de d4 a d12.</p>' : `<p class="pontos-grande ${d.gastoAttr > d.ptsAttr ? 'ruim' : d.gastoAttr === d.ptsAttr ? 'ok' : ''}">${d.gastoAttr} / ${d.ptsAttr} pontos · todos começam em d6 · baixar um para d4 dá +1 ponto · máximo d8</p>`}
            <div class="cri-attrs">${O.ATRIBUTOS.map(a => `<div class="cri-attr"><b>${a.nome}</b>${passo('passos.' + a.id, 'd' + dado(O.passoAttr(h, a.id)), a.nome, 0, man ? 4 : 2)}${linha(a.id === 'FIS' ? 'Base de PV' : a.id === 'EMO' ? 'Base de PD' : 'Pontos de perícia', a.id === 'MEN' ? 4 + dado(O.passoAttr(h, a.id)) / 2 : dado(O.passoAttr(h, a.id)))}</div>`).join('')}</div>`; },
        valido: h => { if (h.modoCalc === 'manual') return ok('Atributos definidos.'); const d = O.derivados(h); if (d.gastoAttr > d.ptsAttr) return falta('Pontos demais.'); return d.gastoAttr < d.ptsAttr ? falta('Distribua o ponto de atributo.') : ok('Atributos prontos.'); } },
      { titulo: 'Vida e Determinação', html: h => { const d = O.derivados(h), man = h.modoCalc === 'manual';
          return `${man ? '' : `<p class="pontos-grande ${d.gastoDist > d.distrib ? 'ruim' : d.gastoDist === d.distrib ? 'ok' : ''}">${d.gastoDist} / ${d.distrib} pontos para dividir</p>`}
            <div class="cri-attrs"><div class="cri-attr"><b>PV</b>${passo('pvPontos', h.pvPontos | 0, 'PV', 0, 99)}${linha('Total', d.pvMax)}</div><div class="cri-attr"><b>PD</b>${passo('pdPontos', h.pdPontos | 0, 'PD', 0, 99)}${linha('Total', d.manaMax)}</div></div>`; },
        valido: h => { if (h.modoCalc === 'manual') return ok('PV e PD definidos.'); const d = O.derivados(h); return d.gastoDist === d.distrib ? ok('PV e PD prontos.') : d.gastoDist > d.distrib ? falta('Pontos demais.') : falta('Distribua mais ' + (d.distrib - d.gastoDist) + ' ponto(s).'); } },
      { titulo: 'Perícias', html: h => { const d = O.derivados(h), man = h.modoCalc === 'manual';
          return `${man ? '<p class="dica">Manual: de d4 a d12.</p>' : `<p class="pontos-grande ${d.gastoPer > d.ptsPer ? 'ruim' : d.gastoPer === d.ptsPer ? 'ok' : ''}">${d.gastoPer} / ${d.ptsPer} pontos · cada ponto sobe um passo</p>`}
            ${['fis', 'emo', 'men'].map(c => `<h3>${O.CAT[c]}</h3><div class="cri-attrs">${h.pericias.map((p, i) => p.cat !== c ? '' : `<div class="cri-attr"><b>${esc(p.nome)}</b>${passo('pericias.' + i + '.passo', 'd' + dado(O.periciaEf(h, i)), p.nome, 0, 4)}</div>`).join('')}</div>`).join('')}`; },
        valido: h => { if (h.modoCalc === 'manual') return ok('Perícias definidas.'); const d = O.derivados(h); return d.gastoPer > d.ptsPer ? falta('Pontos demais.') : d.gastoPer < d.ptsPer ? ok('Sobram ' + (d.ptsPer - d.gastoPer) + ' pontos; dá para usar depois.') : ok('Perícias prontas.'); } },
      { titulo: 'Resumo', html: h => { const d = O.derivados(h);
          return `<div class="cri-resumo">${linha('Perfil · Ocupação', esc(sis.nomeClasse(h)))}${linha('PV', d.pvMax)}${linha('PD', d.manaMax)}${O.ATRIBUTOS.map(a => linha(a.nome, 'd' + dado(O.passoAttr(h, a.id)))).join('')}
            ${linha('Perícias acima de d4', esc(h.pericias.map((p, i) => O.periciaEf(h, i) > 0 ? p.nome + ' d' + dado(O.periciaEf(h, i)) : '').filter(Boolean).join(', ') || '—'))}</div><p class="dica">Ataques, habilidades e foto você completa na ficha.</p>`; },
        valido: () => ok('Tudo certo. Crie a ficha.') },
    ];
  }

  const PASSOS = { hb: passosHB, sh: passosSH, op2: passosOP2 };

  // ---------- Subir de nível ----------
  function nivelPlano(h) {
    const sis = HB.Sistemas.de(h), t = st.nivel.t;
    if (sis.id === 'hb') return { titulo: 'Ganhar um nível de experiência', itens: [
      `<p>O livro não tem tabela de níveis: o mestre concede pontos. Um nível de experiência custa ${HB.R.CUSTO_NIVEL} pontos.</p>`,
      `<label class="campo"><span>Atributo que sobe um nível</span><select id="nv-attr" data-w="attr" data-re><option value="">Escolha…</option>${HB.R.TODOS.map(a => `<option value="${a}" ${t.attr === a ? 'selected' : ''}>${HB.R.nomeAttr(a)} (agora ${HB.R.NIVEIS[HB.R.derivados(h).niv[a]].nome})</option>`).join('')}</select></label>`],
      valido: () => (t.attr ? ok('Pronto para aplicar.') : falta('Escolha o atributo.')),
      aplicar: () => { h.pontos = (h.pontos == null ? HB.R.PONTOS_INICIAIS : h.pontos) + HB.R.CUSTO_NIVEL; h.base = h.base || {}; h.base[t.attr] = Math.min(5, (h.base[t.attr] | 0) + 1); } };
    if (sis.id === 'sh') {
      const X = HB.SH, d = X.derivados(h), n = d.n + 1, aum = X.AUMENTOS.includes(n), mest = [6, 12, 18].includes(n), marco = X.MARCOS.includes(n);
      const treinadas = X.PERICIAS.filter(p => ((h.pericias || {})[p.id] || {}).grau === 1);
      const gastos = X.TODOS.reduce((s, a) => s + ((t.attrs || {})[a] | 0), 0);
      return { titulo: `Subir para o nível ${n}`, max: n > 20, itens: [
        `<div class="cri-resumo">${linha('Vida', '+' + X.pvPorNivel(n) + (marco ? ' + CON (' + (X.pvPorNivel(n) + X.val(h, 'CON')) + ')' : ''))}${linha('Reiryoku', '+3' + (marco ? ' + ESP (' + (3 + X.val(h, 'ESP')) + ')' : ''))}${linha('Bônus de treino', '+' + X.bonusTreino(n) + (X.bonusTreino(n) > d.bt ? ' (sobe!)' : ''))}${n === 10 ? linha('Limite de atributo', '10') : ''}</div>`,
        `<h3>Ponto de Progressão</h3><p class="dica">+1 de Afinidade num Caminho e uma habilidade ou aptidão.</p>${cartoes(X.CAMINHOS.map(c => ({ id: c.id, nome: c.rotulo, sub: 'Afinidade ' + ((h.afinidades || {})[c.id] | 0) + ' → ' + (((h.afinidades || {})[c.id] | 0) + 1) + ' (' + X.graduacao(((h.afinidades || {})[c.id] | 0) + 1) + ')' })), 'caminho', t.caminho || '')}
          <label class="campo"><span>Habilidade ou aptidão escolhida (opcional)</span><input id="nv-hab" data-w="hab" value="${esc(t.hab || '')}" maxlength="200" placeholder="Ex.: Golpes Precisos"></label>`,
        aum ? `<h3>Aumento de Atributo: 2 pontos <small>${gastos}/2</small></h3><div class="cri-attrs">${X.ATRIBUTOS.map(a => `<div class="cri-attr"><b>${a.nome} ${X.sinal(X.val(h, a.id))}</b>${passo('attrs.' + a.id, '+' + ((t.attrs || {})[a.id] | 0), a.nome, 0, 2)}</div>`).join('')}</div>` : '',
        mest ? `<h3>Mestre em uma perícia</h3>${treinadas.length ? cartoes(treinadas.map(p => ({ id: p.id, nome: p.nome })), 'mestre', t.mestre || '') : '<p class="dica">Nenhuma perícia treinada para virar mestre.</p>'}` : ''],
        valido: () => !t.caminho ? falta('Escolha o Caminho do Ponto de Progressão.') : aum && gastos !== 2 ? falta('Distribua os 2 pontos de atributo.') : mest && treinadas.length && !t.mestre ? falta('Escolha a perícia de mestre.') : ok('Pronto para aplicar.'),
        aplicar: () => {
          h.nivel = n; h.afinidades = h.afinidades || {}; h.afinidades[t.caminho] = Math.min(10, (h.afinidades[t.caminho] | 0) + 1);
          if (t.hab) h.habilidades = (h.habilidades || []).concat({ nome: t.hab, desc: 'Nível ' + n });
          if (aum) X.TODOS.forEach(a => { h.atributos[a] = X.val(h, a) + ((t.attrs || {})[a] | 0); });
          if (mest && t.mestre) h.pericias[t.mestre] = Object.assign({}, h.pericias[t.mestre], { grau: 2 });
        } };
    }
    const O = HB.OP2, d = O.derivados(h), n = d.n + 1, pf = O.PERFIS[h.perfil];
    const aum = O.AUMENTOS.includes(n), grau = O.GRAUS.includes(n), hk = O.HAB_NIVEL.indexOf(n);
    const dist = (t.pv | 0) + (t.pd | 0), perG = (h.pericias || []).reduce((s, p, i) => s + ((t.per || {})[i] | 0), 0);
    return { titulo: `Subir para o nível ${n}`, max: n > 10, itens: [
      `<h3>6 pontos para PV e PD <small>${dist}/6</small></h3><div class="cri-attrs"><div class="cri-attr"><b>PV</b>${passo('pv', '+' + (t.pv | 0), 'PV', 0, 6)}</div><div class="cri-attr"><b>PD</b>${passo('pd', '+' + (t.pd | 0), 'PD', 0, 6)}</div></div>`,
      aum ? `<h3>Aumento de atributo: +1 passo</h3>${cartoes(O.ATRIBUTOS.map(a => ({ id: a.id, nome: a.nome, sub: 'd' + O.dado(O.passoAttr(h, a.id)) + ' → d' + O.dado(Math.min(4, O.passoAttr(h, a.id) + 1)) })), 'attr', t.attr || '')}` : '',
      grau ? `<h3>Grau de treinamento: 7 pontos de perícia <small>${perG}/7</small></h3><div class="cri-attrs">${(h.pericias || []).map((p, i) => `<div class="cri-attr"><b>${esc(p.nome)} d${O.dado(O.periciaEf(h, i))}</b>${passo('per.' + i, '+' + ((t.per || {})[i] | 0), p.nome, 0, Math.max(0, 4 - (p.passo | 0)))}</div>`).join('')}</div>` : '',
      hk >= 0 ? `<h3>Habilidade de nível</h3><p class="regra"><b>${esc(pf ? pf.nivel[hk][0] : 'Do perfil')}.</b> ${esc(pf ? pf.nivel[hk][1] : 'Escolha o perfil na ficha.')}</p>` : '',
      `<p class="dica">${(O.OCUPACOES[h.ocupacao] || {}).pvNivel ? 'Calejado: +1 PV automático. ' : (O.OCUPACOES[h.ocupacao] || {}).pdNivel ? 'Dedicação: +1 PD automático. ' : ''}O livro marca a progressão como especulação sobre o playtest.</p>`],
      valido: () => dist !== 6 ? falta('Distribua os 6 pontos entre PV e PD.') : aum && !t.attr ? falta('Escolha o atributo.') : grau && perG !== 7 ? falta('Distribua os 7 pontos de perícia.') : ok('Pronto para aplicar.'),
      aplicar: () => {
        h.nivel = n; h.pvPontos = (h.pvPontos | 0) + (t.pv | 0); h.pdPontos = (h.pdPontos | 0) + (t.pd | 0);
        if (aum) { h.passos = h.passos || {}; h.passos[t.attr] = Math.min(4, O.passoAttr(h, t.attr) + 1); }
        if (grau) (h.pericias || []).forEach((p, i) => { p.passo = Math.min(4, (p.passo | 0) + ((t.per || {})[i] | 0)); });
        if (hk >= 0 && pf) h.habilidades = (h.habilidades || []).concat({ nome: pf.nivel[hk][0], custo: 0, desc: pf.nivel[hk][1] });
      } };
  }

  // ---------- Telas ----------
  function telaCriar() {
    const c = st.criar; if (!c) return null;
    const sis = HB.Sistemas.lista().find(s => s.id === c.sis), passos = PASSOS[c.sis](sis), p = passos[c.passo], v = p.valido(c.h), ultimo = c.passo === passos.length - 1;
    return `<section class="pagina criador" data-wiz="criar">
      <h1 class="titulo-hq">Criação de ${esc(sis.rotulos.personagem)}</h1>
      <p class="sub">Passo ${c.passo + 1} de ${passos.length} · ${c.h.modoCalc === 'manual' ? 'Manual' : 'Automático'} · ${esc(sis.nome)}</p>
      <h2 class="cri-titulo">${esc(p.titulo)}</h2>
      <div class="cri-barra" aria-hidden="true"><span style="width:${Math.round((c.passo + 1) / passos.length * 100)}%"></span></div>
      <div class="cri-corpo">${p.html(c.h)}</div>
      <div class="cri-status ${v.ok ? 'ok' : 'falta'}" role="status">${v.ok ? '✓ ' : ''}${esc(v.msg)}</div>
      <div class="cri-rodape"><button type="button" class="btn" data-act="cri-cancelar">Cancelar</button>
        <span>${c.passo ? '<button type="button" class="btn" data-act="cri-voltar">Voltar</button>' : ''}<button type="button" class="btn primario" data-act="cri-proximo" ${v.ok ? '' : 'disabled'}>${ultimo ? 'Criar ficha' : 'Próximo'}</button></span></div>
    </section>`;
  }
  function telaNivel(h) {
    if (!st.nivel || st.nivel.id !== h.id) st.nivel = { id: h.id, t: {} };
    const pl = nivelPlano(h), sis = HB.Sistemas.de(h);
    if (pl.max) return `<section class="pagina"><div class="vazio-grande"><p>Este ${esc(sis.rotulos.personagem)} já está no nível máximo do livro.</p><a class="btn" href="#heroi-${esc(h.id)}">Voltar à ficha</a></div></section>`;
    const v = pl.valido();
    return `<section class="pagina criador" data-wiz="nivel">
      <h1 class="titulo-hq">${esc(pl.titulo)}</h1><p class="sub">${esc(h.nome)} · ${esc(sis.nome)}</p>
      <div class="cri-corpo">${pl.itens.join('')}</div>
      <div class="cri-status ${v.ok ? 'ok' : 'falta'}" role="status">${v.ok ? '✓ ' : ''}${esc(v.msg)}</div>
      <div class="cri-rodape"><a class="btn" href="#heroi-${esc(h.id)}">Cancelar</a><button type="button" class="btn primario" data-act="nv-aplicar" data-id="${esc(h.id)}" ${v.ok ? '' : 'disabled'}>Aplicar</button></div></section>`;
  }

  // ---------- Ações ----------
  const alvo = el => (el.closest('[data-wiz="nivel"]') ? st.nivel.t : st.criar.h);
  function iniciar(sis, dono, jogador) {
    const h = sis.novoPersonagem(); h.sistema = sis.id; h.dono = dono; h.jogador = jogador; h.modoCalc = 'auto';
    st.criar = { sis: sis.id, passo: 0, h };
  }
  function limparDependentes(h, campo) {
    if (campo === 'classe') { h.escolhas.classe = {}; h.escolhas.maestria = ''; }
    if (campo === 'origem') { h.escolhas.origem = {}; h.elementos = []; }
    if (campo === 'ocupacao') h.ocupEscolha = '';
    const sis = HB.Sistemas.de(h); if (sis.aoMudarCampo) sis.aoMudarCampo(h, campo);
  }
  function salvarNovo(h) {
    if (h.sistema === 'sh') finalizarSH(h);
    if (h.modoCalc === 'manual') { const d = HB.Sistemas.de(h).derivados(Object.assign({}, h, { modoCalc: 'auto' })); h.manual = { pvMax: d.pvMax, manaMax: d.manaMax, defesa: d.defesa }; }
    delete h._cri; h.criado = Date.now();
    return S.salvar('herois', h, 0);
  }
  const acoes = re => ({
    'cri-set'(el) { const o = alvo(el), c = el.dataset.f, v = el.dataset.v; por(o, c, /^(divisao)$/.test(c) ? +v : v); if (o === (st.criar || {}).h) limparDependentes(o, c); re(); },
    'cri-toggle'(el) { const o = alvo(el), c = el.dataset.f, v = el.dataset.v, l = (pegar(o, c) || []).slice(), max = +el.dataset.max;
      const i = l.indexOf(v); if (i >= 0) l.splice(i, 1); else if (!max || l.length < max) l.push(v); por(o, c, l); re(); },
    'cri-passo'(el) { const o = alvo(el), c = el.dataset.f; por(o, c, Math.max(+el.dataset.min, Math.min(+el.dataset.max, ((pegar(o, c) | 0) + +el.dataset.d)))); re(); },
    'cri-voltar'() { st.criar.passo = Math.max(0, st.criar.passo - 1); re(true); },
    'cri-proximo'() {
      const c = st.criar, sis = HB.Sistemas.lista().find(s => s.id === c.sis), passos = PASSOS[c.sis](sis);
      if (!passos[c.passo].valido(c.h).ok) return;
      if (c.passo < passos.length - 1) { c.passo++; re(true); return; }
      const h = salvarNovo(c.h); st.criar = null; location.hash = '#heroi-' + h.id; UI.aviso('Ficha criada.', 'info');
    },
    'cri-pular'() { const h = st.criar.h; h.modoCalc = 'auto'; delete h._cri; const n = S.salvar('herois', h, 0); st.criar = null; location.hash = '#heroi-' + n.id; },
    'cri-cancelar'() { UI.confirmar('Cancelar criação', 'Descartar o que foi preenchido até aqui?', 'Descartar', () => { st.criar = null; location.hash = '#herois'; }); },
    'nv-aplicar'(el) {
      const h = S.pegar('herois', el.dataset.id); if (!h) return; const pl = nivelPlano(h); if (!pl.valido().ok) return;
      pl.aplicar(); S.salvar('herois', h, 0); st.nivel = null; location.hash = '#heroi-' + h.id; UI.aviso('Nível aplicado. Confira a aba Progressão.', 'info');
    },
  });
  // Campos de texto/seleção do assistente (data-w).
  function campo(el, mudou) {
    const o = alvo(el); let v = el.value; if (el.type === 'number' || el.hasAttribute('data-num')) v = v === '' ? 0 : +v;
    por(o, el.dataset.w, v); if (mudou && o === (st.criar || {}).h) limparDependentes(o, el.dataset.w);
    return mudou;
  }

  HB.Criador = { st, iniciar, telaCriar, telaNivel, acoes, campo };
})(window.HB);
