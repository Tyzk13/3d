// Regras do sistema Heróis de Bueiro (playtest completo). Tudo que é número de regra mora aqui.
window.HB = window.HB || {};
(function (HB) {
  const ATRIBUTOS = [
    { id: 'FOR', nome: 'Força' },
    { id: 'AGI', nome: 'Agilidade' },
    { id: 'CAR', nome: 'Carisma' },
    { id: 'INT', nome: 'Inteligência' },
    { id: 'FEI', nome: 'Feitiçaria' },
    { id: 'VIG', nome: 'Vigor' },
  ];
  // Nível de experiência no atributo → dado somado ao 1d10.
  const NIVEIS = [
    { nome: 'Inexperiente', dados: [] },
    { nome: 'Comum', dados: [4] },
    { nome: 'Bom', dados: [6] },
    { nome: 'Experiente', dados: [8] },
    { nome: 'Expert', dados: [10] },
    { nome: 'Mestre', dados: [6, 6] },
  ];
  const MAESTRIAS = [
    { id: 'cac', nome: 'Corpo a corpo', curto: 'C. a C.' },
    { id: 'dist', nome: 'À distância', curto: 'Distância' },
    { id: 'mag', nome: 'Magia / Feitiços', curto: 'Magia' },
  ];
  const bonusMaestria = n => 2 * Math.max(0, Math.min(5, n | 0));
  const PONTOS_INICIAIS = 20, CUSTO_NIVEL = 5, NIVEL_MAX = 5;

  const CLASSES = {
    tanker: {
      nome: 'Tanker', pv: [20, 10], mana: [5, 2], def: 7, ordem: 5,
      fixo: { VIG: 2, FOR: 1 }, maestria: { cac: 1 },
      resumo: '20 PV + 10/Vigor · 5 Mana + 2/Feitiçaria · Defesa 7 + Agilidade',
    },
    lutador: {
      nome: 'Lutador', pv: [15, 7], mana: [7, 3], def: 5, ordem: 2,
      fixo: { VIG: 1 }, escolhas: [{ id: 'c1', rotulo: '+2 níveis em', valor: 2, opcoes: ['FOR', 'AGI'] }],
      maestria: { cac: 2 },
      resumo: '15 PV + 7/Vigor · 7 Mana + 3/Feitiçaria · Defesa 5 + Agilidade',
    },
    atirador: {
      nome: 'Atirador', pv: [10, 5], mana: [7, 3], def: 3, ordem: 1,
      fixo: { AGI: 2 }, escolhas: [{ id: 'c1', rotulo: '+1 nível em', valor: 1, opcoes: ['INT', 'CAR'] }],
      maestria: { dist: 2 },
      resumo: '10 PV + 5/Vigor · 7 Mana + 3/Feitiçaria · Defesa 3 + Agilidade',
    },
    mago: {
      nome: 'Mago', pv: [7, 3], mana: [10, 8], def: 3, ordem: 3,
      fixo: { FEI: 2 }, escolhas: [{ id: 'c1', rotulo: '+1 nível em', valor: 1, opcoes: ['INT', 'CAR'] }],
      maestria: { mag: 2 },
      resumo: '7 PV + 3/Vigor · 10 Mana + 8/Feitiçaria · Defesa 3 + Agilidade',
    },
    curandeiro: {
      nome: 'Curandeiro', pv: [9, 4], mana: [8, 6], def: 4, ordem: 4,
      fixo: { CAR: 2 }, escolhas: [{ id: 'c1', rotulo: '+1 nível em', valor: 1, opcoes: ['INT', 'FEI'] }],
      maestriaEscolha: 2,
      resumo: '9 PV + 4/Vigor · 8 Mana + 6/Feitiçaria · Defesa 4 + Agilidade',
    },
    estrategista: {
      nome: 'Estrategista/Inventor', pv: [10, 4], mana: [5, 6], def: 7, ordem: 6,
      fixo: { INT: 2 }, escolhas: [{ id: 'c1', rotulo: '+1 nível em', valor: 1, opcoes: ['CAR', 'FEI'] }],
      maestriaEscolha: 2,
      resumo: '10 PV + 4/Vigor · 5 Mana + 6/Feitiçaria · Defesa 7 + Agilidade',
    },
  };

  const ELEMENTOS = {
    Fogo: { cor: 'var(--fogo)', vence: 'Terra' },
    Terra: { cor: 'var(--terra)', vence: 'Vento' },
    Vento: { cor: 'var(--vento)', vence: 'Água' },
    'Água': { cor: 'var(--agua)', vence: 'Fogo' },
  };
  const perdePara = el => Object.keys(ELEMENTOS).find(k => ELEMENTOS[k].vence === el);

  const TODOS = ATRIBUTOS.map(a => a.id);
  const ORIGENS = {
    playboy: {
      nome: 'Playboy', fixo: { INT: 1, CAR: -1 },
      texto: 'Recursos de sobra: compra e constrói qualquer coisa. Acesso a Nanotecnologia. Esnobe: −1 em Carisma.',
    },
    elemental: {
      nome: 'Elemental', fixo: { FEI: 1, VIG: -1 }, elemento: 1,
      texto: 'Feito de matéria elemental. +1 nível de dado contra o elemento que domina, −1 contra o que o domina. Precisa recarregar a Fonte Elemental todo dia (carvão para fogo etc.). Só Elementais recebem benefícios físicos dos elementos.',
    },
    mago: {
      nome: 'Mago/Alquimista', fixo: { FEI: 2 }, elemento: 2,
      escolhas: [{ id: 'o1', rotulo: 'Penalidade', tipo: 'pacote', opcoes: [
        { id: 'for2', nome: 'Força −2', mod: { FOR: -2 } },
        { id: 'vig2', nome: 'Vigor −2', mod: { VIG: -2 } },
        { id: 'ambos', nome: 'Força −1 e Vigor −1', mod: { FOR: -1, VIG: -1 } },
      ] }],
      texto: 'Entende os símbolos da magia. Escolha dois elementos: pode criar e soltar magias deles (com aval do Mestre). Magos não recebem resistência elemental.',
    },
    bestial: {
      nome: 'Bestial', forma: { CAR: -2, INT: -2, FOR: 2, AGI: 2, VIG: 2 }, custoForma: 5,
      texto: 'Um alter ego vive no seu corpo. Na Forma Bestial: −2 em Carisma e Inteligência, +2 em Força, Agilidade e Vigor. Cada transformação custa 5 de Mana.',
    },
    mutante: {
      nome: 'Mutante',
      escolhas: [
        { id: 'o1', rotulo: '+1 nível em', valor: 1, opcoes: TODOS },
        { id: 'o2', rotulo: '+1 nível em', valor: 1, opcoes: TODOS, diferenteDe: 'o1' },
      ],
      situacoes: [
        { rotulo: 'vs. não mutantes', attr: 'CAR', mod: -2 },
        { rotulo: 'vs. NPC humano', attr: 'CAR', mod: -3 },
      ],
      texto: 'Portador do Gene-X. Crie um poder mutante junto com o Mestre. Carisma: −2 contra não mutantes e −3 contra NPCs humanos.',
    },
    experimento: {
      nome: 'Experimento/Super Soldado', fixo: { FEI: -1 },
      escolhas: [{ id: 'o1', rotulo: '+2 níveis em', valor: 2, opcoes: ['FOR', 'AGI'] }],
      texto: 'Filho da ciência, com mutações implantadas. Você é incansável.',
    },
    et: {
      nome: 'E.T.',
      escolhas: [
        { id: 'o1', rotulo: '+1 nível em', valor: 1, opcoes: TODOS },
        { id: 'o2', rotulo: '−1 nível em', valor: -1, opcoes: TODOS, diferenteDe: 'o1' },
      ],
      texto: 'Veio de outro corpo galáctico e entende a língua terráquea pelas transmissões.',
    },
    mercenario: {
      nome: 'Mercenário', fixo: { AGI: 1, FEI: -1 }, maestria: { dist: 1 },
      texto: 'Cresceu entre armas e cobranças. Treinado em qualquer tipo de arma. +1 nível em Ataque à Distância.',
    },
    android: {
      nome: 'Android/I.A.', fixo: { INT: 2 }, semCarisma: true,
      texto: 'Feito de zeros e uns, com armazenamento infinito de informações mundanas. Sem sentimentos: não pode usar Carisma para Mentir, Persuadir ou Intimidar.',
    },
    asgardiano: {
      nome: 'Asgardiano/Valkiria', fixo: { FEI: 2 },
      escolhas: [{ id: 'o1', rotulo: '+1 nível em', valor: 1, opcoes: ['FOR', 'AGI', 'VIG'] }],
      texto: 'Sangue azul, abençoado pelos deuses nórdicos de Asgard.',
    },
  };

  const REPUTACAO = {
    graus: { 1: 10, 2: 20, 3: 30 },
    estado(p) {
      if (p >= 100) return { id: 'pos', nome: 'Positiva', efeito: '+1 nível de Carisma com a população mundana' };
      if (p <= -100) return { id: 'neg', nome: 'Negativa', efeito: '−2 níveis de Carisma com a população; vilões mundanos ficam neutros' };
      return { id: 'neu', nome: 'Neutra', efeito: '+1 nível de Carisma para intimidar civis' };
    },
  };

  const CONFLITOS = ['Físico', 'Mental', 'Argumentativo'];

  // ---------- Cálculos da ficha ----------
  function modsDe(h) {
    const m = {}; TODOS.forEach(a => (m[a] = { classe: 0, origem: 0, forma: 0 }));
    const add = (obj, campo) => obj && Object.entries(obj).forEach(([a, v]) => { if (m[a]) m[a][campo] += v; });
    const ap = (def, alvo, campo) => {
      if (!def) return;
      add(def.fixo, campo);
      (def.escolhas || []).forEach(e => {
        const v = (alvo || {})[e.id];
        if (!v) return;
        if (e.tipo === 'pacote') { const p = e.opcoes.find(o => o.id === v); if (p) add(p.mod, campo); }
        else if (m[v]) m[v][campo] += e.valor;
      });
    };
    ap(CLASSES[h.classe], (h.escolhas || {}).classe, 'classe');
    const og = ORIGENS[h.origem];
    ap(og, (h.escolhas || {}).origem, 'origem');
    if (og && og.forma && h.formaBestial) add(og.forma, 'forma');
    return m;
  }

  function nivelBruto(h, a, mods) {
    mods = mods || modsDe(h);
    const x = mods[a];
    return ((h.base || {})[a] | 0) + x.classe + x.origem + x.forma + ((h.extra || {})[a] | 0);
  }
  const limitar = n => Math.max(0, Math.min(NIVEL_MAX, n));
  function nivel(h, a, mods) { return limitar(nivelBruto(h, a, mods)); }

  function maestrias(h) {
    const c = CLASSES[h.classe] || {}, o = ORIGENS[h.origem] || {};
    const r = {};
    MAESTRIAS.forEach(({ id }) => {
      let n = ((c.maestria || {})[id] | 0) + ((o.maestria || {})[id] | 0) + ((h.maestriaExtra || {})[id] | 0);
      if (c.maestriaEscolha && (h.escolhas || {}).maestria === id) n += c.maestriaEscolha;
      r[id] = limitar(n);
    });
    return r;
  }

  function pontosGastos(h) { return TODOS.reduce((s, a) => s + ((h.base || {})[a] | 0) * CUSTO_NIVEL, 0); }

  function derivados(h) {
    const mods = modsDe(h);
    const niv = {}; TODOS.forEach(a => (niv[a] = nivel(h, a, mods)));
    const c = CLASSES[h.classe];
    const pvMax = c ? c.pv[0] + c.pv[1] * niv.VIG : 0;
    const manaMax = c ? c.mana[0] + c.mana[1] * niv.FEI : 0;
    const def = c ? c.def + niv.AGI : niv.AGI;
    const r = {
      mods, niv, maestria: maestrias(h),
      pvMax: pvMax + (h.pvExtra | 0),
      manaMax: manaMax + (h.manaExtra | 0),
      defesa: def + (h.defExtra | 0),
      gastos: pontosGastos(h),
      total: h.pontos == null ? PONTOS_INICIAIS : h.pontos,
    };
    return HB.modoManual ? HB.modoManual(h, r) : r;
  }

  // Situações que mudam o nível de dado numa rolagem (mostradas como atalhos).
  function situacoes(h, attr) {
    const r = [];
    const og = ORIGENS[h.origem];
    if (og && og.situacoes) og.situacoes.filter(s => s.attr === attr).forEach(s => r.push(s));
    if (h.origem === 'elemental' && h.elementos && h.elementos[0] && ELEMENTOS[h.elementos[0]]) {
      const el = h.elementos[0];
      r.push({ rotulo: 'vs. ' + ELEMENTOS[el].vence, mod: 1 });
      r.push({ rotulo: 'vs. ' + perdePara(el), mod: -1 });
    }
    if (attr === 'CAR' && h.reputacao != null) {
      const e = REPUTACAO.estado(h.reputacao | 0);
      if (e.id === 'pos') r.push({ rotulo: 'com a população (rep.)', mod: 1 });
      if (e.id === 'neu') r.push({ rotulo: 'intimidar civil (rep.)', mod: 1 });
      if (e.id === 'neg') r.push({ rotulo: 'com a população (rep.)', mod: -2 });
    }
    return r;
  }

  // Desempate da iniciativa: maior nível de Agilidade; empate pela ordem de classe.
  function ordemClasse(id) { return (CLASSES[id] || {}).ordem || 9; }

  HB.R = {
    ATRIBUTOS, NIVEIS, MAESTRIAS, CLASSES, ORIGENS, ELEMENTOS, REPUTACAO, CONFLITOS,
    PONTOS_INICIAIS, CUSTO_NIVEL, NIVEL_MAX, TODOS,
    bonusMaestria, perdePara, modsDe, nivel, nivelBruto, limitar, maestrias, derivados, situacoes, ordemClasse,
    nomeAttr: id => (ATRIBUTOS.find(a => a.id === id) || {}).nome || id,
    dadoTexto: n => { const d = NIVEIS[limitar(n)].dados; return d.length ? (d.length === 2 && d[0] === d[1] ? '2d' + d[0] : d.map(x => '1d' + x).join('+')) : '—'; },
  };
})(window.HB);
