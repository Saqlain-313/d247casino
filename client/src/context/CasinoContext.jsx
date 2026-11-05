
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useDispatch } from 'react-redux';
import { getUser } from '../redux/reducer/authReducer';
import { placeCasinoBet } from '../redux/reducer/casinoBetSlice';

const CasinoContext = createContext(null);

// =========================================
// NORMALIZE SELECTION
// =========================================
const normalizeSelection = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/^roulette\s*:\s*/, '')
    .replace(/[^a-z0-9]/g, '');

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
  const [slipMode, setSlipMode] = useState(
    isMobile ? 'mobile' : 'desktop'
  );

  // =========================================
  // FIX: NORMALIZE API RESPONSE
  // Supports:
  // { message, data: { mid, sub } }
  // { data: { message, data: { mid, sub } } }
  // { mid, sub }
  // =========================================

  const casinoData =
    bettingData?.data?.data ??
    bettingData?.data ??
    bettingData ??
    {};

  // =========================================
  // PROVIDER MARKETS
  // =========================================

  const marketList = Array.isArray(casinoData?.sub)
    ? casinoData.sub
    : [];

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

  const isSuspended = Boolean(
    String(casinoData?.gstatus || '').toUpperCase() === 'SUSPENDED' ||
    String(casinoData?.status || '').toUpperCase() === 'SUSPENDED' ||
    (
      marketList.length > 0 &&
      marketList.every(
        (item) =>
          String(item?.gstatus || '').toUpperCase() !== 'ACTIVE'
      )
    )
  );

  // =========================================
  // MARKET MAPPING
  // =========================================

  const marketMap = useMemo(() => {
    const map = {};

    marketList.forEach((item) => {
      const providerId = item?.sid ?? item?.i;

      const entry = {
        back: String(
          item?.b ?? item?.back ?? item?.odds ?? ''
        ),

        lay: String(
          item?.l ?? item?.lay ?? ''
        ),

        nat:
          item?.nat ??
          item?.n ??
          item?.name ??
          item?.label ??
          '',

        sid: providerId != null
          ? String(providerId)
          : '',

        gstatus: item?.gstatus,

        min: Number(item?.min ?? 100),

        max: Number(item?.max ?? 100000),
      };

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
          (value) =>
            value !== undefined &&
            value !== null &&
            value !== ''
        )
        .forEach((alias) => {
          const key = normalizeSelection(alias);

          if (key && !map[key]) {
            map[key] = entry;
          }
        });
    });

    return map;
  }, [marketList]);

  // =========================================
  // CURRENT ROUND DATA
  // =========================================

  const roundData = useMemo(
    () => ({
      ...casinoData,

      markets: marketMap,

      remark: casinoData?.remark || '',

      roundId: casinoData?.mid
        ? String(casinoData.mid)
        : '',
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

      // Find actual provider selection
      const selectedMarket = marketList.find((item) => {
        const providerId = item?.sid ?? item?.i;

        const providerNames = [
          item?.nat,
          item?.n,
          item?.name,
          item?.label,
          item?.selection,
          item?.selectionName,
        ];

        const nameMatches = providerNames.some(
          (name) =>
            normalizeSelection(name) === lookupNation
        );

        const idMatches =
          providerId !== undefined &&
          providerId !== null &&
          String(providerId) === String(nation);

        return nameMatches || idMatches;
      });

      // Selection not found
      if (!selectedMarket) {
        console.error(
          'Provider selection mapping failed:',
          {
            requested: nation,
            game: gameid,
            round: casinoData?.mid,
            providerMarkets: marketList,
          }
        );

        window.alert(
          `Provider selection not found for "${nation}".`
        );

        return;
      }

      // Provider SID / ID
      const providerId =
        selectedMarket.sid ?? selectedMarket.i;

      if (
        providerId === undefined ||
        providerId === null
      ) {
        window.alert('Provider selection ID is missing.');
        return;
      }

      // Market status
      if (
        String(selectedMarket.gstatus || '').toUpperCase() !== 'ACTIVE'
      ) {
        window.alert(
          'This selection is suspended by the provider.'
        );
        return;
      }

      // Odds validation
      const numericOdds = Number.parseFloat(odds);

      if (
        !Number.isFinite(numericOdds) ||
        numericOdds <= 1
      ) {
        window.alert(
          'Valid odds are not available for this selection.'
        );
        return;
      }

      setSlipMode(
        mobile ? 'mobile' : 'desktop'
      );

      // Set bet control
      betting.setBetControl({
        nat: String(
          selectedMarket.nat ??
          selectedMarket.n ??
          selectedMarket.name ??
          nation
        ),

        sid: String(providerId),

        selection: String(providerId),

        type: type === 'lay' ? 'lay' : 'back',

        min: Number(selectedMarket.min ?? 100),

        max: Number(selectedMarket.max ?? 100000),

        slug: String(gameid || ''),

        roundId: String(casinoData?.mid || ''),
      });

      betting.setBetOdds(numericOdds);

      betting.setBetAmount(0);
    },
    [
      betting,
      isSuspended,
      isMobile,
      gameid,
      casinoData?.mid,
      marketList,
    ]
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
      const amount = Math.max(
        0,
        Number(value) || 0
      );

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
        Math.max(
          1.01,
          Number(
            (Number(previous || 1.98) + delta).toFixed(2)
          )
        )
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

    if (
      !control?.slug ||
      !control?.roundId ||
      !control?.selection
    ) {
      window.alert(
        'Game, round or provider selection is missing.'
      );
      return;
    }

    if (
      !Number.isFinite(stake) ||
      stake < Number(control.min || 1)
    ) {
      window.alert(
        `Minimum bet amount is ${control.min || 1}`
      );
      return;
    }

    if (
      stake > Number(control.max || Infinity)
    ) {
      window.alert(
        `Maximum bet amount is ${control.max}`
      );
      return;
    }

    if (
      !Number.isFinite(oddsValue) ||
      oddsValue <= 1
    ) {
      window.alert('Invalid odds.');
      return;
    }

    try {
      console.log('SUBMITTING CASINO BET:', {
        slug: control.slug,
        roundId: control.roundId,
        selection: control.selection,
        side: control.type,
        odds: oddsValue,
        stake,
      });

      await dispatch(
        placeCasinoBet({
          slug: control.slug,

          roundId: String(control.roundId),

          side: control.type || 'back',

          selection: String(control.selection),

          odds: oddsValue,

          stake,
        })
      ).unwrap();

      betting.resetBettingState();

      dispatch(getUser());

      window.alert('Bet placed successfully.');

    } catch (error) {
      console.error('CASINO BET ERROR:', error);

      window.alert(
        typeof error === 'string'
          ? error
          : error?.message || 'Unable to place bet.'
      );
    }
  }, [dispatch, betting]);

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

        [cellId]:
          (previous[cellId] || 0) + 100,
      }));

      openBetSlip(
        `Roulette: ${spotName}`,
        odds,
        rouletteMode,
        isMobile
      );
    },
    [
      isSuspended,
      openBetSlip,
      rouletteMode,
      isMobile,
    ]
  );

  // =========================================
  // BET VALUES
  // =========================================

  const stake =
    Number(betting?.betAmount) || 0;

  const odds =
    Number(betting?.betOdds) || 1.98;

  const isLay =
    betting?.betControl?.type === 'lay';

  // =========================================
  // CONTEXT VALUE
  // =========================================

  const value = useMemo(
    () => ({
      selectedGame: gameid || '',

      roundData,

      isSuspended,

      openBetSlip,

      betSlip: {
        isOpen: Boolean(betting?.betControl),

        mode: slipMode,

        slug:
          betting?.betControl?.slug ||
          gameid ||
          '',

        roundId:
          betting?.betControl?.roundId ||
          casinoData?.mid ||
          '',

        nation:
          betting?.betControl?.nat || '',

        selection:
          betting?.betControl?.selection ||
          betting?.betControl?.sid ||
          '',

        odds,

        stake,

        profit: isLay
          ? stake
          : Math.round(stake * (odds - 1)),

        liability: isLay
          ? Math.round(stake * (odds - 1))
          : stake,

        type: isLay ? 'lay' : 'back',
      },

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
    <CasinoContext.Provider value={value}>
      {children}
    </CasinoContext.Provider>
  );
}

// =========================================
// USE CASINO HOOK
// =========================================

export function useCasino() {
  const context = useContext(CasinoContext);

  if (!context) {
    throw new Error(
      'useCasino must be used inside CasinoUiProvider'
    );
  }

  return context;
}
