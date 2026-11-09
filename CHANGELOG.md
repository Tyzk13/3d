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
