// Heróis de Bueiro como sistema do RPGHUB (regras em regras.js, ficha e vilões em ficha.js).
(function (HB) {
  const R = HB.R, F = HB.F, D = HB.D;
  const ehVilao = o => !!o.niveis;
  const der = o => (ehVilao(o) ? F.derivVilao(o) : R.derivados(o));

  function teste(o, attr, opts = {}) {
    const d = der(o);
    const r = D.teste(o.nome || '', attr, d.niv[attr] | 0, opts.ajuste | 0);
    if (attr === 'CAR' && R.ORIGENS[o.origem] && R.ORIGENS[o.origem].semCarisma) r.nota = (r.nota ? r.nota + ' · ' : '') + 'Android: não vale para Mentir, Persuadir ou Intimidar';
    return r;
  }
  function ataque(o, i, opts = {}) {
    const d = der(o), a = (o.ataques || [])[i]; if (!a) return null;
    return D.ataque(o.nome || '', a.nome || 'Ataque', d.maestria[a.maestria] | 0, d.niv[a.attr] | 0, a.bonus | 0, opts.alvoDef == null ? null : opts.alvoDef);
  }
  function combatente(o) {
    const d = der(o), v = ehVilao(o);
    return {
      pvMax: v ? d.pvMax : d.pvMax, manaMax: v ? d.manaMax : d.manaMax, def: d.defesa, dureza: 0,
      agi: d.niv.AGI, ordemClasse: R.ordemClasse(v ? '' : o.classe), valorIni: d.niv.AGI,
      linha: v ? (o.categoria || 'Vilão') + ' · Ameaça ' + (o.ameaca | 0) : F.nomeClasse(o),
      numeros: [['Defesa', d.defesa]].concat(R.MAESTRIAS.map(m => [m.curto, '+' + R.bonusMaestria(d.maestria[m.id])])),
      testes: R.TODOS.map(a => ({ id: a, rotulo: R.nomeAttr(a), curto: a, texto: '1d10' + (d.niv[a] ? '+' + R.dadoTexto(d.niv[a]) : ''), mini: R.dadoTexto(d.niv[a]).replace('—', '0') })),
      ataques: (o.ataques || []).map(a => {
        const bm = R.bonusMaestria(d.maestria[a.maestria]), na = d.niv[a.attr] | 0;
        return { nome: a.nome || 'Ataque', sub: `1d10 + ${bm} · dano ${na ? R.dadoTexto(na) + ' + ' : ''}${bm + (a.bonus | 0)}${a.obs ? ' · ' + a.obs : ''}` };
      }),
      poderes: (o.poderes || []).map(p => ({ nome: p.nome, custo: p.custo | 0, desc: p.desc || '' })),
    };
  }

  HB.Sistemas.registrar({
    id: 'hb', nome: 'Heróis de Bueiro', sub: 'Super-heróis de rua · 1d10 + dado do nível',
    descricao: 'Heróis remendados, mutantes e alienígenas defendendo a cidade a partir do esgoto. Atributos por nível de dado, maestrias, elementos e reputação.',
    rotulos: { personagens: 'Heróis', personagem: 'herói', novo: 'Novo herói', ameacas: 'Vilões', ameaca: 'vilão', novaAmeaca: 'Novo vilão', recurso: 'Mana' },
    iniciativa: 'fixa',
    temReputacao: true,
    condicoes: F.CONDICOES,
    ganchoAttr: { INT: 'INT', AGI: 'AGI' },
    dadosRapidos: [4, 6, 8, 10, 12, 20, 100].map(l => ({ rotulo: 'd' + l, expr: '1d' + l }))
      .concat(R.NIVEIS.map((n, i) => ({ rotulo: n.nome, sub: '1d10' + (i ? '+' + R.dadoTexto(i) : ''), expr: '1d10' + n.dados.map(x => '+1d' + x).join('') }))),
    novoPersonagem: F.novoHeroi,
    nomeClasse: F.nomeClasse,
    derivados: h => { const d = R.derivados(h); return { pvMax: d.pvMax, manaMax: d.manaMax, defesa: d.defesa }; },
    ficha: F.ficha,
    bestiario: F.BESTIARIO,
    novoVilao: F.novoVilao,
    fichaVilao: F.fichaVilao,
    listaViloes: F.listaViloes,
    paginaViloes: F.paginaViloes,
    cartaoVilaoInfo: v => ({ topo: 'Ameaça ' + (v.ameaca | 0), stats: `PV ${v.pvMax | 0} · Def ${v.defesa | 0}` }),
    combatente, teste, ataque,
    regras: () => HB.paginaRegrasHB(),
  });
})(window.HB);
