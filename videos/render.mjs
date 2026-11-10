// Renderiza uma história quadro a quadro no Chromium (Playwright) e codifica com ffmpeg.
//   node render.mjs <historia>                  vídeo completo em out/<historia>/<historia>.mp4
//   node render.mjs <historia> --sheet          um quadro por plano (folha de contato)
//   node render.mjs <historia> --stills 1.5,20  quadros nos instantes pedidos (s)
//   node render.mjs <historia> --from 10 --to 20  só um trecho
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const name = args[0];
if (!name) { console.error('uso: node render.mjs <historia> [--sheet] [--stills a,b] [--from s] [--to s] [--workers n]'); process.exit(1); }
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const OUT = path.join(ROOT, 'out', name);
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const p = path.normalize(path.join(ROOT, decodeURIComponent(req.url.split('?')[0])));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end('nao encontrado'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ args: ['--disable-gpu', '--font-render-hinting=none'] });
async function openPage() {
  const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[pagina]', m.text()); });
  page.on('pageerror', (e) => console.log('[erro na pagina]', e.message));
  await page.goto(`${base}/engine/index.html`);
  await page.waitForFunction(() => window.VID);
  const info = await page.evaluate((n) => window.VID.init(n), name);
  return { page, info };
}
const grab = async (page, i, q = 0.95) => {
  const url = await page.evaluate(([i, q]) => { window.VID.renderFrame(i); return window.VID.jpeg(q); }, [i, q]);
  return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
};

const t0 = Date.now();
try {
  if (opt('sheet') || opt('stills')) {
    const { page, info } = await openPage();
    let times;
    if (opt('stills')) times = String(opt('stills')).split(',').map(Number);
    else times = info.shots.map((s) => s.start + (s.end - s.start) * Number(opt('at', 0.5)));
    const dir = path.join(OUT, opt('stills') ? 'stills' : 'sheet');
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    let k = 0;
    for (const t of times) {
      const buf = await grab(page, Math.round(t * info.fps), 0.92);
      fs.writeFileSync(path.join(dir, `f${String(k++).padStart(3, '0')}.jpg`), buf);
    }
    const cols = Number(opt('cols', 6)), per = cols * 2;
    for (let p = 0; p * per < times.length; p++) {
      const n = Math.min(per, times.length - p * per);
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-start_number', String(p * per), '-i', path.join(dir, 'f%03d.jpg'), '-frames:v', String(n), '-vf', `scale=${Number(opt('tw', 330))}:-1,tile=${cols}x${Math.ceil(n / cols)}`, '-frames:v', '1', '-update', '1', '-q:v', '3', path.join(dir, `sheet_${p}.jpg`)]);
    }
    console.log(`${times.length} quadros em ${dir} (${((Date.now() - t0) / 1000).toFixed(1)}s), duração ${info.duration.toFixed(1)}s, ${info.shots.length} planos`);
  } else {
    const workers = Number(opt('workers', 4));
    const first = await openPage();
    const fps = first.info.fps;
    const fA = Math.round(Number(opt('from', 0)) * fps), fB = Math.min(first.info.frames, Math.round(Number(opt('to', first.info.duration)) * fps));
    const n = fB - fA, per = Math.ceil(n / workers);
    const segs = [];
    let done = 0;
    const tick = setInterval(() => process.stdout.write(`\r${done}/${n} quadros  ${(done / ((Date.now() - t0) / 1000)).toFixed(1)} q/s   `), 2000);
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const a = fA + w * per, b = Math.min(fB, a + per);
      if (a >= b) return;
      const { page } = w === 0 ? first : await openPage();
      const seg = path.join(OUT, `seg_${w}.mp4`); segs[w] = seg;
      const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
        '-vf', 'scale=in_range=full:in_color_matrix=bt601:out_range=tv:out_color_matrix=bt709,format=yuv420p',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', String(opt('crf', 17)), '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
        '-g', '60', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
      const closed = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg saiu com ' + c)))));
      for (let i = a; i < b; i++) {
        const buf = await grab(page, i);
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
        done++;
      }
      ff.stdin.end();
      await closed;
    }));
    clearInterval(tick);
    const list = path.join(OUT, 'segs.txt');
    fs.writeFileSync(list, segs.filter(Boolean).map((s) => `file '${s}'`).join('\n'));
    const silent = path.join(OUT, 'video.mp4');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
    const audio = path.join(OUT, 'audio.wav');
    const final = path.join(OUT, `${name}${opt('from') || opt('to') ? '_trecho' : ''}.mp4`);
    if (fs.existsSync(audio)) {
      const ss = opt('from') ? ['-ss', String(opt('from'))] : [];
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', silent, ...ss, '-i', audio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
    } else fs.copyFileSync(silent, final);
    for (const s of segs.filter(Boolean)) fs.rmSync(s);
    fs.rmSync(list); fs.rmSync(silent);
    console.log(`\n${n} quadros em ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${final}`);
  }
} finally {
  await browser.close();
  server.close();
}
