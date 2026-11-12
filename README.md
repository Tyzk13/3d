# Vídeos virais "E se…?"

Geradores de vídeos verticais (1080×1920) de história narrada para TikTok/Reels. Tudo é desenhado por
código: personagens, cenários, legendas, trilha e efeitos.

| Pasta | Gerador | Como roda |
|---|---|---|
| [`videos/`](videos/README.md) | **3D**: personagens e cenários com profundidade, câmera, iluminação, telas de celular | Node + Chromium (Playwright) + Python |
| [`videos-2d/`](videos-2d/README.md) | **2D**: desenho de cabeça redonda, legenda palavra por palavra (Naruto presidente, Ilha, IA) | Python (Pillow) |

Os vídeos novos são feitos no gerador **3D** (`videos/`). O 2D fica guardado com os roteiros e as narrações
dos três vídeos já publicados; os mp4 prontos estão no repositório `Tyzk13/V-deos-virais`.

Narração: as duas ferramentas aceitam a narração gravada (ex.: ElevenLabs) e sincronizam cenas, legendas e
bocas com ela, frase por frase. Sem acesso ao huggingface, usam a voz-guia offline Piper para prévias.

Os mapas 3D de RPG (igreja e campo aberto) ficam no repositório `Tyzk13/MAPAS`.
