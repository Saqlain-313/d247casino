# Focused Verification Roadmap — Sports, ISCC & Casinos (D247 Parity)

Abhi ka focus **sirf core gameplay, screens, bet buttons (Desktop + Mobile), aur betting/P&L/payout logic** par hai:

- **Cricket** + uske sabhi **`iscc` variants** (`iscc` 0, 1, 2, 3, 4)
- **Football, Tennis, Horse Racing**
- **Casinos** (game screen, video/virtual cards, bet buttons, bet slips, aur sabhi casino game tables + payouts)

> **Mandatory D247 Parity Rule:** Har chunk ka **Desktop UI**, **Mobile UI**, **Game Screen**, **Bet Buttons**, **DOM/CSS classes**, **Suspension**, aur **Betting / Exposure / P&L / Payout logic** seedha **D247 reference chunks & snapshots** se cross-verify kiya jayega.
>
> **Live D247 Login Fallback Rule:** Agar kisi game screen, market type, bet button, ya mobile/desktop state ka reference local `d247-refrences/`, `Casino/d247-vs/`, ya `screenshots/ref/` me **na mile**, toh **live D247 site par login karke** directly browser se uska live DOM, JS chunk, CSS, aur screenshot le kar verify & match karna hai.

---

## D247 Reference Sources Map

| Reference Path                                                                                                                    | Kya Cross-Verify Karna Hai                                                                                                                |
| :-------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `/Users/ansarhusain/Documents/Reddy-777/d247-refrences/718060578.devtools`, `776178602-new.devtools`, `805012347.devtools`        | Sports markets (`market-4`, `market-6`, `market-8`, `market-9`, `market-13`, `market-17`), Back/Lay buttons, Cashout, `gscode` suspension |
| `/Users/ansarhusain/Documents/Reddy-777/d247-refrences/index.js.devtools`, `refrence.js`, `socre-refrence.js`, `newplayer.min.js` | Bet Slip Desktop/Mobile, Live TV player, Scorecards, P&L / Cashout formulas                                                               |
| `/Users/ansarhusain/Documents/Reddy-777/d247-refrences/cricket-events.js`, `soccer-events.js`, `tennis-events.js`                 | Event schemas, `iscc` flags, `sno` odds ordering & listing parity                                                                         |
| `/Users/ansarhusain/Documents/Reddy-777/Casino/d247-vs/<slug>/`                                                                   | Per-game scraped D247 casino DOM, bet button layout, CSS classes, rules HTML (`96+` slugs)                                                |
| `/Users/ansarhusain/Documents/Reddy-777/Casino/d247-casino-react/`                                                                | D247 reference React casino screens (`FlipCard`, virtual felt, roulette, bet slips)                                                       |
| `/Users/ansarhusain/Documents/Reddy-777/screenshots/ref/*.png` & `audit_93.json`                                                  | Visual side-by-side reference screenshots for casino screens & tables                                                                     |
| `/Users/ansarhusain/Documents/Reddy-777/d247casino/client/public/assets/css/`                                                     | Reference CSS contracts (`style.css`, `responsive.css`, `theme.css`, `custom.css`, `flipclock.css`)                                       |

---

## Active Progress Tracker (10 Focused Chunks)

|    Chunk     | Sector                                                                                            |                  Status                  |
| :----------: | :------------------------------------------------------------------------------------------------ | :--------------------------------------: |
| **Chunk 1**  | Cricket Standard (`iscc = 0`) — All Markets, Bet Buttons, Bet Slip & P&L/Payouts                  | `[x] Verified (Code + Live HTTP/WS/PnL)` |
| **Chunk 2**  | Cricket `iscc` Variants (`iscc` 1 / 2 / 3 / 4) — CricketV, Virtual Cricket, Super Over, E-Cricket | `[x] Verified (Code + Live HTTP/WS/PnL)` |
| **Chunk 3**  | Football — Match Odds, Over/Under (`0.5–3.5`), Other Markets, Screen & Payouts                    |  `[x] Verified (Code + Live HTTP/PnL)`   |
| **Chunk 4**  | Tennis — Match Odds, Tournament Winner, Set/Game Markets, Screen & Payouts                        |  `[x] Verified (Code + Live HTTP/PnL)`   |
| **Chunk 5**  | Horse Racing — Race Card, Silks, Multi-Runner Bet Buttons, Exposure & Payouts                     |  `[x] Verified (Code + Live HTTP/PnL)`   |
| **Chunk 6**  | Casino Core — Game Screen, Video/Virtual Cards, Bet Slips (Desktop + Mobile) & Engine             |              `[ ] Pending`               |
| **Chunk 7**  | Casino Tables: Teenpatti, Poison, Joker & Trio (`26` slugs)                                       |              `[ ] Pending`               |
| **Chunk 8**  | Casino Tables: Dragon Tiger, Baccarat, Poker & Card Games (`21` slugs)                            |              `[ ] Pending`               |
| **Chunk 9**  | Casino Tables: Lucky, AAA, Bollywood, Mogambo, Lottery & Andar Bahar (`16` slugs)                 |              `[ ] Pending`               |
| **Chunk 10** | Casino Tables: Dice, Sports Casino, Races, Roulette, Matka (Worli), Goal2 & Virtual (`26` slugs)  |              `[ ] Pending`               |

---

## PART A — CRICKET & ALL `iscc` VARIANTS

### Chunk 1 — Cricket Standard (`iscc = 0`): All Markets, Bet Buttons, Bet Slip & P&L/Payouts

**Route:** `/cricket-bet/:id` (plus `/game-detail/4/:id`)

**D247 Reference:** `776178602-new.devtools`, `805012347.devtools`, `socre-refrence.js`, `index.js.devtools` (or live D247 login fallback)

**Frontend Files:**

- `client/src/pages/gamedetails/CricketBet.jsx`, `components/SportDetailLayout.jsx`, `hooks/useSportBettingLifecycle.js`
- `client/src/pages/gamedetails/MatchOdds.jsx`, `Bookmaker.jsx`, `TiedMatch.jsx`, `Normal.jsx`, `Fancy1.jsx`, `OddEven.jsx`, `Khado.jsx`, `CricketMarket.jsx`
- `client/src/pages/gamedetails/components/FancyTwoColumnTable.jsx`, `TeamOutcomeLabels.jsx`, `PlaceBet.jsx`, `MatchedBet.jsx`, `LiveScoreCard.jsx`
- `client/src/pages/gamedetails/utils/marketNetOutcome.js`, `marketHelpers.js`, `client/src/utils/suspension.js`

**Backend Paired Files:**

- `backend/controllers/betController.js`, `cashoutController.js`, `cricketController.js`
- `backend/utils/marketCalculationUtils.js`, `exposureUtils.js`, `marketValidation.js`
- `backend/services/sportsSettlementService.js`, `fancyBetSettlementService.js`

**Verify Checklist:**

- [x] **Desktop UI & Bet Buttons (`1440×900`):** 3+3 Back/Lay depth (`MatchOdds`, `Bookmaker`, `TiedMatch`), 2-col Fancy grid (`Normal`, `Fancy1`, `OddEven`), Back-only `Khado`, `CricketMarket` dynamic widths (100% / 50% / 33%), sub-tabs (`ALL`, `Fancy`, `Line`, `Ball by Ball`, `Meter`, `Khado`), Live Score iframe (`/score-iframe/4_<gmid>`) + TV iframe toggle, sticky right-hand `PlaceBet` + `MatchedBet` _(code/CSS parity verified vs D247 `style.css` + `refrence.js`; live Chrome screenshot pending `chrome_devtools` connection)_.
- [x] **Mobile UI & Bet Buttons (`390×844`):** `ODDS` / `MATCHED BET` / `TV` tabs, compact Back/Lay button taps, D247 `#373636d6` + red bold `SUSPENDED` / `BALL RUNNING` `SuspendedOverlay` across all markets, top `PlaceBet` modal + stake buttons, zero horizontal overflow _(code/CSS verified; live Chrome screenshot pending `chrome_devtools` connection)_.
- [x] **Betting Logic, Exposure, P&L & Payouts:**
  - [x] Decimal (`MatchOdds`, `TiedMatch`) vs Bhav (`/100` `Bookmaker`) profit/liability math & live `TeamOutcomeLabels` projection (`17/17` E2E PnL + `11/11` unit + `201/201` Vitest).
  - [x] 2-runner vs 3-runner (`Test Match` Draw) `__OTHER__` exposure + Cashout equalization.
  - [x] `Normal` / `Meter` / `line` / `ball` multi-zone exposure (`scoreOffset`/`oddsOffset`), `Fancy1` Yes/No, `OddEven` synthetic Odd/Even offset, `Khado` range payout, `CricketCasino` (`dtype=9`) 10-runner back-only exposure & payout.
  - [x] Suspension (`gstatus`/`gscode != 1`) blocked on UI + backend; fixed `placeFancyBet` 502 on external `bet-incoming` 404; live HTTP E2E `7/7` passed (`MATCH_ODDS`, `Bookmaker`, `Normal`, `OddEven`, `CricketCasino` open, `iscc=1` suspended reject, `iscc=2` fancy).

---

### Chunk 2 — Cricket `iscc` Variants (`iscc` 1 / 2 / 3 / 4)

**Routes:**

- `iscc = 1`: `/cricketv/:id` (Cricket Casino)
- `iscc = 2`: `/virtual-cricket/:id` (Virtual Cricket)
- `iscc = 3`: `/superover/:id` (Super Over)
- `iscc = 4`: `/e-games/:id` (E-Cricket)

**D247 Reference:** `d247-refrences/776178602-new.devtools`, `Casino/d247-casino-react/` (`FlipCard`, `.casino-header`, `.scorecard-bb`), `Casino/d247-vs/superover/`, `Casino/d247-vs/cricketv3/` (or live D247 login fallback)

**Frontend Files:**

- `client/src/utils/cricketRoute.js`, `client/src/components/IsccIcon.jsx`
- `client/src/pages/gamedetails/CricketBet.jsx`, `CricketCasinoLive.jsx`, `CricketCard.jsx`, `FlipClock.jsx`, `RulesModal.jsx`
- `client/src/pages/gamedetails/ECricketBet.jsx`, `ScorecardBB.jsx`, `CricketMarket.jsx`

**Backend Paired Files:**

- `backend/services/cricketCasinoCache.js`, `backend/controllers/cricketController.js`, `backend/socket/bettingSocket.js`, `backend/services/liveScoreFeed.js`, `backend/services/matchApi/providerA.js`

**Verify Checklist:**

- [x] **Listing & Routing Parity:** `IsccIcon` + click routing for `iscc` 1, 2, 3, 4 matches D247 exact routes & labels; removed unused dummy array from `Home/Cricket.jsx` & cleaned mobile/desktop truncation.
- [x] **Game Screen (Desktop & Mobile):**
  - [x] `iscc` 1 & 3 (`CricketCasinoLive`): Authentic D247 3D split-flap `FlipClock` (`flipclock.css` `ul.flip.play`, `.urgent` red glow at `<=4s`, smooth 1s local tick synced to 450ms WS `lt`), true 3D `CricketCard` reveal flip (`key={j}` stable slot + retained `lastRevealed`), Live TV `<iframe>`, JSON LiveScoreCard via `/diamond/score/4_<gmid>`, `.casino-header` + `Rules` modal, D247 `#373636d6` `SuspendedOverlay`.
  - [x] `iscc` 2 (`Virtual Cricket`): Live TV `<iframe>`, JSON LiveScoreCard via `/diamond/score/4_<gmid>` WS push, live odds/markets, `.casino-header` + `Rules`.
  - [x] `iscc` 4 (`ECricketBet`): `ScorecardBB` scoreboard via `/diamond/score/4_<gmid>`, video player iframe, mobile tabs (`ODDS` / `MATCHED BET`, NO TV icon), back-only market buttons (`market-9`/`17`), `Rules` modal.
- [x] **Betting Logic & Payouts:** Fixed `CricketBet` `placeBetProps.eventName` (`match`) + `fancyScore`; verified `gameId`/`streamGmid`, `gameType`, suspended rejection (`400`), exposure, and WIN/LOSS/payouts across all `iscc` variants.

---

## PART B — FOOTBALL, TENNIS & HORSE RACING

### Chunk 3 — Football (`/football-bet/:id`)

**D247 Reference:** `d247-refrences/718060578.devtools`, `soccer-events.js`, `socre-refrence.js` (or live D247 login fallback)

**Frontend Files:**

- `client/src/pages/Home/Football.jsx`, `components/SportMatchList.jsx`
- `client/src/pages/gamedetails/FootballBet.jsx`, `MatchOdds.jsx`, `components/OverUnderMarket.jsx`, `CricketMarket.jsx`, `PlaceBet.jsx`

**Backend Paired Files:**

- `backend/controllers/soccerController.js`, `betController.js`, `backend/services/sportsSettlementService.js`

**Verify Checklist:**

- [x] **Desktop & Mobile UI / Bet Buttons:** 3-way Match Odds (`Team 1`, `Draw`, `Team 2`), Over/Under (`0.5`, `1.5`, `2.5`, `3.5`) Back/Lay 3+3 buttons (`tno` + `gscode` guard + D247 `SuspendedOverlay`), `otherMarkets` (`Bookmaker`, `BM_OVER_UNDER_*`, Period Winner), Live TV (`etid=1`), Score Iframe (`/score-iframe/1_<gmid>`, verified live HTTP 200), direct-refresh match hydration, `SportMatchList` desktop/mobile truncation.
- [x] **Betting Logic, Exposure & Payouts:** 3-runner `__OTHER__` exposure math on Match Odds, binary 2-runner math on Over/Under & `match1` bhav markets, suspended rejection (`400`), live HTTP E2E + WIN/LOSS/Payout verified.

---

### Chunk 4 — Tennis (`/tennis-bet/:id`)

**D247 Reference:** `d247-refrences/805012347.devtools`, `tennis-events.js`, `socre-refrence.js` (or live D247 login fallback)

**Frontend Files:**

- `client/src/pages/Home/Tennis.jsx`, `components/SportMatchList.jsx`
- `client/src/pages/gamedetails/TennisBet.jsx`, `MatchOdds.jsx`, `CricketMarket.jsx`, `PlaceBet.jsx`

**Backend Paired Files:**

- `backend/controllers/tennisController.js`, `betController.js`, `backend/services/sportsSettlementService.js`

**Verify Checklist:**

- [x] **Desktop & Mobile UI / Bet Buttons:** Match Odds / Tournament Winner 3+3 Back/Lay buttons, Set Winner / Game Winner / Deuce `otherMarkets` grid, fixed Live TV `etid` (`3 -> 2`), Score Iframe (`/score-iframe/2_<gmid>`, verified live HTTP 200), direct-refresh match hydration, mobile `ODDS` / `MATCHED BET` / `TV` tabs.
- [x] **Betting Logic, Exposure & Payouts:** 2-runner Match Odds (incl. green-book hedge `exposure=0`) vs multi-runner Tournament Winner exposure, Cashout, suspension (`gscode`), live HTTP E2E + WIN/LOSS/Payout verified.

---

### Chunk 5 — Horse Racing (`/hourse-racing-bet/:id`)

**D247 Reference:** `d247-refrences/index.js.devtools`, `718060578.devtools` (or live D247 login fallback)

**Frontend Files:**

- `client/src/pages/Home/HorseRacing.jsx`
- `client/src/pages/gamedetails/HourseRacingBet.jsx`, `HorseRacingMarkets.jsx`, `PlaceBet.jsx`

**Backend Paired Files:**

- `backend/controllers/horseRacingController.js`, `betController.js`, `backend/socket/bettingSocket.js`

**Verify Checklist:**

- [x] **Desktop & Mobile UI / Bet Buttons:** Country-grouped race venues & time slots listing, race detail header, runner silks (`race_icons`), jockey/trainer/age metadata, Win/Place Back & Lay buttons (Desktop 3+3 & Mobile 1+1), D247 `#373636d6` `SuspendedOverlay` + `REMOVED` state, `useSportEventSocket` + direct-refresh venue/iplay hydration, Live TV (`etid=10`) & Score Iframe (`/score-iframe/10_<gmid>`).
- [x] **Betting Logic, Exposure & Payouts:** Multi-runner (`6–20` horses) `runnerCount` & `__OTHER__` worst-case exposure verified live (`2x100 Back` on 6-runner race -> `exposure=200`), lay liability, per-market P&L scoping, live HTTP E2E + WIN/LOSS/Payout verified.

---

## PART C — CASINOS (GAME SCREEN, BET BUTTONS, SLIPS & ALL GAME TABLES)

### Chunk 6 — Casino Core: Game Screen, Video/Virtual Cards, Bet Slips & Engine

**Routes:** `/casino/:gameid`, `/casino-bet/:gameid`

**D247 Reference:** `Casino/d247-casino-react/`, `d247-refrences/index.js.devtools`, `newplayer.min.js`, `client/public/assets/css/style.css` (or live D247 login fallback)

**Frontend Files:**

- `client/src/pages/CasinoBet/casinoBet.jsx`, `context/CasinoContext.jsx`, `constants.js`
- `client/src/pages/CasinoBet/components/VideoStream.jsx`, `VirtualGameScreen.jsx`, `CardsDisplay.jsx`, `RecentResults.jsx`, `CasinoResult1.jsx`, `RouletteStatistics.jsx`, `RulesPopup.jsx`
- `client/src/components/rules/SidebarRulesTable.jsx`, `client/src/components/tables/OddsBox.jsx`
- `client/src/components/betting/DesktopBetSlip.jsx`, `MobileBetDrawer.jsx`, `useCasinoQuickStakes.js`
- `client/src/pages/CasinoBet/hooks/useCasinoWebSocket.js`, `useCasinoResults.js`, `useBetting.js`, `utils/bettingUtils.js`, `utils/gameUtils.js`

**Backend Paired Files:**

- `backend/controllers/casinobetController.js`, `casinoController.js`, `backend/services/casinoEngine.js`

**Verify Checklist:**

- [ ] **Game Screen (Desktop & Mobile):** Live casino video iframe + cards overlay (`CardsDisplay`) + countdown clock; Virtual casino screen (`VirtualGameScreen` dealer bg + green felt + flip cards + winner banner); Recent Results beads + `CasinoResult1` popup; `RulesPopup` + `SidebarRulesTable`.
- [ ] **Bet Slips & Buttons (Desktop & Mobile):**
  - [ ] Desktop sticky `DesktopBetSlip`: Back/Lay color theme, Odds/Stake inputs, custom Casino Quick Stakes (`useCasinoQuickStakes`), Profit/Liability display, Edit / Reset / Submit buttons.
  - [ ] Mobile `MobileBetDrawer`: `GAME` / `PLACED BET` tabs, `-`/`+` stake stepper, quick stake pills, Clear / Edit / Reset / Place Bet buttons.
- [ ] **Casino Engine Logic & Payouts (`casinoEngine.js`):**
  - [ ] `/casino/:slug/bet` validation (roundId, odds, min/max, suspension lock, balance).
  - [ ] Half-loss lay guard, same-round Back/Lay & opposing runner netting, live `NationBook` P&L display.
  - [ ] Instant round settlement (`startResultPoller` + cron), exact payout credit & `balance = avbalance + exposure` invariant.

---

### Chunk 7 — Casino Tables: Teenpatti, Poison, Joker & Trio (`26` slugs)

**D247 Reference:** `Casino/d247-vs/<slug>/`, `screenshots/ref/<slug>.png` (or live D247 login fallback)

**Frontend File:** `client/src/components/tables/casino/teenpattiTables.jsx`

**Slugs (`26`):** `teen`, `teen1`, `teen3`, `teen6`, `teen8`, `teen9`, `teen20`, `teen20b`, `teen20c`, `teen32`, `teen33`, `teen41`, `teen42`, `teen120`, `teenmuf`, `teensin`, `teenunique`, `pteen`, `pteen20`, `patti2`, `poison`, `poison20`, `joker1`, `joker20`, `joker120`, `trio`

**Verify Checklist:**

- [ ] Desktop & Mobile table layout, bet button alignment/colors, `OddsBox` & `NationBook` P&L, suspended lock icon, card overlay matching `CardsDisplay.jsx`.
- [ ] Selection IDs / runner keys match `backend/services/casinoEngine.js` settlement rules & payouts.

---

### Chunk 8 — Casino Tables: Dragon Tiger, Baccarat, Poker & Card Games (`21` slugs)

**D247 Reference:** `Casino/d247-vs/<slug>/`, `screenshots/ref/<slug>.png` (or live D247 login fallback)

**Frontend Files:**

- `client/src/components/tables/casino/dragonTigerBaccaratTables.jsx` (`9` slugs: `dt20`, `dt202`, `dt6`, `dtl20`, `pdt20`, `pdt6`, `baccarat`, `baccarat2`, `pbaccarat`)
- `client/src/components/tables/casino/pokerAndCardTables.jsx` (`12` slugs: `poker`, `poker20`, `poker6`, `card32`, `card32eu`, `pcard32`, `3cardj`, `queen`, `trap`, `notenum`, `dum10`, `cmeter1`)

**Verify Checklist:**

- [ ] Desktop & Mobile table layout, bet buttons (Main + Side bets / Pair / Odd-Even / Red-Black / Cards), suspended locks, `NationBook` P&L, card display.
- [ ] Selection keys, odds & payouts match `casinoEngine.js` settlement rules.

---

### Chunk 9 — Casino Tables: Lucky, AAA, Bollywood, Mogambo, Lottery & Andar Bahar (`16` slugs)

**D247 Reference:** `Casino/d247-vs/<slug>/`, `screenshots/ref/<slug>.png` (or live D247 login fallback)

**Frontend Files:**

- `client/src/components/tables/casino/luckyAndBollywoodTables.jsx` (`12` slugs: `lucky5`, `lucky7`, `lucky7eu`, `lucky7eu2`, `lucky15`, `plucky7`, `aaa`, `aaa2`, `btable`, `btable2`, `mogambo`, `lottcard`)
- `client/src/components/tables/casino/andarBaharTables.jsx` (`4` slugs: `ab3`, `ab4`, `ab20`, `abj`)

**Verify Checklist:**

- [ ] Desktop & Mobile table layout, card-number buttons (`A–K`), Low/High/Even/Odd/Red/Black buttons, Andar/Bahar card strip & bet boxes, suspended locks, `NationBook` P&L.
- [ ] Exact odds & settlement payouts verified against `casinoEngine.js` (including Lucky7 tie/7 half-loss rules if applicable).

---

### Chunk 10 — Casino Tables: Dice, Sports Casino, Races, Roulette, Matka, Goal2 & Virtual (`26` slugs)

**D247 Reference:** `Casino/d247-vs/<slug>/`, `screenshots/ref/<slug>.png`, `Casino/d247-casino-react/` (or live D247 login fallback)

**Frontend Files:**

- `client/src/components/tables/casino/diceSportsAndRaceTables.jsx` (`9` slugs: `dolidana`, `sicbo`, `sicbo2`, `ballbyball`, `cmatch20`, `goal`, `race2`, `race17`, `race20`)
- `client/src/components/tables/RouletteTable.jsx` (`4` slugs: `roulette11`, `roulette12`, `roulette13`, `ourroullete`) + `RouletteStatistics.jsx`
- `client/src/components/tables/MatkaTable.jsx` + `MatkaCalendar.jsx` (`3` slugs: `worli`, `worli2`, `worli3`)
- `client/src/components/tables/games/Goal2Table.jsx` (`goal2`)
- `client/src/components/tables/VirtualTables.jsx` (`9` virtual slugs: `vlucky7`, `vtrio`, `vdtl20`, `vteenmuf`, `vaaa`, `vbtable`, `vdt6`, `vteen`, `vteen20`)
- `client/src/components/tables/casino/shared.jsx` (`LiveSubMarketTable` + `TableT2Generic` fallback)

**Verify Checklist:**

- [ ] Desktop & Mobile felt/grid layout, Roulette betting grid + statistics sidebar, Worli/Matka single/panna/tabs + calendar, Virtual felt tables + `VirtualGameScreen`, suspended locks, `NationBook` P&L.
- [ ] Exact bet placement, exposure netting, and settlement payouts verified against `casinoEngine.js`.

---

## Deferred For Later (Baad Me Dekhenge)

Inko abhi skip rakhenge jab tak Chunks 1–10 complete na ho jayein:

- Login / Auth / PrivateRoute / Header / Navbar / Sidebar / Footer / `ButtonValues` / `ExposureDetails`
- Home Hub & Casino Lobby styling
- Account Reports (`AccountStatement`, `CurrentBets`, `CasinoResults`, `ActivityLog`, `ChangePassword`)

---

## Execution Flow (Per Chunk)

1. **D247 Reference Check:** Local `d247-refrences/`, `Casino/d247-vs/`, `Casino/d247-casino-react/`, `screenshots/ref/` check karo.
2. **Live D247 Fallback:** Agar local me missing ho, toh live D247 par login karke udhar se exact DOM / JS chunk / CSS / screenshot le lo.
3. **Desktop (`1440×900`) + Mobile (`390×844`) Verification:** Game screen, bet buttons, bet slips, tabs, modals & console errors check karo.
4. **Logic / P&L / Payout Check:** Odds math, exposure, suspension, cashout & settlement payouts verify karo.
5. **Fix & Tick:** Fixes karke build/tests pass karao aur is `roadmap.md` me `[x]` mark karo.
