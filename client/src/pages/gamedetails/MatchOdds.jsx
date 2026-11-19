import { useEffect, useState } from 'react';
import { FaArrowRight, FaCheck } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../redux/api';
import {
  isMarketSuspended as marketSuspendedByGscode,
  isRunnerSuspended as runnerSuspendedByGscode,
  marketSuspensionText,
  runnerSuspensionText,
} from '../../utils/suspension';
import SuspendedOverlay from './components/SuspendedOverlay';
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

  const { eventName, cashoutValues, cashoutLoading, cashoutPL } = useSelector(
    (state) => state.bet
  );

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
        gstatus: sec.gstatus,
        gscode: sec.gscode,
        mname:
          matchOddsList[0].mname === 'MATCH_ODDS' ? 'Match Odds' : 'Winner',
        status: matchOddsList[0].status,
      }))
    : [];

  // Reference D247 cashout rule (776178602-new.devtools): only 2-runner match / match1 markets
  const primaryGtype = String(
    matchOddsList?.[0]?.gtype || 'match'
  ).toLowerCase();
  const isCashoutMarketEligible =
    oddsData.length === 2 &&
    (primaryGtype === 'match' || primaryGtype === 'match1');

  const MATCH_ODDS_GAME_TYPES = [
    'Match Odds',
    'Winner',
    'MATCH_ODDS',
    'TOURNAMENT_WINNER',
  ];

  const currentMarketMname = matchOddsList?.[0]?.mname || 'MATCH_ODDS';
  const matchesPrimaryMarketName = (value) => {
    if (!value) return true;
    const norm = String(value).replace(/\s+/g, ' ').trim().toLowerCase();
    if (currentMarketMname === 'TOURNAMENT_WINNER') {
      return norm === 'tournament_winner' || norm === 'winner';
    }
    return norm === 'match_odds' || norm === 'match odds';
  };

  const getHistoryMarketBets = () => {
    if (!Array.isArray(eventName) || !gameid) return [];

    return eventName
      .filter((b) => {
        if (String(b.gameId) !== String(gameid)) return false;

        const gt = (b.gameType || '').toLowerCase();

        return (
          MATCH_ODDS_GAME_TYPES.some((t) => t.toLowerCase() === gt) &&
          matchesPrimaryMarketName(b.marketName)
        );
      })
      .map((b) => ({
        gameType: b.gameType === 'MATCH_ODDS' ? 'Match Odds' : b.gameType,
        marketName: b.marketName,
        teamName: b.teamName,
        otype: b.otype,
        totalBetAmount: b.betAmount,
        totalPrice: b.price,
      }));
  };

  // Cashout calculations (strictly D247 schema-driven: 2-runner match/match1)
  const marketBetsForCashout =
    isCashoutMarketEligible &&
    Array.isArray(eventName) &&
    oddsData?.[0]?.mname &&
    gameid
      ? eventName.filter(
          (b) =>
            String(b.gameId) === String(gameid) &&
            matchesPrimaryMarketName(b.marketName) &&
            !b.isCashoutHedge &&
            !b.isCashedOut &&
            !cashedOutBetIds.has(String(b.betId || b._id))
        )
      : [];

  const uniqueMarketBetsForCashout = marketBetsForCashout.filter(
    (bet, index, arr) =>
      index ===
      arr.findIndex(
        (b) => String(b.betId || b._id) === String(bet.betId || bet._id)
      )
  );

  const hasCashoutAvailable =
    isCashoutMarketEligible && uniqueMarketBetsForCashout.length > 0;

  const marketCashoutPL = cashoutPL?.[oddsData?.[0]?.mname] || 0;

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
        api.post('/user/cashout/quote', { betId }, { withCredentials: true })
      )
    );

    const freshValues = {};

    for (const result of results) {
      if (
        result.status === 'fulfilled' &&
        result.value?.data?.cashoutAvailable
      ) {
        freshValues[result.value.data.betId] = result.value.data.cashoutValue;
      }
    }

    if (Object.keys(freshValues).length > 0) {
      dispatch(
        updateCashoutValues(
          Object.entries(freshValues).map(([betId, cashoutValue]) => ({
            betId,
            cashoutValue,
          }))
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
          result.payload?.message || 'Cashout failed. Please try again.'
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

  // Reference-site market max format: >=1L -> "2.5L", >=1K -> "25K"
  const formatMarketMax = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return '-';
    if (n >= 1e5) return `${parseFloat((n / 1e5).toFixed(2))}L`;
    if (n >= 1e3) return `${parseFloat((n / 1e3).toFixed(2))}K`;
    return String(n);
  };

  const getMarketBets = (marketName) => {
    const historyBets = getHistoryMarketBets(marketName);

    const amountBets =
      pendingBetAmounts?.filter(
        (item) =>
          (item.gameType === 'Match Odds' || item.gameType === marketName) &&
          matchesPrimaryMarketName(item.marketName)
      ) || [];

    return historyBets.length > 0 ? historyBets : amountBets;
  };

  const getMarketCashoutPL = (marketName) => {
    const mname = marketName === 'MATCH_ODDS' ? 'Match Odds' : marketName;

    return cashoutPL?.[mname] || 0;
  };

  // Net outcome
  const computeNetOutcome = (team, marketBets, mCashoutPL = 0) => {
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

    if (isNaN(stakeNum) || isNaN(oddsNum) || stakeNum <= 0) {
      return null;
    }

    const isLay = bet.type === 'lay';

    return {
      teamName: bet.team,
      otype: bet.type,
      totalBetAmount: isLay ? stakeNum : stakeNum * (oddsNum - 1),
      totalPrice: isLay ? stakeNum * (oddsNum - 1) : stakeNum,
    };
  };

  const getProjectedNetOutcome = (team, marketName, bet) => {
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
      (item) => item.teamName?.toLowerCase() === team?.toLowerCase()
    );

    const otherTeamBet = marketBets[0];

    const otype = matchedTeamBet?.otype || otherTeamBet?.otype || '';

    const totalBetAmount =
      matchedTeamBet?.totalBetAmount || otherTeamBet?.totalBetAmount || '';

    const totalPrice =
      matchedTeamBet?.totalPrice || otherTeamBet?.totalPrice || '';

    const teamName = matchedTeamBet?.teamName || otherTeamBet?.teamName || '';

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
      netOutcome: computeNetOutcome(team, marketBets, mCashoutPL),
      otype,
      totalBetAmount,
      totalPrice,
      teamName,
    };
  };

  // Bet selection
  const handleOddsClick = (team, rate, type, sid, oname) => {
    if (onBetSelect && rate) {
      const allTeams = oddsData.map((item) => item.team);

      const marketName = matchOddsList?.[0]?.mname || 'MATCH_ODDS';

      const gameType =
        marketName === 'MATCH_ODDS' || marketName === 'TOURNAMENT_WINNER'
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
        gType: 'match',
        maxAmount: matchOddsList?.[0]?.max || matchOddsList?.[0]?.maxb || 0,
        minAmount: matchOddsList?.[0]?.min || 0,
      });
    }
  };

  const market0 = matchOddsList?.[0];
  const maxValue = market0?.max || market0?.maxb || 0;

  // Reference: suspension gscode-only (status string sirf overlay text hy).
  const isMarketSuspended = marketSuspendedByGscode(market0);

  // Reference jitni depth dikhata hai: max back/lay count per runner (cap 3)
  const depth = Math.min(
    3,
    Math.max(
      1,
      ...oddsData.map((r) => {
        const odds = r.odds || [];
        return Math.max(
          odds.filter((o) => o.otype === 'back').length,
          odds.filter((o) => o.otype === 'lay').length
        );
      })
    )
  );
  // Bookmaker-jaisa compact grid: odds columns fixed width (12% mobile / 60px
  // desktop per depth-3), naam ka column baaki space leta hai (wrap hota hai).
  const gridClass =
    {
      1: 'grid-cols-[1fr_20%_20%] lg:grid-cols-[1fr_80px_80px]',
      2: 'grid-cols-[1fr_16%_16%_16%_16%] lg:grid-cols-[1fr_60px_60px_60px_60px]',
      3: 'grid-cols-[1fr_12%_12%_12%_12%_12%_12%] lg:grid-cols-[1fr_60px_60px_60px_60px_60px_60px]',
    }[depth] || 'grid-cols-[1fr_12%_12%_12%_12%_12%_12%]';

  // Depth-wise colors: best odds (tno 0) solid, aage 75%, outer 50% alpha
  const BACK_COLORS = ['#72bbef', '#72bbefbf', '#72bbef7f'];
  const LAY_COLORS = ['#faa9ba', '#faa9babf', '#faa9ba7f'];
  const depthLevel = (odd, slot, isBack) => {
    const tno = Number(odd?.tno);
    if (Number.isFinite(tno)) return Math.min(2, Math.max(0, tno));
    return isBack ? depth - 1 - slot : slot;
  };

  return (
    <div className='w-full min-w-0 overflow-hidden bg-white'>
      {/* MATCH ODDS HEADER */}
      <div className='flex h-[30px] items-center justify-between bg-[#4b5b6b] px-2 text-white'>
        <span className='text-[13px] font-bold'>
          {(oddsData?.[0]?.mname || 'Match Odds').replaceAll('_', ' ')}
        </span>

        {!isCashoutMarketEligible ? null : hasCashoutAvailable &&
          showCashoutOptions &&
          !selectedBet ? (
          <button
            type='button'
            disabled={!hasMergedValue || cashoutLoading}
            onClick={handleCashOutClick}
            className={`flex h-[25px] items-center gap-1 px-3 text-[11px] font-semibold text-white ${
              hasMergedValue && !cashoutLoading
                ? 'cursor-pointer bg-[#198754]'
                : 'cursor-not-allowed bg-[#198754] opacity-60'
            }`}
          >
            <FaCheck className='text-[10px]' />

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
            type='button'
            onClick={() => {
              setShowCashoutOptions(true);
              fetchCashoutQuotes();
            }}
            className='h-[25px] cursor-pointer bg-[#198754] px-3 text-[11px] font-semibold text-white'
          >
            Cashout
          </button>
        ) : (
          <button
            type='button'
            disabled
            className='h-[25px] cursor-not-allowed bg-[#198754] px-3 text-[11px] font-semibold text-white opacity-60'
          >
            Cashout
          </button>
        )}
      </div>

      {/* MAX / BACK / LAY HEADER — Bookmaker jaisa: Back/Lay single column,
          best odds ke upar (back slot depth-1, lay slot 0), baaki pads khali. */}
      <div className={`grid h-[24px] border-b border-[#c7c8ca] ${gridClass}`}>
        <div className='flex items-center px-1 text-[12px] font-bold text-[#097c93]'>
          Max: {formatMarketMax(maxValue)}
        </div>

        {Array.from({ length: depth - 1 }, (_, i) => (
          <div key={`hb-${i}`} />
        ))}
        <div className='flex items-center justify-center border-l border-white bg-[#72bbef] p-[2px] text-[13px] font-bold text-[#333]'>
          Back
        </div>
        <div className='flex items-center justify-center border-l border-white bg-[#faa9ba] p-[2px] text-[13px] font-bold text-[#333]'>
          Lay
        </div>
        {Array.from({ length: depth - 1 }, (_, i) => (
          <div key={`hl-${i}`} />
        ))}
      </div>

      {/* TEAM ROWS */}
      {oddsData.length > 0 ? (
        <div className='relative'>
          {oddsData.map(({ team, odds, sid, gstatus, gscode }, teamIndex) => {
            // Provider order: back3→back1 (worst→best), then lay1→lay3 (best→worst)
            const backOdds = (odds || [])
              .filter((odd) => odd.otype === 'back')
              .slice(0, depth);

            const layOdds = (odds || [])
              .filter((odd) => odd.otype === 'lay')
              .slice(0, depth);

            const runnerSuspended =
              isMarketSuspended || runnerSuspendedByGscode(market0, { gscode });

            const renderOddsCell = (item, type, slot) => {
              const formattedOdds = item?.odds;
              const colors = type === 'back' ? BACK_COLORS : LAY_COLORS;

              return (
                <button
                  key={`${type}-${sid}-${slot}-${formattedOdds ?? 'x'}`}
                  type='button'
                  disabled={!formattedOdds}
                  onClick={() => {
                    if (formattedOdds) {
                      handleOddsClick(
                        team,
                        formattedOdds,
                        type,
                        sid,
                        item?.oname
                      );
                    }
                  }}
                  style={{
                    backgroundColor:
                      colors[depthLevel(item, slot, type === 'back')],
                  }}
                  className={`odds-flash flex min-h-[30px] min-w-0 flex-col items-center justify-center border-l border-white/50 px-0.5 ${
                    formattedOdds
                      ? 'cursor-pointer hover:brightness-95'
                      : 'cursor-default'
                  }`}
                >
                  {formattedOdds ? (
                    <>
                      <span className='text-[14px] leading-4 font-bold text-[#333] lg:text-[15px]'>
                        {formattedOdds}
                      </span>

                      {Number(item?.size) > 0 && (
                        <span className='text-[10px] leading-4 font-[100] text-[#333] lg:text-[11px]'>
                          {formatStake(item.size)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className='text-[12px] font-bold text-[#333]'>-</span>
                  )}
                </button>
              );
            };

            return (
              <div
                key={teamIndex}
                className={`grid min-h-[30px] border-b border-[#c7c8ca] hover:bg-[#f7f7f7] ${gridClass}`}
              >
                {/* TEAM NAME + P/L */}
                <div className='flex min-w-0 flex-col justify-center px-1'>
                  <span className='text-[12px] leading-[16px] font-medium break-words text-[#333]'>
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
                    } = getBetDetails(team, matchOddsList?.[0]?.mname);

                    const isMatchedTeam =
                      teamName?.toLowerCase() === team?.toLowerCase();

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
                          betColor = netOutcome >= 0 ? 'green' : 'red';
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
                            className='flex gap-1 leading-3'
                            style={{ color: betColor }}
                          >
                            {displayValue !== '' &&
                              displayValue !== null &&
                              displayValue !== undefined && (
                                <span className='flex items-center gap-0.5 text-[9px]'>
                                  <FaArrowRight />
                                  {parseFloat(displayValue).toFixed(2)}
                                </span>
                              )}

                            {suggestionValue !== null && (
                              <span
                                style={{ color: suggestionColor }}
                                className='text-[9px]'
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
                            className='text-[9px] leading-3'
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
                        betColor = netOutcome >= 0 ? 'green' : 'red';
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
                            return isMatchedTeam ? totalPrice : totalBetAmount;
                          }

                          if (otype === 'back') {
                            return isMatchedTeam ? totalBetAmount : totalPrice;
                          }

                          return '';
                        })();
                      }

                      return (
                        <div
                          className='flex gap-1 leading-3'
                          style={{ color: betColor }}
                        >
                          {displayValue !== '' &&
                            displayValue !== null &&
                            displayValue !== undefined && (
                              <span className='flex items-center gap-0.5 text-[9px]'>
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

                {/* BACK + LAY (reference: dim odds + red SUSPENDED overlay) */}
                {runnerSuspended ? (
                  <div
                    className='relative'
                    style={{ gridColumn: `2 / span ${depth * 2}` }}
                  >
                    <div
                      className='grid opacity-40'
                      style={{
                        gridTemplateColumns: `repeat(${depth * 2}, minmax(0,1fr))`,
                      }}
                    >
                      {Array.from({ length: depth * 2 }, (_, i) => {
                        const isBack = i < depth;
                        const slot = isBack ? i : i - depth;
                        const odd = isBack ? backOdds[slot] : layOdds[slot];
                        const colors = isBack ? BACK_COLORS : LAY_COLORS;
                        return (
                          <div
                            key={`s-${i}`}
                            style={{
                              backgroundColor:
                                colors[depthLevel(odd, slot, isBack)],
                            }}
                            className='flex min-h-[30px] flex-col items-center justify-center border-l border-white/50 px-0.5'
                          >
                            <span className='text-[14px] leading-4 font-bold text-[#333] lg:text-[15px]'>
                              {odd?.odds || '-'}
                            </span>
                            {Number(odd?.size) > 0 && (
                              <span className='text-[10px] leading-4 font-[100] text-[#333] lg:text-[11px]'>
                                {formatStake(odd.size)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <SuspendedOverlay
                      label={
                        isMarketSuspended
                          ? marketSuspensionText(matchOddsList?.[0])
                          : runnerSuspensionText({ gstatus })
                      }
                    />
                  </div>
                ) : (
                  <>
                    {Array.from({ length: depth }, (_, slot) =>
                      renderOddsCell(backOdds[slot], 'back', slot)
                    )}
                    {Array.from({ length: depth }, (_, slot) =>
                      renderOddsCell(layOdds[slot], 'lay', slot)
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className='py-3 text-center text-[12px] text-gray-500'>
          No match odds available
        </div>
      )}
    </div>
  );
}

export default MatchOdds;
