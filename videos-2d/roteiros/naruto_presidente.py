"""E se o Naruto fosse presidente do Brasil?"""
from gerador.render import A, Pr, Cena, close, plano
from gerador.personagens import NARUTO, NARUTO_PRES, figurante, politico

TITULO = "E se o Naruto fosse presidente do Brasil"
ARQUIVO = "naruto_presidente"
HUMOR, BPM = "alegre", 104
LEGENDA_POST = ("E se o Naruto fosse presidente do Brasil? 🍥🇧🇷 Você votaria nele? "
                "#naruto #ese #animação #anime #brasil #humor #fy #viral")

N = NARUTO
NP = NARUTO_PRES

CENAS = [
    Cena("E se o Naruto fosse presidente do Brasil?", "bandeira",
         [A(NP, 540, 1900, 1.6, "sorriso", "acenando", fala=True)],
         cam=close(540, 1900, 1.6, 1.15, 1.3, 260), fx=["flash", "soco"], sfx=["boom"],
         destaque=["naruto", "presidente", "brasil"]),

    Cena("Tudo começou numa terça-feira, quando um portal se abriu no meio da Avenida Paulista.", "paulista",
         [Pr("portal", 540, 1640, 0.95, anim="pulsar", entra=0.6),
          A(figurante(0), 170, 1990, 1.1, "choque", look=8),
          A(figurante(2), 910, 1990, 1.1, "choque", flip=True, look=-8)],
         cam=plano(1.0, 1.1, y=1150), sfx=[("whoosh", 0.5)], destaque=["portal", "paulista"]),

    Cena("Dele saiu um ninja loiro, de roupa laranja… morrendo de fome.", "paulista",
         [Pr("portal", 540, 1500, 0.8, anim="pulsar"),
          A(N, 540, 1860, 1.45, "sorriso", fala=True, entra=0.2, troca=[(2.6, {"expr": "chorando"})])],
         cam=close(540, 1860, 1.45, 1.2, 1.4), sfx=[("pop", 0.2)], destaque=["ninja", "laranja", "fome"]),

    Cena("Ele procurou ramen pela cidade inteira… mas só achou um pastel de feira.", "feira",
         [A(N, 540, 1900, 1.45, "triste", "segurando", fala=True, troca=[(2.4, {"expr": "choque"})]),
          Pr("pastel", 540, 1640, 0.95, entra=2.4)],
         cam=close(540, 1900, 1.45, 1.1, 1.25, 120), sfx=[("plim", 2.4)], destaque=["ramen", "pastel"]),

    Cena("Foi amor à primeira mordida. E ali ele decidiu: esse país precisa de mim!", "raios_laranja",
         [Pr("estrelas", 540, 1300, 1.4),
          A(N, 540, 1900, 1.6, "apaixonado", "segurando", fala=True, troca=[(1.8, {"expr": "determinado", "pose": "bracos_cima"})]),
          ],
         cam=close(540, 1900, 1.6, 1.15, 1.3, 200), fx=["soco"], sfx=["ding"], destaque=["amor", "decidiu", "país"]),

    Cena("Faltavam três meses pra eleição. E ninguém levou ele a sério.", "tv",
         [Pr("tv", 540, 1080, 1.05, texto="ELEIÇÕES\nCANDIDATO NINJA?", tam=86, cor=(40, 110, 210)),
          A(politico(0), 180, 1990, 1.0, "risada"), A(figurante(1), 540, 2010, 1.0, "risada", anim="pulo"),
          A(politico(2), 900, 1990, 1.0, "risada", flip=True)],
         cam=plano(1.0, 1.08, y=1100), sfx=[("risada", 2.0)], destaque=["eleição", "ninguém"]),

    Cena("Até que ele usou o jutsu clone das sombras… e fez campanha em todas as cidades do Brasil. Ao mesmo tempo.",
         "raios_azul",
         [A(N, 160 + (i % 4) * 253, 900 + (i // 4) * 420, 0.62, ["sorriso", "determinado", "feliz"][i % 3],
            ["jutsu", "acenando", "bracos_cima"][i % 3], entra=1.4 + i * 0.12, anim="respirar")
          for i in range(12)] +
         [A(N, 540, 1950, 1.25, "determinado", "jutsu", fala=True, sai=1.4)],
         cam=plano(1.0, 1.06, y=1100), fx=["soco"], sfx=[("whoosh", 1.3), ("boom", 1.4)],
         destaque=["jutsu", "clone", "sombras", "mesmo"]),

    Cena("5.570 clones. Um em cada cidade.", "raios_verde",
         [Pr("texto", 540, 900, 1.0, txt="5.570", tam=260, anim="pulsar")] +
         [A(N, 90 + i * 150, 1880, 0.5, "sorriso", "acenando", anim="pulo") for i in range(7)],
         voz="Cinco mil quinhentos e setenta clones. Um em cada cidade.",
         sfx=["pop"], destaque=["5.570", "clones"]),

    Cena("Resultado: 99% dos votos.", "tv",
         [Pr("tv", 540, 1120, 1.05, texto="NARUTO\n99%", tam=130, cor=(0, 150, 70)),
          Pr("urna", 860, 1850, 1.0, anim="respirar")],
         voz="Resultado: noventa e nove por cento dos votos.",
         cam=plano(1.05, 1.18, y=900), fx=["flash"], sfx=["ding"], destaque=["99%", "votos"]),

    Cena("No dia da posse, em Brasília, ele chegou pulando de prédio em prédio.", "brasilia",
         [A(NP, 120, 1750, 0.9, "sorriso", "bracos_cima", anim="pulo", para=(960, 1750))],
         cam=plano(1.0, 1.1, y=1200), sfx=["whoosh", ("whoosh", 1.6)], destaque=["posse", "brasília"]),

    Cena("E foi o primeiro presidente da história a tomar posse… de bandana.", "gabinete",
         [A(NP, 540, 1900, 1.55, "convencido", "cintura", fala=True)],
         cam=close(540, 1900, 1.55, 1.1, 1.45, 240), sfx=[("plim", 2.2)], destaque=["primeiro", "bandana"]),

    Cena("Primeira medida: ramen grátis em todas as escolas.", "escola",
         [A(figurante(i), 140 + i * 265, 1990, 0.9, "feliz", "segurando", anim="pulo") for i in range(4)] +
         [Pr("tigela", 140 + i * 265, 1845, 0.55) for i in range(4)],
         cam=plano(1.0, 1.08, y=1150), sfx=["ding"], destaque=["ramen", "grátis", "escolas"]),

    Cena("Segunda medida: um clone em cada fila do país. Banco, hospital, INSS… As filas acabaram em uma semana.",
         "paulista",
         [A(figurante(i + 2), 120 + i * 210, 1990, 0.85, "triste" if i % 2 else "neutro", troca=[(4.3, {"expr": "feliz"})])
          for i in range(5)] +
         [A(N, 330 + i * 420, 2030, 0.8, "sorriso", "acenando", entra=1.2 + i * 0.3) for i in range(2)],
         voz="Segunda medida: um clone em cada fila do país. Banco, hospital, í-ene-esse-esse… As filas acabaram em uma semana.",
         cam=plano(1.0, 1.08, y=1150), sfx=[("pop", 1.2), ("pop", 1.5)], destaque=["clone", "fila", "acabaram"]),

    Cena("Mas tinha gente em Brasília que não gostou nada disso.", "plenario",
         [A(politico(i), 160 + i * 250, 1990, 1.0, "raiva", "cintura" if i % 2 else "parado", anim="tremer") for i in range(4)],
         cam=plano(1.0, 1.12, y=1250), sfx=["suspense"], destaque=["não", "gostou"]),

    Cena("Os políticos corruptos esconderam todo o dinheiro num cofre secreto.", "cofre",
         [A(politico(1), 330, 1990, 1.05, "convencido", "segurando"), Pr("dinheiro", 330, 1800, 0.55),
          A(politico(2), 760, 1990, 1.05, "convencido", "segurando", flip=True), Pr("dinheiro", 760, 1800, 0.55)],
         cam=plano(1.0, 1.1, y=1200), destaque=["corruptos", "cofre", "secreto"]),

    Cena("Só esqueceram de um detalhe: ninja se esconde melhor que político.", "cofre",
         [A(politico(1), 210, 1990, 1.0, "convencido", troca=[(1.6, {"expr": "choque"})]),
          A(politico(2), 870, 1990, 1.0, "convencido", flip=True, troca=[(1.6, {"expr": "choque"})]),
          A(NP, 540, 1700, 1.15, "convencido", "cintura", entra=1.6, fala=True)],
         cam=plano(1.05, 1.2, y=1200), sfx=[("boom", 1.6)], destaque=["ninja", "esconde"]),

    Cena("Cada centavo voltou pro povo. Virou escola, hospital… e uma loja de ramen em cada esquina.", "cidade_feliz",
         [A(figurante(i), 150 + i * 260, 1990, 0.9, "feliz", "bracos_cima" if i % 2 else "acenando", anim="pulo")
          for i in range(4)],
         cam=plano(1.0, 1.1, y=1100), sfx=["ding"], destaque=["centavo", "escola", "hospital", "ramen"]),

    Cena("Em quatro anos, o Brasil virou a maior potência do planeta.", "raios_verde",
         [Pr("bandeira_mastro", 300, 1500, 1.4),
          A(NP, 600, 1900, 1.5, "sorriso", "bracos_cima", fala=True), Pr("estrelas", 540, 1200, 1.4)],
         cam=close(600, 1900, 1.5, 1.0, 1.2, 250), fx=["soco"], sfx=["ding"], destaque=["brasil", "potência"]),

    Cena("Até que chegou o maior desafio do mandato dele…", "escuro",
         [A(NP, 540, 1900, 1.6, "medo", fala=True)],
         cam=close(540, 1900, 1.6, 1.2, 1.55), fx=["escuro"], sfx=["suspense"], destaque=["desafio"]),

    Cena("A final da Copa do Mundo. Brasil contra Japão.", "estadio",
         [Pr("bandeira_mastro", 230, 1900, 1.4, tipo="br"), Pr("bandeira_mastro", 780, 1900, 1.4, tipo="jp")],
         cam=plano(1.0, 1.12, y=1300), fx=["flash"], sfx=["boom"], destaque=["copa", "brasil", "japão"]),

    Cena("De um lado, o país que ele governa. Do outro, a terra dos ninjas.", "estadio",
         [A(NP, 540, 1900, 1.55, "medo", fala=True, anim="tremer", look=-10, troca=[(2.0, {"look": 10})])],
         cam=close(540, 1900, 1.55, 1.2, 1.4), destaque=["governa", "ninjas"]),

    Cena("Então ele fez dois clones. Um torcendo pro Brasil… e outro pro Japão.", "estadio",
         [Pr("bandeira_mastro", 140, 1900, 1.1, tipo="br"), A(N, 330, 1900, 1.0, "sorriso", "bracos_cima", anim="pulo"),
          Pr("bandeira_mastro", 940, 1900, 1.1, tipo="jp", flip=True),
          A(N, 750, 1900, 1.0, "sorriso", "bracos_cima", anim="pulo", flip=True, entra=1.8)],
         cam=plano(1.0, 1.08, y=1300), sfx=[("pop", 1.8)], destaque=["dois", "clones", "brasil", "japão"]),

    Cena("E os dois clones saíram no tapa no meio da arquibancada.", "estadio",
         [Pr("briga", 540, 1880, 1.3)],
         cam=plano(1.05, 1.15, y=1350), fx=["tremor"], sfx=["boom", ("boom", 1.2)], destaque=["tapa"]),

    Cena("O jogo terminou zero a zero. E o presidente terminou com um olho roxo.", "tv",
         [A(NP, 540, 1900, 1.6, "tonto", fala=True)],
         cam=close(540, 1900, 1.6, 1.2, 1.4), sfx=[("risada", 2.4)], destaque=["zero", "olho", "roxo"]),

    Cena("E aí, você votaria no Naruto? Comenta aqui embaixo!", "bandeira",
         [A(NP, 540, 1900, 1.6, "sorriso", "acenando", fala=True)],
         cam=close(540, 1900, 1.6, 1.15, 1.25, 260), sfx=["ding"], destaque=["votaria", "naruto", "comenta"],
         extra=1.2),
]
