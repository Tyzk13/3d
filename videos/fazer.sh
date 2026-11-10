#!/usr/bin/env bash
# Pipeline completo de uma história: roteiro -> narração -> trilha/mixagem -> vídeo.
#   ./fazer.sh <historia> [--so-audio | --so-video]
# PY = Python com kokoro-onnx, faster-whisper, soundfile, scipy; MODELOS = pasta com kokoro/ e whisper/
set -euo pipefail
cd "$(dirname "$0")"
nome="$1"; modo="${2:-}"
PY="${PY:-python3}"
if [ "$modo" != "--so-video" ]; then
  node export.mjs "$nome"
  "$PY" audio/narrar.py "$nome" 2>&1 | grep -v -i warning | tail -4
  "$PY" audio/trilha.py "$nome"
fi
if [ "$modo" != "--so-audio" ]; then
  node render.mjs "$nome" --workers "${WORKERS:-4}"
fi
