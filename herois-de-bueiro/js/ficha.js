// Heróis (lista e ficha) e Vilões (bestiário e ficha de vilão).
(function (HB) {
  const R = HB.R, UI = HB.UI, S = HB.S, esc = UI.esc;

  function novoHeroi() {
    return {
      nome: 'Novo herói', jogador: '', foto: '', classe: '', origem: '',
      escolhas: { classe: {}, origem: {}, maestria: '' }, base: {}, extra: {}, pontos: R.PONTOS_INICIAIS,
      maestriaExtra: {}, elementos: [], formaBestial: false, pv: null, mana: null, pvExtra: 0, manaExtra: 0, defExtra: 0,
      reputacao: 0, repHist: [], ataques: [], poderes: [], inventario: [], desc: {}, criado: Date.now(),
    };
  }
  const CONDICOES = ['Caído', 'Atordoado', 'Sangrando', 'Envenenado', 'Agarrado', 'Cego', 'Amedrontado', 'Inconsciente'];
  const pvAtual = (h, d) => (h.pv == null ? d.pvMax : h.pv);
  const manaAtual = (h, d) => (h.mana == null ? d.manaMax : h.mana);
  const nomeClasse = h => [(R.CLASSES[h.classe] || {}).nome, (R.ORIGENS[h.origem] || {}).nome].filter(Boolean).join(' · ') || 'Sem classe';

  // ---------- Lista de heróis ----------
  function listaHerois(estado) {
    const busca = (estado.busca || '').toLowerCase(), eu = HB.P.eu(), sis = HB.Sistemas.ativo, r = sis.rotulos;
    const todos = S.lista('herois').filter(h => HB.Sistemas.doSistema(h, sis.id)).filter(HB.P.heroiVisivel).filter(h => !busca || (h.nome + ' ' + (h.jogador || '')).toLowerCase().includes(busca))
      .sort((a, b) => (b.criado || 0) - (a.criado || 0));
    const meus = todos.filter(h => h.dono === eu), semDono = todos.filter(h => !h.dono), mesa = todos.filter(h => h.dono && h.dono !== eu);
    const grade = (xs, extra) => `<div class="grade-cartoes">${xs.map(h => cartaoHeroi(h, extra)).join('')}</div>`;
    return `<section class="pagina">
      <div class="pagina-topo"><div><h1 class="titulo-hq">${esc(r.personagens)}</h1><p class="sub">${meus.length} ficha${meus.length === 1 ? '' : 's'} sua${meus.length === 1 ? '' : 's'} · ${esc(sis.nome)}</p></div>
        <button class="btn primario" data-act="novo-heroi">${esc(r.novo)}</button></div>
      <label class="busca"><span class="sr">Buscar</span><input id="busca-herois" data-busca placeholder="Buscar por nome ou jogador" value="${esc(estado.busca || '')}"></label>
      ${meus.length ? grade(meus) : vazioHerois(sis)}
      ${mesa.length ? `<h2 class="secao">${esc(r.personagens)} das suas campanhas</h2>${grade(mesa)}` : ''}
      ${semDono.length ? `<h2 class="secao">Fichas sem dono</h2><p class="dica">Criadas antes do login. Assuma as que são suas.</p>${grade(semDono, 'assumir')}` : ''}
    </section>`;
  }
  function vazioHerois(sis) {
    const texto = sis.id === 'hb' ? 'Crie a primeira ficha: escolha classe e origem, distribua os 20 pontos de atributo e o resto se calcula sozinho.'
      : 'Crie a primeira ficha: escolha divisão e Ponto de Partida, distribua os atributos e marque as perícias. Vida, Reiryoku, Defesa e bônus se calculam sozinhos.';
    return `<div class="vazio-grande"><p class="titulo-hq">Nenhuma ficha ainda</p>
      <p>${texto}</p>
      <button class="btn primario" data-act="novo-heroi">${esc(sis.rotulos.novo)}</button></div>`;
  }
  function cartaoHeroi(h, extra) {
    const sis = HB.Sistemas.de(h), d = sis.derivados(h);
    return `<article class="cartao-heroi">
      ${UI.foto(h.foto, h.nome)}
      <div class="ch-info"><h3>${esc(h.nome)}</h3><p class="ch-classe">${esc(sis.nomeClasse(h))}</p>
        <p class="ch-meta">${h.dono ? 'Conta: ' + esc(HB.A.nome(h.dono)) : 'Sem dono'}${(h.condicoes || []).length ? ' · ' + esc(h.condicoes.join(', ')) : ''}</p>
        <div class="ch-barras">${UI.barraMini('pv', pvAtual(h, d), d.pvMax)}${UI.barraMini('mana', manaAtual(h, d), d.manaMax)}</div></div>
      <div class="ch-acoes">${extra === 'assumir' ? `<button class="btn pequeno" data-act="assumir-heroi" data-id="${h.id}">É meu</button>` : ''}<a class="btn pequeno primario" href="#heroi-${h.id}">Abrir ficha</a></div></article>`;
  }

  // ---------- Ficha do herói ----------
  function hexagono(h, d) {
    const cx = 160, cy = 160, raio = 112;
    const pts = R.TODOS.map((a, i) => { const ang = -Math.PI / 2 + i * Math.PI / 3; return [cx + raio * Math.cos(ang), cy + raio * Math.sin(ang), ang]; });
    const radar = R.TODOS.map((a, i) => { const f = 0.12 + 0.88 * (d.niv[a] / 5); return [cx + raio * f * Math.cos(pts[i][2]), cy + raio * f * Math.sin(pts[i][2])].join(','); }).join(' ');
    const aneis = [0.4, 0.7, 1].map(f => `<polygon class="hex-anel" points="${pts.map(p => [cx + (p[0] - cx) * f, cy + (p[1] - cy) * f].join(',')).join(' ')}"/>`).join('');
    const nos = R.TODOS.map((a, i) => `<g class="hex-no" data-act="rolar-attr" data-attr="${a}" tabindex="0" role="button" aria-label="Rolar ${R.nomeAttr(a)}">
        <circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="33"/>
        <text x="${pts[i][0]}" y="${pts[i][1] - 6}" class="hex-dado">${R.dadoTexto(d.niv[a]).replace('—', '0')}</text>
        <text x="${pts[i][0]}" y="${pts[i][1] + 13}" class="hex-sigla">${a}</text></g>`).join('');
    return `<svg class="hexagono" viewBox="0 0 320 320" role="group" aria-label="Atributos">${aneis}<polygon class="hex-radar" points="${radar}"/>${nos}
      <text x="160" y="156" class="hex-centro">1d10</text><text x="160" y="176" class="hex-centro-sub">+ dado do nível</text></svg>`;
  }

  function blocoEscolhas(def, alvoPath, valores) {
    if (!def || !def.escolhas) return '';
    return def.escolhas.map(e => {
      const v = (valores || {})[e.id] || '';
      let ops;
      if (e.tipo === 'pacote') ops = `<option value="">Escolha…</option>` + e.opcoes.map(o => `<option value="${o.id}" ${o.id === v ? 'selected' : ''}>${esc(o.nome)}</option>`).join('');
      else {
        const proib = e.diferenteDe ? (valores || {})[e.diferenteDe] : null;
        ops = UI.opcoesAttr(e.opcoes.filter(a => a !== proib || a === v), v);
      }
      return `<label class="campo"><span>${esc(e.rotulo)}</span><select id="${alvoPath.replace(/\./g, '-')}-${e.id}" data-f="${alvoPath}.${e.id}" data-re>${ops}</select></label>`;
    }).join('');
  }

  function ficha(h, estado) {
    const d = R.derivados(h);
    const c = R.CLASSES[h.classe], og = R.ORIGENS[h.origem];
    const sobra = d.total - d.gastos;
    const aba = estado.aba || 'combate';
    const pend = [];
    if (!c) pend.push('escolha uma classe');
    if (!og) pend.push('escolha uma origem');
    (c && c.escolhas || []).forEach(e => { if (!(h.escolhas.classe || {})[e.id]) pend.push('complete a escolha da classe'); });
    if (c && c.maestriaEscolha && !h.escolhas.maestria) pend.push('escolha a maestria nível 2 da classe');
    (og && og.escolhas || []).forEach(e => { if (!(h.escolhas.origem || {})[e.id]) pend.push('complete a escolha da origem'); });
    if (sobra > 0) pend.push(`distribua ${sobra} pontos de atributo`);
    if (sobra < 0) pend.push(`${-sobra} pontos acima do limite`);

    const pode = HB.P.podeEditarHeroi(h), dono = h.dono === HB.P.eu();
    const camps = HB.P.campanhasDoHeroi(h).filter(HB.P.ehMembro);
    return `<section class="pagina ficha ${pode ? '' : 'leitura'}" data-doc="herois:${h.id}">
      ${pode ? '' : `<p class="faixa">Ficha de ${esc(HB.A.nome(h.dono))}. Você pode ver e rolar, mas só o dono e o mestre da campanha mudam os números.</p>`}
      <div class="ficha-topo">
        <label class="foto-troca" title="Trocar foto">${UI.foto(h.foto, h.nome, 'grande')}<input type="file" accept="image/*" data-foto hidden><span>Trocar foto</span></label>
        <div class="ficha-ident">
          <label class="campo linha"><span>Herói</span><input id="h-nome" data-f="nome" value="${esc(h.nome)}"></label>
          <label class="campo linha"><span>Jogador</span><input id="h-jogador" data-f="jogador" value="${esc(h.jogador)}"></label>
          <div class="ficha-sel">
            <label class="campo"><span>Classe</span><select id="h-classe" data-f="classe" data-re><option value="">Escolha…</option>${Object.entries(R.CLASSES).map(([k, v]) => `<option value="${k}" ${k === h.classe ? 'selected' : ''}>${esc(v.nome)}</option>`).join('')}</select></label>
            <label class="campo"><span>Origem</span><select id="h-origem" data-f="origem" data-re><option value="">Escolha…</option>${Object.entries(R.ORIGENS).map(([k, v]) => `<option value="${k}" ${k === h.origem ? 'selected' : ''}>${esc(v.nome)}</option>`).join('')}</select></label>
          </div>
        </div>
        <div class="ficha-acoes">${camps.map(c => `<a class="chip-link" href="#campanha-${c.id}">${esc(c.nome)}</a>`).join('')}
          ${dono || !h.dono ? '<button class="btn pequeno" data-act="duplicar-heroi">Duplicar</button><button class="btn pequeno perigo-txt" data-act="apagar-heroi">Apagar</button>' : ''}</div>
      </div>
      <div class="ficha-fixa" aria-hidden="true"><b>${esc(h.nome)}</b>${UI.barraMini('pv', pvAtual(h, d), d.pvMax)}${UI.barraMini('mana', manaAtual(h, d), d.manaMax)}<span>Def ${d.defesa}</span></div>
      ${pend.length ? `<p class="pendente">Para fechar a ficha: ${esc(pend.join(' · '))}.</p>` : ''}

      <div class="ficha-grade">
        <div class="col-esq">
          ${hexagono(h, d)}
          <div class="recursos">
            <h4>Vida</h4>${UI.barra('pv', pvAtual(h, d), d.pvMax, 'heroi:' + h.id)}
            <h4>Mana</h4>${UI.barra('mana', manaAtual(h, d), d.manaMax, 'heroi:' + h.id)}
          </div>
          <div class="defesa-linha">
            <div class="escudo"><b>${d.defesa}</b><small>Defesa</small></div>
            <div class="defesa-conta">${c ? c.def + ' base' : 'base da classe'} + ${d.niv.AGI} Agi${h.defExtra ? ` + ${h.defExtra} outros` : ''}
              <label class="campo mini"><span>Outros</span><input id="h-defextra" type="number" data-f="defExtra" data-re value="${h.defExtra | 0}"></label></div>
          </div>
          <div class="condicoes" aria-label="Condições">${CONDICOES.map(x => `<button class="cond ${(h.condicoes || []).includes(x) ? 'on' : ''}" data-act="condicao" data-v="${x}" aria-pressed="${(h.condicoes || []).includes(x)}">${x}</button>`).join('')}</div>
          ${og && og.forma ? `<button class="btn ${h.formaBestial ? 'primario' : ''} largo" data-act="forma-bestial">${h.formaBestial ? 'Sair da Forma Bestial' : 'Assumir Forma Bestial (−5 Mana)'}</button>` : ''}
        </div>

        <div class="col-meio">
          <div class="bloco">
            <div class="bloco-topo"><h3>Atributos</h3><span class="pontos ${sobra < 0 ? 'ruim' : sobra === 0 ? 'ok' : ''}">${d.gastos} / <input id="h-pontos" type="number" data-f="pontos" data-re value="${d.total}" aria-label="Pontos totais"> pts</span></div>
            ${ajusteBarra(h, estado)}
            <div class="tabela-rolagem"><table class="tabela-attr">
              <thead><tr><th>Atributo</th><th>Compra</th><th title="Bônus de classe">Cl.</th><th title="Bônus de origem">Or.</th><th title="Ajuste do Mestre">Outros</th><th>Nível</th><th>Dado</th></tr></thead>
              <tbody>${R.TODOS.map(a => linhaAttr(h, d, a)).join('')}</tbody></table></div>
            <p class="dica">Cada nível comprado custa ${R.CUSTO_NIVEL} pontos. O nível final vai de 0 (Inexperiente) a 5 (Mestre). Clique no dado para rolar 1d10 + o dado do nível.</p>
          </div>
          <div class="bloco">
            <div class="bloco-topo"><h3>Maestrias</h3><span class="sub">ataque = 1d10 + bônus</span></div>
            ${c && c.maestriaEscolha ? `<label class="campo"><span>Maestria nível ${c.maestriaEscolha} da classe</span><select id="h-maestria" data-f="escolhas.maestria" data-re><option value="">Escolha…</option>${R.MAESTRIAS.map(m => `<option value="${m.id}" ${h.escolhas.maestria === m.id ? 'selected' : ''}>${esc(m.nome)}</option>`).join('')}</select></label>` : ''}
            <div class="maestrias">${R.MAESTRIAS.map(m => `<div class="maestria">
              <span class="m-nome">${esc(m.nome)}</span><span class="m-nivel">Nível ${d.maestria[m.id]}</span><b>+${R.bonusMaestria(d.maestria[m.id])}</b>
              <label class="campo mini"><span>Outros</span><input id="h-me-${m.id}" type="number" data-f="maestriaExtra.${m.id}" data-re value="${(h.maestriaExtra || {})[m.id] | 0}"></label></div>`).join('')}</div>
          </div>
          <div class="bloco">
            <div class="bloco-topo"><h3>Classe e origem</h3></div>
            ${c ? `<p class="regra"><b>${esc(c.nome)}.</b> ${esc(c.resumo)}.</p>` : '<p class="regra">Sem classe escolhida.</p>'}
            <div class="escolhas">${blocoEscolhas(c, 'escolhas.classe', h.escolhas.classe)}</div>
            ${og ? `<p class="regra"><b>${esc(og.nome)}.</b> ${esc(og.texto)}</p>` : '<p class="regra">Sem origem escolhida.</p>'}
            <div class="escolhas">${blocoEscolhas(og, 'escolhas.origem', h.escolhas.origem)}${blocoElementos(h, og)}</div>
            <div class="escolhas">
              <label class="campo mini"><span>Vida extra</span><input id="h-pvextra" type="number" data-f="pvExtra" data-re value="${h.pvExtra | 0}"></label>
              <label class="campo mini"><span>Mana extra</span><input id="h-manaextra" type="number" data-f="manaExtra" data-re value="${h.manaExtra | 0}"></label>
            </div>
          </div>
        </div>

        <div class="col-dir">
          <div class="abas" role="tablist">${[['combate', 'Combate'], ['poderes', 'Poderes'], ['inventario', 'Inventário'], ['reputacao', 'Reputação'], ['descricao', 'Descrição']]
            .map(([k, n]) => `<button role="tab" aria-selected="${aba === k}" class="aba ${aba === k ? 'ativa' : ''}" data-act="aba" data-aba="${k}">${n}</button>`).join('')}</div>
          <div class="aba-corpo">${abaHeroi(h, d, aba)}</div>
        </div>
      </div>
    </section>`;
  }

  function blocoElementos(h, og) {
    if (!og || !og.elemento) return '';
    const els = Object.keys(R.ELEMENTOS);
    let html = '';
    for (let i = 0; i < og.elemento; i++) {
      const v = (h.elementos || [])[i] || '';
      html += `<label class="campo"><span>${og.elemento === 1 ? 'Elemento principal' : 'Elemento ' + (i + 1)}</span><select id="h-el-${i}" data-f="elementos.${i}" data-re><option value="">Escolha…</option>${els.map(e => `<option ${e === v ? 'selected' : ''}>${e}</option>`).join('')}</select></label>`;
    }
    const el = (h.elementos || [])[0];
    if (og.elemento === 1 && R.ELEMENTOS[el]) html += `<p class="regra el">Domina <b>${R.ELEMENTOS[el].vence}</b> (+1 nível de dado) · vulnerável a <b>${R.perdePara(el)}</b> (−1 nível).</p>`;
    html += `<label class="campo"><span>Variante (ex.: gelo, magma)</span><input id="h-variante" data-f="variante" value="${esc(h.variante || '')}"></label>`;
    return html;
  }

  function ajusteBarra(h, estado) {
    const aj = estado.ajuste | 0;
    const sits = R.situacoes(h, null).concat(R.situacoes(h, 'CAR').filter(s => s.attr === 'CAR' || /rep\./.test(s.rotulo)));
    const unicas = []; sits.forEach(s => { if (!unicas.some(u => u.rotulo === s.rotulo)) unicas.push(s); });
    return `<div class="ajuste" aria-label="Ajuste da próxima rolagem">
      <span class="aj-rot">Próxima rolagem</span>
      <button class="seta" data-act="ajuste" data-d="-1" aria-label="Um nível de dado a menos">−</button>
      <b class="aj-val ${aj > 0 ? 'mais' : aj < 0 ? 'menos' : ''}">${aj > 0 ? '+' : ''}${aj} nível</b>
      <button class="seta" data-act="ajuste" data-d="1" aria-label="Um nível de dado a mais">+</button>
      ${unicas.map(s => `<button class="chip" data-act="ajuste-fixo" data-v="${s.mod}" title="${s.attr ? 'Só para ' + R.nomeAttr(s.attr) : ''}">${esc(s.rotulo)} ${s.mod > 0 ? '+' : ''}${s.mod}</button>`).join('')}
    </div>`;
  }

  function linhaAttr(h, d, a) {
    const m = d.mods[a], bruto = R.nivelBruto(h, a, d.mods), n = d.niv[a];
    const sinal = v => (v > 0 ? '+' + v : v < 0 ? String(v) : '·');
    return `<tr>
      <th scope="row">${esc(R.nomeAttr(a))}</th>
      <td><div class="passo"><button class="seta" data-act="base" data-attr="${a}" data-d="-1" aria-label="Diminuir ${R.nomeAttr(a)}">−</button><b>${(h.base || {})[a] | 0}</b><button class="seta" data-act="base" data-attr="${a}" data-d="1" aria-label="Aumentar ${R.nomeAttr(a)}">+</button></div></td>
      <td class="mod">${sinal(m.classe)}</td><td class="mod">${sinal(m.origem + m.forma)}</td>
      <td><input id="h-extra-${a}" class="num" type="number" data-f="extra.${a}" data-re value="${(h.extra || {})[a] | 0}" aria-label="Outros ${R.nomeAttr(a)}"></td>
      <td><span class="nivel n${n}" title="${bruto !== n ? 'Soma ' + bruto + ', limitada a 0–5' : ''}">${esc(R.NIVEIS[n].nome)}${bruto !== n ? '*' : ''}</span></td>
      <td><button class="btn-dado" data-act="rolar-attr" data-attr="${a}" aria-label="Rolar ${R.nomeAttr(a)}">1d10${n ? '+' + R.dadoTexto(n) : ''}</button></td></tr>`;
  }

  function abaHeroi(h, d, aba) {
    if (aba === 'combate') return abaCombate(h, d, 'herois');
    if (aba === 'poderes') return listaEditavel(h, 'poderes', 'Novo poder', p => `
      <div class="item-topo"><input id="pd-n-${p.i}" class="item-nome" data-f="poderes.${p.i}.nome" value="${esc(p.o.nome)}" placeholder="Nome do poder">
        <label class="campo mini"><span>Mana</span><input id="pd-c-${p.i}" type="number" data-f="poderes.${p.i}.custo" value="${p.o.custo | 0}"></label>
        <button class="btn pequeno" data-act="usar-poder" data-i="${p.i}">Usar</button></div>
      <textarea id="pd-d-${p.i}" data-f="poderes.${p.i}.desc" rows="3" placeholder="O que faz, alcance, duração…">${esc(p.o.desc || '')}</textarea>`,
      'Poderes mutantes, feitiços, nanotecnologia, truques de inventor. Usar um poder desconta a Mana.');
    if (aba === 'inventario') return listaEditavel(h, 'inventario', 'Novo item', p => `
      <div class="item-topo"><input id="iv-n-${p.i}" class="item-nome" data-f="inventario.${p.i}.nome" value="${esc(p.o.nome)}" placeholder="Item">
        <label class="campo mini"><span>Qtd</span><input id="iv-q-${p.i}" type="number" data-f="inventario.${p.i}.qtd" value="${p.o.qtd == null ? 1 : p.o.qtd}"></label></div>
      <input id="iv-d-${p.i}" data-f="inventario.${p.i}.desc" value="${esc(p.o.desc || '')}" placeholder="Detalhes">`);
    if (aba === 'reputacao') return abaReputacao(h);
    const campos = [['aparencia', 'Aparência'], ['personalidade', 'Personalidade'], ['historia', 'História'], ['notas', 'Anotações']];
    return campos.map(([k, n]) => `<label class="campo"><span>${n}</span><textarea id="h-desc-${k}" rows="${k === 'historia' ? 6 : 3}" data-f="desc.${k}">${esc((h.desc || {})[k] || '')}</textarea></label>`).join('');
  }

  function listaEditavel(o, campo, rotuloNovo, item, dica) {
    const xs = o[campo] || [];
    return `${dica ? `<p class="dica">${esc(dica)}</p>` : ''}
      <div class="itens">${xs.map((x, i) => `<div class="item">${item({ o: x, i })}<button class="icone apagar-item" data-act="remover-item" data-campo="${campo}" data-i="${i}" aria-label="Remover">✕</button></div>`).join('') || '<p class="vazio">Nada aqui ainda.</p>'}</div>
      <button class="btn largo" data-act="adicionar-item" data-campo="${campo}">${esc(rotuloNovo)}</button>`;
  }

  // Ataques: usados na ficha do herói e na do vilão. col = 'herois' | 'viloes'
  function abaCombate(o, d, col) {
    const xs = o.ataques || [];
    return `<form class="rolar-livre" data-act-submit="rolar-livre"><label class="sr" for="livre-${o.id}">Rolar dados</label>
        <input id="livre-${o.id}" name="expr" placeholder="Rolar dados: 2d6+3" autocomplete="off"><button class="btn">Rolar</button></form>
      <div class="itens">${xs.map((a, i) => cartaoAtaque(o, d, a, i)).join('') || '<p class="vazio">Sem ataques. Um soco usa Força e a maestria Corpo a corpo.</p>'}</div>
      <button class="btn largo" data-act="novo-ataque">Novo ataque</button>`;
  }
  function cartaoAtaque(o, d, a, i) {
    const nm = d.maestria[a.maestria] | 0, na = d.niv[a.attr] | 0, bm = R.bonusMaestria(nm);
    return `<div class="item ataque">
      <div class="item-topo"><input id="at-n-${i}" class="item-nome" data-f="ataques.${i}.nome" value="${esc(a.nome)}" placeholder="Nome do ataque">
        <button class="btn pequeno primario" data-act="rolar-ataque" data-i="${i}">Atacar</button></div>
      <div class="ataque-campos">
        <label class="campo"><span>Maestria</span><select id="at-m-${i}" data-f="ataques.${i}.maestria" data-re>${R.MAESTRIAS.map(m => `<option value="${m.id}" ${m.id === a.maestria ? 'selected' : ''}>${esc(m.curto)}</option>`).join('')}</select></label>
        <label class="campo"><span>Dano por</span><select id="at-a-${i}" data-f="ataques.${i}.attr" data-re>${R.TODOS.map(x => `<option value="${x}" ${x === a.attr ? 'selected' : ''}>${esc(R.nomeAttr(x))}</option>`).join('')}</select></label>
        <label class="campo mini"><span>Bônus dano</span><input id="at-b-${i}" type="number" data-f="ataques.${i}.bonus" data-re value="${a.bonus | 0}"></label>
      </div>
      <div class="ataque-resumo"><span><small>Ataque</small> 1d10 + ${bm}</span><span><small>Dano</small> ${na ? R.dadoTexto(na) + ' + ' : ''}${bm + (a.bonus | 0)}</span></div>
      <input id="at-o-${i}" data-f="ataques.${i}.obs" value="${esc(a.obs || '')}" placeholder="Alcance, elemento, efeito…">
      <button class="icone apagar-item" data-act="remover-item" data-campo="ataques" data-i="${i}" aria-label="Remover ataque">✕</button></div>`;
  }

  function abaReputacao(h) {
    const p = h.reputacao | 0, e = R.REPUTACAO.estado(p);
    const pct = Math.max(0, Math.min(100, (p + 100) / 2));
    return `<div class="rep">
      <div class="rep-estado ${e.id}"><b>${esc(e.nome)}</b><span>${p > 0 ? '+' : ''}${p} pontos</span></div>
      <div class="rep-trilho" aria-hidden="true"><span style="left:${pct}%"></span><i>−100</i><i>0</i><i>+100</i></div>
      <p class="regra">${esc(e.efeito)}.</p>
      <div class="rep-acao">
        <label class="campo"><span>Ação</span><select id="rep-tipo"><option value="1">Benéfica (+)</option><option value="0">Neutra</option><option value="-1">Maléfica (−)</option></select></label>
        <label class="campo"><span>Grau</span><select id="rep-grau"><option value="1">Grau 1 · 10</option><option value="2">Grau 2 · 20</option><option value="3">Grau 3 · 30</option></select></label>
        <label class="campo"><span>O que aconteceu</span><input id="rep-desc" placeholder="Salvou o ônibus da linha 42"></label>
        <button class="btn primario" data-act="rep-registrar">Registrar</button></div>
      <ul class="rep-hist">${(h.repHist || []).map(r => `<li><b class="${r.pts > 0 ? 'mais' : r.pts < 0 ? 'menos' : ''}">${r.pts > 0 ? '+' : ''}${r.pts}</b> ${esc(r.desc || 'Sem descrição')} <small>${new Date(r.em).toLocaleDateString('pt-BR')}</small></li>`).join('') || '<li class="vazio">Nenhuma ação registrada. Todo herói começa com 0.</li>'}</ul></div>`;
  }

  // ---------- Vilões ----------
  const BESTIARIO = [
    { id: 'base-capanga', base: true, nome: 'Capanga de Beco', categoria: 'Humano · Comum', ameaca: 1, niveis: { FOR: 2, AGI: 1, CAR: 0, INT: 0, FEI: 0, VIG: 2 }, maestria: { cac: 1, dist: 1, mag: 0 }, pvMax: 18, manaMax: 0, defesa: 4,
      ataques: [{ nome: 'Taco de beisebol', maestria: 'cac', attr: 'FOR', bonus: 1 }, { nome: 'Pistola barata', maestria: 'dist', attr: 'AGI', bonus: 2 }], desc: 'Trabalha para quem paga melhor. Foge quando metade do grupo cai.' },
    { id: 'base-ratazana', base: true, nome: 'Ratazana do Esgoto Químico', categoria: 'Mutante · Pequena', ameaca: 1, niveis: { FOR: 1, AGI: 3, CAR: 0, INT: 0, FEI: 0, VIG: 1 }, maestria: { cac: 1, dist: 0, mag: 0 }, pvMax: 9, manaMax: 0, defesa: 6,
      ataques: [{ nome: 'Mordida tóxica', maestria: 'cac', attr: 'AGI', bonus: 0, obs: 'Teste de Vigor ou perde 1 PV por turno' }], desc: 'Andam em bandos de 3 a 6 nos túneis perto da estação de tratamento.' },
    { id: 'base-ciborgue', base: true, nome: 'Cobrador Ciborgue', categoria: 'Mercenário · Médio', ameaca: 3, niveis: { FOR: 3, AGI: 3, CAR: 1, INT: 2, FEI: 0, VIG: 3 }, maestria: { cac: 2, dist: 3, mag: 0 }, pvMax: 45, manaMax: 10, defesa: 9,
      ataques: [{ nome: 'Canhão de pulso', maestria: 'dist', attr: 'AGI', bonus: 3 }, { nome: 'Punho hidráulico', maestria: 'cac', attr: 'FOR', bonus: 2 }], poderes: [{ nome: 'Varredura térmica', custo: 5, desc: 'Vê através de paredes finas até o fim da cena.' }], desc: 'Contratado para cobrar dívidas de heróis. Não aceita parcelamento.' },
    { id: 'base-elemental', base: true, nome: 'Lodo Elemental', categoria: 'Elemental (Água) · Grande', elemento: 'Água', ameaca: 4, niveis: { FOR: 3, AGI: 1, CAR: 0, INT: 1, FEI: 4, VIG: 4 }, maestria: { cac: 2, dist: 0, mag: 3 }, pvMax: 70, manaMax: 30, defesa: 8,
      ataques: [{ nome: 'Tromba de esgoto', maestria: 'mag', attr: 'FEI', bonus: 2, obs: 'Empurra 3 m' }, { nome: 'Abraço afogador', maestria: 'cac', attr: 'FOR', bonus: 0 }], desc: 'Água parada que criou vontade própria. Domina o Fogo e é vulnerável ao Vento.' },
  ];
  function viloes() { return BESTIARIO.concat(S.lista('viloes').filter(v => HB.Sistemas.doSistema(v, 'hb'))); }
  function pegarVilao(id) { return HB.Sistemas.lista().map(x => x.bestiario.find(v => v.id === id)).find(Boolean) || S.pegar('viloes', id); }
  function derivVilao(v) {
    const niv = {}; R.TODOS.forEach(a => (niv[a] = R.limitar((v.niveis || {})[a] | 0)));
    const maestria = {}; R.MAESTRIAS.forEach(m => (maestria[m.id] = R.limitar((v.maestria || {})[m.id] | 0)));
    return { niv, maestria, pvMax: v.pvMax | 0, manaMax: v.manaMax | 0, defesa: v.defesa | 0 };
  }
  function novoVilao() {
    return { nome: 'Novo vilão', categoria: '', ameaca: 1, elemento: '', niveis: { FOR: 1, AGI: 1, CAR: 0, INT: 0, FEI: 0, VIG: 1 }, maestria: { cac: 1, dist: 0, mag: 0 }, pvMax: 15, manaMax: 0, defesa: 4, ataques: [], poderes: [], desc: '' };
  }

  function listaViloes(estado, modoEscolha) {
    const busca = (estado.busca || '').toLowerCase(), filtro = estado.filtro || 'todos';
    const xs = viloes().filter(v => (!busca || v.nome.toLowerCase().includes(busca)) &&
      (filtro === 'todos' || (filtro === 'meus' ? !v.base && v.dono === HB.P.eu() : filtro === 'base' ? v.base : v.elemento === filtro)));
    const filtros = [['todos', 'Todos'], ['base', 'Bestiário base'], ['meus', 'Meus vilões']].concat(Object.keys(R.ELEMENTOS).map(e => [e, e]));
    return `<div class="filtros" role="tablist">${filtros.map(([k, n]) => `<button class="aba ${filtro === k ? 'ativa' : ''}" data-act="filtro" data-v="${esc(k)}">${esc(n)}</button>`).join('')}</div>
      <label class="busca"><span class="sr">Buscar vilão</span><input id="busca-viloes" data-busca placeholder="Buscar vilão" value="${esc(estado.busca || '')}"></label>
      <div class="lista-viloes">${xs.map(v => cartaoVilao(v, modoEscolha)).join('') || '<p class="vazio">Nenhum vilão com esse filtro.</p>'}</div>`;
  }
  function cartaoVilao(v, modoEscolha) {
    const el = R.ELEMENTOS[v.elemento];
    return `<article class="cartao-vilao" ${el ? `style="--el:${el.cor}"` : ''}>
      ${UI.foto(v.foto, v.nome)}
      <div class="cv-info"><h3>${esc(v.nome)}</h3><p><b>Ameaça ${v.ameaca | 0}</b> · ${esc(v.categoria || 'Sem categoria')}</p>
        <p class="cv-stats">PV ${v.pvMax | 0} · Def ${v.defesa | 0}${v.base ? ' · <span class="selo">Base</span>' : ''}</p></div>
      <div class="cv-acoes">${modoEscolha ? `<button class="btn pequeno" data-act="ver-vilao" data-id="${v.id}">Ficha</button><button class="btn pequeno primario" data-act="add-vilao-combate" data-id="${v.id}">Adicionar</button>`
        : `<a class="btn pequeno primario" href="#vilao-${v.id}">Ficha</a>`}</div></article>`;
  }
  function paginaViloes(estado) {
    return `<section class="pagina">
      <div class="pagina-topo"><div><h1 class="titulo-hq">Vilões</h1><p class="sub">Bestiário base e os vilões criados pela mesa</p></div>
        <button class="btn primario" data-act="novo-vilao">Novo vilão</button></div>
      <p class="faixa">Esta página é para consulta. Para usar um vilão em jogo, abra o Escudo do Mestre da campanha, crie um combate e adicione o vilão.</p>
      ${listaViloes(estado)}</section>`;
  }

  function fichaVilao(v, estado) {
    const d = derivVilao(v), so = !HB.P.podeEditarVilao(v);
    const dis = so ? 'disabled' : '';
    return `<section class="pagina ficha vilao ${so ? 'leitura' : ''}" ${so ? '' : `data-doc="viloes:${v.id}"`}>
      <div class="ficha-topo">
        <label class="foto-troca">${UI.foto(v.foto, v.nome, 'grande')}${so ? '' : '<input type="file" accept="image/*" data-foto hidden><span>Foto</span>'}</label>
        <div class="ficha-ident">
          <label class="campo linha"><span>Vilão</span><input id="v-nome" data-f="nome" value="${esc(v.nome)}" ${dis}></label>
          <label class="campo linha"><span>Categoria</span><input id="v-cat" data-f="categoria" value="${esc(v.categoria || '')}" placeholder="Mutante · Grande" ${dis}></label>
          <div class="ficha-sel">
            <label class="campo"><span>Nível de ameaça</span><input id="v-ameaca" type="number" data-f="ameaca" value="${v.ameaca | 0}" ${dis}></label>
            <label class="campo"><span>Elemento</span><select id="v-el" data-f="elemento" data-re ${dis}><option value="">Nenhum</option>${Object.keys(R.ELEMENTOS).map(e => `<option ${e === v.elemento ? 'selected' : ''}>${e}</option>`).join('')}</select></label>
          </div></div>
        <div class="ficha-acoes">${so ? `<button class="btn pequeno primario" data-act="duplicar-vilao">${v.base ? 'Duplicar para editar' : 'Duplicar'}</button>` : '<button class="btn pequeno" data-act="duplicar-vilao">Duplicar</button><button class="btn pequeno perigo-txt" data-act="apagar-vilao">Apagar</button>'}</div>
      </div>
      ${so ? `<p class="faixa">${v.base ? 'Vilão do bestiário base.' : 'Vilão criado por ' + esc(HB.A.nome(v.dono)) + '.'} Duplique para mudar os números.</p>` : ''}
      <div class="ficha-grade">
        <div class="col-esq">
          ${hexagono(v, d)}
          <div class="vilao-numeros">
            <label class="campo"><span>Vida</span><input id="v-pv" type="number" data-f="pvMax" data-re value="${v.pvMax | 0}" ${dis}></label>
            <label class="campo"><span>Mana</span><input id="v-mana" type="number" data-f="manaMax" data-re value="${v.manaMax | 0}" ${dis}></label>
            <label class="campo"><span>Defesa</span><input id="v-def" type="number" data-f="defesa" data-re value="${v.defesa | 0}" ${dis}></label>
          </div>
        </div>
        <div class="col-meio">
          <div class="bloco"><div class="bloco-topo"><h3>Atributos</h3></div>
            <div class="tabela-rolagem"><table class="tabela-attr"><thead><tr><th>Atributo</th><th>Nível</th><th>Dado</th></tr></thead><tbody>
            ${R.TODOS.map(a => `<tr><th scope="row">${esc(R.nomeAttr(a))}</th>
              <td>${so ? `<span class="nivel n${d.niv[a]}">${esc(R.NIVEIS[d.niv[a]].nome)}</span>` : `<select id="v-n-${a}" data-f="niveis.${a}" data-num data-re>${R.NIVEIS.map((n, i) => `<option value="${i}" ${i === d.niv[a] ? 'selected' : ''}>${i} · ${esc(n.nome)}</option>`).join('')}</select>`}</td>
              <td><button class="btn-dado" data-act="rolar-attr" data-attr="${a}">1d10${d.niv[a] ? '+' + R.dadoTexto(d.niv[a]) : ''}</button></td></tr>`).join('')}
            </tbody></table></div></div>
          <div class="bloco"><div class="bloco-topo"><h3>Maestrias</h3></div>
            <div class="maestrias">${R.MAESTRIAS.map(m => `<div class="maestria"><span class="m-nome">${esc(m.nome)}</span>
              ${so ? `<span class="m-nivel">Nível ${d.maestria[m.id]}</span>` : `<select id="v-m-${m.id}" data-f="maestria.${m.id}" data-num data-re aria-label="Nível">${[0, 1, 2, 3, 4, 5].map(i => `<option value="${i}" ${i === d.maestria[m.id] ? 'selected' : ''}>Nível ${i}</option>`).join('')}</select>`}
              <b>+${R.bonusMaestria(d.maestria[m.id])}</b></div>`).join('')}</div></div>
          <div class="bloco"><div class="bloco-topo"><h3>Descrição</h3></div>
            <textarea id="v-desc" rows="5" data-f="desc" ${dis}>${esc(v.desc || '')}</textarea></div>
        </div>
        <div class="col-dir">
          <div class="abas">${[['combate', 'Ataques'], ['poderes', 'Poderes']].map(([k, n]) => `<button class="aba ${(estado.aba || 'combate') === k ? 'ativa' : ''}" data-act="aba" data-aba="${k}">${n}</button>`).join('')}</div>
          <div class="aba-corpo ${so ? 'so-leitura' : ''}">${(estado.aba || 'combate') === 'poderes'
            ? listaEditavel(v, 'poderes', 'Novo poder', p => `<div class="item-topo"><input id="vp-n-${p.i}" class="item-nome" data-f="poderes.${p.i}.nome" value="${esc(p.o.nome)}" ${dis}><label class="campo mini"><span>Mana</span><input id="vp-c-${p.i}" type="number" data-f="poderes.${p.i}.custo" value="${p.o.custo | 0}" ${dis}></label></div><textarea id="vp-d-${p.i}" data-f="poderes.${p.i}.desc" rows="2" ${dis}>${esc(p.o.desc || '')}</textarea>`)
            : abaCombate(v, d, 'viloes')}</div>
        </div></div></section>`;
  }

  HB.F = { CONDICOES, novoHeroi, listaHerois, ficha, pvAtual, manaAtual, nomeClasse, abaCombate, cartaoAtaque,
    BESTIARIO, viloes, pegarVilao, derivVilao, novoVilao, listaViloes, paginaViloes, fichaVilao, hexagono };
})(window.HB);
