// Shinigamis & Hollows: ficha do shinigami, ameaças (hollows) e a ligação com o RPGHUB.
(function (HB) {
  const X = HB.SH, UI = HB.UI, S = HB.S, esc = UI.esc, sn = X.sinal;

  function novoPersonagem() {
    const atributos = {}; X.TODOS.forEach(a => (atributos[a] = 0));
    return {
      sistema: 'sh', nome: 'Novo shinigami', jogador: '', foto: '', origem: 'Shinigami', divisao: 0, partida: '', nivel: 1,
      atributos, defAttr: 'DES', cdAttr: 'ESP', kidoAttr: 'INT', pericias: {}, trs: {}, afinidades: {},
      zanpakuto: { nome: '', forma: 'katana', tipo: '', sintonia: 0, estado: 'selada', comando: '', shikai: '', bankai: '', bonusDano: 0, bonusAtk: 0, duasMaos: false },
      ataques: [], kidos: [], habilidades: [], inventario: [], kan: 50000,
      pessoal: {}, conviccao: 0, quebras: 0, ferimentos: '', pv: null, mana: null, pvExtra: 0, manaExtra: 0, defExtra: 0, dureza: 0,
      condicoes: [], criado: Date.now(),
    };
  }
  const nomeClasse = h => ['Nível ' + (h.nivel | 0 || 1), h.divisao ? X.nomeDivisao(h.divisao) : '', (X.PARTIDAS[h.partida] || {}).nome].filter(Boolean).join(' · ');
  const ehVilao = o => o.categoria !== undefined || o.perfil !== undefined || !!o.base;
  const pvAtual = (h, d) => (h.pv == null ? d.pvMax : h.pv);
  const manaAtual = (h, d) => (h.mana == null ? d.manaMax : h.mana);

  // Ataque da zanpakuto, montado da forma selada.
  function ataqueZanpakuto(h, d) {
    const z = h.zanpakuto || {}, f = X.FORMAS[z.forma] || X.FORMAS.katana;
    const attr = f.fineza && X.val(h, 'DES') > X.val(h, 'FOR') ? 'DES' : 'FOR';
    const dano = f.dano2 && z.duasMaos ? f.dano2 : f.dano;
    let bonusDano = X.val(h, attr) + (z.bonusDano | 0) + (h.partida === 'convergente' ? 2 : 0) + ((h.divisao | 0) === 11 ? d.bt : 0);
    const acerto = X.val(h, attr) + d.bt + (z.bonusAtk | 0) + ((h.divisao | 0) === 11 ? 1 : 0);
    const estado = { selada: 'selada', shikai: 'shikai', bankai: 'bankai' }[z.estado] || 'selada';
    return { nome: (z.nome || 'Zanpakuto') + (estado !== 'selada' ? ' (' + estado + ')' : ''), acerto, dano, bonusDano, margem: f.crit, tipoDano: f.tipo, leve: f.fineza, sub: f.nome };
  }
  function ataquesDe(o) {
    if (ehVilao(o)) return (o.ataques || []).map(a => ({ nome: a.nome || 'Ataque', acerto: a.acerto | 0, dano: a.dano || '1d6', bonusDano: 0, margem: a.margem | 0 || 20, tipoDano: a.tipoDano || '', obs: a.obs || '' }));
    const d = X.derivados(o);
    return [ataqueZanpakuto(o, d)].concat((o.ataques || []).map(a => {
      const attr = a.attr || (a.tipo === 'distancia' ? 'DES' : a.tipo === 'espiritual' ? 'ESP' : 'FOR');
      return { nome: a.nome || 'Ataque', acerto: X.val(o, attr) + d.bt + (a.bonusAtk | 0), dano: a.dano || '1d4', bonusDano: (a.tipo === 'espiritual' ? 0 : X.val(o, attr)) + (a.bonus | 0), margem: a.margem | 0 || 20, tipoDano: a.tipoDano || '', obs: a.obs || '', leve: !!a.leve };
    }));
  }
  const penalidade = (multi, leve) => [0, leve ? -4 : -5, leve ? -8 : -10][Math.max(0, Math.min(2, multi | 0))];

  // ---------- Testes ----------
  function teste(o, id, opts = {}) {
    const quem = o.nome || '';
    if (ehVilao(o)) {
      if (X.TODOS.includes(id)) return X.testeD20(quem, X.nomeAttr(id), X.val(o, id));
      if (id === 'percepcao' || id === 'iniciativa') return X.testeD20(quem, id === 'iniciativa' ? 'Iniciativa' : 'Percepção', o.percepcao | 0);
      const tr = X.TRS.find(t => t.id === id); if (tr) return X.testeD20(quem, 'TR de ' + tr.nome, (o.trs || {})[id] | 0);
      const p = X.PERICIAS.find(x => x.id === id); return X.testeD20(quem, p ? p.nome : id, p ? X.val(o, p.attr) : 0);
    }
    const d = X.derivados(o);
    if (X.TODOS.includes(id)) return X.testeD20(quem, X.nomeAttr(id), X.val(o, id) + (opts.extra | 0));
    if (id === 'iniciativa') return X.testeD20(quem, 'Iniciativa (Percepção)', d.percepcao);
    const tr = X.TRS.find(t => t.id === id);
    if (tr) { const b = X.bonusTR(o, id, d.bt); return X.testeD20(quem, 'TR de ' + tr.nome, b.total + (opts.extra | 0), b.grau === 2 ? 'mestre: sucesso por 10+ é crítico' : ''); }
    const p = X.PERICIAS.find(x => x.id === id); if (!p) return null;
    const b = X.bonusPericia(o, id, d.bt);
    return X.testeD20(quem, p.nome, b.total + (opts.extra | 0), b.bloqueada ? 'exige treinamento' : '');
  }
  function ataque(o, i, opts = {}) {
    const a = ataquesDe(o)[i]; if (!a) return null;
    const pen = penalidade(opts.multi, a.leve);
    return X.jogadaAtaque(o.nome || '', a.nome, a.acerto + pen, a.dano, a.bonusDano, { alvoDef: opts.alvoDef, margem: a.margem, nota: [pen ? 'ataque múltiplo ' + pen : '', a.tipoDano].filter(Boolean).join(' · ') });
  }

  function combatente(o) {
    const v = ehVilao(o);
    const d = v ? null : X.derivados(o);
    const bonusDe = id => {
      if (X.TODOS.includes(id)) return X.val(o, id);
      if (v) return id === 'percepcao' ? o.percepcao | 0 : ((o.trs || {})[id] | 0);
      return X.TRS.some(t => t.id === id) ? X.bonusTR(o, id, d.bt).total : X.bonusPericia(o, id, d.bt).total;
    };
    const ids = [['fortitude', 'Fortitude', 'FORT'], ['reflexos', 'Reflexos', 'REF'], ['vontade', 'Vontade', 'VON'], ['percepcao', 'Percepção', 'PER']].concat(X.ATRIBUTOS.map(a => [a.id, a.nome, a.id]));
    const testes = ids.map(([id, rot, curto]) => { const b = bonusDe(id); return { id, rotulo: rot, curto, texto: '1d20 ' + sn(b), mini: sn(b) }; });
    const atq = ataquesDe(o);
    return {
      pvMax: v ? o.pvMax | 0 : d.pvMax, manaMax: v ? o.manaMax | 0 : d.manaMax, def: v ? o.defesa | 0 : d.defesa, dureza: v ? o.dureza | 0 : d.dureza,
      agi: X.val(o, 'DES'), ordemClasse: 0, iniBonus: v ? o.percepcao | 0 : d.percepcao,
      linha: v ? (o.categoria || 'Ameaça') + ' · Nível ' + (o.nivel | 0 || 1) : nomeClasse(o),
      numeros: v ? [['Defesa', o.defesa | 0], ['Dureza', o.dureza | 0], ['CD', o.cd | 0], ['Percepção', sn(o.percepcao | 0)]]
        : [['Defesa', d.defesa], ['Dureza', d.dureza], ['Treino', '+' + d.bt], ['CD Classe', d.cdClasse], ['CD Kido', d.cdKido]],
      testes, escudo: testes.slice(0, 6),
      ataques: atq.map(a => ({ nome: a.nome, sub: `1d20 ${sn(a.acerto)} · ${a.dano}${a.bonusDano ? ' ' + sn(a.bonusDano) : ''}${a.tipoDano ? ' ' + a.tipoDano.toLowerCase() : ''} · crítico ${a.margem}${a.margem < 20 ? '–20' : ''}${a.obs ? ' · ' + a.obs : ''}` })),
      poderes: (v ? o.poderes || [] : (o.kidos || [])).map(p => ({ nome: p.nome || 'Kido', custo: p.custo | 0, desc: p.desc || '' })),
      multiAtaque: true,
    };
  }

  // ---------- Ficha ----------
  function hexagono(o, lim) {
    const cx = 160, cy = 160, raio = 112;
    const pts = X.TODOS.map((a, i) => { const ang = -Math.PI / 2 + i * Math.PI / 3; return [cx + raio * Math.cos(ang), cy + raio * Math.sin(ang), ang]; });
    const radar = X.TODOS.map((a, i) => { const f = 0.12 + 0.88 * Math.max(0, Math.min(1, X.val(o, a) / lim)); return [cx + raio * f * Math.cos(pts[i][2]), cy + raio * f * Math.sin(pts[i][2])].join(','); }).join(' ');
    const aneis = [0.4, 0.7, 1].map(f => `<polygon class="hex-anel" points="${pts.map(p => [cx + (p[0] - cx) * f, cy + (p[1] - cy) * f].join(',')).join(' ')}"/>`).join('');
    const nos = X.TODOS.map((a, i) => `<g class="hex-no" data-act="rolar-attr" data-attr="${a}" tabindex="0" role="button" aria-label="Rolar ${X.nomeAttr(a)}">
        <circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="33"/><text x="${pts[i][0]}" y="${pts[i][1] - 4}" class="hex-dado">${sn(X.val(o, a))}</text>
        <text x="${pts[i][0]}" y="${pts[i][1] + 15}" class="hex-sigla">${a}</text></g>`).join('');
    return `<svg class="hexagono" viewBox="0 0 320 320" role="group" aria-label="Atributos">${aneis}<polygon class="hex-radar" points="${radar}"/>${nos}
      <text x="160" y="156" class="hex-centro">1d20</text><text x="160" y="176" class="hex-centro-sub">+ atributo</text></svg>`;
  }
  const passo = (campo, valor, rot) => `<div class="passo"><button class="seta" data-act="sh-passo" data-f="${campo}" data-d="-1" aria-label="Diminuir ${esc(rot)}">−</button><b>${valor}</b><button class="seta" data-act="sh-passo" data-f="${campo}" data-d="1" aria-label="Aumentar ${esc(rot)}">+</button></div>`;
  const selGrau = (campo, g, id) => `<select id="${esc(id)}" class="grau g${g}" data-f="${campo}" data-num data-re aria-label="Treinamento"><option value="0" ${g === 0 ? 'selected' : ''}>—</option><option value="1" ${g === 1 ? 'selected' : ''}>Treinado</option><option value="2" ${g === 2 ? 'selected' : ''}>Mestre</option></select>`;

  function ficha(h, estado) {
    const d = X.derivados(h), aba = estado.aba || 'combate';
    const pode = HB.P.podeEditarHeroi(h), dono = h.dono === HB.P.eu();
    const camps = HB.P.campanhasDoHeroi(h).filter(HB.P.ehMembro);
    const div = X.DIVISOES.find(x => x.n === (h.divisao | 0)), part = X.PARTIDAS[h.partida];
    const sobraAttr = d.pontosAttr - d.gastos, sobraAfin = d.afinTotal - d.afinGasta;
    const treinadas = X.PERICIAS.filter(p => ((h.pericias || {})[p.id] || {}).grau).length;
    const pend = [];
    if (!h.divisao) pend.push('escolha a divisão');
    if (!part) pend.push('escolha o Ponto de Partida');
    if (sobraAttr > 0) pend.push(`distribua ${sobraAttr} ponto${sobraAttr > 1 ? 's' : ''} de atributo`);
    if (sobraAttr < 0) pend.push(`${-sobraAttr} ponto${sobraAttr < -1 ? 's' : ''} de atributo acima do total`);
    if (sobraAfin > 0) pend.push(`distribua ${sobraAfin} de Afinidade nos Caminhos`);
    if (X.TODOS.some(a => X.val(h, a) > d.limite)) pend.push(`atributo acima do limite ${d.limite}`);
    return `<section class="pagina ficha sh ${pode ? '' : 'leitura'}" data-doc="herois:${esc(h.id)}">
      ${pode ? '' : `<p class="faixa">Ficha de ${esc(HB.A.nome(h.dono))}. Você pode ver e rolar, mas só o dono e o mestre da campanha mudam os números.</p>`}
      <div class="ficha-topo">
        <label class="foto-troca" title="Trocar foto">${UI.foto(h.foto, h.nome, 'grande')}<input type="file" accept="image/*" data-foto hidden><span>Trocar foto</span></label>
        <div class="ficha-ident">
          <label class="campo linha"><span>Shinigami</span><input id="s-nome" data-f="nome" value="${esc(h.nome)}"></label>
          <label class="campo linha"><span>Jogador</span><input id="s-jogador" data-f="jogador" value="${esc(h.jogador || '')}"></label>
          <div class="ficha-sel tres">
            <label class="campo"><span>Nível</span><input id="s-nivel" type="number" min="1" max="20" data-f="nivel" data-re value="${d.n}"></label>
            <label class="campo"><span>Divisão</span><select id="s-divisao" data-f="divisao" data-num data-re><option value="0">Escolha…</option>${X.DIVISOES.map(x => `<option value="${x.n}" ${x.n === (h.divisao | 0) ? 'selected' : ''}>${X.nomeDivisao(x.n)}</option>`).join('')}</select></label>
            <label class="campo"><span>Ponto de Partida</span><select id="s-partida" data-f="partida" data-re><option value="">Escolha…</option>${Object.entries(X.PARTIDAS).map(([k, v]) => `<option value="${k}" ${k === h.partida ? 'selected' : ''}>${v.nome}</option>`).join('')}</select></label>
          </div>
        </div>
        <div class="ficha-acoes">${camps.map(c => `<a class="chip-link" href="#campanha-${esc(c.id)}">${esc(c.nome)}</a>`).join('')}
          ${dono || !h.dono ? '<button class="btn pequeno" data-act="duplicar-heroi">Duplicar</button><button class="btn pequeno perigo-txt" data-act="apagar-heroi">Apagar</button>' : ''}</div>
      </div>
      <div class="ficha-fixa" aria-hidden="true"><b>${esc(h.nome)}</b>${UI.barraMini('pv', pvAtual(h, d), d.pvMax)}${UI.barraMini('mana', manaAtual(h, d), d.manaMax)}<span>Def ${d.defesa}</span></div>
      ${pend.length ? `<p class="pendente">Para fechar a ficha: ${esc(pend.join(' · '))}.</p>` : ''}
      <div class="ficha-grade">
        <div class="col-esq">
          ${hexagono(h, d.limite)}
          <div class="recursos"><h4>Vida</h4>${UI.barra('pv', pvAtual(h, d), d.pvMax, 'heroi:' + h.id)}<h4>Reiryoku</h4>${UI.barra('mana', manaAtual(h, d), d.manaMax, 'heroi:' + h.id)}</div>
          <div class="defesa-linha">
            <div class="escudo"><b>${d.defesa}</b><small>Defesa</small></div>
            <div class="defesa-conta">10 + ${Math.floor(d.n / 2)} (nível) + <select id="s-defattr" data-f="defAttr" data-re aria-label="Atributo da defesa"><option value="DES" ${d.defAttr === 'DES' ? 'selected' : ''}>DES ${sn(X.val(h, 'DES'))}</option><option value="FOR" ${d.defAttr === 'FOR' ? 'selected' : ''}>FOR ${sn(X.val(h, 'FOR'))}</option></select>
              <label class="campo mini"><span>Outros</span><input id="s-defextra" type="number" data-f="defExtra" data-re value="${h.defExtra | 0}"></label></div>
          </div>
          <div class="numeros-sh">
            <div><small>Bônus de treino</small><b>+${d.bt}</b></div><div><small>Atenção</small><b>${d.atencao}</b></div>
            <div><small>Deslocamento</small><b>${d.desloc} m</b></div><div><small>Dureza</small><b>${d.dureza}</b></div>
            <div><small>CD de Classe (${d.cdAttr})</small><b>${d.cdClasse}</b></div><div><small>CD de Kido (${d.kidoAttr})</small><b>${d.cdKido}</b></div>
          </div>
          <div class="bloco quebras"><div class="bloco-topo"><h3>Destino</h3></div>
            <div class="q-linha"><span>Quebras</span>${[1, 2, 3].map(i => `<button class="quebra ${i <= (h.quebras | 0) ? 'on' : ''}" data-act="sh-quebra" data-v="${i}" aria-label="Quebra ${i}">${i <= (h.quebras | 0) ? '✕' : ''}</button>`).join('')}</div>
            <div class="q-linha"><span>Convicção</span>${passo('conviccao', h.conviccao | 0, 'Convicção')}</div>
            <p class="dica">Três Quebras destroem o destino. Um descanso longo tira uma.</p></div>
          <div class="condicoes" aria-label="Condições">${X.CONDICOES.map(x => `<button class="cond ${(h.condicoes || []).includes(x) ? 'on' : ''}" data-act="condicao" data-v="${x}" aria-pressed="${(h.condicoes || []).includes(x)}">${x}</button>`).join('')}</div>
        </div>

        <div class="col-meio">
          <div class="bloco"><div class="bloco-topo"><h3>Atributos</h3><span class="pontos ${sobraAttr < 0 ? 'ruim' : sobraAttr === 0 ? 'ok' : ''}">${d.gastos} / ${d.pontosAttr} pts · limite ${d.limite}</span></div>
            <div class="tabela-rolagem"><table class="tabela-attr"><tbody>${X.ATRIBUTOS.map(a => `<tr><th scope="row">${a.nome}</th><td>${passo('atributos.' + a.id, sn(X.val(h, a.id)), a.nome)}</td>
              <td><button class="btn-dado" data-act="rolar-attr" data-attr="${esc(a.id)}">1d20 ${sn(X.val(h, a.id))}</button></td></tr>`).join('')}</tbody></table></div>
            <p class="dica">7 pontos iniciais + 3 da divisão${div ? ` (${esc(div.nota || div.attrs.map(X.nomeAttr).join(' e '))}, máx. 2 no mesmo)` : ''} + 2 nos níveis 3, 6, 9, 12, 15 e 18. Na criação, ninguém passa de 4.</p></div>
          <div class="bloco"><div class="bloco-topo"><h3>Testes de resistência</h3></div>
            <div class="tabela-rolagem"><table class="tabela-attr"><tbody>${X.TRS.map(t => { const b = X.bonusTR(h, t.id, d.bt); return `<tr><th scope="row">${t.nome} <small>${t.attr}</small></th>
              <td>${selGrau('trs.' + t.id + '.grau', b.grau, 'tr-' + t.id)}</td><td><input id="tr-o-${esc(t.id)}" class="num" type="number" data-f="trs.${esc(t.id)}.outros" data-re value="${((h.trs || {})[t.id] || {}).outros | 0}" aria-label="Outros"></td>
              <td><button class="btn-dado" data-act="rolar-attr" data-attr="${esc(t.id)}">1d20 ${sn(b.total)}</button></td></tr>`; }).join('')}</tbody></table></div>
            <p class="dica">Treinado em dois na criação. Mestre: um sucesso por 10 ou mais vira crítico.</p></div>
          <div class="bloco"><div class="bloco-topo"><h3>Perícias</h3><span class="sub">${treinadas} treinadas · mestre em até ${d.mestrias}</span></div>
            <div class="tabela-rolagem"><table class="tabela-attr pericias"><thead><tr><th>Perícia</th><th>Treino</th><th>Outros</th><th>Rolar</th></tr></thead><tbody>
            ${X.PERICIAS.map(p => { const b = X.bonusPericia(h, p.id, d.bt); return `<tr class="${b.bloqueada ? 'bloq' : ''}"><th scope="row">${p.nome}${p.treino ? '*' : ''} <small>${p.attr}</small></th>
              <td>${selGrau('pericias.' + p.id + '.grau', b.grau, 'pe-' + p.id)}</td><td><input id="pe-o-${esc(p.id)}" class="num" type="number" data-f="pericias.${esc(p.id)}.outros" data-re value="${((h.pericias || {})[p.id] || {}).outros | 0}" aria-label="Outros"></td>
              <td><button class="btn-dado" data-act="rolar-attr" data-attr="${esc(p.id)}" ${b.bloqueada ? 'title="Exige treinamento"' : ''}>${sn(b.total)}</button></td></tr>`; }).join('')}</tbody></table></div>
            <p class="dica">* exige treinamento. Três perícias na criação, mais as da divisão (${div && div.pericias ? esc(div.pericias.map(id => X.PERICIAS.find(p => p.id === id).nome).join(', ')) : 'duas à escolha'}) e mais INT ou SAB.</p></div>
          <div class="bloco"><div class="bloco-topo"><h3>Caminhos do Zankensoki</h3><span class="pontos ${sobraAfin < 0 ? 'ruim' : sobraAfin === 0 ? 'ok' : ''}">${d.afinGasta} / ${d.afinTotal}</span></div>
            <div class="caminhos">${X.CAMINHOS.map(c => { const n = (h.afinidades || {})[c.id] | 0; return `<div class="caminho"><b>${c.nome}</b>${passo('afinidades.' + c.id, n, c.nome)}<span class="grad">${X.graduacao(n)}</span></div>`; }).join('')}</div>
            <p class="dica">O Ponto de Partida dá +1 em dois Caminhos; cada nível dá um Ponto de Progressão (+1 em um Caminho). Máximo 10.</p></div>
          <div class="bloco"><div class="bloco-topo"><h3>Origem</h3></div>
            ${div ? `<p class="regra"><b>${X.nomeDivisao(div.n)}.</b> ${esc(div.car)}</p>` : '<p class="regra">Sem divisão.</p>'}
            ${part ? `<p class="regra"><b>${part.nome}.</b> ${part.pv} de vida inicial + CON. ${esc(part.chave)}. ${esc(part.bonus)}</p>` : ''}
            <div class="escolhas">
              <label class="campo"><span>Atributo da CD de Classe</span><select id="s-cdattr" data-f="cdAttr" data-re>${X.TODOS.map(a => `<option ${a === d.cdAttr ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
              <label class="campo"><span>Atributo do Kido</span><select id="s-kidoattr" data-f="kidoAttr" data-re>${['INT', 'SAB', 'ESP'].map(a => `<option ${a === d.kidoAttr ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
              <label class="campo mini"><span>Vida extra</span><input id="s-pvextra" type="number" data-f="pvExtra" data-re value="${h.pvExtra | 0}"></label>
              <label class="campo mini"><span>Reiryoku extra</span><input id="s-manaextra" type="number" data-f="manaExtra" data-re value="${h.manaExtra | 0}"></label>
              <label class="campo mini"><span>Dureza</span><input id="s-dureza" type="number" data-f="dureza" data-re value="${h.dureza | 0}"></label>
            </div></div>
        </div>

        <div class="col-dir">
          <div class="abas" role="tablist">${[['combate', 'Combate'], ['zanpakuto', 'Zanpakuto'], ['kidos', 'Kidos'], ['habilidades', 'Habilidades'], ['inventario', 'Inventário'], ['pessoal', 'Pessoal']]
            .map(([k, n]) => `<button role="tab" aria-selected="${aba === k}" class="aba ${aba === k ? 'ativa' : ''}" data-act="aba" data-aba="${k}">${n}</button>`).join('')}</div>
          <div class="aba-corpo">${abaFicha(h, d, aba, estado)}</div>
        </div>
      </div></section>`;
  }

  function seletorMulti(estado) {
    const m = estado.multi | 0;
    return `<div class="multi" role="group" aria-label="Ataque do turno">${['1º ataque', '2º (−5)', '3º+ (−10)'].map((t, i) => `<button class="chip ${m === i ? 'on' : ''}" data-act="sh-multi" data-v="${i}">${t}</button>`).join('')}</div>`;
  }
  function lista(o, campo, rotuloNovo, item, dica) {
    const xs = o[campo] || [];
    return `${dica ? `<p class="dica">${esc(dica)}</p>` : ''}<div class="itens">${xs.map((x, i) => `<div class="item">${item(x, i)}<button class="icone apagar-item" data-act="remover-item" data-campo="${campo}" data-i="${i}" aria-label="Remover">✕</button></div>`).join('') || '<p class="vazio">Nada aqui ainda.</p>'}</div>
      <button class="btn largo" data-act="sh-adicionar" data-campo="${campo}">${esc(rotuloNovo)}</button>`;
  }

  function abaFicha(h, d, aba, estado) {
    if (aba === 'combate') {
      const atq = ataquesDe(h);
      return `<form class="rolar-livre" data-act-submit="rolar-livre"><label class="sr" for="livre-${esc(h.id)}">Rolar dados</label><input id="livre-${esc(h.id)}" name="expr" placeholder="Rolar dados: 1d20+5" autocomplete="off"><button class="btn">Rolar</button></form>
        ${seletorMulti(estado)}
        <div class="itens"><div class="item ataque zan"><div class="item-topo"><b class="item-nome">${esc(atq[0].nome)}</b><button class="btn pequeno primario" data-act="rolar-ataque" data-i="0">Atacar</button></div>
          <div class="ataque-resumo"><span><small>Acerto</small> 1d20 ${sn(atq[0].acerto)}</span><span><small>Dano</small> ${atq[0].dano} ${sn(atq[0].bonusDano)}</span><span><small>Crítico</small> ${atq[0].margem}${atq[0].margem < 20 ? '–20' : ''}</span></div>
          <small>${esc(atq[0].sub)} · ${esc(atq[0].tipoDano)}. Ajuste na aba Zanpakuto.</small></div>
        ${(h.ataques || []).map((a, i) => `<div class="item ataque"><div class="item-topo"><input id="sa-n-${i}" class="item-nome" data-f="ataques.${i}.nome" value="${esc(a.nome)}" placeholder="Nome do ataque"><button class="btn pequeno primario" data-act="rolar-ataque" data-i="${i + 1}">Atacar</button></div>
          <div class="ataque-campos">
            <label class="campo"><span>Tipo</span><select id="sa-t-${i}" data-f="ataques.${i}.tipo" data-re>${[['corpo', 'Corpo a corpo'], ['distancia', 'À distância'], ['espiritual', 'Espiritual']].map(([k, n]) => `<option value="${k}" ${k === a.tipo ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
            <label class="campo"><span>Atributo</span><select id="sa-a-${i}" data-f="ataques.${i}.attr" data-re>${X.TODOS.map(x => `<option ${x === (a.attr || 'FOR') ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
            <label class="campo"><span>Dano</span><input id="sa-d-${i}" data-f="ataques.${i}.dano" value="${esc(a.dano || '1d4')}" placeholder="1d6"></label>
            <label class="campo mini"><span>+ Dano</span><input id="sa-b-${i}" type="number" data-f="ataques.${i}.bonus" data-re value="${a.bonus | 0}"></label>
            <label class="campo mini"><span>+ Acerto</span><input id="sa-k-${i}" type="number" data-f="ataques.${i}.bonusAtk" data-re value="${a.bonusAtk | 0}"></label>
            <label class="campo mini"><span>Crítico</span><input id="sa-c-${i}" type="number" min="15" max="20" data-f="ataques.${i}.margem" data-re value="${a.margem | 0 || 20}"></label>
          </div>
          <div class="ataque-resumo"><span><small>Acerto</small> 1d20 ${sn(atq[i + 1].acerto)}</span><span><small>Dano</small> ${esc(atq[i + 1].dano)} ${sn(atq[i + 1].bonusDano)}</span></div>
          <input id="sa-o-${i}" data-f="ataques.${i}.obs" value="${esc(a.obs || '')}" placeholder="Tipo de dano, alcance, traços…">
          <button class="icone apagar-item" data-act="remover-item" data-campo="ataques" data-i="${i}" aria-label="Remover ataque">✕</button></div>`).join('')}</div>
        <button class="btn largo" data-act="sh-adicionar" data-campo="ataques">Novo ataque</button>
        <p class="dica">20 natural sobe um grau (erro vira acerto, acerto vira crítico); crítico dobra o dano. 1 natural é Desastre.</p>`;
    }
    if (aba === 'zanpakuto') {
      const z = h.zanpakuto || {}, f = X.FORMAS[z.forma] || X.FORMAS.katana;
      return `<label class="campo"><span>Nome do espírito</span><input id="z-nome" data-f="zanpakuto.nome" value="${esc(z.nome || '')}" placeholder="O nome que ela ainda não revelou"></label>
        <div class="escolhas">
          <label class="campo"><span>Forma selada</span><select id="z-forma" data-f="zanpakuto.forma" data-re>${Object.entries(X.FORMAS).map(([k, v]) => `<option value="${k}" ${k === (z.forma || 'katana') ? 'selected' : ''}>${v.nome}</option>`).join('')}</select></label>
          <label class="campo"><span>Tipo</span><select id="z-tipo" data-f="zanpakuto.tipo" data-re><option value="">Escolha…</option>${X.TIPOS_ZANPAKUTO.map(t => `<option ${t === z.tipo ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
          <label class="campo"><span>Estado</span><select id="z-estado" data-f="zanpakuto.estado" data-re>${[['selada', 'Selada'], ['shikai', 'Shikai'], ['bankai', 'Bankai']].map(([k, n]) => `<option value="${k}" ${k === (z.estado || 'selada') ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          <label class="campo mini"><span>Sintonia</span><input id="z-sint" type="number" data-f="zanpakuto.sintonia" data-re value="${(z.sintonia | 0) + (h.partida === 'esgrimista' ? 0 : 0)}"></label>
        </div>
        <p class="regra">${esc(f.nome)}: ${f.dano}${f.dano2 ? ' (' + f.dano2 + ' com duas mãos)' : ''} ${f.tipo.toLowerCase()}, crítico ${f.crit}${f.crit < 20 ? '–20' : ''}. ${esc(f.tracos)}.${h.partida === 'esgrimista' ? ' Esgrimista: +1 de Sintonia.' : ''}</p>
        <div class="escolhas">
          ${f.dano2 ? `<label class="interruptor"><input id="z-2m" type="checkbox" data-f="zanpakuto.duasMaos" ${z.duasMaos ? 'checked' : ''}><span>Empunhada com duas mãos</span></label>` : ''}
          <label class="campo mini"><span>+ Acerto</span><input id="z-atk" type="number" data-f="zanpakuto.bonusAtk" data-re value="${z.bonusAtk | 0}"></label>
          <label class="campo mini"><span>+ Dano</span><input id="z-dano" type="number" data-f="zanpakuto.bonusDano" data-re value="${z.bonusDano | 0}"></label>
        </div>
        <label class="campo"><span>Comando de liberação</span><input id="z-cmd" data-f="zanpakuto.comando" value="${esc(z.comando || '')}"></label>
        <label class="campo"><span>Shikai (forma, efeitos, técnicas)</span><textarea id="z-shikai" rows="5" data-f="zanpakuto.shikai">${esc(z.shikai || '')}</textarea></label>
        <label class="campo"><span>Bankai</span><textarea id="z-bankai" rows="5" data-f="zanpakuto.bankai">${esc(z.bankai || '')}</textarea></label>`;
    }
    if (aba === 'kidos') return lista(h, 'kidos', 'Novo kido', (k, i) => `<div class="item-topo"><input id="k-n-${i}" class="item-nome" data-f="kidos.${i}.nome" value="${esc(k.nome || '')}" placeholder="Hado nº 4: Byakurai">
        <label class="campo mini"><span>Reiryoku</span><input id="k-c-${i}" type="number" data-f="kidos.${i}.custo" value="${k.custo | 0}"></label><button class="btn pequeno" data-act="sh-usar-kido" data-i="${i}">Usar</button></div>
      <textarea id="k-d-${i}" rows="2" data-f="kidos.${i}.desc" placeholder="Ações, alcance, efeito, dano, TR…">${esc(k.desc || '')}</textarea>`,
      `Ataques espirituais usam 1d20 + ${d.kidoAttr} + treino. CD de Kido ${d.cdKido}. Usar desconta o Reiryoku.`);
    if (aba === 'habilidades') return lista(h, 'habilidades', 'Nova habilidade ou aptidão', (x, i) => `<div class="item-topo"><input id="hb-n-${i}" class="item-nome" data-f="habilidades.${i}.nome" value="${esc(x.nome || '')}" placeholder="Habilidade Chave do Zanjutsu"></div>
      <textarea id="hb-d-${i}" rows="2" data-f="habilidades.${i}.desc">${esc(x.desc || '')}</textarea>`, 'Habilidades de Caminho, Marcos de Progresso e Aptidões.');
    if (aba === 'inventario') return `<label class="campo mini"><span>Kan</span><input id="s-kan" type="number" data-f="kan" value="${h.kan | 0}"></label>` + lista(h, 'inventario', 'Novo item', (x, i) => `<div class="item-topo"><input id="iv-n-${i}" class="item-nome" data-f="inventario.${i}.nome" value="${esc(x.nome || '')}" placeholder="Item">
        <label class="campo mini"><span>Qtd</span><input id="iv-q-${i}" type="number" data-f="inventario.${i}.qtd" value="${x.qtd == null ? 1 : x.qtd}"></label></div><input id="iv-d-${i}" data-f="inventario.${i}.desc" value="${esc(x.desc || '')}" placeholder="Detalhes">`);
    const campos = [['aspectos', 'Aspectos', 3], ['filosofia', 'Filosofia', 2], ['ligacoes', 'Ligações', 3], ['objetivos', 'Objetivos', 3], ['historia', 'História', 5], ['ferimentos', 'Ferimentos', 2], ['notas', 'Anotações', 3]];
    return campos.map(([k, n, r]) => `<label class="campo"><span>${n}</span><textarea id="p-${k}" rows="${r}" data-f="pessoal.${k}">${esc((h.pessoal || {})[k] || '')}</textarea></label>`).join('');
  }

  // ---------- Ameaças (hollows) ----------
  const atr = (f, d, c, i, s, e) => ({ FOR: f, DES: d, CON: c, INT: i, SAB: s, ESP: e });
  const BESTIARIO = [
    { id: 'sh-faminto', base: true, sistema: 'sh', nome: 'Hollow Faminto', categoria: 'Hollow · Médio', nivel: 1, perfil: 1, atributos: atr(2, 2, 2, 0, 1, 1), pvMax: 32, manaMax: 6, defesa: 13, dureza: 0, percepcao: 3, cd: 13, trs: { fortitude: 3, reflexos: 3, vontade: 1 },
      ataques: [{ nome: 'Garras', acerto: 3, dano: '1d6+3', tipoDano: 'Cortante', margem: 20 }, { nome: 'Mordida', acerto: 3, dano: '1d8+2', tipoDano: 'Perfurante', margem: 20, obs: 'Agarra o alvo em um crítico' }], poderes: [],
      desc: 'Alma que perdeu o coração e só pensa em devorar outras. Ataca o alvo mais fraco e foge quando fica abaixo de um quarto da vida.' },
    { id: 'sh-espreitador', base: true, sistema: 'sh', nome: 'Hollow Espreitador', categoria: 'Hollow · Médio', nivel: 2, perfil: 1, atributos: atr(1, 3, 1, 0, 2, 1), pvMax: 41, manaMax: 8, defesa: 15, dureza: 0, percepcao: 5, cd: 13, trs: { fortitude: 1, reflexos: 5, vontade: 3 },
      ataques: [{ nome: 'Ferrão', acerto: 4, dano: '1d10+6', tipoDano: 'Perfurante', margem: 19 }], poderes: [{ nome: 'Camuflagem', custo: 2, desc: 'Fica invisível até atacar ou até o fim do próximo turno.' }],
      desc: 'Caça escondido nas sombras de becos e telhados. Sempre abre o combate pelo flanco.' },
    { id: 'sh-cuspidor', base: true, sistema: 'sh', nome: 'Hollow Cuspidor', categoria: 'Hollow · Grande', nivel: 3, perfil: 1, atributos: atr(2, 2, 3, 0, 0, 3), pvMax: 53, manaMax: 14, defesa: 14, dureza: 0, percepcao: 4, cd: 14, trs: { fortitude: 6, reflexos: 2, vontade: 4 },
      ataques: [{ nome: 'Patada', acerto: 4, dano: '1d10+7', tipoDano: 'Impacto', margem: 20 }, { nome: 'Cuspe ácido', acerto: 5, dano: '2d6+7', tipoDano: 'Ácido', margem: 20, obs: '18 m; recarga 1d4 rodadas' }], poderes: [],
      desc: 'Corpo inchado de reiatsu corroída. Prefere ficar longe e derreter coberturas.' },
    { id: 'sh-colosso', base: true, sistema: 'sh', nome: 'Hollow Colosso', categoria: 'Hollow · Enorme', nivel: 5, perfil: 2, atributos: atr(4, 1, 4, 0, 2, 2), pvMax: 93, manaMax: 20, defesa: 16, dureza: 4, percepcao: 5, cd: 16, trs: { fortitude: 7, reflexos: 3, vontade: 5 },
      ataques: [{ nome: 'Punho esmagador', acerto: 7, dano: '2d8+11', tipoDano: 'Impacto', margem: 20, obs: 'Alvo faz TR de Fortitude (CD 16) ou fica Caído' }, { nome: 'Rajada de reiatsu', acerto: 6, dano: '2d8+9', tipoDano: 'Energético', margem: 20, obs: 'Linha de 18 m; 1 vez por cena' }], poderes: [],
      desc: 'Gigante de máscara rachada que atravessa prédios. Chefe para um grupo de nível 3 ou 4.' },
  ];
  function novoVilao() {
    return { sistema: 'sh', nome: 'Nova ameaça', categoria: 'Hollow · Médio', nivel: 1, perfil: 1, atributos: atr(2, 2, 2, 0, 1, 1), pvMax: 32, manaMax: 6, defesa: 13, dureza: 0, percepcao: 3, cd: 13, trs: { fortitude: 3, reflexos: 3, vontade: 1 }, ataques: [{ nome: 'Garras', acerto: 3, dano: '1d6+3', tipoDano: 'Cortante', margem: 20 }], poderes: [], desc: '' };
  }
  // Preenche os números pela tabela do Guia de Inimigos.
  function aplicarGuia(v, nivel, perfil) {
    const i = Math.max(1, Math.min(10, nivel | 0)) - 1, p = Math.max(0, Math.min(3, perfil | 0)), G = X.G;
    const con = X.val(v, 'CON'), [base, mult] = G.pv[i][p];
    v.nivel = i + 1; v.perfil = p;
    v.pvMax = base + mult * con; v.defesa = G.defesa[i][p]; v.cd = G.cd[i][p];
    v.trs = { fortitude: G.tr[i][Math.min(3, p + 1)], reflexos: G.tr[i][p], vontade: G.tr[i][Math.max(0, p - 1)] };
    v.percepcao = G.tr[i][p];
    (v.ataques || []).forEach((a, k) => { a.acerto = G.ataque[i][k === 0 ? p : Math.max(0, p - 1)]; a.dano = G.dano[i][k === 0 ? p : Math.max(0, p - 1)]; });
    if (!v.ataques || !v.ataques.length) v.ataques = [{ nome: 'Ataque', acerto: G.ataque[i][p], dano: G.dano[i][p], tipoDano: 'Cortante', margem: 20 }];
  }
  function viloes() { return BESTIARIO.concat(S.lista('viloes').filter(v => HB.Sistemas.doSistema(v, 'sh'))); }
  function listaViloes(estado, modoEscolha) {
    const busca = (estado.busca || '').toLowerCase(), filtro = estado.filtro || 'todos';
    const xs = viloes().filter(v => (!busca || v.nome.toLowerCase().includes(busca)) && (filtro === 'todos' || (filtro === 'meus' ? !v.base && v.dono === HB.P.eu() : v.base)))
      .sort((a, b) => (a.nivel | 0) - (b.nivel | 0));
    return `<div class="filtros" role="tablist">${[['todos', 'Todas'], ['base', 'Bestiário base'], ['meus', 'Minhas ameaças']].map(([k, n]) => `<button class="aba ${filtro === k ? 'ativa' : ''}" data-act="filtro" data-v="${k}">${n}</button>`).join('')}</div>
      <label class="busca"><span class="sr">Buscar ameaça</span><input id="busca-viloes" data-busca placeholder="Buscar ameaça" value="${esc(estado.busca || '')}"></label>
      <div class="lista-viloes">${xs.map(v => `<article class="cartao-vilao">${UI.foto(v.foto, v.nome)}
        <div class="cv-info"><h3>${esc(v.nome)}</h3><p><b>Nível ${v.nivel | 0 || 1}</b> · ${esc(v.categoria || 'Ameaça')}</p><p class="cv-stats">PV ${v.pvMax | 0} · Def ${v.defesa | 0}${v.dureza ? ' · Dureza ' + v.dureza : ''}${v.base ? ' · <span class="selo">Base</span>' : ''}</p></div>
        <div class="cv-acoes">${modoEscolha ? `<button class="btn pequeno" data-act="ver-vilao" data-id="${esc(v.id)}">Ficha</button><button class="btn pequeno primario" data-act="add-vilao-combate" data-id="${esc(v.id)}">Adicionar</button>` : `<a class="btn pequeno primario" href="#vilao-${esc(v.id)}">Ficha</a>`}</div></article>`).join('') || '<p class="vazio">Nenhuma ameaça com esse filtro.</p>'}</div>`;
  }
  function paginaViloes(estado) {
    return `<section class="pagina"><div class="pagina-topo"><div><h1 class="titulo-hq">Ameaças</h1><p class="sub">Hollows e outros inimigos, pelo Guia de Inimigos</p></div><button class="btn primario" data-act="novo-vilao">Nova ameaça</button></div>
      <p class="faixa">Para usar uma ameaça em jogo, abra o Escudo do Mestre da campanha, crie um combate e adicione a ameaça.</p>${listaViloes(estado)}</section>`;
  }
  function fichaVilao(v, estado) {
    const so = !HB.P.podeEditarVilao(v), dis = so ? 'disabled' : '', c = combatente(v);
    const num = (f, rot, val_) => `<label class="campo mini"><span>${rot}</span><input id="sv-${f.replace(/\./g, '-')}" type="number" data-f="${f}" data-re value="${val_ | 0}" ${dis}></label>`;
    return `<section class="pagina ficha vilao sh ${so ? 'leitura' : ''}" ${so ? '' : `data-doc="viloes:${esc(v.id)}"`}>
      <div class="ficha-topo"><label class="foto-troca">${UI.foto(v.foto, v.nome, 'grande')}${so ? '' : '<input type="file" accept="image/*" data-foto hidden><span>Trocar foto</span>'}</label>
        <div class="ficha-ident"><label class="campo linha"><span>Ameaça</span><input id="sv-nome" data-f="nome" value="${esc(v.nome)}" ${dis}></label>
          <label class="campo linha"><span>Categoria</span><input id="sv-cat" data-f="categoria" value="${esc(v.categoria || '')}" placeholder="Hollow · Grande" ${dis}></label></div>
        <div class="ficha-acoes">${so ? `<button class="btn pequeno primario" data-act="duplicar-vilao">${v.base ? 'Duplicar para editar' : 'Duplicar'}</button>` : '<button class="btn pequeno" data-act="duplicar-vilao">Duplicar</button><button class="btn pequeno perigo-txt" data-act="apagar-vilao">Apagar</button>'}</div></div>
      ${so ? `<p class="faixa">${v.base ? 'Ameaça do bestiário base.' : 'Criada por ' + esc(HB.A.nome(v.dono)) + '.'} Duplique para mudar os números.</p>` : `<div class="guia"><b>Guia de Inimigos</b>
        <label class="campo mini"><span>Nível</span><input id="sv-gnivel" type="number" min="1" max="10" value="${v.nivel | 0 || 1}"></label>
        <label class="campo"><span>Perfil</span><select id="sv-gperfil">${X.PERFIS.map((p, i) => `<option value="${i}" ${i === (v.perfil | 0) ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
        <button class="btn pequeno" data-act="sh-guia">Preencher pela tabela</button><span class="dica">Vida, Defesa, TRs, acerto, dano e CD do nível.</span></div>`}
      <div class="ficha-grade">
        <div class="col-esq">${hexagono(v, X.limiteInimigo(v.nivel | 0 || 1))}
          <div class="vilao-numeros">${num('nivel', 'Nível', v.nivel || 1)}${num('pvMax', 'Vida', v.pvMax)}${num('manaMax', 'Reiryoku', v.manaMax)}${num('defesa', 'Defesa', v.defesa)}${num('dureza', 'Dureza', v.dureza)}${num('cd', 'CD', v.cd)}</div></div>
        <div class="col-meio">
          <div class="bloco"><div class="bloco-topo"><h3>Atributos</h3><span class="sub">limite ${X.limiteInimigo(v.nivel | 0 || 1)}</span></div>
            <div class="tabela-rolagem"><table class="tabela-attr"><tbody>${X.ATRIBUTOS.map(a => `<tr><th scope="row">${a.nome}</th><td>${so ? sn(X.val(v, a.id)) : `<input id="sv-a-${esc(a.id)}" class="num" type="number" data-f="atributos.${esc(a.id)}" data-re value="${X.val(v, a.id)}">`}</td><td><button class="btn-dado" data-act="rolar-attr" data-attr="${esc(a.id)}">1d20 ${sn(X.val(v, a.id))}</button></td></tr>`).join('')}</tbody></table></div></div>
          <div class="bloco"><div class="bloco-topo"><h3>Testes</h3></div>
            <div class="tabela-rolagem"><table class="tabela-attr"><tbody>${X.TRS.map(t => `<tr><th scope="row">${t.nome}</th><td>${so ? sn((v.trs || {})[t.id] | 0) : `<input id="sv-t-${esc(t.id)}" class="num" type="number" data-f="trs.${esc(t.id)}" data-re value="${(v.trs || {})[t.id] | 0}">`}</td><td><button class="btn-dado" data-act="rolar-attr" data-attr="${esc(t.id)}">1d20 ${sn((v.trs || {})[t.id] | 0)}</button></td></tr>`).join('')}
              <tr><th scope="row">Percepção</th><td>${so ? sn(v.percepcao | 0) : `<input id="sv-per" class="num" type="number" data-f="percepcao" data-re value="${v.percepcao | 0}">`}</td><td><button class="btn-dado" data-act="rolar-attr" data-attr="percepcao">1d20 ${sn(v.percepcao | 0)}</button></td></tr></tbody></table></div></div>
          <div class="bloco"><div class="bloco-topo"><h3>Descrição</h3></div><textarea id="sv-desc" rows="5" data-f="desc" ${dis}>${esc(v.desc || '')}</textarea></div>
        </div>
        <div class="col-dir">
          <div class="abas">${[['combate', 'Ataques'], ['poderes', 'Habilidades']].map(([k, n]) => `<button class="aba ${(estado.aba || 'combate') === k ? 'ativa' : ''}" data-act="aba" data-aba="${k}">${n}</button>`).join('')}</div>
          <div class="aba-corpo ${so ? 'so-leitura' : ''}">${(estado.aba || 'combate') === 'poderes'
            ? lista(v, 'poderes', 'Nova habilidade', (p, i) => `<div class="item-topo"><input id="svp-n-${i}" class="item-nome" data-f="poderes.${i}.nome" value="${esc(p.nome || '')}" ${dis}><label class="campo mini"><span>Reiryoku</span><input id="svp-c-${i}" type="number" data-f="poderes.${i}.custo" value="${p.custo | 0}" ${dis}></label></div><textarea id="svp-d-${i}" rows="2" data-f="poderes.${i}.desc" ${dis}>${esc(p.desc || '')}</textarea>`)
            : `${seletorMulti(estado)}<div class="itens">${(v.ataques || []).map((a, i) => `<div class="item ataque"><div class="item-topo"><input id="sva-n-${i}" class="item-nome" data-f="ataques.${i}.nome" value="${esc(a.nome || '')}" ${dis}><button class="btn pequeno primario" data-act="rolar-ataque" data-i="${i}">Atacar</button></div>
                <div class="ataque-campos"><label class="campo mini"><span>Acerto</span><input id="sva-k-${i}" type="number" data-f="ataques.${i}.acerto" data-re value="${a.acerto | 0}" ${dis}></label>
                  <label class="campo"><span>Dano</span><input id="sva-d-${i}" data-f="ataques.${i}.dano" value="${esc(a.dano || '')}" ${dis}></label>
                  <label class="campo"><span>Tipo</span><select id="sva-t-${i}" data-f="ataques.${i}.tipoDano" ${dis}>${X.TIPOS_DANO.map(t => `<option ${t === a.tipoDano ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
                  <label class="campo mini"><span>Crítico</span><input id="sva-c-${i}" type="number" data-f="ataques.${i}.margem" data-re value="${a.margem | 0 || 20}" ${dis}></label></div>
                <input id="sva-o-${i}" data-f="ataques.${i}.obs" value="${esc(a.obs || '')}" placeholder="Alcance, recarga, efeito…" ${dis}>
                <button class="icone apagar-item" data-act="remover-item" data-campo="ataques" data-i="${i}" aria-label="Remover">✕</button></div>`).join('') || '<p class="vazio">Sem ataques.</p>'}</div>
              <button class="btn largo" data-act="sh-adicionar" data-campo="ataques">Novo ataque</button>`}</div>
        </div></div></section>`;
  }

  function regras() {
    const t = (cab, linhas) => `<div class="tabela-rolagem"><table class="tabela-regra"><thead><tr>${cab.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${linhas.map(l => `<tr>${l.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    return `<section class="pagina regras"><div class="pagina-topo"><div><h1 class="titulo-hq">Regras</h1><p class="sub">Resumo do Livro dos Ceifadores (v0.7b, playtest). Para textos completos de habilidades, kidos e zanpakuto, consulte o livro.</p></div>${HB.botaoLivro('sh')}</div>
      <div class="regras-grade">
      <article class="bloco"><h2>Testes</h2><p>Role <b>1d20</b> + atributo + bônus de treinamento (se treinado) + outros, contra a CD: 10 média, 15 difícil, 20 desafiadora, 30 magistral, 40 quase impossível. Mestre numa perícia soma 1,5× o bônus de treinamento.</p>
        ${t(['Nível', 'Bônus de treinamento'], [['1–4', '+2'], ['5–8', '+3'], ['9–12', '+4'], ['13–16', '+5'], ['17–20', '+6']])}</article>
      <article class="bloco"><h2>Personagem</h2><p>Atributos começam em 0; 7 pontos para distribuir, mais 3 da divisão. Máximo 4 na criação, 5 depois e 10 a partir do nível 10. Vida inicial = Ponto de Partida + CON. Reiryoku = 5 + ESP. Defesa = 10 + metade do nível + DES ou FOR. Atenção = 10 + Percepção. Deslocamento 9 m.</p></article>
      <article class="bloco largo"><h2>Pontos de Partida</h2>${t(['Partida', 'Vida', 'Afinidades', 'Bônus'], Object.values(X.PARTIDAS).map(p => [p.nome, p.pv + ' + CON', p.afin.map(a => X.CAMINHOS.find(c => c.id === a).nome).join(' e '), p.bonus]))}</article>
      <article class="bloco largo"><h2>Divisões da Gotei 13</h2>${t(['Divisão', 'Atributos', 'Característica'], X.DIVISOES.map(x => [X.nomeDivisao(x.n), x.nota || x.attrs.map(X.nomeAttr).join(' e '), x.car]))}</article>
      <article class="bloco"><h2>Combate</h2><p>Iniciativa: teste de Percepção; empate vai para quem tem mais Destreza. Cada rodada dá 3 ações e 1 reação (Turno Rápido: age primeiro com 2 ações). Ataque: 1d20 + FOR (DES com fineza ou à distância; INT/SAB/ESP para kidos) + treino contra a Defesa. Segundo ataque no turno −5, terceiro −10 (armas leves −4/−8).</p>
        <p>20 natural sobe um grau; crítico dobra o dano. 1 natural é Desastre: erra e os inimigos ao alcance podem atacar como reação. Dano = dado + atributo + bônus − Dureza.</p></article>
      <article class="bloco"><h2>Ferimentos e destino</h2><p>Em 0 de vida o personagem fica Inconsciente e recebe uma Quebra e um Ferimento. Três Quebras destroem o destino. Um descanso longo remove uma Quebra.</p>
        ${t(['Nível', 'Vida', 'Reiryoku'], [['1', 'Partida + CON', '5 + ESP'], ['2–4', '+5', '+3'], ['5', '+5 + CON', '+3 + ESP'], ['6–8', '+5', '+3'], ['9', '+6 + CON', '+3 + ESP'], ['10–16', '+6 (+CON no 13)', '+3 (+ESP no 13)'], ['17–20', '+7 (+CON no 17)', '+3 (+ESP no 17)']])}</article>
      <article class="bloco"><h2>Caminhos</h2><p>Zanjutsu, Hakuda, Hoho e Kido. Afinidade 1–2 Aprendiz, 3–4 Iniciado, 5–6 Intermediário, 7–9 Avançado, 10 Mestre. Cada Graduação nova dá um Marco de Progresso, se você tiver a Habilidade Chave do Caminho.</p></article>
      </div></section>`;
  }

  HB.Sistemas.registrar({
    id: 'sh', nome: 'Shinigamis & Hollows', sub: 'Livro dos Ceifadores · sistema d20',
    descricao: 'Ceifadores da Gotei 13 contra hollows. Seis atributos, perícias, testes de resistência, Caminhos do Zankensoki, zanpakuto com shikai e bankai, kidos e Quebras do destino.',
    livro: { pdf: 'livros/shinigamis-e-hollows-livro-dos-ceifadores-v0.7b.pdf', titulo: 'Livro dos Ceifadores v0.7b (playtest)', tamanho: '17 MB',
      creditos: 'Shinigamis & Hollows é um projeto gratuito de fãs, de Setsugiri e equipe, baseado em Bleach, de Tite Kubo.' },
    rotulos: { personagens: 'Personagens', personagem: 'shinigami', novo: 'Novo shinigami', ameacas: 'Ameaças', ameaca: 'ameaça', novaAmeaca: 'Nova ameaça', recurso: 'Reiryoku' },
    iniciativa: 'rolada',
    temReputacao: false,
    condicoes: X.CONDICOES,
    ganchoAttr: { INT: 'INT', AGI: 'furtividade' },
    dadosRapidos: [4, 6, 8, 10, 12, 20, 100].map(l => ({ rotulo: 'd' + l, expr: '1d' + l })).concat([{ rotulo: '2d20', sub: 'vantagem: fique com o maior', expr: '2d20' }]),
    novoPersonagem, nomeClasse,
    derivados: h => { const d = X.derivados(h); return { pvMax: d.pvMax, manaMax: d.manaMax, defesa: d.defesa }; },
    ficha, bestiario: BESTIARIO, novoVilao, fichaVilao, listaViloes, paginaViloes,
    combatente, teste, ataque, regras, aplicarGuia,
    rolarIniciativa(o) { const c = combatente(o); return HB.D.d(20) + c.iniBonus; },
    // Ponto de Partida novo: põe as afinidades iniciais se ainda estiverem zeradas.
    aoMudarCampo(o, campo) {
      if (campo === 'partida' && X.PARTIDAS[o.partida]) {
        const a = o.afinidades || {};
        if (!Object.values(a).some(v => v | 0)) { o.afinidades = {}; X.PARTIDAS[o.partida].afin.forEach(c => (o.afinidades[c] = 1)); }
      }
      if (campo === 'nivel') o.nivel = Math.max(1, Math.min(20, o.nivel | 0));
    },
  });
})(window.HB);
