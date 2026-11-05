# Frontend changes

Modified files:

1. `src/redux/reducer/casinoSlice.js`
   - Casino betting data now calls `GET /casino/data?type=<game>` so the backend snapshot-saving handler is invoked.
   - Keeps the provider payload shape expected by the casino page.

2. `src/context/CasinoContext.jsx`
   - Resolves the provider's real `sub[].sid` from the selected market name.
   - Stores the selected MID at the moment the user opens the bet slip.
   - Sends mobile bets through the same `/casino/:slug/bet` Redux thunk as desktop.
   - Checks the selected provider market status instead of treating one suspended sub-market as suspending every market.
   - Maps Lucky7 UI label `Exact 7` to provider market `Card 7`.

3. `src/pages/CasinoBet/casinoBet.jsx`
   - Uses real provider `sub` markets instead of replacing them with mock markets.
   - Does not clear an already-open bet slip merely because the live MID rolls over.
   - Does not let the new MID's market status cancel a slip captured against a previous MID.

4. `src/components/betting/DesktopBetSlip.jsx`
   - Requires a provider selection SID and sends that SID in the bet request.

5. `src/components/betting/MobileBetDrawer.jsx`
   - Disables submit when round, selection, or stake is missing.

## API contract expected by this frontend

- Data: `GET /casino/data?type=lucky7`
- Bet: `POST /casino/lucky7/bet`
- Bet JSON: `{ "roundId": "<provider MID>", "side": "back", "selection": "<provider sid>", "odds": 2, "stake": 100 }`

The frontend API client adds `/api` in production unless `VITE_IS_LOCAL=true`, so the backend route should be mounted under the matching `/api` prefix.

## Important limitations / verification

- `.env` is intentionally not included in this ZIP to avoid redistributing secrets. Keep your existing environment file.
- The archive was checked for syntax in all modified JSX files and `node --check` passed for changed plain JS modules. A full Vite production build was not run because dependencies were not installed in this environment.
- The frontend now preserves a bet slip opened before a MID rollover. It does not yet provide a historical-round browser to open a brand-new bet slip on any arbitrary older MID. That requires a backend endpoint to fetch saved round snapshots and a trusted provider status signal.
- Provider status and odds must be verified server-side. A saved snapshot alone does not prove that an old round is still accepting bets. Suspended/closed markets must remain blocked.
