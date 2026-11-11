// "E se você visse quanto tempo de vida cada pessoa ainda tem?" — sem dinheiro na história.
import { W, H, clamp, lerp, ease, ramp } from '../engine/core.js';

const cast = {
  you: { id: 1, skin: 'd', hair: { st: 'curly', c: 'black' }, shirt: '#e8743b', style: 'hoodie', pants: '#2b3352' },
  boss: { id: 2, skin: 'e', hair: { st: 'bald', c: 'grey' }, shirt: '#4a4f6c', style: 'suit', tie: '#2d7d6e', glasses: true },
  seller: { id: 3, skin: 'c', hair: { st: 'short', c: 'black' }, shirt: '#3f8a5a', style: 'apron', hat: 'cap', hatC: '#c23b32' },
  friend: { id: 4, skin: 'a', hair: { st: 'messy', c: 'blonde' }, shirt: '#7a58b5', style: 'tee', print: '#ffe14d' },
  her: { id: 5, skin: 'b', hair: { st: 'long', c: 'choc' }, shirt: '#2f9aa8', style: 'dress', earring: '#ffd34d' },
  waiter: { id: 6, skin: 'c', hair: { st: 'slick', c: 'black' }, shirt: '#22212c', style: 'suit', tie: '#22212c', mustache: '#24212e' },
};
const G = '#7dff9c', R = '#ff5a5a';
const tag = (ctx, e, text, o = {}) => e.ui.timer(ctx, o.x ?? W / 2, o.y ?? H * 0.17, text, { c: o.c || G, size: o.size || 64, t: e.t - (o.at || 0.05), T: e.T });
const mmss = (s) => `00:0${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const HER = { at: [0.6, 4.6], y: 0.11, sit: true, bias: -0.7 }, ME = { at: [-0.6, 4.6], y: 0.11, sit: true, bias: -0.7 };
const HERCU = { p: [0.35, 1.42, 2.75], t: [0.6, 1.37, 4.6], f: 40, to: { p: [0.42, 1.41, 3.0] } };
const WARM = { grade: 'warm', dust: 0.5 };

export default {
  title: 'O número em cima da cabeça',
  voice: 'pm_alex', speed: 0.94, gap: 0.3, tail: 1.8,
  cast, hl: [],
  fx: { grade: 'cool' },
  music: [{ beat: 0, mood: 'tense' }, { beat: 2, mood: 'playful' }, { beat: 4, mood: 'soft' }, { beat: 6, mood: 'dread' }, { beat: 10, mood: 'sad' }, { beat: 12, mood: 'none' }],
  beats: [
    { say: 'E se você pudesse ver quanto tempo de vida cada pessoa ainda tem?', sfx: [{ n: 'whoosh', at: 0 }, { n: 'think', at: 'ver' }],
      set: 'street', so: { view: 'dusk' }, cam: { p: [0.3, 1.45, 1.0], t: [0, 1.3, 3.0], f: 40, to: { p: [0.22, 1.44, 1.3] }, punch: 0 }, fx: { dof: 5, dust: 0.4 },
      chars: [{ who: 'you', at: [0, 3.0], face: 'think', pose: 'chin', look: [0.2, -0.5] }],
      ui: (ctx, e) => e.ui.bigText(ctx, [{ s: 'QUANTO TEMPO', size: 96 }, { s: 'CADA UM AINDA TEM', size: 76, c: G }], { y: H * 0.115, a: ramp(e.t, 0, 0.2), pop: 0.9 + 0.1 * ease.back(ramp(e.t, 0, 0.3)) }) },
    { say: 'Um número, flutuando em cima da cabeça de todo mundo.', sfx: [{ n: 'pop', at: 'número' }, { n: 'pop', at: 'cabeça' }],
      set: 'living', so: { time: 'day' }, cam: { p: [0, 1.45, 0.25], t: [0, 1.15, 2.6], f: 46, to: { p: [0, 1.43, 0.5] } }, fx: { grade: 'day', dust: 0.3 },
      chars: [{ who: 'friend', at: [-0.34, 2.6], face: 'joy', pose: 'wave' }, { who: 'her', at: [0.34, 2.62], face: 'happy', pose: 'down' }],
      ui: (ctx, e) => { tag(ctx, e, '60 anos', { x: W * 0.27, y: H * 0.2, size: 52, at: e.wt('número') }); tag(ctx, e, '58 anos', { x: W * 0.73, y: H * 0.2, size: 52, at: e.wt('cabeça') }); } },
    { say: 'Seu chefe: trinta e dois anos. O vendedor da esquina: cinquenta e um.', sfx: [{ n: 'whoosh', at: 0 }, { n: 'pop', at: 'trinta' }, { n: 'whoosh', at: 'o' }, { n: 'pop', at: 'cinquenta' }],
      shots: [
        { set: 'office', cam: { p: [0.35, 1.5, 2.1], t: [0, 1.44, 4.1], f: 40, to: { p: [0.28, 1.5, 2.35] } }, fx: { grade: 'day', dof: 5, dust: 0.2 },
          chars: [{ who: 'boss', at: [0, 4.1], y: 0.11, sit: true, face: 'angry', pose: 'table' }], ui: (ctx, e) => tag(ctx, e, '32 anos', { at: e.wt('trinta') }) },
        { at: 'o', set: 'shop', cam: { p: [0.0, 1.46, 1.9], t: [0.2, 1.3, 3.78], f: 40, to: { p: [0.05, 1.45, 2.15] } }, fx: { grade: 'warm', dof: 5, dust: 0.2 },
          chars: [{ who: 'seller', at: [0.2, 3.78], face: 'joy', pose: 'wave' }], ui: (ctx, e) => tag(ctx, e, '51 anos', { at: e.wt('cinquenta'), y: H * 0.13 }) },
      ] },
    { say: 'Você aprende a não olhar pra cima em hospital. E a abraçar mais forte quem tem pouco.', gapBefore: 0.3,
      set: 'void', so: { c1: '#27406a', c2: '#070a18', lightC: '#bcd4ff', k: 0.7 }, cam: { p: [0.1, 1.4, 0.2], t: [0, 1.25, 2.2], f: 46, to: { p: [0.05, 1.38, 0.55] }, e: 'lin' }, fx: { dust: 0.6, vig: 0.75 },
      chars: [{ who: 'you', at: [0, 2.2], face: 'sad', pose: 'down', look: [0, 0.7] }],
      ui: (ctx, e) => { [['3 dias', 0.22, 0.14, R], ['2 meses', 0.76, 0.19, '#ffd34d'], ['11 horas', 0.3, 0.3, R], ['6 semanas', 0.74, 0.33, '#ffd34d']].forEach(([s, x, y, c], i) => tag(ctx, e, s, { x: W * x, y: H * y, c, size: 42, at: 0.3 + i * 0.55 })); } },
    { say: 'No sábado, você leva sua namorada pra jantar.', gapBefore: 0.3, sfx: [{ n: 'whoosh', at: 0 }],
      set: 'restaurant', cam: { p: [0, 1.8, 0.4], t: [0, 1.0, 4.6], f: 46, to: { p: [0, 1.68, 0.8] }, punch: 0 }, fx: WARM, fadeIn: 0.3,
      chars: [{ who: 'you', ...ME, face: 'happy', pose: 'table', look: [0.7, 0] }, { who: 'her', ...HER, face: 'happy', pose: 'table', look: [-0.7, 0] }],
      ui: (ctx, e) => e.ui.chip(ctx, 'SÁBADO', e.t) },
    { say: 'Em cima dela: quatro minutos.', speed: 0.88, gapBefore: 0.2, sfx: [{ n: 'hit', at: 'quatro' }],
      set: 'restaurant', cam: HERCU, fx: { ...WARM, dof: 8, vig: 0.75 },
      chars: [{ who: 'her', ...HER, face: 'love', pose: 'table', look: [-0.12, 0] }],
      ui: (ctx, e) => tag(ctx, e, '00:04:00', { c: R, size: 72, at: e.wt('quatro') }) },
    { say: 'Você olha de novo. Três e cinquenta e nove.', sfx: [{ n: 'heart', at: 0, dur: 12 }, { n: 'tick', at: 0, dur: 12 }],
      shots: [
        { set: 'restaurant', cam: { p: [-0.35, 1.42, 2.8], t: [-0.6, 1.37, 4.6], f: 40, to: { p: [-0.4, 1.41, 3.0] } }, fx: { ...WARM, dof: 8, vig: 0.75 },
          chars: [{ who: 'you', ...ME, face: 'shock', pose: 'table', look: [0.6, -0.5] }] },
        { at: 'três', set: 'restaurant', cam: { ...HERCU, punch: 0.06 }, fx: { ...WARM, dof: 8, vig: 0.78 },
          chars: [{ who: 'her', ...HER, face: 'happy', pose: 'table', look: [-0.12, 0] }], ui: (ctx, e) => tag(ctx, e, mmss(239.9 - e.t), { c: R, size: 72, at: -1 }) },
      ] },
    { say: 'O garçom passa. Quatro minutos também. O casal da mesa ao lado. Todo mundo no restaurante. O mesmo número.',
      shots: [
        { set: 'restaurant', cam: { p: [1.2, 1.5, 1.9], t: [1.5, 1.35, 3.6], f: 40, to: { p: [1.25, 1.48, 2.05] } }, fx: { ...WARM, dof: 7, vig: 0.75 },
          chars: (t, u) => [{ who: 'waiter', at: [lerp(1.9, 1.35, u), 3.6], face: 'neutral', pose: 'hold', walk: 1 }], ui: (ctx, e) => tag(ctx, e, mmss(236 - e.t), { c: R, size: 68, at: e.wt('quatro') }) },
        { at: 'o#2', set: 'restaurant', cam: { p: [0, 1.9, 0.3], t: [0, 1.1, 4.6], f: 50, to: { p: [0, 1.85, 0.5] } }, fx: { ...WARM, vig: 0.75 },
          chars: [{ who: 'you', ...ME, face: 'scared', pose: 'table', look: [0, -0.4] }, { who: 'her', ...HER, face: 'happy', pose: 'table', look: [-0.7, 0] }, { who: 'waiter', at: [1.6, 5.4], face: 'neutral', pose: 'hold' }, { who: 'friend', at: [-1.7, 5.5], face: 'happy', pose: 'down' }],
          ui: (ctx, e) => { [[0.2, 0.3], [0.8, 0.3], [0.34, 0.2], [0.68, 0.19], [0.1, 0.42], [0.9, 0.43]].forEach(([x, y], i) => tag(ctx, e, mmss(232 - e.t), { x: W * x, y: H * y, c: R, size: 40, at: 0.1 + i * 0.3 })); } },
      ] },
    { say: 'Você pega a mão dela e corre pra porta.', sfx: [{ n: 'steps', at: 'corre', dur: 1.5 }, { n: 'riser', at: 0.3, dur: 2 }],
      set: 'restaurant', cam: { p: [0, 1.5, 1.2], t: [0, 1.2, 4.0], f: 46, to: { p: [0, 1.48, 0.7] }, quake: 0.01, quakeDur: 3 }, fx: { ...WARM, vig: 0.78 },
      chars: (t, u) => [{ who: 'her', at: [0.35, lerp(4.2, 2.8, u)], face: 'scared', pose: 'shock', walk: 1 }, { who: 'you', at: [-0.3, lerp(3.9, 2.5, u)], face: 'scared', pose: 'reachFar', walk: 1 }] },
    { say: 'Na rua, o número dela muda. Cinquenta anos.', gapBefore: 0.3, sfx: [{ n: 'whoosh', at: 0 }, { n: 'ding', at: 'cinquenta' }],
      set: 'street', so: { view: 'night' }, cam: { p: [0.5, 1.45, 1.1], t: [0.3, 1.3, 3.0], f: 40, to: { p: [0.45, 1.44, 1.3] } }, fx: { dof: 5, dust: 0.4 },
      chars: [{ who: 'her', at: [0.3, 3.0], face: 'scared', pose: 'down', look: [-0.4, 0] }],
      ui: (ctx, e) => tag(ctx, e, e.t < e.wt('cinquenta') ? mmss(200 - e.t) : '50 anos', { c: e.t < e.wt('cinquenta') ? R : G, size: 72, at: -1 }) },
    { say: 'Ela te abraça, sem entender nada. Você fecha os olhos, aliviado.',
      set: 'street', so: { view: 'night' }, cam: { p: [0, 1.45, 0.9], t: [0, 1.2, 3.0], f: 46, to: { p: [0, 1.44, 1.15] } }, fx: { dust: 0.4 },
      chars: [{ who: 'you', at: [-0.27, 3.0], face: { eyes: 'closed', mouth: 'smile' }, pose: 'down', look: [0.3, 0] }, { who: 'her', at: [0.27, 3.02], face: 'hurt', pose: 'reachFar', flip: true, look: [0.3, 0], bias: -0.2 }] },
    { say: 'E quando abre, você se vê na vitrine do restaurante. Pela primeira vez, você enxerga o seu número.', gapBefore: 0.3,
      set: 'street', so: { view: 'night' }, cam: { p: [0.25, 1.45, 1.2], t: [0, 1.3, 3.0], f: 40, to: { p: [0.15, 1.42, 1.6] }, e: 'lin', punch: 0 }, fx: { dof: 6, dust: 0.4, vig: 0.78 },
      chars: (t, u) => [{ who: 'you', at: [0, 3.0], face: u < 0.5 ? 'neutral' : 'shock', pose: 'down', look: [0, -0.3] }] },
    { say: 'Três. Dois.', speed: 0.8, gapBefore: 0.4, sfx: [{ n: 'hit', at: 0 }, { n: 'hit', at: 'dois' }],
      set: 'street', so: { view: 'night' }, cam: { p: [0.15, 1.42, 1.6], t: [0, 1.3, 3.0], f: 40, to: { p: [0.1, 1.4, 1.85] }, punch: 0.08 }, fx: { dof: 6, dust: 0.4, vig: 0.85 },
      chars: [{ who: 'you', at: [0, 3.0], face: 'scared', pose: 'down', look: [0, -0.6] }],
      ui: (ctx, e) => tag(ctx, e, e.t < e.wt('dois') ? '00:00:03' : (e.t < e.wt('dois') + 0.9 ? '00:00:02' : '00:00:01'), { c: R, size: 84, at: -1, y: H * 0.15 }), fadeOut: 0.25 },
    { say: 'E aí? Você ia querer ver o seu?', gapBefore: 0.5, sfx: [{ n: 'sting', at: 0 }],
      set: 'void', so: { c1: '#1a1030', c2: '#050408', light: false }, cam: { p: [0, 1.4, 0], t: [0, 1.3, 3], f: 40 }, fx: { dust: 0.6 },
      ui: (ctx, e) => {
        e.ui.timer(ctx, W / 2, H * 0.4, '00:00:00', { c: R, size: 110, t: e.t, T: e.T });
        e.ui.bigText(ctx, [{ s: 'VOCÊ IA QUERER', size: 92 }, { s: 'VER O SEU?', size: 122, c: G }], { y: H * 0.17, a: ramp(e.t, 0.2, 0.5) });
        if (e.t > 1.4) { e.ui.bigText(ctx, [{ s: 'comenta aqui', size: 62, c: '#ffe14d' }], { y: H * 0.735, a: ramp(e.t, 1.4, 1.7) }); e.ui.arrowDown(ctx, W / 2, H * 0.785, 0.7, e.T); }
      } },
  ],
};
