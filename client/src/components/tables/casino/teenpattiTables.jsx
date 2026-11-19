import React from 'react';
import { useCasino } from '../../../context/CasinoContext';
import OddsBox from '../OddsBox';
import { formatInlineCard } from './shared';

function TablePoison({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  const sideMarkets = [
    { name: 'Pair Plus A', odds: '2.0' },
    { name: 'Pair Plus B', odds: '2.0' },
    { name: '3 Baccarat A', odds: '1.95' },
    { name: '3 Baccarat B', odds: '1.95' },
  ];

  const LockIcon = () => (
    <svg viewBox='0 0 24 24' fill='currentColor' className='h-7 w-7 text-white'>
      <path d='M7 8V6a5 5 0 0110 0v2h1a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1zm2 0h6V6a3 3 0 00-6 0v2zm3 4a2 2 0 00-1 3.73V18h2v-2.27A2 2 0 0012 12z' />
    </svg>
  );

  const OddsButton = ({ nation, odds, type }) => {
    const isBack = type === 'back';

    return (
      <button
        type='button'
        disabled={isSuspended}
        onClick={() => {
          if (!isSuspended) {
            openBetSlip(nation, odds, type, isMobile);
          }
        }}
        className={`flex min-h-[60px] w-full items-center justify-center border-l border-white/50 transition-colors ${
          isSuspended
            ? 'cursor-not-allowed bg-[#414c56]'
            : isBack
              ? 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
              : 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
        }`}
      >
        {isSuspended ? (
          <LockIcon />
        ) : (
          <span className='text-lg font-bold text-[#303b45]'>{odds}</span>
        )}
      </button>
    );
  };

  return (
    <div className='w-full min-w-0 bg-white p-1'>
      {/* MAIN BETTING LAYOUT */}
      <div className='grid grid-cols-1 items-start gap-3 lg:grid-cols-[1.4fr_1fr]'>
        {/* PLAYER MARKETS */}
        <section className='min-w-0 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f1f1f1]'>
          {/* Header */}
          <div className='grid grid-cols-[minmax(0,1fr)_85px_85px] bg-[#4b5b6b] text-white'>
            <div className='flex items-center px-3 py-3'>
              <span className='text-sm font-bold'>Nation</span>
            </div>

            <div className='flex items-center justify-center bg-[#72b9e8] py-3 text-sm font-bold text-[#303b45]'>
              Back
            </div>

            <div className='flex items-center justify-center bg-[#f5a5b8] py-3 text-sm font-bold text-[#303b45]'>
              Lay
            </div>
          </div>

          {/* Player Rows */}
          {players.map((player, index) => (
            <div
              key={player.name}
              className={`grid min-h-[65px] grid-cols-[minmax(0,1fr)_85px_85px] border-t border-[#d1d1d1] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'
              }`}
            >
              <div className='flex items-center px-3 py-3'>
                <span className='text-base font-semibold text-[#333333]'>
                  {player.name}
                </span>
              </div>

              <OddsButton nation={player.name} odds={player.back} type='back' />

              <OddsButton nation={player.name} odds={player.lay} type='lay' />
            </div>
          ))}
        </section>

        {/* SIDE BETS */}
        <section className='min-w-0 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f1f1f1]'>
          {/* Header */}
          <div className='grid grid-cols-[minmax(0,1fr)_90px] bg-[#4b5b6b] text-white'>
            <div className='flex items-center px-3 py-3'>
              <span className='text-sm font-bold'>Side Bets</span>
            </div>

            <div className='flex items-center justify-center bg-[#72b9e8] py-3 text-sm font-bold text-[#303b45]'>
              Back
            </div>
          </div>

          {/* Side Bet Rows */}
          {sideMarkets.map((item, index) => (
            <div
              key={item.name}
              className={`grid min-h-[65px] grid-cols-[minmax(0,1fr)_90px] border-t border-[#d1d1d1] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'
              }`}
            >
              <div className='flex items-center px-3 py-3'>
                <span className='text-sm font-medium text-[#333333] sm:text-base'>
                  {item.name}
                </span>
              </div>

              <OddsButton nation={item.name} odds={item.odds} type='back' />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function TableTeenunique({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const [selectedSlots, setSelectedSlots] = React.useState([]);
  const cards = String(roundData?.card || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const mainMarket = subs[0];
  const open =
    !isSuspended && String(mainMarket?.gstatus || '').toUpperCase() === 'OPEN';

  React.useEffect(() => {
    setSelectedSlots([]);
  }, [roundData?.mid]);

  const toggleSlot = (slot) => {
    if (!open) return;
    setSelectedSlots((prev) => {
      if (prev.includes(slot)) return prev.filter((x) => x !== slot);
      if (prev.length >= 3) return prev;
      const next = [...prev, slot];
      if (next.length === 3 && mainMarket) {
        openBetSlip(
          mainMarket.sid ?? mainMarket.nat ?? 'Unique Teenpatti',
          mainMarket.b,
          'back',
          isMobile
        );
      }
      return next;
    });
  };

  return (
    <div className='casino-table'>
      <h4 className='unique-teen-title'>
        Select any 3 cards of your choice and experience TeenPatti in a unique
        way.
        <i className='fas fa-hand-point-down ms-1' />
      </h4>
      <div className={`unique-teen20-box ${!open ? 'suspended' : ''}`}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const code = cards[i] || '1';
          const dealt = code !== '1';
          const slot = i + 1;
          return (
            <div className='unique-teen20-card' key={slot}>
              <img
                src={`/assets/img/sequence/s${slot}-icon.png`}
                alt={`S${slot}`}
              />
              {dealt ? (
                <img src={`/assets/img/cards/${code}.jpg`} alt={code} />
              ) : (
                <img
                  className={selectedSlots.includes(slot) ? 'select' : ''}
                  style={{
                    cursor: open ? 'pointer' : 'not-allowed',
                    opacity: open ? 1 : 0.65,
                  }}
                  src='/assets/img/cards/1.jpg'
                  alt='Card back'
                  onClick={() => open && toggleSlot(slot)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TablePoison20({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  const sideMarkets = [
    { name: 'Pair Plus A', odds: '2.0' },
    { name: 'Pair Plus B', odds: '2.0' },
    { name: '3 Baccarat A', odds: '1.95' },
    { name: '3 Baccarat B', odds: '1.95' },
  ];

  const OddsButton = ({ nation, odds, type }) => (
    <button
      type='button'
      disabled={isSuspended}
      onClick={() => openBetSlip(nation, odds, type, isMobile)}
      className={`relative flex min-h-[42px] w-full items-center justify-center rounded-sm text-sm font-bold transition-colors ${
        type === 'back'
          ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
          : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
      } ${isSuspended ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
    >
      {isSuspended ? <span className='text-gray-700'>🔒</span> : odds}
    </button>
  );

  return (
    <div className='w-full'>
      <div className='grid grid-cols-1 gap-3 lg:grid-cols-[1.6fr_1fr]'>
        {/* Player A & Player B */}
        <div className='grid grid-cols-2 gap-2'>
          {players.map((player) => (
            <div
              key={player.name}
              className='min-w-0 overflow-hidden rounded-sm border border-[#d1d1d1] bg-white'
            >
              <div className='bg-[#4b5b6b] px-2 py-2 text-center text-sm font-semibold text-white'>
                {player.name}
              </div>

              <div className='grid grid-cols-2 gap-1 bg-[#f8f9fa] p-2'>
                <div className='text-center text-xs font-semibold text-gray-700'>
                  Back
                </div>
                <div className='text-center text-xs font-semibold text-gray-700'>
                  Lay
                </div>

                <OddsButton
                  nation={player.name}
                  odds={player.back}
                  type='back'
                />

                <OddsButton nation={player.name} odds={player.lay} type='lay' />
              </div>
            </div>
          ))}
        </div>

        {/* Side Bets */}
        <div className='min-w-0 overflow-hidden rounded-sm border border-[#d1d1d1] bg-white'>
          <div className='grid grid-cols-[minmax(0,1fr)_90px] bg-[#4b5b6b] px-2 py-2 text-sm font-semibold text-white'>
            <div>Side Bets</div>
            <div className='text-center'>Back</div>
          </div>

          <div>
            {sideMarkets.map((market) => (
              <div
                key={market.name}
                className='grid grid-cols-[minmax(0,1fr)_90px] items-center gap-2 border-b border-[#d1d1d1] px-2 py-1.5 last:border-b-0'
              >
                <div className='truncate text-sm font-medium text-gray-800'>
                  {market.name}
                </div>

                <OddsButton
                  nation={market.name}
                  odds={market.odds}
                  type='back'
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableJoker120({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  // Use API result when available, otherwise mock results
  const results = Array.isArray(markets?.lastResult)
    ? markets.lastResult
    : Array(10).fill('R');

  // Lock Icon
  const LockIcon = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='currentColor'
      className='h-7 w-7 text-white'
    >
      <path
        fillRule='evenodd'
        d='M7 8V6a5 5 0 0110 0v2h1.5A2.5 2.5 0 0121 10.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 19.5v-9A2.5 2.5 0 015.5 8H7zm2 0h6V6a3 3 0 00-6 0v2zm3 4a2 2 0 00-1 3.732V18h2v-2.268A2 2 0 0012 12z'
        clipRule='evenodd'
      />
    </svg>
  );

  // Odds Button
  const OddsButton = ({ nation, odds, type }) => {
    const isBack = type === 'back';

    return (
      <button
        type='button'
        disabled={isSuspended}
        onClick={() => {
          if (!isSuspended) {
            openBetSlip(nation, odds, type, isMobile);
          }
        }}
        className={`flex min-h-[64px] w-full flex-col items-center justify-center gap-1 border-l border-white/50 transition-colors ${
          isBack
            ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
            : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
        } ${
          isSuspended
            ? 'cursor-not-allowed bg-[#414c56] hover:bg-[#414c56]'
            : 'cursor-pointer'
        } `}
      >
        {isSuspended ? (
          <LockIcon />
        ) : (
          <span className='text-xl leading-6 font-bold text-[#293744]'>
            {odds}
          </span>
        )}
      </button>
    );
  };

  // Player Card
  const PlayerCard = ({ player }) => (
    <div className='grid min-w-0 grid-cols-[minmax(0,1fr)_98px_98px] overflow-hidden border border-[#d1d1d1] bg-[#f1f1f1]'>
      {/* Player Name */}
      <div className='flex min-w-0 items-center px-3 py-4'>
        <span className='text-lg font-bold text-[#333333] sm:text-xl'>
          {player.name}
        </span>
      </div>

      {/* Back */}
      <OddsButton nation={player.name} odds={player.back} type='back' />

      {/* Lay */}
      <OddsButton nation={player.name} odds={player.lay} type='lay' />
    </div>
  );

  return (
    <div className='w-full min-w-0 bg-white'>
      {/* Player Markets */}
      <div className='grid grid-cols-1 gap-2 p-1 lg:grid-cols-2'>
        {players.map((player) => (
          <PlayerCard key={player.name} player={player} />
        ))}
      </div>
    </div>
  );
}

function TableJoker20({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    { name: 'Player A', market: markets?.playera },
    { name: 'Player B', market: markets?.playerb },
  ];

  const sideMarkets = [
    { name: 'Pair Plus A', market: markets?.pairplusa },
    { name: 'Pair Plus B', market: markets?.pairplusb },
    { name: '3 Baccarat A', market: markets?.['3baccarata'] },
    { name: '3 Baccarat B', market: markets?.['3baccaratb'] },
  ];

  const LockIcon = () => (
    <svg viewBox='0 0 24 24' fill='currentColor' className='h-7 w-7 text-white'>
      <path d='M7 8V6a5 5 0 0110 0v2h1a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1zm2 0h6V6a3 3 0 00-6 0v2zm3 4a2 2 0 00-1 3.73V18h2v-2.27A2 2 0 0012 12z' />
    </svg>
  );

  const OddsButton = ({ nation, market, type }) => {
    const isBack = type === 'back';
    const rawOdds = type === 'lay' ? market?.lay : market?.back;
    const numericOdds = Number(rawOdds);
    const status = String(market?.gstatus || '').toUpperCase();
    const available =
      !isSuspended &&
      market?.visible === true &&
      ['OPEN', 'ACTIVE'].includes(status) &&
      Number.isFinite(numericOdds) &&
      numericOdds > 1;
    const shownOdds = available ? numericOdds : null;

    return (
      <button
        type='button'
        disabled={!available}
        onClick={() => {
          if (available) openBetSlip(nation, shownOdds, type, isMobile);
        }}
        className={`flex min-h-[58px] w-full items-center justify-center border-l border-white/50 transition-colors ${
          !available
            ? 'cursor-not-allowed bg-[#414c56]'
            : isBack
              ? 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
              : 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
        }`}
      >
        {!available ? (
          <LockIcon />
        ) : (
          <span className='text-lg font-bold text-[#303b45]'>
            {shownOdds.toFixed(2)}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className='w-full min-w-0 bg-white p-1'>
      {/* MAIN BETTING LAYOUT */}
      <div className='grid grid-cols-1 items-start gap-3 lg:grid-cols-[1.4fr_1fr]'>
        {/* PLAYER MARKETS */}
        <section className='min-w-0 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f1f1f1]'>
          <div className='grid grid-cols-[minmax(0,1fr)_85px_85px] bg-[#4b5b6b] text-white'>
            <div className='flex items-center px-3 py-3'>
              <span className='text-sm font-bold'>Nation</span>
            </div>
            <div className='flex items-center justify-center bg-[#72b9e8] py-3 text-sm font-bold text-[#303b45]'>
              Back
            </div>
            <div className='flex items-center justify-center bg-[#f5a5b8] py-3 text-sm font-bold text-[#303b45]'>
              Lay
            </div>
          </div>

          {players.map((player, index) => (
            <div
              key={player.name}
              className={`grid min-h-[65px] grid-cols-[minmax(0,1fr)_85px_85px] border-t border-[#d1d1d1] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'
              }`}
            >
              <div className='flex items-center px-3 py-3'>
                <span className='text-base font-semibold text-[#333333]'>
                  {player.name}
                </span>
              </div>
              <OddsButton
                nation={player.name}
                market={player.market}
                type='back'
              />
              <OddsButton
                nation={player.name}
                market={player.market}
                type='lay'
              />
            </div>
          ))}
        </section>

        {/* SIDE BETS */}
        <section className='min-w-0 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f1f1f1]'>
          <div className='grid grid-cols-[minmax(0,1fr)_90px] bg-[#4b5b6b] text-white'>
            <div className='flex items-center px-3 py-3'>
              <span className='text-sm font-bold'>Side Bets</span>
            </div>
            <div className='flex items-center justify-center bg-[#72b9e8] py-3 text-sm font-bold text-[#303b45]'>
              Back
            </div>
          </div>

          {sideMarkets.map((item, index) => (
            <div
              key={item.name}
              className={`grid min-h-[65px] grid-cols-[minmax(0,1fr)_90px] border-t border-[#d1d1d1] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'
              }`}
            >
              <div className='flex items-center px-3 py-3'>
                <span className='text-sm font-medium text-[#333333] sm:text-base'>
                  {item.name}
                </span>
              </div>
              <OddsButton nation={item.name} market={item.market} type='back' />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function TableJoker1({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  return (
    <div className='w-full overflow-hidden border border-[#d1d1d1] bg-white'>
      <div className='grid grid-cols-2 gap-[2px]'>
        {players.map((player) => (
          <div
            key={player.name}
            className='grid min-w-0 grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)] gap-[2px]'
          >
            {/* Player Name */}
            <div className='flex h-[48px] min-w-0 items-center bg-[#f1f1f1] px-2'>
              <span className='truncate text-sm font-bold text-[#333] sm:text-base'>
                {player.name}
              </span>
            </div>

            {/* Back */}
            <button
              type='button'
              disabled={isSuspended}
              onClick={() =>
                openBetSlip(player.name, player.back, 'back', isMobile)
              }
              className={`flex h-[48px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#333] sm:text-base ${
                isSuspended
                  ? 'cursor-not-allowed opacity-70'
                  : 'cursor-pointer hover:bg-[#5da9dc]'
              }`}
            >
              {isSuspended ? '🔒' : player.back}
            </button>

            {/* Lay */}
            <button
              type='button'
              disabled={isSuspended}
              onClick={() =>
                openBetSlip(player.name, player.lay, 'lay', isMobile)
              }
              className={`flex h-[48px] items-center justify-center bg-[#f5a5b8] text-sm font-bold text-[#333] sm:text-base ${
                isSuspended
                  ? 'cursor-not-allowed opacity-70'
                  : 'cursor-pointer hover:bg-[#ed91a7]'
              }`}
            >
              {isSuspended ? '🔒' : player.lay}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableTeen41({ isMobile, isSuspended, openBetSlip, markets }) {
  const playerA = {
    back: markets?.playerA?.back || '1.98',
    lay: markets?.playerA?.lay || '2.02',
  };

  const playerB = {
    back: markets?.playerB?.back || '1.6',
    lay: markets?.playerB?.lay || '1.65',
  };

  const sideMarkets = [
    {
      name: 'Player B Under 21',
      odds: markets?.under21?.back || '2.45',
    },
    {
      name: 'Player B Over 21',
      odds: markets?.over21?.back || '1.69',
    },
  ];

  const LockIcon = () => (
    <svg viewBox='0 0 24 24' className='h-6 w-6 fill-white' aria-hidden='true'>
      <path d='M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm4 10.73V19h-2v-2.27a2 2 0 1 1 2 0Z' />
    </svg>
  );

  const OddsButton = ({ nation, odds, type }) => (
    <button
      type='button'
      disabled={isSuspended}
      onClick={() => openBetSlip(nation, odds, type, isMobile)}
      className={`flex h-[48px] min-w-0 items-center justify-center text-sm font-bold text-[#333333] sm:text-base ${
        type === 'back'
          ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
          : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
      } ${
        isSuspended
          ? 'cursor-not-allowed bg-[#414b54] opacity-100'
          : 'cursor-pointer'
      }`}
    >
      {isSuspended ? <LockIcon /> : odds}
    </button>
  );

  const PlayerSection = ({ name, data }) => (
    <div className='min-w-0 overflow-hidden border border-[#c9c9c9]'>
      {/* Header */}
      <div className='grid h-[48px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-[#c9c9c9]'>
        <div className='col-span-1 flex items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          {name}
        </div>

        <div className='flex items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base'>
          Back
        </div>

        <div className='flex items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] sm:text-base'>
          Lay
        </div>
      </div>

      {/* Main Market */}
      <div className='grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'>
        <div className='flex h-[48px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          Main
        </div>

        <OddsButton nation={name} odds={data.back} type='back' />

        <OddsButton nation={name} odds={data.lay} type='lay' />
      </div>
    </div>
  );

  return (
    <div className='w-full'>
      <div className='grid grid-cols-2 gap-2'>
        {/* Player A */}
        <PlayerSection name='Player A' data={playerA} />

        {/* Player B + Side Bets */}
        <div className='min-w-0 space-y-2'>
          <PlayerSection name='Player B' data={playerB} />

          {/* Under 21 / Over 21 */}
          <div className='grid grid-cols-2 gap-2'>
            {sideMarkets.map((market) => (
              <div
                key={market.name}
                className='grid min-w-0 grid-cols-[minmax(0,1fr)_72px] overflow-hidden border border-[#c9c9c9]'
              >
                <div className='flex min-h-[48px] items-center bg-[#f1f1f1] px-2 text-xs font-bold text-[#333333] sm:text-sm'>
                  {market.name}
                </div>

                <OddsButton
                  nation={market.name}
                  odds={market.odds}
                  type='back'
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableTeen42({ isMobile, isSuspended, openBetSlip, markets }) {
  const playerA = {
    back: markets?.playerA?.back || '1.98',
    lay: markets?.playerA?.lay || '2.02',
  };

  const playerB = {
    back: markets?.playerB?.back || '1.6',
    lay: markets?.playerB?.lay || '1.65',
  };

  const sideMarkets = [
    {
      name: 'Player B Under 21',
      odds: markets?.under21?.back || '2.45',
    },
    {
      name: 'Player B Over 21',
      odds: markets?.over21?.back || '1.69',
    },
  ];

  const LockIcon = () => (
    <svg viewBox='0 0 24 24' className='h-6 w-6 fill-white'>
      <path d='M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm4 10.73V19h-2v-2.27a2 2 0 1 1 2 0Z' />
    </svg>
  );

  const OddsButton = ({ nation, odds, type }) => (
    <button
      type='button'
      disabled={isSuspended}
      onClick={() => openBetSlip(nation, odds, type, isMobile)}
      className={`flex h-[48px] min-w-0 items-center justify-center text-sm font-bold text-[#333333] sm:text-base ${
        isSuspended
          ? type === 'back'
            ? 'cursor-not-allowed bg-[#414b54]'
            : 'cursor-not-allowed bg-[#5b4b4f]'
          : type === 'back'
            ? 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
            : 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
      }`}
    >
      {isSuspended ? <LockIcon /> : odds}
    </button>
  );

  const PlayerSection = ({ name, data }) => (
    <div className='min-w-0 overflow-hidden border border-[#c9c9c9]'>
      {/* Player Header */}
      <div className='grid h-[48px] grid-cols-[3fr_1fr_1fr] border-b border-[#c9c9c9]'>
        <div className='flex items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          {name}
        </div>

        <div className='flex items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base'>
          Back
        </div>

        <div className='flex items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] sm:text-base'>
          Lay
        </div>
      </div>

      {/* Main Market */}
      <div className='grid grid-cols-[3fr_1fr_1fr]'>
        <div className='flex h-[48px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          Main
        </div>

        <OddsButton nation={name} odds={data.back} type='back' />

        <OddsButton nation={name} odds={data.lay} type='lay' />
      </div>
    </div>
  );

  return (
    <div className='w-full'>
      <div className='grid grid-cols-2 gap-2'>
        {/* LEFT: Player A */}
        <div className='min-w-0'>
          <PlayerSection name='Player A' data={playerA} />
        </div>

        {/* RIGHT: Player B + Under/Over */}
        <div className='min-w-0 space-y-2'>
          <PlayerSection name='Player B' data={playerB} />

          <div className='grid grid-cols-2 gap-2'>
            {sideMarkets.map((market) => (
              <div
                key={market.name}
                className='grid min-w-0 grid-cols-[minmax(0,3fr)_minmax(0,1fr)] overflow-hidden border border-[#c9c9c9]'
              >
                <div className='flex h-[48px] min-w-0 items-center bg-[#f1f1f1] px-2 text-xs font-bold text-[#333333] sm:text-base'>
                  {market.name}
                </div>

                <OddsButton
                  nation={market.name}
                  odds={market.odds}
                  type='back'
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableTeen33({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
      suspended: markets?.playerA?.isSuspended ?? true,
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.86',
      lay: markets?.playerB?.lay || '1.91',
      suspended: markets?.playerB?.isSuspended ?? isSuspended,
    },
  ];

  const LockIcon = () => (
    <svg viewBox='0 0 24 24' className='h-6 w-6 fill-white'>
      <path d='M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm4 10.73V19h-2v-2.27a2 2 0 1 1 2 0Z' />
    </svg>
  );

  const PlayerSection = ({ player }) => (
    <div className='min-w-0 overflow-hidden border border-[#c9c9c9]'>
      {/* Header Row */}
      <div className='grid h-[48px] grid-cols-[3fr_1fr_1fr]'>
        <div className='flex items-center border-b border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          {player.name}
        </div>

        <div className='flex items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base'>
          Back
        </div>

        <div className='flex items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] sm:text-base'>
          Lay
        </div>
      </div>

      {/* Main Row */}
      <div className='grid grid-cols-[3fr_1fr_1fr]'>
        <div className='flex h-[48px] items-center border-t border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          Main
        </div>

        <button
          type='button'
          disabled={player.suspended}
          onClick={() =>
            openBetSlip(player.name, player.back, 'back', isMobile)
          }
          className={`flex h-[48px] items-center justify-center text-sm font-bold text-[#333333] sm:text-base ${
            player.suspended
              ? 'cursor-not-allowed bg-[#414b54]'
              : 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
          }`}
        >
          {player.suspended ? <LockIcon /> : player.back}
        </button>

        <button
          type='button'
          disabled={player.suspended}
          onClick={() => openBetSlip(player.name, player.lay, 'lay', isMobile)}
          className={`flex h-[48px] items-center justify-center text-sm font-bold text-[#333333] sm:text-base ${
            player.suspended
              ? 'cursor-not-allowed bg-[#5b4b4f]'
              : 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
          }`}
        >
          {player.suspended ? <LockIcon /> : player.lay}
        </button>
      </div>
    </div>
  );

  return (
    <div className='w-full'>
      {/* Player A and Player B */}
      <div className='grid grid-cols-2 gap-2'>
        {players.map((player) => (
          <PlayerSection key={player.name} player={player} />
        ))}
      </div>

      {/* Bottom Message */}
      <div className='flex min-h-[42px] items-center justify-center bg-[#f8f8f8] px-2 text-center'>
        <span className='text-sm font-bold text-[#16839a] sm:text-base'>
          Play Our New Game Premium Teenpatti 1 Day
        </span>
      </div>

      {/* Bottom Strip */}
      <div className='h-[16px] w-full bg-[#4b5b6b]' />
    </div>
  );
}

function TableTeen32({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.81',
      lay: markets?.playerA?.lay || '1.86',
      suspended: isSuspended || (markets?.playerA?.isSuspended ?? false),
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '0',
      lay: markets?.playerB?.lay || '0',
      suspended: isSuspended || (markets?.playerB?.isSuspended ?? true),
    },
  ];

  const LockIcon = () => (
    <svg viewBox='0 0 24 24' className='h-6 w-6 fill-white' aria-hidden='true'>
      <path d='M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm4 10.73V19h-2v-2.27a2 2 0 1 1 2 0Z' />
    </svg>
  );

  const PlayerSection = ({ player }) => (
    <div className='min-w-0 overflow-hidden border border-[#c9c9c9]'>
      {/* Header */}
      <div className='grid h-[48px] grid-cols-[3fr_1fr_1fr]'>
        <div className='flex items-center border-b border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          {player.name}
        </div>

        <div className='flex items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base'>
          Back
        </div>

        <div className='flex items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] sm:text-base'>
          Lay
        </div>
      </div>

      {/* Main Market */}
      <div className='relative grid grid-cols-[3fr_1fr_1fr]'>
        <div className='flex h-[48px] items-center border-t border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          Main
        </div>

        <button
          type='button'
          disabled={player.suspended}
          onClick={() =>
            openBetSlip(player.name, player.back, 'back', isMobile)
          }
          className={`flex h-[48px] items-center justify-center text-sm font-bold text-[#333333] sm:text-base ${
            player.suspended
              ? 'cursor-not-allowed bg-[#414b54]'
              : 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
          }`}
        >
          {player.suspended ? (
            <span className='opacity-30'>0</span>
          ) : (
            player.back
          )}
        </button>

        <button
          type='button'
          disabled={player.suspended}
          onClick={() => openBetSlip(player.name, player.lay, 'lay', isMobile)}
          className={`flex h-[48px] items-center justify-center text-sm font-bold text-[#333333] sm:text-base ${
            player.suspended
              ? 'cursor-not-allowed bg-[#5b4b4f]'
              : 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
          }`}
        >
          {player.suspended ? (
            <span className='opacity-30'>0</span>
          ) : (
            player.lay
          )}
        </button>

        {player.suspended && (
          <div className='pointer-events-none absolute inset-y-0 right-0 left-[60%] flex items-center justify-center'>
            <LockIcon />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className='w-full'>
      <div className='grid grid-cols-2 gap-2'>
        <PlayerSection player={players[0]} />
        <PlayerSection player={players[1]} />
      </div>
    </div>
  );
}

function TableTeen({ isMobile, isSuspended, openBetSlip, markets }) {
  const mainPlayers = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  const sideBets = [
    { name: 'Pair Plus A', odds: '2.0' },
    { name: 'Pair Plus B', odds: '2.0' },
    { name: '3 Baccarat A', odds: '1.95' },
    { name: '3 Baccarat B', odds: '1.95' },
  ];

  const backStyle = 'bg-[#72b9e8] hover:bg-[#5da9dc]';

  const layStyle = 'bg-[#f5a5b8] hover:bg-[#ed91a7]';

  const buttonBase =
    'flex min-h-[42px] w-full items-center justify-center rounded-md px-2 text-sm font-bold text-[#263746] transition-colors';

  const renderOdds = (nation, odds, type) => (
    <button
      type='button'
      disabled={isSuspended}
      onClick={() => !isSuspended && openBetSlip(nation, odds, type, isMobile)}
      className={`${buttonBase} ${type === 'back' ? backStyle : layStyle} ${
        isSuspended ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
    >
      {isSuspended ? '0' : odds}
    </button>
  );

  return (
    <div className='w-full'>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr]'>
        {/* MAIN PLAYER ODDS */}
        <div className='overflow-hidden rounded-lg border border-[#d1d5d9] bg-white'>
          <div className='grid grid-cols-[minmax(0,1fr)_76px_76px] items-center gap-2 border-b border-[#d1d5d9] bg-[#f3f5f7] px-3 py-2'>
            <div className='text-sm font-bold text-[#4b5b6b]'>Players</div>
            <div className='rounded-md bg-[#72b9e8] py-1.5 text-center text-xs font-bold text-[#263746]'>
              Back
            </div>
            <div className='rounded-md bg-[#f5a5b8] py-1.5 text-center text-xs font-bold text-[#263746]'>
              Lay
            </div>
          </div>

          <div className='divide-y divide-[#e5e7eb]'>
            {mainPlayers.map((player) => (
              <div
                key={player.name}
                className='grid grid-cols-[minmax(0,1fr)_76px_76px] items-center gap-2 px-3 py-2'
              >
                <div className='min-w-0'>
                  <div className='truncate text-sm font-semibold text-[#263746]'>
                    {player.name}
                  </div>
                </div>

                {renderOdds(player.name, player.back, 'back')}
                {renderOdds(player.name, player.lay, 'lay')}
              </div>
            ))}
          </div>
        </div>

        {/* SIDE BETS */}
        <div className='overflow-hidden rounded-lg border border-[#d1d5d9] bg-white'>
          <div className='grid grid-cols-[minmax(0,1fr)_76px] items-center gap-2 border-b border-[#d1d5d9] bg-[#f3f5f7] px-3 py-2'>
            <div className='text-sm font-bold text-[#4b5b6b]'>Side Bets</div>
            <div className='rounded-md bg-[#72b9e8] py-1.5 text-center text-xs font-bold text-[#263746]'>
              Back
            </div>
          </div>

          <div className='divide-y divide-[#e5e7eb]'>
            {sideBets.map((bet) => (
              <div
                key={bet.name}
                className='grid grid-cols-[minmax(0,1fr)_76px] items-center gap-2 px-3 py-2'
              >
                <div className='min-w-0 truncate text-sm font-semibold text-[#263746]'>
                  {bet.name}
                </div>

                {renderOdds(bet.name, bet.odds, 'back')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableTeen20({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      items: [
        {
          name: 'Player A',
          odds: markets?.playerA?.back || '1.98',
          type: 'back',
        },
        {
          name: '3 Baccarat A',
          odds: markets?.baccaratA?.back || '1.95',
          type: 'back',
        },
        { name: 'Total A', odds: markets?.totalA?.back || '2.0', type: 'back' },
        {
          name: 'Pair Plus A',
          odds: markets?.pairPlusA?.back || '2.0',
          type: 'back',
        },
      ],
    },
    {
      name: 'Player B',
      items: [
        {
          name: 'Player B',
          odds: markets?.playerB?.back || '1.98',
          type: 'back',
        },
        {
          name: '3 Baccarat B',
          odds: markets?.baccaratB?.back || '1.95',
          type: 'back',
        },
        { name: 'Total B', odds: markets?.totalB?.back || '2.0', type: 'back' },
        {
          name: 'Pair Plus B',
          odds: markets?.pairPlusB?.back || '2.0',
          type: 'back',
        },
      ],
    },
  ];

  const suitMarkets = [
    { name: 'Black A', label: 'A', symbols: ['♠', '♣'] },
    { name: 'Red A', label: 'A', symbols: ['♥', '♦'] },
    { name: 'Black B', label: 'B', symbols: ['♠', '♣'] },
    { name: 'Red B', label: 'B', symbols: ['♥', '♦'] },
  ];

  const results = Array.isArray(markets?.lastResult)
    ? markets.lastResult
    : ['A', 'A', 'A', 'A', 'B', 'A', 'B', 'A', 'A', 'B'];

  const LockIcon = () => (
    <svg viewBox='0 0 24 24' fill='currentColor' className='h-7 w-7 text-white'>
      <path d='M7 8V6a5 5 0 0110 0v2h1a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1zm2 0h6V6a3 3 0 00-6 0v2zm3 4a2 2 0 00-1 3.73V18h2v-2.27A2 2 0 0012 12z' />
    </svg>
  );

  const OddsButton = ({ nation, odds, type = 'back' }) => (
    <button
      type='button'
      disabled={isSuspended}
      onClick={() => {
        if (!isSuspended) {
          openBetSlip(nation, odds, type, isMobile);
        }
      }}
      className={`flex min-h-[60px] w-full items-center justify-center border border-white/50 transition-colors ${
        isSuspended
          ? 'cursor-not-allowed bg-[#414c56]'
          : 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
      }`}
    >
      {isSuspended ? (
        <LockIcon />
      ) : (
        <span className='text-xl font-bold text-[#303b45]'>{odds}</span>
      )}
    </button>
  );

  return (
    <div className='w-full min-w-0 bg-white'>
      {/* PLAYER A AND PLAYER B */}
      <div className='grid grid-cols-1 gap-2 p-1 lg:grid-cols-2'>
        {players.map((player) => (
          <section
            key={player.name}
            className='min-w-0 overflow-hidden border border-[#cccccc] bg-[#f1f1f1]'
          >
            {/* Player Heading */}
            <div className='border-b border-[#cccccc] px-3 py-2'>
              <h3 className='text-lg font-bold text-[#333333]'>
                {player.name}
              </h3>
            </div>

            {/* Four Markets */}
            <div className='grid grid-cols-2'>
              {player.items.map((item) => (
                <div
                  key={item.name}
                  className='min-w-0 border-r border-b border-[#cccccc]'
                >
                  <div className='flex min-h-[90px] items-center justify-center text-center'>
                    <span className='text-sm font-bold text-[#333333] sm:text-base'>
                      {item.name}
                    </span>
                  </div>

                  <OddsButton
                    nation={item.name}
                    odds={item.odds}
                    type={item.type}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* SUIT BETS */}
      <div className='grid grid-cols-1 gap-2 p-1 sm:grid-cols-2 lg:grid-cols-4'>
        {suitMarkets.map((item) => {
          const suitOdds = markets?.[item.name]?.back || '0';
          const suitClosed = isSuspended || !(Number(suitOdds) > 0);
          return (
            <button
              key={item.name}
              type='button'
              disabled={suitClosed}
              onClick={() => {
                if (!suitClosed) {
                  openBetSlip(item.name, suitOdds, 'back', isMobile);
                }
              }}
              className={`flex min-h-[72px] items-center justify-between gap-2 border border-[#c9c9c9] px-3 ${
                suitClosed
                  ? 'cursor-not-allowed bg-[#414c56]'
                  : 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
              }`}
            >
              <span className='flex items-center gap-2 text-2xl'>
                <span
                  className={
                    item.name.startsWith('Red')
                      ? 'text-red-600'
                      : 'text-[#252525]'
                  }
                >
                  {item.symbols[0]} {item.symbols[1]}
                </span>
                <span className='text-sm font-bold text-[#263746]'>
                  {item.label}
                </span>
              </span>

              {suitClosed ? (
                <LockIcon />
              ) : (
                <span className='text-lg font-bold text-[#263746]'>
                  {suitOdds}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TableTeen9({ isMobile, isSuspended, openBetSlip, markets }) {
  const columns = ['Tiger', 'Lion', 'Dragon'];

  const rows = [
    {
      name: 'Winner',
      key: 'winner',
      odds: ['2.94', '2.94', '2.94'],
    },
    {
      name: 'Pair',
      key: 'pair',
      odds: ['5', '5', '5'],
    },
    {
      name: 'Flush',
      key: 'flush',
      odds: ['12', '12', '12'],
    },
    {
      name: 'Straight',
      key: 'straight',
      odds: ['21', '21', '21'],
    },
    {
      name: 'Trio',
      key: 'trio',
      odds: ['126', '126', '126'],
    },
    {
      name: 'Straight Flush',
      key: 'straightFlush',
      odds: ['151', '151', '151'],
    },
  ];

  return (
    <div className='w-full overflow-hidden border border-[#c9c9c9]'>
      {/* Column Headers */}
      <div className='grid grid-cols-[2fr_1fr_1fr_1fr]'>
        <div className='h-[48px] border-b border-[#c9c9c9] bg-[#f1f1f1]' />

        {columns.map((column) => (
          <div
            key={column}
            className='flex h-[48px] items-center justify-center border-b border-l border-[#c9c9c9] bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base'
          >
            {column}
          </div>
        ))}
      </div>

      {/* Market Rows */}
      {rows.map((row) => (
        <div key={row.key} className='grid grid-cols-[2fr_1fr_1fr_1fr]'>
          {/* Market Name */}
          <div className='flex h-[48px] min-w-0 items-center border-b border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
            {row.name}
          </div>

          {/* Tiger, Lion, Dragon Odds */}
          {columns.map((column, index) => {
            const odds =
              markets?.[row.key]?.[column.toLowerCase()] ?? row.odds[index];

            const marketName = `${row.name} ${column}`;

            return (
              <button
                key={column}
                type='button'
                disabled={isSuspended}
                onClick={() => openBetSlip(marketName, odds, 'back', isMobile)}
                className='flex h-[48px] min-w-0 items-center justify-center border-b border-l border-[#c9c9c9] bg-[#72b9e8] text-sm font-bold text-[#333333] transition-colors hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base'
              >
                {odds}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function TableTeen8({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const cards = String(roundData?.card || '')
    .split(',')
    .map((x) => x.trim());
  const byType = (t) =>
    subs
      .filter((s) => String(s.subtype || '').toLowerCase() === t)
      .sort((a, b) => Number(a.sr || 0) - Number(b.sr || 0));
  const playerSubs = byType('player');
  const pairSubs = byType('pair');
  const totalSubs = byType('total');

  return (
    <div className='casino-table'>
      <div className='casino-table-full-box'>
        <div className='casino-table-header'>
          <div className='casino-nation-detail' />
          <div className='casino-odds-box back'>Odds</div>
          <div className='casino-odds-box back'>Pair Plus</div>
          <div className='casino-odds-box back'>Total</div>
        </div>
        <div className='casino-table-body'>
          {Array.from({ length: 8 }, (_, e) => {
            const p = playerSubs[e];
            const pr = pairSubs[e];
            const tot = totalSubs[e];
            const pCards = [cards[e], cards[e + 9], cards[e + 18]]
              .map(formatInlineCard)
              .filter(Boolean);
            const cell = (m, labelOverride) => {
              const dead =
                isSuspended ||
                !m ||
                String(m.gstatus || '').toUpperCase() !== 'OPEN' ||
                !(Number(m.b) > 0);
              return (
                <div
                  className={`casino-odds-box back ${dead ? 'suspended-box' : ''}`}
                  style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
                  onClick={() =>
                    !dead && openBetSlip(m.sid ?? m.nat, m.b, 'back', isMobile)
                  }
                >
                  <span className='casino-odds'>
                    {labelOverride ?? m?.b ?? 0}
                  </span>
                </div>
              );
            };
            return (
              <div className='casino-table-row' key={e}>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>
                    {p?.nat || `Player ${e + 1}`}
                    {pCards.length > 0 && (
                      <div className='patern-name'>
                        {pCards.map((c, ci) => (
                          <span key={ci} className='card-icon ms-2'>
                            {c.rank}
                            <span className={`${c.cls} ms-1`}>{c.sym}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {cell(p)}
                {cell(pr, pr?.nat)}
                {cell(tot)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TableTeen6({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.31',
      lay: markets?.playerA?.lay || '1.36',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.31',
      lay: markets?.playerB?.lay || '1.36',
    },
  ];

  const sideMarkets = [
    { name: 'Player A Under 21', odds: markets?.under21A?.back || '0' },
    { name: 'Player A Over 22', odds: markets?.over22A?.back || '0' },
    { name: 'Player B Under 21', odds: markets?.under21B?.back || '0' },
    { name: 'Player B Over 22', odds: markets?.over22B?.back || '0' },
  ];

  const suitMarkets = [
    { name: 'Spade', icon: '♠', odds: markets?.spade?.back || '4.61' },
    { name: 'Heart', icon: '♥', odds: markets?.heart?.back || '3.56' },
    { name: 'Club', icon: '♣', odds: markets?.club?.back || '3.56' },
    { name: 'Diamond', icon: '♦', odds: markets?.diamond?.back || '3.85' },
    { name: 'Odd', icon: 'Odd', odds: markets?.odd?.back || '1.97' },
    { name: 'Even', icon: 'Even', odds: markets?.even?.back || '1.97' },
  ];

  const cardValues = [
    { value: 'A', odds: '11.12' },
    { value: '2', odds: '11.12' },
    { value: '3', odds: '22.16' },
    { value: '4', odds: '11.12' },
    { value: '5', odds: '11.12' },
    { value: '6', odds: '11.12' },
    { value: '7', odds: '14.8' },
    { value: '8', odds: '11.12' },
    { value: '9', odds: '11.12' },
    { value: '10', odds: '11.12' },
    { value: 'J', odds: '14.8' },
    { value: 'Q', odds: '11.12' },
    { value: 'K', odds: '11.12' },
  ];

  const PlayerSection = ({ player }) => (
    <div className='min-w-0 overflow-hidden border border-[#c9c9c9]'>
      {/* Player Header */}
      <div className='grid h-[48px] grid-cols-[3fr_1fr_1fr]'>
        <div className='flex items-center border-b border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          {player.name}
        </div>

        <div className='flex items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base'>
          Back
        </div>

        <div className='flex items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] sm:text-base'>
          Lay
        </div>
      </div>

      {/* Main Market */}
      <div className='grid grid-cols-[3fr_1fr_1fr]'>
        <div className='flex h-[48px] items-center border-t border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          Main
        </div>

        <button
          type='button'
          onClick={() =>
            openBetSlip(player.name, player.back, 'back', isMobile)
          }
          className='flex h-[48px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] sm:text-base'
        >
          {player.back}
        </button>

        <button
          type='button'
          onClick={() => openBetSlip(player.name, player.lay, 'lay', isMobile)}
          className='flex h-[48px] items-center justify-center bg-[#f5a5b8] text-sm font-bold text-[#333333] hover:bg-[#ed91a7] sm:text-base'
        >
          {player.lay}
        </button>
      </div>
    </div>
  );

  return (
    <div className='w-full space-y-3'>
      {/* Player A & Player B */}
      <div className='grid grid-cols-2 gap-2'>
        {players.map((player) => (
          <PlayerSection key={player.name} player={player} />
        ))}
      </div>

      {/* Under 21 / Over 22 */}
      <div className='grid grid-cols-2 gap-2'>
        {sideMarkets.map((market) => (
          <div
            key={market.name}
            className='grid min-w-0 grid-cols-[minmax(0,3fr)_minmax(0,1.25fr)] overflow-hidden border border-[#c9c9c9]'
          >
            <div className='flex h-[48px] items-center bg-[#f1f1f1] px-2 text-xs font-bold text-[#333333] sm:text-base'>
              {market.name}
            </div>

            <button
              type='button'
              onClick={() =>
                openBetSlip(market.name, market.odds, 'back', isMobile)
              }
              className='flex h-[48px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] sm:text-base'
            >
              {market.odds}
            </button>
          </div>
        ))}
      </div>

      {/* Suit Markets */}
      <div className='grid grid-cols-6 gap-2'>
        {suitMarkets.map((market) => (
          <button
            key={market.name}
            type='button'
            onClick={() =>
              openBetSlip(market.name, market.odds, 'back', isMobile)
            }
            className='flex h-[48px] min-w-0 items-center justify-between gap-1 bg-[#72b9e8] px-2 hover:bg-[#5da9dc]'
          >
            <span
              className={`truncate text-xl font-bold sm:text-2xl ${
                market.name === 'Heart' || market.name === 'Diamond'
                  ? 'text-[#e52c32]'
                  : market.name === 'Odd' || market.name === 'Even'
                    ? 'text-sm text-[#333333] sm:text-base'
                    : 'text-[#222222]'
              }`}
            >
              {market.icon}
            </span>

            <span className='truncate text-xs font-bold text-[#333333] sm:text-base'>
              {market.odds}
            </span>
          </button>
        ))}
      </div>

      {/* Card Odds */}
      <div className='w-full overflow-x-auto bg-[#f1f1f1] px-2 py-2'>
        <div className='mx-auto flex w-max items-end justify-center gap-1.5'>
          {cardValues.map((card) => (
            <button
              key={card.value}
              type='button'
              onClick={() =>
                openBetSlip(`Card ${card.value}`, card.odds, 'back', isMobile)
              }
              className='flex w-[58px] shrink-0 flex-col items-center gap-1'
            >
              {/* Card Odds */}
              <span className='text-xs font-bold text-[#333333]'>
                {card.odds}
              </span>

              {/* Card */}
              <div className='flex h-[126px] w-[58px] flex-col items-center justify-between border-2 border-[#f2e600] bg-white py-1'>
                <span className='text-[35px] leading-[38px] font-bold text-black'>
                  {card.value}
                </span>

                <div className='grid w-full grid-cols-2 px-1 text-[24px] leading-[25px] font-bold'>
                  <span className='text-black'>♠</span>
                  <span className='text-red-600'>♦</span>
                  <span className='text-black'>♣</span>
                  <span className='text-red-600'>♥</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TablePatti2({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      mainBack: markets?.playerA?.back || '1.96',
      mainLay: markets?.playerA?.lay || '0',
      miniBaccarat: markets?.miniBaccaratA?.back || '2.59',
      totalBack: markets?.totalA?.back || '34',
      totalLay: markets?.totalA?.lay || '43',
      totalBackTop: '14',
      totalLayTop: '15',
    },
    {
      name: 'Player B',
      mainBack: markets?.playerB?.back || '1.96',
      mainLay: markets?.playerB?.lay || '0',
      miniBaccarat: markets?.miniBaccaratB?.back || '1.85',
      totalBack: markets?.totalB?.back || '95',
      totalLay: markets?.totalB?.lay || '105',
      totalBackTop: '14',
      totalLayTop: '15',
    },
  ];

  const PlayerSection = ({ player }) => (
    <div className='min-w-0 overflow-hidden border border-[#c9c9c9]'>
      {/* Main */}
      <div className='grid grid-cols-[3fr_1fr_1fr] border-b border-[#c9c9c9]'>
        <div className='flex h-[48px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          {player.name}
        </div>

        <button
          type='button'
          onClick={() =>
            openBetSlip(player.name, player.mainBack, 'back', isMobile)
          }
          className='flex h-[48px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] sm:text-base'
        >
          {player.mainBack}
        </button>

        <button
          type='button'
          onClick={() =>
            openBetSlip(player.name, player.mainLay, 'lay', isMobile)
          }
          className='flex h-[48px] items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] hover:bg-[#ed91a7] sm:text-base'
        >
          {player.mainLay}
        </button>
      </div>

      {/* Mini Baccarat */}
      <div className='grid grid-cols-[3fr_2fr] border-b border-[#c9c9c9]'>
        <div className='flex h-[48px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          Mini Baccarat {player.name.slice(-1)}
        </div>

        <button
          type='button'
          onClick={() =>
            openBetSlip(
              `Mini Baccarat ${player.name.slice(-1)}`,
              player.miniBaccarat,
              'back',
              isMobile
            )
          }
          className='flex h-[48px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] sm:text-base'
        >
          {player.miniBaccarat}
        </button>
      </div>

      {/* Total */}
      <div className='grid grid-cols-[3fr_1fr_1fr]'>
        <div className='flex h-[48px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          Total {player.name.slice(-1)}
        </div>

        {/* Total Back */}
        <button
          type='button'
          onClick={() =>
            openBetSlip(
              `Total ${player.name.slice(-1)}`,
              player.totalBack,
              'lay',
              isMobile
            )
          }
          className='flex h-[48px] flex-col items-center justify-center bg-[#f5a5b8] text-[#333333] hover:brightness-95'
        >
          <span className='text-xs leading-4'>{player.totalBackTop}</span>
          <span className='text-sm leading-4 font-bold sm:text-base'>
            {player.totalBack}
          </span>
        </button>

        {/* Total Lay */}
        <button
          type='button'
          onClick={() =>
            openBetSlip(
              `Total ${player.name.slice(-1)}`,
              player.totalLay,
              'back',
              isMobile
            )
          }
          className='flex h-[48px] flex-col items-center justify-center bg-[#72b9e8] text-[#333333] hover:brightness-95'
        >
          <span className='text-xs leading-4'>{player.totalLayTop}</span>
          <span className='text-sm leading-4 font-bold sm:text-base'>
            {player.totalLay}
          </span>
        </button>
      </div>
    </div>
  );

  const colorPlusOdds = markets?.colorPlus?.back || '0';

  return (
    <div className='w-full space-y-2'>
      {/* Player A & Player B */}
      <div className='grid grid-cols-2 gap-2'>
        {players.map((player) => (
          <PlayerSection key={player.name} player={player} />
        ))}
      </div>

      {/* Color Plus */}
      <button
        type='button'
        onClick={() =>
          openBetSlip('Color Plus', colorPlusOdds, 'back', isMobile)
        }
        className='flex h-[48px] w-full items-center justify-center bg-[#414b54] text-sm font-bold text-white transition-colors hover:bg-[#35414a] sm:text-base'
      >
        Color Plus
      </button>
    </div>
  );
}

function TableTeensin({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className='casino-table teensin'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail'>Nation</div>
            <div className='casino-odds-box back'>Back</div>
            <div className='casino-odds-box lay'>Lay</div>
          </div>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Player A</div>
              </div>
              <OddsBox
                nation='Player A'
                odds={markets?.playerA?.back || '1.98'}
                type='back'
              />
              <OddsBox
                nation='Player A'
                odds={markets?.playerA?.lay || '2.02'}
                type='lay'
              />
            </div>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Player B</div>
              </div>
              <OddsBox
                nation='Player B'
                odds={markets?.playerB?.back || '1.98'}
                type='back'
              />
              <OddsBox
                nation='Player B'
                odds={markets?.playerB?.lay || '2.02'}
                type='lay'
              />
            </div>
          </div>
        </div>

        <div className='casino-table-right-box mt-md-0 mt-3'>
          <div className='teenpatti20-other-oods'>
            <div className='casino-table-header'>
              <div className='casino-nation-detail'>Side Bets</div>
              <div className='casino-odds-box back'>Back</div>
            </div>
            <div className='casino-table-body'>
              <div className='casino-table-row'>
                <div className='casino-nation-detail'>Pair Plus A</div>
                <OddsBox nation='Pair Plus A' odds='2.0' type='back' />
              </div>
              <div className='casino-table-row'>
                <div className='casino-nation-detail'>Pair Plus B</div>
                <OddsBox nation='Pair Plus B' odds='2.0' type='back' />
              </div>
              <div className='casino-table-row'>
                <div className='casino-nation-detail'>3 Baccarat A</div>
                <OddsBox nation='3 Baccarat A' odds='1.95' type='back' />
              </div>
              <div className='casino-table-row'>
                <div className='casino-nation-detail'>3 Baccarat B</div>
                <OddsBox nation='3 Baccarat B' odds='1.95' type='back' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableTeenmuf({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      suffix: 'A',
      winner: markets?.playerA?.back || '1.98',
      top9: 'A',
      baccarat: markets?.miniBaccaratA?.back || '1.95',
    },
    {
      name: 'Player B',
      suffix: 'B',
      winner: markets?.playerB?.back || '1.98',
      top9: 'B',
      baccarat: markets?.miniBaccaratB?.back || '1.95',
    },
  ];

  const PlayerSection = ({ player }) => {
    const marketsList = [
      {
        name: 'Winner',
        value: player.winner,
        marketName: `Winner ${player.suffix}`,
      },
      {
        name: 'Top 9',
        value: player.top9,
        marketName: `Top 9 ${player.suffix}`,
      },
      {
        name: `M Baccarat ${player.suffix}`,
        value: player.baccarat,
        marketName: `M Baccarat ${player.suffix}`,
      },
    ];

    return (
      <div className='min-w-0 overflow-hidden border border-[#c9c9c9]'>
        {/* Player Header */}
        <div className='flex h-[48px] items-center border-b border-[#c9c9c9] bg-[#f1f1f1] px-2'>
          <span className='text-sm font-bold text-[#333333] sm:text-base'>
            {player.name}
          </span>
        </div>

        {/* Market Names */}
        <div className='grid grid-cols-3'>
          {marketsList.map((market, index) => (
            <div
              key={market.name}
              className={`flex h-[48px] min-w-0 items-center justify-center bg-[#f1f1f1] px-1 text-center text-xs font-bold text-[#333333] sm:text-base ${
                index !== 0 ? 'border-l border-[#c9c9c9]' : ''
              }`}
            >
              {market.name}
            </div>
          ))}
        </div>

        {/* Odds */}
        <div className='grid grid-cols-3'>
          {marketsList.map((market, index) => (
            <button
              key={market.marketName}
              type='button'
              disabled={isSuspended}
              onClick={() =>
                openBetSlip(market.marketName, market.value, 'back', isMobile)
              }
              className={`flex h-[48px] min-w-0 items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#333333] transition-colors hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base ${
                index !== 0 ? 'border-l border-[#c9c9c9]' : ''
              }`}
            >
              {market.value}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className='w-full'>
      <div className='grid grid-cols-2 gap-2'>
        {players.map((player) => (
          <PlayerSection key={player.name} player={player} />
        ))}
      </div>
    </div>
  );
}

function TableTrio({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className='casino-table trio'>
      <div className='casino-table-box'>
        <div className='d-flex justify-content-between mb-3 gap-2'>
          <div className='w-100 rounded border p-2'>
            <div className='fw-bold'>Player 1</div>
            <div className='d-flex mt-1 gap-2'>
              <OddsBox
                nation='Player 1'
                odds='2.95'
                type='back'
                className='w-50'
              />
              <OddsBox
                nation='Player 1'
                odds='3.05'
                type='lay'
                className='w-50'
              />
            </div>
          </div>
          <div className='w-100 rounded border p-2'>
            <div className='fw-bold'>Player 2</div>
            <div className='d-flex mt-1 gap-2'>
              <OddsBox
                nation='Player 2'
                odds='2.95'
                type='back'
                className='w-50'
              />
              <OddsBox
                nation='Player 2'
                odds='3.05'
                type='lay'
                className='w-50'
              />
            </div>
          </div>
          <div className='w-100 rounded border p-2'>
            <div className='fw-bold'>Player 3</div>
            <div className='d-flex mt-1 gap-2'>
              <OddsBox
                nation='Player 3'
                odds='2.95'
                type='back'
                className='w-50'
              />
              <OddsBox
                nation='Player 3'
                odds='3.05'
                type='lay'
                className='w-50'
              />
            </div>
          </div>
        </div>

        <div className='casino-table-box triocards mt-3'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail'>
              Side Bets (Hand Combinations)
            </div>
            <div className='casino-odds-box back'>Back Rate</div>
          </div>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>Pair (Payout 5.5)</div>
              <OddsBox nation='Pair' odds='5.5' type='back' />
            </div>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>Flush (Payout 17.0)</div>
              <OddsBox nation='Flush' odds='17.0' type='back' />
            </div>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>Straight (Payout 24.0)</div>
              <OddsBox nation='Straight' odds='24.0' type='back' />
            </div>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>Trio (Payout 201.0)</div>
              <OddsBox nation='Trio' odds='201.0' type='back' />
            </div>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                Straight Flush (Payout 226.0)
              </div>
              <OddsBox nation='Straight Flush' odds='226.0' type='back' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableTeen120({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.95',
      lay: markets?.playerA?.lay || '2.00',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.95',
      lay: markets?.playerB?.lay || '2.00',
    },
  ];

  const sideBets = [
    {
      name: 'Pair Plus A',
      odds: markets?.pairPlusA?.back || '2.0',
    },
    {
      name: 'Pair Plus B',
      odds: markets?.pairPlusB?.back || '2.0',
    },
    {
      name: '3 Baccarat A',
      odds: markets?.baccaratA?.back || '1.95',
    },
    {
      name: '3 Baccarat B',
      odds: markets?.baccaratB?.back || '1.95',
    },
  ];

  return (
    <div className='grid w-full grid-cols-2 items-start gap-3'>
      {/* LEFT: Player A / Player B */}
      <div className='min-w-0 overflow-hidden rounded-lg border border-[#d8dee5] bg-white shadow-sm'>
        {/* Header */}
        <div className='grid grid-cols-[minmax(0,1fr)_68px_68px] bg-[#4b5b6b]'>
          <div className='flex h-[44px] items-center px-3 text-sm font-bold text-white'>
            Nation
          </div>

          <div className='flex h-[44px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#253746]'>
            Back
          </div>

          <div className='flex h-[44px] items-center justify-center bg-[#f5a5b8] text-sm font-bold text-[#253746]'>
            Lay
          </div>
        </div>

        {/* Player Rows */}
        {players.map((player, index) => (
          <div
            key={player.name}
            className={`grid grid-cols-[minmax(0,1fr)_68px_68px] ${
              index % 2 === 0 ? 'bg-white' : 'bg-[#f6f7f8]'
            }`}
          >
            <div className='flex h-[56px] items-center px-3 text-sm font-bold text-[#343a40]'>
              {player.name}
            </div>

            <button
              type='button'
              onClick={() =>
                openBetSlip(player.name, player.back, 'back', isMobile)
              }
              className='flex h-[56px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#253746] hover:bg-[#5da9dc]'
            >
              {player.back}
            </button>

            <button
              type='button'
              onClick={() =>
                openBetSlip(player.name, player.lay, 'lay', isMobile)
              }
              className='flex h-[56px] items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#253746] hover:bg-[#ed91a7]'
            >
              {player.lay}
            </button>
          </div>
        ))}
      </div>

      {/* RIGHT: Side Bets */}
      <div className='min-w-0 overflow-hidden rounded-lg border border-[#d8dee5] bg-white shadow-sm'>
        {/* Header */}
        <div className='grid grid-cols-[minmax(0,1fr)_76px] bg-[#4b5b6b]'>
          <div className='flex h-[44px] items-center px-3 text-sm font-bold text-white'>
            Side Bets
          </div>

          <div className='flex h-[44px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#253746]'>
            Back
          </div>
        </div>

        {/* Side Bet Rows */}
        {sideBets.map((bet, index) => (
          <div
            key={bet.name}
            className={`grid grid-cols-[minmax(0,1fr)_76px] ${
              index % 2 === 0 ? 'bg-white' : 'bg-[#f6f7f8]'
            }`}
          >
            <div className='flex h-[56px] min-w-0 items-center px-3 text-sm font-bold text-[#343a40]'>
              {bet.name}
            </div>

            <button
              type='button'
              onClick={() => openBetSlip(bet.name, bet.odds, 'back', isMobile)}
              className='flex h-[56px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#253746] hover:bg-[#5da9dc]'
            >
              {bet.odds}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableTeen1({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  const sideBets = [
    {
      name: 'Pair Plus A',
      odds: markets?.pairPlusA?.back || '2.0',
    },
    {
      name: 'Pair Plus B',
      odds: markets?.pairPlusB?.back || '2.0',
    },
    {
      name: '3 Baccarat A',
      odds: markets?.baccaratA?.back || '1.95',
    },
    {
      name: '3 Baccarat B',
      odds: markets?.baccaratB?.back || '1.95',
    },
  ];

  return (
    <div className='grid w-full grid-cols-2 items-start gap-3'>
      {/* LEFT: Players */}
      <div className='min-w-0 overflow-hidden rounded-lg border border-[#d8dee5] bg-white shadow-sm'>
        {/* Header */}
        <div className='grid grid-cols-[minmax(0,1fr)_68px_68px] bg-[#4b5b6b]'>
          <div className='flex h-[44px] items-center px-3 text-sm font-bold text-white'>
            Nation
          </div>

          <div className='flex h-[44px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#253746]'>
            Back
          </div>

          <div className='flex h-[44px] items-center justify-center bg-[#f5a5b8] text-sm font-bold text-[#253746]'>
            Lay
          </div>
        </div>

        {/* Player Rows */}
        {players.map((player, index) => (
          <div
            key={player.name}
            className={`grid grid-cols-[minmax(0,1fr)_68px_68px] ${
              index % 2 === 0 ? 'bg-white' : 'bg-[#f6f7f8]'
            }`}
          >
            <div className='flex h-[56px] items-center px-3 text-sm font-bold text-[#343a40]'>
              {player.name}
            </div>

            <button
              type='button'
              disabled={isSuspended}
              onClick={() =>
                openBetSlip(player.name, player.back, 'back', isMobile)
              }
              className='flex h-[56px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#253746] hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {player.back}
            </button>

            <button
              type='button'
              disabled={isSuspended}
              onClick={() =>
                openBetSlip(player.name, player.lay, 'lay', isMobile)
              }
              className='flex h-[56px] items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#253746] hover:bg-[#ed91a7] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {player.lay}
            </button>
          </div>
        ))}
      </div>

      {/* RIGHT: Side Bets */}
      <div className='min-w-0 overflow-hidden rounded-lg border border-[#d8dee5] bg-white shadow-sm'>
        {/* Header */}
        <div className='grid grid-cols-[minmax(0,1fr)_76px] bg-[#4b5b6b]'>
          <div className='flex h-[44px] items-center px-3 text-sm font-bold text-white'>
            Side Bets
          </div>

          <div className='flex h-[44px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#253746]'>
            Back
          </div>
        </div>

        {/* Side Bet Rows */}
        {sideBets.map((bet, index) => (
          <div
            key={bet.name}
            className={`grid grid-cols-[minmax(0,1fr)_76px] ${
              index % 2 === 0 ? 'bg-white' : 'bg-[#f6f7f8]'
            }`}
          >
            <div className='flex h-[56px] min-w-0 items-center px-3 text-sm font-bold text-[#343a40]'>
              {bet.name}
            </div>

            <button
              type='button'
              disabled={isSuspended}
              onClick={() => openBetSlip(bet.name, bet.odds, 'back', isMobile)}
              className='flex h-[56px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#253746] hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {bet.odds}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableTeen3({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.96',
      lay: markets?.playerA?.lay || '0',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.96',
      lay: markets?.playerB?.lay || '0',
    },
  ];

  const PlayerSection = ({ player }) => (
    <div className='min-w-0 overflow-hidden border border-[#c9c9c9]'>
      {/* Header */}
      <div className='grid grid-cols-[3fr_1fr_1fr]'>
        <div className='flex h-[48px] items-center border-b border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          {player.name}
        </div>

        <div className='flex h-[48px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base'>
          Back
        </div>

        <div className='flex h-[48px] items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] sm:text-base'>
          Lay
        </div>
      </div>

      {/* Main Market */}
      <div className='grid grid-cols-[3fr_1fr_1fr]'>
        <div className='flex h-[48px] items-center border-t border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
          Main
        </div>

        <button
          type='button'
          onClick={() =>
            openBetSlip(player.name, player.back, 'back', isMobile)
          }
          className='flex h-[48px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] sm:text-base'
        >
          {player.back}
        </button>

        <button
          type='button'
          onClick={() => openBetSlip(player.name, player.lay, 'lay', isMobile)}
          className='flex h-[48px] items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] hover:bg-[#ed91a7] sm:text-base'
        >
          {player.lay}
        </button>
      </div>
    </div>
  );

  return (
    <div className='grid w-full grid-cols-2 gap-2'>
      {players.map((player) => (
        <PlayerSection key={player.name} player={player} />
      ))}
    </div>
  );
}

function TablePteen({ isMobile, isSuspended, openBetSlip, markets }) {
  const playerMarkets = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  const sideMarkets = [
    { name: 'Pair Plus A', odds: '2.0' },
    { name: 'Pair Plus B', odds: '2.0' },
    { name: '3 Baccarat A', odds: '1.95' },
    { name: '3 Baccarat B', odds: '1.95' },
  ];

  const headerText =
    'flex items-center justify-center text-[13px] font-bold text-[#263747]';

  const nationText =
    'flex min-w-0 items-center px-2 text-[13px] font-semibold text-[#333]';

  const backCell =
    'flex min-h-[36px] h-full items-stretch border-l border-white';

  const layCell =
    'flex min-h-[36px] h-full items-stretch border-l border-white';

  return (
    <div className='w-full min-w-0 bg-[#f5f5f5]'>
      <div className='grid grid-cols-1 gap-2 md:grid-cols-[1.5fr_1fr]'>
        {/* PLAYER A / PLAYER B */}
        <div className='min-w-0 overflow-hidden border border-[#c7c8ca]'>
          {/* Header */}
          <div className='grid min-h-[34px] grid-cols-[minmax(0,1fr)_76px_76px] border-b border-[#c7c8ca] bg-[#f1f1f1]'>
            <div className='flex items-center px-2 text-[13px] font-bold text-[#333]'>
              Nation
            </div>

            <div className={`${headerText} border-l border-white bg-[#72bbef]`}>
              Back
            </div>

            <div className={`${headerText} border-l border-white bg-[#faa9ba]`}>
              Lay
            </div>
          </div>

          {/* Player Rows */}
          {playerMarkets.map((player, index) => (
            <div
              key={player.name}
              className={`grid min-h-[36px] grid-cols-[minmax(0,1fr)_76px_76px] border-b border-[#c7c8ca] last:border-b-0 ${
                index % 2 ? 'bg-[#f5f5f5]' : 'bg-[#f1f1f1]'
              }`}
            >
              <div className={nationText}>
                <span className='truncate'>{player.name}</span>
              </div>

              <div className={backCell}>
                <OddsBox
                  nation={player.name}
                  odds={player.back}
                  type='back'
                  className='!m-0 !h-full !min-h-[36px] !w-full !rounded-none'
                />
              </div>

              <div className={layCell}>
                <OddsBox
                  nation={player.name}
                  odds={player.lay}
                  type='lay'
                  className='!m-0 !h-full !min-h-[36px] !w-full !rounded-none'
                />
              </div>
            </div>
          ))}
        </div>

        {/* SIDE BETS */}
        <div className='min-w-0 overflow-hidden border border-[#c7c8ca]'>
          {/* Header */}
          <div className='grid min-h-[34px] grid-cols-[minmax(0,1fr)_90px] border-b border-[#c7c8ca] bg-[#f1f1f1]'>
            <div className='flex items-center px-2 text-[13px] font-bold text-[#333]'>
              Side Bets
            </div>

            <div className={`${headerText} border-l border-white bg-[#72bbef]`}>
              Back
            </div>
          </div>

          {/* Side Bet Rows */}
          {sideMarkets.map((item, index) => (
            <div
              key={item.name}
              className={`grid min-h-[36px] grid-cols-[minmax(0,1fr)_90px] border-b border-[#c7c8ca] last:border-b-0 ${
                index % 2 ? 'bg-[#f5f5f5]' : 'bg-[#f1f1f1]'
              }`}
            >
              <div className={nationText}>
                <span className='truncate'>{item.name}</span>
              </div>

              <div className={backCell}>
                <OddsBox
                  nation={item.name}
                  odds={item.odds}
                  type='back'
                  className='!m-0 !h-full !min-h-[36px] !w-full !rounded-none'
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const TABLES = {
  poison: TablePoison,
  teenunique: TableTeenunique,
  poison20: TablePoison20,
  joker120: TableJoker120,
  joker20: TableJoker20,
  joker1: TableJoker1,
  teen20c: TableTeen20,
  teen41: TableTeen41,
  teen42: TableTeen42,
  teen33: TableTeen33,
  teen32: TableTeen32,
  teen: TableTeen,
  teen20: TableTeen20,
  teen9: TableTeen9,
  teen8: TableTeen8,
  teen6: TableTeen6,
  patti2: TablePatti2,
  teensin: TableTeensin,
  teenmuf: TableTeenmuf,
  teen20b: TableTeen20,
  trio: TableTrio,
  teen120: TableTeen120,
  teen1: TableTeen1,
  teen3: TableTeen3,
  pteen: TablePteen,
  pteen20: TableTeen20,
};

export default TABLES;
