# PermissionCourt

**Internet Court Partner Demo Lab — MetaMask × GenLayer × Internet Court**

PermissionCourt is an experimental Intelligent Contract and browser application that records an AI agent mandate, a proposed action, and a wallet signature, then asks independent GenLayer validators to judge whether the proposed action complies with the mandate.

**Status (2026-11-19):** GenLayer **Studio sandbox** contract deployed and live validator-consensus case finalized as **DENY**. The Vite frontend builds and reads live contract verdicts. A fully authenticated MetaMask browser-to-GenLayer write has **not yet** been independently demonstrated. This repository is an honest engineering demonstration, not a production security or payment product.

## Live evidence

- Contract: [0x24f7F6135b894e79BcD504774f8742AfEe67A560](https://explorer-studio.genlayer.com/address/0x24f7F6135b894e79BcD504774f8742AfEe67A560)
- Deploy: [0x1388abe9...46fec76](https://explorer-studio.genlayer.com/tx/0x1388abe9ae30224d159a7161a80ed9878f2304d8b47ff4bf8c5341ace46fec76) — **FINALIZED**
- Open case: [0x1bc71ecf...c9949e](https://explorer-studio.genlayer.com/tx/0x1bc71ecf6c0546875c62743772be6338660b292144cce16d79aca367a7c9949e) — **FINALIZED**
- Adjudicate: [0x303683ba...564431d](https://explorer-studio.genlayer.com/tx/0x303683babe618bcfa17301865aa18f6cd9059b4f08dc792698004c49d564431d) — **FINALIZED**
- Read `get_verdict('PC_DEMO_20261119_001')` → `DENY` using both Studio and genlayer-js RPC.
- Demonstration inputs: mandate permits **one-off report costing no more than $20, no subscriptions**; action requests **$49 plus monthly recurring subscription**.
- The Studio case deliberately uses `STUDIO_TEST_PLACEHOLDER_NOT_AN_AUTHENTIC_WALLET_SIGNATURE` to separate the consensus test from an unverified MetaMask signature.

## Architecture and meaningful partner integration

1. **MetaMask:** wallet requests accounts, signs a canonical message binding its address, GenLayer contract, unique case ID, mandate, action and nonce using `personal_sign`. Browser recovers the signer using `viem` before submission.
2. **GenLayer:** `PermissionCourt.py` stores the submitted evidence and binds authorization to `gl.message.sender_address`. Only the case creator may request adjudication; IDs cannot be overwritten.
3. **GenLayer validator consensus:** every validator independently re-runs a semantic classification of the submitted mandate and action. A custom equivalence validator compares the normalized outcomes. Invalid model responses become `UNCERTAIN` (but model nondeterminism can still produce a consensus disagreement).
4. **UI:** a three-stage workflow signs, submits, requests adjudication, waits for finalization and reads the state back from RPC. Verdicts are `ALLOW`, `DENY`, or `UNCERTAIN`.

## Run frontend locally

Requirements: Node.js 20+; MetaMask browser extension for writes. Read-only verdicts work without a wallet.

```bash
cd frontend
npm install
npm test
npm run build
npm run dev
```

Open `http://127.0.0.1:5173/`. The default address is the **Studio sandbox** contract above. You can override it with a `frontend/.env.local` file:

```
VITE_CONTRACT_ADDRESS=0x24f7F6135b894e79BcD504774f8742AfEe67A560
```

For the read-only reproducible proof: paste case ID `PC_DEMO_20261119_001`, then select **3. Read finalized verdict**. It queries GenLayer Studio RPC, not an invented frontend result.

## Contracts and tests

- `contracts/PermissionCourt.py`: pinned GenLayer SDK v0.2.16 Intelligent Contract.
- `tests/test_permission_court.py`: 7 direct-mode contract test cases covering creation, duplicate protection, owner control, absent case, DENY, invalid model outputs, and oversized input.
- `frontend/test/mandate.test.js`: 4 passing tests for canonical signature text, unique ID constraints, model verdict parsing, and input rejection.
- Direct-mode Python pytest currently **cannot pass on the Windows GenVM 0.3.0-rc7 test runner** due to `genlayer.calldata.DecodingError: unexpected end of memory` during import before test logic. This is disclosed rather than represented as a pass. Full-consensus Studio deployment + live transaction + read are verified separately.

## Safeguards / limitations

- No live money movement, escrow, or actual delegation control.
- Signature is verified client-side and stored as case evidence, but the contract does **not** cryptographically verify its contents onchain. **Do not** use as a production authorisation gateway. Blockchain transaction sender is checked to ensure only that wallet may mutate the case.
- Studio sandbox is not a mainnet deployment and its test GEN is not cash.
- A successful *semantic* verdict requires leader/validator consensus; that result can vary with model responses. Inputs are untrusted evidence and are explicitly separated in the prompt.
- Wallet connection, account authorization, signing and any transaction fees require the owner to review MetaMask prompts.
- This project makes no claim of token allocation, airdrop eligibility, income, or guaranteed builder reward.

## Reproducing the Studio test

1. Open [GenLayer Studio](https://studio.genlayer.com/contracts) and import `contracts/PermissionCourt.py`.
2. Choose **Normal (Full Consensus)** and deploy in the sandbox.
3. `open_case` with the stated test ID/mandate/action and a clearly labeled placeholder signature for the sandbox-only consensus test.
4. `adjudicate` with the case ID and wait until **FINALIZED**.
5. `get_verdict` should read `DENY`; check the real transaction and validator votes in Explorer.

## Mission

[Internet Court Partner Demo Lab](https://portal.genlayer.foundation/mission/101), deadline November 23, 2026. Submission requires public code and a polished **45-second max** video bearing **Internet Court, GenLayer and MetaMask** logos. The video and final submission must represent only evidence actually tested.
