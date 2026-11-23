// Rolagens: 1d10 + dado do nível do atributo, ataques (1d10 + maestria) e dano (dado do atributo + maestria).
(function (HB) {
  const R = HB.R;
  const d = lados => 1 + Math.floor(Math.random() * lados);
  const rolar = lista => lista.map(l => ({ l, v: d(l) }));
  const soma = xs => xs.reduce((s, x) => s + x.v, 0);

  // Teste de atributo. ajuste = níveis de dado a mais/menos (situação).
  function teste(quem, attr, nivelBase, ajuste = 0, rotulo) {
    const n = R.limitar(nivelBase + ajuste);
    const base = rolar([10]), extra = rolar(R.NIVEIS[n].dados);
    return {
      tipo: 'teste', quem, titulo: rotulo || R.nomeAttr(attr),
      formula: '1d10' + (extra.length ? ' + ' + R.dadoTexto(n) : ''),
      dados: base.concat(extra), bonus: 0, total: soma(base) + soma(extra),
      nota: ajuste ? (ajuste > 0 ? '+' : '') + ajuste + ' nível de dado' : '',
    };
  }

  function ataque(quem, nome, nivelMaestria, nivelAttrDano, bonusDano = 0, alvoDef = null) {
    const bm = R.bonusMaestria(nivelMaestria);
    const a = rolar([10]);
    const dd = rolar(R.NIVEIS[R.limitar(nivelAttrDano)].dados);
    const totalA = soma(a) + bm;
    const totalD = soma(dd) + bm + (bonusDano | 0);
    return {
      tipo: 'ataque', quem, titulo: nome,
      formula: '1d10 + ' + bm, dados: a, bonus: bm, total: totalA,
      dano: { formula: (dd.length ? R.dadoTexto(nivelAttrDano) + ' + ' : '') + (bm + (bonusDano | 0)), dados: dd, total: Math.max(0, totalD) },
      alvoDef, acertou: alvoDef == null ? null : totalA >= alvoDef,
    };
  }

  // Rolagem livre: "2d6+3", "1d10 + 1d8 - 1".
  function livre(quem, expr) {
    const limpo = String(expr || '').replace(/\s+/g, '').toLowerCase();
    if (!/^[-+]?(\d*d\d+|\d+)([-+](\d*d\d+|\d+))*$/.test(limpo)) return null;
    let total = 0, bonus = 0; const dados = [];
    limpo.match(/[-+]?[^-+]+/g).forEach(t => {
      const s = t[0] === '-' ? -1 : 1, x = t.replace(/^[-+]/, '');
      if (x.includes('d')) {
        let [q, l] = x.split('d').map(Number); q = Math.min(q || 1, 50); l = Math.min(l, 1000);
        for (let i = 0; i < q; i++) { const v = d(l); dados.push({ l, v, neg: s < 0 }); total += s * v; }
      } else { bonus += s * +x; total += s * +x; }
    });
    return { tipo: 'livre', quem, titulo: 'Rolagem livre', formula: limpo, dados, bonus, total };
  }

  HB.D = { teste, ataque, livre, d };
})(window.HB);
