// EP. 1 — "E se batessem na porta do seu quarto às três da manhã?"
// Terror em episódios: termina com duas escolhas para os comentários decidirem o próximo.
import { W, H, clamp, lerp, ease, ramp } from '../engine/core.js';

const cast = { you: { id: 1, skin: 'e', hair: { st: 'short', c: 'black' }, shirt: '#4f9a6a', style: 'tee', print: '#f4f1ea', pants: '#39405e' } };
const YOU = cast.you;
const DX = -1.78;                                   // porta na parede do fundo
const SO = { phone: false, moon: 0.8, moonC: '#9fb0f5' };
const DOORCAM = { p: [-1.25, 1.42, 2.1], t: [DX, 1.12, 4.8], f: 40 };
const BACKCAM = { p: [-0.95, 1.55, 1.5], t: [DX, 1.2, 4.8], f: 46 };
const AT = [DX + 0.05, 4.0];
const BLUR = { dof: 15, dofDim: 0.55, dust: 0.3 };
const voice = (ctx, e, text, at, o = {}) => e.ui.bubble(ctx, { x: W * 0.5, y: H * 0.2, tail: [W * 0.42, H * 0.36], text, t: e.t - at, T: e.T, kind: 'say', size: 56, maxW: 700, c: '#f3e9e9', ...o });
const buzz = (t, t0 = 0) => (t >= t0 && t < t0 + 0.32) || (t >= t0 + 0.46 && t < t0 + 0.78) ? 1 : 0;
const chat = (msgs, o = {}) => (ctx, e) => e.ui.phone(ctx, { T: e.T, h: 1210, cy: H * 0.45, rot: -0.04 + Math.sin(e.T * 0.7) * 0.008, buzz: o.buzz ? buzz(e.t, 0) : 0, skin: '#f8d6b8' },
  (c, w, h) => e.ui.chatScreen(c, w, h, { t: e.t, name: 'Mãe', color: '#c0477a', time: '03:07', msgs: msgs(e) }));
const card = (ctx, x, y, w, h, col, letter, l1, l2, a) => {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y + (1 - a) * 60);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 44); ctx.fillStyle = '#12101f'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-w / 2 + 110, 0, 70, 0, 7); ctx.fill();
  ctx.fillStyle = '#12101f'; ctx.font = '400 96px "Archivo Black"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, -w / 2 + 110, 6);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = '400 70px "Archivo Black"'; ctx.fillText(l1, -w / 2 + 215, l2 ? -34 : 4);
  if (l2) { ctx.fillStyle = col; ctx.fillText(l2, -w / 2 + 215, 46); }
  ctx.restore();
};

export default {
  title: 'A porta — EP. 1',
  voice: 'pm_alex', speed: 0.88, gap: 0.34, tail: 4.8,
  cast, hl: [],
  fx: { grade: 'cold' },
  music: [{ beat: 0, mood: 'dread' }, { beat: 5, mood: 'none' }, { beat: 8, mood: 'dread' }, { beat: 13, mood: 'none' }],
  beats: [
    { say: 'E se batessem na porta do seu quarto às três da manhã?', sfx: [{ n: 'knock', at: 0.1 }, { n: 'tick', at: 0, dur: 4 }],
      set: 'bedroom', so: { ...SO, sleeper: { ...YOU, face: 'awake', look: [-0.6, -0.3] } }, cam: { p: [-0.3, 1.75, 2.8], t: [-0.45, 0.84, 4.4], f: 40, to: { p: [-0.34, 1.7, 3.0] }, punch: 0 }, fx: { dust: 0.5 },
      ui: (ctx, e) => { e.ui.chip(ctx, 'EP. 1', e.t); e.ui.bigText(ctx, [{ s: 'NÃO ABRA', size: 110 }, { s: 'A PORTA', size: 110, c: '#ff5a5a' }], { y: H * 0.235, a: ramp(e.t, 0.1, 0.3), pop: 0.9 + 0.1 * ease.back(ramp(e.t, 0.1, 0.4)) }); } },
    { say: 'Três batidas. Devagar.', speed: 0.86, sfx: [{ n: 'knock', at: 0.0 }],
      set: 'bedroom', so: SO, cam: { ...DOORCAM, to: { p: [-1.35, 1.4, 2.5] }, quake: 0.012, quakeDur: 0.9 }, fx: { dust: 0.5, vig: 0.78 } },
    { say: 'Você mora só com a sua mãe. Então você relaxa. Deve ser ela.',
      set: 'bedroom', so: (t, u) => ({ ...SO, sleeper: { ...YOU, face: u < 0.5 ? 'awake' : { eyes: 'half', mouth: 'smile' }, look: [-0.5, -0.2] } }), cam: { p: [-0.34, 1.7, 3.0], t: [-0.45, 0.84, 4.4], f: 40, to: { p: [-0.36, 1.68, 3.1] } }, fx: { dust: 0.5 } },
    { say: 'A voz dela vem do outro lado: filho, abre. Tem alguém dentro de casa.', sfx: [{ n: 'hit', at: 'tem', gain: 0.5 }],
      set: 'bedroom', so: SO, cam: { ...DOORCAM, to: { p: [-1.4, 1.38, 2.7] }, e: 'lin' }, fx: { dust: 0.5, vig: 0.78 },
      ui: (ctx, e) => { voice(ctx, e, 'Filho, abre.', e.wt('filho'), { y: H * 0.17 }); voice(ctx, e, 'Tem alguém dentro de casa.', e.wt('tem'), { y: H * 0.29, tail: null, size: 50 }); } },
    { say: 'Você levanta num pulo. Põe a mão na maçaneta.', sfx: [{ n: 'steps', at: 0.1, dur: 1.0 }],
      shots: [
        { set: 'bedroom', so: { ...SO, empty: true }, cam: { p: [-0.6, 1.6, 0.6], t: [-1.0, 1.0, 4.2], f: 55, to: { p: [-0.7, 1.58, 0.9] } }, fx: { dust: 0.5 },
          chars: (t, u) => [{ who: 'you', at: [lerp(-0.3, AT[0], ease.out(u)), lerp(2.4, AT[1], ease.out(u))], back: true, pose: 'down', walk: 1 }] },
        { at: 'põe', set: 'bedroom', so: { ...SO, empty: true }, cam: { ...BACKCAM, to: { p: [-1.05, 1.5, 1.9] } }, fx: { dust: 0.5, vig: 0.78 },
          chars: [{ who: 'you', at: AT, back: true, pose: 'reach' }] },
      ] },
    { say: 'E o celular vibra.', sfx: [{ n: 'buzz', at: 0.25 }, { n: 'hit', at: 0.3, gain: 0.7 }],
      set: 'bedroom', so: { ...SO, empty: true }, cam: { p: [-1.5, 1.42, 2.3], t: [AT[0], 1.3, AT[1]], f: 40, punch: 0.07 }, fx: { dof: 6, dust: 0.5, vig: 0.78 },
      chars: [{ who: 'you', at: AT, face: 'shock', pose: 'phone', look: [0.1, 0.6], phoneK: 1 }] },
    { say: 'Mensagem da sua mãe: não abre a porta.', speed: 0.9, sfx: [{ n: 'pop', at: 'não' }],
      set: 'bedroom', so: { ...SO, empty: true }, cam: BACKCAM, fx: BLUR,
      ui: (ctx, e) => chat((e) => [{ text: 'não abre a porta', at: e.wt('não') - 0.1, hour: '03:07', size: 30 }], { buzz: 0 })(ctx, e) },
    { say: 'Outra: eu tô trancada no meu quarto. Eu também tô ouvindo ela.', sfx: [{ n: 'pop', at: 'eu' }, { n: 'pop', at: 'eu#2' }, { n: 'heart', at: 0, dur: 14 }],
      set: 'bedroom', so: { ...SO, empty: true }, cam: BACKCAM, fx: BLUR,
      ui: (ctx, e) => chat((e) => [{ text: 'não abre a porta', at: -1, hour: '03:07', size: 30 }, { text: 'eu tô trancada no meu quarto', at: e.wt('eu') - 0.1, hour: '03:07', size: 26 }, { text: 'eu também tô ouvindo ela', at: e.wt('eu#2') - 0.1, hour: '03:08', size: 26 }])(ctx, e) },
    { say: 'Você solta a maçaneta, bem devagar.', gapBefore: 0.3,
      set: 'bedroom', so: { ...SO, empty: true }, cam: { p: [-1.5, 1.42, 2.3], t: [AT[0], 1.3, AT[1]], f: 40, to: { p: [-1.55, 1.42, 2.5] } }, fx: { dof: 6, dust: 0.5, vig: 0.8 },
      chars: [{ who: 'you', at: AT, face: 'scared', pose: 'shock', look: [0.6, 0] }] },
    { say: 'Do outro lado, a voz muda de tom. Filho. Eu sei que você tá aí.', speed: 0.9, sfx: [{ n: 'sting', at: 'eu', gain: 0.6 }],
      set: 'bedroom', so: SO, cam: { p: [-1.4, 1.38, 2.7], t: [DX, 1.12, 4.8], f: 40, to: { p: [-1.5, 1.36, 3.2] }, e: 'lin' }, fx: { dust: 0.5, vig: 0.84 },
      ui: (ctx, e) => voice(ctx, e, 'Eu sei que você tá aí.', e.wt('eu'), { c: '#ffe1e1', ink: '#b3201c', size: 60 }) },
    { say: 'A maçaneta começa a girar sozinha.', sfx: [{ n: 'door', at: 0.2 }, { n: 'riser', at: 0.3, dur: 2.0 }],
      set: 'bedroom', so: SO, cam: { p: [-1.4, 1.1, 3.6], t: [DX + 0.36, 1.0, 4.8], f: 34, to: { p: [-1.42, 1.08, 3.9] }, quake: 0.008, quakeDur: 3, roll: 0.03 }, fx: { dust: 0.5, vig: 0.84 } },
    { say: 'E o celular vibra de novo. Mas dessa vez, o som vem de trás da porta.', sfx: [{ n: 'buzz', at: 'vibra' }, { n: 'buzz', at: 'som', gain: 0.5, pan: -0.6 }, { n: 'hit', at: 'trás' }],
      shots: [
        { set: 'bedroom', so: { ...SO, empty: true }, cam: { p: [-1.5, 1.42, 2.3], t: [AT[0], 1.3, AT[1]], f: 40 }, fx: { dof: 6, dust: 0.5, vig: 0.8 },
          chars: [{ who: 'you', at: AT, face: 'scared', pose: 'phone', look: [0.1, 0.6], phoneK: 1 }] },
        { at: 'mas', set: 'bedroom', so: { ...SO, empty: true }, cam: { ...BACKCAM, to: { p: [-1.1, 1.5, 2.0] }, e: 'lin' }, fx: { dust: 0.5, vig: 0.84 },
          chars: [{ who: 'you', at: [AT[0], 3.7], back: true, pose: 'shock' }],
          ui: (ctx, e) => { const x = W * 0.36, y = H * 0.56; ctx.save(); ctx.strokeStyle = '#bcd8ff'; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { const u = ((e.T * 1.6 + i / 3) % 1); ctx.globalAlpha = (1 - u) * (e.t > e.wt('som') ? 0.9 : 0); ctx.lineWidth = 10 - u * 5; ctx.beginPath(); ctx.arc(x, y, 40 + u * 150, -0.8, 0.8); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 40 + u * 150, Math.PI - 0.8, Math.PI + 0.8); ctx.stroke(); } ctx.restore(); } },
      ] },
    { say: 'Uma delas está mentindo. E você tem que escolher agora.', gapBefore: 0.35, speed: 0.9,
      set: 'bedroom', so: { ...SO, empty: true }, cam: { p: [-1.55, 1.42, 2.5], t: [AT[0], 1.3, 3.7], f: 40, to: { p: [-1.6, 1.4, 2.7] }, e: 'lin', punch: 0 }, fx: { dof: 6, dust: 0.5, vig: 0.86 },
      chars: (t, u) => [{ who: 'you', at: [AT[0], 3.7], face: 'scared', pose: 'phone', look: [u < 0.5 ? -0.8 : 0.2, u < 0.5 ? 0 : 0.6], phoneK: 1 }] },
    { say: 'Abre a porta... ou responde a mensagem?', gapBefore: 0.4, sfx: [{ n: 'hit', at: 0 }, { n: 'pop', at: 'abre' }, { n: 'pop', at: 'responde' }],
      set: 'bedroom', so: SO, cam: { ...DOORCAM, punch: 0.05 }, fx: { dof: 16, dofDim: 0.6, dust: 0.5 },
      ui: (ctx, e) => {
        e.ui.bigText(ctx, [{ s: 'VOCÊ DECIDE', size: 108, c: '#ffe14d' }], { y: H * 0.17, a: ramp(e.t, 0, 0.25) });
        card(ctx, W / 2, H * 0.3, 900, 230, '#ff5a5a', 'A', 'ABRIR', 'A PORTA', ease.out(ramp(e.t, e.wt('abre') - 0.1, e.wt('abre') + 0.25)));
        card(ctx, W / 2, H * 0.455, 900, 230, '#5aa9ff', 'B', 'RESPONDER', 'A MENSAGEM', ease.out(ramp(e.t, e.wt('responde') - 0.1, e.wt('responde') + 0.25)));
      } },
    { say: 'Comenta porta ou celular. A escolha mais votada decide o episódio dois.', sfx: [{ n: 'ding', at: 'a' }],
      set: 'bedroom', so: SO, cam: DOORCAM, fx: { dof: 16, dofDim: 0.6, dust: 0.5 },
      ui: (ctx, e) => {
        e.ui.bigText(ctx, [{ s: 'VOCÊ DECIDE', size: 108, c: '#ffe14d' }], { y: H * 0.17 });
        card(ctx, W / 2, H * 0.3, 900, 230, '#ff5a5a', 'A', 'ABRIR', 'A PORTA', 1);
        card(ctx, W / 2, H * 0.455, 900, 230, '#5aa9ff', 'B', 'RESPONDER', 'A MENSAGEM', 1);
        e.ui.bigText(ctx, [{ s: 'comenta A ou B', size: 64, c: '#ffe14d' }], { y: H * 0.735, a: ramp(e.t, 0.2, 0.5) }); e.ui.arrowDown(ctx, W / 2, H * 0.785, 0.7, e.T);
        if (e.t > e.wt('a')) e.ui.bigText(ctx, [{ s: 'o mais votado vira o EP. 2', size: 50 }], { y: H * 0.585, a: ramp(e.t, e.wt('a'), e.wt('a') + 0.3) });
      } },
  ],
};
