import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import fs from 'node:fs';
const env = await initializeTestEnvironment({ projectId: 'rpghub-teste', firestore: { rules: fs.readFileSync(process.argv[2], 'utf8'), host: '127.0.0.1', port: 8085 } });
const IMG = 'data:image/jpeg;base64,' + 'A'.repeat(60000);
await env.withSecurityRulesDisabled(async ctx => { const db = ctx.firestore();
  await setDoc(doc(db, 'campanhas/c1'), { nome: 'Mesa', sistema: 'sh', mestre: 'M', membros: ['J1', 'J2'], escudo: [], herois: ['hJ2'], combates: [], ganchos: [], rolagens: [], codigo: 'ABC123' });
  await setDoc(doc(db, 'herois/hJ1'), { nome: 'A', dono: 'J1', sistema: 'sh', mestres: ['M'] });
  await setDoc(doc(db, 'herois/hJ2'), { nome: 'B', dono: 'J2', sistema: 'sh', mestres: ['M'] });
  await setDoc(doc(db, 'herois/velha'), { nome: 'Sem dono' });
  await setDoc(doc(db, 'viloes/v1'), { nome: 'Hollow', dono: 'M', sistema: 'sh' }); });
const as = uid => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();
const C = (uid) => doc(as(uid), 'campanhas/c1');
let ok = 0, falhou = [];
async function t(nome, esperado, fn) { try { await (esperado ? assertSucceeds(fn()) : assertFails(fn())); ok++; } catch (e) { falhou.push(nome + ' → ' + (e.message || e).slice(0, 120)); } }
const reset = async () => env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), 'campanhas/c1'), { nome: 'Mesa', sistema: 'sh', mestre: 'M', membros: ['J1', 'J2'], escudo: [], herois: ['hJ2', 'hJ1'], combates: [], ganchos: [], rolagens: [], codigo: 'ABC123' }); });

// leitura
await t('sem login não lê', false, () => getDoc(doc(as(null), 'herois/hJ1')));
await t('logado lê', true, () => getDoc(doc(as('X'), 'herois/hJ1')));
// fichas
await t('cria a própria ficha', true, () => setDoc(doc(as('J1'), 'herois/novaJ1'), { nome: 'N', dono: 'J1', sistema: 'op2' }));
await t('cria ficha em nome de outro', false, () => setDoc(doc(as('J1'), 'herois/falsa'), { nome: 'N', dono: 'M' }));
await t('id malicioso', false, () => setDoc(doc(as('J1'), 'herois/x"onload=1'), { nome: 'N', dono: 'J1' }));
await t('sistema inventado', false, () => setDoc(doc(as('J1'), 'herois/s1'), { nome: 'N', dono: 'J1', sistema: 'hack' }));
await t('nome gigante', false, () => setDoc(doc(as('J1'), 'herois/s2'), { nome: 'x'.repeat(300), dono: 'J1' }));
await t('foto com link/script', false, () => setDoc(doc(as('J1'), 'herois/s3'), { nome: 'N', dono: 'J1', foto: 'javascript:alert(1)' }));
await t('foto válida', true, () => setDoc(doc(as('J1'), 'herois/s4'), { nome: 'N', dono: 'J1', foto: IMG }));
await t('foto gigante', false, () => setDoc(doc(as('J1'), 'herois/s5'), { nome: 'N', dono: 'J1', foto: 'data:image/jpeg;base64,' + 'A'.repeat(160000) }));
await t('edita a própria ficha', true, () => updateDoc(doc(as('J1'), 'herois/hJ1'), { nome: 'Novo' }));
await t('edita ficha alheia', false, () => updateDoc(doc(as('J1'), 'herois/hJ2'), { nome: 'Hack' }));
await t('troca o dono da própria ficha', false, () => updateDoc(doc(as('J1'), 'herois/hJ1'), { dono: 'J2' }));
await t('mestre edita ficha da campanha', true, () => updateDoc(doc(as('M'), 'herois/hJ2'), { pv: 3 }));
await t('mestre não rouba a ficha', false, () => updateDoc(doc(as('M'), 'herois/hJ2'), { dono: 'M' }));
await t('assume ficha sem dono', true, () => updateDoc(doc(as('J1'), 'herois/velha'), { dono: 'J1' }));
await t('apaga ficha alheia', false, () => deleteDoc(doc(as('J1'), 'herois/hJ2')));
await t('apaga a própria', true, () => deleteDoc(doc(as('J1'), 'herois/novaJ1')));
// ameaças
await t('edita ameaça alheia', false, () => updateDoc(doc(as('J1'), 'viloes/v1'), { nome: 'x' }));
await t('cria ameaça própria', true, () => setDoc(doc(as('J1'), 'viloes/vJ'), { nome: 'V', dono: 'J1', sistema: 'sh' }));
// perfis
await t('perfil próprio', true, () => setDoc(doc(as('J1'), 'perfis/J1'), { nome: 'Ana', foto: 'https://lh3.googleusercontent.com/a' }));
await t('perfil de outro', false, () => setDoc(doc(as('J1'), 'perfis/M'), { nome: 'Mestre Falso' }));
await t('perfil com campo extra', false, () => setDoc(doc(as('J1'), 'perfis/J1'), { nome: 'Ana', admin: true }));
// campanhas: jogador
await reset();
await t('jogador rola dado', true, () => updateDoc(C('J1'), { rolagens: [{ total: 7 }], atualizado: 1 }));
await t('jogador enche rolagens', false, () => updateDoc(C('J1'), { rolagens: Array(31).fill({ t: 1 }) }));
await t('jogador mexe no combate', false, () => updateDoc(C('J1'), { combates: [{ id: 'x' }] }));
await t('jogador vira mestre', false, () => updateDoc(C('J1'), { mestre: 'J1' }));
await t('jogador troca o código', false, () => updateDoc(C('J1'), { codigo: 'XXXXXX' }));
await t('jogador se dá o escudo', false, () => updateDoc(C('J1'), { escudo: ['J1'] }));
await t('jogador põe outra pessoa', false, () => updateDoc(C('J1'), { membros: ['J1', 'J2', 'J9'] }));
await t('jogador tira outro jogador', false, () => updateDoc(C('J1'), { membros: ['J1'] }));
await t('jogador tira herói alheio', false, () => updateDoc(C('J1'), { herois: ['hJ1'], ultimoHeroi: 'hJ2' }));
await t('jogador tira herói alheio dizendo que é o dele', false, () => updateDoc(C('J1'), { herois: ['hJ1'], ultimoHeroi: 'hJ1' }));
await t('jogador tira o próprio herói', true, () => updateDoc(C('J1'), { herois: ['hJ2'], ultimoHeroi: 'hJ1' }));
await t('jogador adiciona herói', true, () => updateDoc(C('J1'), { herois: ['hJ2', 'hJ1'] }));
await t('estranho entra sozinho', true, () => updateDoc(C('X'), { membros: ['J1', 'J2', 'X'], atualizado: 2 }));
await t('estranho entra com amigo', false, () => updateDoc(C('Y'), { membros: ['J1', 'J2', 'X', 'Y', 'Z'] }));
await t('não-membro rola dado', false, () => updateDoc(C('Y'), { rolagens: [] , atualizado: 9 }));
await t('jogador sai', true, () => updateDoc(C('X'), { membros: ['J1', 'J2'] }));
await t('jogador apaga campanha', false, () => deleteDoc(C('J1')));
// escudo
await reset();
await t('mestre passa escudo', true, () => updateDoc(C('M'), { escudo: ['J1'] }));
await t('escudo mexe no combate', true, () => updateDoc(C('J1'), { combates: [{ id: 'cb' }], atualizado: 3 }));
await t('escudo passa escudo para outro', false, () => updateDoc(C('J1'), { escudo: ['J1', 'J2'] }));
await t('escudo tira jogador', false, () => updateDoc(C('J1'), { membros: ['J1'] }));
await t('escudo vira mestre', false, () => updateDoc(C('J1'), { mestre: 'J1' }));
await t('escudo devolve o escudo', true, () => updateDoc(C('J1'), { escudo: [] }));
// mestre
await t('mestre capa maliciosa', false, () => updateDoc(C('M'), { capa: "x') ; background:red" }));
await t('mestre capa válida', true, () => updateDoc(C('M'), { capa: IMG }));
await t('mestre passa cargo para estranho', false, () => updateDoc(C('M'), { mestre: 'NINGUEM' }));
await t('mestre passa cargo para jogador', true, () => updateDoc(C('M'), { mestre: 'J1' }));
await t('ex-mestre não manda mais', false, () => updateDoc(C('M'), { nome: 'Minha de novo' }));
await t('cria campanha com escudo pré-dado', false, () => setDoc(doc(as('J2'), 'campanhas/c2'), { nome: 'C', mestre: 'J2', escudo: ['J3'] }));
await t('cria campanha própria', true, () => setDoc(doc(as('J2'), 'campanhas/c3'), { nome: 'C', mestre: 'J2', membros: [], escudo: [], sistema: 'op2' }));
await t('cria campanha para outro mestre', false, () => setDoc(doc(as('J2'), 'campanhas/c4'), { nome: 'C', mestre: 'M' }));
// admin
await t('admin restaura qualquer coisa', true, () => setDoc(doc(as('sjq4f37miIZHMhRo7kc8JIzSQgB3'), 'herois/hJ2'), { nome: 'Restaurado', dono: 'J2' }));
console.log(`${ok} ok, ${falhou.length} falharam`); falhou.forEach(f => console.log(' ✗ ' + f));
await env.cleanup(); process.exit(0);
