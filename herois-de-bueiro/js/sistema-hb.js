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
    livro: { pdf: 'livros/herois-de-bueiro-playtest.pdf', titulo: 'Heróis de Bueiro · Playtest completo', tamanho: '90 KB', creditos: 'Sistema original da mesa.' },
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
    // O livro não tem tabela de níveis: mostra o que se ganha na criação e como o mestre faz evoluir.
    progressao(h, d) {
      const esc = HB.UI.esc, c = R.CLASSES[h.classe], o = R.ORIGENS[h.origem];
      const bonus = def => [Object.entries((def || {}).fixo || {}).map(([a, v]) => (v > 0 ? '+' : '') + v + ' ' + R.nomeAttr(a)).join(', '),
        ((def || {}).escolhas || []).map(e => e.tipo === 'pacote' ? e.rotulo + ': ' + e.opcoes.map(x => x.nome).join(' ou ') : e.rotulo + ' ' + e.opcoes.map(R.nomeAttr).join(' ou ')).join('; ')].filter(Boolean).join('; ');
      const total = h.pontos == null ? R.PONTOS_INICIAIS : h.pontos | 0, extras = Math.floor((total - R.PONTOS_INICIAIS) / R.CUSTO_NIVEL);
      return {
        inicio: [
          `<b>${R.PONTOS_INICIAIS} pontos de atributo</b>; cada nível de experiência custa ${R.CUSTO_NIVEL} (até 4 níveis comprados). Níveis: Inexperiente (0), Comum (d4), Bom (d6), Experiente (d8), Expert (d10), Mestre (2d6).`,
          c ? `<b>Classe ${esc(c.nome)}:</b> ${esc(c.resumo)}. Bônus: ${esc(bonus(c))}${c.maestria ? '; ' + Object.entries(c.maestria).map(([m, v]) => 'nível ' + v + ' em ' + R.MAESTRIAS.find(x => x.id === m).nome).join('') : '; nível ' + c.maestriaEscolha + ' na maestria escolhida'}.` : '<b>Classe:</b> escolha na ficha (dá vida, mana, defesa, níveis de atributo e maestria).',
          o ? `<b>Origem ${esc(o.nome)}:</b> ${esc(o.texto)}${bonus(o) ? ' Bônus: ' + esc(bonus(o)) + '.' : ''}` : '<b>Origem:</b> escolha na ficha (dá níveis de atributo e habilidades).',
          '<b>Maestrias</b> (corpo a corpo, distância, magia): bônus de ataque +2 por nível, vindos da classe e da origem.',
          '<b>Reputação</b> começa em 0 (neutra).',
        ],
        tabela: null,
        nota: `O livro do Heróis de Bueiro não tem tabela de níveis. Para evoluir, o mestre concede pontos de atributo (campo de pontos totais, 5 pontos = 1 nível) ou ajusta "Outros" nos atributos, maestrias, vida e mana. ${extras > 0 ? `Este herói já recebeu <b>${extras} nível${extras > 1 ? 'is' : ''} extra${extras > 1 ? 's' : ''}</b> (${total} pontos no total).` : 'Este herói ainda está com os 20 pontos iniciais.'}`,
      };
    },
  });
})(window.HB);
