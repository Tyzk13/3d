// "E se te pagassem 1 milhão pra ouvir o pensamento de todo mundo por 24 horas?"
// Roteiro original: começa leve, termina em susto.
import { W, H, TAU, clamp, lerp, ease, ramp, hash } from '../engine/core.js';

const cast = {
  you: { id: 1, skin: 'a', hair: { st: 'messy', c: 'navy' }, shirt: '#1f9e8f', style: 'hoodie', pants: '#2b3352' },
  boss: { id: 2, skin: 'c', hair: { st: 'slick', c: 'grey' }, shirt: '#3a3f5c', style: 'suit', tie: '#a3303f', mustache: '#b3b3bd', browC: '#6d6d78' },
  seller: { id: 3, skin: 'b', hair: { st: 'short', c: 'black' }, shirt: '#e07a3a', style: 'apron', hat: 'cap', hatC: '#2d5da8' },
  friend: { id: 4, skin: 'd', hair: { st: 'short', c: 'black' }, shirt: '#d94f4f', style: 'tee', print: '#ffe14d', beard: '#2a1d1a', pants: '#3b3f4a' },
  her: { id: 5, skin: 'e', hair: { st: 'bob', c: 'black' }, shirt: '#d1425f', style: 'dress', earring: '#ffd34d' },
};
const YOU = cast.you;

const phoneUI = (screen, o = {}) => (ctx, e) => e.ui.phone(ctx, {
  T: e.T, h: o.h || 1210, cy: H * (o.cy || 0.45) + Math.sin(e.T * 1.1) * 6, rot: (o.rot ?? -0.045) + Math.sin(e.T * 0.7) * 0.008,
  buzz: 0, hand: o.hand, skin: '#f3bd8e',
}, (c, w, h) => screen(c, w, h, e));
const BLUR = { dof: 15, dofDim: 0.42, dust: 0.25 };
const SOFA = { at: [-0.3, 4.42], y: 0.13, sit: true };
const LIV_BG = { p: [0.35, 1.5, 1.0], t: [-0.3, 1.0, 4.4], f: 50 };
const OFFER = { title: 'NOVO ACORDO', amount: 'R$ 1.000.000', lines: ['pra ouvir o pensamento', 'de todo mundo por 24 horas'], btn: 'ACEITAR', sub: 'válido por um dia', time: '23:02', icon: '?', accent: '#8b5cf6' };
// balões: fala (branco) e pensamento (nuvem lilás)
const say = (ctx, e, text, at, o = {}) => e.ui.bubble(ctx, { x: W / 2, y: H * 0.2, tail: [W / 2, H * 0.33], text, t: e.t - at, T: e.T, kind: 'say', size: 60, maxW: 640, ...o });
const think = (ctx, e, text, at, o = {}) => e.ui.bubble(ctx, { x: W / 2, y: H * 0.19, tail: [W / 2, H * 0.34], text, t: e.t - at, T: e.T, kind: 'think', size: 56, maxW: 660, ...o });
// ondas de "escutar"
const waves = (ctx, e, x, y) => {
  ctx.save(); ctx.strokeStyle = '#b79bff'; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const u = ((e.T * 1.4 + i / 3) % 1); ctx.globalAlpha = (1 - u) * 0.9; ctx.lineWidth = 12 - u * 6; ctx.beginPath(); ctx.arc(x, y, 60 + u * 170, -0.7, 0.7); ctx.stroke(); ctx.beginPath(); ctx.arc(x - 2 * (x - W / 2), y, 60 + u * 170, Math.PI - 0.7, Math.PI + 0.7); ctx.stroke(); }
  ctx.restore();
};
const BED = { wardrobe: { gap: true }, phone: false, moon: 0.5 };
// luz fria no armário, para ele aparecer no escuro
const WLIGHT = (g) => g.light([1.15, 1.7, 3.1], 2.6, '#93a6ee', 0.75);
const SNIPS = ['que chato', 'falso', 'nem gosto dele', 'devagar demais', 'puxa-saco', 'interesseiro', 'coitado', 'ninguém aguenta'];

export default {
  title: 'Um milhão pra ouvir pensamentos',
  voice: 'pm_alex', speed: 0.96, gap: 0.26, tail: 1.8,
  cast,
  hl: ['milhão', 'reais'],
  fx: { grade: 'cool' },
  music: [{ beat: 0, mood: 'tense' }, { beat: 2, mood: 'playful' }, { beat: 7, mood: 'dread' }, { beat: 9, mood: 'none' }, { beat: 12, mood: 'dread' }],
  beats: [
    { // 0
      say: 'E se te pagassem um milhão de reais pra ouvir o pensamento de todo mundo... por vinte e quatro horas?',
      sfx: [{ n: 'whoosh', at: 0 }, { n: 'ding', at: 'milhão' }],
      shots: [
        { set: 'living', so: { lampK: 0.75 }, cam: { p: [0.1, 1.45, 2.3], t: [-0.3, 1.36, 4.42], f: 40, to: { p: [-0.05, 1.43, 2.75] }, punch: 0 }, fx: { dof: 7 },
          chars: [{ who: 'you', ...SOFA, face: 'think', pose: 'phone', look: [0.1, 0.5] }],
          ui: (ctx, e) => e.ui.bigText(ctx, [{ s: 'R$ 1 MILHÃO', size: 100, c: '#7dff9c' }, { s: 'PRA OUVIR PENSAMENTOS', size: 66 }], { y: H * 0.115, a: ramp(e.t, 0, 0.2), pop: 0.9 + 0.1 * ease.back(ramp(e.t, 0, 0.3)) }) },
        { at: 'um', set: 'living', so: { lampK: 0.75 }, cam: LIV_BG, fx: BLUR,
          ui: phoneUI((c, w, h, e) => e.ui.offerScreen(c, w, h, { t: e.t, ...OFFER })) },
      ],
    },
    { // 1
      say: 'Você topa. É só um dia.',
      sfx: [{ n: 'click', at: 0.3 }, { n: 'ding', at: 0.48 }],
      shots: [
        { set: 'living', so: { lampK: 0.75 }, cam: LIV_BG, fx: BLUR,
          ui: phoneUI((c, w, h, e) => e.ui.offerScreen(c, w, h, { t: e.t, tapAt: 0.3, ...OFFER })) },
        { at: 'é', set: 'living', so: { lampK: 0.75 }, cam: { p: [-0.7, 1.4, 2.85], t: [-0.3, 1.37, 4.42], f: 40, to: { p: [-0.6, 1.4, 3.0] } }, fx: { dof: 7 },
          chars: [{ who: 'you', ...SOFA, face: 'smug', pose: 'shrug', look: [-0.2, 0] }] },
      ],
    },
    { // 2
      say: 'De manhã, seu chefe sorri e diz: bom dia, campeão.',
      sfx: [{ n: 'whoosh', at: 0 }, { n: 'pop', at: 'bom' }],
      shots: [
        { set: 'office', cam: { p: [1.0, 1.65, 0.5], t: [0, 1.1, 3.7], f: 52, to: { p: [0.8, 1.6, 0.9] } }, fx: { grade: 'day', dust: 0.2 },
          chars: [{ who: 'boss', at: [0, 4.1], y: 0.11, sit: true, face: 'happy', pose: 'table' }, { who: 'you', at: [0.15, 2.3], back: true, pose: 'down' }],
          ui: (ctx, e) => e.ui.chip(ctx, 'DE MANHÃ', e.t) },
        { at: 'sorri', set: 'office', cam: { p: [0.35, 1.5, 2.1], t: [0, 1.44, 4.1], f: 40, to: { p: [0.28, 1.5, 2.35] } }, fx: { grade: 'day', dof: 5, dust: 0.2 },
          chars: (t) => [{ who: 'boss', at: [0, 4.1], y: 0.11, sit: true, face: 'joy', pose: 'table', look: [0, 0.05] }],
          ui: (ctx, e) => say(ctx, e, 'Bom dia, campeão!', e.wt('bom')) },
      ],
    },
    { // 3
      say: 'Mas você escuta o que ele pensa: sexta-feira eu demito esse aí.',
      sfx: [{ n: 'think', at: 'escuta' }, { n: 'think', at: 'sexta-feira' }],
      shots: [
        { set: 'office', cam: { p: [0.3, 1.45, 3.45], t: [0.1, 1.32, 1.9], f: 46, to: { p: [0.27, 1.44, 3.3] } }, fx: { grade: 'day', dof: 6, dust: 0.2 },
          chars: [{ who: 'you', at: [0.1, 1.9], face: 'sus', pose: 'down', look: [0.1, 0] }],
          ui: (ctx, e) => waves(ctx, e, W * 0.9, H * 0.4) },
        { at: 'sexta-feira', set: 'office', cam: { p: [0.28, 1.5, 2.35], t: [0, 1.44, 4.1], f: 40, to: { p: [0.2, 1.49, 2.7] }, e: 'lin' }, fx: { grade: 'day', dof: 5, dust: 0.2, vig: 0.7 },
          chars: [{ who: 'boss', at: [0, 4.1], y: 0.11, sit: true, face: 'joy', pose: 'table', look: [0, 0.05] }],
          ui: (ctx, e) => think(ctx, e, 'sexta-feira eu demito esse aí', 0.05) },
      ],
    },
    { // 4
      say: 'O vendedor te chama de patrão. E pensa: esse trouxa paga qualquer preço.',
      sfx: [{ n: 'whoosh', at: 0 }, { n: 'pop', at: 'patrão' }, { n: 'think', at: 'esse' }],
      shots: [
        { set: 'shop', cam: { p: [-0.5, 1.5, 0.7], t: [0.2, 1.22, 3.75], f: 42, to: { p: [-0.35, 1.5, 1.0] } }, fx: { grade: 'warm', dust: 0.2 },
          chars: [{ who: 'seller', at: [0.2, 3.78], face: 'joy', pose: 'wave', look: [-0.1, 0] }],
          ui: (ctx, e) => say(ctx, e, 'Fala, patrão!', e.wt('patrão') - 0.25, { y: H * 0.21, tail: [W * 0.55, H * 0.36] }) },
        { at: 'e', set: 'shop', cam: { p: [0.0, 1.46, 1.9], t: [0.2, 1.3, 3.78], f: 40, to: { p: [0.05, 1.45, 2.15] }, e: 'lin' }, fx: { grade: 'warm', dof: 5, dust: 0.2, vig: 0.7 },
          chars: [{ who: 'seller', at: [0.2, 3.78], face: 'sweet', pose: 'heart', look: [-0.05, 0] }],
          ui: (ctx, e) => think(ctx, e, 'esse trouxa paga qualquer preço', e.wt('esse') - 0.1) },
      ],
    },
    { // 5
      say: 'Seu melhor amigo te abraça. E pensa: tomara que ele nunca descubra.',
      sfx: [{ n: 'whoosh', at: 0 }, { n: 'think', at: 'tomara' }],
      shots: [
        { set: 'living', so: { time: 'day' }, cam: { p: [0, 1.45, 0.25], t: [0, 1.15, 2.6], f: 46, to: { p: [0, 1.43, 0.5] } }, fx: { grade: 'day', dust: 0.3 },
          chars: [{ who: 'you', at: [-0.3, 2.6], face: 'happy', pose: 'down', look: [0.4, 0] }, { who: 'friend', at: [0.3, 2.62], face: 'joy', pose: 'reachFar', flip: true, look: [0.3, 0], bias: -0.2 }] },
        { at: 'e', set: 'living', so: { time: 'day' }, cam: { p: [0.45, 1.44, 0.95], t: [0.3, 1.32, 2.62], f: 40, to: { p: [0.42, 1.43, 1.2] }, e: 'lin' }, fx: { grade: 'day', dof: 6, dust: 0.3, vig: 0.7 },
          chars: [{ who: 'friend', at: [0.3, 2.62], face: 'happy', pose: 'down', look: [-0.3, 0.1] }],
          ui: (ctx, e) => think(ctx, e, 'tomara que ele nunca descubra', e.wt('tomara') - 0.1) },
      ],
    },
    { // 6
      say: 'Sua namorada diz que tá tudo bem. E pensa: ele nem percebeu que eu chorei.',
      sfx: [{ n: 'whoosh', at: 0 }, { n: 'pop', at: 'tá' }, { n: 'think', at: 'ele' }],
      shots: [
        { set: 'restaurant', cam: { p: [0.35, 1.42, 2.75], t: [0.6, 1.37, 4.6], f: 40, to: { p: [0.4, 1.41, 2.95] } }, fx: { grade: 'warm', dof: 8, dust: 0.5 },
          chars: [{ who: 'her', at: [0.6, 4.6], y: 0.11, sit: true, face: 'happy', pose: 'table', look: [-0.12, 0], bias: -0.7 }],
          ui: (ctx, e) => say(ctx, e, 'Tá tudo bem!', e.wt('tá') - 0.1) },
        { at: 'e', set: 'restaurant', cam: { p: [0.4, 1.41, 2.95], t: [0.6, 1.37, 4.6], f: 40, to: { p: [0.47, 1.4, 3.25] }, e: 'lin', punch: 0 }, fx: { grade: 'warm', dof: 8, dust: 0.5, vig: 0.78 },
          chars: [{ who: 'her', at: [0.6, 4.6], y: 0.11, sit: true, face: 'happy', pose: 'table', look: [-0.12, 0.1], bias: -0.7 }],
          ui: (ctx, e) => think(ctx, e, 'ele nem percebeu que eu chorei', e.wt('ele') - 0.1) },
      ],
    },
    { // 7
      say: 'Você passa o dia ouvindo o que ninguém teve coragem de te dizer.',
      sfx: [{ n: 'riser', at: 0.2, dur: 3.0 }, { n: 'think', at: 0.3 }, { n: 'think', at: 1.1 }, { n: 'think', at: 1.9 }, { n: 'think', at: 2.6 }],
      set: 'void', so: { c1: '#3a2a6a', c2: '#0a0818', lightC: '#c9b8ff', k: 0.7 },
      cam: { p: [0.1, 1.4, 0.2], t: [0, 1.25, 2.2], f: 46, to: { p: [0.05, 1.38, 0.55] }, e: 'lin' }, fx: { dust: 0.6, vig: 0.75 },
      chars: [{ who: 'you', at: [0, 2.2], face: 'scared', pose: 'head', look: [0, 0.1] }],
      ui: (ctx, e) => {
        const pos = [[0.24, 0.13], [0.76, 0.17], [0.2, 0.3], [0.8, 0.33], [0.5, 0.09], [0.24, 0.57], [0.78, 0.55], [0.5, 0.24]];
        SNIPS.forEach((s, i) => e.ui.bubble(ctx, { x: W * pos[i][0], y: H * pos[i][1], text: s, t: e.t - 0.15 - i * 0.36, T: e.T + i, kind: 'think', size: 38, maxW: 330 }));
      },
    },
    { // 8
      say: 'À noite, você só quer silêncio. Chega em casa, tranca a porta e apaga a luz.',
      gapBefore: 0.35,
      sfx: [{ n: 'steps', at: 'chega', dur: 0.9 }, { n: 'lock', at: 'tranca' }, { n: 'switch', at: 'apaga' }],
      shots: [
        { set: 'living', so: { lampK: 0.9 }, cam: { p: [0.3, 1.5, 0.5], t: [0.4, 1.1, 3.6], f: 50, to: { p: [0.35, 1.48, 0.9] }, punch: 0 }, fx: { dust: 0.4 }, fadeIn: 0.3,
          chars: (t, u) => [{ who: 'you', at: [lerp(1.7, 0.75, ease.out(u)), 3.3], face: 'tired', pose: 'down', walk: u < 0.8 ? 1 : 0, look: [-0.3, 0.2] }] },
        { at: 'apaga', set: 'living', so: (t) => ({ lamp: t < 0.22, lampK: 0.9 }), cam: { p: [0.35, 1.48, 0.9], t: [0.4, 1.1, 3.6], f: 50, to: { p: [0.35, 1.48, 1.1] }, punch: 0 }, fx: { dust: 0.4 },
          chars: [{ who: 'you', at: [0.75, 3.3], face: 'tired', pose: 'down', look: [-0.3, 0.2] }] },
      ],
    },
    { // 9
      say: 'Finalmente, nenhum pensamento. Você mora sozinho.',
      gapBefore: 0.4,
      sfx: [{ n: 'tick', at: 0, dur: 9 }],
      shots: [
        { set: 'bedroom', so: { ...BED, sleeper: { ...YOU, face: { eyes: 'half', mouth: 'smile', bags: true }, look: [0, -0.3] } },
          cam: { p: [-0.3, 1.8, 2.7], t: [-0.45, 0.84, 4.4], f: 40, to: { p: [-0.33, 1.75, 2.9] }, punch: 0 }, fx: { grade: 'cold', dust: 0.5 }, fadeIn: 0.3 },
        { at: 'você', set: 'bedroom', so: { ...BED, sleeper: { ...YOU, face: { eyes: 'half', mouth: 'smile', bags: true }, look: [0, -0.3] } },
          cam: { p: [0.5, 2.0, 0.3], t: [0.5, 0.95, 4.4], f: 60, to: { p: [0.5, 1.95, 0.55] }, punch: 0 }, fx: { grade: 'cold', dust: 0.5 } },
      ],
    },
    { // 10
      say: 'Onze e cinquenta e nove. Falta um minuto pro efeito acabar.',
      set: 'bedroom', so: BED, cam: { p: [0.2, 1.55, 0.7], t: [-0.3, 0.9, 4.0], f: 50 }, fx: { ...BLUR, dofDim: 0.68 },
      ui: phoneUI((c, w, h, e) => e.ui.lockScreen(c, w, h, { t: 5, time: '23:59', day: 'terça-feira', n: [], wall: ['#0b1024', '#16224a', '#070912'] }), { hand: false, h: 2500, cy: 0.74, rot: 0 }),
    },
    { // 11
      say: 'Você fecha os olhos.',
      set: 'bedroom', so: (t, u) => ({ ...BED, sleeper: { ...YOU, face: u < 0.45 ? { eyes: 'half', mouth: 'smile', bags: true } : { eyes: 'closed', mouth: 'smile', bags: true } } }),
      cam: { p: [-0.33, 1.75, 2.9], t: [-0.45, 0.84, 4.4], f: 40, to: { p: [-0.36, 1.7, 3.1] }, punch: 0 }, fx: { grade: 'cold', dust: 0.5, vig: 0.72 },
    },
    { // 12
      say: 'E então escuta, bem baixinho, vindo de dentro do armário:',
      gapBefore: 0.5,
      sfx: [{ n: 'heart', at: 0, dur: 6 }, { n: 'riser', at: 1.2, dur: 2.6 }],
      set: 'bedroom', so: BED, cam: { p: [1.0, 1.5, 1.4], t: [1.62, 1.25, 4.22], f: 40, to: { p: [1.35, 1.46, 2.6] }, e: 'in', punch: 0 }, fx: { grade: 'cold', dust: 0.6, vig: 0.8 }, props: WLIGHT,
      ui: (ctx, e) => waves(ctx, e, W * 0.5 + 330, H * 0.45),
    },
    { // 13
      say: 'Será que ele já dormiu?',
      speed: 0.86,
      sfx: [{ n: 'think', at: 0 }, { n: 'sting', at: 'dormiu' }],
      set: 'bedroom', so: (t, u) => ({ ...BED, wardrobe: { gap: true, eyes: ramp(u, 0.5, 0.62) } }),
      cam: { p: [1.4, 1.45, 2.75], t: [1.62, 1.3, 4.22], f: 40, to: { p: [1.5, 1.44, 3.0] }, e: 'lin', punch: 0.06 }, fx: { grade: 'cold', dust: 0.6, vig: 0.82 }, props: WLIGHT,
      ui: (ctx, e) => think(ctx, e, 'será que ele já dormiu?', 0.05, { y: H * 0.2, tail: [W * 0.52, H * 0.37], size: 62 }),
    },
    { // 14
      say: 'E o relógio ainda marca onze e cinquenta e nove.',
      gapBefore: 0.35,
      sfx: [{ n: 'hit', at: 0, gain: 0.7 }, { n: 'heart', at: 0, dur: 4 }],
      set: 'bedroom', so: BED, cam: { p: [0.2, 1.55, 0.7], t: [-0.3, 0.9, 4.0], f: 50 }, fx: { ...BLUR, dofDim: 0.72 },
      ui: phoneUI((c, w, h, e) => e.ui.lockScreen(c, w, h, { t: 5, time: '23:59', day: 'terça-feira', n: [], wall: ['#1a0a12', '#3a0f1c', '#0a0508'] }), { hand: false, h: 2500, cy: 0.74, rot: 0 }),
    },
    { // 15
      say: 'E aí? Você aceitaria o milhão?',
      gapBefore: 0.35,
      sfx: [{ n: 'hit', at: 0 }],
      set: 'bedroom', so: { ...BED, wardrobe: { gap: true, eyes: 1 } }, props: WLIGHT,
      cam: { p: [1.25, 1.5, 2.0], t: [1.62, 1.3, 4.22], f: 40, to: { p: [1.3, 1.48, 2.2] }, punch: 0.06 }, fx: { grade: 'cold', dust: 0.6, vig: 0.8 },
      ui: (ctx, e) => {
        e.ui.bigText(ctx, [{ s: 'VOCÊ ACEITARIA', size: 104 }, { s: 'O MILHÃO?', size: 128, c: '#7dff9c' }], { y: H * 0.2, a: ramp(e.t, 0.05, 0.35), pop: 0.9 + 0.1 * ease.back(ramp(e.t, 0.05, 0.4)) });
        if (e.t > 1.4) { e.ui.bigText(ctx, [{ s: 'comenta aqui', size: 62, c: '#ffe14d' }], { y: H * 0.735, a: ramp(e.t, 1.4, 1.7) }); e.ui.arrowDown(ctx, W / 2, H * 0.785, 0.7, e.T); }
      },
    },
  ],
};
