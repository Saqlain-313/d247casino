import React, { useMemo, useState } from 'react';
import { FaAngleDown, FaHorse } from 'react-icons/fa';
import {
  isMarketSuspended,
  isRunnerSuspended as runnerSuspendedByGscode,
  marketSuspensionText,
  runnerSuspensionText,
} from '../../utils/suspension';
import SuspendedOverlay from './components/SuspendedOverlay';
import { computeNetOutcome } from './utils/marketNetOutcome';

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const number = Number(value);
  if (Number.isFinite(number)) return number === 0 ? '-' : String(number);
  return value;
};

const getRunnerDetail = (runner, keys) => {
  const value = keys
    .map((key) => runner[key])
    .find((item) => item !== null && item !== undefined && item !== '');

  return value ?? '-';
};

function RunnerIcon({ mid, sid, name }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!mid || !sid || imageFailed) {
    return (
      <FaHorse
        className='shrink-0 text-2xl text-[#536575]'
        aria-hidden='true'
      />
    );
  }

  return (
    <img
      src={`https://sitethemedata.com/race_icons/${mid}/${sid}.png`}
      alt={`${name} racing silks`}
      className='h-10 w-8 shrink-0 object-contain'
      onError={() => setImageFailed(true)}
    />
  );
}

export default function HorseRacingMarkets({
  bettingData,
  loading,
  loaded,
  error,
  venue,
  time,
  onBetSelect,
  pendingBetAmounts,
}) {
  const [noDataDismissed, setNoDataDismissed] = useState(false);
  const [expandedRunnerKey, setExpandedRunnerKey] = useState(null);
  const markets = useMemo(
    () =>
      Array.isArray(bettingData)
        ? bettingData.filter(
            (market) =>
              Array.isArray(market?.section) && market.section.length > 0
          )
        : [],
    [bettingData]
  );
  const hasData = markets.some((market) =>
    market.section.some((runner) => runner && (runner.nat || runner.tname))
  );
  const inPlay = markets.some(
    (market) => market.iplay === true || market.iplay === 1
  );

  const showNoData = loaded && !error && !hasData && !noDataDismissed;

  const handleOddsSelect = (market, runner, odd) => {
    const odds = Number(odd?.odds);
    if (
      !Number.isFinite(odds) ||
      odds <= 0 ||
      isMarketSuspended(market) ||
      runnerSuspendedByGscode(market, runner)
    ) {
      return;
    }

    const marketName = market.mname || 'MATCH_ODDS';
    onBetSelect({
      team: runner.nat || runner.tname || `Runner ${runner.sno || ''}`,
      teams: market.section.map(
        (item) => item.nat || item.tname || `Runner ${item.sno || ''}`
      ),
      odds: String(odd.odds),
      size: odd.size,
      sid: runner.sid,
      type: odd.otype,
      oname: odd.oname || '',
      tno: odd.tno,
      gType: market.gtype || 'match',
      marketName,
      gameType: marketName === 'MATCH_ODDS' ? 'Match Odds' : marketName,
      maxAmount: market.max || market.maxb || 0,
      minAmount: market.min || 0,
    });
  };

  return (
    <div className='mt-1 min-w-0'>
      <header className='flex min-h-24 items-center justify-between gap-4 rounded-t-md bg-[linear-gradient(110deg,#102c2a,#253d43_55%,#17232c)] px-4 py-3 text-white sm:px-7'>
        <div className='flex items-center gap-3'>
          <span className='text-3xl' aria-hidden='true'>
            🐎
          </span>
          <div>
            <div className='text-lg font-bold tracking-wide sm:text-2xl'>
              {venue}
            </div>
            <div className='text-xs text-white/75 sm:text-sm'>
              {time || 'Horse Racing'}
            </div>
          </div>
        </div>
        <div
          className={`shrink-0 text-sm font-extrabold tracking-wider sm:text-xl ${
            inPlay ? 'text-green-400' : 'text-slate-200'
          }`}
        >
          {inPlay ? 'IN-PLAY' : 'HORSE RACING'}
        </div>
      </header>

      {loading && !loaded && (
        <div className='bg-white px-4 py-6 text-center text-gray-600'>
          Loading horse racing odds...
        </div>
      )}
      {error && (
        <div
          className='bg-white px-4 py-4 text-center text-red-700'
          role='alert'
        >
          {error}
        </div>
      )}

      <div className='overflow-x-hidden bg-[#f4f4f4]'>
        {markets.map((market) => {
          const runners = market.section.filter(
            (runner) => runner && (runner.nat || runner.tname)
          );
          const marketName = market.mname || 'MATCH_ODDS';
          const marketMax = market.max || market.maxb || 0;

          return (
            <section
              key={`${market.mid || market.gmid}-${marketName}`}
              className='mb-1'
              aria-label={marketName}
            >
              <div className='bg-[#4b5d6d] px-2 py-2 text-sm font-bold text-white sm:text-base'>
                {marketName.replaceAll('_', ' ')}
              </div>
              {/* D247 market-12 grid: mobile 1 Back + 1 Lay, desktop 3 Back + 3 Lay */}
              <div className='grid grid-cols-[minmax(0,1fr)_20%_20%] border-b border-gray-300 text-center text-sm font-bold text-[#333] md:grid-cols-[minmax(220px,1fr)_repeat(3,72px)_repeat(3,72px)]'>
                <div className='flex items-center px-2 text-left text-xs text-[#097c93] sm:px-3'>
                  Max: {formatNumber(marketMax)}
                </div>
                <div className='col-span-1 bg-[#72bbef] py-1 md:col-span-3'>
                  Back
                </div>
                <div className='col-span-1 bg-[#faa9ba] py-1 md:col-span-3'>
                  Lay
                </div>
              </div>

              {runners.map((runner, runnerIndex) => {
                const runnerName =
                  runner.nat || runner.tname || `Runner ${runnerIndex + 1}`;
                const odds = Array.isArray(runner.odds) ? runner.odds : [];
                const rawBacks = odds
                  .filter((odd) => odd.otype === 'back')
                  .slice(-3);
                // Right-align back depth so best back is always index 2 (adjacent to lay1)
                const backOdds = [null, null, null];
                rawBacks.forEach((o, i) => {
                  backOdds[3 - rawBacks.length + i] = o;
                });
                const layOdds = odds
                  .filter((odd) => odd.otype === 'lay')
                  .slice(0, 3);
                const removed =
                  String(
                    runner.gstatus || runner.status || ''
                  ).toUpperCase() === 'REMOVED';
                const runnerSuspended =
                  isMarketSuspended(market) ||
                  runnerSuspendedByGscode(market, runner);
                const raceMarketBets = Array.isArray(pendingBetAmounts)
                  ? pendingBetAmounts.filter((b) => {
                      const bMarket = String(b.marketName || '')
                        .trim()
                        .toLowerCase();
                      const mNorm = marketName.trim().toLowerCase();
                      if (bMarket) {
                        return (
                          bMarket === mNorm ||
                          (bMarket === 'match odds' &&
                            mNorm === 'match_odds') ||
                          (bMarket === 'match_odds' && mNorm === 'match odds')
                        );
                      }
                      return (
                        b.gameType ===
                        (marketName === 'MATCH_ODDS'
                          ? 'Match Odds'
                          : marketName)
                      );
                    })
                  : [];
                const runnerNetPL = raceMarketBets.length
                  ? computeNetOutcome(runnerName, raceMarketBets, 0)
                  : null;
                const runnerNumber =
                  runner.psrno || runner.sno || runnerIndex + 1;
                const jockey = getRunnerDetail(runner, [
                  'jockey',
                  'jockeyName',
                  'jname',
                  'jky',
                ]);
                const trainer = getRunnerDetail(runner, [
                  'trainer',
                  'trainerName',
                  'trname',
                  'trn',
                ]);
                const age = getRunnerDetail(runner, ['age', 'hage']);
                const rKey = String(
                  runner.sid || `${runnerName}-${runnerIndex}`
                );
                const isExpanded = expandedRunnerKey === rKey;

                return (
                  <div
                    key={rKey}
                    className='grid grid-cols-[minmax(0,1fr)_20%_20%] border-b border-gray-300 md:grid-cols-[minmax(220px,1fr)_repeat(3,72px)_repeat(3,72px)]'
                  >
                    <div className='flex min-w-0 items-center gap-1.5 px-2 py-2 sm:gap-3 sm:px-4'>
                      <span className='w-5 shrink-0 text-center text-xs text-gray-700 sm:w-6 sm:text-sm'>
                        {runnerNumber}
                      </span>
                      <RunnerIcon
                        mid={market.mid}
                        sid={runner.sid}
                        name={runnerName}
                      />
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-1 text-xs font-bold text-[#333] sm:text-base'>
                          <span className='truncate'>
                            {runner.sno || runnerIndex + 1}. {runnerName}
                          </span>
                          <button
                            type='button'
                            onClick={() =>
                              setExpandedRunnerKey(isExpanded ? null : rKey)
                            }
                            className='inline-flex shrink-0 items-center p-0.5 text-gray-600 md:hidden'
                            aria-label={`Toggle details for ${runnerName}`}
                          >
                            <FaAngleDown
                              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                          {runnerNetPL !== null && (
                            <span
                              className={`ml-1 shrink-0 text-xs font-bold ${
                                runnerNetPL >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {runnerNetPL >= 0
                                ? `+${runnerNetPL}`
                                : runnerNetPL}
                            </span>
                          )}
                        </div>
                        <div
                          className={`${
                            isExpanded ? 'flex' : 'hidden md:flex'
                          } mt-1 flex-wrap gap-1 text-[10px] text-black sm:text-xs`}
                        >
                          <span className='bg-[#d2d2d2] px-1 py-0.5'>
                            <strong>Jockey:</strong> {formatNumber(jockey)}
                          </span>
                          <span className='bg-[#d2d2d2] px-1 py-0.5'>
                            <strong>Trainer:</strong> {formatNumber(trainer)}
                          </span>
                          <span className='bg-[#d2d2d2] px-1 py-0.5'>
                            <strong>Age:</strong> {formatNumber(age)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {removed ? (
                      <>
                        <div className='col-span-1 flex items-center justify-center bg-[#4b4f52] px-1 text-center text-xs font-bold text-white md:col-span-3 md:px-2 md:text-sm'>
                          REMOVED
                        </div>
                        <div className='col-span-1 bg-[#594f52] md:col-span-3' />
                      </>
                    ) : runnerSuspended ? (
                      <div className='relative col-span-2 md:col-span-6'>
                        <div className='grid grid-cols-2 opacity-40 md:grid-cols-6'>
                          {[0, 1, 2].map((index) => {
                            const odd = backOdds[index];
                            return (
                              <div
                                key={`s-back-${index}`}
                                className={`${index < 2 ? 'hidden md:flex' : 'flex'} min-h-[52px] flex-col items-center justify-center border-l border-white px-1 text-[#333] md:min-h-[58px] ${
                                  index === 0
                                    ? 'bg-[#b8d9ed]'
                                    : index === 1
                                      ? 'bg-[#91c9eb]'
                                      : 'bg-[#72bbef]'
                                }`}
                              >
                                <span className='text-sm leading-5 font-bold sm:text-lg'>
                                  {formatNumber(odd?.odds)}
                                </span>
                              </div>
                            );
                          })}
                          {[0, 1, 2].map((index) => {
                            const odd = layOdds[index];
                            return (
                              <div
                                key={`s-lay-${index}`}
                                className={`${index > 0 ? 'hidden md:flex' : 'flex'} min-h-[52px] flex-col items-center justify-center border-l border-white px-1 text-[#333] md:min-h-[58px] ${
                                  index === 0
                                    ? 'bg-[#faa9ba]'
                                    : index === 1
                                      ? 'bg-[#f4c0cb]'
                                      : 'bg-[#f5d0d7]'
                                }`}
                              >
                                <span className='text-sm leading-5 font-bold sm:text-lg'>
                                  {formatNumber(odd?.odds)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <SuspendedOverlay
                          label={
                            isMarketSuspended(market)
                              ? marketSuspensionText(market)
                              : runnerSuspensionText(runner)
                          }
                        />
                      </div>
                    ) : (
                      <>
                        {[0, 1, 2].map((index) => {
                          const odd = backOdds[index];
                          return (
                            <button
                              key={`back-${index}-${odd?.odds ?? 'x'}`}
                              type='button'
                              disabled={!odd || Number(odd.odds) <= 0}
                              onClick={() =>
                                odd && handleOddsSelect(market, runner, odd)
                              }
                              className={`odds-flash ${
                                index < 2 ? 'hidden md:flex' : 'flex'
                              } min-h-[52px] flex-col items-center justify-center border-l border-white px-1 text-[#333] md:min-h-[58px] ${
                                index === 0
                                  ? 'bg-[#b8d9ed]'
                                  : index === 1
                                    ? 'bg-[#91c9eb]'
                                    : 'bg-[#72bbef]'
                              } ${odd && Number(odd.odds) > 0 ? 'cursor-pointer hover:brightness-95' : 'cursor-default'}`}
                            >
                              <span className='text-sm leading-5 font-bold sm:text-lg'>
                                {formatNumber(odd?.odds)}
                              </span>
                              {odd && (
                                <span className='text-[11px] leading-4 sm:text-xs'>
                                  {formatNumber(odd.size)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                        {[0, 1, 2].map((index) => {
                          const odd = layOdds[index];
                          return (
                            <button
                              key={`lay-${index}-${odd?.odds ?? 'x'}`}
                              type='button'
                              disabled={!odd || Number(odd.odds) <= 0}
                              onClick={() =>
                                odd && handleOddsSelect(market, runner, odd)
                              }
                              className={`odds-flash ${
                                index > 0 ? 'hidden md:flex' : 'flex'
                              } min-h-[52px] flex-col items-center justify-center border-l border-white px-1 text-[#333] md:min-h-[58px] ${
                                index === 0
                                  ? 'bg-[#faa9ba]'
                                  : index === 1
                                    ? 'bg-[#f4c0cb]'
                                    : 'bg-[#f5d0d7]'
                              } ${odd && Number(odd.odds) > 0 ? 'cursor-pointer hover:brightness-95' : 'cursor-default'}`}
                            >
                              <span className='text-sm leading-5 font-bold sm:text-lg'>
                                {formatNumber(odd?.odds)}
                              </span>
                              {odd && (
                                <span className='text-[11px] leading-4 sm:text-xs'>
                                  {formatNumber(odd.size)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>

      {showNoData && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4'
          role='dialog'
          aria-modal='true'
          aria-labelledby='horse-racing-no-data-title'
        >
          <div className='horse-no-data-popup w-full max-w-sm rounded-md bg-white p-5 text-center shadow-xl'>
            <h2
              id='horse-racing-no-data-title'
              className='text-lg font-bold text-[#2c3e50]'
            >
              No Horse Racing Data Found
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              There are currently no markets available for this race.
            </p>
            <button
              type='button'
              onClick={() => setNoDataDismissed(true)}
              className='mt-4 rounded bg-[#2c3e50] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2b38]'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
