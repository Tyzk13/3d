#!/usr/bin/env bash
# Pipeline completo de uma história: roteiro -> narração -> trilha/mixagem -> vídeo.
#   ./fazer.sh <historia> [--so-audio | --so-video]
#   VOZ=narracao.mp3 ./fazer.sh <historia>     usa a narração gravada no lugar da voz sintética
# PY = Python com kokoro-onnx, faster-whisper, soundfile, scipy; MODELOS = pasta com kokoro/ e whisper/
set -euo pipefail
cd "$(dirname "$0")"
nome="$1"; modo="${2:-}"
PY="${PY:-python3}"
if [ "$modo" != "--so-video" ]; then
  node export.mjs "$nome"
  if [ -n "${VOZ:-}" ]; then                                   # narração gravada (ElevenLabs etc.)
    "$PY" audio/voz_externa.py "$nome" "$VOZ" 2>&1 | grep -v -i warning | tail -4
  elif [ -s "${MODELOS:-modelos}/kokoro/kokoro-v1.0.onnx" ]; then
    "$PY" audio/narrar.py "$nome" 2>&1 | grep -v -i warning | tail -4
  else                                                           # sem Kokoro: voz-guia Piper (offline)
    "$PY" audio/sem_hf.py guia "$nome" 2>&1 | tail -2
  fi
  "$PY" audio/trilha.py "$nome"
fi
if [ "$modo" != "--so-audio" ]; then
  node render.mjs "$nome" --workers "${WORKERS:-4}"
fi
