// Armazenamento: Firestore (site próprio com login Google), base compartilhada da página publicada
// (capability `db`) ou o localStorage deste navegador. As duas bases remotas têm a mesma interface.
(function (HB) {
  const COLS = ['herois', 'viloes', 'campanhas', 'perfis'];
  const CHAVE = 'herois-de-bueiro:v1';
  const cache = {}; COLS.forEach(c => (cache[c] = new Map()));
  let db = null, modo = 'carregando', aoMudar = () => {};
  const pend = new Map(); // "col/id" → {timer, escrevendo, de novo}
  const servidor = new Map(); // "col/id" → último corpo visto no servidor (para gravar só o que mudou)
  const adiados = new Map();  // "col/id" → mudança remota que chegou durante uma edição local

  const ID_OK = /^[A-Za-z0-9_-]{1,64}$/;
  const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const clone = o => JSON.parse(JSON.stringify(o));

  function lerLocal() {
    try {
      const s = JSON.parse(localStorage.getItem(CHAVE) || '{}');
      COLS.forEach(c => (s[c] || []).forEach(o => { if (o && ID_OK.test(o.id || '')) cache[c].set(o.id, o); }));
    } catch (e) { /* armazenamento bloqueado: segue só em memória */ }
  }
  function gravarLocal() {
    try {
      const s = {}; COLS.forEach(c => (s[c] = [...cache[c].values()]));
      localStorage.setItem(CHAVE, JSON.stringify(s));
    } catch (e) { HB.UI && HB.UI.aviso('Não foi possível salvar neste navegador (armazenamento cheio ou bloqueado).'); }
  }

  async function iniciar(cb) {
    aoMudar = cb;
    let ns = null;
    if (HB.A.modo === 'firebase') ns = HB.A.firestore;
    else if (HB.A.modo === 'claude' && window.claude && typeof window.claude.use === 'function') {
      try { ns = await window.claude.use('db'); } catch (e) { ns = null; }
    }
    if (!ns) { modo = 'local'; lerLocal(); return; }
    db = ns; modo = 'nuvem';
    let prontos = 0;
    await new Promise(res => {
      const t = setTimeout(() => { HB.UI.aviso('A base compartilhada está demorando para responder. Os dados podem estar desatualizados.'); res(); }, 10000);
      COLS.forEach(c => {
        let primeiro = true;
        db.collection(c).onSnapshot(snap => {
          let mudou = false;
          (typeof snap.docChanges === 'function' ? snap.docChanges() : snap.docChanges).forEach(ch => {
            const id = ch.doc.id, k = c + '/' + id;
            if (!ID_OK.test(id)) return; // códigos fora do padrão do app (podem ter sido forjados) são ignorados
            const novo = ch.type === 'removed' ? null : clone(ch.doc.data());
            if (novo) novo.id = id;
            // Edição local em andamento: guarda a versão do servidor e aplica quando a gravação terminar.
            // A base de comparação continua sendo a versão de onde a edição começou.
            if (pend.has(k)) { adiados.set(k, novo); return; }
            if (novo) { const b = clone(novo); delete b.id; servidor.set(k, b); } else servidor.delete(k);
            if (!novo) { if (cache[c].delete(id)) mudou = true; return; }
            const velho = cache[c].get(id);
            if (!velho || JSON.stringify(velho) !== JSON.stringify(novo)) { cache[c].set(id, novo); mudou = true; }
          });
          if (primeiro) { primeiro = false; if (++prontos === COLS.length) { clearTimeout(t); res(); } }
          else if (mudou) aoMudar(c);
        }, err => {
          if (primeiro) { primeiro = false; if (++prontos === COLS.length) { clearTimeout(t); res(); } }
          HB.UI.aviso('A conexão com a base compartilhada caiu (' + err.code + '). Recarregue a página para continuar salvando.');
        });
      });
    });
  }

  async function escrever(c, id) {
    const k = c + '/' + id, p = pend.get(k);
    if (!p) return;
    if (p.escrevendo) { p.deNovo = true; return; }
    p.escrevendo = true;
    try {
      const o = cache[c].get(id), ref = db.collection(c).doc(id), base = servidor.get(k);
      const enviados = p.enviados = p.enviados || { campos: {}, apagados: new Set() };
      enviados.parcial = !!(base && HB.A.modo === 'firebase');
      if (!o) { await ref.delete(); servidor.delete(k); }
      else {
        const corpo = clone(o); delete corpo.id;
        if (base && HB.A.modo === 'firebase') {
          // Só os campos que mudaram: duas pessoas mexendo em partes diferentes da campanha não se apagam.
          const mud = {}, apagar = Object.keys(base).filter(f => !(f in corpo));
          Object.keys(corpo).forEach(f => { if (JSON.stringify(corpo[f]) !== JSON.stringify(base[f])) mud[f] = corpo[f]; });
          enviados.campos = Object.assign(enviados.campos, clone(mud)); apagar.forEach(f => enviados.apagados.add(f));
          apagar.forEach(f => { mud[f] = window.firebase.firestore.FieldValue.delete(); });
          if (Object.keys(mud).length > 1 || (Object.keys(mud).length === 1 && !('atualizado' in mud))) await ref.update(mud);
        } else await ref.set(corpo);
        servidor.set(k, corpo);
        if (!enviados.parcial) enviados.campos = clone(corpo);
      }
    } catch (e) {
      if (e && (e.code === 'invalid_argument' || e.code === 'permission-denied')) HB.UI.aviso('Você não tem permissão para mudar isso, então a mudança não foi salva.');
      else if (e && e.code === 'quota_exceeded') HB.UI.aviso('A base está cheia. Apague fichas antigas para liberar espaço.');
      else HB.UI.aviso('Falha ao salvar (' + ((e && e.code) || 'erro') + '). Tente de novo.');
    }
    p.escrevendo = false;
    if (p.deNovo) { p.deNovo = false; return escrever(c, id); }
    if (!p.timer) {
      pend.delete(k);
      if (adiados.has(k)) { // aplica o que chegou do servidor enquanto gravava, com os campos que acabamos de enviar por cima
        let novo = adiados.get(k); adiados.delete(k);
        if (novo && p.enviados) { Object.assign(novo, clone(p.enviados.campos)); p.enviados.apagados.forEach(f => delete novo[f]); }
        if (novo) { const b = clone(novo); delete b.id; servidor.set(k, b); }
        const velho = cache[c].get(id);
        if (!novo) { cache[c].delete(id); aoMudar(c); }
        else if (!velho || JSON.stringify(velho) !== JSON.stringify(novo)) { cache[c].set(id, novo); aoMudar(c); }
      }
    }
  }

  function agendar(c, id, atraso) {
    if (modo !== 'nuvem') { gravarLocal(); return; }
    const k = c + '/' + id;
    const p = pend.get(k) || {};
    pend.set(k, p);
    clearTimeout(p.timer);
    p.timer = setTimeout(() => { p.timer = null; escrever(c, id); }, atraso);
  }

  HB.S = {
    iniciar,
    get modo() { return modo; },
    novoId,
    clone,
    lista: c => [...cache[c].values()],
    pegar: (c, id) => cache[c].get(id),
    salvar(c, o, atraso = 600) { if (!o.id) o.id = novoId(); o.atualizado = Date.now(); cache[c].set(o.id, o); agendar(c, o.id, atraso); return o; },
    apagar(c, id) { cache[c].delete(id); agendar(c, id, 0); },
    exportar() { const s = { sistema: 'herois-de-bueiro', versao: 1 }; COLS.forEach(c => (s[c] = [...cache[c].values()])); return JSON.stringify(s, null, 1); },
    importar(txt) {
      const s = JSON.parse(txt);
      if (!s || s.sistema !== 'herois-de-bueiro') throw new Error('Esse texto não é um backup do Heróis de Bueiro.');
      let n = 0;
      COLS.filter(c => c !== 'perfis').forEach(c => (s[c] || []).forEach(o => { if (o && ID_OK.test(String(o.id || ''))) { cache[c].set(o.id, o); agendar(c, o.id, 50 + n * 120); n++; } }));
      return n;
    },
  };
})(window.HB);
