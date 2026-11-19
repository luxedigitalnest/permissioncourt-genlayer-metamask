const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const CASE_ID = /^[a-zA-Z0-9_-]{1,96}$/;

export function normalizeCaseId(value) {
  if (typeof value !== 'string' || !CASE_ID.test(value)) {
    throw new Error('Invalid case ID: use 1-96 letters, digits, _ or -');
  }
  return value;
}

export function normalizeVerdict(value) {
  const verdict = typeof value === 'string' ? value.trim() : '';
  return ['ALLOW', 'DENY', 'UNCERTAIN'].includes(verdict) ? verdict : 'UNCERTAIN';
}

function safeText(label, value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 2000 || /[\r\n]/.test(value)) {
    throw new Error('Invalid ' + label);
  }
  return value.trim();
}

export function canonicalMandate({wallet, contract, caseId, mandate, action, nonce}) {
  if (!ADDRESS.test(wallet)) throw new Error('Invalid wallet');
  if (!ADDRESS.test(contract)) throw new Error('Invalid contract');
  normalizeCaseId(caseId);
  const m = safeText('mandate', mandate);
  const a = safeText('action', action);
  const n = safeText('nonce', nonce);
  if (n.length > 100) throw new Error('Invalid nonce');
  return [
    'PermissionCourt v1',
    'Domain: GenLayer Studionet 61999',
    'Contract: ' + contract,
    'Wallet: ' + wallet,
    'Case: ' + caseId,
    'Mandate: ' + m,
    'Action: ' + a,
    'Nonce: ' + n,
    'Purpose: evidence of a proposed action only; not a payment or delegation'
  ].join('\n');
}
