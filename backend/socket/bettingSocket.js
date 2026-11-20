// socket/bettingSocket.js

// WebSocketServer - from the ws library, lets you create a WebSocketServer that client (browsers, app) can connect to
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';

import { getBestOddsForTeam } from '../controllers/cashoutController.js';
import { settlePendingForSlug } from '../controllers/casinobetController.js';
import betModel from '../models/betModel.js';
import { saveCasinoResults } from '../services/casinoResultStore.js';
import { saveCasinoRoundSnapshot } from '../services/casinoRoundSync.js';
import { getCasinoTable } from '../services/casinoTableCache.js';
import { getCricketCasino } from '../services/cricketCasinoCache.js';
import {
  getLatestScore,
  isValidScoreEventId,
  requestScore,
  startLiveScoreFeed,
} from '../services/liveScoreFeed.js';
import {
  fetchCasinoResult,
  fetchMatchData,
} from '../services/matchApi/index.js';
import {
  calculateCashoutValue,
  isCashoutEligible,
} from '../utils/cashoutUtils.js';

dotenv.config();

// Global State
// clients -> Array holding all connected clients each with
// --> ws (the websocket connection)
// --> gameid (the match they subscribed to)
// --> apitype (the sport: cricket, tennis, soccer, etc)
// --> His browser sends { "type": "subscribe", "gameid": "1234", "apitype": "cricket" }
// --> His server adds him to clients[]
// --> clients = [ { ws: RahulSocket, gameid: "1234", apitype: "cricket" } ]
export let clients = [];

// Cached data -> Stores the latest data fetched for each gameid + apitype combo so you can avoid sending duplicate updates
export let cachedData = {};
let wssInstance = null;

const casinoBettingCache = new Map();
const roundIdCache = new Map();

//  NEW: Cache for casino results to prevent duplicate result broadcasts
let cachedCasinoResults = new Map();

//  NEW: Cache for recent results to prevent sending old results
let recentResultsCache = new Map();

const getUniqueSubscriptions = () => {
  const uniqueSubscriptions = clients
    .map((c) => {
      if (!c.gameid) return null;

      if (c.apitype === 'casino') {
        return {
          gameid: c.gameid,
          apitype: c.apitype,
          roundId: c.roundId,
        };
      } else {
        return {
          gameid: c.gameid,
          apitype: c.apitype || 'cricket',
        };
      }
    })
    .filter(Boolean);

  return [
    ...new Map(
      uniqueSubscriptions.map((obj) => {
        if (obj.apitype === 'casino' && obj.roundId) {
          return [`${obj.gameid}_${obj.apitype}_${obj.roundId}`, obj];
        } else {
          return [`${obj.gameid}_${obj.apitype}`, obj];
        }
      })
    ).values(),
  ];
};

/**
 * Compute and push live cashout values for all users with open eligible bets on a game.
 * Called after odds change in pollBettingData.
 */
const computeAndPushCashoutValues = async (gameid) => {
  try {
    // Find all open non-casino sports bets for this game; eligibility is verified
    // per-market via D247 schema (gtype in {match, match1}, runnerCount === 2, gscode === 1).
    const openBets = await betModel.find({
      gameId: gameid,
      status: 0,
      betType: { $ne: 'casino' },
      isCashoutHedge: { $ne: true },
      isCashedOut: { $ne: true },
    });

    if (openBets.length === 0) return;

    // Group bets by userId
    const betsByUser = new Map();
    for (const bet of openBets) {
      const uid = bet.userId.toString();
      if (!betsByUser.has(uid)) betsByUser.set(uid, []);
      betsByUser.get(uid).push(bet);
    }

    // For each user, calculate cashout per eligible open 2-runner match/match1 bet
    for (const [uid, userBets] of betsByUser) {
      const cashoutData = [];

      for (const bet of userBets) {
        const { bestLay, bestBack, liveMarket } = getBestOddsForTeam(
          bet.gameId,
          bet.gameName,
          bet.teamName,
          { marketName: bet.marketName, gType: bet.gType }
        );
        if (
          !liveMarket ||
          !liveMarket.isOpen ||
          !isCashoutEligible(bet, liveMarket)
        ) {
          continue;
        }
        const value = calculateCashoutValue([bet], bestLay, bestBack);
        if (value !== null) {
          cashoutData.push({
            betId: bet._id.toString(),
            cashoutValue: value,
          });
        }
      }

      if (cashoutData.length > 0) {
        sendCashoutUpdates(uid, cashoutData);
      }
    }
  } catch (err) {
    console.error(`[CASHOUT PUSH] Error for game ${gameid}:`, err.message);
  }
};

// Poll betting data for cricket, tennis, soccer
// Inplay matches poll every tick (1s); non-inplay odds barely change, so they
// are re-fetched only every NON_INPLAY_POLL_MS. The provider's market `iplay`
// flag (seen in the odds response) tells the two apart; while a game's state
// is still unknown it polls every tick so a match going live is caught within
// ~1s of its first response.
const NON_INPLAY_POLL_MS = 10000;
const lastPollAt = new Map(); // `${gameid}_${apitype}` -> timestamp
const inplayFlags = new Map(); // `${gameid}_${apitype}` -> boolean

const pollBettingData = async () => {
  const groupedByGameId = getUniqueSubscriptions();
  const now = Date.now();
  const activeKeys = new Set();

  for (const { gameid, apitype } of groupedByGameId) {
    try {
      // Skip casino games in this function
      if (apitype === 'casino' || apitype === 'cricket-casino') continue;

      const pollKey = `${gameid}_${apitype}`;
      activeKeys.add(pollKey);

      // Throttle non-inplay games to one fetch per NON_INPLAY_POLL_MS
      if (
        inplayFlags.get(pollKey) === false &&
        now - (lastPollAt.get(pollKey) || 0) < NON_INPLAY_POLL_MS
      ) {
        continue;
      }

      let sid = 4; // default cricket
      if (apitype === 'tennis') sid = 2;
      else if (apitype === 'soccer') sid = 1;
      else if (apitype === 'horse-racing') sid = 10;

      const newData = await fetchMatchData(gameid, sid);
      lastPollAt.set(pollKey, Date.now());

      if (newData.success) {
        inplayFlags.set(
          pollKey,
          Array.isArray(newData.data) &&
            newData.data.some((market) => market?.iplay === true)
        );

        const cacheKey = pollKey;
        if (JSON.stringify(newData) !== JSON.stringify(cachedData[cacheKey])) {
          cachedData[cacheKey] = newData;

          clients.forEach((client) => {
            if (
              client.gameid === gameid &&
              client.apitype === apitype &&
              client.ws.readyState === 1
            ) {
              client.ws.send(
                JSON.stringify({
                  type: 'bettingData',
                  gameid,
                  apitype,
                  data: newData.data,
                })
              );
            }
          });

          // Push live cashout values for users watching this game
          computeAndPushCashoutValues(gameid).catch((err) =>
            console.error(`Cashout push error for ${gameid}:`, err.message)
          );
        }
      }
    } catch (error) {
      console.error(`Polling error for ${gameid} (${apitype}):`, error.message);
    }
  }

  // Forget games nobody is watching anymore
  for (const key of inplayFlags.keys()) {
    if (!activeKeys.has(key)) {
      inplayFlags.delete(key);
      lastPollAt.delete(key);
    }
  }
};

// Poll casino betting data - IMMEDIATE (no delays)
let casinoPollRunning = false;
const pollCasinoBettingData = async () => {
  // A slow provider must not let ticks pile up on top of each other
  if (casinoPollRunning) return;
  casinoPollRunning = true;

  try {
    const casinoGames = [
      ...new Set(
        getUniqueSubscriptions()
          .filter((s) => s.apitype === 'casino')
          .map((s) => s.gameid)
      ),
    ];

    // Tables are fetched in parallel; the shared cache means a table that was just
    // read for bet validation is not fetched again.
    const updates = await Promise.all(
      casinoGames.map(async (gameid) => {
        try {
          const newBettingData = await getCasinoTable(gameid, 900);
          if (!newBettingData?.success || !newBettingData.data) return null;

          const cacheKey = `betting_${gameid}_casino`;
          const prevBetting = cachedData[cacheKey];
          // Simple check: only send if data changed
          if (JSON.stringify(prevBetting) === JSON.stringify(newBettingData)) {
            return null;
          }

          cachedData[cacheKey] = newBettingData;

          // Final dealt cards/rdesc miss na hon: WS feed par bhi snapshot save karo
          const prevMid = prevBetting?.data?.mid;
          const newMid = newBettingData?.data?.mid;
          if (newMid && prevMid && newMid !== prevMid && prevBetting?.data) {
            saveCasinoRoundSnapshot(gameid, prevBetting.data).catch(() => {});
          }
          if (newBettingData.data?.mid) {
            saveCasinoRoundSnapshot(gameid, newBettingData.data).catch(
              () => {}
            );
          }

          // Session complete (round mid badla) -> result turant refresh karo,
          // 5s poll ka wait nahi. Broadcast refreshCasinoResult karta hy.
          if (newMid && prevMid && newMid !== prevMid) {
            refreshCasinoResult(gameid);
          }

          // Serialised once and reused for every viewer of this table
          return [
            gameid,
            JSON.stringify({
              type: 'casino_update',
              gameid,
              apitype: 'casino',
              data: newBettingData.data,
            }),
          ];
        } catch (error) {
          console.error(
            `Casino betting data polling error for ${gameid}:`,
            error.message
          );
          return null;
        }
      })
    );

    const changed = new Map(updates.filter(Boolean));
    if (changed.size === 0) return;

    for (const client of clients) {
      if (client.apitype !== 'casino' || client.ws.readyState !== 1) continue;
      const message = changed.get(client.gameid);
      if (message) client.ws.send(message);
    }
  } finally {
    casinoPollRunning = false;
  }
};

// Casino RESULT over WebSocket (sports jaisa). Data har 1s (upar), result har
// 5s ya session-complete pe. Provider call shared hy (per gameid, users nahi).
const casinoResultInflight = new Map();
const refreshCasinoResult = (gameid) => {
  if (casinoResultInflight.has(gameid)) return casinoResultInflight.get(gameid);

  const pending = (async () => {
    try {
      const res = await fetchCasinoResult(gameid);
      if (!res?.success || !res.data) return;

      // Sirf change pe broadcast — duplicate result nahi jayega.
      const prev = cachedCasinoResults.get(gameid);
      if (JSON.stringify(prev) === JSON.stringify(res.data)) return;
      cachedCasinoResults.set(gameid, res.data);

      if (Array.isArray(res.data?.res) && res.data.res.length) {
        saveCasinoResults(gameid, res.data.res, { source: 'live' }).catch(
          () => {}
        );
        settlePendingForSlug(gameid, { resultRowsHint: res.data.res }).catch(
          () => {}
        );
      }

      const message = JSON.stringify({
        type: 'casino_result',
        gameid,
        apitype: 'casino',
        data: res.data,
      });
      for (const client of clients) {
        if (
          client.apitype === 'casino' &&
          client.gameid === gameid &&
          client.ws.readyState === 1
        ) {
          client.ws.send(message);
        }
      }
    } catch (error) {
      console.error(
        `Casino result polling error for ${gameid}:`,
        error.message
      );
    } finally {
      casinoResultInflight.delete(gameid);
    }
  })();

  casinoResultInflight.set(gameid, pending);
  return pending;
};

let casinoResultPollRunning = false;
const pollCasinoResultData = async () => {
  if (casinoResultPollRunning) return;
  casinoResultPollRunning = true;
  try {
    const casinoGames = [
      ...new Set(
        getUniqueSubscriptions()
          .filter((s) => s.apitype === 'casino')
          .map((s) => s.gameid)
      ),
    ];
    await Promise.all(casinoGames.map((gameid) => refreshCasinoResult(gameid)));
  } finally {
    casinoResultPollRunning = false;
  }
};

// Cricket-casino (cricketv) live feed over WebSocket — virtual cricket (iscc 1).
// High-frequency feed: inplay har 1s, non-inplay har 10s (sports poller jaisa).
// inplay flag feed ke success se derive hota hy (active game = success).
const cricketCasinoLastPoll = new Map();
const cricketCasinoInplay = new Map();
let cricketCasinoPollRunning = false;
const pollCricketCasinoData = async () => {
  if (cricketCasinoPollRunning) return;
  cricketCasinoPollRunning = true;
  const now = Date.now();
  const activeKeys = new Set();
  try {
    const games = [
      ...new Set(
        getUniqueSubscriptions()
          .filter((s) => s.apitype === 'cricket-casino')
          .map((s) => s.gameid)
      ),
    ];
    await Promise.all(
      games.map(async (gameid) => {
        const pollKey = `cc_${gameid}`;
        activeKeys.add(pollKey);
        // Non-inplay throttle: 10s me ek baar.
        if (
          cricketCasinoInplay.get(pollKey) === false &&
          now - (cricketCasinoLastPoll.get(pollKey) || 0) < NON_INPLAY_POLL_MS
        ) {
          return;
        }
        try {
          const res = await getCricketCasino(gameid, 300);
          cricketCasinoLastPoll.set(pollKey, Date.now());
          cricketCasinoInplay.set(pollKey, Boolean(res?.success));
          if (!res?.success || !res.data) return;

          const cacheKey = `cricketcasino_${gameid}`;
          if (
            JSON.stringify(cachedData[cacheKey]) === JSON.stringify(res.data)
          ) {
            return;
          }
          cachedData[cacheKey] = res.data;

          const message = JSON.stringify({
            type: 'cricket_casino_update',
            gameid,
            apitype: 'cricket-casino',
            data: res.data,
          });
          for (const client of clients) {
            if (
              client.apitype === 'cricket-casino' &&
              client.gameid === gameid &&
              client.ws.readyState === 1
            ) {
              client.ws.send(message);
            }
          }
        } catch (error) {
          console.error(
            `Cricket-casino polling error for ${gameid}:`,
            error.message
          );
        }
      })
    );
    for (const key of cricketCasinoInplay.keys()) {
      if (!activeKeys.has(key)) {
        cricketCasinoInplay.delete(key);
        cricketCasinoLastPoll.delete(key);
      }
    }
  } finally {
    cricketCasinoPollRunning = false;
  }
};

// setupWebSocket is called with your HTTP server so that the WebSocket server can share the same port
export const setupWebSocket = (server) => {
  // Create a WebSocket server (wss) that listens for client connections
  const wss = new WebSocketServer({ server });

  // Every time someone connects we:
  wss.on('connection', (ws) => {
    //  Create client object with roundId and userId
    let client = {
      ws,
      gameid: null,
      apitype: null,
      roundId: null,
      userId: null,
      userName: null,
      scoreEventId: null,
    };
    clients.push(client);

    //  Complete message handler
    ws.on('message', (message) => {
      try {
        const jsonStr = message.toString();
        const data = JSON.parse(jsonStr);

        // Register userId for account-level updates (balance, exposure, open bets, cashout)
        if (data.type === 'register' && data.userId) {
          client.userId = data.userId;
          indexClientUser(client, client.userId);
        }

        if (data.type === 'subscribe' && data.gameid) {
          client.gameid = data.gameid;
          client.apitype = data.apitype || 'cricket';
          client.roundId = data.roundId || null;
          // Keep an earlier registration if this subscribe carries no userId
          client.userId = data.userId || client.userId || null;
          indexClientUser(client, client.userId);

          // A new subscriber gets the latest table right away from the shared cache;
          // clearing it instead would make the poller re-broadcast to every viewer.
          if (client.apitype === 'casino') {
            const latest = cachedData[`betting_${client.gameid}_casino`];
            if (latest?.data && ws.readyState === 1) {
              ws.send(
                JSON.stringify({
                  type: 'casino_update',
                  gameid: client.gameid,
                  apitype: 'casino',
                  data: latest.data,
                })
              );
            }

            // Latest result bhi turant bhejo (cache se), aur ek refresh trigger
            // karo taaki cache khali ho to pehla result jaldi aa jaye.
            const latestResult = cachedCasinoResults.get(client.gameid);
            if (latestResult && ws.readyState === 1) {
              ws.send(
                JSON.stringify({
                  type: 'casino_result',
                  gameid: client.gameid,
                  apitype: 'casino',
                  data: latestResult,
                })
              );
            }
            refreshCasinoResult(client.gameid);
          }

          // Cricket-casino subscriber ko latest cached feed turant bhejo + immediate refresh.
          if (client.apitype === 'cricket-casino') {
            const latest = cachedData[`cricketcasino_${client.gameid}`];
            if (latest && ws.readyState === 1) {
              ws.send(
                JSON.stringify({
                  type: 'cricket_casino_update',
                  gameid: client.gameid,
                  apitype: 'cricket-casino',
                  data: latest,
                })
              );
            }
            pollCricketCasinoData();
          }

          // Live scorecard: viewers share one provider feed per event
          if (isValidScoreEventId(data.scoreEventId)) {
            client.scoreEventId = data.scoreEventId;
            const cached = getLatestScore(client.scoreEventId);
            if (cached && ws.readyState === 1) {
              ws.send(
                JSON.stringify({
                  type: 'scoreData',
                  scoreEventId: client.scoreEventId,
                  data: cached.data,
                })
              );
            }
            requestScore(client.scoreEventId);
          } else {
            client.scoreEventId = null;
          }
        }
      } catch (err) {
        console.error(' [WS] Invalid message:', err.message);
      }
    });

    // Remove the disconnected client from the clients array
    ws.on('close', () => {
      indexClientUser(client, null);
      clients = clients.filter((c) => c.ws !== ws);
    });
  });

  // Start all polling intervals
  setInterval(pollBettingData, 1000);
  setInterval(pollCasinoBettingData, 1000);
  // Casino result har 5s (session-complete pe upar turant trigger hota hy).
  setInterval(pollCasinoResultData, 5000);
  // Cricket-casino high-frequency feed: 500ms tick (broadcasts only on diff).
  setInterval(pollCricketCasinoData, 500);

  // Live scorecards: one shared provider feed, refreshed every 5s per active event
  startLiveScoreFeed({
    activeEventIds: () => [
      ...new Set(clients.map((c) => c.scoreEventId).filter(Boolean)),
    ],
    onUpdate: (eventId, data) => {
      const message = JSON.stringify({
        type: 'scoreData',
        scoreEventId: eventId,
        data,
      });
      clients.forEach((client) => {
        if (client.scoreEventId === eventId && client.ws.readyState === 1) {
          client.ws.send(message);
        }
      });
    },
  });
};

//  REMOVED: sendCasinoResultUpdate function
// Frontend now uses API calls (fetchCasinoResultData) triggered by useRef round detection
// This function is no longer needed and has been replaced with the optimized approach

// userId -> Set of that user's sockets. Account updates (balance/exposure/open bets)
// go straight to the owner instead of scanning or broadcasting to every connection.
const clientsByUser = new Map();

const indexClientUser = (client, userId) => {
  const next = userId ? String(userId) : null;
  if (client.userKey === next) return;

  if (client.userKey) {
    const previous = clientsByUser.get(client.userKey);
    previous?.delete(client);
    if (previous && previous.size === 0) clientsByUser.delete(client.userKey);
  }

  client.userKey = next;
  if (next) {
    let sockets = clientsByUser.get(next);
    if (!sockets) {
      sockets = new Set();
      clientsByUser.set(next, sockets);
    }
    sockets.add(client);
  }
};

const sendToUserSockets = (userId, payload) => {
  const sockets = clientsByUser.get(String(userId?._id ?? userId));
  if (!sockets) return 0;

  const message = JSON.stringify(payload);
  let sentCount = 0;
  for (const client of sockets) {
    if (client.ws.readyState === 1) {
      client.ws.send(message);
      sentCount++;
    }
  }
  return sentCount;
};

//FUNCTION THAT SENDS BALANCE UPDATES TO THE USER'S CONNECTED CLIENTS
export const sendBalanceUpdates = (userId, newBalance) => {
  sendToUserSockets(userId, {
    type: 'balance_update',
    userId,
    newBalance,
  });
};

//FUNCTION THAT SENDS EXPOSURE UPDATES TO THE USER'S CONNECTED CLIENTS
export const sendExposureUpdates = (userId, newExposure) => {
  sendToUserSockets(userId, {
    type: 'exposure_update',
    userId,
    newExposure,
  });
};

//FUNCTION THAT UPDATES OPEN BETS TO THE USER'S CONNECTED CLIENTS AFTER BET SETTLEMENT
export const sendOpenBetsUpdates = (userId, newOpenBets) => {
  sendToUserSockets(userId, {
    type: 'open_bets_update',
    userId: userId?._id ?? userId,
    newOpenBets,
  });
};

export const sendToUser = (userName, payload) => {
  if (!wssInstance) return console.warn(' WebSocket not initialized yet');

  clients.forEach((client) => {
    if (client.userName === userName && client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(payload));
    }
  });
};

// Function to send user refresh message (triggers getUser() on frontend)
export const sendUserRefresh = (userId) => {
  console.log(' [WEBSOCKET] Sending user refresh request for userId:', userId);

  let sentCount = 0;
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === 1) {
      client.ws.send(
        JSON.stringify({
          type: 'user_refresh_needed',
          userId: userId,
        })
      );
      sentCount++;
      console.log(` [WEBSOCKET] Sent refresh request to client ${sentCount}`);
    }
  });

  console.log(
    ` [WEBSOCKET] Sent refresh request to ${sentCount} clients for userId: ${userId}`
  );
};

//FUNCTION THAT SENDS CASHOUT UPDATES TO SPECIFIC USER'S CONNECTED CLIENTS
export const sendCashoutUpdates = (userId, cashoutData) => {
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === 1) {
      client.ws.send(
        JSON.stringify({
          type: 'cashout_update',
          userId,
          bets: cashoutData, // array of { betId, cashoutValue }
        })
      );
    }
  });
};

// In short — the flow
// Client connects → added to clients
// Client subscribes → sends { type: "subscribe", gameid, apitype }
// Server subscribes to live score socket (1 connection per game + apitype)
// Server polls API every 3 seconds for each unique subscription
// If data changed, sends update to subscribed clients
// If client disconnects, they're removed from the list
