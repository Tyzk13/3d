# RPGHUB — fichas e mesa para vários sistemas

Gerenciador de fichas e campanhas de RPG. A entrada é uma estante de livros; o livro aberto define o sistema:
- **Heróis de Bueiro** (playtest completo): 1d10 + dado do nível, maestrias, classes, origens, elementos, reputação.
- **Shinigamis & Hollows** (Livro dos Ceifadores v0.7b): d20, seis atributos, perícias, TRs, divisões, Pontos de Partida, Caminhos, zanpakuto, kidos, Quebras, ameaças pelo Guia de Inimigos.
- **Ordem Paranormal II** (Teorias e Homebrews, de fãs): Físico/Emoção/Mente e perícias em dados d4–d12, teste pela soma do dado do atributo, do da perícia e dos bônus contra DT 7, PV/PD, ocupações, perfis Analista/Executor/Vigilante e melhorias.

Conta, campanhas, Escudo do Mestre, combate, ganchos e backup são comuns aos dois. Fichas e campanhas sem o campo `sistema` (criadas antes do RPGHUB) são do Heróis de Bueiro.

## Adicionar um sistema
Crie `js/<id>-regras.js` e `js/<id>-ficha.js` e registre com `HB.Sistemas.registrar({...})` (veja `js/sh-ficha.js`): ficha, ameaças, regras, `derivados`, `combatente`, `teste`, `ataque` e `iniciativa` ('fixa' ou 'rolada').

## Como abrir e entrar
- **Publicado (claude.ai)**: entra com a conta claude.ai de quem abre (que pode ser a do Google). Fichas e campanhas ficam numa base compartilhada da página.
- **Site próprio com "Entrar com Google"**: configure o Firebase seguindo `FIREBASE.md` (Google + e-mail/senha, regras em `firestore.rules`).
- **Local, para testar**: `cd herois-de-bueiro && python3 -m http.server 8765` e abra `http://localhost:8765`. Conta só com nome, guardada no navegador.

## Mestre e jogadores
- Quem cria a campanha é o **mestre** e é o único que abre o **Escudo do Mestre** (combates, ganchos, anotações, vida dos vilões).
- Jogadores entram com o **código de convite**, adicionam os próprios heróis e veem a campanha, o histórico de rolagens e a ordem do combate.
- Na aba **Jogadores**, o mestre pode **passar o escudo** para um jogador (e retirar quando quiser) ou **passar o cargo de mestre**.
- Cada ficha só é editada pelo dono e por quem tem o escudo da campanha do herói; os outros veem e rolam.

## Arquivos
| Arquivo | O que tem |
|---|---|
| `js/regras.js` | Todos os números do sistema: níveis de dado, maestrias, classes, origens, elementos, reputação e os cálculos da ficha (`derivados`). |
| `js/dados.js` | Rolagens: teste (1d10 + dado do nível), ataque (1d10 + maestria), dano (dado do atributo + maestria), rolagem livre. |
| `js/store.js` | Salvamento: Firestore, base compartilhada (`claude.use('db')`) ou localStorage. |
| `js/auth.js` | Login: Firebase (Google, e-mail), conta claude.ai ou conta local; nomes das outras pessoas. |
| `js/permissoes.js` | Mestre, escudo, membros e quem edita cada ficha. |
| `js/firebase-config.js` | Configuração do Firebase (vazia por padrão). |
| `js/ui.js` | Janelas, avisos, barras de vida/mana, cartões de resultado, recorte de foto. |
| `js/ficha.js` | Lista e ficha de heróis; bestiário e ficha de vilões. |
| `js/mestre.js` | Campanhas e Mesa do Mestre (heróis, combates, ganchos, dados, anotações). |
| `js/sistemas.js` | Registro dos livros/sistemas e livro ativo. |
| `js/sistema-hb.js` | Heróis de Bueiro ligado ao RPGHUB. |
| `js/sh-regras.js` | Shinigamis & Hollows: perícias, TRs, níveis, divisões, partidas, zanpakuto, guia de inimigos, dados d20. |
| `js/sh-ficha.js` | Shinigamis & Hollows: ficha, ameaças (hollows), regras e ligação com o RPGHUB. |
| `js/op2.js` | Ordem Paranormal II: regras, ficha, ameaças e ligação com o RPGHUB. |
| `js/app.js` | Rotas por `#hash`, ações dos botões, ligação dos campos com os dados. |

## Decisões onde o PDF deixa aberto
- 20 pontos de atributo, 5 por nível = 4 níveis para distribuir; classe e origem somam por cima. O nível final é limitado a 0–5 (campo "Outros" para o Mestre ajustar).
- Ataque acerta quando o total iguala ou passa a Defesa do alvo.
- Ciclo dos elementos: Fogo > Terra > Vento > Água > Fogo.
- Bestial: os modificadores valem só na Forma Bestial; assumir a forma custa 5 de Mana.
- Curandeiro: "8 de mana + 6 por nível" foi lido como 6 por nível de Feitiçaria.
- Estrategista/Inventor não aparece na tabela de iniciativa: fica depois do Tanker.

## Decisões no Shinigamis & Hollows
- Divisões citam "Persuasão" e "História", que não estão na lista de perícias: viraram Diplomacia e Conhecimento.
- Ataque com margem de crítico menor que 20 (ex.: Tanto 18) só é crítico se já acertar; 20 natural sobe um grau.
- Aplicar dano no combate já desconta a Dureza do alvo.
- Ameaças do bestiário base são originais, montadas pelo Guia de Inimigos.

## Decisões no Ordem Paranormal II
- O PDF não define o teste: a mesa joga somando o dado do atributo, o da perícia e os dados de bônus. Todos os dados em 1 = falha crítica.
- Perícias não vêm listadas: lista inicial editável (5 físicas, 5 emocionais, 5 mentais) que cada ficha pode renomear, apagar ou ampliar.
- Iniciativa: soma de Físico e Reflexos. Ataque acerta com resultado ≥ DT do alvo (padrão 7).
