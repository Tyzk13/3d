"""E se você fosse parar numa ilha de [[canibais]]?

A palavra proibida aparece sempre entre [[ ]]: no áudio vira BIP e na tela vira tarja preta.
"""
from gerador.render import A, Pr, Cena, close, plano
from gerador.personagens import VOCE, VOCE_CHEF, PILOTO, CAPITAO, CHEFE, nativo, figurante

TITULO = "E se você fosse parar numa ilha de c*nib*is"
ARQUIVO = "ilha_canibais"
HUMOR, BPM = "aventura", 100
LEGENDA_POST = ("E se você caísse numa ilha de 🤐🍖? O final é inesperado 😳 "
                "#ese #animação #historia #ilha #sobrevivencia #humor #fy #viral")

V = VOCE

CENAS = [
    Cena("E se você fosse parar numa ilha de [[canibais]]?", "praia",
         [A(nativo(0), 140, 1990, 1.0, "neutro"), A(nativo(1), 940, 1990, 1.0, "neutro", flip=True),
          A(V, 540, 1900, 1.5, "medo", anim="tremer")],
         cam=close(540, 1900, 1.5, 1.1, 1.25, 230), fx=["flash", "soco"], sfx=["boom"], destaque=["ilha"]),

    Cena("Era pra ser só uma viagem de férias. Avião, praia e água de coco.", "aviao",
         [A(V, 540, 1900, 1.45, "feliz", "acenando")],
         cam=close(540, 1900, 1.45, 1.05, 1.2, 220), destaque=["férias", "coco"]),

    Cena("Até que o piloto falou: senhores passageiros… temos um probleminha.", "aviao",
         [A(PILOTO, 540, 1900, 1.55, "medo", fala=True, anim="tremer")],
         cam=close(540, 1900, 1.55, 1.2, 1.45), sfx=["plim"], destaque=["piloto", "probleminha"]),

    Cena("O avião caiu no meio do oceano.", "mar",
         [A(V, 540, 1500, 0.9, "choque", anim="flutuar")],
         cam=plano(1.0, 1.15, y=1100), fx=["tremor", "tremor_forte", "flash"], sfx=["boom"], destaque=["caiu", "oceano"]),

    Cena("Você acordou numa praia que não aparecia em nenhum mapa.", "praia",
         [A(V, 540, 1900, 1.45, "tonto", troca=[(1.8, {"expr": "choque"})])],
         cam=plano(1.0, 1.25, y=1000, y1=1150), sfx=[("whoosh", 0.1)], destaque=["praia", "mapa"]),

    Cena("E o celular? 0% de bateria.", "praia",
         [A(V, 540, 1990, 1.35, "triste", "segurando"), Pr("celular", 540, 1880, 0.6, texto="0%", tam=140,
                                                          cor=(40, 10, 15), cor_texto=(255, 70, 70))],
         voz="E o celular? Zero por cento de bateria.", cam=plano(1.0, 1.15, y=1000), destaque=["0%", "bateria"]),

    Cena("Na areia, tinha pegadas. Muitas pegadas. E todas iam direto pra floresta.", "praia",
         [Pr("pegadas", 360, 1900, 1.0), A(V, 800, 1990, 1.2, "pensando", look=-10, flip=True)],
         cam=plano(1.0, 1.12, y=1100), destaque=["pegadas", "floresta"]),

    Cena("No meio da mata, você achou uma placa: Bem-vindo à ilha dos [[canibais]].", "selva",
         [Pr("placa", 540, 1700, 1.2, texto="BEM-VINDO À\nILHA DOS\n[[CANIBAIS]]", tam=62),
          A(V, 870, 1990, 1.15, "choque", flip=True, troca=[(0.1, {"expr": "pensando"}), (2.4, {"expr": "choque"})])],
         cam=plano(1.0, 1.15, y=1000), sfx=[("boom", 2.4)], destaque=["placa", "bem-vindo"]),

    Cena("Antes que você pudesse correr… eles te cercaram.", "selva",
         [A(nativo(i), [120, 950, 260, 820][i], [1850, 1850, 1990, 1990][i], 1.0, "neutro", "apontando",
            flip=i % 2 == 1, entra=1.0 + i * 0.25) for i in range(4)] +
         [A(V, 540, 1990, 1.25, "medo", anim="tremer")],
         cam=plano(1.0, 1.1, y=1050), fx=["escuro"], sfx=["suspense", ("pop", 1.0), ("pop", 1.25)], destaque=["cercaram"]),

    Cena("Te levaram pra aldeia. E no centro, um caldeirão gigante já estava fervendo.", "aldeia_noite",
         [Pr("caldeirao", 540, 1800, 1.25), A(nativo(2), 130, 1990, 1.0, "neutro"),
          A(V, 920, 1990, 1.05, "medo", anim="tremer", flip=True)],
         cam=plano(1.0, 1.15, y=1050), destaque=["aldeia", "caldeirão", "fervendo"]),

    Cena("O chefe dos [[canibais]] te olhou de cima a baixo… e disse uma única palavra:", "aldeia_noite",
         [A(CHEFE, 540, 1900, 1.55, "desconfiado", fala=True)],
         cam=close(540, 1900, 1.55, 1.15, 1.45), sfx=["suspense"], destaque=["chefe", "única", "palavra"]),

    Cena("Tempero.", "raios_vermelho",
         [A(CHEFE, 540, 1900, 1.6, "sorriso", fala=True)],
         cam=close(540, 1900, 1.6, 1.4, 1.55), fx=["soco", "tremor"], sfx=["boom"], destaque=["tempero"], min_dur=1.8),

    Cena("Você precisava pensar rápido. Muito rápido.", "aldeia_noite",
         [A(V, 540, 1900, 1.55, "medo", anim="tremer")],
         cam=close(540, 1900, 1.55, 1.25, 1.6), destaque=["rápido"]),

    Cena("Aí você lembrou: na mochila tinha um pacote de miojo.", "raios_azul",
         [Pr("estrelas", 540, 1150, 1.4), Pr("miojo", 540, 1100, 1.3, anim="pulsar", entra=1.4),
          A(V, 540, 2050, 1.0, "feliz", "bracos_cima")],
         cam=plano(1.0, 1.06), fx=["soco"], sfx=[("ding", 1.4)], destaque=["mochila", "miojo"]),

    Cena("Você ofereceu pro chefe. Três minutinhos depois…", "aldeia_noite",
         [Pr("relogio", 540, 900, 1.2), A(V, 250, 1990, 1.0, "medo", "segurando"),
          A(CHEFE, 830, 1990, 1.0, "desconfiado", flip=True)],
         cam=plano(1.0, 1.08), destaque=["chefe", "três", "minutinhos"]),

    Cena("Ele provou… e começou a chorar de emoção.", "aldeia_noite",
         [A(CHEFE, 540, 1900, 1.55, "neutro", "segurando", troca=[(1.2, {"expr": "chorando_feliz"})]),
          Pr("tigela", 540, 1650, 0.8)],
         cam=close(540, 1900, 1.55, 1.15, 1.35, 200), sfx=[("plim", 1.2)], destaque=["chorar", "emoção"]),

    Cena("Nenhum [[canibal]] daquela ilha tinha provado nada tão bom na vida.", "aldeia_noite",
         [Pr("fogueira", 540, 1750, 1.1)] +
         [A(nativo(i), [140, 940, 330, 760][i], [1850, 1850, 1990, 1990][i], 0.95, "feliz", "bracos_cima",
            anim="pulo", flip=i % 2 == 1) for i in range(4)],
         cam=plano(1.0, 1.1, y=1050), destaque=["tão", "bom"]),

    Cena("Naquela mesma noite, você virou o chef oficial da tribo.", "aldeia_noite",
         [Pr("estrelas", 540, 1250, 1.3), A(VOCE_CHEF, 540, 1900, 1.4, "sorriso", "bracos_cima", fala=False),
          A(nativo(1), 120, 1990, 0.9, "feliz", "bracos_cima", anim="pulo"),
          A(nativo(3), 960, 1990, 0.9, "feliz", "bracos_cima", anim="pulo", flip=True)],
         cam=plano(1.0, 1.1, y=1000), fx=["soco"], sfx=["ding"], destaque=["chef", "oficial"]),

    Cena("Miojo de frango, de carne, de galinha caipira… e até brigadeiro de coco.", "aldeia",
         [A(VOCE_CHEF, 540, 1990, 1.35, "feliz", "segurando"), Pr("tigela", 540, 1700, 0.75),
          Pr("caldeirao", 160, 1990, 0.6), Pr("caldeirao", 920, 1990, 0.6)],
         cam=plano(1.0, 1.12, y=1050), sfx=[("pop", 0.6), ("pop", 1.4), ("pop", 2.4)], destaque=["brigadeiro"]),

    Cena("E pela primeira vez na história… a tribo inteira virou vegetariana.", "aldeia",
         [A(CHEFE, 540, 1950, 1.25, "sorriso", "acenando", fala=False)] +
         [A(nativo(i), [140, 940][i], 1990, 0.95, "feliz", "segurando", flip=i == 1) for i in range(2)] +
         [Pr("tigela", [140, 940][i], 1840, 0.55, cor=(80, 170, 80)) for i in range(2)],
         cam=plano(1.0, 1.1, y=1050), sfx=[("risada", 2.0)], destaque=["vegetariana"]),

    Cena("Meses depois, um navio apareceu no horizonte.", "praia",
         [Pr("navio", 560, 1130, 0.45, anim="flutuar"), A(V, 540, 1990, 1.2, "choque", look=0)],
         cam=plano(1.0, 1.12, y=1000), sfx=["plim"], destaque=["navio", "horizonte"]),

    Cena("Você olhou pra trás… e a tribo inteira estava chorando.", "praia",
         [A(CHEFE, 300, 1990, 1.1, "chorando"), A(nativo(0), 70, 1990, 0.9, "triste"),
          A(nativo(2), 800, 1990, 0.9, "triste", flip=True), A(nativo(3), 1010, 1990, 0.9, "triste", flip=True)],
         cam=plano(1.0, 1.1, y=1050), destaque=["chorando"]),

    Cena("Mas você subiu no navio. Finalmente… você ia voltar pra casa.", "conves",
         [A(V, 480, 1900, 1.4, "feliz", "acenando")],
         cam=close(480, 1900, 1.4, 1.05, 1.2, 220), destaque=["navio", "casa"]),

    Cena("Aí o capitão olhou pra você, sorriu… e disse:", "conves",
         [A(CAPITAO, 540, 1900, 1.55, "convencido", fala=True)],
         cam=close(540, 1900, 1.55, 1.15, 1.45), fx=["escuro"], sfx=["suspense"], destaque=["capitão", "sorriu"]),

    Cena("Tempero.", "raios_vermelho",
         [A(CAPITAO, 540, 1900, 1.6, "sorriso", fala=True)],
         cam=close(540, 1900, 1.6, 1.4, 1.55), fx=["soco", "tremor"], sfx=["boom"], destaque=["tempero"], min_dur=1.8),

    Cena("Comenta aí: o que você levaria na mochila pra sobreviver? Parte 2?", "praia",
         [A(V, 540, 1900, 1.45, "choque", anim="tremer")],
         cam=close(540, 1900, 1.45, 1.1, 1.2, 230), sfx=["ding"], destaque=["comenta", "mochila", "parte"], extra=1.2),
]
