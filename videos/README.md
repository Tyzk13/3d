# Vídeos de história narrada

Gerador de vídeos verticais (1080×1920, 30 qps) no formato "E se…?": história curta narrada em
segunda pessoa, personagens de desenho próprio em cenários com profundidade, legenda palavra por palavra,
telas de celular, trilha e efeitos. Tudo é desenhado por código — não há imagem, música ou efeito
sonoro de terceiros.

## Como gerar um vídeo

```bash
npm install                    # fontes das legendas e das telas
pip install -r requirements.txt
./baixar-modelos.sh            # voz e reconhecimento de fala (uma vez, ≈ 2 GB)
./fazer.sh mentira             # roteiro -> narração -> trilha -> out/mentira/mentira.mp4
```

Precisa de Node com Playwright/Chromium, `ffmpeg` e Python 3.10+. Se o Python com os pacotes
estiver num ambiente virtual, passe `PY=/caminho/do/python ./fazer.sh …`; se os modelos estiverem
em outra pasta, `MODELOS=/caminho`.

### Sem acesso ao huggingface (voz-guia Piper)

Se o Kokoro e o Whisper não puderem ser baixados, o gerador usa `audio/sem_hf.py`:

```bash
pip install piper-tts librosa soundfile scipy numpy
./baixar-modelos.sh --piper            # só a voz-guia pt-BR (GitHub, ≈ 60 MB)
./fazer.sh mentira                     # sem Kokoro: narra com a voz-guia Piper (para prévia e ritmo)
VOZ=narracao.mp3 ./fazer.sh mentira    # narração gravada (ElevenLabs etc.)
```

Com a narração gravada e sem Whisper, `audio/voz_externa.py` casa o áudio com o roteiro frase por frase:
compara o som da gravação com a voz-guia (alinhamento acústico com `librosa`) e corta nas pausas entre as
frases. Grave o texto exatamente como está no roteiro, com uma pequena pausa entre as frases.

Para revisar sem renderizar tudo:

```bash
node render.mjs mentira --sheet            # um quadro por plano (out/mentira/sheet/)
node render.mjs mentira --stills 12.5,40   # quadros nos instantes pedidos (s)
node render.mjs mentira --from 30 --to 40  # só um trecho
./fazer.sh mentira --so-audio              # refaz narração e mixagem
```

## Etapas

| Etapa | Arquivo | O que faz |
|---|---|---|
| Roteiro | `stories/<nome>.js` | Falas, planos, personagens, efeitos e trilha de cada batida |
| Exportação | `export.mjs` | Passa falas e marcações de som para `out/<nome>/script.json` |
| Narração | `audio/narrar.py` | Voz neural pt-BR (Kokoro) fala cada batida; o Whisper mede o tempo de cada palavra → `narr.wav`, `timing.json` |
| Narração (sem huggingface) | `audio/sem_hf.py`, `audio/alinhamento.py` | Voz-guia Piper ou narração gravada alinhada por frases → `narr.wav`, `timing.json` |
| Trilha | `audio/trilha.py` | Sintetiza música por clima (`tense`, `playful`, `soft`, `sad`, `dread`) e efeitos, abaixa a trilha sob a voz e normaliza em −15 LUFS → `audio.wav` |
| Imagem | `render.mjs` + `engine/` | Desenha cada quadro num canvas (Chromium), em paralelo, e codifica com `ffmpeg` |

## Como é um roteiro

Cada história exporta `{ voice, speed, cast, music, beats }`. Uma batida tem a fala (`say`) e um
ou mais planos; o corte de cada plano cai na palavra indicada em `at` (`'ela#2'` = segunda vez que
"ela" aparece na fala), então imagem e voz ficam sincronizadas sozinhas.

```js
{
  say: 'O celular vibra. Cem mil.',
  sfx: [{ n: 'buzz', at: 0.05 }, { n: 'cash', at: 'cem' }],
  set: 'office',                                   // cenário (engine/sets.js)
  cam: { p: [0.9, 1.6, 0.5], t: [0, 1.1, 3.6], f: 50, to: { p: [0.8, 1.6, 0.9] } },
  chars: [{ who: 'boss', at: [0, 4.1], sit: true, face: 'happy', pose: 'table' }],
  fx: { dof: 6, grade: 'day' },                    // desfoque do fundo, gradação
  ui: (ctx, e) => e.ui.chip(ctx, 'SEGUNDA-FEIRA', e.t),  // inserções 2D (engine/ui.js)
}
```

- **Cenários** (`engine/sets.js`): `living`, `bedroom`, `office`, `shop`, `restaurant`, `bathroom`,
  `street`, `void`. Unidades em metros; x para a direita, y para cima, z para o fundo.
- **Personagens** (`engine/char.js`): cabeça em quadrado arredondado com orelhas, olhos grandes,
  nariz, roupa (`hoodie`, `tee`, `suit`, `dress`, `stripe`, `apron`, `shirt`) e cabelo (`messy`,
  `short`, `slick`, `bob`, `long`, `pony`, `curly`, `bald`). Expressões em `FACES` (`shock`, `scared`,
  `smug`, `cry`…), poses em `POSES` (`phone`, `chin`, `up`, `table`…), `back: true` de costas, `sit`, `walk`.
- **Telas e inserções** (`engine/ui.js`): celular com bloqueio/notificação, conversa, banco, app,
  lista de gravações; visão noturna; balões de fala e de pensamento; cartão final.

## Licenças

Kokoro v1.0 (voz) é Apache-2.0. As fontes Archivo Black, Inter e Caveat são OFL. Música e efeitos
são gerados por `audio/trilha.py`.
