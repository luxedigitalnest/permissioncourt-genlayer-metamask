# PermissionCourt Implementation Plan
> For agentic workers: Use superpowers:executing-plans and superpowers:test-driven-development task by task.

**Goal:** Produce a reproducible MetaMask plus GenLayer Internet Court partner demo.
**Architecture:** Python GenLayer case contract with consensus verdict and a Vite + viem + genlayer-js browser frontend.
**Tech Stack:** Python 3.12, genlayer-test, genvm-linter, Node 22, Vite, viem, genlayer-js.
**Spec:** docs/superpowers/specs/2026-11-19-permissioncourt-design.md

## Global Constraints
- No financial settlement, real spend or delegation revocation.
- Only claim deployments/test success supported by logs and tx IDs.
- No private keys in source; MetaMask signs through the user-facing provider.
- One isolated project directory/branch.

## Review Focus
- Unauthorized case writes and replay IDs.
- Invalid enum and prompting attacks.
- Amount/budget mismatch classification.
- User rejects wallet signature.
- Chain transaction pending or rejected; never claim finalization early.

### Task 1: GenLayer contract
- Create: contracts/PermissionCourt.py
- Test: tests/test_permission_court.py
- [ ] Write direct fixture tests first: creation, duplicate, missing, access control, mock verdict, malformed verdict.
- [ ] Observe test failure for missing contract.
- [ ] Implement smallest compatible GenLayer contract.
- [ ] Run direct tests and genvm-lint.

### Task 2: Web client
- Create: frontend/index.html, frontend/main.js, frontend/package.json, frontend/styles.css, frontend/test/format.test.js, frontend/mandate.js
- [ ] Write failing tests for canonical mandate and case normalization.
- [ ] Implement verified EIP-1193 signature + GenLayerJS write/read workflow.
- [ ] Verify npm test and build.

### Task 3: Release evidence
- Create: README.md, DEMO_SCRIPT.md, proof/verification.md
- [ ] Verify docs against actual tests.
- [ ] Deploy to hosted Studionet using a funded test account if possible.
- [ ] Confirm transaction receipt and independent read.
- [ ] Screen record polished 45-second demo with 3 logos and honest real evidence.
- [ ] Publish public GitHub repo and submit mission only after requirements met.

