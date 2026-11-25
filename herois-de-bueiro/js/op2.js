// Ordem Paranormal II · Teorias e Homebrews (Static, Ojimo, Portill & Vescose): regras, ficha, ameaças e ligação com o RPGHUB.
// Teste: rola o dado do atributo e o da perícia e SOMA os dois, mais os dados de bônus; contra DT (padrão 7).
(function (HB) {
  const UI = HB.UI, S = HB.S, esc = UI.esc;
  const DADOS = [4, 6, 8, 10, 12];                       // passos
  const dado = p => DADOS[Math.max(0, Math.min(4, p | 0))];
  const ATRIBUTOS = [{ id: 'FIS', nome: 'Físico', cat: 'fis' }, { id: 'EMO', nome: 'Emoção', cat: 'emo' }, { id: 'MEN', nome: 'Mente', cat: 'men' }];
  const CAT = { fis: 'Físicas', emo: 'Emocionais', men: 'Mentais' };
  const attrDaCat = { fis: 'FIS', emo: 'EMO', men: 'MEN' };
  const PERICIAS_INICIAIS = [
    ['Atletismo', 'fis'], ['Luta', 'fis'], ['Pontaria', 'fis'], ['Furtividade', 'fis'], ['Reflexos', 'fis'],
    ['Vontade', 'emo'], ['Intuição', 'emo'], ['Presença', 'emo'], ['Enganação', 'emo'], ['Fé', 'emo'],
    ['Investigação', 'men'], ['Ocultismo', 'men'], ['Medicina', 'men'], ['Tecnologia', 'men'], ['Atualidades', 'men'],
  ];
  const DT_PADRAO = 7;

  // Ocupações: habilidade + efeito automático quando dá para calcular.
  const OCUPACOES = {
    artista: { nome: 'Artista', hab: 'Foco Emocional', texto: 'Em um teste emocional, gaste 2 PD para receber +d4. Melhoria (1 ponto de perícia): +2 PD de custo e o dado sobe um passo (máx. d12).' },
    marcial: { nome: 'Artista Marcial', hab: 'Mão Pesada', texto: 'Proficiência com armas brancas e +2 de dano com elas.', danoBranca: 2 },
    assassino: { nome: 'Assassino', hab: 'Pronto pra Matar', texto: 'Proficiência com armas brancas; em um ataque com elas, gaste 3 PD para receber +d8. Melhoria: +1 PD de custo e o dado sobe um passo.' },
    atleta: { nome: 'Atleta', hab: 'Foco Físico', texto: 'Em um teste físico, gaste 2 PD para receber +d4. Melhoria: +2 PD de custo e o dado sobe um passo.' },
    cientista: { nome: 'Cientista', hab: 'Foco Mental', texto: 'Em um teste mental, gaste 2 PD para receber +d4. Melhoria: +2 PD de custo e o dado sobe um passo.' },
    desgarrado: { nome: 'Desgarrado', hab: 'Calejado', texto: '+1 PV, e mais 1 PV a cada nível.', pvNivel: 1 },
    religioso: { nome: 'Figura Religiosa', hab: 'Poder da Fé', texto: 'Uma perícia emocional à sua escolha sobe para d6.', pericia: 'emo' },
    medico: { nome: 'Médico', hab: 'Técnica Medicinal', texto: 'Efeitos que curam PV curam +1 (ou +1 por dado).' },
    militar: { nome: 'Militar', hab: 'Para Bellum', texto: 'Proficiência com armas de fogo e +2 de dano com elas.', danoFogo: 2 },
    operario: { nome: 'Operário', hab: 'Esforço & Suor', texto: 'Uma perícia física à sua escolha sobe para d6.', pericia: 'fis' },
    policial: { nome: 'Policial', hab: 'Linha de Tiro', texto: 'Proficiência com armas de fogo; em um ataque com elas, gaste 3 PD para receber +d8. Melhoria: +1 PD de custo e o dado sobe um passo.' },
    professor: { nome: 'Professor', hab: 'Mentoria', texto: 'Ao ajudar, teste a perícia usada contra DT 7; se passar, o ajudado troca um dos dados dele pela sua rolagem alta.' },
    escritorio: { nome: 'Profissional de Escritório', hab: 'Conhecimento Técnico', texto: 'Uma perícia mental à sua escolha sobe para d6.', pericia: 'men' },
    terapeuta: { nome: 'Terapeuta', hab: 'Técnica Terapêutica', texto: 'Efeitos que curam PD curam +1 (ou +1 por dado).' },
    universitario: { nome: 'Universitário', hab: 'Dedicação', texto: '+1 PD, e mais 1 PD a cada nível.', pdNivel: 1 },
  };
  // Perfis: habilidade única (nível 1) e habilidades de nível (4, 7, 10).
  const PERFIS = {
    analista: { nome: 'Analista', unica: ['Avaliação', 'Uma ação e 2 PD: observe um ser ou ambiente e receba 2d4 para usar em testes relativos a ele (até dois dados guardados). Melhoria: os dados sobem um passo, +2 PD de custo.'],
      nivel: [['Amor pela Descoberta', 'Ao examinar um ponto de interesse e receber informação nova, recupere 1 PD (melhoria: 2 PD).'], ['Olhar Infalível', 'Em um teste de examinar, gaste 2 PD para rolar de novo um dos dados (melhoria: 1 PD).'], ['Tempo para Pensar', 'Sendo o último a agir, gaste 2 PD para subir uma perícia um passo (melhoria: dois passos, vale para todos os testes).']] },
    executor: { nome: 'Executor', unica: ['Ímpeto', 'Barra de 3 espaços; cada falha em teste enche um. Gaste 1 para +d4 em um teste; 3 para subir um atributo um passo até o fim da cena. Melhoria: +1 espaço e as opções de 2 (+d10) e 5 (ação extra).'],
      nivel: [['Estoico', '+d4 em testes de trauma; na primeira vez na cena, recupera 6 PD (melhoria: dado sobe um passo, recupera 9).'], ['Incansável', 'Uma vez por cena de conflito, gaste 5 PV para uma ação extra (melhoria: 3 PV).'], ['Vou na Frente', '+d4 em testes de arrombar e segurar (melhoria: o dado sobe um passo).']] },
    vigilante: { nome: 'Vigilante', unica: ['Prontidão', 'No início de um conflito, gaste 3 PD para ganhar uma rodada agindo antes de todos. Melhoria: −1 PD por ponto gasto (mínimo 1).'],
      nivel: [['Acrobata', 'Ao esquivar, gaste 2 PD para subir o dado bônus de esquiva um passo (melhoria: 1 PD).'], ['Varredura Ampla', 'Ao investigar um ponto de interesse, escolha duas perícias e receba as informações de ambas (melhoria: três).'], ['Adaptar aos Imprevistos', 'Em uma falha crítica, role de novo o efeito da tabela e fique com o segundo (melhoria: escolha qualquer um).']] },
  };
  const CONDICOES = ['Abalado', 'Apavorado', 'Atordoado', 'Caído', 'Cego', 'Enlouquecendo', 'Fraco', 'Lento', 'Machucado', 'Sangrando', 'Inconsciente'];
  const AUMENTOS = [2, 5, 8], GRAUS = [3, 6, 9], HAB_NIVEL = [4, 7, 10];
  const ate = (lista, n) => lista.filter(x => x <= n).length;

  // ---------- Cálculos ----------
  const passoAttr = (o, a) => { const v = (o.passos || {})[a]; return v == null ? 1 : v | 0; }; // padrão d6
  function periciaEf(h, i) { // passo efetivo da perícia (bônus da ocupação incluído)
    const p = (h.pericias || [])[i]; if (!p) return 0;
    const oc = OCUPACOES[h.ocupacao];
    const esc_ = h.ocupEscolha;
    const bonus = oc && oc.pericia && esc_ !== '' && esc_ != null && +esc_ === i && p.cat === oc.pericia ? 1 : 0;
    return Math.min(4, (p.passo | 0) + bonus);
  }
  function derivados(h) {
    const n = Math.max(1, Math.min(10, h.nivel | 0 || 1)), oc = OCUPACOES[h.ocupacao] || {};
    const reduzidos = ATRIBUTOS.filter(a => passoAttr(h, a.id) === 0).length;
    const ptsAttr = 1 + Math.min(1, reduzidos) + ate(AUMENTOS, n);
    const gastoAttr = ATRIBUTOS.reduce((s, a) => s + Math.max(0, passoAttr(h, a.id) - 1), 0);
    const melhorias = Object.values(h.melhorias || {}).filter(Boolean).length;
    const ptsPer = 4 + dado(passoAttr(h, 'MEN')) / 2 + 7 * ate(GRAUS, n);
    const gastoPer = (h.pericias || []).reduce((s, p) => s + (p.passo | 0), 0) + melhorias;
    const distrib = 6 * n, gastoDist = (h.pvPontos | 0) + (h.pdPontos | 0);
    const pvMax = dado(passoAttr(h, 'FIS')) + (h.pvPontos | 0) + (oc.pvNivel ? n : 0) + (h.pvExtra | 0);
    const manaMax = dado(passoAttr(h, 'EMO')) + (h.pdPontos | 0) + (oc.pdNivel ? n : 0) + (h.manaExtra | 0);
    const r = { n, pvMax, manaMax, defesa: DT_PADRAO + (h.defExtra | 0), ptsAttr, gastoAttr, ptsPer, gastoPer, distrib, gastoDist, melhorias, limiteAttr: n === 1 && !ate(AUMENTOS, n) ? 2 : 4, impetoMax: 3 + (h.melhorias && h.melhorias['perfil-unica'] ? 1 : 0) };
    return HB.modoManual ? HB.modoManual(h, r) : r;
  }

  // ---------- Dados ----------
  const rolarD = l => ({ l, v: HB.D.d(l) });
  // Soma o dado do atributo, o da perícia e os dados de bônus.
  function testeSoma(quem, titulo, passoA, passoP, bonusPasso, dt, extraNota) {
    const base = [rolarD(dado(passoA))];
    if (passoP != null) base.push(rolarD(dado(passoP)));
    const soma = base.reduce((s, x) => s + x.v, 0);
    const bonus = bonusPasso ? [rolarD(dado(bonusPasso - 1))] : [];
    const total = soma + bonus.reduce((s, x) => s + x.v, 0);
    const falha = base.every(x => x.v === 1);
    const r = {
      tipo: 'teste', quem, titulo, formula: base.map(x => 'd' + x.l).join(' + ') + (bonus.length ? ' + d' + bonus[0].l : ''),
      dados: base.concat(bonus), bonus: 0, total, nota: [falha ? 'falha crítica (todos os dados em 1)' : '', extraNota].filter(Boolean).join(' · '),
    };
    if (dt != null) { r.alvoDef = dt; r.acertou = !falha && total >= dt; r.rotuloAlvo = 'DT'; }
    return r;
  }

  // ---------- Ataques e combate ----------
  const ehVilao = o => o.categoria !== undefined || !!o.base;
  function ataquesDe(o) {
    if (ehVilao(o)) return (o.ataques || []).map(a => ({ nome: a.nome || 'Ataque', pa: passoAttr(o, a.attr || 'FIS'), pp: a.passo | 0, dano: a.dano || '1d6', bonusDano: 0, obs: a.obs || '' }));
    const oc = OCUPACOES[o.ocupacao] || {};
    return (o.ataques || []).map(a => {
      const i = (o.pericias || []).findIndex(p => p.nome === a.pericia);
      const extra = a.tipo === 'branca' ? oc.danoBranca | 0 : a.tipo === 'fogo' ? oc.danoFogo | 0 : 0;
      return { nome: a.nome || 'Ataque', pa: passoAttr(o, a.attr || 'FIS'), pp: i >= 0 ? periciaEf(o, i) : null, pericia: a.pericia || '', dano: a.dano || '1d6', bonusDano: (a.bonus | 0) + extra, obs: a.obs || '' };
    });
  }
  function teste(o, id, opts = {}) {
    const quem = o.nome || '', bonus = opts.ajuste > 0 ? Math.min(5, opts.ajuste) : 0;
    const a = ATRIBUTOS.find(x => x.id === id);
    if (a) return testeSoma(quem, a.nome, passoAttr(o, id), ehVilao(o) ? (o.treino == null ? null : o.treino | 0) : null, bonus);
    if (id === 'iniciativa') return testeSoma(quem, 'Iniciativa', passoAttr(o, 'FIS'), ehVilao(o) ? o.treino | 0 : periciaEf(o, idxPericia(o, 'Reflexos')), 0);
    const i = +String(id).replace('p', ''); const p = (o.pericias || [])[i]; if (!p) return null;
    return testeSoma(quem, p.nome || 'Perícia', passoAttr(o, attrDaCat[p.cat] || 'FIS'), periciaEf(o, i), bonus);
  }
  const idxPericia = (o, nome) => (o.pericias || []).findIndex(p => p.nome === nome);
  function ataque(o, i, opts = {}) {
    const a = ataquesDe(o)[i]; if (!a) return null;
    const r = testeSoma(o.nome || '', a.nome, a.pa, a.pp, 0, opts.alvoDef == null ? null : opts.alvoDef, a.obs);
    r.tipo = 'ataque';
    const d = HB.SH.rolarExpr(a.dano);
    r.dano = { formula: a.dano + (a.bonusDano ? ' + ' + a.bonusDano : ''), dados: d.dados, total: Math.max(0, d.total + a.bonusDano) };
    if (r.acertou === false && !r.nota) r.nota = 'errou';
    return r;
  }
  function combatente(o) {
    const v = ehVilao(o), d = v ? null : derivados(o);
    const testes = ATRIBUTOS.map(a => ({ id: a.id, rotulo: a.nome, curto: a.id, texto: 'd' + dado(passoAttr(o, a.id)), mini: 'd' + dado(passoAttr(o, a.id)) }));
    if (!v) (o.pericias || []).forEach((p, i) => { if (periciaEf(o, i) > 0) testes.push({ id: 'p' + i, rotulo: p.nome, curto: p.nome.slice(0, 4).toUpperCase(), texto: 'd' + dado(passoAttr(o, attrDaCat[p.cat])) + '/d' + dado(periciaEf(o, i)), mini: 'd' + dado(periciaEf(o, i)) }); });
    return {
      pvMax: v ? o.pvMax | 0 : d.pvMax, manaMax: v ? o.manaMax | 0 : d.manaMax, def: v ? o.defesa | 0 || DT_PADRAO : d.defesa, dureza: v ? o.dureza | 0 : 0,
      agi: passoAttr(o, 'FIS'), ordemClasse: 0,
      linha: v ? (o.categoria || 'Ameaça') + (o.nex ? ' · NEX ' + o.nex + '%' : '') : nomeClasse(o),
      numeros: v ? [['DT para acertar', o.defesa | 0 || DT_PADRAO], ['Treino', 'd' + dado(o.treino | 0)]] : [['DT para acertar', d.defesa], ['Nível', d.n], ['NEX', (o.nex | 0) + '%']],
      testes, escudo: testes.slice(0, 6),
      ataques: ataquesDe(o).map(a => ({ nome: a.nome, sub: `d${dado(a.pa)}${a.pp != null ? ' + d' + dado(a.pp) : ''} · dano ${a.dano}${a.bonusDano ? ' + ' + a.bonusDano : ''}${a.obs ? ' · ' + a.obs : ''}` })),
      poderes: (v ? o.poderes || [] : (o.habilidades || []).filter(x => x.custo)).map(p => ({ nome: p.nome || 'Habilidade', custo: p.custo | 0, desc: p.desc || '' })),
      multiAtaque: false,
    };
  }

  // ---------- Ficha ----------
  function novoPersonagem() {
    return {
      sistema: 'op2', nome: 'Novo agente', jogador: '', foto: '', nivel: 1, nex: 5, ocupacao: '', ocupEscolha: '', perfil: '',
      passos: { FIS: 1, EMO: 1, MEN: 1 }, pericias: PERICIAS_INICIAIS.map(([nome, cat]) => ({ nome, cat, passo: 0 })),
      pvPontos: 0, pdPontos: 0, melhorias: {}, impeto: 0, ataques: [], habilidades: [], inventario: [], pessoal: {},
      pv: null, mana: null, condicoes: [], criado: Date.now(),
    };
  }
  const nomeClasse = h => ['Nível ' + (h.nivel | 0 || 1), (PERFIS[h.perfil] || {}).nome, (OCUPACOES[h.ocupacao] || {}).nome].filter(Boolean).join(' · ');
  const pvAtual = (h, d) => (h.pv == null ? d.pvMax : h.pv);
  const manaAtual = (h, d) => (h.mana == null ? d.manaMax : h.mana);
  const passo = (campo, valor, rot, max, min = 0) => `<div class="passo"><button class="seta" data-act="sh-passo" data-f="${campo}" data-d="-1" data-min="${min}" data-max="${max}" aria-label="Diminuir ${esc(rot)}">−</button><b>${valor}</b><button class="seta" data-act="sh-passo" data-f="${campo}" data-d="1" data-min="${min}" data-max="${max}" aria-label="Aumentar ${esc(rot)}">+</button></div>`;

  function trio(o) { // três atributos em triângulo
    const pos = [[160, 46], [262, 226], [58, 226]];
    return `<svg class="hexagono trio" viewBox="0 0 320 290" role="group" aria-label="Atributos">
      <polygon class="hex-anel" points="160,46 262,226 58,226"/>
      ${ATRIBUTOS.map((a, i) => `<g class="hex-no" data-act="rolar-attr" data-attr="${esc(a.id)}" tabindex="0" role="button" aria-label="Rolar ${a.nome}">
        <circle cx="${pos[i][0]}" cy="${pos[i][1]}" r="40"/><text x="${pos[i][0]}" y="${pos[i][1] + 2}" class="hex-dado">d${dado(passoAttr(o, a.id))}</text>
        <text x="${pos[i][0]}" y="${pos[i][1] + 22}" class="hex-sigla">${a.nome.toUpperCase()}</text></g>`).join('')}
      <text x="160" y="160" class="hex-centro">SOMA</text><text x="160" y="180" class="hex-centro-sub">atributo + perícia</text></svg>`;
  }
  function bonusBarra(estado) {
    const b = estado.ajuste | 0;
    return `<div class="ajuste" aria-label="Dado bônus da próxima rolagem"><span class="aj-rot">Dado bônus</span>
      ${[0, 1, 2, 3, 4, 5].map(i => `<button class="chip ${b === i ? 'on' : ''}" data-act="ajuste-fixo" data-v="${i}">${i ? '+d' + DADOS[i - 1] : 'nenhum'}</button>`).join('')}</div>`;
  }

  function ficha(h, estado) {
    const d = derivados(h), aba = estado.aba || 'combate';
    const pode = HB.P.podeEditarHeroi(h), dono = h.dono === HB.P.eu();
    const camps = HB.P.campanhasDoHeroi(h).filter(HB.P.ehMembro);
    const oc = OCUPACOES[h.ocupacao], pf = PERFIS[h.perfil];
    const sAttr = d.ptsAttr - d.gastoAttr, sPer = d.ptsPer - d.gastoPer, sDist = d.distrib - d.gastoDist;
    const pend = [];
    if (!pf) pend.push('escolha o perfil'); if (!oc) pend.push('escolha a ocupação');
    if (oc && oc.pericia && h.ocupEscolha === '') pend.push('escolha a perícia da ocupação');
    if (sAttr > 0) pend.push(`${sAttr} ponto${sAttr > 1 ? 's' : ''} de atributo`); if (sAttr < 0) pend.push(`${-sAttr} ponto de atributo a mais`);
    if (sPer > 0) pend.push(`${sPer} ponto${sPer > 1 ? 's' : ''} de perícia`); if (sPer < 0) pend.push(`${-sPer} ponto${sPer < -1 ? 's' : ''} de perícia a mais`);
    if (sDist > 0) pend.push(`${sDist} ponto${sDist > 1 ? 's' : ''} entre PV e PD`); if (sDist < 0) pend.push(`${-sDist} ponto${sDist < -1 ? 's' : ''} a mais entre PV e PD`);
    if (ATRIBUTOS.some(a => passoAttr(h, a.id) > d.limiteAttr)) pend.push('na criação nenhum atributo passa de d8');
    const cats = ['fis', 'emo', 'men'];
    return `<section class="pagina ficha op2 ${pode ? '' : 'leitura'}" data-doc="herois:${esc(h.id)}">
      ${pode ? '' : `<p class="faixa">Ficha de ${esc(HB.A.nome(h.dono))}. Você pode ver e rolar, mas só o dono e o mestre da campanha mudam os números.</p>`}
      <div class="ficha-topo">
        <label class="foto-troca" title="Trocar foto">${UI.foto(h.foto, h.nome, 'grande')}<input type="file" accept="image/*" data-foto hidden><span>Trocar foto</span></label>
        <div class="ficha-ident">
          <label class="campo linha"><span>Agente</span><input id="o-nome" data-f="nome" value="${esc(h.nome)}"></label>
          <label class="campo linha"><span>Jogador</span><input id="o-jogador" data-f="jogador" value="${esc(h.jogador || '')}"></label>
          <div class="ficha-sel quatro">
            <label class="campo"><span>Nível</span><input id="o-nivel" type="number" min="1" max="10" data-f="nivel" data-re value="${d.n}"></label>
            <label class="campo"><span>NEX %</span><input id="o-nex" type="number" min="0" max="99" step="5" data-f="nex" data-re value="${h.nex | 0}"></label>
            <label class="campo"><span>Perfil</span><select id="o-perfil" data-f="perfil" data-re><option value="">Escolha…</option>${Object.entries(PERFIS).map(([k, v]) => `<option value="${k}" ${k === h.perfil ? 'selected' : ''}>${v.nome}</option>`).join('')}</select></label>
            <label class="campo"><span>Ocupação</span><select id="o-ocup" data-f="ocupacao" data-re><option value="">Escolha…</option>${Object.entries(OCUPACOES).map(([k, v]) => `<option value="${k}" ${k === h.ocupacao ? 'selected' : ''}>${v.nome}</option>`).join('')}</select></label>
          </div></div>
        <div class="ficha-acoes">${camps.map(c => `<a class="chip-link" href="#campanha-${esc(c.id)}">${esc(c.nome)}</a>`).join('')}
          ${dono || !h.dono ? '<button class="btn pequeno" data-act="duplicar-heroi">Duplicar</button><button class="btn pequeno perigo-txt" data-act="apagar-heroi">Apagar</button>' : ''}</div>
      </div>
      <div class="ficha-fixa" aria-hidden="true"><b>${esc(h.nome)}</b>${UI.barraMini('pv', pvAtual(h, d), d.pvMax)}${UI.barraMini('mana', manaAtual(h, d), d.manaMax)}<span>NEX ${h.nex | 0}%</span></div>
      ${pend.length ? `<p class="pendente">Para fechar a ficha: ${esc(pend.join(' · '))}.</p>` : ''}
      <div class="ficha-grade">
        <div class="col-esq">
          ${trio(h)}
          <div class="recursos"><h4>Vida (PV)</h4>${UI.barra('pv', pvAtual(h, d), d.pvMax, 'heroi:' + h.id)}<h4>Determinação (PD)</h4>${UI.barra('mana', manaAtual(h, d), d.manaMax, 'heroi:' + h.id)}</div>
          <div class="bloco"><div class="bloco-topo"><h3>PV e PD</h3><span class="pontos ${sDist < 0 ? 'ruim' : sDist === 0 ? 'ok' : ''}">${d.gastoDist} / ${d.distrib}</span></div>
            <div class="q-linha"><span>Pontos em PV <small>(base d${dado(passoAttr(h, 'FIS'))} = ${dado(passoAttr(h, 'FIS'))})</small></span>${passo('pvPontos', h.pvPontos | 0, 'PV', 99)}</div>
            <div class="q-linha"><span>Pontos em PD <small>(base d${dado(passoAttr(h, 'EMO'))} = ${dado(passoAttr(h, 'EMO'))})</small></span>${passo('pdPontos', h.pdPontos | 0, 'PD', 99)}</div>
            <p class="dica">6 pontos no início e mais 6 a cada nível.</p></div>
          ${h.perfil === 'executor' ? `<div class="bloco impeto"><div class="bloco-topo"><h3>Ímpeto</h3></div><div class="slots">${Array.from({ length: d.impetoMax }, (_, i) => `<span class="slot ${i < (h.impeto | 0) ? 'on' : ''}">⚡</span>`).join('')}</div>${passo('impeto', h.impeto | 0, 'Ímpeto', d.impetoMax)}<p class="dica">Falhou num teste? Enche um espaço.</p></div>` : ''}
          <div class="condicoes" aria-label="Condições">${CONDICOES.map(x => `<button class="cond ${(h.condicoes || []).includes(x) ? 'on' : ''}" data-act="condicao" data-v="${x}" aria-pressed="${(h.condicoes || []).includes(x)}">${x}</button>`).join('')}</div>
        </div>
        <div class="col-meio">
          <div class="bloco"><div class="bloco-topo"><h3>Atributos</h3><span class="pontos ${sAttr < 0 ? 'ruim' : sAttr === 0 ? 'ok' : ''}">${d.gastoAttr} / ${d.ptsAttr} pts</span></div>
            <div class="tabela-rolagem"><table class="tabela-attr"><tbody>${ATRIBUTOS.map(a => `<tr><th scope="row">${a.nome}</th><td>${passo('passos.' + a.id, 'd' + dado(passoAttr(h, a.id)), a.nome, 4)}</td><td><button class="btn-dado" data-act="rolar-attr" data-attr="${esc(a.id)}">d${dado(passoAttr(h, a.id))}</button></td></tr>`).join('')}</tbody></table></div>
            <p class="dica">Todos começam em d6 com 1 ponto. Baixar um para d4 dá +1 ponto. Máximo d8 na criação e d12 com os aumentos dos níveis 2, 5 e 8.</p></div>
          ${bonusBarra(estado)}
          <div class="bloco"><div class="bloco-topo"><h3>Perícias</h3><span class="pontos ${sPer < 0 ? 'ruim' : sPer === 0 ? 'ok' : ''}">${d.gastoPer} / ${d.ptsPer} pts</span></div>
            ${cats.map(c => `<h4 class="cat-pericia">${CAT[c]} <small>(${ATRIBUTOS.find(a => a.cat === c).nome})</small></h4>
              <div class="tabela-rolagem"><table class="tabela-attr pericias"><tbody>${(h.pericias || []).map((p, i) => p.cat !== c ? '' : `<tr>
                <th scope="row"><input id="op-pn-${i}" class="nome-pericia" data-f="pericias.${i}.nome" value="${esc(p.nome)}" aria-label="Nome da perícia"></th>
                <td>${passo('pericias.' + i + '.passo', 'd' + dado(periciaEf(h, i)) + (periciaEf(h, i) !== (p.passo | 0) ? '*' : ''), p.nome, 4)}</td>
                <td><button class="btn-dado" data-act="rolar-attr" data-attr="p${i}">rolar</button></td>
                <td><button class="icone" data-act="remover-item" data-campo="pericias" data-i="${i}" aria-label="Remover perícia">✕</button></td></tr>`).join('')}</tbody></table></div>`).join('')}
            <div class="escolhas"><label class="campo"><span>Nova perícia</span><select id="op-nova-cat">${cats.map(c => `<option value="${c}">${CAT[c]}</option>`).join('')}</select></label><button class="btn pequeno" data-act="op-nova-pericia">Adicionar</button></div>
            <p class="dica">Toda perícia começa em d4; cada ponto sobe um passo. Pontos: 4 + metade do dado de Mente, mais 7 nos níveis 3, 6 e 9. Melhorar uma habilidade também custa 1 ponto. * bônus da ocupação.</p></div>
          <div class="bloco"><div class="bloco-topo"><h3>Ocupação e perfil</h3></div>
            ${oc ? `<p class="regra"><b>${esc(oc.nome)}: ${esc(oc.hab)}.</b> ${esc(oc.texto)}</p>${oc.pericia ? `<label class="campo"><span>Perícia que sobe para d6</span><select id="o-ocesc" data-f="ocupEscolha" data-re><option value="">Escolha…</option>${(h.pericias || []).map((p, i) => p.cat === oc.pericia ? `<option value="${i}" ${String(i) === String(h.ocupEscolha) ? 'selected' : ''}>${esc(p.nome)}</option>` : '').join('')}</select></label>` : ''}
              ${/Melhoria/.test(oc.texto) ? melhoria(h, 'ocupacao') : ''}` : '<p class="regra">Sem ocupação.</p>'}
            ${pf ? `<p class="regra"><b>${esc(pf.nome)} · ${esc(pf.unica[0])} (nível 1).</b> ${esc(pf.unica[1])}</p>${melhoria(h, 'perfil-unica')}
              ${pf.nivel.map((x, i) => `<p class="regra ${d.n >= HAB_NIVEL[i] ? '' : 'bloqueada'}"><b>${esc(x[0])} (nível ${HAB_NIVEL[i]}).</b> ${esc(x[1])}</p>${d.n >= HAB_NIVEL[i] ? melhoria(h, 'nivel-' + i) : ''}`).join('')}` : '<p class="regra">Sem perfil.</p>'}
          </div>
        </div>
        <div class="col-dir">
          <div class="abas" role="tablist">${[['combate', 'Combate'], ['habilidades', 'Habilidades'], ['inventario', 'Inventário'], ['progressao', 'Progressão'], ['pessoal', 'Pessoal']].map(([k, n]) => `<button role="tab" aria-selected="${aba === k}" class="aba ${aba === k ? 'ativa' : ''}" data-act="aba" data-aba="${k}">${n}</button>`).join('')}</div>
          <div class="aba-corpo">${aba === 'progressao' ? HB.Sistemas.de(h) && HB.progressaoHTML(h, HB.Sistemas.de(h), d) : abaFicha(h, aba)}</div>
        </div>
      </div></section>`;
  }
  const melhoria = (h, id) => `<label class="interruptor melhoria"><input id="o-mel-${esc(id)}" type="checkbox" data-f="melhorias.${esc(id)}" ${(h.melhorias || {})[id] ? 'checked' : ''}><span>Melhorada (1 ponto de perícia)</span></label>`;

  function lista(o, campo, rotulo, item, dica) {
    const xs = o[campo] || [];
    return `${dica ? `<p class="dica">${esc(dica)}</p>` : ''}<div class="itens">${xs.map((x, i) => `<div class="item">${item(x, i)}<button class="icone apagar-item" data-act="remover-item" data-campo="${campo}" data-i="${i}" aria-label="Remover">✕</button></div>`).join('') || '<p class="vazio">Nada aqui ainda.</p>'}</div>
      <button class="btn largo" data-act="sh-adicionar" data-campo="${campo}">${esc(rotulo)}</button>`;
  }
  function abaFicha(h, aba) {
    if (aba === 'combate') {
      const atq = ataquesDe(h);
      return `<form class="rolar-livre" data-act-submit="rolar-livre"><label class="sr" for="livre-${esc(h.id)}">Rolar dados</label><input id="livre-${esc(h.id)}" name="expr" placeholder="Rolar dados: 2d6+2" autocomplete="off"><button class="btn">Rolar</button></form>
        ${lista(h, 'ataques', 'Novo ataque', (a, i) => `<div class="item-topo"><input id="oa-n-${i}" class="item-nome" data-f="ataques.${i}.nome" value="${esc(a.nome || '')}" placeholder="Faca, revólver…"><button class="btn pequeno primario" data-act="rolar-ataque" data-i="${i}">Atacar</button></div>
          <div class="ataque-campos">
            <label class="campo"><span>Atributo</span><select id="oa-a-${i}" data-f="ataques.${i}.attr" data-re>${ATRIBUTOS.map(x => `<option value="${esc(x.id)}" ${x.id === (a.attr || 'FIS') ? 'selected' : ''}>${x.nome}</option>`).join('')}</select></label>
            <label class="campo"><span>Perícia</span><select id="oa-p-${i}" data-f="ataques.${i}.pericia" data-re><option value="">Nenhuma</option>${(h.pericias || []).map(p => `<option ${p.nome === a.pericia ? 'selected' : ''}>${esc(p.nome)}</option>`).join('')}</select></label>
            <label class="campo"><span>Arma</span><select id="oa-t-${i}" data-f="ataques.${i}.tipo" data-re>${[['branca', 'Branca'], ['fogo', 'De fogo'], ['outra', 'Outra']].map(([k, n]) => `<option value="${k}" ${k === (a.tipo || 'branca') ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
            <label class="campo"><span>Dano</span><input id="oa-d-${i}" data-f="ataques.${i}.dano" value="${esc(a.dano || '1d6')}"></label>
            <label class="campo mini"><span>+ Dano</span><input id="oa-b-${i}" type="number" data-f="ataques.${i}.bonus" data-re value="${a.bonus | 0}"></label></div>
          <div class="ataque-resumo"><span><small>Teste</small> d${dado(atq[i].pa)}${atq[i].pp != null ? ' + d' + dado(atq[i].pp) : ''}</span><span><small>Dano</small> ${esc(atq[i].dano)}${atq[i].bonusDano ? ' + ' + atq[i].bonusDano : ''}</span></div>
          <input id="oa-o-${i}" data-f="ataques.${i}.obs" value="${esc(a.obs || '')}" placeholder="Alcance, munição, efeito…">`)}
        <p class="dica">O ataque acerta com resultado igual ou maior que a DT do alvo (padrão 7). Mão Pesada e Para Bellum já somam +2 no dano da arma certa.</p>`;
    }
    if (aba === 'habilidades') return lista(h, 'habilidades', 'Nova habilidade', (x, i) => `<div class="item-topo"><input id="oh-n-${i}" class="item-nome" data-f="habilidades.${i}.nome" value="${esc(x.nome || '')}" placeholder="Ritual, poder paranormal…">
      <label class="campo mini"><span>PD</span><input id="oh-c-${i}" type="number" data-f="habilidades.${i}.custo" value="${x.custo | 0}"></label></div><textarea id="oh-d-${i}" rows="2" data-f="habilidades.${i}.desc">${esc(x.desc || '')}</textarea>`, 'Habilidades com custo em PD aparecem para usar no combate.');
    if (aba === 'inventario') return lista(h, 'inventario', 'Novo item', (x, i) => `<div class="item-topo"><input id="oi-n-${i}" class="item-nome" data-f="inventario.${i}.nome" value="${esc(x.nome || '')}" placeholder="Item"><label class="campo mini"><span>Qtd</span><input id="oi-q-${i}" type="number" data-f="inventario.${i}.qtd" value="${x.qtd == null ? 1 : x.qtd}"></label></div><input id="oi-d-${i}" data-f="inventario.${i}.desc" value="${esc(x.desc || '')}" placeholder="Detalhes">`);
    return [['aparencia', 'Aparência', 3], ['personalidade', 'Personalidade', 3], ['historia', 'História', 5], ['traumas', 'Traumas', 3], ['notas', 'Anotações', 3]]
      .map(([k, n, r]) => `<label class="campo"><span>${n}</span><textarea id="op-${k}" rows="${r}" data-f="pessoal.${k}">${esc((h.pessoal || {})[k] || '')}</textarea></label>`).join('');
  }

  // ---------- Ameaças ----------
  const BESTIARIO = [
    { id: 'op2-vulto', base: true, sistema: 'op2', nome: 'Vulto Faminto', categoria: 'Criatura · Médio', nex: 10, passos: { FIS: 2, EMO: 0, MEN: 1 }, treino: 1, pvMax: 14, manaMax: 4, defesa: 7, dureza: 0,
      ataques: [{ nome: 'Garras', attr: 'FIS', passo: 1, dano: '1d6+1' }], poderes: [], desc: 'Sombra que se alimenta de medo. Some quando a luz acende e volta pelos cantos.' },
    { id: 'op2-costurado', base: true, sistema: 'op2', nome: 'Cadáver Costurado', categoria: 'Criatura · Médio', nex: 20, passos: { FIS: 3, EMO: 0, MEN: 0 }, treino: 1, pvMax: 24, manaMax: 0, defesa: 8, dureza: 2,
      ataques: [{ nome: 'Pancada', attr: 'FIS', passo: 1, dano: '1d8+2' }, { nome: 'Agarrar', attr: 'FIS', passo: 2, dano: '1d4', obs: 'Alvo fica Caído se errar a defesa por 3+' }], poderes: [], desc: 'Corpo remendado que não sente dor. Lento, mas não para.' },
    { id: 'op2-eco', base: true, sistema: 'op2', nome: 'Eco Sussurrante', categoria: 'Criatura · Pequeno', nex: 30, passos: { FIS: 0, EMO: 3, MEN: 2 }, treino: 2, pvMax: 12, manaMax: 10, defesa: 9, dureza: 0,
      ataques: [{ nome: 'Sussurro', attr: 'EMO', passo: 2, dano: '1d6', obs: 'Dano em PD; alvo fica Abalado' }], poderes: [{ nome: 'Imitar voz', custo: 2, desc: 'Fala com a voz de alguém que o alvo ama.' }], desc: 'Voz sem corpo que repete o que ouviu. Difícil de acertar, frágil quando encontrado.' },
  ];
  function novoVilao() { return { sistema: 'op2', nome: 'Nova ameaça', categoria: 'Criatura · Médio', nex: 10, passos: { FIS: 1, EMO: 1, MEN: 1 }, treino: 1, pvMax: 12, manaMax: 4, defesa: 7, dureza: 0, ataques: [{ nome: 'Ataque', attr: 'FIS', passo: 1, dano: '1d6' }], poderes: [], desc: '' }; }
  const viloes = () => BESTIARIO.concat(S.lista('viloes').filter(v => HB.Sistemas.doSistema(v, 'op2')));
  function listaViloes(estado, modoEscolha) {
    const busca = (estado.busca || '').toLowerCase(), filtro = estado.filtro || 'todos';
    const xs = viloes().filter(v => (!busca || v.nome.toLowerCase().includes(busca)) && (filtro === 'todos' || (filtro === 'meus' ? !v.base && v.dono === HB.P.eu() : v.base)));
    return `<div class="filtros" role="tablist">${[['todos', 'Todas'], ['base', 'Base'], ['meus', 'Minhas ameaças']].map(([k, n]) => `<button class="aba ${filtro === k ? 'ativa' : ''}" data-act="filtro" data-v="${k}">${n}</button>`).join('')}</div>
      <label class="busca"><span class="sr">Buscar ameaça</span><input id="busca-viloes" data-busca placeholder="Buscar ameaça" value="${esc(estado.busca || '')}"></label>
      <div class="lista-viloes">${xs.map(v => `<article class="cartao-vilao">${UI.foto(v.foto, v.nome)}<div class="cv-info"><h3>${esc(v.nome)}</h3><p><b>NEX ${v.nex | 0}%</b> · ${esc(v.categoria || 'Ameaça')}</p><p class="cv-stats">PV ${v.pvMax | 0} · DT ${v.defesa | 0}${v.base ? ' · <span class="selo">Base</span>' : ''}</p></div>
        <div class="cv-acoes">${modoEscolha ? `<button class="btn pequeno" data-act="ver-vilao" data-id="${esc(v.id)}">Ficha</button><button class="btn pequeno primario" data-act="add-vilao-combate" data-id="${esc(v.id)}">Adicionar</button>` : `<a class="btn pequeno primario" href="#vilao-${esc(v.id)}">Ficha</a>`}</div></article>`).join('') || '<p class="vazio">Nenhuma ameaça com esse filtro.</p>'}</div>`;
  }
  function paginaViloes(estado) {
    return `<section class="pagina"><div class="pagina-topo"><div><h1 class="titulo-hq">Ameaças</h1><p class="sub">Criaturas e inimigos do Outro Lado</p></div><button class="btn primario" data-act="novo-vilao">Nova ameaça</button></div>
      <p class="faixa">Para usar em jogo, abra o Escudo do Mestre da campanha, crie um combate e adicione a ameaça.</p>${listaViloes(estado)}</section>`;
  }
  function fichaVilao(v, estado) {
    const so = !HB.P.podeEditarVilao(v), dis = so ? 'disabled' : '';
    const num = (f, rot, val) => `<label class="campo mini"><span>${rot}</span><input id="ov-${f}" type="number" data-f="${f}" data-re value="${val | 0}" ${dis}></label>`;
    return `<section class="pagina ficha vilao op2 ${so ? 'leitura' : ''}" ${so ? '' : `data-doc="viloes:${esc(v.id)}"`}>
      <div class="ficha-topo"><label class="foto-troca">${UI.foto(v.foto, v.nome, 'grande')}${so ? '' : '<input type="file" accept="image/*" data-foto hidden><span>Trocar foto</span>'}</label>
        <div class="ficha-ident"><label class="campo linha"><span>Ameaça</span><input id="ov-nome" data-f="nome" value="${esc(v.nome)}" ${dis}></label><label class="campo linha"><span>Categoria</span><input id="ov-cat" data-f="categoria" value="${esc(v.categoria || '')}" ${dis}></label></div>
        <div class="ficha-acoes">${so ? `<button class="btn pequeno primario" data-act="duplicar-vilao">${v.base ? 'Duplicar para editar' : 'Duplicar'}</button>` : '<button class="btn pequeno" data-act="duplicar-vilao">Duplicar</button><button class="btn pequeno perigo-txt" data-act="apagar-vilao">Apagar</button>'}</div></div>
      ${so ? `<p class="faixa">${v.base ? 'Ameaça base.' : 'Criada por ' + esc(HB.A.nome(v.dono)) + '.'} Duplique para mudar os números.</p>` : ''}
      <div class="ficha-grade"><div class="col-esq">${trio(v)}<div class="vilao-numeros">${num('nex', 'NEX %', v.nex)}${num('pvMax', 'PV', v.pvMax)}${num('manaMax', 'PD', v.manaMax)}${num('defesa', 'DT acerto', v.defesa)}${num('dureza', 'Dureza', v.dureza)}</div></div>
        <div class="col-meio"><div class="bloco"><div class="bloco-topo"><h3>Atributos</h3></div><div class="tabela-rolagem"><table class="tabela-attr"><tbody>
          ${ATRIBUTOS.map(a => `<tr><th scope="row">${a.nome}</th><td>${so ? 'd' + dado(passoAttr(v, a.id)) : passo('passos.' + a.id, 'd' + dado(passoAttr(v, a.id)), a.nome, 4)}</td><td><button class="btn-dado" data-act="rolar-attr" data-attr="${esc(a.id)}">rolar</button></td></tr>`).join('')}
          <tr><th scope="row">Treino geral</th><td>${so ? 'd' + dado(v.treino | 0) : passo('treino', 'd' + dado(v.treino | 0), 'Treino', 4)}</td><td></td></tr></tbody></table></div><p class="dica">Os testes da ameaça somam o dado do atributo e o do treino geral.</p></div>
          <div class="bloco"><div class="bloco-topo"><h3>Descrição</h3></div><textarea id="ov-desc" rows="5" data-f="desc" ${dis}>${esc(v.desc || '')}</textarea></div></div>
        <div class="col-dir"><div class="abas">${[['combate', 'Ataques'], ['poderes', 'Habilidades']].map(([k, n]) => `<button class="aba ${(estado.aba || 'combate') === k ? 'ativa' : ''}" data-act="aba" data-aba="${k}">${n}</button>`).join('')}</div>
          <div class="aba-corpo ${so ? 'so-leitura' : ''}">${(estado.aba || 'combate') === 'poderes'
            ? lista(v, 'poderes', 'Nova habilidade', (p, i) => `<div class="item-topo"><input id="ovp-n-${i}" class="item-nome" data-f="poderes.${i}.nome" value="${esc(p.nome || '')}" ${dis}><label class="campo mini"><span>PD</span><input id="ovp-c-${i}" type="number" data-f="poderes.${i}.custo" value="${p.custo | 0}" ${dis}></label></div><textarea id="ovp-d-${i}" rows="2" data-f="poderes.${i}.desc" ${dis}>${esc(p.desc || '')}</textarea>`)
            : lista(v, 'ataques', 'Novo ataque', (a, i) => `<div class="item-topo"><input id="ova-n-${i}" class="item-nome" data-f="ataques.${i}.nome" value="${esc(a.nome || '')}" ${dis}><button class="btn pequeno primario" data-act="rolar-ataque" data-i="${i}">Atacar</button></div>
              <div class="ataque-campos"><label class="campo"><span>Atributo</span><select id="ova-a-${i}" data-f="ataques.${i}.attr" data-re ${dis}>${ATRIBUTOS.map(x => `<option value="${esc(x.id)}" ${x.id === (a.attr || 'FIS') ? 'selected' : ''}>${x.nome}</option>`).join('')}</select></label>
                <label class="campo"><span>Dado de treino</span><select id="ova-p-${i}" data-f="ataques.${i}.passo" data-num data-re ${dis}>${DADOS.map((x, k) => `<option value="${k}" ${k === (a.passo | 0) ? 'selected' : ''}>d${x}</option>`).join('')}</select></label>
                <label class="campo"><span>Dano</span><input id="ova-d-${i}" data-f="ataques.${i}.dano" value="${esc(a.dano || '')}" ${dis}></label></div>
              <input id="ova-o-${i}" data-f="ataques.${i}.obs" value="${esc(a.obs || '')}" placeholder="Efeito, dano em PD…" ${dis}>`)}</div></div></div></section>`;
  }

  function regras() {
    return `<section class="pagina regras"><div class="pagina-topo"><div><h1 class="titulo-hq">Regras</h1><p class="sub">Teorias e homebrews da comunidade sobre o playtest de Ordem Paranormal 2. Muito do material é especulativo, como o próprio livro avisa.</p></div>${HB.botaoLivro('op2')}</div>
      <div class="regras-grade">
      <article class="bloco"><h2>Testes</h2><p>Role o dado do <b>atributo</b> e o dado da <b>perícia</b> e <b>some</b> os dois. Dados de bônus (como +d4 de Foco) também somam. Compare com a DT, normalmente <b>7</b>. Todos os dados em 1 é falha crítica.</p>
        <p class="dica">O PDF não define a mecânica do teste; o RPGHUB soma os dados, como a mesa joga.</p></article>
      <article class="bloco"><h2>Atributos</h2><p>Físico, Emoção e Mente. Todos começam em d6 com 1 ponto; cada ponto sobe um passo (d4 → d6 → d8 → d10 → d12). Baixar um atributo para d4 dá +1 ponto. Máximo d8 na criação; +1 ponto nos níveis 2, 5 e 8, até d12.</p></article>
      <article class="bloco"><h2>PV e PD</h2><p>PV iniciais = valor máximo do dado de Físico; PD = valor máximo do dado de Emoção. Mais 6 pontos para dividir entre os dois no início e 6 a cada nível.</p></article>
      <article class="bloco"><h2>Perícias</h2><p>Começam em d4. Pontos = 4 + metade do dado de Mente, mais 7 nos níveis 3, 6 e 9. Os pontos também compram melhorias das habilidades de ocupação, perfil e nível.</p></article>
      <article class="bloco largo"><h2>Progressão</h2><div class="tabela-rolagem"><table class="tabela-regra"><thead><tr><th>Nível</th><th>Ganho</th></tr></thead><tbody>
        ${[['1', 'Habilidade de perfil (Avaliação, Ímpeto ou Prontidão)'], ['2, 5, 8', 'Aumento de atributo'], ['3, 6, 9', 'Grau de treinamento (7 pontos de perícia)'], ['4, 7, 10', 'Habilidade de nível do perfil']].map(r => `<tr><td>${r[0]}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></div></article>
      <article class="bloco largo"><h2>Ocupações</h2><div class="origens">${Object.values(OCUPACOES).map(o => `<div><h3>${esc(o.nome)}</h3><p><b>${esc(o.hab)}.</b> ${esc(o.texto)}</p></div>`).join('')}</div></article>
      <article class="bloco largo"><h2>Perfis</h2><div class="origens">${Object.values(PERFIS).map(p => `<div><h3>${esc(p.nome)}</h3><p><b>${esc(p.unica[0])}.</b> ${esc(p.unica[1])}</p>${p.nivel.map((x, i) => `<p><b>${esc(x[0])} (nível ${HAB_NIVEL[i]}).</b> ${esc(x[1])}</p>`).join('')}</div>`).join('')}</div></article>
      </div></section>`;
  }

  HB.Sistemas.registrar({
    id: 'op2', nome: 'Ordem Paranormal II', sub: 'Teorias e homebrews · soma dos dados',
    descricao: 'Agentes contra o paranormal. Três atributos e perícias em dados (d4 a d12), PV e Determinação, ocupações e os perfis Analista, Executor e Vigilante.',
    livro: { pdf: 'livros/ordem-paranormal-ii-teorias-e-homebrews.pdf', titulo: 'Ordem Paranormal II · Teorias e Homebrews', tamanho: '424 KB', creditos: 'Material de fãs de Static, Ojimo, Portill & Vescose sobre o playtest de Ordem Paranormal 2.' },
    rotulos: { personagens: 'Agentes', personagem: 'agente', novo: 'Novo agente', ameacas: 'Ameaças', ameaca: 'ameaça', novaAmeaca: 'Nova ameaça', recurso: 'PD' },
    iniciativa: 'rolada', temReputacao: false, condicoes: CONDICOES,
    ganchoAttr: { INT: 'MEN', AGI: 'FIS' },
    dadosRapidos: DADOS.map(l => ({ rotulo: 'd' + l, expr: '1d' + l })).concat([{ rotulo: 'd20', expr: '1d20' }]),
    novoPersonagem, nomeClasse, derivados: h => { const d = derivados(h); return { pvMax: d.pvMax, manaMax: d.manaMax, defesa: d.defesa }; },
    ficha, bestiario: BESTIARIO, novoVilao, fichaVilao, listaViloes, paginaViloes, combatente, teste, ataque, regras,
    progressao(h, d) {
      const oc = OCUPACOES[h.ocupacao], pf = PERFIS[h.perfil], men = dado(passoAttr(h, 'MEN'));
      const extraNivel = oc && oc.pvNivel ? ' · +1 PV (Calejado)' : oc && oc.pdNivel ? ' · +1 PD (Dedicação)' : '';
      const linhas = Array.from({ length: 10 }, (_, i) => {
        const n = i + 1, g = [];
        if (n === 1) g.push(pf ? esc(pf.unica[0]) : 'habilidade de perfil');
        if (AUMENTOS.includes(n)) g.push('+1 ponto de atributo');
        if (GRAUS.includes(n)) g.push('+7 pontos de perícia');
        const k = HAB_NIVEL.indexOf(n); if (k >= 0) g.push((pf ? esc(pf.nivel[k][0]) : 'habilidade de nível do perfil'));
        return { n, cels: [g.join(' · ') || '—', '+6 pontos' + extraNivel] };
      });
      return {
        nivel: d.n,
        inicio: [
          '<b>Atributos:</b> Físico, Emoção e Mente começam em d6, com <b>1 ponto</b> para subir um passo. Baixar um para d4 dá +1 ponto. Máximo d8 na criação.',
          `<b>PV</b> = valor máximo do dado de Físico; <b>PD</b> = valor máximo do dado de Emoção; mais <b>6 pontos</b> para dividir entre os dois.`,
          `<b>Perícias:</b> começam em d4; <b>4 + metade do dado de Mente</b> pontos (Mente d${men} = ${4 + men / 2} pontos). Os pontos também compram melhorias das habilidades.`,
          oc ? `<b>Ocupação ${esc(oc.nome)} · ${esc(oc.hab)}:</b> ${esc(oc.texto)}` : '<b>Ocupação:</b> escolha na ficha (dá uma habilidade).',
          pf ? `<b>Perfil ${esc(pf.nome)} · ${esc(pf.unica[0])}:</b> ${esc(pf.unica[1])}` : '<b>Perfil:</b> Analista, Executor ou Vigilante (dá a habilidade do nível 1).',
          '<b>NEX</b> (exposição paranormal) anotado na ficha; o livro supõe blocos de 5% e 10%.',
        ],
        tabela: { colunas: ['Nível', 'Ganhos', 'PV/PD'], linhas },
        nota: 'A tabela segue o livro (níveis 1 a 10), que marca boa parte dela como especulação sobre o playtest.',
      };
    },
    rolarIniciativa(o) { return teste(o, 'iniciativa').total; },
    novoItem(col, campo) {
      if (campo === 'ataques') return col === 'viloes' ? { nome: 'Ataque', attr: 'FIS', passo: 1, dano: '1d6' } : { nome: 'Novo ataque', attr: 'FIS', pericia: 'Luta', tipo: 'branca', dano: '1d6', bonus: 0 };
      if (campo === 'habilidades') return { nome: '', custo: 0, desc: '' };
      return null;
    },
    aoMudarCampo(o, campo) {
      if (campo === 'nivel') o.nivel = Math.max(1, Math.min(10, o.nivel | 0));
      if (campo === 'ocupacao') o.ocupEscolha = '';
      if (campo === 'nex') o.nex = Math.max(0, Math.min(99, o.nex | 0));
    },
  });
  HB.OP2 = { DADOS, dado, CAT, ATRIBUTOS, OCUPACOES, PERFIS, AUMENTOS, GRAUS, HAB_NIVEL, derivados, periciaEf, passoAttr };
})(window.HB);
