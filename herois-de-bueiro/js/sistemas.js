// RPGHUB: cada livro é um sistema com ficha, ameaças, regras e combate próprios.
// O resto do app (login, campanhas, escudo, combate, backup) é comum e fala com o sistema por esta interface.
(function (HB) {
  const SIS = {};
  const CHAVE = 'rpghub:livro';
  let ativo = null;
  try { ativo = localStorage.getItem(CHAVE); } catch (e) { /* sem armazenamento */ }

  // Fichas, vilões e campanhas antigos (antes do RPGHUB) são do Heróis de Bueiro.
  const idDe = doc => (doc && doc.sistema) || 'hb';

  // Modo manual: vida, recurso e defesa digitados na ficha; a ficha para de cobrar pontos.
  // 'auto' guarda o que o livro calcularia, para mostrar ao lado.
  HB.modoManual = (h, d) => {
    if (!h || h.modoCalc !== 'manual') return d;
    const m = h.manual || {};
    d.auto = { pvMax: d.pvMax, manaMax: d.manaMax, defesa: d.defesa };
    ['pvMax', 'manaMax', 'defesa'].forEach(k => { if (m[k] != null && m[k] !== '') d[k] = m[k] | 0; });
    [['gastos', 'total'], ['gastos', 'pontosAttr'], ['gastoAttr', 'ptsAttr'], ['gastoPer', 'ptsPer'], ['gastoDist', 'distrib'], ['afinGasta', 'afinTotal']]
      .forEach(([g, t]) => { if (g in d && t in d) d[t] = d[g]; });
    d.manual = true;
    return d;
  };

  // Aba Progressão (igual nos três livros): modo de cálculo, o que se ganha ao criar e tabela por nível.
  HB.progressaoHTML = (h, sis, d) => {
    const esc = HB.UI.esc, pr = sis.progressao(h, d), man = h.modoCalc === 'manual', a = d.auto || d, m = h.manual || {};
    const atual = pr.nivel || 0;
    const campo = (k, rot) => `<label class="campo"><span>${esc(rot)}</span><input id="pg-${k}" type="number" data-f="manual.${k}" data-re value="${m[k] != null && m[k] !== '' ? m[k] | 0 : a[k]}"><small>Automático: ${a[k]}</small></label>`;
    return `<div class="prog">
      <div class="prog-modo" role="group" aria-label="Como calcular">
        <button class="chip ${man ? '' : 'on'}" data-act="modo-calc" data-v="auto">Automático</button>
        <button class="chip ${man ? 'on' : ''}" data-act="modo-calc" data-v="manual">Manual</button></div>
      <p class="dica">${man ? 'Manual: você digita os números e a ficha não cobra pontos. A tabela abaixo continua mostrando o que o livro daria.'
        : 'Automático: vida, ' + esc(sis.rotulos.recurso) + ', defesa e pontos saem das regras do livro, pelo nível e pelas escolhas.'}</p>
      ${man ? `<div class="prog-manual">${campo('pvMax', 'Vida máxima')}${campo('manaMax', sis.rotulos.recurso + ' máximo')}${campo('defesa', sis.id === 'op2' ? 'DT para acertar' : 'Defesa')}</div>` : ''}
      <h3>Ao criar</h3><ul class="prog-inicio">${pr.inicio.map(x => `<li>${x}</li>`).join('')}</ul>
      ${pr.tabela ? `<h3>Por nível</h3>${atual ? `<p class="dica">Nível atual: <b>${atual}</b>${atual < pr.tabela.linhas.length ? ' · próximo: ' + (atual + 1) : ' (máximo)'}.</p>` : ''}
        <div class="tabela-rolagem"><table class="tabela-regra prog-tabela"><thead><tr>${pr.tabela.colunas.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>
        ${pr.tabela.linhas.map(l => `<tr class="${l.n < atual ? 'ganho' : l.n === atual ? 'atual' : l.n === atual + 1 ? 'proximo' : ''}">
          <td><b>${l.n}</b>${l.n <= atual ? ' <span class="ok-marca" aria-label="ganho">✓</span>' : l.n === atual + 1 ? ' <small>próximo</small>' : ''}</td>${l.cels.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
        </tbody></table></div>` : ''}
      ${pr.nota ? `<p class="regra">${pr.nota}</p>` : ''}
    </div>`;
  };

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
