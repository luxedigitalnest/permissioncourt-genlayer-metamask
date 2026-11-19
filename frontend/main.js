import './styles.css';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { recoverMessageAddress, stringToHex } from 'viem';
import { canonicalMandate, normalizeCaseId, normalizeVerdict } from './mandate.js';

const el = id => document.getElementById(id);
const contractField = el('contract');
const caseField = el('caseId');
const defaultAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x24f7F6135b894e79BcD504774f8742AfEe67A560';
if (defaultAddress) contractField.value = defaultAddress;
caseField.value = generateCaseId();
let account = '';
let writeClient;
const readClient = createClient({chain: studionet});

function generateCaseId() {
  return 'PC_' + Date.now() + '_' + crypto.randomUUID().slice(0, 8);
}
function log(line) {
  const now = new Date().toLocaleTimeString();
  el('log').textContent += '\n[' + now + '] ' + line;
  el('log').scrollTop = el('log').scrollHeight;
}
function status(state, title, subtitle='') {
  const container = el('verdict');
  container.className = 'verdict-display ' + state;
  container.querySelector('.verdict-symbol').textContent = state === 'allow' ? '✓' : state === 'deny' ? '×' : '?';
  container.querySelector('strong').textContent = title;
  container.querySelector('small').textContent = subtitle;
}
function bindBusy(id, fn) {
  el(id).addEventListener('click', async () => {
    const button = el(id);
    button.disabled = true;
    try { await fn(); }
    catch (error) { log('ERROR: ' + (error?.shortMessage || error?.message || String(error))); status('uncertain', 'ACTION NOT COMPLETED', 'Review the activity log'); }
    finally { button.disabled = false; }
  });
}
function caseInputs() {
  const address = contractField.value.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error('Enter a deployed GenLayer contract address');
  return {
    contract: address,
    caseId: normalizeCaseId(caseField.value.trim()),
    mandate: el('mandate').value.trim(),
    action: el('action').value.trim()
  };
}
async function connect() {
  if (!window.ethereum?.request) throw new Error('MetaMask not detected. Open this in a browser with MetaMask.');
  const accounts = await window.ethereum.request({ method:'eth_requestAccounts' });
  if (!accounts?.length) throw new Error('No wallet account authorized');
  account = accounts[0];
  writeClient = createClient({chain: studionet, account, provider: window.ethereum});
  await writeClient.connect('studionet');
  el('connect').textContent = account.slice(0,6) + '…' + account.slice(-4);
  log('MetaMask wallet connected: ' + account);
}

async function sendWrite(functionName, args, summary) {
  if (!writeClient) throw new Error('Connect MetaMask first');
  const address = caseInputs().contract;
  const write = {address, functionName, args};
  log('Preparing Studionet transaction for ' + functionName + '…');
  // Stable Studionet SDK v1.1.8 does not expose v2 fee-estimation helpers.
  if (!window.confirm(summary + '\n\nThis may require test GEN. MetaMask will display the signing details. Proceed?')) {
    throw new Error('User canceled before submitting a transaction');
  }
  const hash = await writeClient.writeContract({...write, value: 0n});
  log('Transaction submitted: ' + hash);
  status('uncertain', 'WAITING FOR CONSENSUS', 'Transaction ' + String(hash).slice(0,16) + '…');
  const receipt = await writeClient.waitForTransactionReceipt({hash, status:'FINALIZED'});
  if (receipt?.statusName !== 'FINALIZED' || receipt?.txExecutionResultName !== 'SUCCESS') {
    throw new Error('Transaction not finalized successfully: ' + (receipt?.statusName || 'unknown') + '/' + (receipt?.txExecutionResultName || 'unknown'));
  }
  log('Finalization verified for ' + hash);
  return hash;
}

async function submitCase() {
  if (!writeClient) await connect();
  const inputs = caseInputs();
  const nonce = crypto.randomUUID();
  const message = canonicalMandate({...inputs, wallet: account, nonce});
  log('Requesting a wallet signature (no asset transfer).');
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [stringToHex(message), account]
  });
  const recovered = await recoverMessageAddress({message, signature});
  if (recovered.toLowerCase() !== account.toLowerCase()) throw new Error('Signature verification failed');
  log('MetaMask signature recovered and matched the connected address.');
  await sendWrite(
    'open_case',
    [inputs.caseId, inputs.mandate, inputs.action, signature],
    'Store the signed mandate and proposed action on GenLayer Studionet?'
  );
  status('uncertain', 'CASE CREATED', 'Now request a validator ruling');
  log('Case ID: ' + inputs.caseId);
}

async function adjudicate() {
  if (!writeClient) await connect();
  const input = caseInputs();
  await sendWrite('adjudicate', [input.caseId],
    'Ask independent GenLayer validators whether the action follows the mandate?');
  await refreshVerdict();
}

async function refreshVerdict() {
  const input = caseInputs();
  const verdict = await readClient.readContract({
    address:input.contract, functionName:'get_verdict', args:[input.caseId]
  });
  if (!verdict) throw new Error('Case not found or not yet finalized');
  const normalized = normalizeVerdict(String(verdict));
  status(normalized === 'ALLOW' ? 'allow' : normalized === 'DENY' ? 'deny' : 'uncertain',
    normalized === 'ALLOW' ? 'WITHIN MANDATE' : normalized === 'DENY' ? 'OUTSIDE MANDATE' :
      verdict === 'OPEN' ? 'AWAITING JUDGMENT' : 'UNCERTAIN',
    'Reported by GenLayer contract • ' + input.caseId);
  log('Read contract verdict: ' + verdict);
}

bindBusy('connect', connect);
bindBusy('submit', submitCase);
bindBusy('judge', adjudicate);
bindBusy('refresh', refreshVerdict);
el('clear').addEventListener('click', () => {el('log').textContent = 'Activity cleared.';});
