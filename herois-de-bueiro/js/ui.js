// Peças de interface reaproveitadas: escape, avisos, janelas, barras, resultados de dados, fotos.
(function (HB) {
  const R = HB.R;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const $ = (s, el = document) => el.querySelector(s);

  function aviso(msg, tipo = 'erro') {
    const box = $('#avisos'); if (!box) return;
    const el = document.createElement('div');
    el.className = 'aviso ' + tipo; el.textContent = msg; el.setAttribute('role', 'status');
    box.appendChild(el);
    setTimeout(() => el.remove(), tipo === 'erro' ? 6000 : 2600);
  }

  // Janela modal simples. corpo = html; botoes = [{rotulo, acao(fechar, raiz), classe}]
  function janela(titulo, corpo, botoes = []) {
    fechar();
    const fundo = document.createElement('div');
    fundo.className = 'janela-fundo'; fundo.id = 'janela';
    fundo.innerHTML = `<div class="janela" role="dialog" aria-modal="true" aria-label="${esc(titulo)}">
      <div class="janela-topo"><h2>${esc(titulo)}</h2><button class="icone" data-fechar aria-label="Fechar">✕</button></div>
      <div class="janela-corpo">${corpo}</div>
      <div class="janela-botoes">${botoes.map((b, i) => `<button class="btn ${b.classe || ''}" data-b="${i}">${esc(b.rotulo)}</button>`).join('')}</div></div>`;
    document.body.appendChild(fundo);
    fundo.addEventListener('click', e => {
      if (e.target === fundo || e.target.closest('[data-fechar]')) return fechar();
      const b = e.target.closest('[data-b]');
      if (b) botoes[+b.dataset.b].acao(fechar, fundo);
    });
    const primeiro = fundo.querySelector('input,select,textarea,button.primario');
    if (primeiro) primeiro.focus();
    return fundo;
  }
  function fechar() { const j = $('#janela'); if (j) j.remove(); }
  function confirmar(titulo, texto, rotulo, acao) {
    janela(titulo, `<p>${esc(texto)}</p>`, [
      { rotulo: 'Cancelar', acao: f => f() },
      { rotulo, classe: 'perigo', acao: f => { f(); acao(); } },
    ]);
  }

  // Barra de recurso com << < valor > >>  (data-recurso="pv|mana")
  function barra(tipo, atual, max, alvo) {
    const pct = max > 0 ? Math.max(0, Math.min(100, (atual / max) * 100)) : 0;
    const a = `data-alvo="${esc(alvo)}" data-recurso="${tipo}"`;
    return `<div class="barra ${tipo}">
      <button class="seta" data-act="recurso" data-d="-5" ${a} aria-label="−5">«</button>
      <button class="seta" data-act="recurso" data-d="-1" ${a} aria-label="−1">‹</button>
      <div class="barra-trilho"><div class="barra-cheia" style="width:${pct}%"></div><button class="barra-num" data-act="recurso-valor" ${a} title="Digitar dano ou cura">${atual} / ${max}</button></div>
      <button class="seta" data-act="recurso" data-d="1" ${a} aria-label="+1">›</button>
      <button class="seta" data-act="recurso" data-d="5" ${a} aria-label="+5">»</button></div>`;
  }
  function barraMini(tipo, atual, max) {
    const pct = max > 0 ? Math.max(0, Math.min(100, (atual / max) * 100)) : 0;
    return `<div class="barra-mini ${tipo}"><div style="width:${pct}%"></div><span>${atual}/${max}</span></div>`;
  }

  function foto(src, nome, classe = '') {
    if (src) return `<img class="foto ${classe}" src="${esc(src)}" alt="">`;
    const ini = String(nome || '?').trim().split(/\s+/).slice(0, 2).map(p => p[0] || '').join('').toUpperCase();
    return `<div class="foto vazia ${classe}" aria-hidden="true">${esc(ini || '?')}</div>`;
  }

  // Recorte de foto: a pessoa arrasta e dá zoom dentro da moldura; sai sempre no tamanho certo,
  // não importa se a foto é em pé, deitada ou pequena.
  function carregarImagem(arquivo) {
    return new Promise((ok, falha) => {
      if (!arquivo || !/^image\//.test(arquivo.type)) return falha(new Error('tipo'));
      const url = URL.createObjectURL(arquivo), img = new Image();
      img.onload = () => ok(img); img.onerror = () => falha(new Error('imagem inválida')); img.src = url;
    });
  }
  function recortarFoto(arquivo, saida = { w: 320, h: 320 }) {
    return carregarImagem(arquivo).then(img => new Promise(ok => {
      const vw = 300, vh = Math.round(300 * saida.h / saida.w);
      const j = janela('Ajustar foto', `<div class="recorte"><canvas width="${vw * 2}" height="${vh * 2}" style="aspect-ratio:${saida.w}/${saida.h}" aria-label="Arraste para posicionar"></canvas></div>
        <label class="campo"><span>Zoom</span><input id="recorte-zoom" type="range" min="1" max="4" step="0.01" value="1"></label>
        <p class="dica">Arraste a imagem para enquadrar. A parte dentro da moldura é a que fica na ficha.</p>`, [
        { rotulo: 'Cancelar', acao: f => { f(); ok(null); } },
        { rotulo: 'Usar foto', classe: 'primario', acao: f => { f(); ok(exportar()); } },
      ]);
      const cv = j.querySelector('canvas'), ctx = cv.getContext('2d'), zoom = j.querySelector('#recorte-zoom');
      const W = cv.width, H = cv.height;
      const base = Math.max(W / img.width, H / img.height); // cobre a moldura inteira
      let z = 1, cx = img.width / 2, cy = img.height / 2;   // centro visível, em pixels da imagem
      function limitar() {
        const s = base * z, mw = W / s / 2, mh = H / s / 2;
        cx = Math.min(img.width - mw, Math.max(mw, cx)); cy = Math.min(img.height - mh, Math.max(mh, cy));
      }
      function desenhar() {
        limitar(); const s = base * z;
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        ctx.drawImage(img, W / 2 - cx * s, H / 2 - cy * s, img.width * s, img.height * s);
      }
      function exportar() {
        const c = document.createElement('canvas'); c.width = saida.w; c.height = saida.h;
        const s = base * z * (saida.w / W);
        c.getContext('2d').drawImage(img, saida.w / 2 - cx * s, saida.h / 2 - cy * s, img.width * s, img.height * s);
        return c.toDataURL('image/jpeg', 0.82);
      }
      let arr = null;
      cv.addEventListener('pointerdown', e => { arr = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
      cv.addEventListener('pointermove', e => {
        if (!arr) return;
        const k = (W / cv.clientWidth) / (base * z);
        cx -= (e.clientX - arr.x) * k; cy -= (e.clientY - arr.y) * k; arr = { x: e.clientX, y: e.clientY }; desenhar();
      });
      cv.addEventListener('pointerup', () => (arr = null));
      cv.addEventListener('wheel', e => { e.preventDefault(); z = Math.min(4, Math.max(1, z * (e.deltaY < 0 ? 1.08 : 1 / 1.08))); zoom.value = z; desenhar(); }, { passive: false });
      zoom.addEventListener('input', () => { z = +zoom.value; desenhar(); });
      desenhar();
    }));
  }

  // ---------- Resultados de rolagens ----------
  const sessao = []; // resultados desta visita (fora de campanha)
  function dadosHtml(ds) {
    return ds.map(x => `<span class="dado d${x.l}${x.neg ? ' neg' : ''}" title="d${x.l}">${x.v}</span>`).join('');
  }
  function cartaoResultado(r) {
    const quando = new Date(r.em || Date.now()).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    const acerto = (r.acertou == null ? '' : `<span class="selo ${r.acertou ? 'ok' : 'falha'}">${r.acertou ? 'Acertou' : 'Errou'} (${r.rotuloAlvo || (r.tipo === 'ataque' ? 'Def' : 'CD')} ${r.alvoDef})</span>`)
      + (r.critico ? '<span class="selo ok">Crítico</span>' : '') + (r.desastre ? '<span class="selo falha">Desastre</span>' : '');
    const dano = r.dano ? `<div class="res-col"><b>${r.dano.total}</b><small>dano</small></div>` : '';
    return `<div class="res ${r.tipo} ${r.secreta ? 'secreta' : ''}">${r.secreta ? '<span class="selo-secreta">Secreta</span>' : ''}
      <div class="res-quem">${esc(r.quem || '')}</div>
      <div class="res-linha"><div class="res-titulo">${esc(r.titulo)}</div>
        <div class="res-col"><b>${r.total}</b><small>${r.dano ? 'ataque' : 'total'}</small></div>${dano}</div>
      <div class="res-det">${dadosHtml(r.dados)}${r.bonus ? `<span class="bonus">${r.bonus > 0 ? '+' : ''}${r.bonus}</span>` : ''}
        ${r.dano ? `<span class="sep">dano</span>${dadosHtml(r.dano.dados)}` : ''}</div>
      <div class="res-rodape"><span>${esc(r.formula)}${r.dano ? ' · ' + esc(r.dano.formula) : ''}${r.nota ? ' · ' + esc(r.nota) : ''}</span>${acerto}<span>${quando}</span></div></div>`;
  }
  // Mostra o resultado e guarda no histórico (da campanha, se houver).
  function resultado(r, campanhaId) {
    r.em = Date.now();
    if (campanhaId && HB.rolagemSecreta) r.secreta = true;
    if (campanhaId) {
      const c = HB.S.pegar('campanhas', campanhaId);
      if (c) { c.rolagens = [r].concat(c.rolagens || []).slice(0, 30); HB.S.salvar('campanhas', c, 300); }
    } else sessao.unshift(r), sessao.splice(30);
    const lista = $('#resultados-lista');
    if (lista) { lista.insertAdjacentHTML('afterbegin', cartaoResultado(r)); const v = lista.querySelector('.vazio'); if (v) v.remove(); }
    mostrarRolagem(r);
  }

  // Quadro da rolagem: dado girando por ~0,6 s, depois o resultado. Fecha no ✕, no Esc ou sozinho depois de 6 s
  // (não some enquanto o mouse estiver em cima).
  const semMovimento = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fecharRolagem() {
    const pop = $('#rolagem-pop'); if (!pop) return;
    clearTimeout(mostrarRolagem.t); clearInterval(mostrarRolagem.giro); pop.hidden = true;
  }
  function agendarFechar(pop) { clearTimeout(mostrarRolagem.t); mostrarRolagem.t = setTimeout(() => { if (!pop.matches(':hover')) fecharRolagem(); else agendarFechar(pop); }, 6000); }
  function mostrarRolagem(r) {
    const pop = $('#rolagem-pop'); if (!pop) return;
    clearTimeout(mostrarRolagem.t); clearInterval(mostrarRolagem.giro);
    const fechar = '<button class="pop-fechar" type="button" aria-label="Fechar resultado">✕</button>';
    const mostrar = () => {
      pop.innerHTML = fechar + cartaoResultado(r);
      pop.classList.remove('entra', 'rolando'); void pop.offsetWidth; pop.classList.add('entra');
      agendarFechar(pop);
    };
    pop.hidden = false;
    if (semMovimento()) return mostrar();
    const lados = ((r.dados || [])[0] || {}).l || 20;
    const forma = lados === 20 ? 'd20' : lados === 6 ? 'd6' : lados === 4 ? 'd4' : 'd10';
    pop.innerHTML = fechar + `<div class="res rolando-caixa"><div class="dado-giro ${forma}" aria-hidden="true"><span>?</span></div><div><b>${esc(r.quem || '')}</b><small>${esc(r.titulo)} · rolando…</small></div></div>`;
    pop.classList.remove('entra'); pop.classList.add('rolando');
    const num = pop.querySelector('.dado-giro span');
    mostrarRolagem.giro = setInterval(() => { num.textContent = 1 + Math.floor(Math.random() * lados); }, 55);
    mostrarRolagem.t = setTimeout(() => { clearInterval(mostrarRolagem.giro); mostrar(); }, 620);
  }
  document.addEventListener('click', e => { if (e.target.closest('.pop-fechar')) fecharRolagem(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharRolagem(); });
  // Rolagens secretas do mestre só aparecem para quem tem o escudo.
  function painelResultados(lista, verSecretas, extra = '') {
    lista = verSecretas ? lista : lista.filter(r => !r.secreta);
    return `<aside class="resultados" aria-label="Resultados">
      <div class="resultados-topo"><h3>Resultados</h3>${extra}</div>
      <div id="resultados-lista">${lista.length ? lista.map(cartaoResultado).join('') : '<p class="vazio">As rolagens aparecem aqui.</p>'}</div></aside>`;
  }

  // Seleciona uma das opções de um atributo como <select>
  function opcoesAttr(lista, atual, vazio = 'Escolha…') {
    return `<option value="">${esc(vazio)}</option>` + lista.map(a => `<option value="${a}" ${a === atual ? 'selected' : ''}>${esc(R.nomeAttr(a))}</option>`).join('');
  }

  HB.UI = { esc, $, aviso, janela, fechar, confirmar, barra, barraMini, foto, recortarFoto, resultado, cartaoResultado, painelResultados, fecharRolagem, sessao, opcoesAttr };
})(window.HB);
