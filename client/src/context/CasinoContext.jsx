import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useDispatch } from 'react-redux';
import api from '../redux/api';
import { getUser } from '../redux/reducer/authReducer';
import {
  clearCasinoBetError,
  getMyCasinoBets,
  placeCasinoBet,
} from '../redux/reducer/casinoBetSlice';

const CasinoContext = createContext(null);

// =========================================
// NORMALIZE SELECTION
// =========================================
export const normalizeSelection = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/^roulette\s*:\s*/, '')
    .replace(/[^a-z0-9]/g, '');

// Provider `visible` flag market-lock NAHI hy — reference bundle isse ignore
// karta hy (open markets pe bhi visible:0 ata hy). Suspension sirf gstatus se.
const isMarketVisible = (market) => true;

const isMarketOpen = (market) => {
  const status = String(market?.gstatus ?? market?.status ?? '')
    .trim()
    .toUpperCase();
  if (status) return ['OPEN', 'ACTIVE'].includes(status);
  // Roulette API sends numeric s: 1 (open) / 0 (suspended) without gstatus
  if (market?.s !== undefined && market?.s !== null) {
    return Number(market.s) === 1;
  }
  return false;
};

const SICBO_RATIO_SLUGS = new Set([
  'sicbo',
  'sicbo2',
  'baccarat',
  'baccarat2',
  'pbaccarat',
]);

export function CasinoUiProvider({
  children,
  gameid,
  bettingData,
  betting,
  isMobile,
}) {
  const dispatch = useDispatch();

  const [rouletteMode, setRouletteMode] = useState('back');
  const [rouletteBets, setRouletteBets] = useState({});
  const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);
  const [slipMode, setSlipMode] = useState(isMobile ? 'mobile' : 'desktop');
  const [nationBook, setNationBook] = useState({});

  // =========================================
  // FIX: NORMALIZE API RESPONSE
  // Supports:
  // { message, data: { mid, sub } }
  // { data: { message, data: { mid, sub } } }
  // { mid, sub }
  // =========================================

  const casinoData =
    bettingData?.data?.data ?? bettingData?.data ?? bettingData ?? {};

  // =========================================
  // PROVIDER MARKETS
  // =========================================

  const marketList = Array.isArray(casinoData?.sub) ? casinoData.sub : [];

  // =========================================
  // NATION BOOK (per-selection P&L, reference userbook box)
  // =========================================

  const roundMid = casinoData?.mid ? String(casinoData.mid) : '';

  const loadNationBook = useCallback(() => {
    if (!gameid || !roundMid) {
      setNationBook({});
      return Promise.resolve();
    }
    return api
      .get(`/casino/${gameid}/book/${roundMid}`, { withCredentials: true })
      .then((r) => {
        setNationBook(r.data?.book || {});
      })
      .catch(() => {});
  }, [gameid, roundMid]);

  useEffect(() => {
    loadNationBook();
    if (!gameid || !roundMid) return undefined;
    const timer = setInterval(loadNationBook, 15000);
    const onPlaced = () => loadNationBook();
    window.addEventListener('casino:bet-placed', onPlaced);
    return () => {
      clearInterval(timer);
      window.removeEventListener('casino:bet-placed', onPlaced);
    };
  }, [gameid, roundMid, loadNationBook]);

  // =========================================
  // DEBUG LOGS
  // =========================================

  useEffect(() => {
    console.log('========== CASINO DEBUG ==========');

    console.log('GAME:', gameid);

    console.log('ROUND:', casinoData?.mid);

    console.log('PROVIDER TYPE:', casinoData?.gtype);

    console.log('PROVIDER MARKETS:', casinoData?.sub);

    console.log('FULL CASINO DATA:', casinoData);

    console.log('==================================');

    console.table(
      marketList.map((item) => ({
        sid: item.sid ?? item.i,
        name: item.nat ?? item.n,
        status: item.gstatus,
        back: item.b,
        lay: item.l,
        visible: item.visible,
        min: item.min,
        max: item.max,
      }))
    );
  }, [gameid, casinoData]);

  // =========================================
  // SUSPENDED CHECK
  // =========================================

  // Game-level suspension only. Individual market status/visibility/odds
  // are validated independently in openBetSlip.
  const gameStatusSuspended = [casinoData?.gstatus, casinoData?.status].some(
    (status) => String(status || '').toUpperCase() === 'SUSPENDED'
  );

  const hasAnyOpenMarket = marketList.some((item) => {
    const visible = isMarketVisible(item);
    const open = isMarketOpen(item);
    if (!visible || !open) return false;
    if (String(gameid).toLowerCase() === 'worli3') {
      return true;
    }
    const back = Number(item?.b ?? item?.back ?? item?.odds);
    const lay = Number(item?.l ?? item?.lay);
    if (SICBO_RATIO_SLUGS.has(String(gameid || '').toLowerCase()) && back > 0) {
      return true;
    }
    if (
      (Number.isFinite(back) && back > 1) ||
      (Number.isFinite(lay) && lay > 1)
    ) {
      return true;
    }
    if (
      String(item?.etype || '').toLowerCase() === 'fancy2' &&
      (Number(item?.bbhav) > 0 || Number(item?.lbhav) > 0)
    ) {
      return true;
    }
    if (
      Array.isArray(item?.odds) &&
      item.odds.some((o) => Number(o?.b) > 1 || Number(o?.l) > 1)
    ) {
      return true;
    }
    return false;
  });

  const isSuspended =
    gameStatusSuspended || (marketList.length > 0 && !hasAnyOpenMarket);

  // =========================================
  // MARKET MAPPING
  // =========================================

  const marketMap = useMemo(() => {
    const map = {};

    marketList.forEach((item) => {
      const providerId = item?.sid ?? item?.i;

      const entry = {
        back: String(item?.b ?? item?.back ?? item?.odds ?? ''),
        lay: String(item?.l ?? item?.lay ?? ''),
        bbhav: Number(item?.bbhav ?? 0),
        lbhav: Number(item?.lbhav ?? 0),
        etype: item?.etype ?? '',
        subtype: item?.subtype ?? '',
        odds: Array.isArray(item?.odds) ? item.odds : null,
        nat: item?.nat ?? item?.n ?? item?.name ?? item?.label ?? '',
        sid: providerId != null ? String(providerId) : '',
        gstatus: item?.gstatus ?? item?.status ?? '',
        visible: isMarketVisible(item),
        min: Number(item?.min ?? 100),
        max: Number(item?.max ?? 100000),
      };

      if (providerId != null && providerId !== '') {
        map[`sid:${String(providerId)}`] = entry;
      }

      const aliases = [
        item?.nat,
        item?.n,
        item?.name,
        item?.label,
        item?.selection,
        item?.selectionName,
        item?.sid,
        item?.i,
      ];

      aliases
        .filter(
          (value) => value !== undefined && value !== null && value !== ''
        )
        .forEach((alias) => {
          const key = normalizeSelection(alias);

          if (key && !map[key]) {
            map[key] = entry;
          }
        });
    });

    return new Proxy(map, {
      get(target, prop, receiver) {
        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop, receiver);
        }
        if (typeof prop === 'string') {
          return target[normalizeSelection(prop)];
        }
        return undefined;
      },
    });
  }, [marketList]);

  // =========================================
  // CURRENT ROUND DATA
  // =========================================

  const roundData = useMemo(
    () => ({
      ...casinoData,

      markets: marketMap,

      remark: casinoData?.remark || '',

      roundId: casinoData?.mid ? String(casinoData.mid) : '',
    }),
    [casinoData, marketMap]
  );

  // =========================================
  // OPEN BET SLIP
  // =========================================

  const openBetSlip = useCallback(
    (nation, odds, type = 'back', mobile = isMobile) => {
      if (isSuspended) {
        window.alert('Betting is currently suspended.');
        return;
      }

      const lookupNation = normalizeSelection(nation);

      // 1. Nested Odd/Even, Trap High/Low/JQK, Teen6 Suit/Card, or Notenum Card selection
      let selectedMarket = null;
      const nestedM = String(nation).match(/^(\d+):(odd|even|high|low|jqk)$/i);
      const teen6SuitM = String(nation).match(
        /^(\d+):suit:(spade|diamond|club|heart)$/i
      );
      const notenumCardM = String(nation).match(/^(\d+):card:(\d{1,2})$/i);
      if (nestedM) {
        const parentSid = nestedM[1];
        const subKey = nestedM[2].toLowerCase();
        const parent = marketList.find(
          (item) =>
            String(item?.sid ?? item?.i ?? '') === parentSid &&
            Array.isArray(item?.odds)
        );
        const child = parent?.odds?.find(
          (o) =>
            String(o?.nat || '')
              .trim()
              .toLowerCase() === subKey
        );
        if (parent && child) {
          selectedMarket = {
            ...parent,
            sid: `${parentSid}:${subKey}`,
            nat: `${parent.nat || `Card ${parentSid}`} ${child.nat}`,
            b: Number(child.b ?? 0),
            l: Number(child.l ?? 0),
          };
        }
      } else if (teen6SuitM) {
        const parentSid = teen6SuitM[1];
        const suit = teen6SuitM[2].toLowerCase();
        const parent = marketList.find(
          (item) =>
            String(item?.sid ?? item?.i ?? '') === parentSid &&
            Array.isArray(item?.odds)
        );
        const child = parent?.odds?.find(
          (o) =>
            String(o?.nat || '')
              .trim()
              .toLowerCase() === suit
        );
        if (parent && child) {
          selectedMarket = {
            ...parent,
            sid: `${parentSid}:suit:${suit}`,
            nat: `${parent.nat || `Card ${parentSid}`} ${child.nat}`,
            b: Number(child.b ?? 0),
            l: Number(child.l ?? 0),
          };
        }
      } else if (notenumCardM) {
        const parentSid = notenumCardM[1];
        const rankNum = Number(notenumCardM[2]);
        const parent = marketList.find(
          (item) =>
            String(item?.sid ?? item?.i ?? '') === parentSid &&
            Array.isArray(item?.odds)
        );
        const child = parent?.odds?.find(
          (o) => Number(o?.ssid ?? o?.sid ?? o?.sno) === rankNum
        );
        if (parent && child) {
          selectedMarket = {
            ...parent,
            sid: `${parentSid}:card:${rankNum}`,
            nat: `${parent.nat || `Card ${parentSid}`} - ${child.nat}`,
            b: Number(child.b ?? 0),
            l: Number(child.l ?? 0),
          };
        }
      }

      // 2. Exact SID match first (avoids duplicate-nat collision e.g. vteen sid 17/18 Consecutive)
      if (!selectedMarket) {
        selectedMarket = marketList.find((item) => {
          const providerId = item?.sid ?? item?.i;
          return (
            providerId !== undefined &&
            providerId !== null &&
            String(providerId) === String(nation)
          );
        });
      }

      // 3. Normalized provider name match
      if (!selectedMarket) {
        selectedMarket = marketList.find((item) => {
          const providerNames = [
            item?.nat,
            item?.n,
            item?.name,
            item?.label,
            item?.selection,
            item?.selectionName,
          ];
          return providerNames.some(
            (name) => normalizeSelection(name) === lookupNation
          );
        });
      }

      // Selection not found
      if (!selectedMarket) {
        // teenunique: "unique:1-3-5" -> backed by marketList[0]
        const uniqM = String(nation).match(/^unique:([1-6])-([1-6])-([1-6])$/i);
        if (String(gameid).toLowerCase() === 'teenunique' && uniqM) {
          const baseSub = marketList[0];
          if (baseSub) {
            selectedMarket = {
              ...baseSub,
              sid: `unique:${uniqM[1]}-${uniqM[2]}-${uniqM[3]}`,
              nat: `Unique Cards (${uniqM[1]}, ${uniqM[2]}, ${uniqM[3]})`,
            };
          }
        }
        // 3cardj: "3cj:yes:1-7-13" / "3cj:no:1-7-13" -> backed by live sid 1 (Yes) / 2 (No)
        const j3m = String(nation).match(/^3cj:(yes|no):(\d+)-(\d+)-(\d+)$/i);
        if (String(gameid).toLowerCase() === '3cardj' && j3m) {
          const mode = j3m[1].toLowerCase();
          const picks = [Number(j3m[2]), Number(j3m[3]), Number(j3m[4])];
          const secSub = marketList.find(
            (m) => String(m.sid ?? m.i) === (mode === 'yes' ? '1' : '2')
          );
          if (secSub) {
            const rLbl = (r) =>
              ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' })[r] || String(r);
            selectedMarket = {
              ...secSub,
              sid: `3cj:${mode}:${picks.join('-')}`,
              nat: `${mode === 'yes' ? 'Yes' : 'No'} (${picks.map(rLbl).join(', ')})`,
            };
          }
        }
        // Lottcard: "lott:single:5" / "lott:double:45" / "lott:triple:457" -> backed by live sid 1/2/3
        const lottM = String(nation).match(
          /^lott:(single|double|triple):(\d{1,3})$/i
        );
        if (String(gameid).toLowerCase() === 'lottcard' && lottM) {
          const mode = lottM[1].toLowerCase();
          const digits = lottM[2];
          const sidMap = { single: '1', double: '2', triple: '3' };
          const secSub = marketList.find(
            (m) => String(m.sid ?? m.i) === sidMap[mode]
          );
          if (secSub) {
            selectedMarket = {
              ...secSub,
              sid: `lott:${mode}:${digits}`,
              nat: `${mode[0].toUpperCase() + mode.slice(1)} ${digits}`,
            };
          }
        }
        // ab3 / ab4: "abchild:<cardNum>:<andar|bahar>:<rank>" -> backed by live sub[0] + child[rank]
        const abChildM = String(nation).match(
          /^abchild:(\d+):(andar|bahar):(\d{1,2})$/i
        );
        if (['ab3', 'ab4'].includes(String(gameid).toLowerCase()) && abChildM) {
          const [, cardNum, abSide, rankStr] = abChildM;
          const rankNum = Number(rankStr);
          const activeSub = marketList.find(
            (m) => String(m.sid ?? m.i) === cardNum
          );
          const childSid =
            abSide.toLowerCase() === 'andar' ? rankNum : 20 + rankNum;
          const childEntry = (casinoData?.child || []).find(
            (c) => Number(c.sid) === childSid
          );
          if (
            activeSub &&
            (!childEntry ||
              (Number(childEntry.b) === 1 && Number(childEntry.l) > 0))
          ) {
            const rankLbl =
              { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[rankNum] || String(rankNum);
            selectedMarket = {
              ...activeSub,
              sid: `abchild:${cardNum}:${abSide.toLowerCase()}:${rankNum}`,
              nat: `${abSide.toLowerCase() === 'andar' ? 'Andar' : 'Bahar'} ${rankLbl} (Card ${cardNum})`,
            };
          }
        }
        // Matka local markets (jodi/pana/sp/dp/trio/cycle/motor/charts/abr): selection logic hamare
        // end pe hy — provider sids nahi deta, local payout table use karo.
        const localM = String(nation).match(
          /^(single|jodi|sp|dp|tp|trio|pana|cycle|motor|chart56|chart64|abr|commonsp|commondp|colordp):/
        );
        if (['worli', 'worli2', 'worli3'].includes(String(gameid)) && localM) {
          const MATKA_SID_MAP = {
            single: 1,
            pana: 2,
            sp: 3,
            dp: 4,
            tp: 5,
            trio: 5,
            cycle: 6,
            motor: 7,
            chart56: 8,
            chart64: 9,
            abr: 10,
            commonsp: 11,
            commondp: 12,
            colordp: 13,
            jodi: 14,
          };
          const secSid = MATKA_SID_MAP[localM[1]];
          const secSub = marketList.find(
            (m) => Number(m.sid ?? m.i) === secSid
          );
          if (secSub) {
            const [k, arg] = String(nation).split(':');
            const prettyNat =
              k === 'single'
                ? arg === 'line1'
                  ? 'Line 1 Single'
                  : arg === 'line2'
                    ? 'Line 2 Single'
                    : arg === 'odd'
                      ? 'ODD Single'
                      : arg === 'even'
                        ? 'EVEN Single'
                        : `${arg} Single`
                : `${k.toUpperCase()} ${String(arg || '').toUpperCase()}`.trim();
            selectedMarket = {
              ...secSub,
              sid: String(nation),
              nat: prettyNat,
              b: Number(odds) > 1 ? Number(odds) : Number(secSub.b || 0),
            };
          }
        }
      }
      if (!selectedMarket) {
        console.error('Provider selection mapping failed:', {
          requested: nation,
          game: gameid,
          round: casinoData?.mid,
          providerMarkets: marketList,
        });

        window.alert(`Provider selection not found for "${nation}".`);

        return;
      }

      // Provider SID / ID
      const providerId = selectedMarket.sid ?? selectedMarket.i;

      if (providerId === undefined || providerId === null) {
        window.alert('Provider selection ID is missing.');
        return;
      }

      // Missing `visible` is accepted; only explicit visible=0 is locked.
      if (!isMarketVisible(selectedMarket)) {
        window.alert('This market is hidden by the provider.');
        return;
      }

      // Providers may send OPEN / ACTIVE, or numeric s=1 on Roulette.
      const marketStatus = String(
        selectedMarket.gstatus ??
          selectedMarket.status ??
          (Number(selectedMarket.s) === 1 ? 'OPEN' : 'SUSPENDED')
      ).toUpperCase();

      if (!['OPEN', 'ACTIVE'].includes(marketStatus)) {
        window.alert('This selection is not open for betting.');
        return;
      }

      // Always use the latest odds from the matched provider market.
      // Never trust hardcoded/fallback odds passed by a table component.
      const requestedSide = type === 'lay' ? 'lay' : 'back';
      const natKeyLower = String(
        selectedMarket.nat ?? selectedMarket.n ?? selectedMarket.name ?? nation
      )
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const slugLower = String(gameid || '').toLowerCase();
      // 1-day Dragon Tiger (dt6/vdt6/pdt6) has suit tiebreak (NO half-loss -> Lay allowed!)
      const isHalfLoss =
        (['dt20', 'dt202', 'pdt20'].includes(slugLower) &&
          ['dragon', 'tiger'].includes(natKeyLower)) ||
        ([
          'lucky7',
          'lucky7eu',
          'lucky7eu2',
          'vlucky7',
          'plucky7',
          'lucky5',
          'lucky15',
        ].includes(slugLower) &&
          ['lowcard', 'low', 'highcard', 'high'].includes(natKeyLower)) ||
        (['aaa', 'aaa2', 'vaaa'].includes(slugLower) &&
          ['under7', 'over7'].includes(natKeyLower)) ||
        (slugLower === 'dolidana' &&
          ['lessthan7', 'greaterthan7', 'lt7', 'gt7'].includes(natKeyLower));
      if (requestedSide === 'lay' && isHalfLoss) {
        window.alert('Lay not allowed on half-loss markets.');
        return;
      }
      const isFancy2Session =
        String(selectedMarket.etype || '').toLowerCase() === 'fancy2' &&
        (Number(selectedMarket.bbhav) > 0 || Number(selectedMarket.lbhav) > 0);
      const isSicboRatio = SICBO_RATIO_SLUGS.has(slugLower);
      const rawOdds = isFancy2Session
        ? requestedSide === 'lay'
          ? Number(selectedMarket.lbhav) > 0
            ? Math.round((1 + Number(selectedMarket.lbhav) / 100) * 100) / 100
            : 0
          : Number(selectedMarket.bbhav) > 0
            ? Math.round((1 + Number(selectedMarket.bbhav) / 100) * 100) / 100
            : 0
        : requestedSide === 'lay'
          ? (selectedMarket.l ?? selectedMarket.lay)
          : isSicboRatio
            ? Number(selectedMarket.b ?? 0) > 0
              ? Number(selectedMarket.b) + 1
              : 0
            : (selectedMarket.b ?? selectedMarket.back ?? selectedMarket.odds);
      const numericOdds =
        String(gameid).toLowerCase() === 'worli3' &&
        requestedSide === 'back' &&
        !(Number(rawOdds) > 1)
          ? Number(odds) > 1
            ? Number(odds)
            : 9.5
          : Number(rawOdds);

      if (!Number.isFinite(numericOdds) || numericOdds <= 1) {
        window.alert(
          `Valid ${requestedSide} odds are not available for this selection.`
        );
        return;
      }

      setSlipMode(mobile ? 'mobile' : 'desktop');

      const baseNat = String(
        selectedMarket.nat ?? selectedMarket.n ?? selectedMarket.name ?? nation
      );
      const abjLabelMap =
        slugLower === 'abj'
          ? {
              2: 'Andar 1st Bet',
              3: 'Andar 2nd Bet',
              5: 'Bahar 1st Bet',
              6: 'Bahar 2nd Bet',
            }
          : null;
      const poker20Prefix =
        slugLower === 'poker20'
          ? Number(providerId) >= 21
            ? `Player B ${baseNat}`
            : `Player A ${baseNat}`
          : null;
      const displayNat = abjLabelMap?.[String(providerId)]
        ? abjLabelMap[String(providerId)]
        : poker20Prefix
          ? poker20Prefix
          : ['vcon', 'con'].includes(
                String(selectedMarket.subtype || '').toLowerCase()
              )
            ? `${baseNat} Consecutive`
            : isFancy2Session
              ? `${baseNat} (${requestedSide === 'lay' ? selectedMarket.l : selectedMarket.b})`
              : baseNat;

      // Set bet control
      betting.setBetControl({
        nat: displayNat,

        sid: String(providerId),

        selection: String(providerId),

        type: type === 'lay' ? 'lay' : 'back',

        min: Number(selectedMarket.min ?? casinoData?.min ?? 100),

        max: Number(selectedMarket.max ?? casinoData?.max ?? 100000),

        visible: isMarketVisible(selectedMarket),
        gstatus: marketStatus,

        slug: String(gameid || ''),

        roundId: String(casinoData?.mid || ''),

        sessionLine: isFancy2Session
          ? Number(
              requestedSide === 'lay' ? selectedMarket.l : selectedMarket.b
            )
          : null,
      });

      betting.setBetOdds(numericOdds);

      betting.setBetAmount(0);
    },
    [betting, isSuspended, isMobile, gameid, casinoData?.mid, marketList]
  );

  // =========================================
  // CLOSE BET SLIP
  // =========================================

  const closeBetSlip = useCallback(() => {
    betting.resetBettingState();
  }, [betting]);

  // =========================================
  // UPDATE STAKE
  // =========================================

  const updateStake = useCallback(
    (value) => {
      const amount = Math.max(0, Number(value) || 0);

      betting.updateAmount(amount);
    },
    [betting]
  );

  // =========================================
  // ADJUST ODDS
  // =========================================

  const adjustOdds = useCallback(
    (delta) => {
      betting.setBetOdds((previous) =>
        Math.max(1.01, Number((Number(previous || 1.98) + delta).toFixed(2)))
      );
    },
    [betting]
  );

  // =========================================
  // SUBMIT BET
  // =========================================

  const submitBet = useCallback(async () => {
    const control = betting.betControl;

    const stake = Number(betting.betAmount);

    const oddsValue = Number(betting.betOdds);

    if (!control?.slug || !control?.roundId || !control?.selection) {
      window.alert('Game, round or provider selection is missing.');
      return;
    }

    if (!Number.isFinite(stake) || stake < Number(control.min || 1)) {
      window.alert(`Minimum bet amount is ${control.min || 1}`);
      return;
    }

    if (stake > Number(control.max || Infinity)) {
      window.alert(`Maximum bet amount is ${control.max}`);
      return;
    }

    if (!Number.isFinite(oddsValue) || oddsValue <= 1) {
      window.alert('Invalid odds.');
      return;
    }

    const isLocalMatka =
      ['worli', 'worli2', 'worli3'].includes(String(control.slug)) &&
      /^(single|jodi|sp|dp|tp|trio|pana|cycle|motor|chart56|chart64|abr|commonsp|commondp|colordp):/.test(
        String(control.selection)
      );

    // Re-check the selected market immediately before submitting.
    // This prevents a stale slip from placing a bet after the provider closes it.
    if (!isLocalMatka) {
      const nestedSubmitM = String(control.selection).match(
        /^(\d+):(odd|even|high|low|jqk)$/i
      );
      const teen6SuitSubmitM = String(control.selection).match(
        /^(\d+):suit:(spade|diamond|club|heart)$/i
      );
      const notenumSubmitM = String(control.selection).match(
        /^(\d+):card:(\d{1,2})$/i
      );
      const uniqSubmitM = String(control.selection).match(
        /^unique:([1-6])-([1-6])-([1-6])$/i
      );
      const j3SubmitM = String(control.selection).match(
        /^3cj:(yes|no):(\d+)-(\d+)-(\d+)$/i
      );
      const lottSubmitM = String(control.selection).match(
        /^lott:(single|double|triple):(\d{1,3})$/i
      );
      const abChildSubmitM = String(control.selection).match(
        /^abchild:(\d+):(andar|bahar):(\d{1,2})$/i
      );
      let latestMarket = null;
      let latestRawOdds = 0;
      if (uniqSubmitM && String(control.slug).toLowerCase() === 'teenunique') {
        latestMarket = marketList[0] || null;
        latestRawOdds = latestMarket?.b ?? 0;
      } else if (teen6SuitSubmitM) {
        const p = marketList.find(
          (item) =>
            String(item?.sid ?? item?.i ?? '') === teen6SuitSubmitM[1] &&
            Array.isArray(item?.odds)
        );
        const child = p?.odds?.find(
          (o) =>
            String(o?.nat || '')
              .trim()
              .toLowerCase() === teen6SuitSubmitM[2].toLowerCase()
        );
        if (p && child) {
          latestMarket = p;
          latestRawOdds = child.b ?? 0;
        }
      } else if (j3SubmitM && String(control.slug).toLowerCase() === '3cardj') {
        latestMarket = marketList.find(
          (item) =>
            String(item?.sid ?? item?.i ?? '') ===
            (j3SubmitM[1].toLowerCase() === 'yes' ? '1' : '2')
        );
        latestRawOdds = latestMarket?.b ?? 0;
      } else if (
        lottSubmitM &&
        String(control.slug).toLowerCase() === 'lottcard'
      ) {
        const sidMap = { single: '1', double: '2', triple: '3' };
        latestMarket = marketList.find(
          (item) =>
            String(item?.sid ?? item?.i ?? '') ===
            sidMap[lottSubmitM[1].toLowerCase()]
        );
        latestRawOdds = latestMarket?.b ?? 0;
      } else if (
        abChildSubmitM &&
        ['ab3', 'ab4'].includes(String(control.slug).toLowerCase())
      ) {
        latestMarket = marketList.find(
          (item) => String(item?.sid ?? item?.i ?? '') === abChildSubmitM[1]
        );
        latestRawOdds = latestMarket?.b ?? 0;
      } else if (notenumSubmitM) {
        const p = marketList.find(
          (item) =>
            String(item?.sid ?? item?.i ?? '') === notenumSubmitM[1] &&
            Array.isArray(item?.odds)
        );
        const child = p?.odds?.find(
          (o) =>
            Number(o?.ssid ?? o?.sid ?? o?.sno) === Number(notenumSubmitM[2])
        );
        if (p && child) {
          latestMarket = p;
          latestRawOdds = child.b ?? 0;
        }
      } else if (nestedSubmitM) {
        const p = marketList.find(
          (item) =>
            String(item?.sid ?? item?.i ?? '') === nestedSubmitM[1] &&
            Array.isArray(item?.odds)
        );
        const child = p?.odds?.find(
          (o) =>
            String(o?.nat || '')
              .trim()
              .toLowerCase() === nestedSubmitM[2].toLowerCase()
        );
        if (p && child) {
          latestMarket = p;
          latestRawOdds =
            control.type === 'lay' ? (child.l ?? 0) : (child.b ?? 0);
        }
      } else {
        latestMarket = marketList.find(
          (item) =>
            String(item?.sid ?? item?.i ?? '') === String(control.selection)
        );
        const isLatestFancy2 =
          String(latestMarket?.etype || '').toLowerCase() === 'fancy2' &&
          (Number(latestMarket?.bbhav) > 0 || Number(latestMarket?.lbhav) > 0);
        const isLatestSicbo = SICBO_RATIO_SLUGS.has(
          String(control.slug || '').toLowerCase()
        );
        latestRawOdds = isLatestFancy2
          ? control.type === 'lay'
            ? Number(latestMarket?.lbhav) > 0
              ? Math.round((1 + Number(latestMarket.lbhav) / 100) * 100) / 100
              : 0
            : Number(latestMarket?.bbhav) > 0
              ? Math.round((1 + Number(latestMarket.bbhav) / 100) * 100) / 100
              : 0
          : control.type === 'lay'
            ? (latestMarket?.l ?? latestMarket?.lay)
            : isLatestSicbo
              ? Number(latestMarket?.b ?? 0) > 0
                ? Number(latestMarket.b) + 1
                : 0
              : (latestMarket?.b ?? latestMarket?.back ?? latestMarket?.odds);
      }
      const latestStatus = String(
        latestMarket?.gstatus ??
          latestMarket?.status ??
          (Number(latestMarket?.s) === 1 ? 'OPEN' : 'SUSPENDED')
      )
        .trim()
        .toUpperCase();
      const latestVisible = isMarketVisible(latestMarket);
      const latestOdds = Number(latestRawOdds);
      const latestSessionLine =
        control.sessionLine != null
          ? Number(control.type === 'lay' ? latestMarket?.l : latestMarket?.b)
          : null;

      if (
        isSuspended ||
        !latestMarket ||
        !latestVisible ||
        !['OPEN', 'ACTIVE'].includes(latestStatus) ||
        !Number.isFinite(latestOdds) ||
        latestOdds <= 1 ||
        Math.abs(latestOdds - oddsValue) > 0.01 ||
        (control.sessionLine != null &&
          (!Number.isFinite(latestSessionLine) ||
            Math.abs(latestSessionLine - Number(control.sessionLine)) > 0.01))
      ) {
        window.alert(
          'Market changed or is no longer available. Please select it again.'
        );
        betting.resetBettingState();
        return;
      }
    }

    dispatch(clearCasinoBetError());
    try {
      await dispatch(
        placeCasinoBet({
          slug: control.slug,
          roundId: String(control.roundId),
          side: control.type || 'back',
          selection: String(control.selection),
          nation: control.nat || String(control.selection),
          odds: oddsValue,
          stake,
          ...(control.sessionLine != null
            ? { sessionLine: control.sessionLine }
            : {}),
        })
      ).unwrap();

      betting.resetBettingState();

      dispatch(getUser());
      dispatch(getMyCasinoBets(control.slug));
      loadNationBook();
      window.dispatchEvent(new CustomEvent('casino:bet-placed'));

      window.alert('Bet placed successfully.');
    } catch (error) {
      console.error('CASINO BET ERROR:', error);

      window.alert(
        typeof error === 'string'
          ? error
          : error?.message || 'Unable to place bet.'
      );
    }
  }, [dispatch, betting, marketList, isSuspended, loadNationBook]);

  // =========================================
  // ROULETTE BET
  // =========================================

  const placeRouletteBet = useCallback(
    (cellId, spotName, odds = 36) => {
      if (isSuspended) {
        window.alert('Betting is currently suspended.');
        return;
      }

      setRouletteBets((previous) => ({
        ...previous,

        [cellId]: (previous[cellId] || 0) + 100,
      }));

      // Pass exact provider spot ID `cellId` (matches live API `i` directly without name mismatch)
      const side = ['roulette13', 'ourroullete'].includes(
        String(gameid || '').toLowerCase()
      )
        ? 'back'
        : rouletteMode;
      openBetSlip(String(cellId || spotName), odds, side, isMobile);
    },
    [isSuspended, openBetSlip, rouletteMode, isMobile, gameid]
  );

  // =========================================
  // BET VALUES
  // =========================================

  const stake = Number(betting?.betAmount) || 0;

  const odds = Number(betting?.betOdds) || 1.98;

  const isLay = betting?.betControl?.type === 'lay';

  // =========================================
  // CONTEXT VALUE
  // =========================================

  const value = useMemo(
    () => ({
      selectedGame: gameid || '',

      roundData,

      nationBook,

      isSuspended,

      openBetSlip,

      betSlip: {
        isOpen: Boolean(betting?.betControl),

        mode: slipMode,

        slug: betting?.betControl?.slug || gameid || '',

        roundId: betting?.betControl?.roundId || casinoData?.mid || '',

        nation: betting?.betControl?.nat || '',

        selection:
          betting?.betControl?.selection || betting?.betControl?.sid || '',

        odds,

        stake,

        profit: isLay ? stake : Math.round(stake * (odds - 1)),

        liability: isLay ? Math.round(stake * (odds - 1)) : stake,

        min: Number(betting?.betControl?.min ?? 100),

        max: Number(betting?.betControl?.max ?? 100000),

        type: isLay ? 'lay' : 'back',
      },

      refreshNationBook: loadNationBook,

      closeBetSlip,

      updateStake,

      adjustOdds,

      submitBet,

      rouletteMode,

      setRouletteMode,

      setStatisticsModalOpen,

      placeRouletteBet,

      rouletteBets,

      statisticsModalOpen,
    }),
    [
      gameid,
      casinoData?.mid,
      roundData,
      nationBook,
      loadNationBook,
      isSuspended,
      openBetSlip,
      betting,
      slipMode,
      odds,
      stake,
      isLay,
      closeBetSlip,
      updateStake,
      adjustOdds,
      submitBet,
      rouletteMode,
      placeRouletteBet,
      rouletteBets,
      statisticsModalOpen,
    ]
  );

  return (
    <CasinoContext.Provider value={value}>{children}</CasinoContext.Provider>
  );
}

// =========================================
// USE CASINO HOOK
// =========================================

export function useCasino() {
  const context = useContext(CasinoContext);

  if (!context) {
    throw new Error('useCasino must be used inside CasinoUiProvider');
  }

  return context;
}
