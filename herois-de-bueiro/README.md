# Heróis de Bueiro — fichas e mesa

App de fichas para o sistema **Heróis de Bueiro** (playtest completo), no molde de um gerenciador de campanhas de RPG: heróis, campanhas com mesa do mestre, combate com iniciativa, vilões e regras.

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
| `js/app.js` | Rotas por `#hash`, ações dos botões, ligação dos campos com os dados. |

## Decisões onde o PDF deixa aberto
- 20 pontos de atributo, 5 por nível = 4 níveis para distribuir; classe e origem somam por cima. O nível final é limitado a 0–5 (campo "Outros" para o Mestre ajustar).
- Ataque acerta quando o total iguala ou passa a Defesa do alvo.
- Ciclo dos elementos: Fogo > Terra > Vento > Água > Fogo.
- Bestial: os modificadores valem só na Forma Bestial; assumir a forma custa 5 de Mana.
- Curandeiro: "8 de mana + 6 por nível" foi lido como 6 por nível de Feitiçaria.
- Estrategista/Inventor não aparece na tabela de iniciativa: fica depois do Tanker.
