# Segurança do RPGHUB

O site é só a interface: quem decide o que cada conta pode fazer são as **regras do Firestore**, que valem
até para quem tenta mexer pelo console do navegador ou com scripts próprios.

## O que já está no código
| Camada | Protege contra |
|---|---|
| Regras do Firestore (`firestore.rules`) | Ler sem login; editar/apagar ficha, ameaça ou campanha alheia; trocar o dono; virar mestre; se dar o escudo; pôr ou tirar outras pessoas; tirar heróis alheios; dados gigantes; imagens com texto malicioso; códigos (ids) forjados. |
| Testes das regras (`testes/`) | 55 casos (usos normais e ataques) rodados no emulador do Firebase. |
| Cabeçalhos do Netlify (`_headers`, gerado junto com o site) | Scripts injetados (só rodam os scripts do site, conferidos por hash); o site aberto dentro de outro (clickjacking); HTTP sem criptografia; acesso a câmera, microfone e localização. |
| Interface | Textos e imagens sempre escapados; fotos só como imagem; campos com limite de tamanho; documentos fora do padrão ignorados. |
| App Check (pronto, desligado) | Scripts e bots usando o seu Firebase fora do site. |

## Passos no console (faça uma vez)

### 1. Publicar as regras novas — obrigatório
Firebase › Firestore Database › **Regras** › apague tudo, cole o conteúdo de `firestore.rules` › **Publicar**.

### 2. Proteja a sua conta Google — o mais importante
A sua conta é dona do Firebase, do Netlify (se entra com Google) e do GitHub. Ative a **verificação em duas etapas**
em https://myaccount.google.com/security. Faça o mesmo no GitHub e no Netlify.

### 3. Restringir a chave da API ao seu site
Google Cloud Console (https://console.cloud.google.com, projeto heroisdebueiro-dbd51) › APIs e serviços › **Credenciais**
› clique na chave "Browser key (auto created by Firebase)":
- **Restrições de aplicativo**: Sites › adicione `https://rpghub.netlify.app/*`, `https://heroisdebueiro-dbd51.firebaseapp.com/*` e `http://localhost/*`.
- Salve. A chave copiada para outro site deixa de funcionar.

### 4. Login mais forte
Firebase › Authentication › **Configurações**:
- **Política de senha**: exigir mínimo de 8 caracteres, com letras e números.
- **Proteção contra enumeração de e-mail**: ativar (impede descobrir quais e-mails têm conta).
- Se todo mundo usa Google, dá para desligar o "E-mail/senha" em Método de login.

### 5. App Check (recomendado depois de tudo funcionando)
1. Crie uma chave reCAPTCHA v3 em https://www.google.com/recaptcha/admin com o domínio `rpghub.netlify.app`.
2. Firebase › **App Check** › registre o app web com o reCAPTCHA v3 (cole a chave secreta).
3. Mande a **chave do site** para colocar em `js/firebase-config.js` (`window.HB_APPCHECK`) e gerar o site de novo.
4. Deixe alguns dias só monitorando (App Check › Métricas). Quando quase tudo estiver "verificado", clique em
   **Aplicar** para Firestore e Authentication.

## Limites conhecidos
- Quem está logado consegue ler as fichas e campanhas do banco (o site mostra só as suas). Restringir a leitura
  exige mudar como o site baixa os dados e migrar as fichas existentes.
- Rolagens secretas são escondidas pela interface, não pelo banco.
- Sair da campanha não tira as suas fichas dela (o mestre tira); as regras só deixam o jogador tirar uma ficha por vez.
