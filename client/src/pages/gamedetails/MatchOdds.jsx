
import { useEffect, useState } from 'react';
import { FaArrowRight, FaCheck } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../redux/api';
import { getUser } from '../../redux/reducer/authReducer';
import {
  clearCashoutValues,
  executeCashout,
  getPendingBet,
  getPendingBetAmo,
  updateCashoutValues,
} from '../../redux/reducer/betReducer';

function MatchOdds({
  onBetSelect,
  matchOddsList,
  pendingBetAmounts,
  selectedBet,
  gameid,
}) {
  const dispatch = useDispatch();

  const { eventName, cashoutValues, cashoutLoading, cashoutPL } =
    useSelector((state) => state.bet);

  const [showCashoutOptions, setShowCashoutOptions] = useState(false);
  const [cashedOutBetIds, setCashedOutBetIds] = useState(new Set());

  useEffect(() => {
    if (gameid) {
      dispatch(getPendingBetAmo(gameid));
      dispatch(getPendingBet(gameid));
    }
  }, [dispatch, gameid]);

  useEffect(() => {
    if (selectedBet) {
      setShowCashoutOptions(false);
      dispatch(clearCashoutValues());
    }
  }, [selectedBet, dispatch]);

  // API data
  const oddsData = matchOddsList?.[0]?.section?.length
    ? matchOddsList[0].section.map((sec) => ({
        team: sec.nat,
        sid: sec.sid,
        odds: sec.odds || [],
        max: sec.max,
        min: sec.min,
        mname:
          matchOddsList[0].mname === 'MATCH_ODDS'
            ? 'Match Odds'
            : 'Winner',
        status: matchOddsList[0].status,
      }))
    : [];

  const CASHOUT_GAME_TYPES = ['Match Odds', 'MATCH_ODDS'];

  const MATCH_ODDS_GAME_TYPES = [
    'Match Odds',
    'Winner',
    'MATCH_ODDS',
    'TOURNAMENT_WINNER',
  ];

  const getHistoryMarketBets = (marketName) => {
    const mname =
      marketName === 'MATCH_ODDS' ? 'Match Odds' : marketName;

    if (!Array.isArray(eventName) || !gameid) return [];

    return eventName
      .filter((b) => {
        if (String(b.gameId) !== String(gameid)) return false;

        const gt = (b.gameType || '').toLowerCase();

        return MATCH_ODDS_GAME_TYPES.some(
          (t) => t.toLowerCase() === gt
        );
      })
      .map((b) => ({
        gameType:
          b.gameType === 'MATCH_ODDS' ? 'Match Odds' : b.gameType,
        marketName: b.marketName,
        teamName: b.teamName,
        otype: b.otype,
        totalBetAmount: b.betAmount,
        totalPrice: b.price,
      }));
  };

  // Cashout calculations
  const marketBetsForCashout =
    Array.isArray(eventName) && oddsData?.[0]?.mname && gameid
      ? eventName.filter(
          (b) =>
            String(b.gameId) === String(gameid) &&
            CASHOUT_GAME_TYPES.includes(b.gameType) &&
            !b.isCashoutHedge &&
            !b.isCashedOut &&
            !cashedOutBetIds.has(String(b.betId || b._id))
        )
      : [];

  const uniqueMarketBetsForCashout =
    marketBetsForCashout.filter(
      (bet, index, arr) =>
        index ===
        arr.findIndex(
          (b) =>
            String(b.betId || b._id) ===
            String(bet.betId || bet._id)
        )
    );

  const hasCashoutAvailable =
    uniqueMarketBetsForCashout.length > 0;

  const marketCashoutPL =
    cashoutPL?.[oddsData?.[0]?.mname] || 0;

  const mergedCashoutValue =
    uniqueMarketBetsForCashout.reduce((sum, bet) => {
      const id = bet.betId || bet._id;
      const val = cashoutValues[id];

      return val !== undefined ? sum + val : sum;
    }, 0) + (marketCashoutPL || 0);

  const hasMergedValue = uniqueMarketBetsForCashout.some((bet) => {
    const id = bet.betId || bet._id;
    return cashoutValues[id] !== undefined;
  });

  const fetchCashoutQuotes = async () => {
    const betIds = uniqueMarketBetsForCashout
      .map((b) => b.betId || b._id)
      .filter(Boolean);

    if (betIds.length === 0) return;

    const results = await Promise.allSettled(
      betIds.map((betId) =>
        api.post(
          '/user/cashout/quote',
          { betId },
          { withCredentials: true }
        )
      )
    );

    const freshValues = {};

    for (const result of results) {
      if (
        result.status === 'fulfilled' &&
        result.value?.data?.cashoutAvailable
      ) {
        freshValues[result.value.data.betId] =
          result.value.data.cashoutValue;
      }
    }

    if (Object.keys(freshValues).length > 0) {
      dispatch(
        updateCashoutValues(
          Object.entries(freshValues).map(
            ([betId, cashoutValue]) => ({
              betId,
              cashoutValue,
            })
          )
        )
      );
    }
  };

  const handleCashOutClick = async () => {
    if (!hasCashoutAvailable || cashoutLoading) return;

    const betIds = uniqueMarketBetsForCashout
      .map((b) => b.betId || b._id)
      .filter(Boolean);

    for (const id of betIds) {
      const result = await dispatch(executeCashout(id));

      if (result.meta?.requestStatus === 'fulfilled') {
        setCashedOutBetIds((prev) => new Set(prev).add(id));
      } else {
        toast.error(
          result.payload?.message ||
            'Cashout failed. Please try again.'
        );
      }
    }

    setShowCashoutOptions(false);
    dispatch(clearCashoutValues());

    await dispatch(getUser());

    if (gameid) {
      await dispatch(getPendingBetAmo(gameid));
      await dispatch(getPendingBet(gameid));
    }

    setCashedOutBetIds(new Set());
  };

  // Stake formatter
  const formatStake = (size) => {
    if (!size || size === 0) return '0';

    if (size < 1000) return size.toFixed(2);

    return `${(size / 1000).toFixed(1)}k`;
  };

  const getMarketBets = (marketName) => {
    const historyBets = getHistoryMarketBets(marketName);

    const amountBets =
      pendingBetAmounts?.filter(
        (item) =>
          item.gameType === 'Match Odds' ||
          item.gameType === marketName
      ) || [];

    return historyBets.length > 0
      ? historyBets
      : amountBets;
  };

  const getMarketCashoutPL = (marketName) => {
    const mname =
      marketName === 'MATCH_ODDS' ? 'Match Odds' : marketName;

    return cashoutPL?.[mname] || 0;
  };

  // Net outcome
  const computeNetOutcome = (
    team,
    marketBets,
    mCashoutPL = 0
  ) => {
    let netOutcome = 0;

    marketBets.forEach((bet) => {
      const isBetOnThisTeam =
        bet.teamName?.toLowerCase() === team?.toLowerCase();

      const betAmt = parseFloat(bet.totalBetAmount) || 0;
      const stake = parseFloat(bet.totalPrice) || 0;

      if (bet.otype === 'back') {
        netOutcome += isBetOnThisTeam ? betAmt : -stake;
      } else {
        netOutcome += isBetOnThisTeam ? -stake : betAmt;
      }
    });

    return Math.round((netOutcome + mCashoutPL) * 100) / 100;
  };

  const buildPendingBetLeg = (bet) => {
    if (!bet?.stake || !bet?.odds || !bet?.team || !bet?.type) {
      return null;
    }

    const stakeNum = parseFloat(bet.stake);
    const oddsNum = parseFloat(bet.odds);

    if (
      isNaN(stakeNum) ||
      isNaN(oddsNum) ||
      stakeNum <= 0
    ) {
      return null;
    }

    const isLay = bet.type === 'lay';

    return {
      teamName: bet.team,
      otype: bet.type,
      totalBetAmount: isLay
        ? stakeNum
        : stakeNum * (oddsNum - 1),
      totalPrice: isLay
        ? stakeNum * (oddsNum - 1)
        : stakeNum,
    };
  };

  const getProjectedNetOutcome = (
    team,
    marketName,
    bet
  ) => {
    const pendingLeg = buildPendingBetLeg(bet);

    if (!pendingLeg) return null;

    const marketBets = getMarketBets(marketName);

    return computeNetOutcome(
      team,
      [...marketBets, pendingLeg],
      getMarketCashoutPL(marketName)
    );
  };

  const getBetDetails = (team, marketName) => {
    const mCashoutPL = getMarketCashoutPL(marketName);
    const marketBets = getMarketBets(marketName);

    const matchedTeamBet = marketBets.find(
      (item) =>
        item.teamName?.toLowerCase() === team?.toLowerCase()
    );

    const otherTeamBet = marketBets[0];

    const otype =
      matchedTeamBet?.otype || otherTeamBet?.otype || '';

    const totalBetAmount =
      matchedTeamBet?.totalBetAmount ||
      otherTeamBet?.totalBetAmount ||
      '';

    const totalPrice =
      matchedTeamBet?.totalPrice ||
      otherTeamBet?.totalPrice ||
      '';

    const teamName =
      matchedTeamBet?.teamName ||
      otherTeamBet?.teamName ||
      '';

    if (marketBets.length === 0) {
      if (mCashoutPL) {
        return {
          isHedged: true,
          netOutcome: Math.round(mCashoutPL * 100) / 100,
          otype: '',
          totalBetAmount: '',
          totalPrice: '',
          teamName: '',
        };
      }

      return {
        isHedged: false,
        netOutcome: null,
        otype,
        totalBetAmount,
        totalPrice,
        teamName,
      };
    }

    return {
      isHedged: true,
      netOutcome: computeNetOutcome(
        team,
        marketBets,
        mCashoutPL
      ),
      otype,
      totalBetAmount,
      totalPrice,
      teamName,
    };
  };

  // Bet selection
  const handleOddsClick = (
    team,
    rate,
    type,
    sid,
    oname
  ) => {
    if (onBetSelect && rate) {
      const allTeams = oddsData.map((item) => item.team);

      const marketName =
        matchOddsList?.[0]?.mname || 'MATCH_ODDS';

      const gameType =
        marketName === 'MATCH_ODDS' ||
        marketName === 'TOURNAMENT_WINNER'
          ? 'Match Odds'
          : 'Winner';

      onBetSelect({
        team,
        odds: rate.toString(),
        type,
        oname: oname || '',
        stake: '',
        teams: allTeams,
        marketName,
        gameType,
        maxAmount:
          matchOddsList?.[0]?.max ||
          matchOddsList?.[0]?.maxb ||
          0,
        minAmount: matchOddsList?.[0]?.min || 0,
      });
    }
  };

  const maxValue =
    matchOddsList?.[0]?.max ||
    matchOddsList?.[0]?.maxb ||
    0;

  // Market suspended status
  const isMarketSuspended =
    String(matchOddsList?.[0]?.status || '').toUpperCase() ===
    'SUSPENDED';

  return (
    <div className="w-full min-w-0 overflow-hidden bg-white">

      {/* MATCH ODDS HEADER */}
      <div className="flex h-[30px] items-center justify-between bg-[#4b5b6b] px-2 text-white">

        <span className="text-[13px] font-bold">
          MATCH_ODDS
        </span>

        {hasCashoutAvailable && showCashoutOptions ? (
          <button
            type="button"
            disabled={!hasMergedValue || cashoutLoading}
            onClick={handleCashOutClick}
            className={`flex h-[25px] items-center gap-1 px-3 text-[11px] font-semibold text-white ${
              hasMergedValue && !cashoutLoading
                ? 'cursor-pointer bg-[#198754]'
                : 'cursor-not-allowed bg-[#198754] opacity-60'
            }`}
          >
            <FaCheck className="text-[10px]" />

            {hasMergedValue
              ? `₹ ${mergedCashoutValue.toFixed(2)}`
              : cashoutLoading
                ? '...'
                : marketCashoutPL
                  ? `₹ ${marketCashoutPL}`
                  : 'Cashout'}
          </button>
        ) : hasCashoutAvailable ? (
          <button
            type="button"
            onClick={() => {
              setShowCashoutOptions(true);
              fetchCashoutQuotes();
            }}
            className="h-[25px] cursor-pointer bg-[#198754] px-3 text-[11px] font-semibold text-white"
          >
            Cashout
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="h-[25px] cursor-not-allowed bg-[#198754] px-3 text-[11px] font-semibold text-white opacity-60"
          >
            Cashout
          </button>
        )}

      </div>

      {/* MAX / BACK / LAY HEADER */}
      <div className="grid h-[24px] grid-cols-[minmax(0,1fr)_68px_68px] border-b border-[#c7c8ca]">

        <div className="flex items-center px-1 text-[12px] font-bold text-[#097c93]">
          Max: {maxValue}
        </div>

        <div className="flex items-center justify-center border-l border-white bg-[#72bbef] text-[13px] font-bold text-[#333]">
          Back
        </div>

        <div className="flex items-center justify-center border-l border-white bg-[#faa9ba] text-[13px] font-bold text-[#333]">
          Lay
        </div>

      </div>

      {/* TEAM ROWS */}
      {oddsData.length > 0 ? (
        <div className="relative">

          {oddsData.map(({ team, odds, sid }, teamIndex) => {

            // First available Back and Lay odds
            const backOdds = (odds || [])
              .filter(
                (odd) =>
                  odd.otype === 'back' &&
                  Number(odd.odds) > 0
              )
              .slice(0, 1);

            const layOdds = (odds || [])
              .filter(
                (odd) =>
                  odd.otype === 'lay' &&
                  Number(odd.odds) > 0
              )
              .slice(0, 1);

            const backItem = backOdds[0];
            const layItem = layOdds[0];

            const renderOddsCell = (item, type) => {
              const formattedOdds = item?.odds;

              return (
                <button
                  key={`${type}-${sid}`}
                  type="button"
                  disabled={
                    isMarketSuspended || !formattedOdds
                  }
                  onClick={() => {
                    if (!isMarketSuspended && formattedOdds) {
                      handleOddsClick(
                        team,
                        formattedOdds,
                        type,
                        sid,
                        item?.oname
                      );
                    }
                  }}
                  className={`
                    flex h-[33px] min-w-0 flex-col
                    items-center justify-center
                    border-l border-white/50
                    ${
                      isMarketSuspended
                        ? type === 'back'
                          ? 'bg-[#414d57]'
                          : 'bg-[#57484d]'
                        : type === 'back'
                          ? 'bg-[#72bbef]'
                          : 'bg-[#faa9ba]'
                    }
                    ${
                      !isMarketSuspended && formattedOdds
                        ? 'cursor-pointer hover:brightness-95'
                        : 'cursor-not-allowed'
                    }
                  `}
                >
                  {!isMarketSuspended && formattedOdds ? (
                    <>
                      <span className="text-[13px] font-bold leading-[15px] text-[#333]">
                        {formattedOdds}
                      </span>

                      <span className="text-[9px] leading-[11px] text-[#333]">
                        {formatStake(item.size)}
                      </span>
                    </>
                  ) : (
                    <span
                      className={`text-[12px] font-bold ${
                        isMarketSuspended
                          ? 'text-[#333]'
                          : 'text-[#333]'
                      }`}
                    >
                      -
                    </span>
                  )}
                </button>
              );
            };

            return (
              <div
                key={teamIndex}
                className="grid min-h-[33px] grid-cols-[minmax(0,1fr)_68px_68px] border-b border-[#c7c8ca] hover:bg-[#f7f7f7]"
              >

                {/* TEAM NAME + P/L */}
                <div className="flex min-w-0 flex-col justify-center px-1">

                  <span className="truncate text-[12px] font-medium leading-[16px] text-[#333]">
                    {team}
                  </span>

                  {(() => {
                    const isMatchOddsBet =
                      selectedBet?.gameType === 'Match Odds' ||
                      selectedBet?.gameType === 'Winner' ||
                      selectedBet?.marketName === 'MATCH_ODDS' ||
                      selectedBet?.marketName === 'TOURNAMENT_WINNER';

                    const {
                      otype,
                      totalBetAmount,
                      totalPrice,
                      teamName,
                      isHedged,
                      netOutcome,
                    } = getBetDetails(
                      team,
                      matchOddsList?.[0]?.mname
                    );

                    const isMatchedTeam =
                      teamName?.toLowerCase() ===
                      team?.toLowerCase();

                    const existingBet =
                      isHedged ||
                      (otype && totalBetAmount) ||
                      (totalPrice && teamName && isMatchedTeam);

                    if (isMatchOddsBet && selectedBet?.stake) {
                      const projectedNet = getProjectedNetOutcome(
                        team,
                        matchOddsList?.[0]?.mname,
                        selectedBet
                      );

                      const suggestionValue = projectedNet;

                      const suggestionColor =
                        projectedNet === null
                          ? 'green'
                          : projectedNet >= 0
                            ? 'green'
                            : 'red';

                      if (existingBet) {
                        let betColor;
                        let displayValue;

                        if (isHedged && netOutcome !== null) {
                          displayValue = netOutcome;
                          betColor =
                            netOutcome >= 0 ? 'green' : 'red';
                        } else {
                          betColor =
                            otype === 'lay'
                              ? isMatchedTeam
                                ? 'red'
                                : 'green'
                              : otype === 'back'
                                ? isMatchedTeam
                                  ? 'green'
                                  : 'red'
                                : 'green';

                          displayValue = (() => {
                            if (otype === 'lay') {
                              return isMatchedTeam
                                ? totalPrice
                                : totalBetAmount;
                            }

                            if (otype === 'back') {
                              return isMatchedTeam
                                ? totalBetAmount
                                : totalPrice;
                            }

                            return '';
                          })();
                        }

                        return (
                          <div
                            className="flex gap-1 leading-3"
                            style={{ color: betColor }}
                          >
                            {displayValue !== '' &&
                              displayValue !== null &&
                              displayValue !== undefined && (
                                <span className="flex items-center gap-0.5 text-[9px]">
                                  <FaArrowRight />
                                  {parseFloat(displayValue).toFixed(2)}
                                </span>
                              )}

                            {suggestionValue !== null && (
                              <span
                                style={{ color: suggestionColor }}
                                className="text-[9px]"
                              >
                                ({suggestionValue.toFixed(2)})
                              </span>
                            )}
                          </div>
                        );
                      } else if (suggestionValue !== null) {
                        return (
                          <span
                            style={{ color: suggestionColor }}
                            className="text-[9px] leading-3"
                          >
                            ({suggestionValue.toFixed(2)})
                          </span>
                        );
                      }
                    } else if (existingBet) {
                      let betColor;
                      let displayValue;

                      if (isHedged && netOutcome !== null) {
                        displayValue = netOutcome;
                        betColor =
                          netOutcome >= 0 ? 'green' : 'red';
                      } else {
                        betColor =
                          otype === 'lay'
                            ? isMatchedTeam
                              ? 'red'
                              : 'green'
                            : otype === 'back'
                              ? isMatchedTeam
                                ? 'green'
                                : 'red'
                              : 'green';

                        displayValue = (() => {
                          if (otype === 'lay') {
                            return isMatchedTeam
                              ? totalPrice
                              : totalBetAmount;
                          }

                          if (otype === 'back') {
                            return isMatchedTeam
                              ? totalBetAmount
                              : totalPrice;
                          }

                          return '';
                        })();
                      }

                      return (
                        <div
                          className="flex gap-1 leading-3"
                          style={{ color: betColor }}
                        >
                          {displayValue !== '' &&
                            displayValue !== null &&
                            displayValue !== undefined && (
                              <span className="flex items-center gap-0.5 text-[9px]">
                                <FaArrowRight />
                                {parseFloat(displayValue).toFixed(2)}
                              </span>
                            )}
                        </div>
                      );
                    }

                    return null;
                  })()}

                </div>

                {/* BACK */}
                {renderOddsCell(backItem, 'back')}

                {/* LAY */}
                {renderOddsCell(layItem, 'lay')}

              </div>
            );
          })}

          {/* SUSPENDED OVERLAY */}
          {isMarketSuspended && (
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-[136px] items-center justify-center">
              <span className="whitespace-nowrap text-[13px] font-bold text-red-600">
                SUSPENDED
              </span>
            </div>
          )}

        </div>
      ) : (
        <div className="py-3 text-center text-[12px] text-gray-500">
          No match odds available
        </div>
      )}

    </div>
  );
}

export default MatchOdds;
