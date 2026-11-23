// Login. Três jeitos, escolhidos sozinhos:
//  - 'firebase': site próprio com js/firebase-config.js preenchido → Google ou e-mail/senha.
//  - 'claude'  : página publicada no claude.ai → a conta claude.ai de quem abre.
//  - 'local'   : nenhum dos dois → conta só com nome, guardada neste navegador (para testar).
(function (HB) {
  let modo = 'local', usuario = null, userNs = null, fb = null;
  const CHAVE = 'herois-de-bueiro:conta';
  const perfisCache = {};

  const SDK = 'https://cdn.jsdelivr.net/npm/firebase@10.12.2/';
  const carregar = src => new Promise((ok, falha) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = falha; document.head.appendChild(s); });

  async function iniciar() {
    const cfg = window.HB_FIREBASE;
    if (cfg && cfg.apiKey && !window.firebase) {
      try { for (const f of ['firebase-app-compat.js', 'firebase-auth-compat.js', 'firebase-firestore-compat.js']) await carregar(SDK + f); }
      catch (e) { HB.UI.aviso('Não consegui carregar o Firebase. Confira a internet e o arquivo js/firebase-config.js.'); }
    }
    if (cfg && cfg.apiKey && window.firebase) {
      modo = 'firebase';
      fb = window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(cfg);
      await new Promise(ok => fb.auth().onAuthStateChanged(u => {
        usuario = u ? { uid: u.uid, nome: u.displayName || (u.email || '').split('@')[0] || 'Sem nome', foto: u.photoURL || '' } : null;
        ok();
      }));
      return;
    }
    if (window.claude && typeof window.claude.use === 'function') {
      try { userNs = await window.claude.use('user'); } catch (e) { userNs = null; }
      if (userNs) {
        modo = 'claude';
        const me = await userNs.me();
        usuario = me.id ? { uid: me.id, nome: me.name || 'Você', foto: me.avatarUrl || '' } : null;
        return;
      }
    }
    modo = 'local';
    try { usuario = JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch (e) { usuario = null; }
  }

  async function entrarGoogle() {
    const p = new window.firebase.auth.GoogleAuthProvider();
    await fb.auth().signInWithPopup(p);
    location.reload();
  }
  async function entrarEmail(email, senha, criar, nome) {
    const a = fb.auth();
    if (criar) { const r = await a.createUserWithEmailAndPassword(email, senha); if (nome) await r.user.updateProfile({ displayName: nome }); }
    else await a.signInWithEmailAndPassword(email, senha);
    location.reload();
  }
  function entrarLocal(nome) {
    let contas = [];
    try { contas = JSON.parse(localStorage.getItem(CHAVE + 's') || '[]'); } catch (e) { /* sem armazenamento */ }
    let c = contas.find(x => x.nome.toLowerCase() === nome.toLowerCase());
    if (!c) { c = { uid: 'local-' + HB.S.novoId(), nome, foto: '' }; contas.push(c); }
    try { localStorage.setItem(CHAVE + 's', JSON.stringify(contas)); localStorage.setItem(CHAVE, JSON.stringify(c)); } catch (e) { /* segue sem lembrar */ }
    usuario = c;
  }
  function contasLocais() { try { return JSON.parse(localStorage.getItem(CHAVE + 's') || '[]'); } catch (e) { return []; } }
  async function sair() {
    if (modo === 'firebase') await fb.auth().signOut();
    if (modo === 'local') { try { localStorage.removeItem(CHAVE); } catch (e) { /* nada */ } }
    location.hash = '#inicio'; location.reload();
  }

  // Nome e foto de outras pessoas. No claude.ai vêm da plataforma; nos outros modos, da coleção 'perfis'.
  async function perfis(ids) {
    const faltam = ids.filter(id => id && !perfisCache[id]);
    if (faltam.length && modo === 'claude' && userNs) {
      try { const ps = await userNs.profiles(faltam); faltam.forEach(id => { const p = ps[id] || {}; perfisCache[id] = { nome: p.name || 'Jogador', foto: p.avatarUrl || '' }; }); } catch (e) { /* sem nomes */ }
    }
    const r = {};
    ids.forEach(id => {
      if (!id) return;
      if (modo !== 'claude') { const p = HB.S.pegar('perfis', id); r[id] = p ? { nome: p.nome, foto: p.foto || '' } : { nome: 'Jogador', foto: '' }; }
      else r[id] = perfisCache[id] || { nome: 'Jogador', foto: '' };
      if (usuario && id === usuario.uid) r[id] = { nome: usuario.nome, foto: usuario.foto };
    });
    return r;
  }
  // Versão síncrona para desenhar (usa o que já foi carregado).
  function nome(id) {
    if (!id) return 'Ninguém';
    if (usuario && id === usuario.uid) return usuario.nome;
    if (modo !== 'claude') { const p = HB.S.pegar('perfis', id); return p ? p.nome : 'Jogador'; }
    return (perfisCache[id] || {}).nome || 'Jogador';
  }

  // Grava o próprio perfil para os outros verem o nome (não no claude.ai, que já resolve nomes).
  function publicarPerfil() {
    if (!usuario || modo === 'claude') return;
    const atual = HB.S.pegar('perfis', usuario.uid);
    if (!atual || atual.nome !== usuario.nome || atual.foto !== usuario.foto) HB.S.salvar('perfis', { id: usuario.uid, nome: usuario.nome, foto: usuario.foto || '' }, 0);
  }

  HB.A = {
    iniciar, entrarGoogle, entrarEmail, entrarLocal, contasLocais, sair, perfis, nome, publicarPerfil,
    get modo() { return modo; },
    get usuario() { return usuario; },
    get uid() { return usuario ? usuario.uid : null; },
    get firestore() { return fb ? fb.firestore() : null; },
  };
})(window.HB);
