// Servidor de sincronização (salas) para a página igreja-3d-site.html
// Uso:  npm i ws   →   node servidor-sync.js   (porta 8080, ou PORT=xxxx)
// Na página:  igreja-3d-site.html?room=mesa1&ws=wss://SEU-SERVIDOR
// Guarda posições e personagens em memória (reiniciar o servidor zera tudo).
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: process.env.PORT || 8080, maxPayload: 2 * 1024 * 1024 });
const rooms = {};
wss.on('connection', (ws, req) => {
  const room = (new URL(req.url, 'http://x').searchParams.get('room') || 'mesa1').slice(0, 40);
  const R = rooms[room] || (rooms[room] = { pos: {}, chars: {}, set: new Set() });
  R.set.add(ws);
  for (const id in R.chars) ws.send(JSON.stringify({ t: 'char', id, v: R.chars[id] }));
  for (const k in R.pos) { const [map, id] = k.split('|'); ws.send(JSON.stringify({ t: 'pos', map, id, v: R.pos[k] })); }
  ws.on('message', (d) => {
    let m; try { m = JSON.parse(d); } catch (e) { return; }
    if (m.t === 'pos') R.pos[m.map + '|' + m.id] = m.v;
    else if (m.t === 'char') R.chars[m.id] = m.v;
    else if (m.t === 'delchar') { delete R.chars[m.id]; for (const k in R.pos) if (k.endsWith('|' + m.id)) delete R.pos[k]; }
    else return;
    const out = d.toString();
    R.set.forEach((c) => c.readyState === 1 && c.send(out));
  });
  ws.on('close', () => R.set.delete(ws));
});
console.log('Sincronização ativa na porta', process.env.PORT || 8080);
