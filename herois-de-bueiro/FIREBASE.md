# Login com Google (site próprio)

A página publicada no claude.ai já usa a conta claude.ai de cada pessoa. Para ter **"Entrar com Google"**
num site seu (como o C.R.I.S.), o app usa o Firebase (grátis no plano Spark). Uns 15 minutos:

1. Entre em https://console.firebase.google.com e crie um projeto (ex.: `herois-de-bueiro`).
2. **Authentication > Começar > Método de login**: ative **Google** e **E-mail/senha**.
3. **Firestore Database > Criar banco** (modo produção, região `southamerica-east1`).
4. **Firestore > Regras**: cole o conteúdo de `firestore.rules` e publique.
5. **Configurações do projeto > Seus apps > Web (`</>`)**: registre o app e copie o objeto `firebaseConfig`.
6. Cole esse objeto em `js/firebase-config.js`, no lugar de `null`:
   ```js
   window.HB_FIREBASE = { apiKey: "...", authDomain: "...", projectId: "...", appId: "..." };
   ```
   (Essa configuração não é segredo: quem protege os dados são as regras do passo 4.)
7. Hospede a pasta `herois-de-bueiro/` (Firebase Hosting, GitHub Pages, Netlify…).
8. **Authentication > Configurações > Domínios autorizados**: adicione o domínio do site.

Pronto: a tela de entrada passa a mostrar "Entrar com Google" e o formulário de e-mail/senha, e cada
pessoa vê os próprios heróis e as campanhas de que participa.

## Quem pode o quê
| | Dono do herói | Mestre | Jogador com escudo | Jogador |
|---|---|---|---|---|
| Editar a própria ficha | ✓ | ✓ | ✓ | ✓ |
| Editar fichas dos heróis da campanha | | ✓ | ✓ | |
| Abrir o Escudo do Mestre (combate, ganchos, anotações) | | ✓ | ✓ | |
| Passar/retirar o escudo, passar o cargo de mestre, remover jogador | | ✓ | | |
| Entrar com código, adicionar o próprio herói, rolar | ✓ | ✓ | ✓ | ✓ |

## Login no celular ("falta do estado inicial")
No Netlify o login passa pelo próprio site: `_redirects` repassa `/__/auth/*` para o Firebase e
`js/firebase-config.js` usa o domínio do site como `authDomain`. Para isso funcionar, uma vez:
Google Cloud Console › APIs e serviços › Credenciais › **IDs do cliente OAuth 2.0** › "Web client (auto created by Google Service)":
- **Origens JavaScript autorizadas**: `https://rpghub.netlify.app`
- **URIs de redirecionamento autorizados**: `https://rpghub.netlify.app/__/auth/handler`

Se trocar o nome do site no Netlify, repita com o endereço novo (e em Authentication › Domínios autorizados).
