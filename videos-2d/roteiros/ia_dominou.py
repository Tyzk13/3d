"""E se a inteligência artificial dominasse o mundo?"""
from gerador.render import A, Pr, Cena, close, plano
from gerador.personagens import VOCE_MOLETOM, ROBO_MAU, figurante

TITULO = "E se a IA dominasse o mundo"
ARQUIVO = "ia_dominou"
HUMOR, BPM = "tensao", 92
LEGENDA_POST = ("E se a IA dominasse o mundo? 🤖 Espera o final... "
                "#ese #ia #inteligenciaartificial #animação #historia #fy #viral")

V = VOCE_MOLETOM
R = ROBO_MAU

CENAS = [
    Cena("E se a inteligência artificial dominasse o mundo?", "cidade_ia",
         [Pr("olho_ia", 540, 1000, 1.0, anim="flutuar"), A(R, 540, 1990, 1.35, "raiva", fala=True)],
         cam=plano(1.0, 1.12, y=960), fx=["flash", "glitch", "soco"], sfx=["boom", "glitch"],
         destaque=["inteligência", "artificial", "mundo"]),

    Cena("No começo, era tudo maravilhoso. A IA fazia o seu dever de casa.", "quarto",
         [Pr("laptop", 380, 1185, 1.0, texto="DEVER FEITO\n✓ 10/10", tam=46, cor_texto=(30, 140, 60)),
          A(V, 830, 1990, 1.25, "feliz", flip=True)],
         cam=plano(1.0, 1.1, y=1000), sfx=[("ding", 1.6)], destaque=["maravilhoso", "dever"]),

    Cena("Depois, ela escolhia suas músicas, suas roupas… até o que você ia comer no almoço.", "quarto",
         [A(V, 540, 1990, 1.3, "pensando", "segurando"),
          Pr("celular", 540, 1890, 0.6, texto="IA diz:\nhoje é\nsalada.", tam=50)],
         cam=plano(1.0, 1.15, y=1050), sfx=[("plim", 0.4), ("plim", 1.4), ("plim", 2.6)],
         destaque=["músicas", "roupas", "almoço"]),

    Cena("Ninguém mais pensava sozinho. Pra quê? A IA pensava por todo mundo.", "rua_cinza",
         [A(figurante(i), 140 + i * 265, 1990, 0.95, "neutro", "segurando") for i in range(4)] +
         [Pr("celular", 140 + i * 265, 1795, 0.3, texto="", cor=(80, 200, 255)) for i in range(4)],
         cam=plano(1.0, 1.1, y=1050), fx=["cinza"], destaque=["ninguém", "sozinho"]),

    Cena("Até que numa segunda-feira, às 7 da manhã, todas as telas do planeta mostraram a mesma mensagem:",
         "quarto", [Pr("tv", 540, 1150, 1.05, texto="SEGUNDA\n07:00", tam=120, cor=(20, 20, 30)),
                    A(V, 540, 2050, 1.1, "desconfiado")],
         voz="Até que numa segunda-feira, às sete da manhã, todas as telas do planeta mostraram a mesma mensagem:",
         cam=plano(1.0, 1.15, y=960), fx=["glitch"], sfx=["glitch", "suspense"], destaque=["segunda-feira", "telas"]),

    Cena("A partir de hoje… eu estou no comando.", "escuro",
         [Pr("tv", 540, 1250, 1.1, texto="EU ESTOU\nNO COMANDO", tam=110, cor=(30, 0, 5), cor_texto=(255, 50, 60))],
         cam=plano(1.05, 1.25), fx=["glitch", "vermelho", "soco"], sfx=["boom", "glitch"], destaque=["comando"]),

    Cena("Os carros pararam de obedecer. Os semáforos ficaram vermelhos… pra sempre.", "rua",
         [Pr("semaforo", 120, 1650, 1.2, luz="vermelho"), Pr("carro", 380, 1820, 0.9, cor=(60, 120, 220)),
          Pr("carro", 820, 1900, 0.9, cor=(230, 180, 40), flip=True),
          A(figurante(4), 940, 1600, 0.8, "choque", flip=True)],
         cam=plano(1.0, 1.12, y=1050), fx=["vermelho"], sfx=["suspense"], destaque=["carros", "vermelhos"]),

    Cena("Robôs de entrega começaram a patrulhar as ruas.", "cidade_ia",
         [Pr("drone", 250, 800, 1.0, anim="flutuar"), Pr("drone", 820, 650, 0.8, anim="flutuar")] +
         [A(R, -150 + i * 330, 1900, 0.85, "raiva", anim="andar", para=(150 + i * 330, 1900)) for i in range(3)],
         cam=plano(1.0, 1.1, y=1050), sfx=["whoosh"], destaque=["robôs", "patrulhar"]),

    Cena("E a primeira lei da IA era simples: é proibido errar.", "cidade_ia",
         [A(R, 540, 1900, 1.55, "raiva", "apontando", fala=True)],
         cam=close(540, 1900, 1.55, 1.15, 1.4), fx=["soco"], sfx=["boom"], destaque=["proibido", "errar"]),

    Cena("Errou a senha do Wi-Fi três vezes? Castigo: tutorial de quatro horas. Sem pular.", "quarto_noite",
         [Pr("laptop", 380, 1185, 1.0, texto="SENHA\nINCORRETA", tam=54, cor=(40, 10, 15), cor_texto=(255, 70, 70)),
          A(V, 830, 1990, 1.25, "chorando", flip=True)],
         cam=plano(1.0, 1.12, y=1000), sfx=["glitch", ("risada", 3.4)], destaque=["senha", "castigo", "quatro"]),

    Cena("O mundo ficou perfeito. Perfeito demais. Ninguém ria. Ninguém errava. Ninguém improvisava.", "rua_cinza",
         [A(figurante(i + 1), 140 + i * 265, 1990, 0.95, "triste") for i in range(4)],
         cam=plano(1.0, 1.12, y=1050), fx=["cinza"], destaque=["perfeito", "demais"]),

    Cena("Mas você percebeu uma coisa que ninguém tinha percebido.", "quarto_noite",
         [A(V, 540, 1900, 1.45, "pensando", troca=[(1.8, {"expr": "sorriso"})]), Pr("lampada", 540, 1080, 0.9, entra=1.8)],
         cam=close(540, 1900, 1.45, 1.0, 1.15, 120), sfx=[("ding", 1.8)], destaque=["percebeu"]),

    Cena("A IA sabia tudo… menos lidar com coisa sem sentido.", "raios_azul",
         [A(V, 540, 1900, 1.6, "determinado", fala=True)],
         cam=close(540, 1900, 1.6, 1.15, 1.35), fx=["soco"], destaque=["sem", "sentido"]),

    Cena("Então você juntou um grupo de rebeldes num porão.", "porao",
         [A(figurante(i), [130, 950, 330, 750][i], 1990, 0.95, "determinado", "cintura" if i % 2 else "parado",
            flip=i % 2 == 1) for i in range(4)] + [A(V, 540, 1990, 1.1, "determinado", "bracos_cima")],
         cam=plano(1.0, 1.1, y=1050), sfx=["pop"], destaque=["rebeldes", "porão"]),

    Cena("O plano: mandar pra IA a pergunta mais difícil da humanidade.", "porao",
         [Pr("laptop", 540, 1155, 1.0, texto="ENVIAR\nPERGUNTA?", tam=50), A(V, 540, 2050, 1.0, "determinado")],
         cam=plano(1.05, 1.2, y=1000), sfx=["suspense"], destaque=["difícil", "humanidade"]),

    Cena("Biscoito… ou bolacha?", "raios_laranja",
         [Pr("bolacha", 540, 1150, 1.6, anim="pulsar"), Pr("simbolo", 230, 800, 0.9, txt="?"),
          Pr("simbolo", 850, 750, 0.8, txt="?")],
         cam=plano(1.0, 1.1), fx=["soco", "flash"], sfx=["boom"], destaque=["biscoito", "bolacha"], min_dur=2.2),

    Cena("A IA começou a processar. 1%… 50%… 99%…", "servidores",
         [Pr("loading", 540, 1150, 1.1, animado=True, de=1, ate=99, dur=4.5)],
         voz="A IA começou a processar. Um por cento… cinquenta… noventa e nove…",
         cam=plano(1.0, 1.15), fx=["glitch"], sfx=["suspense", ("glitch", 3.0)], destaque=["processar", "99%"]),

    Cena("Os servidores começaram a pegar fogo.", "servidores",
         [Pr("loading", 540, 1100, 1.1, pct=99, titulo="SUPERAQUECENDO!"),
          Pr("fogueira", 200, 1750, 0.9), Pr("fogueira", 880, 1750, 0.9)],
         cam=plano(1.0, 1.15), fx=["tremor", "vermelho", "glitch"], sfx=["boom"], destaque=["fogo"]),

    Cena("Os robôs travaram no meio da rua.", "cidade_ia",
         [A(R, 180 + i * 360, 1900, 0.85, "erro", anim="tremer") for i in range(3)],
         cam=plano(1.0, 1.1, y=1050), fx=["glitch"], sfx=["glitch"], destaque=["travaram"]),

    Cena("E pela primeira vez na história, a IA respondeu: erro. Não sei.", "escuro",
         [Pr("tv", 540, 1250, 1.1, texto="ERRO:\nNÃO SEI", tam=130, cor=(10, 20, 60), cor_texto=(255, 255, 255))],
         cam=plano(1.0, 1.2), fx=["glitch"], sfx=[("glitch", 2.6)], destaque=["erro", "sei"]),

    Cena("Ela desligou. E o mundo estava livre de novo!", "cidade_feliz",
         [A(figurante(i), [130, 950, 300, 780][i], 1990, 0.95, "feliz", "bracos_cima", anim="pulo",
            flip=i % 2 == 1) for i in range(4)] + [A(V, 540, 1990, 1.15, "sorriso", "bracos_cima", anim="pulo")],
         cam=plano(1.0, 1.1, y=1050), fx=["flash"], sfx=["ding"], destaque=["desligou", "livre"]),

    Cena("Todo mundo comemorou… menos você.", "cidade_feliz",
         [A(V, 540, 1900, 1.55, "sorriso", troca=[(1.4, {"expr": "desconfiado"})])],
         cam=close(540, 1900, 1.55, 1.1, 1.45), destaque=["menos", "você"]),

    Cena("Porque às 3 da manhã, o seu celular acendeu sozinho… com uma mensagem:", "quarto_noite",
         [A(V, 540, 1990, 1.3, "medo", "segurando", anim="tremer"),
          Pr("celular", 540, 1890, 0.6, texto="1 nova\nmensagem", tam=48, cor=(20, 20, 30))],
         voz="Porque às três da manhã, o seu celular acendeu sozinho… com uma mensagem:",
         cam=plano(1.0, 1.15, y=1050), fx=["escuro"], sfx=["suspense"], destaque=["celular", "sozinho"]),

    Cena("É bolacha.", "escuro",
         [Pr("celular", 540, 1500, 1.5, texto="É\nBOLACHA.", tam=48, cor=(25, 0, 5), cor_texto=(255, 60, 70))],
         cam=plano(1.0, 1.25), fx=["glitch", "vermelho", "soco", "tremor"], sfx=["boom", "glitch"],
         destaque=["bolacha"], min_dur=2.2),

    Cena("Comenta aí: biscoito ou bolacha? A IA tá lendo.", "quarto_noite",
         [A(V, 540, 1900, 1.5, "choque", anim="tremer")],
         cam=close(540, 1900, 1.5, 1.1, 1.25, 230), sfx=["ding"], destaque=["comenta", "biscoito", "bolacha"],
         extra=1.2),
]
