import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalMandate, normalizeCaseId, normalizeVerdict, assertWriteContext } from '../mandate.js';

const wallet = '0x1111111111111111111111111111111111111111';
const contract = '0x2222222222222222222222222222222222222222';

test('signed text binds wallet, contract, case, mandate, action and nonce', () => {
  const input = {wallet, contract, caseId:'CASE_0001', mandate:'Spend up to 20 USD', action:'Buy 50 USD', nonce:'1234567890'};
  const msg = canonicalMandate(input);
  assert.match(msg, /PermissionCourt v1/);
  assert.match(msg, /Contract: 0x2222/);
  assert.match(msg, /Wallet: 0x1111/);
  assert.match(msg, /Case: CASE_0001/);
  assert.match(msg, /Mandate: Spend up to 20 USD/);
  assert.match(msg, /Action: Buy 50 USD/);
  assert.match(msg, /Nonce: 1234567890/);
  assert.equal(msg, canonicalMandate(input));
});

test('case ID restricts characters and size', () => {
  assert.equal(normalizeCaseId('case-1_ABC'), 'case-1_ABC');
  assert.throws(() => normalizeCaseId('../case'), /Invalid case ID/);
  assert.throws(() => normalizeCaseId('a'.repeat(97)), /Invalid case ID/);
});

test('unexpected verdicts fail closed', () => {
  assert.equal(normalizeVerdict('ALLOW'), 'ALLOW');
  assert.equal(normalizeVerdict('DENY'), 'DENY');
  assert.equal(normalizeVerdict('UNCERTAIN'), 'UNCERTAIN');
  assert.equal(normalizeVerdict('ALLOW because'), 'UNCERTAIN');
  assert.equal(normalizeVerdict(''), 'UNCERTAIN');
});

test('rejects malformed wallet and empty mandate', () => {
  assert.throws(() => canonicalMandate({wallet:'hello', contract, caseId:'case-1', mandate:'Budget 20', action:'Buy', nonce:'abc'}), /Invalid wallet/);
  assert.throws(() => canonicalMandate({wallet, contract, caseId:'case-1', mandate:'', action:'Buy', nonce:'abc'}), /Invalid mandate/);
});
const snapshot = Object.freeze({wallet,contract,caseId:'CASE_0001',mandate:'Spend up to 20 USD',action:'Buy 50 USD'});
const context = {signed:snapshot,current:{...snapshot},account:wallet,chainId:'0xf22f'};
test('write context accepts exactly the captured Studionet case',()=>assert.equal(assertWriteContext(context),true));
test('contract change after signature is rejected',()=>assert.throws(()=>assertWriteContext({...context,current:{...snapshot,contract:wallet}}),/Case input changed/));
test('case id or signed text change is rejected',()=>{for(const change of [{caseId:'OTHER'},{mandate:'unlimited'},{action:'Different action'}])assert.throws(()=>assertWriteContext({...context,current:{...snapshot,...change}}),/Case input changed/);});
test('wallet change is rejected even if case input matches',()=>assert.throws(()=>assertWriteContext({...context,account:contract}),/Wallet account changed/));
test('unexpected chain id is rejected before write',()=>{for(const chainId of ['0x1','0x0',null])assert.throws(()=>assertWriteContext({...context,chainId}),/Studionet/);});
