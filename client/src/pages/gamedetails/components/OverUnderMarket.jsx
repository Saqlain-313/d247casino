import { useMemo, useState } from 'react';
import {
  isMarketSuspended as marketSuspendedByGscode,
  isRunnerSuspended as runnerSuspendedByGscode,
  marketSuspensionText,
  runnerSuspensionText,
} from '../../../utils/suspension';
import SuspendedOverlay from './SuspendedOverlay';
import { useMarketNetOutcome } from '../hooks/useMarketNetOutcome';
import {
  BACK_SLOT_BG,
  LAY_SLOT_BG,
  formatMarketMax,
  formatOddsSize,
  splitBackLaySlots,
} from '../utils/marketHelpers';
import TeamOutcomeLabels from './TeamOutcomeLabels';

/**
 * Reusable Over/Under market table (replaces OverUnder_05, OverUnder_15,
 * OverUnder_25, and OverUnder_35).
 */
function OverUnderMarket({
  marketKey,
  marketList,
  onBetSelect,
  selectedBet,
  gameid,
}) {
  const gameTypes = useMemo(() => [marketKey], [marketKey]);
  const { getBetDetails, getProjectedNetOutcome, isSelectedBetInMarket } =
    useMarketNetOutcome({
      gameTypes,
      gameId: gameid,
      cashoutPLKey: marketKey,
    });

  const [showCashoutOptions] = useState(false);
  const primaryMarket = marketList?.[0];

  const oddsData = primaryMarket?.section?.length
    ? primaryMarket.section.map((sec) => ({
        team: sec.nat,
        sid: sec.sid,
        odds: sec.odds,
        max: sec.max,
        min: sec.min,
        mname: primaryMarket.mname,
        gstatus: sec.gstatus,
        gscode: sec.gscode,
        status: primaryMarket.status,
      }))
    : [];

  const maxValue = primaryMarket?.max || primaryMarket?.maxb || 0;
  const isMarketSuspended = marketSuspendedByGscode(primaryMarket);

  const handleOddsClick = (team, rate, type, oname, tno) => {
    if (!onBetSelect || !rate || isMarketSuspended) return;
    onBetSelect({
      team,
      odds: rate.toString(),
      type,
      oname: oname || '',
      tno,
      stake: '',
      teams: oddsData.map((item) => item.team),
      marketName: marketKey,
      gameType: marketKey,
      gType: primaryMarket?.gtype || 'match',
      maxAmount: maxValue,
      minAmount: primaryMarket?.min || 0,
    });
  };

  return (
    <div>
      <div className='text-secondary mt-1 flex items-center justify-between bg-[#2C3E50D9] p-1'>
        <span className='text-[13px] font-bold lg:text-[15px]'>
          {marketKey}
        </span>
        <button
          disabled={!showCashoutOptions}
          className={`p-1 font-[400] text-white ${
            showCashoutOptions
              ? 'cursor-pointer bg-[#198754]'
              : 'bg-[#198754] opacity-60'
          }`}
        >
          Cashout
        </button>
      </div>
      <div className='grid grid-cols-[minmax(0,1fr)_64px_64px] border-b border-b-[#c7c8ca] md:grid-cols-[minmax(140px,1fr)_repeat(6,60px)]'>
        <div className='flex items-center px-2 text-[12px] font-bold text-[#097c93]'>
          Max: {formatMarketMax(maxValue)}
        </div>
        <div className='hidden md:block'></div>
        <div className='hidden md:block'></div>
        <div className='flex items-center justify-center bg-[#72bbef] p-[2px] text-[13px] font-bold text-[#333]'>
          Back
        </div>
        <div className='flex items-center justify-center bg-[#faa9ba] p-[2px] text-[13px] font-bold text-[#333]'>
          Lay
        </div>
        <div className='hidden md:block'></div>
        <div className='hidden md:block'></div>
      </div>

      {oddsData.length > 0 ? (
        oddsData.map(({ team, odds, gstatus, gscode }, teamIndex) => {
          const isSuspended =
            isMarketSuspended ||
            runnerSuspendedByGscode(primaryMarket, { gscode });
          const { backOdds, layOdds } = splitBackLaySlots(odds);

          return (
            <div
              key={teamIndex}
              className='grid grid-cols-[minmax(0,1fr)_64px_64px] border-b border-b-[#c7c8ca] hover:bg-[#f7f7f7] md:grid-cols-[minmax(140px,1fr)_repeat(6,60px)]'
            >
              <div className='flex min-w-0 flex-col justify-center overflow-hidden px-2 py-1.5 text-[13px] font-bold text-[#333] lg:text-[14px]'>
                <div className='truncate' title={team}>
                  {team}
                </div>
                <TeamOutcomeLabels
                  team={team}
                  selectedBet={selectedBet}
                  getBetDetails={getBetDetails}
                  getProjectedNetOutcome={getProjectedNetOutcome}
                  isSelectedBetInMarket={isSelectedBetInMarket}
                />
              </div>

              {isSuspended ? (
                <div className='relative col-span-2 md:col-span-6'>
                  <div className='grid grid-cols-2 opacity-40 md:grid-cols-6'>
                    {[...backOdds, ...layOdds].map((item, i) => {
                      const isPrimary = i === 2 || i === 3;
                      return (
                        <div
                          key={`s-${i}`}
                          className={`${isPrimary ? 'flex' : 'hidden md:flex'} ${i < 3 ? BACK_SLOT_BG[i] : LAY_SLOT_BG[i - 3]} min-h-[42px] flex-col items-center justify-center overflow-hidden border-l border-white px-0.5`}
                        >
                          <span className='text-[14px] leading-4 font-bold text-[#333] lg:text-[15px]'>
                            {item && item.odds > 0 ? item.odds : '-'}
                          </span>
                          {item && item.odds > 0 && item.size > 0 && (
                            <span className='text-[10px] leading-4 font-[100] text-[#333]'>
                              {formatOddsSize(item.size)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <SuspendedOverlay
                    label={
                      isMarketSuspended
                        ? marketSuspensionText(primaryMarket)
                        : runnerSuspensionText({ gstatus })
                    }
                  />
                </div>
              ) : (
                <>
                  {[0, 1, 2].map((i) => {
                    const backItem = backOdds[i];
                    const formattedOdds = backItem ? backItem.odds : null;
                    return (
                      <div
                        key={`back-${i}-${formattedOdds ?? 'x'}`}
                        className={`odds-flash ${i === 2 ? 'flex' : 'hidden md:flex'} ${BACK_SLOT_BG[i]} min-h-[42px] min-w-0 flex-col items-center justify-center overflow-hidden border-l border-white px-0.5 ${formattedOdds ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
                        onClick={() =>
                          formattedOdds &&
                          handleOddsClick(
                            team,
                            formattedOdds,
                            'back',
                            backItem?.oname,
                            backItem?.tno
                          )
                        }
                      >
                        {formattedOdds ? (
                          <>
                            <span className='truncate text-[14px] leading-4 font-bold text-[#333] lg:text-[15px]'>
                              {formattedOdds}
                            </span>
                            <span className='truncate text-[10px] leading-4 font-[100] text-[#333]'>
                              {formatOddsSize(backItem.size)}
                            </span>
                          </>
                        ) : (
                          <span className='text-[14px] leading-4 font-bold text-[#333] lg:text-[15px]'>
                            -
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {[0, 1, 2].map((i) => {
                    const layItem = layOdds[i];
                    const formattedOdds = layItem ? layItem.odds : null;
                    return (
                      <div
                        key={`lay-${i}-${formattedOdds ?? 'x'}`}
                        className={`odds-flash ${i === 0 ? 'flex' : 'hidden md:flex'} ${LAY_SLOT_BG[i]} min-h-[42px] min-w-0 flex-col items-center justify-center overflow-hidden border-l border-white px-0.5 ${formattedOdds ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
                        onClick={() =>
                          formattedOdds &&
                          handleOddsClick(
                            team,
                            formattedOdds,
                            'lay',
                            layItem?.oname,
                            layItem?.tno
                          )
                        }
                      >
                        {formattedOdds ? (
                          <>
                            <span className='truncate text-[14px] leading-4 font-bold text-[#333] lg:text-[15px]'>
                              {formattedOdds}
                            </span>
                            <span className='truncate text-[10px] leading-4 font-[100] text-[#333]'>
                              {formatOddsSize(layItem.size)}
                            </span>
                          </>
                        ) : (
                          <span className='text-[14px] leading-4 font-bold text-[#333] lg:text-[15px]'>
                            -
                          </span>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })
      ) : (
        <div className='py-4 text-center text-gray-500'>No data available</div>
      )}
    </div>
  );
}

export default OverUnderMarket;
