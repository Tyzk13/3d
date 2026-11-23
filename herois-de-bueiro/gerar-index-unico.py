"""Monta o site para o Netlify: um index.html com CSS, JS e Firebase dentro, mais a pasta livros/ (PDFs).
Uso: python3 -I gerar-index-unico.py [saida.html]   (padrão: dist-netlify/index.html)
Suba a PASTA inteira no Netlify (index.html + livros/), senão os links "Ler o livro" quebram."""
import os, re, shutil, subprocess, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
ler = lambda p: open(os.path.join(AQUI, p), encoding='utf-8').read()
# Minifica com o esbuild se ele existir (variável ESBUILD ou no PATH); senão, segue sem minificar.
ESBUILD = os.environ.get('ESBUILD') or shutil.which('esbuild')
def mini(texto, loader):
    if not ESBUILD: return texto
    r = subprocess.run([ESBUILD, '--minify', '--loader=' + loader, '--charset=utf8'], input=texto.encode(), capture_output=True)
    return r.stdout.decode() if r.returncode == 0 else texto
js = lambda p: (ler(p) if 'vendor/' in p else mini(ler(p), 'js')).replace('</script', '<\\/script')
html = ler('index.html').replace('<meta charset="utf-8">\n', '')
html = html.replace('<link rel="stylesheet" href="css/app.css">', '<style>\n' + mini(ler('css/app.css'), 'css') + '\n</style>')
fb = ''.join('<script>\n' + js('vendor/firebase/' + f) + '\n</script>\n'
             for f in ['firebase-app-compat.js', 'firebase-auth-compat.js', 'firebase-firestore-compat.js'])
primeiro = [True]
def troca(m):
    s = (fb if primeiro[0] else '') + '<script>\n' + js(m.group(1)) + '\n</script>'
    primeiro[0] = False
    return s
html = re.sub(r'<script src="([^"]+)"></script>', troca, html)
saida = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, 'dist-netlify', 'index.html')
os.makedirs(os.path.dirname(saida), exist_ok=True)
open(saida, 'w', encoding='utf-8').write('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n' + html + '</body>\n</html>\n')
destino_livros = os.path.join(os.path.dirname(saida), 'livros')
shutil.rmtree(destino_livros, ignore_errors=True)
shutil.copytree(os.path.join(AQUI, 'livros'), destino_livros)
print('gerado:', saida, os.path.getsize(saida) // 1024, 'KB + livros/', '(minificado)' if ESBUILD else '(sem minificar: instale o esbuild)')
