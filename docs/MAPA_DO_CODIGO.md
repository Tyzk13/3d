# Mapa do código

Gerado por `scripts/mapa_do_codigo.py` — rode de novo depois de criar, mover ou mudar arquivos.
Para ler uma função: Read com `offset` = linha e `limit` ≈ 40–80. Não leia arquivos inteiros sem necessidade.

## Pastas pesadas (binários: imagens, modelos, áudio, vídeo) — não abrir

| Pasta | Arquivos | Tamanho |
|---|---|---|
| `src/assets/` | 104 | 73.2 MB |
| `herois-de-bueiro/` | 2 | 16.7 MB |
| `capturas/` | 78 | 12.7 MB |
| `referencias/` | 5 | 2.4 MB |

## Linhas GIGANTES (dados embutidos) — grep sempre com `| cut -c1-200`

| Arquivo | Linha | Tamanho | Início |
|---|---|---|---|
| `herois-de-bueiro/vendor/firebase/firebase-app-compat.js` | 1 | 30 KB | !function(e,t){"object"==typeof exports& |
| `herois-de-bueiro/vendor/firebase/firebase-auth-compat.js` | 1 | 136 KB | !function(e,t){"object"==typeof exports& |
| `herois-de-bueiro/vendor/firebase/firebase-firestore-compat.js` | 1 | 333 KB | !function(e,t){"object"==typeof exports& |
| `legacy/igreja-3d-site.html` | 74 | 823 KB | const IMGS={"dante": "data:image/png;bas |

## Arquivos de texto/código

| Arquivo | Linhas | Tamanho |
|---|---|---|
| `herois-de-bueiro/css/app.css` | 591 | 50 KB |
| `herois-de-bueiro/gerar-index-unico.py` | 32 | 2 KB |
| `herois-de-bueiro/index.html` | 42 | 2 KB |
| `herois-de-bueiro/js/app.js` | 665 | 50 KB |
| `herois-de-bueiro/js/auth.js` | 113 | 6 KB |
| `herois-de-bueiro/js/dados.js` | 51 | 2 KB |
| `herois-de-bueiro/js/ficha.js` | 366 | 33 KB |
| `herois-de-bueiro/js/firebase-config.js` | 12 | 1 KB |
| `herois-de-bueiro/js/mestre.js` | 278 | 27 KB |
| `herois-de-bueiro/js/permissoes.js` | 47 | 2 KB |
| `herois-de-bueiro/js/regras.js` | 238 | 11 KB |
| `herois-de-bueiro/js/sh-ficha.js` | 386 | 45 KB |
| `herois-de-bueiro/js/sh-regras.js` | 172 | 15 KB |
| `herois-de-bueiro/js/sistema-hb.js` | 58 | 3 KB |
| `herois-de-bueiro/js/sistemas.js` | 28 | 1 KB |
| `herois-de-bueiro/js/store.js` | 107 | 5 KB |
| `herois-de-bueiro/js/ui.js` | 165 | 10 KB |
| `herois-de-bueiro/vendor/firebase/firebase-app-compat.js` | 9 | 31 KB |
| `herois-de-bueiro/vendor/firebase/firebase-auth-compat.js` | 3 | 136 KB |
| `herois-de-bueiro/vendor/firebase/firebase-firestore-compat.js` | 3 | 333 KB |
| `index.html` | 42 | 3 KB |
| `legacy/igreja-3d-site.html` | 620 | 899 KB |
| `legacy/servidor-sync.js` | 26 | 1 KB |
| `scripts/mapa_do_codigo.py` | 78 | 5 KB |
| `server/servidor-sync.mjs` | 114 | 6 KB |
| `src/core/anim.ts` | 124 | 7 KB |
| `src/core/binario.ts` | 21 | 1 KB |
| `src/core/config.ts` | 29 | 1 KB |
| `src/core/engine.ts` | 50 | 2 KB |
| `src/core/glbmap.ts` | 49 | 6 KB |
| `src/core/grass.ts` | 69 | 3 KB |
| `src/core/heightfog.ts` | 43 | 1 KB |
| `src/core/importer.ts` | 44 | 2 KB |
| `src/core/kit.ts` | 134 | 10 KB |
| `src/core/loading.ts` | 31 | 1 KB |
| `src/core/maps.ts` | 67 | 3 KB |
| `src/core/models.ts` | 155 | 8 KB |
| `src/core/net.ts` | 74 | 3 KB |
| `src/core/pbr.ts` | 81 | 3 KB |
| `src/core/post.ts` | 116 | 6 KB |
| `src/core/probe.ts` | 53 | 2 KB |
| `src/core/procedural.ts` | 138 | 8 KB |
| `src/core/sky.ts` | 130 | 8 KB |
| `src/core/state.ts` | 24 | 1 KB |
| `src/core/terrain.ts` | 99 | 5 KB |
| `src/core/tokens.ts` | 185 | 11 KB |
| `src/core/types.ts` | 49 | 2 KB |
| `src/core/vtt.ts` | 100 | 6 KB |
| `src/core/walk.ts` | 110 | 6 KB |
| `src/core/weathering.ts` | 45 | 2 KB |
| `src/main.ts` | 194 | 10 KB |
| `src/maps/campo.ts` | 53 | 4 KB |
| `src/maps/igreja/building.ts` | 232 | 16 KB |
| `src/maps/igreja/common.ts` | 105 | 7 KB |
| `src/maps/igreja/grounds.ts` | 369 | 30 KB |
| `src/maps/igreja/index.ts` | 134 | 7 KB |
| `src/maps/igreja/interior.ts` | 246 | 18 KB |
| `src/maps/manifest.ts` | 9 | 0 KB |
| `src/style.css` | 40 | 4 KB |
| `src/vite-env.d.ts` | 2 | 0 KB |
| `tools/arvores.sh` | 27 | 1 KB |
| `tools/assets-leves.mjs` | 21 | 1 KB |
| `tools/baixar-assets.mjs` | 93 | 5 KB |
| `tools/blender/desbastar_arvore.py` | 151 | 7 KB |
| `tools/capturas.mjs` | 111 | 6 KB |
| `tools/contar-tris.mjs` | 15 | 1 KB |
| `tools/orcamento.sh` | 42 | 2 KB |
| `tools/testar-funcoes.mjs` | 54 | 4 KB |
| `tools/testar-vtt.mjs` | 41 | 4 KB |
| `tools/ver-modelo.mjs` | 25 | 2 KB |
| `tools/visualizador.html` | 32 | 2 KB |
| `videos/audio/narrar.py` | 142 | 6 KB |
| `videos/audio/trilha.py` | 442 | 18 KB |
| `videos/audio/voz_externa.py` | 67 | 3 KB |
| `videos/baixar-modelos.sh` | 16 | 1 KB |
| `videos/engine/char.js` | 540 | 32 KB |
| `videos/engine/core.js` | 366 | 14 KB |
| `videos/engine/index.html` | 24 | 2 KB |
| `videos/engine/main.js` | 261 | 13 KB |
| `videos/engine/sets.js` | 826 | 49 KB |
| `videos/engine/ui.js` | 424 | 25 KB |
| `videos/export.mjs` | 17 | 1 KB |
| `videos/fazer.sh` | 17 | 1 KB |
| `videos/render.mjs` | 114 | 7 KB |
| `videos/stories/mentira.js` | 230 | 17 KB |
| `videos/stories/pensamento.js` | 202 | 15 KB |
| `videos/stories/reflexo.js` | 87 | 9 KB |
| `videos/stories/sono.js` | 220 | 16 KB |
| `videos/stories/tempo.js` | 94 | 10 KB |
| `vite.config.ts` | 39 | 2 KB |

Outros textos: `.claude/skills/mapa-3d/CATALOGO.md`, `.claude/skills/mapa-3d/SKILL.md`, `.claude/skills/videos-historia/SKILL.md`, `CHANGELOG.md`, `CLAUDE.md`, `CREDITS.md`, `README.md`, `capturas/README.md`, `docs/BRIEFING.md`, `docs/HOSPEDAGEM.md`, `docs/NOVO-MAPA.md`, `docs/PROMPT-NOVO-MAPA.md`, `herois-de-bueiro/FIREBASE.md`, `herois-de-bueiro/README.md`, `herois-de-bueiro/netlify.toml`, `package.json`, `server/package-lock.json`, `server/package.json`, `tools/assets.json`, `tsconfig.json`, `videos/README.md`, `videos/package-lock.json`, `videos/package.json`, `videos/requirements.txt`

## Funções, classes e exports (linha)

### `herois-de-bueiro/gerar-index-unico.py`
`mini` 9 · `troca` 19

### `herois-de-bueiro/js/app.js`
`raiz` 4 · `rota` 9 · `render` 10 · `secao` 37 · `naoAchou` 38 · `travarLeitura` 42 · `paginaLogin` 49 · `paginaInicio` 73 · `conta` 75 · `paginaRegras` 90 · `t` 91 · `docDe` 114 · `setCaminho` 119 · `campanhaAtual` 124 · `combateAtual` 125 · `nomeQuem` 126 · `fonteAtual` 129 · `mudarRecurso` 137 · `campanhaDaFicha` 159 · `rolarAttrDe` 164 · `iniDe` 173 · `escolherHerois` 175 · `novoCombate` 181 · `base()` 206 · `aplicar` 255 · `convidar()` 298 · `turno()` 355 · `abrirEscolhaViloes` 484 · `ligar` 510 · `gravarCampo` 557 · `aoMudarRemoto` 572 · `backup` 579 · `entrarNa` 606 · `erroLogin` 611 · `desenharTopo` 622 · `desenharConta` 631 · `carregarNomes` 642 · `depoisDoLogin` 650 · `iniciar` 652

### `herois-de-bueiro/js/auth.js`
`carregar` 11 · `iniciar` 13 · `entrarGoogle` 43 · `entrarEmail` 48 · `entrarLocal` 54 · `contasLocais` 62 · `sair` 63 · `perfis` 70 · `nome` 85 · `publicarPerfil` 93 · `firestore()` 105

### `herois-de-bueiro/js/dados.js`
`d` 4 · `rolar` 5 · `soma` 6 · `teste` 9 · `ataque` 20 · `livre` 35

### `herois-de-bueiro/js/ficha.js`
`novoHeroi` 5 · `pvAtual` 14 · `manaAtual` 15 · `nomeClasse` 16 · `listaHerois` 19 · `grade` 24 · `vazioHerois` 34 · `cartaoHeroi` 41 · `hexagono` 52 · `blocoEscolhas` 65 · `ficha` 79 · `blocoElementos` 167 · `ajusteBarra` 181 · `linhaAttr` 194 · `sinal` 196 · `abaHeroi` 206 · `listaEditavel` 223 · `abaCombate` 231 · `cartaoAtaque` 238 · `abaReputacao` 253 · `viloes` 279 · `pegarVilao` 280 · `derivVilao` 281 · `novoVilao` 286 · `listaViloes` 290 · `cartaoVilao` 299 · `paginaViloes` 308 · `fichaVilao` 316

### `herois-de-bueiro/js/mestre.js`
`paginaCampanhas` 6 · `capa` 24 · `paginaCampanha` 29 · `cartaoHeroiCampanha` 57 · `abaJogadores` 65 · `estadoVida` 80 · `combateJogador` 84 · `mesa` 97 · `heroisDa` 117 · `nomeR` 120 · `abaHerois` 121 · `cartaoEscudo` 126 · `participante` 143 · `ordenar` 154 · `valorIni` 160 · `abaCombates` 162 · `painelParticipante` 193 · `abaGanchos` 220 · `cartaoGancho` 229 · `f` 230 · `cont` 249 · `abaDados` 269

### `herois-de-bueiro/js/permissoes.js`
`eu` 5 · `ehMestre` 6 · `temEscudo` 7 · `ehMembro` 8 · `campanhasDoHeroi` 9 · `minhasCampanhas` 10 · `podeEditarHeroi` 12 · `podeEditarVilao` 17 · `heroiVisivel` 19 · `mestresDe` 25 · `sincronizarHerois` 26 · `assumirCampanhaSemMestre` 36 · `novoCodigo` 39

### `herois-de-bueiro/js/regras.js`
`bonusMaestria` 26 · `perdePara` 73 · `estado()` 140 · `modsDe` 150 · `add` 152 · `ap` 153 · `nivelBruto` 170 · `limitar` 175 · `nivel` 176 · `maestrias` 178 · `pontosGastos` 189 · `derivados` 191 · `situacoes` 209 · `ordemClasse` 228

### `herois-de-bueiro/js/sh-ficha.js`
`novoPersonagem` 5 · `nomeClasse` 16 · `ehVilao` 17 · `pvAtual` 18 · `manaAtual` 19 · `ataqueZanpakuto` 22 · `ataquesDe` 31 · `penalidade` 39 · `teste` 42 · `ataque` 59 · `combatente` 65 · `bonusDe` 68 · `hexagono` 90 · `passo` 101 · `selGrau` 102 · `ficha` 104 · `seletorMulti` 196 · `lista` 200 · `abaFicha` 206 · `atr` 261 · `novoVilao` 276 · `aplicarGuia` 280 · `viloes` 290 · `listaViloes` 291 · `paginaViloes` 301 · `fichaVilao` 305 · `num` 307 · `regras` 343 · `t` 344 · `aoMudarCampo()` 377

### `herois-de-bueiro/js/sh-regras.js`
`nomeAttr` 8 · `graduacao` 23 · `nomeDivisao` 51 · `bonusTreino` 65 · `pvPorNivel` 68 · `limiteAttr` 69 · `marcosAte` 70 · `aumentosAte` 71 · `mestrias` 72 · `val` 74 · `bonusPericia` 75 · `bonusTR` 81 · `derivados` 87 · `d` 111 · `rolarExpr` 112 · `testeD20` 124 · `jogadaAtaque` 130 · `limiteInimigo` 163

### `herois-de-bueiro/js/sistema-hb.js`
`ehVilao` 4 · `der` 5 · `teste` 7 · `ataque` 13 · `combatente` 17

### `herois-de-bueiro/js/sistemas.js`
`idDe` 10 · `escolher()` 19

### `herois-de-bueiro/js/store.js`
`novoId` 10 · `clone` 11 · `lerLocal` 13 · `gravarLocal` 19 · `iniciar` 26 · `escrever` 60 · `agendar` 79 · `importar()` 98

### `herois-de-bueiro/js/ui.js`
`esc` 4 · `aviso` 7 · `janela` 16 · `fechar` 34 · `confirmar` 35 · `barra` 43 · `barraMini` 53 · `foto` 58 · `carregarImagem` 66 · `recortarFoto` 73 · `limitar` 86 · `desenhar` 90 · `exportar` 95 · `dadosHtml` 117 · `cartaoResultado` 120 · `resultado` 134 · `painelResultados` 151 · `opcoesAttr` 159

### `legacy/igreja-3d-site.html`
`fit` 82 · `mat` 87 · `box` 88 · `cyl` 89 · `jit` 90 · `tex` 91 · `cl` 92 · `sm` 106 · `glass` 107 · `arch` 111 · `inst` 112 · `updEnv` 118 · `setTime` 132 · `buildIgreja` 139 · `haloT` 141 · `halo` 142 · `flat` 149 · `step` 177 · `pewM` 203 · `lace` 246 · `veil` 248 · `roofG` 280 · `car` 282 · `bench` 290 · `dead` 300 · `aoT` 312 · `mistT` 321 · `buildCampo` 352 · `K` 381 · `sizeT` 384 · `placeT` 385 · `makeToken` 389 · `dropT` 399 · `selT` 400 · `setTarget` 401 · `loadMap` 404 · `onPos` 419 · `onChar` 420 · `save` 421 · `netDb` 422 · `netWs` 429 · `snd` 430 · `open` 431 · `wk` 440 · `setM` 443 · `freeSpot` 444 · `end` 455 · `cutBg` 463 · `push` 464 · `prep` 467 · `spawn` 470 · `addChar` 471 · `resz` 475 · `focusT` 487 · `placeWalkCam` 494 · `togV` 495 · `startWalk` 496 · `setWalk` 500 · `walkStep` 502 · `jmove` 515 · `jend` 517 · `fillAreas` 521 · `xcalc` 522 · `xinfo` 523 · `xrender` 524 · `dl` 532 · `setC` 540 · `haloG` 545 · `dressSite` 546 · `fl2` 547 · `mt` 563 · `loadScript` 568 · `buildGlb` 569 · `importGlb` 590 · `importHdr` 595 · `noHdr` 600

### `server/servidor-sync.mjs`
`safe` 29 · `fileOf` 30 · `getRoom` 34 · `evict` 43 · `flush` 48

### `src/core/anim.ts`
`anim` 5 · `WindOpts` 7 · `inject` 26 · `addWind` 38 · `windDepth` 50 · `dustMotes` 59 · `shaftGeo` 92 · `lightShaft` 97

### `src/core/binario.ts`
`fetchBinary` 6

### `src/core/config.ts`
`Quality` 6 · `defaultQuality` 8 · `CFG` 15

### `src/core/engine.ts`
`cv` 6 · `R` 8 · `S` 21 · `cam` 24 · `ctl` 27 · `onResize` 36 · `pixelRatioCap` 38 · `setPixelRatioCap` 39 · `fit` 41

### `src/core/glbmap.ts`
`dressSite` 7 · `fl2` 8 · `mt` 24 · `buildGlb` 27

### `src/core/grass.ts`
`clumpGeometry` 8 · `GrassOpts` 36 · `grassField` 46

### `src/core/heightfog.ts`
`heightFog` 5

### `src/core/importer.ts`
`importGlb` 12 · `importHdr` 25 · `initImporter` 38

### `src/core/kit.ts`
`K` 6 · `begin` 7 · `LI` 10 · `seed` 13 · `rnd` 14 · `mat` 17 · `asMat` 19 · `box` 21 · `cyl` 25 · `flat` 29 · `InstSpec` 34 · `inst` 35 · `PL` 48 · `jit` 54 · `tex` 55 · `cl` 59 · `makeTextures` 61 · `TX` 80 · `sm` 82 · `glassTex` 84 · `GM` 98 · `arch` 100 · `haloTex` 108 · `halo` 114 · `mistTex` 120 · `finishShadows` 128

### `src/core/loading.ts`
`bar` 5 · `txt` 6 · `draw` 8 · `loading` 16 · `waitTextures()` 19

### `src/core/maps.ts`
`newRuntime` 13 · `disposeTree` 23 · `mapHooks` 32 · `loadMap` 34 · `u` 49

### `src/core/models.ts`
`fileFor` 10 · `hasModel` 14 · `litGlass` 17 · `fixMaterials` 21 · `model` 49 · `place` 63 · `Xf` 70 · `instance` 76 · `dequantize` 126 · `instanceVariants` 139 · `modelSize` 150

### `src/core/net.ts`
`NET` 6 · `handlers` 13 · `key` 19 · `netDb` 21 · `netWs` 42 · `snd` 46 · `open` 47 · `startNet` 68

### `src/core/pbr.ts`
`fileFor` 7 · `tex` 11 · `PbrOpts` 23 · `pbr` 41 · `rep` 45

### `src/core/post.ts`
`Grade` 15 · `DEFAULT_GRADE` 18 · `post` 33 · `init()` 39 · `setQuality()` 72 · `setGrade()` 90 · `render()` 105

### `src/core/probe.ts`
`EnvProbe` 7 · `swap` 28 · `update()` 40

### `src/core/procedural.ts`
`rnd` 6 · `stainedGlass` 9 · `pane` 16 · `roseGeometry` 73 · `petal` 75 · `leafGeometry` 98 · `looseePetalGeometry` 106 · `oldPainting` 113

### `src/core/sky.ts`
`Preset` 11 · `PRE` 31 · `hdrUrl` 40 · `loadHdr` 44 · `horizonColor` 58 · `hemi` 69 · `sun` 70 · `dome` 77 · `env` 78 · `setShadowRadius` 80 · `applyHdr` 87 · `driftSky` 96 · `timeHooks` 97 · `setTime` 99 · `preloadSkies` 129

### `src/core/state.ts`
`st` 6

### `src/core/terrain.ts`
`hash` 7 · `noise2` 8 · `fbm` 14 · `TerrainLayer` 16 · `TerrainOpts` 17 · `terrainMaterial` 26 · `makeTerrain` 75

### `src/core/tokens.ts`
`TokenDef` 13 · `Token` 14 · `DEF` 20 · `pick` 28 · `K` 30 · `sizeT` 32 · `placeT` 38 · `makeToken` 45 · `dropT` 66 · `selT` 72 · `setTarget` 77 · `focusT` 81 · `save` 87 · `onPos` 92 · `onChar` 98 · `wk` 104 · `helpers` 109 · `setM` 111 · `freeSpot` 116 · `busy` 118 · `initTokenInput` 127 · `end` 152 · `tickTokens` 172 · `snapTokens` 184

### `src/core/types.ts`
`View` 4 · `Layer` 5 · `VttData` 8 · `MapLight` 17 · `MapRuntime` 20 · `MapModule` 44

### `src/core/vtt.ts`
`fillAreas` 8 · `xcalc` 12 · `xinfo` 19 · `xrender` 21 · `clipPolyline` 49 · `push` 51 · `dd2vtt` 70 · `inb` 72 · `P` 73 · `dl` 87 · `initVtt` 89 · `opt` 93

### `src/core/walk.ts`
`WM` 8 · `placeWalkCam` 18 · `togV` 31 · `startWalk` 33 · `setWalk` 45 · `walkStep` 54 · `bl` 63 · `walkPointer` 76 · `initWalk` 86 · `jmove` 97 · `jend` 105

### `src/core/weathering.ts`
`WeatherOpts` 5 · `weather` 7

### `src/main.ts`
`cutBg` 29 · `push` 33 · `prep` 43 · `spawnPoint` 55 · `addChar` 60 · `initUi` 67 · `resz` 80 · `setC` 97 · `frame` 120 · `captureApi` 138 · `view()` 141 · `third()` 147 · `start` 164

### `src/maps/campo.ts`
`build` 12 · `height` 18

### `src/maps/igreja/building.ts`
`Building` 11 · `buildChurch` 20 · `glassMat` 33 · `wall` 42 · `windowAt` 50

### `src/maps/igreja/common.ts`
`FLOOR` 7 · `NX` 8 · `WT` 9 · `WH` 10 · `TOP` 11 · `RISE` 12 · `LOFT` 13 · `LOFT_Z` 14 · `WIN_Z` 15 · `WIN` 16 · `DOOR` 17 · `TOWER` 18 · `M` 21 · `iron` 41 · `brass` 42 · `velvet` 43 · `bx` 47 · `mesh` 48 · `cube` 52 · `pointedArch` 57 · `roundArch` 69 · `circle` 75 · `shift` 78 · `Hole` 80 · `wallGeo` 85 · `frameGeo` 92 · `panelGeo` 99

### `src/maps/igreja/grounds.ts`
`FENCE` 15 · `PATH` 16 · `PARK` 17 · `SHED` 18 · `GAZEBO` 19 · `GRAVE` 20 · `rnd` 23 · `sm` 24 · `Grounds` 32 · `groundH` 35 · `buildGrounds` 43 · `addLight` 50 · `inCorridor` 57 · `free` 62 · `underTree` 84 · `groundMask` 98 · `grassAllow` 111 · `grassTall` 119 · `garland` 165 · `puddle` 175 · `bar` 186 · `rail` 193 · `mk` 305 · `pbr2` 367

### `src/maps/igreja/index.ts`
`P` 16 · `VIEWS` 17 · `build` 27 · `tokens` 87 · `isIn` 133

### `src/maps/igreja/interior.ts`
`PEW` 11 · `CHANCEL` 12 · `Interior` 14 · `Flowers` 17 · `push()` 21 · `bunch()` 25 · `scatterPetals()` 37 · `build()` 40 · `mk` 41 · `pewGeometry` 53 · `add` 55 · `buildInterior` 76

### `src/maps/manifest.ts`
`MAPS` 5

### `tools/assets-leves.mjs`
`size` 19

### `tools/baixar-assets.mjs`
`api` 17 · `fetchJson` 19 · `download` 20 · `sleep` 29 · `want` 30 · `info` 33 · `pick` 45

### `tools/blender/desbastar_arvore.py`
`is_leaf` 22 · `is_foliage` 32 · `thin` 39 · `decimate_all` 109

### `tools/capturas.mjs`
`loadPlaywright` 13 · `img` 85

### `tools/orcamento.sh`
`opt` 9

### `tools/testar-vtt.mjs`
`inside` 26

### `videos/audio/narrar.py`
`norm` 17 · `trim` 22 · `align` 34 · `main` 68

### `videos/audio/trilha.py`
`tt` 17 · `fade` 21 · `bp` 27 · `lp` 31 · `hp` 35 · `stereo` 39 · `reverb` 45 · `place` 63 · `piano` 73 · `marimba` 85 · `epiano` 91 · `pad` 98 · `bass` 109 · `music_tense` 119 · `music_playful` 134 · `music_soft` 151 · `music_sad` 165 · `music_dread` 179 · `sfx_buzz` 202 · `bell` 213 · `sfx_ding` 218 · `sfx_cash` 224 · `sfx_click` 236 · `sfx_pop` 240 · `sfx_whoosh` 245 · `sfx_hit` 255 · `sfx_sting` 263 · `sfx_riser` 268 · `sfx_heart` 274 · `sfx_count` 285 · `sfx_horn` 294 · `sfx_knock` 302 · `sfx_step` 310 · `sfx_steps` 315 · `sfx_hum` 322 · `sfx_tick` 328 · `sfx_door` 336 · `sfx_think` 346 · `sfx_lock` 354 · `sfx_switch` 362 · `rms_db` 372 · `main` 376

### `videos/audio/voz_externa.py`
`main` 13

### `videos/baixar-modelos.sh`
`hf` 9

### `videos/engine/char.js`
`SKIN` 6 · `HAIR` 7 · `FACES` 9 · `POSES` 35 · `ensure` 57 · `ell` 64 · `headPath` 68 · `hairBack` 82 · `hairRear` 109 · `hairFront` 121 · `done` 123 · `capHat` 191 · `drawFace` 199 · `arm` 289 · `phoneInHand` 311 · `drawChar` 326 · `torso` 401

### `videos/engine/core.js`
`W` 4 · `TAU` 5 · `NEAR` 6 · `INK` 7 · `clamp` 9 · `lerp` 10 · `smooth` 11 · `ramp` 12 · `ease` 13 · `hash` 20 · `noise` 21 · `rgb` 28 · `css` 40 · `mix` 45 · `shade` 46 · `mul` 47 · `V` 50 · `makeCam` 63 · `toCam()` 71 · `proj()` 78 · `clipNear` 88 · `G` 103 · `path()` 123 · `poly()` 143 · `line()` 158 · `box()` 178 · `R` 181 · `N` 187 · `add()` 214 · `at()` 220 · `lit()` 233 · `drawLightmap` 254 · `I` 281 · `drawLightSlice` 324 · `rr` 356

### `videos/engine/main.js`
`FPS` 8 · `mk` 9 · `makeGrain` 21 · `norm` 28 · `buildTimeline` 30 · `flush` 61 · `camAt` 75 · `drawItems` 91 · `compose` 93 · `post` 135 · `drawCaptions` 179 · `renderFrame` 212 · `wt` 222 · `init` 247

### `videos/engine/sets.js`
`walls` 6 · `wp` 15 · `wq` 16 · `room` 21 · `skyline` 96 · `win` 147 · `hit` 195 · `door` 207 · `picture` 238 · `rug` 254 · `build` 264 · `sofa` 279 · `table` 292 · `chair` 301 · `shadeShape` 311 · `halo` 315 · `floorLamp` 323 · `tableLamp` 333 · `pendant` 342 · `plant` 363 · `tv` 379 · `shelf` 394 · `wardrobe` 413 · `bed` 439 · `nightstand` 458 · `phoneProp` 469 · `desk` 489 · `monitor` 499 · `counter` 510 · `sink` 519 · `mirror` 529 · `tableSet` 554 · `car` 579 · `sneakers` 618 · `footprints` 636 · `streetLamp` 646 · `SETS` 668 · `living()` 670 · `bedroom()` 687 · `office()` 727 · `shop()` 741 · `restaurant()` 753 · `bathroom()` 771 · `street()` 783 · `void()` 815

### `videos/engine/ui.js`
`brl` 5 · `txt` 7 · `phone` 23 · `statusBar` 65 · `card` 73 · `lockScreen` 81 · `chatScreen` 110 · `bankScreen` 138 · `offerScreen` 171 · `recScreen` 196 · `nightVision` 219 · `bigText` 248 · `arrowDown` 269 · `note` 277 · `chip` 292 · `moneyPop` 308 · `zzz` 322 · `appScreen` 336 · `bubble` 369 · `shapes` 382 · `timer` 409

### `videos/render.mjs`
`opt` 19 · `openPage` 34 · `grab` 43

### `videos/stories/mentira.js`
`buzz` 14 · `chip` 15 · `pix` 16 · `phoneUI` 17

### `videos/stories/pensamento.js`
`phoneUI` 14 · `say` 23 · `think` 24 · `waves` 26 · `WLIGHT` 33

### `videos/stories/reflexo.js`
`refl` 13 · `title` 14

### `videos/stories/sono.js`
`buzz` 10 · `pay` 11 · `phoneUI` 12 · `two` 17 · `clk` 18 · `nv` 29

### `videos/stories/tempo.js`
`tag` 13 · `mmss` 14

### `vite.config.ts`
`binariosComoJs` 9 · `load()` 12

