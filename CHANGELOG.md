# Changelog

## Etapa A — projeto e ciclo de verificação visual

- Projeto Vite + TypeScript com three r187 (antes: HTML único com three r128 do jsDelivr).
- Código separado em módulos (`src/core/*`, `src/maps/*`, `src/assets/*`) e manifesto de mapas.
- Mantidos: parâmetros de URL, `postMessage` do iframe, rede (Claude db / WebSocket / local),
  personagens, caminhar, exportação VTT e importação de .glb/.hdr.
- Novo: `npm run build:single` gera um HTML único; tela de carregamento com barra de progresso;
  botão e parâmetro `?q=` de qualidade (efeito real na etapa B/C).
- Novo: `npm run capturas` (Playwright) com 5 câmeras × 2 climas e folha comparativa com as referências.
- Corrigido: vistas Altar e Coro ficavam acima das paredes (as vigas tapavam a imagem); telhado agora
  aparece por padrão (a camada continua podendo ser desligada; a exportação VTT sempre o esconde).
- Luzes convertidas para as unidades físicas do three atual (fator π) — calibração visual vem na etapa B.

## B1 — pós-processamento

- Pipeline `postprocessing` (pmndrs): render em meia-precisão (HDR) → AO N8AO → profundidade de campo
  (só Alta) → bloom, aberração cromática leve, tone mapping AgX, contraste/saturação, vinheta, grão → SMAA.
- Predefinições Baixa/Média/Alta: resolução, tamanho do mapa de sombra, AO, SMAA, DOF e grão.
- Exportação VTT continua sem pós-processamento (tone mapping ligado só durante a exportação).

## B2–B4 (primeiro passe) — céu HDRI, materiais PBR, igreja reconstruída, assets reais

- Céu e luz ambiente com HDRI da Poly Haven por clima (carregado sob demanda); a cor da névoa vem do
  horizonte do HDRI; névoa por altura (mais densa no chão). Climas recalibrados em unidades físicas.
- Materiais PBR (cor, normal, AO/rugosidade) da Poly Haven em WebP, com UVs em metros.
- Terreno com mistura de 3 materiais (grama, terra, folhas) por máscara e colisor simplificado
  (raycast barato para caminhar/arrastar).
- Igreja reconstruída: paredes de concreto com vãos reais, janelas ogivais com vitrais (chumbo e vidro
  envelhecido), rosáceas, portal em arco com portas de madeira abertas, contrafortes, cornijas,
  telhado de ardósia com forro de tábuas e tesouras aparentes, torre com campanário, sino, relógio,
  pináculo e cruz.
- Interior: bancos com cabeceiras em voluta (instanciados), presbitério de pedra, altar com toalha,
  cruz e dossel, ambão, balaustrada torneada, coro com escada e órgão, lustres de velas (modelo CC0),
  candelabros, cadeiras góticas, armário.
- Casamento: passadeira branca, rosas brancas modeladas (instanciadas), pétalas, arco de flores,
  lanternas no caminho, vasos na escada.
- Exterior: caminho de pedra, cerca de ferro e portão, postes, poças refletivas, estacionamento com
  carros cobertos por lona, galpão, caramanchão, cemitério antigo, estátua, floresta de abetos,
  árvores, arbustos, samambaias, mato.
- Ferramentas: `npm run assets` (baixa/otimiza da Poly Haven e atualiza CREDITS.md),
  `tools/arvores.sh` e `tools/orcamento.sh` (Blender + gltf-transform: desbaste de folhas e
  simplificação para orçamento de triângulos), `tools/ver-modelo.mjs` (captura de um .glb),
  `tools/contar-tris.mjs`.
- Removido: céu em canvas, texturas em canvas no mapa principal, véus.

## E — servidor de sincronização

- `server/servidor-sync.mjs`: salas, persistência em JSON (gravação atômica), só-leitura imposto no
  servidor (`?ro=1` ou chave `EDIT_KEY`), filtro de origem, limite de taxa, ping para proxies, `/saude`.
