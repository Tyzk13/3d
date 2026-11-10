// "E se um aplicativo te pagasse 5 mil por noite só pra você dormir?"
// Roteiro original de suspense, em segunda pessoa.
import { W, H, clamp, lerp, ease, ramp } from '../engine/core.js';

const cast = {
  you: { id: 1, skin: 'c', hair: { st: 'pony', c: 'black' }, shirt: '#8f7ad1', style: 'stripe', pants: '#6a5aa8', shoes: '#f1ede4' },
};
const YOU = cast.you;

const buzz = (t, t0 = 0) => (t >= t0 && t < t0 + 0.32) || (t >= t0 + 0.46 && t < t0 + 0.78) ? 1 : 0;
const pay = (at) => ({ app: 'SonoPago', title: 'Pagamento recebido', body: 'R$ 5.000,00', at, big: true, color: '#5b6cff', icon: 'z' });
const phoneUI = (screen, o = {}) => (ctx, e) => e.ui.phone(ctx, {
  T: e.T, h: o.h || 1210, cy: H * (o.cy || 0.45) + Math.sin(e.T * 1.1) * 6, rot: (o.rot ?? -0.045) + Math.sin(e.T * 0.7) * 0.008,
  buzz: o.buzz ? o.buzz(e.t) : 0, hand: o.hand, skin: '#c58a5e',
}, (c, w, h) => screen(c, w, h, e));
const BLUR = { dof: 15, dofDim: 0.45, dust: 0.25 };
const two = (n) => String(Math.floor(n)).padStart(2, '0');
const clk = (h, m, s) => { const tot = h * 3600 + m * 60 + s; return `${two(tot / 3600)}:${two((tot / 60) % 60)}:${two(tot % 60)}`; };

// quarto
const EDGE = { at: [0.5, 3.4], y: 0.16, sit: true };          // sentada na beira da cama
const FOOT = [-0.3, 2.3];                                      // de pé, aos pés da cama
const DOOR = [-1.78, 4.35];
const BG = { p: [0.2, 1.55, 0.7], t: [-0.3, 0.9, 4.0], f: 50 };
const NIGHT = { lamp: 0.75, dresser: true, rec: false };
// câmera fixa da gravação (visão noturna)
const NVCAM = { p: [-0.6, 1.6, 0.3], t: [-0.7, 0.9, 4.2], f: 60, shake: 0, punch: 0, push: 0 };
const NVSO = { ambient: [150, 150, 150], moon: 0, phone: false };
const nv = (h, m, s0, date = 'ONTEM') => (t) => ({ nv: { time: clk(h, m, s0 + t), cam: 'CAM 01 · QUARTO', date }, dust: 0, grade: 'none', bloom: 0.12, vig: 0.3 });
const SLEEP = { eyes: 'closed', mouth: 'flat' };
const REC_ROWS = [
  { d: 'Ontem', hour: 'saída às 03:07', hot: true }, { d: 'Terça-feira', hour: 'saída às 03:07', hot: true }, { d: 'Segunda-feira', hour: 'saída às 03:07', hot: true },
  { d: 'Domingo', hour: 'saída às 03:07', hot: true }, { d: 'Sábado', hour: 'saída às 03:07', hot: true }, { d: 'Sexta-feira', hour: 'saída às 03:07', hot: true }, { d: 'Quinta-feira', hour: 'saída às 03:07', hot: true },
];

export default {
  title: 'O aplicativo que paga pra você dormir',
  voice: 'pm_alex', speed: 0.96, gap: 0.26, tail: 1.8,
  cast,
  hl: ['cinco', 'mil', 'reais'],
  fx: { grade: 'cool' },
  music: [{ beat: 0, mood: 'tense' }, { beat: 3, mood: 'playful' }, { beat: 6, mood: 'dread' }, { beat: 14, mood: 'none' }, { beat: 16, mood: 'dread' }],
  beats: [
    { // 0
      say: 'E se um aplicativo te pagasse cinco mil reais por noite... só pra você dormir?',
      sfx: [{ n: 'whoosh', at: 0 }, { n: 'ding', at: 'cinco' }],
      shots: [
        { set: 'bedroom', so: NIGHT, cam: { p: [0.78, 1.5, 1.55], t: [0.5, 1.4, 3.4], f: 40, to: { p: [0.72, 1.48, 1.8] }, punch: 0 }, fx: { dof: 6 },
          chars: [{ who: 'you', ...EDGE, face: 'think', pose: 'phone', look: [0.1, 0.5] }],
          ui: (ctx, e) => e.ui.bigText(ctx, [{ s: 'R$ 5.000 POR NOITE', size: 84, c: '#7dff9c' }, { s: 'SÓ PRA DORMIR', size: 84 }], { y: H * 0.115, a: ramp(e.t, 0, 0.2), pop: 0.9 + 0.1 * ease.back(ramp(e.t, 0, 0.3)) }) },
        { at: 'cinco', set: 'bedroom', so: NIGHT, cam: BG, fx: BLUR,
          ui: phoneUI((c, w, h, e) => e.ui.appScreen(c, w, h, { t: e.t, rule: 'Deixe o celular gravando você dormir. Só isso.' })) },
      ],
    },
    { // 1
      say: 'A regra é uma só: o celular fica virado pra sua cama, com a câmera ligada.',
      sfx: [{ n: 'whoosh', at: 0 }, { n: 'click', at: 'câmera' }],
      set: 'bedroom', so: { lamp: 0.5, dresser: true, rec: true },
      cam: { p: [-0.2, 1.45, 3.3], t: [-0.45, 0.9, 0.36], f: 40, to: { p: [-0.36, 1.25, 1.95] }, e: 'out' }, fx: { dust: 0.4 },
      props: (g) => g.light([-0.1, 1.5, 1.5], 3.0, '#ffc27a', 1.25),
    },
    { // 2
      say: 'Você acha que é golpe. Mas instala.',
      sfx: [{ n: 'click', at: 'mas' }, { n: 'ding', at: 'instala' }],
      shots: [
        { set: 'bedroom', so: NIGHT, cam: { p: [0.25, 1.46, 1.85], t: [0.5, 1.4, 3.4], f: 40, to: { p: [0.3, 1.46, 2.0] } }, fx: { dof: 6 },
          chars: [{ who: 'you', ...EDGE, face: 'sus', pose: 'chin', look: [-0.2, 0.2] }] },
        { at: 'mas', set: 'bedroom', so: NIGHT, cam: BG, fx: BLUR,
          ui: phoneUI((c, w, h, e) => e.ui.appScreen(c, w, h, { t: e.t, tapAt: 0.08, rule: 'Deixe o celular gravando você dormir. Só isso.' })) },
      ],
    },
    { // 3
      say: 'Na primeira manhã, o dinheiro está lá. Cinco mil.',
      sfx: [{ n: 'whoosh', at: 0 }, { n: 'buzz', at: 'cinco', }, { n: 'cash', at: 'cinco' }],
      shots: [
        { set: 'bedroom', so: { time: 'day', dresser: true }, cam: { p: [0.95, 1.5, 1.15], t: [0.5, 1.22, 3.4], f: 40, to: { p: [0.85, 1.48, 1.45] } }, fx: { grade: 'day', dust: 0.4 },
          chars: [{ who: 'you', ...EDGE, face: 'shock', pose: 'phone', look: [0.15, 0.55], phoneOn: false }] },
        { at: 'cinco', set: 'bedroom', so: { time: 'day', dresser: true }, cam: BG, fx: { ...BLUR, grade: 'day' },
          ui: phoneUI((c, w, h, e) => e.ui.lockScreen(c, w, h, { t: e.t, time: '07:02', day: 'quarta-feira', n: [pay(0.06)], wall: ['#101a44', '#2c3a8c', '#0a0f2a'] }), { buzz: (t) => buzz(t, 0) }) },
      ],
    },
    { // 4
      say: 'Segunda noite, cinco mil. Terceira, cinco mil.',
      sfx: [{ n: 'cash', at: 'cinco' }, { n: 'cash', at: 'cinco#2' }],
      set: 'bedroom', so: { time: 'day', dresser: true }, cam: BG, fx: { ...BLUR, grade: 'day' },
      ui: (ctx, e) => phoneUI((c, w, h) => e.ui.lockScreen(c, w, h, { t: e.t, time: '07:01', day: 'sexta-feira', n: [pay(-9), pay(e.wt('cinco')), pay(e.wt('cinco#2'))], wall: ['#101a44', '#2c3a8c', '#0a0f2a'] }))(ctx, e),
    },
    { // 5
      say: 'Em um mês, você paga todas as suas dívidas... dormindo.',
      sfx: [{ n: 'count', at: 0.2 }, { n: 'cash', at: 'dívidas' }],
      shots: [
        { set: 'bedroom', so: { time: 'day', dresser: true }, cam: BG, fx: { ...BLUR, grade: 'day' },
          ui: phoneUI((c, w, h, e) => e.ui.bankScreen(c, w, h, { t: e.t, time: '08:10', from: 15000, to: 150000, t0: 0.2, t1: e.dur * 0.8, delta: '+ 30 noites pagas',
            rows: [0, 1, 2, 3, 4].map((i) => ({ label: 'SonoPago', sub: ['hoje', 'ontem', 'terça', 'segunda', 'domingo'][i], v: 5000, at: 0.15 + i * 0.16 })) })) },
        { at: 'dormindo', set: 'bedroom', so: { dresser: true, sleeper: { ...YOU, face: { eyes: 'closed', mouth: 'smile' } }, moon: 0.75 },
          cam: { p: [-0.3, 2.3, 1.6], t: [-0.45, 0.7, 4.1], f: 46, to: { p: [-0.35, 2.15, 1.95] } }, fx: { dust: 0.5 },
          ui: (ctx, e) => { e.ui.zzz(ctx, W * 0.6, H * 0.36, e.T); e.ui.moneyPop(ctx, W * 0.36, H * 0.3, '+ R$ 5.000', e.t - 0.25, 0.85); } },
      ],
    },
    { // 6
      say: 'Só que você começa a acordar sem energia. Com terra no tênis. E com um arranhão no rosto que não estava ali ontem.',
      gapBefore: 0.35,
      shots: [
        { set: 'bedroom', so: { time: 'day', dresser: true }, cam: { p: [1.0, 1.5, 1.0], t: [0.5, 1.15, 3.4], f: 42, to: { p: [0.9, 1.48, 1.3] } }, fx: { grade: 'day', dust: 0.4 },
          chars: [{ who: 'you', ...EDGE, face: 'tired', pose: 'down', look: [0, 0.3], lean: 0.04 }] },
        { at: 'com', set: 'bedroom', so: { time: 'day', dresser: true }, cam: { p: [1.15, 1.0, 1.35], t: [0.8, 0.05, 2.75], f: 40, to: { p: [1.05, 0.85, 1.65] } }, fx: { grade: 'day', dust: 0.4 },
          props: (g) => { g.S.footprints(g, [[0.1, 1.55], [0.3, 1.9], [0.45, 2.25], [0.62, 2.55]]); g.S.sneakers(g, 0.8, 2.85, { dirty: true }); } },
        { at: 'e', set: 'bedroom', so: { time: 'day', dresser: true }, cam: { p: [0.3, 1.46, 1.9], t: [0.5, 1.4, 3.4], f: 40, to: { p: [0.36, 1.45, 2.1] } }, fx: { grade: 'day', dof: 6, dust: 0.4 },
          chars: [{ who: 'you', ...EDGE, face: 'scared', pose: 'chin', look: [0.15, 0.1], scratch: true }] },
      ],
    },
    { // 7
      say: 'Então, naquela noite, você faz a única coisa que o aplicativo proíbe. Você abre as gravações.',
      gapBefore: 0.3,
      sfx: [{ n: 'click', at: 'você#2' }],
      shots: [
        { set: 'bedroom', so: { dresser: true, rec: true, moon: 0.35 }, cam: { p: [0.7, 1.5, 1.6], t: [0.5, 1.4, 3.4], f: 40, to: { p: [0.62, 1.47, 1.95] } }, fx: { dof: 6, vig: 0.72 },
          chars: [{ who: 'you', ...EDGE, face: 'nervous', pose: 'phone', look: [0.1, 0.55], scratch: true, phoneK: 0.95 }] },
        { at: 'você#2', set: 'bedroom', so: { dresser: true, rec: true, moon: 0.35 }, cam: BG, fx: BLUR,
          ui: phoneUI((c, w, h, e) => e.ui.recScreen(c, w, h, { rows: REC_ROWS, time: '02:41', scroll: 0 })) },
      ],
    },
    { // 8
      say: 'Três e sete da manhã. Você se levanta. De olhos fechados.',
      gapBefore: 0.3,
      sfx: [{ n: 'hum', at: -0.2, dur: 'beat' }, { n: 'hit', at: 'você', gain: 0.6 }],
      shots: [
        { set: 'bedroom', so: { ...NVSO, sleeper: { ...YOU, face: SLEEP } }, cam: NVCAM, fx: nv(3, 6, 57), flash: 0.5, flashC: '#b9ffcc' },
        { at: 'você', set: 'bedroom', so: { ...NVSO, empty: true }, cam: NVCAM, fx: nv(3, 7, 0),
          chars: [{ who: 'you', at: FOOT, face: SLEEP, pose: 'down', fill: 1 }] },
        { at: 'de', set: 'bedroom', so: { ...NVSO, empty: true }, cam: { p: [-0.42, 1.42, 0.65], t: [-0.3, 1.3, 2.3], f: 46, to: { p: [-0.4, 1.4, 0.85] }, shake: 0, punch: 0.05 }, fx: nv(3, 7, 4),
          chars: [{ who: 'you', at: FOOT, face: SLEEP, pose: 'down', fill: 1 }] },
      ],
    },
    { // 9
      say: 'Calça o tênis, pega a chave e sai de casa.',
      sfx: [{ n: 'hum', at: -0.2, dur: 'beat' }, { n: 'steps', at: 0.1, dur: 1.6 }, { n: 'door', at: 'sai' }],
      shots: [
        { set: 'bedroom', so: { ...NVSO, empty: true }, cam: NVCAM, fx: nv(3, 8, 12),
          chars: (t, u) => [{ who: 'you', at: [lerp(-0.3, -1.5, u), lerp(2.3, 3.1, u)], face: SLEEP, pose: 'down', walk: 1, look: [-0.8, 0], fill: 1 }] },
        { at: 'sai', set: 'bedroom', so: { ...NVSO, empty: true, door: 1 }, cam: NVCAM, fx: nv(3, 9, 30),
          chars: (t, u) => [{ who: 'you', at: [DOOR[0], lerp(4.1, 4.6, u)], back: true, pose: 'down', walk: 1, fill: 1 }] },
      ],
    },
    { // 10
      say: 'Duas horas depois, você volta. Deita. E continua dormindo, como se nada tivesse acontecido.',
      sfx: [{ n: 'hum', at: -0.2, dur: 'beat' }, { n: 'door', at: 'você' }, { n: 'steps', at: 'volta', dur: 1.0 }],
      shots: [
        { set: 'bedroom', so: { ...NVSO, empty: true, door: 1 }, cam: NVCAM, fx: nv(5, 11, 40), flash: 0.4, flashC: '#b9ffcc',
          chars: (t, u) => [{ who: 'you', at: [lerp(DOOR[0], -1.5, u), lerp(4.4, 3.3, u)], face: SLEEP, pose: 'down', walk: 1, scratch: true, fill: 1 }] },
        { at: 'deita', set: 'bedroom', so: { ...NVSO, sleeper: { ...YOU, face: SLEEP, scratch: true } }, cam: { ...NVCAM, to: { p: [-0.58, 1.55, 0.9] } }, fx: nv(5, 13, 2) },
      ],
    },
    { // 11
      say: 'Toda noite. No mesmo horário.',
      sfx: [{ n: 'pop', at: 0 }, { n: 'pop', at: 'no' }],
      set: 'bedroom', so: { dresser: true, rec: true, moon: 0.35 }, cam: BG, fx: BLUR,
      ui: phoneUI((c, w, h, e) => e.ui.recScreen(c, w, h, { rows: REC_ROWS, time: '02:58', scroll: ease.io(ramp(e.t, 0.1, e.dur)) * 430 })),
    },
    { // 12
      say: 'Você rola a tela até a última gravação. A de ontem.',
      sfx: [{ n: 'click', at: 'a#3' }],
      set: 'bedroom', so: { dresser: true, rec: true, moon: 0.35 }, cam: BG, fx: BLUR,
      ui: (ctx, e) => phoneUI((c, w, h) => e.ui.recScreen(c, w, h, { rows: REC_ROWS, time: '03:01', scroll: (1 - ease.io(ramp(e.t, 0, e.wt('a#3') - 0.1))) * 430, sel: e.t >= e.wt('a#3') ? 0 : -1 }))(ctx, e),
    },
    { // 13
      say: 'Dessa vez, antes de sair, você para. Vira o rosto devagar pra câmera. E sorri.',
      gapBefore: 0.3,
      sfx: [{ n: 'hum', at: -0.2, dur: 'beat' }, { n: 'riser', at: 'câmera', dur: 0.9 }, { n: 'sting', at: 'e' }],
      shots: [
        { set: 'bedroom', so: { ...NVSO, empty: true, door: 1 }, cam: { ...NVCAM, to: { p: [-0.75, 1.58, 0.8], t: [-1.1, 1.0, 4.2] } }, fx: nv(3, 9, 26, 'ONTEM'), flash: 0.4, flashC: '#b9ffcc',
          chars: [{ who: 'you', at: [DOOR[0], 4.2], back: true, pose: 'down', fill: 1 }] },
        { at: 'vira', set: 'bedroom', so: { ...NVSO, empty: true, door: 1 }, cam: { p: [-1.3, 1.5, 1.5], t: [-1.78, 1.3, 4.2], f: 40, to: { p: [-1.4, 1.46, 2.0] }, shake: 0, punch: 0 }, fx: nv(3, 9, 31, 'ONTEM'),
          chars: (t, u) => [{ who: 'you', at: [DOOR[0], 4.2], face: SLEEP, pose: 'down', look: [lerp(-1.1, 0, ease.io(ramp(u, 0.05, 0.75))), 0], fill: 1 }] },
        { at: 'e', set: 'bedroom', so: { ...NVSO, empty: true, door: 1 }, cam: { p: [-1.55, 1.3, 2.55], t: [-1.78, 1.12, 4.2], f: 40, to: { p: [-1.6, 1.28, 2.8] }, shake: 0, punch: 0.1, quake: 0.02, quakeDur: 0.5 }, fx: nv(3, 9, 36, 'ONTEM'),
          chars: [{ who: 'you', at: [DOOR[0], 4.2], face: 'creepy', pose: 'down', fill: 1 }] },
      ],
    },
    { // 14
      say: 'Na mesma hora, chega uma notificação:',
      gapBefore: 0.45,
      sfx: [{ n: 'buzz', at: 'chega' }],
      set: 'bedroom', so: { dresser: true, rec: true, moon: 0.3 }, cam: { p: [0.6, 1.48, 1.9], t: [0.5, 1.4, 3.4], f: 40, to: { p: [0.56, 1.46, 2.15] } }, fx: { dof: 6, vig: 0.75 },
      chars: [{ who: 'you', ...EDGE, face: 'shock', pose: 'phone', look: [0.1, 0.6], scratch: true, phoneK: 1.0 }],
    },
    { // 15
      say: 'Você não devia ter visto isso.',
      speed: 0.88,
      sfx: [{ n: 'hit', at: 0 }],
      set: 'bedroom', so: { dresser: true, rec: true, moon: 0.3 }, cam: BG, fx: { ...BLUR, dofDim: 0.6 },
      ui: phoneUI((c, w, h, e) => e.ui.lockScreen(c, w, h, { t: e.t + 0.3, time: '03:06', day: 'quinta-feira', n: [{ app: 'SonoPago', title: 'Aviso', body: 'Você não devia ter visto isso.', warn: true, at: 0, color: '#c0392b', icon: '!' }], wall: ['#1a0a12', '#3a0f1c', '#0a0508'] }), { buzz: (t) => buzz(t, 0) }),
    },
    { // 16
      say: 'Você olha o relógio. Três e seis.',
      sfx: [{ n: 'tick', at: 0, dur: 6 }, { n: 'heart', at: 0, dur: 6 }],
      set: 'bedroom', so: { dresser: true, rec: true, moon: 0.3 }, cam: BG, fx: { ...BLUR, dofDim: 0.7 },
      ui: phoneUI((c, w, h, e) => e.ui.lockScreen(c, w, h, { t: 5, time: '03:06', day: 'quinta-feira', n: [], wall: ['#1a0a12', '#3a0f1c', '#0a0508'] }), { hand: false, h: 2500, cy: 0.74, rot: 0 }),
    },
    { // 17
      say: 'E os seus olhos começam a pesar.',
      speed: 0.9,
      set: 'bedroom', so: { dresser: true, rec: true, moon: 0.25 }, cam: { p: [0.56, 1.46, 2.1], t: [0.5, 1.4, 3.4], f: 40, to: { p: [0.53, 1.44, 2.5] }, e: 'lin', punch: 0 }, fx: (t, u) => ({ dof: 6, vig: 0.75 + 0.2 * u }),
      chars: (t, u) => [{ who: 'you', ...EDGE, pose: 'phone', look: [0.05, 0.3], scratch: true, phoneK: 1.0,
        face: u < 0.3 ? { eyes: 'wide', mouth: 'wavy', brows: 'worried', sweat: true } : u < 0.68 ? { eyes: 'half', mouth: 'wavy', brows: 'worried', bags: true, sweat: true } : { eyes: 'closed', mouth: 'flat', bags: true } }],
      fadeOut: 0.35,
    },
    { // 18
      say: 'E aí? Você instalaria esse aplicativo?',
      gapBefore: 0.35,
      sfx: [{ n: 'hum', at: -0.2, dur: 5 }, { n: 'sting', at: -0.1 }],
      set: 'bedroom', so: { ...NVSO, empty: true }, cam: { p: [-0.42, 1.3, 0.2], t: [-0.3, 1.1, 2.3], f: 46, to: { p: [-0.4, 1.28, 0.42] }, shake: 0, punch: 0.08 }, fx: nv(3, 7, 0, 'HOJE'), flash: 0.5, flashC: '#b9ffcc',
      chars: [{ who: 'you', at: FOOT, face: 'creepy', pose: 'down', scratch: true, fill: 1 }],
      ui: (ctx, e) => {
        e.ui.bigText(ctx, [{ s: 'VOCÊ', size: 104 }, { s: 'INSTALARIA?', size: 104, c: '#7dff9c' }], { y: H * 0.18, a: ramp(e.t, 0.25, 0.5), pop: 0.9 + 0.1 * ease.back(ramp(e.t, 0.25, 0.55)) });
        if (e.t > 1.5) { e.ui.bigText(ctx, [{ s: 'comenta aqui', size: 62, c: '#ffe14d' }], { y: H * 0.735, a: ramp(e.t, 1.5, 1.8) }); e.ui.arrowDown(ctx, W / 2, H * 0.785, 0.7, e.T); }
      },
    },
  ],
};
