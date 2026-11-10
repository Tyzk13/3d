// Exporta o roteiro (falas, pausas, efeitos, trilha) de uma história para JSON, para a etapa de áudio.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];
const story = (await import(`./stories/${name}.js`)).default;
const out = {
  name, title: story.title, voice: story.voice || 'pm_alex', speed: story.speed ?? 1, gap: story.gap ?? 0.24,
  lead: story.lead ?? 0.3, tail: story.tail ?? 1.4, music: story.music || [],
  beats: story.beats.map((b) => ({ say: b.say || '', gapBefore: b.gapBefore, speed: b.speed, pause: b.pause, sfx: b.sfx || [] })),
};
fs.mkdirSync(path.join(ROOT, 'out', name), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'out', name, 'script.json'), JSON.stringify(out, null, 1));
const words = out.beats.reduce((a, b) => a + b.say.split(/\s+/).filter(Boolean).length, 0);
console.log(`${name}: ${out.beats.length} batidas, ${words} palavras`);
