
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const CasinoContext = createContext(null);

export function CasinoUiProvider({
  children,
  gameid,
  bettingData,
  betting,
  isMobile,
}) {
  const [rouletteMode, setRouletteMode] = useState('back');
  const [rouletteBets, setRouletteBets] = useState({});
  const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);
  const [slipMode, setSlipMode] = useState(isMobile ? 'mobile' : 'desktop');

  const isSuspended = Boolean(
    bettingData?.gstatus === 'SUSPENDED' ||
    bettingData?.status === 'SUSPENDED' ||
    bettingData?.sub?.some(
      (item) => item?.gstatus === 'SUSPENDED'
    )
  );

  // -----------------------------------------
  // MARKET MAPPING
  // -----------------------------------------
  const marketMap = useMemo(() => {
    const map = {};

    (bettingData?.sub || []).forEach((item) => {
      const back = item?.b ?? item?.back ?? item?.odds ?? '1.98';
      const lay = item?.l ?? item?.lay ?? '2.02';

      const entry = {
        back: String(back),
        lay: String(lay),
        nat: item?.nat,
      };

      [item?.nat, item?.subtype, item?.sid != null ? String(item.sid) : null]
        .filter(Boolean)
        .forEach((key) => {
          const raw = String(key);
          const normalized = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
          const camel = raw
            .toLowerCase()
            .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase());

          if (raw && !map[raw]) map[raw] = entry;
          if (normalized && !map[normalized]) map[normalized] = entry;
          if (camel && !map[camel]) map[camel] = entry;
        });
    });

    return map;
  }, [bettingData?.sub]);

  // -----------------------------------------
  // CURRENT ROUND DATA
  // -----------------------------------------
  const roundData = useMemo(
    () => ({
      ...(bettingData || {}),
      markets: marketMap,
      remark: bettingData?.remark || '',
      roundId: bettingData?.mid || '',
    }),
    [bettingData, marketMap]
  );

  // -----------------------------------------
  // OPEN BET SLIP
  // -----------------------------------------
  const openBetSlip = useCallback(
    (nation, odds, type = 'back', mobile = isMobile) => {
      if (isSuspended) return;

      const numericOdds = Number.parseFloat(odds) || 1.98;

      setSlipMode(mobile ? 'mobile' : 'desktop');

      betting.setBetControl({
        nat: String(nation || 'Selection'),
        sid: `ui-${String(nation || 'selection')}`,
        type: type === 'lay' ? 'lay' : 'back',
        min: 100,
        max: 100000,

        // Required casino API information
        slug: String(gameid || ''),
        roundId: String(bettingData?.mid || ''),
      });

      betting.setBetOdds(numericOdds);
      betting.setBetAmount(0);
    },
    [betting, isSuspended, isMobile, gameid, bettingData?.mid]
  );

  // -----------------------------------------
  // CLOSE BET SLIP
  // -----------------------------------------
  const closeBetSlip = useCallback(() => {
    betting.resetBettingState();
  }, [betting]);

  // -----------------------------------------
  // UPDATE STAKE
  // -----------------------------------------
  const updateStake = useCallback(
    (value) => {
      const amount = Math.max(0, Number(value) || 0);
      betting.updateAmount(amount);
    },
    [betting]
  );

  // -----------------------------------------
  // ADJUST ODDS
  // -----------------------------------------
  const adjustOdds = useCallback(
    (delta) => {
      betting.setBetOdds((previous) =>
        Math.max(
          1.01,
          Number((Number(previous || 1.98) + delta).toFixed(2))
        )
      );
    },
    [betting]
  );

  // -----------------------------------------
  // LEGACY SUBMIT
  // -----------------------------------------
  const submitBet = useCallback(() => {
    const control = betting.betControl;

    if (!control) return;

    betting.placeBet(
      control.type || 'back',
      control.nat,
      control.max || 100000,
      betting.betOdds,
      betting.selectedTeamSubtype
    );
  }, [betting]);

  // -----------------------------------------
  // ROULETTE BET
  // -----------------------------------------
  const placeRouletteBet = useCallback(
    (cellId, spotName, odds = 36) => {
      if (isSuspended) return;

      setRouletteBets((previous) => ({
        ...previous,
        [cellId]: (previous[cellId] || 0) + 100,
      }));

      openBetSlip(
        `Roulette: ${spotName}`,
        odds,
        rouletteMode,
        isMobile
      );
    },
    [isSuspended, openBetSlip, rouletteMode, isMobile]
  );

  // -----------------------------------------
  // BET VALUES
  // -----------------------------------------
  const stake = Number(betting?.betAmount) || 0;
  const odds = Number(betting?.betOdds) || 1.98;
  const isLay = betting?.betControl?.type === 'lay';

  // -----------------------------------------
  // CONTEXT VALUE
  // -----------------------------------------
  const value = useMemo(
    () => ({
      selectedGame: gameid || '',
      roundData,
      isSuspended,

      openBetSlip,

      betSlip: {
        isOpen: Boolean(betting?.betControl),
        mode: slipMode,

        // Casino Redux API fields
        slug: betting?.betControl?.slug || gameid || '',
        roundId:
          betting?.betControl?.roundId ||
          bettingData?.mid ||
          '',

        nation: betting?.betControl?.nat || '',
        selection: betting?.betControl?.nat || '',

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
      bettingData?.mid,
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

export function useCasino() {
  const context = useContext(CasinoContext);

  if (!context) {
    throw new Error(
      'useCasino must be used inside CasinoUiProvider'
    );
  }

  return context;
}
