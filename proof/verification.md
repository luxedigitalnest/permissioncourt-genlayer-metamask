# PermissionCourt — verification log (2026-11-19)

## Proven
- ✅ Source imports and deploys in GenLayer Studio with **Normal (Full Consensus)**.
- ✅ Studio sandbox contract: 0x24f7F6135b894e79BcD504774f8742AfEe67A560.
- ✅ Deploy tx 0x1388abe9ae30224d159a7161a80ed9878f2304d8b47ff4bf8c5341ace46fec76 FINALIZED.
- ✅ open_case tx 0x1bc71ecf6c0546875c62743772be6338660b292144cce16d79aca367a7c9949e FINALIZED.
- ✅ adjudicate tx 0x303683babe618bcfa17301865aa18f6cd9059b4f08dc792698004c49d564431d FINALIZED.
- ✅ GenLayer Studio contract read and Node genlayer-js SDK read returned DENY.
- ✅ Browser frontend read-only flow returned OUTSIDE MANDATE from GenLayer RPC.
- ✅ Frontend `npm test`: 4 tests passed; `npm run build`: success with Vite 7.3.8.

## Outstanding gates
- ⚠️ MetaMask authorization/signing path not yet independently completed. Browser's Connect flow has not returned.
- ⚠️ Python direct-mode tests 7/7 blocked by Windows SDK import `DecodingError: unexpected end of memory`; needs environment fix and retest. Studio actual deployment succeeds.
- ⚠️ No verified public hosting, polished 45-second video, or GenLayer Portal submission as of this log.
- ⚠️ Signature check is off-chain only; on-chain permission enforcement is by wallet transaction sender, not `personal_sign` verification.
