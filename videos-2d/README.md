# Vídeos virais "E se…"

Gerador de vídeos curtos (9:16, 1080x1920, 30 fps) no estilo das animações narradas "E se você…":
personagens 2D de cabeça redonda, narração em português, legenda palavra por palavra com palavras-chave em
amarelo, cortes rápidos com zoom, trilha sonora e efeitos.

Tudo é gerado por código: desenhos, voz, música e efeitos. Não usa banco de imagens nem API paga.

> Pasta `videos-2d/` do repositório 3d. Os mp4 prontos ficam no repositório `Tyzk13/V-deos-virais`;
> aqui ficam o código, os roteiros e as narrações (`narracoes/`) para gerar de novo em `videos-2d/videos/`.

## Vídeos já feitos

| Arquivo | Ideia | Duração |
|---|---|---|
| `naruto_presidente.mp4` | E se o Naruto fosse presidente do Brasil? **(com narração)** | ~2 min |
| `ilha_canibais.mp4` | E se você fosse parar numa ilha de c*nib*is? (palavra sempre censurada: tarja preta na tela e marcação [BIP] no roteiro) | ~2 min |
| `ia_dominou.mp4` | E se a IA dominasse o mundo? (final "biscoito ou bolacha") | ~2 min |

Os vídeos saem **sem narração** (só trilha + efeitos), prontos para receber as vozes gravadas.
O ritmo das cenas, as legendas e o movimento da boca seguem uma voz-guia interna, e o `*_roteiro.txt` traz
o texto do roteiro, uma fala por linha.
Nas falas com `[BIP: ...]`, coloque o bip por cima da palavra.

Cada vídeo vem com:
- `*_roteiro.txt`: transcrição do roteiro (só o texto)
- `*_capa.jpg`: imagem de capa
- `*.srt`: legenda separada (útil para editar no CapCut)
- `*_legenda_post.txt`: sugestão de texto e hashtags para a postagem

## Por que esse formato (o que está em alta)

- **Gancho nos primeiros 2 segundos:** a pergunta "E se…" já abre com flash, zoom e efeito "boom".
- **Mais de 1 minuto:** o TikTok tem priorizado e monetizado vídeos com mais de 1 min (Programa de Recompensas).
- **Legenda palavra por palavra no meio da tela:** prende quem assiste sem som.
- **Reviravolta no final + pergunta para comentar:** aumenta comentários e replays.
  Exemplos: "Tempero." / "É bolacha." / "Você votaria no Naruto?"

## Como gerar de novo / criar novos

```bash
pip install piper-tts numpy pillow librosa
# voz pt-BR (offline):
mkdir -p vozes && cd vozes
curl -LO https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-pt-br-edresson-low.tar.gz
tar xzf voice-pt-br-edresson-low.tar.gz && cd ..

python3 gerar.py                         # gera os 3 vídeos
python3 gerar.py ia_dominou              # só um
python3 gerar.py --previa ilha_canibais  # folha de contato rápida para revisar o enquadramento
python3 gerar.py --com-voz               # inclui a narração sintética no áudio
```

Precisa de `ffmpeg` instalado.

Para um vídeo novo, copie um arquivo de `roteiros/` e edite a lista `CENAS`. Cada `Cena` define:
- `fala`: texto da narração/legenda. Use `[[palavra]]` para censurar (vira BIP + tarja preta).
- `voz=`: opcional, texto falado quando for diferente do escrito (ex.: "99%" → "noventa e nove por cento").
- `fundo`: cenário (veja `gerador/cenarios.py`).
- elenco: `A(personagem, x, y, escala, expressão, pose, fala=True)` e objetos `Pr("celular", …)`.
- `cam=close(...)` / `plano(...)`: movimento de câmera; `fx=["soco", "flash", "tremor", "glitch", ...]`.
- `sfx=["boom", ("whoosh", 1.2)]`: efeitos sonoros (com atraso opcional em segundos).
- `destaque=[...]`: palavras que aparecem em amarelo na legenda.

### Colocando as vozes (narração gravada / ElevenLabs)
Salve o áudio em `narracoes/<nome_do_roteiro>.mp3` (ex.: `narracoes/ilha_canibais.mp3`) e rode `python3 gerar.py <nome>`.
O gerador encontra sozinho onde cada frase é falada e ajusta. Para isso, compara o som da gravação com a voz-guia
(alinhamento acústico com `librosa`) e corta nas pausas entre as frases. Depois ajusta:
- o tempo de cada cena para começar junto com a fala dela;
- as legendas, frase por frase;
- a boca dos personagens, que mexe com o volume da voz;
- o bip: palavras marcadas com `[[ ]]` no roteiro aparecem com tarja na tela. Se a gravação já tiver o bip (tom de
  1000 Hz), a tarja acompanha esse bip. Se a palavra foi falada, ela é trocada por bip automaticamente.

Dica: grave o roteiro exatamente como está no `*_roteiro.txt`, com uma pequena pausa entre as frases.

## Estrutura

```
gerar.py               # CLI
gerador/
  canvas.py            # desenho com antialiasing
  personagens.py       # personagens, expressões e poses
  cenarios.py          # fundos
  props.py             # objetos (celular, TV, caldeirão, portal…)
  audio.py             # voz (Piper), bip de censura, trilha e efeitos
  alinhamento.py       # sincroniza a narração gravada com as cenas
  render.py            # câmera, animação, legendas, renderização paralela e mixagem
roteiros/              # um arquivo por vídeo
narracoes/             # narrações gravadas (usadas automaticamente)
videos/                # saída
```
