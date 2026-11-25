import re, json, sys, os
D = sys.argv[1]
def pag(i): return open(os.path.join(D, f'p{i}.txt'), encoding='utf-8').read()
CAB = re.compile(r"^[#0-9]*\s*[A-ZÁÉÍÓÚÂÊÔÃÕÇÜ][A-ZÁÉÍÓÚÂÊÔÃÕÇÜ0-9 '’\-–,()/:&.ºª°]{2,}$")
# (categoria, páginas, títulos que abrem subseção)
FAIXAS = [
  ('Zankensoki', range(30, 45)), ('Aptidões', range(55, 62)), ('Zanpakuto', range(65, 84)),
  ('Kidos', range(85, 94)), ('Traços de armas', range(49, 52)), ('Treinamentos', range(140, 146)),
  ('Condições', range(126, 129)), ('Ações de combate', range(119, 122)), ('Usos de perícias', range(103, 112)),
]
SECOES = re.compile(r'^(HABILIDADES D[OE]|APTIDÕES DE|EFEITOS (GERAIS|ABSTRATOS|ELEMENTAIS|FÍSICOS)|TÉCNICAS|CAMINHOS DO|BAKUDO|HADO|KAIDO|CICATRIZAÇÃO|TRAÇOS|LISTA DE (AÇÕES|REAÇÕES|EFEITOS)|TIPOS DE|FOCOS ESPECIAIS|TREINAMENTOS|ESTRUTURA|MONTANDO|FUNCIONAMENTO|OBJETIVO|ATINGINDO|DOMINANDO|CONDIÇÕES|INTERLÚDIOS|LISTA DE PERÍCIAS|DESCRIÇÃO E USOS|SITUACIONAL|COMUM|MANOBRA)')
IGNORA = re.compile(r'^(ZANKENSOKI|ZANPAKUTO|KIDO|APTIDÕES|SUCESSO|FALHA|ACERTO|ERRO|ALCANCE|ÁREA|DURAÇÃO|ALVO|CONJURAÇÃO|REQUISITOS?|BENEFÍCIOS|ETAPA|FOCO)\b')
saida = []
for cat, paginas in FAIXAS:
    sec, atual = ('Hado' if cat == 'Kidos' else ''), None
    for i in paginas:
        linhas = [l.strip() for l in pag(i).split('\n')]
        for l in linhas:
            if not l or re.fullmatch(r'\d{1,3}', l): continue
            if CAB.match(l) and len(l) <= 60 and SECOES.match(l):
                sec = l.title(); atual = None; continue
            eh_cab = CAB.match(l) and not IGNORA.match(l) and len(l) <= 60 and not re.fullmatch(r'[0-9° ]+CICLO', l)
            if False:
                sec = l.title(); atual = None; continue
            if eh_cab:
                atual = {'cat': cat, 'sec': sec, 'nome': l, 'texto': [], 'pag': i}; saida.append(atual); continue
            if atual is not None: atual['texto'].append(l)
for e in saida:
    t = ' '.join(e['texto'])
    t = re.sub(r'(\w)- (\w)', r'\1\2', t)            # hifenização de quebra de linha
    t = re.sub(r'Pré\s*Requisito', 'Pré-Requisito', t)
    t = re.sub(r'\s+', ' ', t).strip()
    e['texto'] = t
    n = e['nome']; e['nome'] = n if n.startswith('#') else n.title().replace(' Da ', ' da ').replace(' De ', ' de ').replace(' Do ', ' do ').replace(' Dos ', ' dos ').replace(' Das ', ' das ').replace(' E ', ' e ').replace(' Em ', ' em ').replace(' A ', ' a ').replace(' O ', ' o ')
saida = [e for e in saida if len(e['texto']) >= 40 and e['nome'] not in ('Baseada',)]
# Zanpakuto: efeitos de Shikai/Bankai vêm em listas "• Nome. descrição" (texto com colunas preservadas) + tabela de custos.
L = sys.argv[3]
zan = [e for e in saida if e['cat'] != 'Zanpakuto' or e['pag'] >= 72 and e['pag'] <= 77 or e['pag'] in (65,)]
saida = zan
for i in range(66, 84):
    if 72 <= i <= 77: continue
    txt = open(f'{L}/p{i}.txt', encoding='utf-8').read()
    sec = ''
    blocos = re.split(r'\n(?=\s*•|\s*EFEITOS [A-ZÁÉÍÓÚ]+ PARA (?:SHIKAI|BANKAI)|\s*TÉCNICAS PARA BANKAI)', txt)
    for b in blocos:
        m = re.match(r'\s*(EFEITOS [A-ZÁÉÍÓÚ]+ PARA (?:SHIKAI|BANKAI)|TÉCNICAS PARA BANKAI)', b)
        if m:
            sec = m.group(1).title()
            tab = b[m.end():]
            tab = tab.split('•')[0]
            linhas = [re.sub(r'\s{2,}', ' | ', l.strip()) for l in tab.split('\n') if l.strip() and not re.fullmatch(r'\d+', l.strip())]
            if len(linhas) > 2: saida.append({'cat': 'Zanpakuto', 'sec': sec, 'nome': 'Custos: ' + sec, 'texto': ' / '.join(linhas[1:])[:1500], 'pag': i})
            continue
        m = re.match(r'\s*•\s+([^.]{2,60})\.\s+(.*)', b, re.S)
        if m and sec:
            t = re.sub(r'\s+', ' ', m.group(2)).strip(); t = re.sub(r'(\w)- (\w)', r'\1\2', t); t = re.split(r'\s\d{2,3}\s*$', t)[0]
            saida.append({'cat': 'Zanpakuto', 'sec': sec, 'nome': m.group(1).strip(), 'texto': t, 'pag': i})
# Itens de shinigami: parágrafos "Nome. texto"
for i in (52, 53):
    linhas = [l.strip() for l in pag(i).split('\n') if l.strip() and not re.fullmatch(r'\d+', l.strip())]
    atual = None
    for l in linhas:
        m = re.match(r'^([A-ZÁÉÍÓÚ][A-Za-zÀ-ú ()]{2,40})\.\s+(.*)', l)
        if m and not m.group(1).startswith(('Os ', 'Além', 'Normal', 'Alguns', 'Você', 'Caso', 'Ao ', 'Um ', 'Uma ')):
            atual = {'cat': 'Itens', 'sec': 'Itens de Shinigami', 'nome': m.group(1).strip(), 'texto': m.group(2), 'pag': i}; saida.append(atual)
        elif atual: atual['texto'] += ' ' + l
for e in saida:
    if e['cat'] == 'Itens': e['texto'] = re.sub(r'\s+', ' ', re.sub(r'(\w)- (\w)', r'\1\2', e['texto'])).strip()
json.dump(saida, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False)
print('total', len(saida))
from collections import Counter
print(Counter(e['cat'] for e in saida))
for c in ['Aptidões', 'Kidos', 'Zanpakuto', 'Itens']:
    xs = [e for e in saida if e['cat'] == c]
    print('\n==', c, len(xs), '| seções:', sorted(set(e['sec'] for e in xs))[:12])
    for e in xs[:3] + xs[-2:]: print('  -', e['nome'], '|', e['texto'][:110])
