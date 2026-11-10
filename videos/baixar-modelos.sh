#!/usr/bin/env bash
# Baixa os modelos abertos usados na narração para ./modelos (≈ 2 GB).
#   kokoro/  voz neural pt-BR (Kokoro v1.0, Apache-2.0)
#   whisper/ reconhecimento de fala para medir o tempo de cada palavra
# Precisa de acesso a huggingface.co e us.aws.cdn.hf.co.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p modelos/kokoro modelos/whisper
hf() { [ -s "$2" ] || curl -fL --retry 3 -o "$2" "https://huggingface.co/$1"; }
hf fastrtc/kokoro-onnx/resolve/main/kokoro-v1.0.onnx modelos/kokoro/kokoro-v1.0.onnx
hf fastrtc/kokoro-onnx/resolve/main/voices-v1.0.bin modelos/kokoro/voices-v1.0.bin
for f in config.json model.bin preprocessor_config.json tokenizer.json vocabulary.json; do
  hf deepdml/faster-whisper-large-v3-turbo-ct2/resolve/main/$f modelos/whisper/$f
done
echo "modelos em $(pwd)/modelos"
