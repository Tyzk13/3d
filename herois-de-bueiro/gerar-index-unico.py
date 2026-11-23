"""Monta o site para o Netlify: um index.html com CSS, JS e Firebase dentro, mais a pasta livros/ (PDFs).
Uso: python3 -I gerar-index-unico.py [saida.html]   (padrão: dist-netlify/index.html)
Suba a PASTA inteira no Netlify (index.html + livros/), senão os links "Ler o livro" quebram."""
import base64, hashlib, os, re, shutil, subprocess, sys
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
             for f in ['firebase-app-compat.js', 'firebase-app-check-compat.js', 'firebase-auth-compat.js', 'firebase-firestore-compat.js'])
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
# Cabeçalhos de segurança do Netlify (_headers): só rodam os scripts deste arquivo (por hash),
# o site não pode ser aberto dentro de outro (clickjacking) e o navegador não "adivinha" tipos de arquivo.
final = open(saida, encoding='utf-8').read()
hashes = ["'sha256-" + base64.b64encode(hashlib.sha256(m.encode('utf-8')).digest()).decode() + "'"
          for m in re.findall(r'<script>(.*?)</script>', final, flags=re.S)]
projeto = 'heroisdebueiro-dbd51'
csp = '; '.join([
    "default-src 'self'",
    "script-src 'self' " + ' '.join(hashes) + " https://apis.google.com https://www.gstatic.com https://www.google.com https://www.recaptcha.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.googleusercontent.com https://www.gstatic.com",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://" + projeto + ".firebaseapp.com https://www.google.com",
    "frame-src https://" + projeto + ".firebaseapp.com https://accounts.google.com https://www.google.com https://www.recaptcha.net",
    "worker-src 'self' blob:",
    "object-src 'none'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'", "upgrade-insecure-requests",
])
cab = '\n'.join([
    '/*',
    '  Content-Security-Policy: ' + csp,
    '  X-Frame-Options: DENY',
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    '  Strict-Transport-Security: max-age=31536000; includeSubDomains',
    '  Cross-Origin-Opener-Policy: same-origin-allow-popups',
    '/livros/*',
    '  Cache-Control: public, max-age=604800',
    '',
])
open(os.path.join(os.path.dirname(saida), '_headers'), 'w', encoding='utf-8').write(cab)
destino_livros = os.path.join(os.path.dirname(saida), 'livros')
shutil.rmtree(destino_livros, ignore_errors=True)
shutil.copytree(os.path.join(AQUI, 'livros'), destino_livros)
print('gerado:', saida, os.path.getsize(saida) // 1024, 'KB + livros/ + _headers (' + str(len(hashes)) + ' scripts),', '(minificado)' if ESBUILD else '(sem minificar: instale o esbuild)')
