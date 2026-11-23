# Testes das regras do Firestore

Bateria de ataques e usos normais contra `../firestore.rules`, no emulador do Firebase (precisa de Java).

```bash
cd herois-de-bueiro/testes
npm i firebase-tools@13.29.1 @firebase/rules-unit-testing@3.0.4 firebase@10.12.2
npx firebase setup:emulators:firestore
java -jar ~/.cache/firebase/emulators/cloud-firestore-emulator-v1.19.8.jar --host 127.0.0.1 --port 8085 &
node regras-firestore.test.mjs ../firestore.rules
```
Resultado esperado: todos "ok", nenhum "falharam". Rode sempre que mudar as regras.
