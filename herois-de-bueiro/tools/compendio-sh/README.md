# Compêndio do Shinigamis & Hollows

`js/sh-compendio.js` é gerado do PDF do Livro dos Ceifadores (não edite à mão).

1. Texto por página: `for i in $(seq 1 156); do pdftotext -f $i -l $i LIVRO.pdf txt/p$i.txt; done`
2. Páginas 63–84 com colunas: `for i in $(seq 63 84); do pdftotext -layout -f $i -l $i LIVRO.pdf lay/p$i.txt; done`
3. `python3 -I extrair.py txt compendio.json lay` e depois o trecho que monta `sh-compendio.js`
   (lista de armas e seções) que está no histórico do commit que criou este arquivo.
