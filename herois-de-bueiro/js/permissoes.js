// Quem pode o quê. O mestre da campanha é o único com o Escudo do Mestre, mas pode
// liberar o escudo para jogadores (lista `escudo`) e também passar o cargo de mestre.
(function (HB) {
  const S = HB.S;
  const eu = () => HB.A.uid;
  const ehMestre = c => !!c && c.mestre === eu();
  const temEscudo = c => !!c && (ehMestre(c) || (c.escudo || []).includes(eu()));
  const ehMembro = c => !!c && (ehMestre(c) || (c.membros || []).includes(eu()));
  const campanhasDoHeroi = h => S.lista('campanhas').filter(c => (c.herois || []).includes(h.id));
  const minhasCampanhas = () => S.lista('campanhas').filter(ehMembro);

  function podeEditarHeroi(h) {
    if (!h || !eu()) return false;
    if (!h.dono || h.dono === eu()) return true;
    return campanhasDoHeroi(h).some(temEscudo);
  }
  const podeEditarVilao = v => !!v && !v.base && !!eu() && (!v.dono || v.dono === eu());
  // Heróis que eu vejo: os meus e os das campanhas de que participo.
  function heroiVisivel(h) {
    if (!h.dono || h.dono === eu()) return true;
    return campanhasDoHeroi(h).some(ehMembro);
  }

  // Quem pode editar a ficha além do dono (usado pelas regras do Firestore).
  function mestresDe(c) { return [...new Set([c.mestre].concat(c.escudo || []).filter(Boolean))]; }
  function sincronizarHerois(c) {
    (c.herois || []).forEach(id => {
      const h = S.pegar('herois', id); if (!h) return;
      const todas = campanhasDoHeroi(h);
      const lista = [...new Set(todas.flatMap(mestresDe))].sort();
      if (JSON.stringify((h.mestres || []).slice().sort()) !== JSON.stringify(lista)) { h.mestres = lista; S.salvar('herois', h, 200); }
    });
  }

  // Campanhas antigas, criadas antes do login, ganham dono no primeiro acesso.
  function assumirCampanhaSemMestre(c) {
    if (c && !c.mestre && eu()) { c.mestre = eu(); c.membros = c.membros || []; c.escudo = c.escudo || []; if (!c.codigo) c.codigo = novoCodigo(); S.salvar('campanhas', c, 0); }
  }
  function novoCodigo() {
    const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
    for (let i = 0; i < 6; i++) s += L[Math.floor(Math.random() * L.length)];
    return s;
  }

  HB.P = { eu, ehMestre, temEscudo, ehMembro, podeEditarHeroi, podeEditarVilao, heroiVisivel, campanhasDoHeroi, minhasCampanhas, sincronizarHerois, assumirCampanhaSemMestre, novoCodigo };
})(window.HB);
