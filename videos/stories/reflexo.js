// "E se o seu reflexo começasse a se atrasar?" — suspense de espelho, sem dinheiro na história.
import { W, H, clamp, lerp, ease, ramp } from '../engine/core.js';

const cast = {
  you: { id: 1, skin: 'b', hair: { st: 'short', c: 'ginger' }, shirt: '#3b6fd1', style: 'tee', print: '#ffffff', pants: '#3b3f4a' },
  her: { id: 5, skin: 'd', hair: { st: 'curly', c: 'black' }, shirt: '#e2a23a', style: 'dress', earring: '#ffffff' },
};
const YOU = cast.you;
const AT = [0.05, 2.62];
const WIDE = { p: [1.0, 1.62, 0.3], t: [0.1, 1.25, 3.4], f: 55, to: { p: [0.9, 1.58, 0.6] } };
const CU = { p: [0.2, 1.4, 2.45], t: [0.05, 1.3, 3.4], f: 46, to: { p: [0.17, 1.38, 2.62] } };
const DARK = { ambient: [26, 30, 60], k: 0.18, lightC: '#8fa2e8' };
const refl = (o) => ({ ...YOU, at: AT, ...o });
const title = (ctx, e) => e.ui.bigText(ctx, [{ s: 'SEU REFLEXO', size: 100 }, { s: 'ESTÁ ATRASADO', size: 88, c: '#8fd3ff' }], { y: H * 0.115, a: ramp(e.t, 0, 0.2), pop: 0.9 + 0.1 * ease.back(ramp(e.t, 0, 0.3)) });

export default {
  title: 'O reflexo atrasado',
  voice: 'pm_alex', speed: 0.94, gap: 0.3, tail: 3.2,
  cast, hl: [],
  fx: { grade: 'cold' },
  music: [{ beat: 0, mood: 'tense' }, { beat: 6, mood: 'playful' }, { beat: 7, mood: 'dread' }, { beat: 12, mood: 'none' }, { beat: 14, mood: 'dread' }],
  beats: [
    { say: 'E se o seu reflexo começasse a se atrasar?', sfx: [{ n: 'whoosh', at: 0 }],
      set: 'bathroom', so: { reflect: refl({ face: 'neutral' }), k: 0.9 }, cam: WIDE, fx: { dust: 0.3 },
      chars: [{ who: 'you', at: AT, back: true, pose: 'down' }], ui: title },
    { say: 'Primeiro, é só um segundo. Você levanta a mão no espelho... e ele demora pra levantar a dele.', sfx: [{ n: 'tick', at: 'você', dur: 3 }],
      shots: [
        { set: 'bathroom', so: { reflect: refl({ face: 'neutral' }), noSink: true }, cam: CU, fx: { dust: 0.3 } },
        { at: 'você', set: 'bathroom', so: (t, u) => ({ reflect: refl({ face: 'neutral', pose: u > 0.72 ? 'wave' : 'down' }) }), cam: WIDE, fx: { dust: 0.3 },
          chars: [{ who: 'you', at: AT, back: true, pose: 'wave' }] },
      ] },
    { say: 'Você ri. Acha que é sono.',
      set: 'bathroom', so: { reflect: refl({ face: 'laugh' }), noSink: true }, cam: CU, fx: { dust: 0.3 } },
    { say: 'No dia seguinte, são dois segundos.', sfx: [{ n: 'whoosh', at: 0 }, { n: 'tick', at: 0.3, dur: 2 }],
      set: 'bathroom', so: { reflect: refl({ face: 'neutral', pose: 'down' }) }, cam: WIDE, fx: { dust: 0.3 },
      chars: [{ who: 'you', at: AT, back: true, pose: 'head' }], ui: (ctx, e) => e.ui.chip(ctx, 'DIA SEGUINTE', e.t) },
    { say: 'Você pisca. Ele continua de olhos abertos, te olhando.', sfx: [{ n: 'hit', at: 'ele', gain: 0.5 }],
      set: 'bathroom', so: { reflect: refl({ face: { eyes: 'wide', mouth: 'flat' }, look: [0, 0] }), noSink: true }, cam: { ...CU, to: { p: [0.14, 1.36, 2.8] }, e: 'lin' }, fx: { dust: 0.3, vig: 0.75 } },
    { say: 'E quando finalmente pisca... sorri.', speed: 0.88, sfx: [{ n: 'sting', at: 'sorri', gain: 0.6 }],
      set: 'bathroom', so: (t, u) => ({ reflect: refl({ face: u < 0.55 ? { eyes: 'line', mouth: 'flat' } : { eyes: 'dot', mouth: 'wide' } }), noSink: true }), cam: { p: [0.14, 1.36, 2.8], t: [0.05, 1.3, 3.4], f: 46, punch: 0 }, fx: { dust: 0.3, vig: 0.8 } },
    { say: 'Você mostra pra sua namorada. Mas com ela do lado, o reflexo fica perfeito. Ela acha graça.', gapBefore: 0.3, sfx: [{ n: 'whoosh', at: 0 }],
      shots: [
        { set: 'living', so: { time: 'day' }, cam: { p: [0, 1.45, 0.25], t: [0, 1.15, 2.6], f: 46, to: { p: [0, 1.43, 0.5] } }, fx: { grade: 'day', dust: 0.3 },
          chars: [{ who: 'you', at: [-0.32, 2.6], face: 'nervous', pose: 'point', look: [0.5, 0] }, { who: 'her', at: [0.34, 2.62], face: 'think', pose: 'chin', look: [-0.4, 0] }] },
        { at: 'ela#2', set: 'living', so: { time: 'day' }, cam: { p: [0.5, 1.44, 0.95], t: [0.34, 1.32, 2.62], f: 40, to: { p: [0.46, 1.43, 1.2] } }, fx: { grade: 'day', dof: 6, dust: 0.3 },
          chars: [{ who: 'her', at: [0.34, 2.62], face: 'laugh', pose: 'down' }] },
      ] },
    { say: 'Você começa a evitar espelhos. Vitrines. A tela apagada do celular.', gapBefore: 0.3,
      shots: [
        { set: 'street', so: { view: 'dusk' }, cam: { p: [0.3, 1.45, 1.0], t: [0, 1.3, 3.0], f: 40, to: { p: [0.25, 1.44, 1.25] } }, fx: { dof: 5, dust: 0.4 },
          chars: [{ who: 'you', at: [0, 3.0], face: 'nervous', pose: 'down', look: [-0.6, 0.4], walk: 1 }] },
        { at: 'a', set: 'living', so: { lampK: 0.6 }, cam: { p: [0.35, 1.5, 1.0], t: [-0.3, 1.0, 4.4], f: 50 }, fx: { dof: 15, dofDim: 0.5, dust: 0.3 },
          ui: (ctx, e) => e.ui.phone(ctx, { T: e.T, h: 1210, cy: H * 0.45, rot: -0.05, skin: '#e6a877' }, (c, w, h) => { c.fillStyle = '#07070c'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(160,180,220,0.10)'; c.beginPath(); c.arc(w / 2, 330, 110, 0, 7); c.fill(); c.beginPath(); c.roundRect(w / 2 - 120, 440, 240, 300, 80); c.fill(); }) },
      ] },
    { say: 'Mas numa madrugada, você acorda com sede e passa pelo banheiro.', gapBefore: 0.4, sfx: [{ n: 'steps', at: 'passa', dur: 1.2 }],
      shots: [
        { set: 'bedroom', so: { sleeper: { ...YOU, face: 'awake', look: [0.2, -0.4] }, phone: false }, cam: { p: [-0.3, 1.75, 2.8], t: [-0.45, 0.84, 4.4], f: 40, to: { p: [-0.34, 1.7, 3.0] }, punch: 0 }, fx: { dust: 0.5 }, fadeIn: 0.3 },
        { at: 'passa', set: 'bathroom', so: { ...DARK, reflect: refl({ face: 'neutral', sil: '#070812' }) }, cam: { p: [1.1, 1.62, 0.2], t: [0.1, 1.25, 3.4], f: 55, to: { p: [1.0, 1.6, 0.4] } }, fx: { dust: 0.5, vig: 0.8 },
          chars: (t, u) => [{ who: 'you', at: [lerp(-0.9, 0.05, ease.out(u)), 2.62], back: true, pose: 'down', walk: u < 0.8 ? 1 : 0 }] },
      ] },
    { say: 'A luz está apagada. E mesmo assim, você se vê no espelho.', sfx: [{ n: 'heart', at: 0, dur: 9 }],
      set: 'bathroom', so: { ...DARK, k: 0.3, reflect: refl({ face: 'neutral' }), noSink: true }, cam: { ...CU, e: 'lin' }, fx: { dust: 0.5, vig: 0.82 } },
    { say: 'Você para. Ele não.', speed: 0.88, sfx: [{ n: 'hit', at: 'ele', gain: 0.7 }],
      shots: [
        { set: 'bathroom', so: { ...DARK, k: 0.3, reflect: refl({ face: 'neutral' }) }, cam: { p: [1.0, 1.6, 0.4], t: [0.1, 1.25, 3.4], f: 55, punch: 0 }, fx: { dust: 0.5, vig: 0.8 },
          chars: [{ who: 'you', at: AT, back: true, pose: 'down' }] },
        { at: 'ele', set: 'bathroom', so: (t, u) => ({ ...DARK, k: 0.3, reflect: { ...YOU, at: [0.05, lerp(2.62, 3.05, ease.out(u))], face: { eyes: 'wide', mouth: 'flat' }, walk: 1 } }), cam: { p: [1.0, 1.6, 0.4], t: [0.1, 1.25, 3.4], f: 55, to: { p: [0.8, 1.55, 0.9] } }, fx: { dust: 0.5, vig: 0.8 },
          chars: [{ who: 'you', at: AT, back: true, pose: 'down' }] },
      ] },
    { say: 'Ele dá um passo pra frente. Encosta a mão no vidro, pelo lado de dentro.', sfx: [{ n: 'knock', at: 'encosta', gain: 0.6 }],
      set: 'bathroom', so: { ...DARK, k: 0.35, reflect: { ...YOU, at: [0.05, 3.1], face: { eyes: 'wide', mouth: 'smile' }, pose: 'reach' }, noSink: true },
      cam: { p: [0.2, 1.4, 2.3], t: [0.05, 1.25, 3.4], f: 46, to: { p: [0.16, 1.36, 2.6] }, e: 'lin' }, fx: { dust: 0.5, vig: 0.82 } },
    { say: 'E você entende. Ele nunca esteve atrasado.', gapBefore: 0.4,
      set: 'bathroom', so: { ...DARK, k: 0.3, reflect: { ...YOU, at: [0.05, 3.1], face: { eyes: 'wide', mouth: 'smile' }, pose: 'reach' } }, cam: { p: [0.75, 1.5, 1.0], t: [0.0, 1.3, 3.4], f: 50, to: { p: [0.7, 1.48, 1.2] } }, fx: { dust: 0.5, vig: 0.8, dof: 0 },
      chars: [{ who: 'you', at: [0.05, 2.5], back: true, pose: 'shock' }] },
    { say: 'Ele estava ensaiando.', speed: 0.85, sfx: [{ n: 'sting', at: 'ensaiando' }],
      set: 'bathroom', so: { ...DARK, k: 0.4, reflect: { ...YOU, at: [0.05, 3.1], face: { eyes: 'dot', mouth: 'wide' }, pose: 'reach' }, noSink: true },
      cam: { p: [0.14, 1.34, 2.75], t: [0.05, 1.25, 3.4], f: 46, to: { p: [0.12, 1.32, 2.9] }, punch: 0.08, quake: 0.015 }, fx: { dust: 0.5, vig: 0.84 } },
    { say: 'E aí? Você ainda se olha no espelho de madrugada?', gapBefore: 0.4, sfx: [{ n: 'hit', at: 0 }],
      set: 'bathroom', so: { ...DARK, k: 0.3, reflect: { ...YOU, at: [0.05, 3.1], face: { eyes: 'dot', mouth: 'wide' }, pose: 'reach' } }, cam: { p: [0.5, 1.55, 0.8], t: [0.05, 1.2, 3.4], f: 50, punch: 0.05 }, fx: { dof: 0, dofDim: 0, dust: 0.5, vig: 0.8 },
      ui: (ctx, e) => {
        e.ui.bigText(ctx, [{ s: 'VOCÊ AINDA SE OLHA', size: 84 }, { s: 'NO ESPELHO?', size: 116, c: '#8fd3ff' }], { y: H * 0.14, a: ramp(e.t, 0.05, 0.35), pop: 0.9 + 0.1 * ease.back(ramp(e.t, 0.05, 0.4)) });
        if (e.t > 1.4) { e.ui.bigText(ctx, [{ s: 'comenta aqui', size: 62, c: '#ffe14d' }], { y: H * 0.735, a: ramp(e.t, 1.4, 1.7) }); e.ui.arrowDown(ctx, W / 2, H * 0.785, 0.7, e.T); }
      } },
  ],
};
