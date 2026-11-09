# Briefing — Mapa 3D de tabletop (igreja de casamento, Ordem Paranormal)

> Leia este arquivo inteiro e depois o `igreja-3d-site.html` antes de mexer em qualquer coisa.
> Idioma da interface e dos comentários: **português do Brasil**.

## 1. O que é o projeto

Um mapa 3D interativo, no navegador, para uma campanha de RPG de mesa (**Ordem Paranormal**, terror). A cena principal é uma **igreja tradicional preparada para um casamento**, com um terreno grande em volta. O mapa será usado de duas formas:

1. Aberto numa **página de site** (via iframe), com vários jogadores vendo a mesma cena.
2. **Exportado para uma mesa virtual (VTT)**: imagem do mapa vista de cima + arquivo Universal VTT (.dd2vtt) com paredes, portas e luzes.

No futuro vão entrar **mais mapas** (cada um deve ser um módulo fácil de adicionar).

**Prioridade: o cenário** (objetos, materiais, luz). Os personagens são só bonecos 2D (PNG) em pé e **não são o foco agora**.

## 2. Meta de qualidade visual (o ponto mais importante)

O alvo é a qualidade de um **jogo de terror em terceira pessoa feito em Unreal Engine** — ver as imagens em `referencias/`:

- `ref-1` a `ref-4`: capturas do jogo Ordem Paranormal (escritório, corredor, banheiro). Observar: luz global suave e pré-calculada, sombras macias nos cantos (oclusão de luz), materiais com desgaste e relevo (madeira, azulejo, concreto, cortinas), objetos modelados com detalhe, profundidade de campo leve, cor fria e dessaturada com pontos quentes, gradação de cor de cinema.
- `ref-0`: clima de uma igreja gótica ao anoitecer (usar só a *atmosfera*: céu pesado, janelas acesas, flores brancas no chão, poças que refletem a luz). O céu vermelho **não** é o alvo.

O que existe hoje foi escrito **sem que eu conseguisse ver o resultado na tela**, só com formas simples geradas por código. Está longe das referências. A grande tarefa é fechar essa distância.

### Direção de arte (decisões já tomadas pelo dono do projeto)

- Igreja tradicional, bem conservada mas **antiga e levemente misteriosa**. Madeira escura nas portas e na estrutura, **paredes de concreto** (não tijolo, não pedra aparente), janelas grandes com vitrais, torre com sino, cruz bem visível.
- Terror psicológico **sutil**: sem monstros, sangue ou elementos sobrenaturais exagerados. O medo vem da luz, da arquitetura e do isolamento.
- Final de tarde nublado quase noite. Paleta apagada: madeira marrom escura, vegetação verde desbotada, concreto cinza, luz quente discreta na entrada, luz ambiente fria, névoa leve.
- Casamento: flores brancas, tecidos brancos discretos, luzes quentes pequenas, caminho de entrada decorado, ar de cerimônia organizada. **Não colocar véus por cima da igreja** (o dono pediu para tirar).
- Terreno amplo: árvores antigas, vegetação densa, caminho de pedra, jardim, estruturas pequenas (galpão, caramanchão), bancos de madeira, estacionamento/área de entrada, chão irregular.
- Câmera de jogo em terceira pessoa na altura humana, e câmera de cinema ampla mostrando a igreja inteira.

## 3. Estado atual (arquivos desta pasta)

- `igreja-3d-site.html` — **tudo num arquivo só** (~900 kB, com os 4 personagens embutidos em base64). Three.js r128 carregado do jsDelivr. Estrutura do script, de cima para baixo:
  1. Utilitários: `box`, `cyl`, `inst` (instancing), texturas procedurais em canvas (madeira, concreto, telha, grama, pedra do chão), `veil` (tecido).
  2. Céu em cúpula + **presets de clima** (`PRE`: Terror, Anoitecer, Crepúsculo, Nublado, Noite) e `setTime()`. Reflexos vêm de um ambiente PMREM gerado do céu.
  3. `buildIgreja(MPo)` — o mapa principal (terreno, igreja, torre, coro no 2º andar com escada e órgão, decoração de casamento, estacionamento, carros, bancos, caramanchão, galpão, mato, árvores, sombras de contato falsas). Define também `MPo.layers`, `views`, `solid`, `spawn`, `walkStart`, `vtt`, `exportHide`.
  4. `buildCampo(M)` — mapa-modelo simples para mostrar como criar outro mapa. Registro em `MAPS`.
  5. Rede: três modos — Claude db (só funciona dentro do claude.ai), **WebSocket próprio** (`?ws=wss://…` + `servidor-sync.js`) e local.
  6. Personagens 2D (billboards) com arrastar, encaixe na grade, medidor de distância, setas do teclado, anti-sobreposição.
  7. **Caminhar** (WASD/setas, mouse/toque, joystick no celular) em 1ª e 3ª pessoa, com colisão e subida de escadas.
  8. **Exportar VTT**: PNG de cima (câmera ortográfica) e `.dd2vtt` (Universal VTT) com paredes, portas e luzes.
  9. **Importar 3D**: abre um `.glb` do computador como novo mapa (nomes de peça: `floor/piso/chao`, `wall/parede`, `roof/telhado`), com opção de "jardim e decoração ao redor" (`dressSite`), e HDRI `.hdr`.
- `servidor-sync.js` — relé de salas por WebSocket (Node + `ws`). Mensagens: `pos`, `char`, `delchar`.
- `tokens/` — os 4 PNGs dos personagens (Dante, Luis, Leo, Sabriny), já com fundo transparente.
- `referencias/` — imagens de referência visual.

### Parâmetros de URL já suportados

`?room=nome` · `?map=igreja|campo` · `?time=0..4` · `?ui=0` (sem interface) · `?ro=1` (só ver) · `?walk=1` · `?chars=0` (sem personagens) · `?ws=wss://servidor`. Para a página que incorpora: `postMessage({cmd:'map',id:'campo'})` e `({cmd:'time',i:2})`; a página avisa `{evt:'ready'}`.

## 4. O que quero que você faça (em ordem de prioridade)

### A. Preparar o projeto e o ciclo de verificação visual
1. Transformar em projeto de verdade (Vite + three atual; TypeScript se ajudar). **Manter** a opção de gerar um HTML único para hospedar em qualquer site, e manter os parâmetros de URL e o `postMessage` acima.
2. Extrair os módulos: `maps/` (um arquivo por mapa), `core/` (render, câmera, rede, tokens, caminhar, exportação VTT), `assets/` (modelos, texturas, HDRIs, tokens).
3. Montar um script de **capturas automáticas** (Playwright) que abre a cena em 5 câmeras fixas (Cinema, Fachada, Altar, Coro, 3ª pessoa) e em 2 climas, e salva PNGs em `capturas/`. **Compare cada rodada com `referencias/` e corrija em ciclos.** Eu nunca consegui fazer isso — é a maior vantagem de você.

### B. Qualidade visual (aproximar das referências)
1. Pós-processamento: AO real (GTAO/SSAO), bloom suave, vinheta, correção de cor, anti-serrilhado (SMAA/FXAA), profundidade de campo leve. Verificar tone mapping e codificação de cor no pipeline final.
2. Iluminação: luzes de área/janela suaves, sondas de luz, sombras de qualidade (cascata para o sol), luz volumétrica discreta nas janelas e na entrada. Revisar as intensidades (nunca vi o resultado, podem estar erradas).
3. Materiais PBR de verdade: texturas 2K/4K (cor, normal, rugosidade, AO) de concreto, madeira, telha, grama, cascalho, tecido. Substituir as texturas feitas em canvas.
4. **Substituir formas simples por modelos reais**: igreja/fachada, portas, bancos de igreja, lustres, altar, vitrais, árvores, carros antigos, bancos de jardim, lanternas, flores, caramanchão. Preferir CC0 (Poly Haven, ambientCG, Quixel/Fab se a licença permitir) e **registrar tudo em `CREDITS.md`** com link e licença. Perguntar antes de comprar qualquer coisa.
5. Se o Blender estiver instalado: fazer **bake de luz/AO** nos modelos e exportar `.glb` (scripts em `tools/`).

### C. Pipeline de assets e desempenho
- Otimizar com `gltf-transform` (KTX2/Basis, Draco ou Meshopt com os decodificadores incluídos, LODs). Meta: 60 fps no desktop, 30+ no celular.
- Predefinições de qualidade: Baixa / Média / Alta (resolução, sombras, pós-processamento, densidade de mato).
- Tela de carregamento com barra de progresso.

### D. Mesa virtual (VTT)
- Conferir o `.dd2vtt` gerado contra o formato Universal VTT e **testar a importação** (Foundry com o importador de Universal VTT, e outros se possível). Corrigir paredes, portas e luzes se estiverem fora do lugar.
- Exportar também por nível (térreo e 2º andar) e com grade calibrada (px por quadrado: 50/70/100/140). Gerar PNG sem pós-processamento pesado e sem personagens.

### E. Vários jogadores e hospedagem
- Servidor de sincronização de verdade (Node + WebSocket), com salas, persistência simples (arquivo JSON ou SQLite) e instruções de deploy (Render, Fly.io ou VPS) + como incorporar por iframe no site (CORS, CSP, `allow="fullscreen"`).
- Modo `?ro=1` realmente só leitura (hoje a trava é só no cliente).

### F. Arquitetura para mais mapas
- Cada mapa = um módulo com `build()`, `views`, `layers`, `solid`, `spawn`, `walkStart`, `vtt`, `exportHide`. Lista de mapas num manifesto. Documentar em `docs/NOVO-MAPA.md` como adicionar um (incluindo a convenção de nomes de peças em `.glb`).

## 5. Restrições e preferências

- Não adicionar gore, monstros visíveis ou conteúdo sobrenatural explícito na cena principal.
- Personagens são secundários: não gastar tempo neles, só não quebrar o que existe.
- Texto da interface em português.
- Fazer commits pequenos e frequentes e manter um `CHANGELOG.md`. Não reescrever tudo de uma vez: ir por etapas e mostrar as capturas a cada etapa.

## 6. Pontos de atenção (código escrito sem poder ver o resultado)

- Intensidades de luz, névoa e exposição **não foram calibradas visualmente**.
- O terreno irregular é uma malha de 80×80 com `raycast` por triângulo; pode pesar ao arrastar/caminhar. Considerar um colisor mais simples.
- A importação de `.glb` e de `.hdr` usa loaders do jsDelivr; dentro do claude.ai a política de segurança da página pode bloquear imagens `blob:`.
- Os reflexos usam um ambiente gerado do céu (não há reflexos em tempo real nem *ray tracing*).
- A colisão usa um raio horizontal e um vertical; paredes finas ou modelos importados com malhas ruins podem deixar o jogador atravessar.

## 7. Como saber que está bom

1. As capturas das 5 câmeras, lado a lado com `referencias/`, mostram luz suave, sombras de canto reais, materiais com relevo e objetos modelados — sem aparência de "caixas".
2. A cena roda fluida nas predefinições Média (desktop) e Baixa (celular).
3. O `.dd2vtt` importa num VTT com paredes e portas no lugar.
4. Duas abas/duas pessoas veem os mesmos objetos se mexendo via servidor WebSocket.
5. Adicionar o mapa `campo` (ou um novo) não exige mexer no núcleo.
