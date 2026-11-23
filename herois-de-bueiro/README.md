# Heróis de Bueiro — fichas e mesa

App de fichas para o sistema **Heróis de Bueiro** (playtest completo), no molde de um gerenciador de campanhas de RPG: heróis, campanhas com mesa do mestre, combate com iniciativa, vilões e regras.

## Como abrir
- **Publicado (claude.ai)**: fichas e campanhas ficam numa base compartilhada; quem tem acesso de edição à página vê e altera os mesmos dados.
- **Local**: `cd herois-de-bueiro && python3 -m http.server 8765` e abra `http://localhost:8765`. Os dados ficam no navegador; use **Backup** para copiar/importar.

## Arquivos
| Arquivo | O que tem |
|---|---|
| `js/regras.js` | Todos os números do sistema: níveis de dado, maestrias, classes, origens, elementos, reputação e os cálculos da ficha (`derivados`). |
| `js/dados.js` | Rolagens: teste (1d10 + dado do nível), ataque (1d10 + maestria), dano (dado do atributo + maestria), rolagem livre. |
| `js/store.js` | Salvamento: base compartilhada (`claude.use('db')`) ou localStorage. |
| `js/ui.js` | Janelas, avisos, barras de vida/mana, cartões de resultado, foto. |
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
