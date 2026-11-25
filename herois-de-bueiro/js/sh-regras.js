// Shinigamis & Hollows (Livro dos Ceifadores v0.7b): números e cálculos. Sistema d20.
(function (HB) {
  const ATRIBUTOS = [
    { id: 'FOR', nome: 'Força' }, { id: 'DES', nome: 'Destreza' }, { id: 'CON', nome: 'Constituição' },
    { id: 'INT', nome: 'Inteligência' }, { id: 'SAB', nome: 'Sabedoria' }, { id: 'ESP', nome: 'Espírito' },
  ];
  const TODOS = ATRIBUTOS.map(a => a.id);
  const nomeAttr = id => (ATRIBUTOS.find(a => a.id === id) || {}).nome || id;

  // Perícia → atributo chave; treino = só pode ser usada se treinado.
  const PERICIAS = [
    ['acrobacia', 'Acrobacia', 'DES'], ['atletismo', 'Atletismo', 'FOR'], ['briga', 'Briga', 'FOR'],
    ['conhecimento', 'Conhecimento', 'INT', 1], ['diplomacia', 'Diplomacia', 'ESP'], ['enganacao', 'Enganação', 'ESP'],
    ['espiritualismo', 'Espiritualismo', 'ESP', 1], ['furtividade', 'Furtividade', 'DES'], ['intimidacao', 'Intimidação', 'ESP'],
    ['intuicao', 'Intuição', 'SAB'], ['investigacao', 'Investigação', 'INT'], ['medicina', 'Medicina', 'SAB', 1],
    ['oficio', 'Ofício', 'INT', 1], ['percepcao', 'Percepção', 'SAB'], ['performance', 'Performance', 'ESP'],
    ['prestidigitacao', 'Prestidigitação', 'DES', 1], ['sobrevivencia', 'Sobrevivência', 'SAB'], ['tatica', 'Tática', 'INT', 1],
    ['tecnologia', 'Tecnologia', 'INT', 1],
  ].map(([id, nome, attr, treino]) => ({ id, nome, attr, treino: !!treino }));
  const TRS = [{ id: 'fortitude', nome: 'Fortitude', attr: 'CON' }, { id: 'reflexos', nome: 'Reflexos', attr: 'DES' }, { id: 'vontade', nome: 'Vontade', attr: 'SAB' }];

  // Termos do Bleach mantidos como no livro, com a tradução ao lado.
  const CAMINHOS = [{ id: 'zanjutsu', nome: 'Zanjutsu', trad: 'esgrima' }, { id: 'hakuda', nome: 'Hakuda', trad: 'luta corporal' }, { id: 'hoho', nome: 'Hoho', trad: 'passos rápidos' }, { id: 'kido', nome: 'Kido', trad: 'artes espirituais' }];
  CAMINHOS.forEach(c => (c.rotulo = c.nome + ' (' + c.trad + ')'));
  const GLOSSARIO = [
    ['Zanpakuto', 'espada ceifadora de almas; carrega o espírito que dá poder ao shinigami'], ['Shikai', 'liberação inicial da zanpakuto'], ['Bankai', 'liberação final da zanpakuto'],
    ['Zankensoki', 'as quatro artes de combate dos shinigamis'], ['Zanjutsu', 'esgrima com a zanpakuto'], ['Hakuda', 'luta corporal'], ['Hoho', 'passos rápidos (deslocamento e esquiva)'],
    ['Kido', 'artes espirituais'], ['Hado', 'kido de ataque (destruição)'], ['Bakudo', 'kido de contenção (amarração)'], ['Kaido', 'kido de cura'],
    ['Reiryoku', 'energia espiritual (o recurso da ficha)'], ['Reiatsu', 'pressão espiritual, a reiryoku sentida no ar'], ['Shunko', 'técnica que une Hakuda e Kido (clarão veloz)'],
    ['Gotei 13', 'as treze divisões de shinigamis'], ['Onmitsukido', 'força secreta da 2ª Divisão'], ['Soul Society', 'mundo das almas'], ['Seireitei', 'cidade dos shinigamis, na Soul Society'],
    ['Rukongai', 'distritos das almas comuns em volta da Seireitei'], ['Hollow', 'alma corrompida que devora outras'], ['Menos', 'hollow gigante'], ['Vizard', 'shinigami com poderes de hollow'],
    ['Saketsu', 'núcleo de poder do shinigami (ligado às Quebras)'], ['Kan', 'moeda da Soul Society'],
  ];
  const graduacao = n => (n >= 10 ? 'Mestre' : n >= 7 ? 'Avançado' : n >= 5 ? 'Intermediário' : n >= 3 ? 'Iniciado' : n >= 1 ? 'Aprendiz' : '—');

  const PARTIDAS = {
    assassino: { nome: 'Assassino', pv: 10, afin: ['hoho', 'zanjutsu'], chave: 'Habilidade Chave do Hoho', bonus: '+2 em testes de Furtividade.' },
    convergente: { nome: 'Convergente', pv: 10, afin: ['zanjutsu', 'kido'], chave: 'Habilidade Chave do Zanjutsu ou do Kido', bonus: 'Começa conhecendo um Kido e tem +2 nas rolagens de dano com a zanpakuto.' },
    duelista: { nome: 'Duelista', pv: 12, afin: ['hakuda', 'zanjutsu'], chave: 'Habilidade Chave do Hakuda ou do Zanjutsu', bonus: '+1 em Reflexos e na Defesa empunhando a zanpakuto em uma mão com a outra livre.' },
    esgrimista: { nome: 'Esgrimista', pv: 12, afin: ['zanjutsu', 'hoho'], chave: 'Habilidade Chave do Zanjutsu', bonus: 'Sintonia com a zanpakuto +1.' },
    espiritualista: { nome: 'Espiritualista', pv: 8, afin: ['kido', 'hoho'], chave: 'Habilidade Chave do Kido', bonus: 'Aprende dois Kidos adicionais.' },
    lutador: { nome: 'Lutador', pv: 15, afin: ['hakuda', 'kido'], chave: 'Habilidade Chave do Hakuda', bonus: 'Dureza 2 contra dano físico.' },
  };

  const FIS = ['FOR', 'DES', 'CON'], MEN = ['INT', 'SAB', 'ESP'];
  // Divisões da Gotei 13: perícias sugeridas (escolha 2), atributos onde vão os 3 pontos de divisão (máx. 2 em um) e a característica.
  const DIVISOES = [
    { n: 1, pericias: null, attrs: TODOS, nota: 'Pontos em 2 atributos quaisquer', car: 'Honra e Confiança: no início de toda cena de combate, aliados recebem +1 em testes de perícia e jogadas de ataque até o fim da cena.' },
    { n: 2, pericias: ['enganacao', 'furtividade', 'prestidigitacao', 'percepcao'], attrs: ['DES', 'SAB'], car: 'As Cinco Faces do Onmitsukido: escolha uma força especial (Keigun +2 de dano contra alvos abaixo de metade da vida; Keireitei, Kanritai, Hichotai ou Riteitai).' },
    { n: 3, pericias: ['atletismo', 'intuicao', 'percepcao', 'tatica'], attrs: ['FOR', 'SAB'], car: 'Passe Livre: sai do Seireitei quando quiser; como Oficial, vê o histórico de quem passou pelos portões.' },
    { n: 4, pericias: ['conhecimento', 'medicina', 'percepcao', 'prestidigitacao'], attrs: ['ESP', 'SAB'], car: 'Treinamento Médico: aprende um Kaido e soma o bônus de treinamento a toda cura que fizer.' },
    { n: 5, pericias: ['conhecimento', 'enganacao', 'diplomacia', 'tatica'], attrs: ['ESP', 'SAB'], car: 'Personalidade Inconfundível: +2 em Diplomacia ou Enganação com shinigamis de rank igual ou inferior.' },
    { n: 6, pericias: ['espiritualismo', 'intimidacao', 'performance', 'prestidigitacao'], attrs: TODOS, nota: 'Espírito e mais um atributo', car: 'Orgulho Shinigami: +2 em testes de resistência contra condições mentais, mas não pode fugir do combate sem passar em Vontade.' },
    { n: 7, pericias: null, attrs: TODOS, nota: 'Dois atributos quaisquer', car: 'Liberdade Despretensiosa: um Treinamento com a 1ª etapa completa; +1 em ataques e TRs lutando ao lado do personagem do seu Laço.' },
    { n: 8, pericias: ['espiritualismo', 'performance', 'diplomacia', 'intuicao'], attrs: ['ESP', 'FOR'], car: 'Combate Exótico: defina seu estilo de luta; +1 em testes de perícia ligados a ele durante o combate.' },
    { n: 9, pericias: ['conhecimento', 'intuicao', 'percepcao', 'performance'], attrs: MEN, nota: 'Dois atributos mentais', car: 'Prontidão para Defender: vantagem em Iniciativa dentro do Seireitei e acesso antecipado ao jornal.' },
    { n: 10, pericias: ['tatica', 'sobrevivencia', 'conhecimento', 'percepcao'], attrs: ['INT', 'FOR'], car: 'Conhecimento Estratégico: no início do combate, Tática (CD 10 + nível do inimigo) revela algo valioso e dá +1 contra ele.' },
    { n: 11, pericias: ['acrobacia', 'atletismo', 'espiritualismo', 'intimidacao'], attrs: FIS, nota: 'Dois atributos físicos', car: 'Alma Fortificada: +1 em ataques corpo a corpo, dano extra igual ao bônus de treinamento com a zanpakuto, Força em Intimidação. Só sobe outros Caminhos com 10 em Zanjutsu.' },
    { n: 12, pericias: ['conhecimento', 'oficio', 'tatica', 'tecnologia'], attrs: ['INT', 'SAB'], car: 'Conhecimento da Criação: uma vez por dia, teste de Ofício para criar um item, se tiver materiais.' },
    { n: 13, pericias: ['investigacao', 'percepcao', 'diplomacia', 'sobrevivencia'], attrs: ['INT', 'SAB'], car: 'Conhecimento dos Vivos e Mortos: +4 em Percepção para achar almas a guiar e +2 em Percepção no mundo humano.' },
  ];
  const nomeDivisao = n => (n ? n + 'ª Divisão' : 'Sem divisão');
  // A divisão é opcional (decisão da mesa; o livro diz que "a maioria" entra numa).
  const SEM_DIVISAO = 'Sem divisão: os 3 pontos extras vão em quaisquer atributos (máx. 2 no mesmo) e as 2 perícias extras são à escolha; sem característica de divisão.';

  // Forma selada da zanpakuto → arma.
  const FORMAS = {
    katana: { nome: 'Katana (Espada Longa)', dano: '1d8', dano2: '1d10', crit: 20, tipo: 'Cortante', fineza: false, tracos: 'Versátil' },
    wakizashi: { nome: 'Wakizashi (Espada Curta)', dano: '1d6', crit: 19, tipo: 'Cortante', fineza: true, tracos: 'Fineza, leve' },
    nodachi: { nome: 'Nodachi (Espada Grande)', dano: '1d12', crit: 20, tipo: 'Cortante', fineza: false, tracos: 'Ampla, duas mãos' },
    tanto: { nome: 'Tanto (Adaga)', dano: '1d4', crit: 18, tipo: 'Perfurante', fineza: true, tracos: 'Fineza, leve' },
  };
  const TIPOS_ZANPAKUTO = ['Abstrato', 'Elemental', 'Físico', 'Sensorial', 'Vivo'];
  const TIPOS_DANO = ['Cortante', 'Impacto', 'Perfurante', 'Ácido', 'Congelante', 'Elétrico', 'Energético', 'Necrótico', 'Psíquico', 'Queimante'];
  const CONDICOES = ['Agarrado', 'Amedrontado', 'Atordoado', 'Caído', 'Congelado', 'Desorientado', 'Desprevenido', 'Enfraquecido', 'Envenenado', 'Fadigado', 'Imóvel', 'Lento', 'Paralisado', 'Queimando', 'Sangrando', 'Sobrecarregado', 'Inconsciente'];

  // ---------- Progressão por nível ----------
  const bonusTreino = n => (n >= 17 ? 6 : n >= 13 ? 5 : n >= 9 ? 4 : n >= 5 ? 3 : 2);
  const MARCOS = [5, 9, 13, 17]; // somam CON na vida e ESP no reiryoku de novo
  const AUMENTOS = [3, 6, 9, 12, 15, 18]; // +2 pontos de atributo
  const pvPorNivel = n => (n >= 17 ? 7 : n >= 9 ? 6 : 5);
  const limiteAttr = n => (n >= 10 ? 10 : 5);
  const marcosAte = n => MARCOS.filter(m => m <= n).length;
  const aumentosAte = n => AUMENTOS.filter(m => m <= n).length;
  const mestrias = n => [6, 12, 18].filter(m => m <= n).length;

  // ---------- Vizard (origem especial, por cima de Shinigami) ----------
  const hollowAtiva = h => !!(h && h.vizard && h.hollowAtiva);
  const bonusHollow = h => (hollowAtiva(h) ? ((h.vizardTreino | 0) >= 4 ? 2 : 1) : 0); // FOR, DES e CON
  const bonusTestesHollow = h => (hollowAtiva(h) && (h.vizardTreino | 0) >= 2 ? 1 : 0); // treino etapa 2: +1 em todos os testes
  function duracaoHollow(h) {
    const t = h.vizardTreino | 0, z = (h.zanpakuto || {}).estado;
    const rodadas = Math.max(0, 2 + (t >= 1 ? 1 : 0) + (t >= 3 ? 2 : 0) - (z === 'shikai' ? 1 : z === 'bankai' ? 3 : 0));
    return { rodadas, minutos: 3 + (t >= 1 ? 1 : 0) + (t >= 3 ? 2 : 0) };
  }
  const TREINO_VIZARD = ['+1 rodada em combate e +1 minuto fora dele', '+1 em todos os testes com a Hollowficação ativa', '+2 rodadas em combate e +2 minutos fora dele', 'Força, Destreza e Constituição +2 (em vez de +1) na Hollowficação'];
  // Clãs: no livro (v0.7b) só têm descrição; podem substituir a divisão ou somar a ela, com aval do Narrador.
  const CLAS = {
    homemlobo: { nome: 'Clã dos Homem-Lobo', texto: 'Almas "pecaminosas" em exílio auto imposto na Soul Society, punidas com uma forma meio homem, meio lobo.' },
    ise: { nome: 'Clã Ise', texto: 'Linhagem de sacerdotes que conduz rituais. Só nascem mulheres; os maridos morrem cedo (Maldição Ise). Não têm zanpakuto individual: a líder herda a espada sagrada do clã.' },
    kuchiki: { nome: 'Clã Kuchiki', texto: 'Uma das Quatro Grandes Famílias Nobres, encarregada de compilar e proteger a história da Soul Society.' },
  };
  const valBase = (h, a) => ((h.atributos || {})[a] | 0);
  const val = (h, a) => valBase(h, a) + (['FOR', 'DES', 'CON'].includes(a) ? bonusHollow(h) : 0);
  function bonusPericia(h, id, bt) {
    const p = PERICIAS.find(x => x.id === id); const t = ((h.pericias || {})[id]) || {};
    const grau = t.grau | 0; // 0 nada, 1 treinado, 2 mestre
    const treino = grau === 2 ? Math.floor(bt * 1.5) : grau === 1 ? bt : 0;
    return { total: val(h, p.attr) + treino + (t.outros | 0), grau, bloqueada: p.treino && !grau };
  }
  function bonusTR(h, id, bt) {
    const tr = TRS.find(x => x.id === id); const t = ((h.trs || {})[id]) || {};
    const grau = t.grau | 0;
    return { total: val(h, tr.attr) + (grau === 2 ? Math.floor(bt * 1.5) : grau === 1 ? bt : 0) + (t.outros | 0), grau };
  }

  function derivados(h) {
    const n = Math.max(1, Math.min(20, h.nivel | 0 || 1));
    const bt = bonusTreino(n), p = PARTIDAS[h.partida];
    const CON = valBase(h, 'CON'), ESP = valBase(h, 'ESP'); // a vida não muda com a Hollowficação
    const vidaNiveis = Array.from({ length: n - 1 }, (_, i) => pvPorNivel(i + 2)).reduce((a, b) => a + b, 0);
    const pvMax = (p ? p.pv : 10) + CON * (1 + marcosAte(n)) + vidaNiveis + (h.pvExtra | 0);
    const manaMax = 5 + ESP * (1 + marcosAte(n)) + 3 * (n - 1) + (h.manaExtra | 0);
    const defAttr = h.defAttr === 'FOR' ? 'FOR' : 'DES';
    const defesa = 10 + Math.floor(n / 2) + val(h, defAttr) + (h.defExtra | 0) + (h.partida === 'duelista' && h.duelistaMao ? 1 : 0);
    const per = bonusPericia(h, 'percepcao', bt);
    const pontosAttr = 7 + 3 + 2 * aumentosAte(n);
    const gastos = TODOS.reduce((s, a) => s + valBase(h, a), 0);
    const afinGasta = CAMINHOS.reduce((s, c) => s + ((h.afinidades || {})[c.id] | 0), 0);
    const afinTotal = n + 2; // 1 ponto de progressão por nível + 2 do Ponto de Partida
    const cdAttr = h.cdAttr || 'ESP', kidoAttr = h.kidoAttr || 'INT';
    const r = {
      n, bt, pvMax, manaMax, defesa, defAttr, atencao: 10 + per.total, percepcao: per.total, desloc: 9 + (h.deslExtra | 0),
      dureza: (h.dureza | 0) + (h.partida === 'lutador' ? 2 : 0),
      cdClasse: 10 + val(h, cdAttr) + bt, cdKido: 10 + val(h, kidoAttr) + bt, cdAttr, kidoAttr,
      pontosAttr, gastos, afinGasta, afinTotal, limite: limiteAttr(n), mestrias: mestrias(n),
    };
    return HB.modoManual ? HB.modoManual(h, r) : r;
  }

  // ---------- Dados ----------
  const d = l => HB.D.d(l);
  function rolarExpr(expr) {
    const limpo = String(expr || '0').replace(/\s+/g, '').toLowerCase();
    if (!/^[-+]?(\d*d\d+|\d+)([-+](\d*d\d+|\d+))*$/.test(limpo)) return { dados: [], total: 0, ok: false };
    let total = 0; const dados = [];
    limpo.match(/[-+]?[^-+]+/g).forEach(t => {
      const s = t[0] === '-' ? -1 : 1, x = t.replace(/^[-+]/, '');
      if (x.includes('d')) { let [q, l] = x.split('d').map(Number); q = Math.min(q || 1, 30); for (let i = 0; i < q; i++) { const v = d(l); dados.push({ l, v, neg: s < 0 }); total += s * v; } }
      else total += s * +x;
    });
    return { dados, total, ok: true };
  }
  // Teste d20 genérico: bônus somado; nat 20/1 marcados.
  function testeD20(quem, titulo, bonus, nota) {
    const v = d(20);
    return { tipo: 'teste', quem, titulo, formula: '1d20 ' + (bonus >= 0 ? '+ ' : '− ') + Math.abs(bonus), dados: [{ l: 20, v }], bonus, total: v + bonus, nota: [nota, v === 20 ? '20 natural' : v === 1 ? '1 natural' : ''].filter(Boolean).join(' · '), nat: v };
  }
  // Jogada de ataque contra Defesa: 20 natural sobe um grau, 1 natural é Desastre (sempre erra).
  // Margem de crítico da arma (ex.: 18) só vira crítico se o ataque já acertar. Crítico dobra o dano total.
  function jogadaAtaque(quem, nome, bonusAtaque, danoExpr, bonusDano, opts = {}) {
    const v = d(20), total = v + bonusAtaque, alvoDef = opts.alvoDef == null ? null : opts.alvoDef;
    const dano = rolarExpr(danoExpr);
    let danoTotal = dano.total + (bonusDano | 0);
    let grau = alvoDef == null ? null : total >= alvoDef ? 1 : 0;
    let critico = false, desastre = v === 1;
    if (desastre) grau = 0;
    else if (v === 20) { if (grau === 0) grau = 1; else critico = true; }
    else if (v >= (opts.margem || 20) && (grau === 1 || alvoDef == null)) critico = true;
    if (alvoDef == null && v === 20) critico = true;
    if (critico) danoTotal *= 2;
    const r = {
      tipo: 'ataque', quem, titulo: nome, formula: '1d20 ' + (bonusAtaque >= 0 ? '+ ' : '− ') + Math.abs(bonusAtaque), dados: [{ l: 20, v }], bonus: bonusAtaque, total,
      dano: { formula: danoExpr + (bonusDano ? (bonusDano > 0 ? ' + ' : ' − ') + Math.abs(bonusDano) : '') + (critico ? ' ×2' : ''), dados: dano.dados, total: Math.max(0, danoTotal) },
      alvoDef, acertou: grau == null ? null : grau >= 1, critico, desastre,
      nota: [opts.nota, critico ? 'Crítico: dano dobrado' : '', desastre ? 'Desastre: erra e abre guarda' : ''].filter(Boolean).join(' · '),
    };
    return r;
  }

  // ---------- Guia de inimigos (níveis 1 a 10) ----------
  const G = {
    pontos: [[6, 8, 10, 12], [6, 8, 10, 12], [8, 10, 12, 14], [8, 10, 12, 14], [8, 10, 12, 14], [10, 12, 14, 16], [10, 12, 14, 16], [10, 12, 14, 16], [12, 14, 16, 18], [12, 14, 16, 18]],
    pv: [[[25, 0], [30, 1], [35, 1], [40, 1]], [[30, 0], [40, 1], [45, 1], [50, 1]], [[35, 0], [50, 1], [55, 1], [60, 1]], [[40, 0], [60, 1], [65, 1], [70, 1]], [[50, 1], [75, 2], [85, 2], [95, 2]],
      [[60, 1], [90, 2], [105, 2], [120, 2]], [[70, 1], [105, 2], [125, 2], [145, 2]], [[80, 1], [120, 2], [145, 2], [170, 2]], [[90, 1], [135, 2], [165, 2], [195, 2]], [[110, 2], [155, 3], [190, 3], [225, 3]]],
    defesa: [[11, 13, 15, 17], [11, 13, 15, 17], [12, 14, 16, 18], [12, 14, 16, 18], [14, 16, 18, 21], [14, 16, 18, 22], [15, 17, 19, 22], [15, 17, 19, 23], [16, 18, 20, 23], [16, 18, 20, 24]],
    tr: [[1, 3, 5, 7], [1, 3, 5, 7], [2, 4, 6, 8], [2, 4, 6, 8], [3, 5, 7, 9], [3, 5, 7, 9], [4, 6, 8, 10], [4, 6, 8, 10], [5, 7, 9, 11], [5, 7, 9, 11]],
    ataque: [[2, 3, 4, 6], [2, 3, 4, 6], [3, 4, 5, 7], [3, 4, 5, 7], [4, 6, 7, 9], [4, 6, 7, 9], [5, 7, 8, 10], [5, 7, 8, 10], [6, 8, 9, 11], [6, 9, 11, 13]],
    dano: [['1d6+1', '1d6+3', '1d6+5', '1d8+6'], ['1d6+4', '1d8+5', '1d10+6', '2d6+7'], ['1d8+6', '1d10+7', '2d6+7', '2d6+11'], ['2d6+6', '2d6+8', '2d6+10', '2d10+11'], ['2d6+9', '2d8+9', '2d8+11', '2d12+13'],
      ['2d6+13', '2d10+11', '2d10+13', '3d10+15'], ['2d8+15', '2d10+15', '2d12+15', '3d12+17'], ['2d10+17', '2d12+17', '3d10+16', '4d8+23'], ['2d12+19', '3d10+18', '3d12+17', '4d10+24'], ['3d8+23', '3d10+22', '4d10+18', '4d10+29']],
    cd: [[11, 13, 15, 17], [11, 13, 15, 17], [12, 14, 16, 18], [12, 14, 16, 18], [14, 16, 18, 21], [14, 16, 18, 22], [15, 17, 19, 22], [15, 17, 19, 23], [16, 18, 20, 23], [16, 18, 20, 24]],
  };
  const PERFIS = ['Baixo', 'Moderado', 'Alto', 'Extremo'];
  const limiteInimigo = n => 4 + 2 * Math.floor(n / 6);

  HB.SH = {
    ATRIBUTOS, TODOS, nomeAttr, PERICIAS, TRS, CAMINHOS, GLOSSARIO, SEM_DIVISAO, hollowAtiva, bonusHollow, bonusTestesHollow, duracaoHollow, TREINO_VIZARD, CLAS, valBase, graduacao, PARTIDAS, DIVISOES, nomeDivisao, FORMAS, TIPOS_ZANPAKUTO, TIPOS_DANO, CONDICOES,
    bonusTreino, pvPorNivel, MARCOS, AUMENTOS, limiteAttr, val, bonusPericia, bonusTR, derivados,
    rolarExpr, testeD20, jogadaAtaque, G, PERFIS, limiteInimigo,
    sinal: n => (n >= 0 ? '+' : '−') + Math.abs(n),
  };
})(window.HB);
