#!/usr/bin/env python3
"""Gera os vídeos virais "E se...".

Uso:
    python3 gerar.py                      # gera todos
    python3 gerar.py naruto_presidente    # gera só um
    python3 gerar.py --previa ilha_canibais   # folha de contato rápida (sem áudio)
    python3 gerar.py --com-voz            # inclui a narração sintética (por padrão sai só trilha + efeitos)

Narração gravada: coloque o áudio em narracoes/<nome_do_roteiro>.mp3 (ou .wav). Ele é usado automaticamente:
as cenas, as legendas e as bocas passam a seguir a voz gravada, e as palavras [[censuradas]] ganham bip.
    python3 gerar.py naruto_presidente --sem-narracao   # ignora o áudio gravado
"""
import importlib
import os
import sys
import time

from gerador.render import gerar, previa

ROTEIROS = ["naruto_presidente", "ilha_canibais", "ia_dominou"]
SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "videos")
NARRACOES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "narracoes")


def main():
    args = sys.argv[1:]
    modo_previa = "--previa" in args
    nomes = [a for a in args if not a.startswith("--")] or ROTEIROS
    os.makedirs(SAIDA, exist_ok=True)
    for nome in nomes:
        r = importlib.import_module(f"roteiros.{nome}")
        if modo_previa:
            path = os.path.join(SAIDA, f"{r.ARQUIVO}_previa.png")
            previa(r.CENAS, path)
            print("Prévia:", path)
            continue
        t0 = time.time()
        print(f"\n=== {r.TITULO} ===")
        gravada = None
        if "--sem-narracao" not in args:
            for ext in ("mp3", "wav", "m4a", "ogg"):
                p = os.path.join(NARRACOES, f"{r.ARQUIVO}.{ext}")
                if os.path.exists(p):
                    gravada = p
                    print("Usando narração gravada:", p)
                    break
        out = gerar(r.CENAS, os.path.join(SAIDA, f"{r.ARQUIVO}.mp4"), humor=r.HUMOR, bpm=r.BPM,
                    workers=os.cpu_count() or 4, narracao="--com-voz" in args, narracao_arquivo=gravada)
        with open(os.path.join(SAIDA, f"{r.ARQUIVO}_legenda_post.txt"), "w", encoding="utf-8") as f:
            f.write(r.LEGENDA_POST + "\n")
        print(f"({time.time() - t0:.0f}s) -> {out}")


if __name__ == "__main__":
    main()
