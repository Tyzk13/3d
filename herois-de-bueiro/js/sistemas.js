// RPGHUB: cada livro é um sistema com ficha, ameaças, regras e combate próprios.
// O resto do app (login, campanhas, escudo, combate, backup) é comum e fala com o sistema por esta interface.
(function (HB) {
  const SIS = {};
  const CHAVE = 'rpghub:livro';
  let ativo = null;
  try { ativo = localStorage.getItem(CHAVE); } catch (e) { /* sem armazenamento */ }

  // Fichas, vilões e campanhas antigos (antes do RPGHUB) são do Heróis de Bueiro.
  const idDe = doc => (doc && doc.sistema) || 'hb';

  HB.Sistemas = {
    registrar(s) { SIS[s.id] = s; },
    lista: () => Object.values(SIS),
    de: doc => SIS[idDe(doc)] || SIS.hb,
    idDe,
    get ativo() { return SIS[ativo] ? SIS[ativo] : null; },
    get idAtivo() { return SIS[ativo] ? ativo : null; },
    escolher(id) {
      if (!SIS[id]) return;
      ativo = id;
      try { localStorage.setItem(CHAVE, id); } catch (e) { /* segue só nesta visita */ }
      document.body.dataset.sistema = id;
    },
    doSistema: (doc, id) => idDe(doc) === id,
  };
})(window.HB);
