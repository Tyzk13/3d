// "E se você ganhasse 100 mil toda vez que alguém mentisse pra você?"
// Roteiro original. Cada batida tem a fala (say) e um ou mais planos.
import { W, H, clamp, lerp, ease, ramp } from '../engine/core.js';

const cast = {
  you: { id: 1, skin: 'a', hair: { st: 'tuft', c: 'brown' }, shirt: '#d99a2b', style: 'buttons' },
  boss: { id: 2, skin: 'c', hair: { st: 'bald', c: 'grey' }, shirt: '#2d3350', style: 'suit', tie: '#a3303f', glasses: true, mustache: '#a9a9b4' },
  seller: { id: 3, skin: 'b', hair: { st: 'short', c: 'black' }, shirt: '#3f8a5a', style: 'apron', hat: 'cap', hatC: '#c23b32' },
  friend: { id: 4, skin: 'd', hair: { st: 'curly', c: 'black' }, shirt: '#7a58b5', style: 'hoodie' },
  her: { id: 5, skin: 'e', hair: { st: 'long', c: 'wine' }, shirt: '#c43d5e', style: 'dress' },
};

// vibração do celular: dois pulsos
const buzz = (t, t0 = 0) => (t >= t0 && t < t0 + 0.32) || (t >= t0 + 0.46 && t < t0 + 0.78) ? 1 : 0;
const chip = (ctx, e, s) => e.ui.chip(ctx, s, e.t);
const pix = (at, big = true) => ({ app: 'Banco', title: 'Pix recebido', body: 'R$ 100.000,00', at, big });
const phoneUI = (screen, o = {}) => (ctx, e) => e.ui.phone(ctx, {
  T: e.T, h: o.h || 1210, cy: H * (o.cy || 0.45) + Math.sin(e.T * 1.1) * 6, rot: (o.rot ?? -0.045) + Math.sin(e.T * 0.7) * 0.008,
  buzz: o.buzz ? o.buzz(e.t) : 0, hand: o.hand, skin: '#f3bd8e',
}, (c, w, h) => screen(c, w, h, e));
const BLUR = { dof: 15, dofDim: 0.42, dust: 0.25 };

// posições recorrentes
const SOFA = { at: [-0.3, 4.42], y: 0.13, sit: true };
const LIV_BG = { p: [0.35, 1.5, 1.0], t: [-0.3, 1.0, 4.4], f: 50 };
const OFF_BG = { p: [0.9, 1.6, 0.5], t: [0, 1.1, 3.6], f: 50 };
const REST = { youAt: [-0.6, 4.6], herAt: [0.6, 4.6], y: 0.11 };

export default {
  title: 'Cada mentira vale 100 mil',
  voice: 'pm_alex', speed: 1.0, gap: 0.24, tail: 1.5,
  cast,
  hl: ['cem', 'mil', 'milhões', 'dinheiro', 'reais'],
  fx: { grade: 'cool' },
  music: [{ beat: 0, mood: 'tense' }, { beat: 3, mood: 'playful' }, { beat: 11, mood: 'soft' }, { beat: 13, mood: 'none' }, { beat: 17, mood: 'sad' }],
  beats: [
    { // 0
      say: 'E se você ganhasse cem mil reais toda vez que alguém mentisse pra você?',
      sfx: [{ n: 'whoosh', at: 0 }, { n: 'ding', at: 'cem' }],
      shots: [
        { set: 'living', so: { lampK: 0.75 }, cam: { p: [0.1, 1.45, 2.3], t: [-0.3, 1.36, 4.42], f: 40, to: { p: [-0.05, 1.43, 2.75] }, punch: 0 }, fx: { dof: 7 },
          chars: [{ who: 'you', ...SOFA, face: 'think', pose: 'phone', look: [0.1, 0.5] }] },
        { at: 'toda', set: 'living', so: { lampK: 0.75 }, cam: LIV_BG, fx: BLUR,
          ui: phoneUI((c, w, h, e) => e.ui.offerScreen(c, w, h, { t: e.t, title: 'NOVO ACORDO', amount: 'R$ 100.000', lines: ['a cada mentira que', 'contarem pra você'], btn: 'ACEITAR', sub: 'sem letras miúdas', time: '23:14' })) },
      ],
    },
    { // 1
      say: 'Sem pegadinha. Mentiu, caiu na conta.',
      set: 'living', so: { lampK: 0.75 }, cam: { p: [-0.75, 1.4, 2.85], t: [-0.3, 1.37, 4.42], f: 40, to: { p: [-0.6, 1.4, 3.0] } }, fx: { dof: 7 },
      chars: (t) => [{ who: 'you', ...SOFA, face: t < 1.0 ? 'sus' : 'smug', pose: 'chin', look: [-0.25, 0.1] }],
    },
    { // 2
      say: 'Você aceita na hora.',
      sfx: [{ n: 'click', at: 0.45 }, { n: 'ding', at: 0.62 }],
      set: 'living', so: { lampK: 0.75 }, cam: LIV_BG, fx: BLUR,
      ui: phoneUI((c, w, h, e) => e.ui.offerScreen(c, w, h, { t: e.t, tapAt: 0.45, title: 'NOVO ACORDO', amount: 'R$ 100.000', lines: ['a cada mentira que', 'contarem pra você'], btn: 'ACEITAR', sub: 'sem letras miúdas', time: '23:14' })),
    },
    { // 3
      say: 'Segunda-feira. Seu chefe te chama e diz: seu aumento sai mês que vem.',
      sfx: [{ n: 'whoosh', at: 0 }],
      shots: [
        { set: 'office', cam: { p: [1.0, 1.65, 0.5], t: [0, 1.1, 3.7], f: 52, to: { p: [0.8, 1.6, 0.9] } }, fx: { grade: 'day', dust: 0.2 },
          chars: [{ who: 'boss', at: [0, 4.1], y: 0.11, sit: true, face: 'happy', pose: 'table' }, { who: 'you', at: [0.15, 2.3], back: true, pose: 'down' }],
          ui: (ctx, e) => chip(ctx, e, 'SEGUNDA-FEIRA') },
        { at: 'seu', set: 'office', cam: { p: [0.35, 1.5, 2.1], t: [0, 1.44, 4.1], f: 40, to: { p: [0.28, 1.5, 2.35] } }, fx: { grade: 'day', dof: 5, dust: 0.2 },
          chars: (t) => [{ who: 'boss', at: [0, 4.1], y: 0.11, sit: true, face: Math.sin(t * 13) > 0 ? 'talk' : 'happy', pose: 'table', look: [0, 0.05] }] },
      ],
    },
    { // 4
      say: 'O celular vibra. Cem mil.',
      sfx: [{ n: 'buzz', at: 0.05 }, { n: 'cash', at: 'cem' }],
      set: 'office', cam: OFF_BG, fx: { ...BLUR, grade: 'day' },
      ui: phoneUI((c, w, h, e) => e.ui.lockScreen(c, w, h, { t: e.t, time: '09:12', day: 'segunda-feira', n: [pix(0.12)] }), { buzz: (t) => buzz(t, 0.05) }),
    },
    { // 5
      say: 'Seu amigo manda mensagem: tô chegando.',
      sfx: [{ n: 'pop', at: 'tô' }],
      shots: [
        { set: 'living', so: { time: 'day' }, cam: LIV_BG, fx: { ...BLUR, grade: 'day' },
          ui: (ctx, e) => phoneUI((c, w, h) => e.ui.chatScreen(c, w, h, { t: e.t, name: 'Dudu', time: '19:40', msgs: [{ me: true, text: 'cadê você?? já tá todo mundo aqui', at: -1, hour: '19:38' }, { text: 'tô chegando', at: e.dur * 0.42, hour: '19:40', size: 26 }] }))(ctx, e) },
        { at: 'chegando', set: 'bedroom', so: { time: 'day', lamp: false, phone: false, blanket: '#b5574a', sleeper: { ...cast.friend, face: 'smug', look: [0.3, 0.3] } },
          cam: { p: [-0.25, 1.85, 2.6], t: [-0.45, 0.82, 4.3], f: 40, to: { p: [-0.3, 1.8, 2.75] } }, fx: { grade: 'day', dust: 0.3 },
          props: (g) => g.light([-0.3, 1.1, 4.1], 1.2, '#bcd8ff', 0.5) },
      ],
    },
    { // 6
      say: 'Cem mil.',
      sfx: [{ n: 'cash', at: 0 }],
      set: 'living', so: { time: 'day' }, cam: LIV_BG, fx: { ...BLUR, grade: 'day' },
      ui: phoneUI((c, w, h, e) => e.ui.lockScreen(c, w, h, { t: e.t + 1, time: '19:41', day: 'segunda-feira', n: [pix(0), pix(1.06)] }), { buzz: (t) => buzz(t, 0) }),
    },
    { // 7
      say: 'O vendedor jura que aquele é o último preço.',
      sfx: [{ n: 'whoosh', at: 0 }],
      set: 'shop', cam: { p: [-0.5, 1.5, 0.7], t: [0.2, 1.22, 3.75], f: 42, to: { p: [-0.35, 1.5, 1.0] } }, fx: { grade: 'warm', dust: 0.2 },
      chars: [{ who: 'seller', at: [0.2, 3.78], face: 'sweet', pose: 'heart', look: [-0.1, 0] }],
      props: (g) => {
        g.add([0.95, 1.0, 3.0], () => {
          g.box(0.95, 0.84, 3.0, 0.5, 0.34, 0.3, { c: '#2d5da8' });
          g.at([0.95, 1.36, 2.9], (ctx, s) => {
            ctx.rotate(-0.08); ctx.fillStyle = '#ffe14d'; ctx.strokeStyle = '#17122b'; ctx.lineWidth = Math.max(2, 0.012 * s);
            ctx.beginPath(); ctx.roundRect(-0.3 * s, -0.16 * s, 0.6 * s, 0.32 * s, 0.03 * s); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#b3201c'; ctx.textAlign = 'center'; ctx.font = `800 ${0.1 * s}px Inter`; ctx.fillText('ÚLTIMO', 0, -0.03 * s); ctx.fillText('PREÇO!!', 0, 0.09 * s);
          });
        }, { bias: -0.4 });
      },
    },
    { // 8
      say: 'Cem mil.',
      sfx: [{ n: 'buzz', at: 0 }, { n: 'cash', at: 0.18 }],
      set: 'shop', cam: { p: [0.15, 1.42, 3.95], t: [-0.25, 1.3, 2.1], f: 40, to: { p: [0.1, 1.42, 3.8] } }, fx: { grade: 'warm', dof: 6, dust: 0.2 },
      chars: [{ who: 'you', at: [-0.25, 2.1], face: 'smug', pose: 'phone', look: [0.25, 0.45] }],
      ui: (ctx, e) => e.ui.moneyPop(ctx, W * 0.5, H * 0.3, '+ R$ 100.000', e.t - 0.15),
    },
    { // 9
      say: 'Em uma semana, você tem dois milhões na conta.',
      sfx: [{ n: 'count', at: 0.2 }, { n: 'cash', at: 'dois' }],
      set: 'living', so: { time: 'day' }, cam: LIV_BG, fx: { ...BLUR, grade: 'day' },
      ui: phoneUI((c, w, h, e) => e.ui.bankScreen(c, w, h, { t: e.t, time: '10:30', from: 300000, to: 2000000, t0: 0.2, t1: e.dur * 0.72, delta: '+ 20 Pix esta semana',
        rows: [0, 1, 2, 3, 4].map((i) => ({ label: 'Pix recebido', sub: ['agora', 'há 2 h', 'ontem', 'ontem', 'sexta'][i], v: 100000, at: 0.15 + i * 0.16 })) })),
    },
    { // 10
      say: 'Você larga o emprego. Compra um carro. E começa a torcer pra mentirem pra você.',
      sfx: [{ n: 'whoosh', at: 0 }, { n: 'whoosh', at: 'compra' }, { n: 'horn', at: 'carro' }],
      shots: [
        { set: 'office', cam: { p: [-1.1, 1.55, 0.6], t: [0.1, 1.15, 3.6], f: 52, to: { p: [-0.9, 1.55, 0.9] } }, fx: { grade: 'day', dust: 0.2 },
          chars: (t) => [{ who: 'boss', at: [0, 4.1], y: 0.11, sit: true, face: 'shock', pose: 'shock' }, { who: 'you', at: [lerp(0.5, 0.95, clamp(t / 1.6)), 2.2], face: 'joy', pose: 'wave', walk: 1 }] },
        { at: 'compra', set: 'street', so: { view: 'dusk', car: { x: 0.5, z: 4.3, c: '#c8332c', bow: true, lights: true } }, cam: { p: [0.2, 1.5, -3.2], t: [0.3, 1.0, 4.3], f: 55, to: { p: [0.2, 1.45, -2.5] } }, fx: { grade: 'warm', dust: 0.4 },
          chars: [{ who: 'you', at: [-1.25, 3.3], face: 'joy', pose: 'up', hop: 7 }] },
        { at: 'e', set: 'living', so: { lampK: 0.8 }, cam: { p: [0.2, 1.42, 2.6], t: [-0.3, 1.37, 4.42], f: 40, to: { p: [0.1, 1.42, 2.9] } }, fx: { dof: 7 },
          chars: [{ who: 'you', ...SOFA, face: 'smug', pose: 'hold', look: [0, 0.1] }],
          ui: (ctx, e) => { for (let i = 0; i < 4; i++) e.ui.moneyPop(ctx, W * (0.2 + 0.2 * i), H * (0.3 - (i % 2) * 0.07), '+100.000', e.t - 0.25 - i * 0.42, 0.7); } },
      ],
    },
    { // 11
      say: 'Até o jantar de sábado.',
      gapBefore: 0.45,
      sfx: [{ n: 'whoosh', at: 0 }],
      set: 'restaurant', cam: { p: [0, 1.8, 0.4], t: [0, 1.0, 4.6], f: 46, to: { p: [0, 1.68, 0.8] }, punch: 0 }, fx: { grade: 'warm', dust: 0.5 }, fadeIn: 0.3,
      chars: [{ who: 'you', at: REST.youAt, y: REST.y, sit: true, face: 'happy', pose: 'table', look: [0.7, 0], bias: -0.7 }, { who: 'her', at: REST.herAt, y: REST.y, sit: true, face: 'happy', pose: 'table', look: [-0.7, 0], bias: -0.7 }],
      ui: (ctx, e) => chip(ctx, e, 'SÁBADO'),
    },
    { // 12
      say: 'Sua namorada segura a sua mão, olha nos seus olhos e diz: eu te amo.',
      shots: [
        { set: 'restaurant', cam: { p: [0, 1.32, 0.9], t: [0, 1.1, 4.6], f: 50, to: { p: [0, 1.3, 1.12] } }, fx: { grade: 'warm', dust: 0.5 },
          chars: [{ who: 'you', at: REST.youAt, y: REST.y, sit: true, face: 'happy', pose: 'reachFar', look: [0.7, 0], bias: -0.7 }, { who: 'her', at: REST.herAt, y: REST.y, sit: true, face: 'sweet', pose: 'reachFar', flip: true, look: [0.7, 0], bias: -0.7 }] },
        { at: 'olha', set: 'restaurant', cam: { p: [0.35, 1.42, 2.75], t: [0.6, 1.37, 4.6], f: 40, to: { p: [0.42, 1.41, 3.0] } }, fx: { grade: 'warm', dof: 8, dust: 0.5 },
          chars: (t, u) => [{ who: 'her', at: REST.herAt, y: REST.y, sit: true, face: u > 0.62 ? 'love' : 'sweet', pose: 'table', look: [-0.12, 0], bias: -0.7 }] },
      ],
    },
    { // 13
      say: 'O celular vibra.',
      gapBefore: 0.5,
      sfx: [{ n: 'buzz', at: -0.25 }, { n: 'hit', at: 0.25 }],
      set: 'restaurant', cam: { p: [0, 1.9, 3.3], t: [0, 0.8, 4.55], f: 40, punch: 0.07 }, fx: { dof: 16, dofDim: 0.5, dust: 0.3, grade: 'warm' },
      ui: phoneUI((c, w, h, e) => e.ui.lockScreen(c, w, h, { t: e.t, time: '21:47', day: 'sábado', n: [pix(0.1)], wall: ['#1a0f24', '#3b1730', '#0c0812'] }), { buzz: (t) => buzz(t, 0), hand: false, rot: 0.06, h: 1150 }),
    },
    { // 14
      say: 'Você olha pra tela. Depois pra ela. Ela continua sorrindo.',
      sfx: [{ n: 'heart', at: 0, dur: 5 }],
      shots: [
        { set: 'restaurant', cam: { p: [-0.35, 1.42, 2.8], t: [-0.6, 1.37, 4.6], f: 40, to: { p: [-0.4, 1.41, 3.0] } }, fx: { grade: 'warm', dof: 8, dust: 0.4, vig: 0.72 },
          chars: [{ who: 'you', at: REST.youAt, y: REST.y, sit: true, face: 'shock', pose: 'table', look: [0.2, 0.9], bias: -0.7 }] },
        { at: 'depois', set: 'restaurant', cam: { p: [-0.4, 1.41, 3.0], t: [-0.6, 1.37, 4.6], f: 40, to: { p: [-0.44, 1.41, 3.12] }, punch: 0 }, fx: { grade: 'warm', dof: 8, dust: 0.4, vig: 0.72 },
          chars: [{ who: 'you', at: REST.youAt, y: REST.y, sit: true, face: 'hurt', pose: 'table', look: [0.75, -0.1], bias: -0.7 }] },
        { at: 'ela', set: 'restaurant', cam: { p: [0.38, 1.42, 2.6], t: [0.6, 1.37, 4.6], f: 40, to: { p: [0.5, 1.4, 3.25] }, e: 'lin' }, fx: { grade: 'warm', dof: 8, dust: 0.4, vig: 0.78 },
          chars: [{ who: 'her', at: REST.herAt, y: REST.y, sit: true, face: 'happy', pose: 'table', look: [-0.12, 0], bias: -0.7 }] },
      ],
    },
    { // 15
      say: 'Você pergunta: você tá feliz comigo? Ela responde: claro que tô.',
      shots: [
        { set: 'restaurant', cam: { p: [-0.3, 1.42, 2.9], t: [-0.6, 1.37, 4.6], f: 40, to: { p: [-0.36, 1.41, 3.05] } }, fx: { grade: 'warm', dof: 8, dust: 0.4, vig: 0.72 },
          chars: (t) => [{ who: 'you', at: REST.youAt, y: REST.y, sit: true, face: { eyes: 'dot', mouth: Math.sin(t * 12) > 0 ? 'o' : 'wavy', brows: 'worried', sweat: true }, pose: 'table', look: [0.7, 0], bias: -0.7 }] },
        { at: 'ela', set: 'restaurant', cam: { p: [0.42, 1.41, 2.95], t: [0.6, 1.37, 4.6], f: 40, to: { p: [0.46, 1.41, 3.1] } }, fx: { grade: 'warm', dof: 8, dust: 0.4, vig: 0.75 },
          chars: (t, u) => [{ who: 'her', at: REST.herAt, y: REST.y, sit: true, face: u > 0.45 ? 'love' : 'happy', pose: 'table', look: [-0.12, 0], bias: -0.7 }] },
      ],
    },
    { // 16
      say: 'Vibra de novo.',
      sfx: [{ n: 'buzz', at: -0.2 }, { n: 'hit', at: 0.3 }],
      set: 'restaurant', cam: { p: [0, 1.9, 3.3], t: [0, 0.8, 4.55], f: 40, punch: 0.07 }, fx: { dof: 16, dofDim: 0.5, dust: 0.3, grade: 'warm' },
      ui: phoneUI((c, w, h, e) => e.ui.lockScreen(c, w, h, { t: e.t + 1, time: '21:48', day: 'sábado', n: [pix(0), pix(1.08)], wall: ['#1a0f24', '#3b1730', '#0c0812'] }), { buzz: (t) => buzz(t, 0), hand: false, rot: 0.06, h: 1150 }),
    },
    { // 17
      say: 'Naquela noite, você é a pessoa mais rica que você conhece. E não consegue dormir.',
      gapBefore: 0.5,
      shots: [
        { set: 'bedroom', so: { sleeper: { ...cast.you, face: 'awake', look: [0, -0.4] }, phoneK: 0.5 }, cam: { p: [-0.1, 2.35, 1.5], t: [-0.45, 0.7, 4.1], f: 46, to: { p: [-0.2, 2.2, 1.9] }, punch: 0 }, fx: { grade: 'cold', dust: 0.5 }, fadeIn: 0.35 },
        { at: 'e', set: 'bedroom', so: { sleeper: { ...cast.you, face: 'awake', look: [0.2, -0.5] }, phoneK: 0.5 }, cam: { p: [-0.3, 1.75, 2.8], t: [-0.45, 0.84, 4.4], f: 40, to: { p: [-0.35, 1.7, 3.0] } }, fx: { grade: 'cold', dust: 0.5 } },
      ],
    },
    { // 18
      say: 'De madrugada, você vai até o espelho e fala baixinho: tá tudo bem. Eu tô bem.',
      shots: [
        { set: 'bathroom', so: { reflect: { ...cast.you, at: [0.05, 2.62], face: 'tired', look: [0, 0.1] }, phone: true, phoneOn: false },
          cam: { p: [1.0, 1.62, 0.3], t: [0.1, 1.25, 3.4], f: 55, to: { p: [0.9, 1.58, 0.6] } }, fx: { grade: 'cold', dust: 0.3 },
          chars: [{ who: 'you', at: [0.05, 2.62], back: true, pose: 'down' }] },
        { at: 'tá', set: 'bathroom', so: (t, u) => ({ reflect: { ...cast.you, at: [0.05, 2.5], face: { eyes: 'dot', mouth: 'smile', brows: 'worried', bags: true }, look: [0.1, 0] }, phone: true, phoneOn: false }),
          cam: { p: [0.2, 1.4, 2.45], t: [0.05, 1.3, 3.4], f: 46, to: { p: [0.17, 1.38, 2.62] } }, fx: { grade: 'cold', dust: 0.3 } },
      ],
    },
    { // 19
      say: 'E o celular vibra.',
      gapBefore: 0.4,
      sfx: [{ n: 'buzz', at: 0.25 }, { n: 'hit', at: 0.55 }],
      set: 'bathroom', so: { phone: true, phoneOn: true }, cam: { p: [0.5, 1.6, 1.4], t: [0.2, 0.95, 3.1], f: 40, punch: 0.07 }, fx: { dof: 16, dofDim: 0.5, dust: 0.3, grade: 'cold' },
      ui: phoneUI((c, w, h, e) => e.ui.lockScreen(c, w, h, { t: e.t, time: '03:12', day: 'domingo', n: [pix(0.3)], wall: ['#0b1024', '#16224a', '#070912'] }), { buzz: (t) => buzz(t, 0.25), hand: false, rot: -0.07, h: 1150 }),
    },
    { // 20
      say: 'Porque a mentira que você conta pra si mesmo... também paga.',
      set: 'bathroom', so: { reflect: { ...cast.you, at: [0.05, 2.5], face: 'cry', look: [0, 0.35] }, phone: true, phoneOn: true },
      cam: { p: [0.17, 1.38, 2.5], t: [0.05, 1.3, 3.4], f: 46, to: { p: [0.12, 1.36, 2.75] }, e: 'lin', punch: 0 }, fx: { grade: 'cold', dust: 0.3, vig: 0.75 },
    },
    { // 21
      say: 'E aí? Você ia preferir a verdade... ou o dinheiro?',
      sfx: [{ n: 'riser', at: -0.6 }, { n: 'hit', at: 0 }],
      set: 'bathroom', so: { phone: true, phoneOn: true }, cam: { p: [0.5, 1.6, 0.6], t: [0.1, 1.3, 3.4], f: 46, punch: 0.05 }, fx: { dof: 18, dofDim: 0.62, dust: 0.5, grade: 'cold' },
      ui: (ctx, e) => {
        const a = ease.out(ramp(e.t, 0.05, 0.4));
        e.ui.bigText(ctx, [{ s: 'A VERDADE', size: 130 }, { s: 'ou', size: 76, c: '#cfd3e6' }, { s: 'O DINHEIRO?', size: 130, c: '#7dff9c' }], { y: H * 0.24, a, pop: 0.9 + 0.1 * ease.back(ramp(e.t, 0.05, 0.4)) });
        if (e.t > 1.4) { e.ui.bigText(ctx, [{ s: 'comenta aqui', size: 62, c: '#ffe14d' }], { y: H * 0.5, a: ramp(e.t, 1.4, 1.7) }); e.ui.arrowDown(ctx, W / 2, H * 0.555, 0.75, e.T); }
      },
    },
  ],
};
