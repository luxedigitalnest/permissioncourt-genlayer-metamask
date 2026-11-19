# PermissionCourt — Internet Court Partner Demo Lab Design
**Date:** 2026-11-19
**Goal:** Demonstrate a real MetaMask + GenLayer dispute-adjudication workflow, not a simulated AI verdict.
**Mission:** https://portal.genlayer.foundation/mission/101 (deadline 2026-11-23).
**Partner:** MetaMask (an Internet Court founding member).
**Users:** Agent owners evaluating whether a proposed agent action follows a wallet-signed mandate.
**Outcome:** Wallet-signed mandate, on-chain case record, independently validated GenLayer semantic decision, readable proof, repeatable example, <=45s demo.
**Approach:** Minimal static browser UI with MetaMask EIP-1193 and genlayer-js, Python GenLayer Intelligent Contract, pytest direct-mode tests, optional hosted Studio deployment. No backend or paid API.
**Why this approach:** wallet-specific agent authorization + semantic consensus are meaningful to both protocols, no live value transfers needed.
**Alternatives considered:** x402 payments require a funded payment rail and settlement; AntSeed inference may require credits. MetaMask testnet signatures are free and testable.
**Contract:** open_case(case_id, mandate, proposed_action, signature); adjudicate(case_id); get_mandate/get_action/get_verdict/get_owner/get_signature. Only case creator can initiate adjudication. GenLayer validator independently re-runs the same semantic classification and compares a bounded verdict.
**UI:** Browser connects MetaMask, signs canonical text, verifies recovered address before chain submission, connects genlayer-js to Studionet, estimates fees, writes contract, waits for finalization, reads decision.
**Constraints:** no real transfers, no revocation of live delegations, no guarantee a signature is checked cryptographically inside GenVM, no reward/airdrop promises, avoid misleading security claims. Treat the demo as a validation prototype, not a production permissions gateway. Disclose fee and signature before confirming.
**QA:** prove direct tests, linter, build, chain transaction and independently read final verdict. Deliver code URL, transaction and playable video only when actually verified.
