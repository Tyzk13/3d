---
name: videos-historia
description: Cria vídeos verticais de história narrada ("E se…?") para TikTok/Reels com o gerador da pasta videos/ — roteiro, narração, animação, legendas, trilha e mp4. Use quando o usuário pedir novos vídeos nesse estilo, trocar a voz, ajustar um vídeo existente ou pedir título/legenda para postar.
---

# Vídeos de história narrada

O gerador fica em `videos/` (leia `videos/README.md` para comandos e formato do roteiro). Tudo é
desenhado por código; não use imagem, música ou efeito de terceiros.

## Preparar o ambiente (uma vez por sessão)

```bash
cd videos && npm install
python3 -m venv ~/venv && ~/venv/bin/pip install -r requirements.txt
./baixar-modelos.sh          # precisa de huggingface.co e us.aws.cdn.hf.co liberados
export PY=~/venv/bin/python
```

Instale os pacotes Python um por vez se o `pip` travar. Se o huggingface estiver bloqueado, não pare:
`pip install piper-tts librosa soundfile scipy` e `./baixar-modelos.sh --piper` (voz-guia do GitHub).
Sem Kokoro, `fazer.sh` narra com a voz-guia Piper (serve para prévia e ritmo; o usuário costuma mandar a
narração do ElevenLabs depois). Sem Whisper, `voz_externa.py` usa `audio/sem_hf.py` (alinhamento por frases).

## Fluxo de um vídeo novo

1. **Roteiro** em `stories/<nome>.js`, copiando a estrutura de `stories/tempo.js` ou `reflexo.js`.
2. `node export.mjs <nome>` e `$PY audio/narrar.py <nome>` para ter os tempos.
3. `node render.mjs <nome> --sheet --cols 8 --tw 250` e **olhe a folha de contato** antes de renderizar tudo.
   Corrija enquadramento, luz e sobreposição com a legenda; repita.
4. `./fazer.sh <nome>` gera `out/<nome>/<nome>.mp4` (≈ 4 min). Confira uma folha tirada do mp4.
5. Envie o mp4 ao usuário; não versione `out/`. Faça commit e push do roteiro e do código.

**Voz gravada pelo usuário** (ex.: ElevenLabs): entregue o roteiro em texto, um bloco por vídeo, só o
texto (sem tempos);
ao receber o áudio (um arquivo com o texto inteiro), rode
`$PY audio/voz_externa.py <nome> <arquivo>`, depois `$PY audio/trilha.py <nome>` e
`node render.mjs <nome>`. Descubra qual áudio é de qual vídeo pela duração ou pela transcrição.

## Receita de roteiro

- Gancho "E se…?" nos 3 primeiros segundos, com uma regra simples e estranha.
- Segunda pessoa ("você"), presente, frases curtas, detalhes concretos (horas, números).
- Escalada por repetição, um sinal de que algo está errado, virada que muda o sentido da regra,
  última frase seca e pergunta para os comentários.
- 150–200 palavras (60–85 s). Passe de 60 s. Números por extenso na fala.
- Varie os temas: suspense, sobrenatural, emoção, humor — não só dinheiro.
- Histórias originais. Não copie enredo, personagens nem visual de vídeos de referência; o
  elenco tem desenho próprio (`engine/char.js`) e cada história deve ter protagonista diferente.

## Padrão visual que deu certo

- Plano novo a cada 2–4 s, cortando na palavra (`at: 'palavra'` ou `'palavra#2'`).
- Alternar close de rosto (câmera a ~1,7 m, `f: 40`, `fx.dof` 6–8), plano aberto e inserção
  (celular, contador, balão). Câmera sempre com leve aproximação (`to`).
- Em retrato, duas pessoas lado a lado só cabem com câmera a ≥ 3,5 m ou a 0,6 m uma da outra.
- Boca e olhos importantes devem ficar acima de 60% da altura: a legenda ocupa ~67%.
  Texto de chamada final acima de 80% da altura fica sob a interface do aplicativo.
- Cenas de dia: `fx.grade: 'day'`; noite já é o padrão. Momentos fortes: `hit`/`sting`,
  `music` com `none` logo antes, `punch` e `vig` maiores.
- Primeiro plano com título grande no topo (`ui.bigText`) e sem tela preta.

## Entrega

Para cada vídeo, dê título e legenda prontos para o Reels/TikTok: uma frase de gancho, a pergunta
do final pedindo comentário e 8–10 hashtags (`#ese #storytime #suspense #historiasnarradas
#animacao #voceaceitaria #reelsbrasil #viral` e as do tema).

Você não ouve áudio: diga isso ao usuário e peça para ele conferir voz, trilha e sincronismo.
Confira o que dá por medida (`ffmpeg ebur128`, transcrição do mp4 final).
