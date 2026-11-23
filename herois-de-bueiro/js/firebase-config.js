// Login com Google (site próprio). Configuração do projeto Firebase "heroisdebueiro-dbd51".
// Não é segredo: quem protege os dados são as regras em firestore.rules (Console > Firestore > Regras).
// Na página publicada no claude.ai o Firebase não carrega (a página bloqueia sites de fora) e o app usa a conta claude.ai.
window.HB_FIREBASE = {
  apiKey: "AIzaSyB-0K0_nDysaF47Z3vKk21x4T0A_DXojXk",
  // No Netlify o login passa pelo próprio site (/__/auth, repassado ao Firebase pelo arquivo _redirects):
  // sem isso, o Chrome do celular perde o "estado inicial" do login ao voltar do Google.
  authDomain: /\.netlify\.app$/.test(location.hostname) ? location.host : "heroisdebueiro-dbd51.firebaseapp.com",
  projectId: "heroisdebueiro-dbd51",
  storageBucket: "heroisdebueiro-dbd51.firebasestorage.app",
  messagingSenderId: "824146013577",
  appId: "1:824146013577:web:0aa6d5c1e6baa640328558",
};

// App Check (proteção contra scripts e bots): cole aqui a CHAVE DO SITE do reCAPTCHA v3 e ative em
// Console do Firebase > App Check. Deixe null enquanto não configurar. Passo a passo em SEGURANCA.md.
window.HB_APPCHECK = null;
