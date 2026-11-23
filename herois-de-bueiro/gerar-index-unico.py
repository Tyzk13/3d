"""Junta o site inteiro (CSS, JS e Firebase) num único index.html para subir no Netlify.
Uso: python3 -I gerar-index-unico.py [saida.html]   (padrão: dist-netlify/index.html)"""
import os, re, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
ler = lambda p: open(os.path.join(AQUI, p), encoding='utf-8').read()
js = lambda p: ler(p).replace('</script', '<\\/script')
html = ler('index.html').replace('<meta charset="utf-8">\n', '')
html = html.replace('<link rel="stylesheet" href="css/app.css">', '<style>\n' + ler('css/app.css') + '\n</style>')
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
print('gerado:', saida, os.path.getsize(saida) // 1024, 'KB')
