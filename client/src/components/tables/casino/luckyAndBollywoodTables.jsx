import React from 'react';
import OddsBox from '../OddsBox';
import { NationBook } from './shared';

function TableMogambo({ isMobile, isSuspended, openBetSlip, markets }) {
  const rawMarkets = Array.isArray(markets)
    ? markets
    : markets?.data?.sub ||
      markets?.sub ||
      (markets && typeof markets === 'object'
        ? Object.values(markets).filter(
            (item) => item && typeof item === 'object' && item.sid != null
          )
        : []);

  // Remove duplicate SID entries
  const marketMap = new Map();

  rawMarkets.forEach((market) => {
    if (market?.sid != null) {
      marketMap.set(String(market.sid), market);
    }
  });

  const marketList = [...marketMap.values()];

  // Find markets by API SID
  const dagaMarket = marketList.find((market) => String(market.sid) === '2');

  const mogamboMarket = marketList.find((market) => String(market.sid) === '1');

  const totalMarket = marketList.find((market) => String(market.sid) === '3');

  const LockIcon = () => (
    <svg
      width='22'
      height='24'
      viewBox='0 0 24 24'
      fill='white'
      className='absolute z-20'
    >
      <path d='M18 9h-1V7a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2ZM9 7a3 3 0 0 1 6 0v2H9V7Zm4 9v2a1 1 0 0 1-2 0v-2a2 2 0 1 1 2 0Z' />
    </svg>
  );

  const getSuspended = (market) => {
    if (!market) return true;

    const status = String(market.gstatus ?? market.status ?? '').toUpperCase();

    return status ? status !== 'OPEN' : Boolean(isSuspended);
  };

  const OddsBox = ({ market, type }) => {
    if (!market) {
      return (
        <div className='relative flex min-h-[82px] items-center justify-center bg-[#414c55]'>
          <LockIcon />
        </div>
      );
    }

    const suspended = getSuspended(market);

    const odds =
      type === 'back' ? (market.back ?? market.b) : (market.lay ?? market.l);

    const stake =
      type === 'back'
        ? (market.bs ?? market.bhav)
        : (market.ls ?? market.lbhav);

    const hasOdds = odds !== undefined && odds !== null && odds !== '';

    const disabled = suspended || !hasOdds || Number(odds) <= 0;

    return (
      <button
        type='button'
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            openBetSlip(market.nat, String(odds), type, isMobile);
          }
        }}
        className={`relative flex min-h-[82px] w-full flex-col items-center justify-center overflow-hidden transition-colors ${
          suspended
            ? 'cursor-not-allowed bg-[#414c55]'
            : type === 'lay'
              ? 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
              : 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
        }`}
      >
        {/* Odds remain faintly visible behind lock */}
        <span
          className={`relative z-0 text-[23px] font-extrabold text-[#263746] ${
            suspended ? 'opacity-30' : ''
          }`}
        >
          {hasOdds ? odds : '0'}
        </span>

        {stake !== undefined && stake !== null && (
          <span
            className={`relative z-0 text-sm text-[#263746] ${
              suspended ? 'opacity-25' : ''
            }`}
          >
            {stake}
          </span>
        )}

        {suspended && (
          <>
            <span className='absolute inset-0 z-10 bg-[#414c55]/15' />
            <LockIcon />
          </>
        )}
      </button>
    );
  };

  const MarketName = ({ market, fallback }) => (
    <div className='flex min-w-0 items-center bg-[#f1f0f0] px-2'>
      <span className='truncate text-base font-extrabold text-[#333]'>
        {market?.nat || fallback}
      </span>
    </div>
  );

  return (
    <div className='w-full overflow-hidden bg-[#f5f5f5]'>
      {/* FIRST ROW: DAGA / TEJA + MOGAMBO */}
      <div className='grid grid-cols-2 gap-0 border border-[#c9c9c9]'>
        <div className='grid min-w-0 grid-cols-[60%_40%] border-r border-[#c9c9c9]'>
          <MarketName market={dagaMarket} fallback='Daga / Teja' />
          <OddsBox market={dagaMarket} type='back' />
        </div>

        <div className='grid min-w-0 grid-cols-[60%_40%]'>
          <MarketName market={mogamboMarket} fallback='Mogambo' />
          <OddsBox market={mogamboMarket} type='back' />
        </div>
      </div>

      {/* SECOND ROW: 3 CARD TOTAL */}
      <div className='mx-auto mt-2 grid w-[75%] grid-cols-[minmax(0,1fr)_180px_180px] overflow-hidden border border-[#c9c9c9] max-sm:w-full max-sm:grid-cols-[minmax(0,1fr)_90px_90px]'>
        <MarketName market={totalMarket} fallback='3 Card Total' />

        <OddsBox market={totalMarket} type='lay' />
        <OddsBox market={totalMarket} type='back' />
      </div>
    </div>
  );
}

function TableLucky5({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards11 = [
    { label: 'A', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '7', value: 7 },
    { label: '8', value: 8 },
    { label: '9', value: 9 },
    { label: '10', value: 10 },
    { label: 'J', value: 11 },
  ];

  const placeBet = (name, odds) => {
    if (!isSuspended) {
      openBetSlip(name, odds, 'back', isMobile);
    }
  };

  const OddsButton = ({ name, odds, className = '', children }) => (
    <button
      type='button'
      disabled={isSuspended}
      onClick={() => placeBet(name, odds)}
      className={`flex min-w-0 items-center justify-center rounded-sm bg-gradient-to-r from-[#008bc9] to-[#293f53] font-bold text-white shadow-sm transition-colors ${
        isSuspended
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:brightness-110'
      } ${className}`}
    >
      {children || (isSuspended ? '0' : odds)}
    </button>
  );

  const CardFace = ({ label }) => (
    <div className='relative flex h-[64px] w-[46px] shrink-0 flex-col justify-between border border-yellow-400 bg-white px-1 py-0.5 text-left shadow-sm'>
      <span className='text-[25px] leading-none font-bold text-black'>
        {label}
      </span>

      <div className='flex items-center justify-between text-[18px] leading-none font-bold'>
        <span className='text-black'>♠</span>
        <span className='text-red-600'>♦</span>
      </div>

      <div className='flex items-center justify-between text-[18px] leading-none font-bold'>
        <span className='text-black'>♣</span>
        <span className='text-red-600'>♥</span>
      </div>
    </div>
  );

  return (
    <div className='w-full space-y-2 bg-white p-1'>
      {/* LOW CARD / EXACT 6 / HIGH CARD */}
      <div className='grid grid-cols-[1fr_54px_1fr] items-center gap-2 bg-[#f1f1f1] px-1 py-1'>
        {/* LOW CARD */}
        <div className='min-w-0'>
          <div className='mb-0.5 text-center text-sm font-bold text-[#333]'>
            {isSuspended ? '0' : markets?.low?.back || '2'}
          </div>

          <OddsButton
            name='Low Card (1-5)'
            odds={markets?.low?.back || '2'}
            className='h-[46px] w-full text-base'
          >
            Low Card
          </OddsButton>
        </div>

        {/* EXACT 6 CARD */}
        <div className='flex flex-col items-center justify-center'>
          <div className='mb-0.5 text-center text-sm font-bold text-[#333]'>
            {isSuspended ? '0' : markets?.six?.back || '11'}
          </div>

          <button
            type='button'
            disabled={isSuspended}
            onClick={() => placeBet('Exact 6', markets?.six?.back || '11')}
            className={`flex h-[68px] w-[50px] flex-col items-center justify-center border border-yellow-400 bg-white text-black shadow-sm ${
              isSuspended ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
          >
            <span className='text-[30px] leading-none font-bold'>6</span>
            <span className='text-[17px] leading-[15px]'>
              ♠<span className='text-red-600'>♦</span>
            </span>
            <span className='text-[17px] leading-[15px]'>
              ♣<span className='text-red-600'>♥</span>
            </span>
          </button>
        </div>

        {/* HIGH CARD */}
        <div className='min-w-0'>
          <div className='mb-0.5 text-center text-sm font-bold text-[#333]'>
            {isSuspended ? '0' : markets?.high?.back || '2'}
          </div>

          <OddsButton
            name='High Card (7-11)'
            odds={markets?.high?.back || '2'}
            className='h-[46px] w-full text-base'
          >
            High Card
          </OddsButton>
        </div>
      </div>

      {/* EVEN / ODD / RED / BLACK */}
      <div className='grid grid-cols-2 gap-2 bg-[#f1f1f1] p-2 sm:grid-cols-4'>
        {[
          {
            name: 'Even',
            odds: markets?.even?.back || '2.05',
            color: 'text-white',
          },
          {
            name: 'Odd',
            odds: markets?.odd?.back || '1.85',
            color: 'text-white',
          },
          {
            name: 'Red',
            odds: markets?.red?.back || '1.95',
            color: 'text-red-500',
            icon: '♥ ♦',
          },
          {
            name: 'Black',
            odds: markets?.black?.back || '1.95',
            color: 'text-black',
            icon: '♠ ♣',
          },
        ].map((market) => (
          <div key={market.name} className='min-w-0'>
            <div className='mb-0.5 text-center text-sm font-bold text-[#333]'>
              {isSuspended ? '0' : market.odds}
            </div>

            <OddsButton
              name={market.name}
              odds={market.odds}
              className='h-[46px] w-full text-base'
            >
              <span className={market.icon ? market.color : ''}>
                {market.icon || market.name}
              </span>
            </OddsButton>
          </div>
        ))}
      </div>

      {/* 11 CARDS MARKET */}
      <div className='bg-[#f1f1f1] px-2 py-3'>
        <div className='mb-2 text-center text-sm font-bold text-[#333]'>
          {isSuspended ? '0' : '11'}
        </div>

        <div className='flex flex-wrap items-center justify-center gap-1.5 sm:gap-2'>
          {cards11.map((card) => (
            <button
              key={card.value}
              type='button'
              disabled={isSuspended}
              onClick={() => placeBet(`Card ${card.value}`, '11')}
              className={`rounded-sm transition-transform ${
                isSuspended
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:-translate-y-1'
              }`}
            >
              <CardFace label={card.label} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TableBtable2({ isMobile, isSuspended, openBetSlip, markets }) {
  const getMarket = (nat, fbBack = '0', fbLay = '0') => {
    const m = markets?.[nat];
    const open =
      !isSuspended &&
      (!m?.gstatus ||
        ['OPEN', 'ACTIVE'].includes(String(m.gstatus).toUpperCase()));
    return {
      nat: m?.nat || nat,
      back: open ? m?.back || fbBack : '0',
      lay: open ? m?.lay || fbLay : '0',
      open,
    };
  };

  const chars = [
    { key: 'A', name: 'Don', back: '15', lay: '17' },
    { key: 'B', name: 'Amar Akbar Anthony', back: '5.15', lay: '5.5' },
    { key: 'C', name: 'Sahib Bibi Aur Ghulam', back: '5.15', lay: '5.5' },
    { key: 'D', name: 'Dharam Veer', back: '7.65', lay: '8.35' },
    { key: 'E', name: 'Kis Kis Ko Pyaar Karoon', back: '3.85', lay: '4.15' },
    { key: 'F', name: 'Ghulam', back: '5.15', lay: '5.5' },
  ];

  const suits = [
    { name: 'Red', symbols: '♥ ♦', odds: '1.97', color: 'text-red-600' },
    { name: 'Black', symbols: '♠ ♣', odds: '1.97', color: 'text-black' },
  ];

  const cards = [
    { label: 'J', nat: 'Card J' },
    { label: 'Q', nat: 'Card Q' },
    { label: 'K', nat: 'card K' },
    { label: 'A', nat: 'card A' },
  ];

  const GradientButton = ({ name, odds, nation }) => {
    const m = getMarket(nation || name, odds);
    return (
      <button
        type='button'
        disabled={!m.open}
        onClick={() => openBetSlip(m.nat, m.back, 'back', isMobile)}
        className='flex h-[55px] w-full items-center justify-center bg-gradient-to-r from-[#078dcc] to-[#293e50] px-2 text-center text-sm font-bold text-white shadow-md disabled:opacity-60 sm:h-[65px] sm:text-lg'
      >
        {name}
      </button>
    );
  };

  const oddM = getMarket('Odd', '1.32', '1.36');
  const dulhaM = getMarket('Dulha Dulhan K-Q', '1.97');
  const baratiM = getMarket('Barati J-A', '1.97');

  return (
    <div className='w-full bg-[#f5f5f5] p-1'>
      {/* Character Markets */}
      <div className='grid grid-cols-2 gap-x-2 gap-y-5 md:grid-cols-3'>
        {chars.map((char) => {
          const m = getMarket(char.name, char.back, char.lay);
          return (
            <div key={char.key} className='min-w-0'>
              <div className='mb-1 truncate text-center text-sm font-bold text-[#333] sm:text-lg'>
                {char.key}.{char.name}
              </div>

              <div className='grid grid-cols-2 gap-1.5'>
                <button
                  type='button'
                  disabled={!m.open}
                  onClick={() => openBetSlip(m.nat, m.back, 'back', isMobile)}
                  className='flex h-[45px] items-center justify-center bg-[#72b9e8] text-base font-bold text-[#333] disabled:opacity-60 sm:h-[80px] sm:text-xl'
                >
                  {m.back}
                </button>

                <button
                  type='button'
                  disabled={!m.open || !(Number(m.lay) > 0)}
                  onClick={() => openBetSlip(m.nat, m.lay, 'lay', isMobile)}
                  className='flex h-[45px] items-center justify-center bg-[#f5a5b8] text-base font-bold text-[#333] disabled:opacity-60 sm:h-[80px] sm:text-xl'
                >
                  {m.lay}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Odd + Dulha Dulhan + Barati */}
      <div className='mt-6 grid grid-cols-1 gap-2 md:grid-cols-[0.75fr_2.25fr]'>
        {/* Odd */}
        <div className='border border-[#c8c8c8] p-1'>
          <div className='mb-1 text-center text-lg font-bold text-[#333]'>
            Odd
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <button
              type='button'
              disabled={!oddM.open}
              onClick={() => openBetSlip(oddM.nat, oddM.back, 'back', isMobile)}
              className='flex h-[55px] items-center justify-center bg-[#72b9e8] text-lg font-bold text-[#333] disabled:opacity-60'
            >
              {oddM.back}
            </button>

            <button
              type='button'
              disabled={!oddM.open || !(Number(oddM.lay) > 0)}
              onClick={() => openBetSlip(oddM.nat, oddM.lay, 'lay', isMobile)}
              className='flex h-[55px] items-center justify-center bg-[#f5a5b8] text-lg font-bold text-[#333] disabled:opacity-60'
            >
              {oddM.lay}
            </button>
          </div>
        </div>

        {/* Dulha Dulhan / Barati */}
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div className='border border-[#c8c8c8] p-2'>
            <div className='mb-1 text-center text-lg font-bold text-[#333]'>
              {dulhaM.back}
            </div>
            <GradientButton name='Dulha Dulhan K-Q' odds={dulhaM.back} />
          </div>

          <div className='border border-[#c8c8c8] p-2'>
            <div className='mb-1 text-center text-lg font-bold text-[#333]'>
              {baratiM.back}
            </div>
            <GradientButton name='Barati J-A' odds={baratiM.back} />
          </div>
        </div>
      </div>

      {/* Suits + Cards */}
      <div className='mt-5 grid grid-cols-1 gap-2 md:grid-cols-2'>
        {/* Suits */}
        <div className='grid grid-cols-2 gap-2 border border-[#c8c8c8] p-2'>
          {suits.map((suit) => {
            const sm = getMarket(suit.name, suit.odds);
            return (
              <div key={suit.name}>
                <div className='mb-1 text-center text-lg font-bold text-[#333]'>
                  {sm.back}
                </div>

                <button
                  type='button'
                  disabled={!sm.open}
                  onClick={() => openBetSlip(sm.nat, sm.back, 'back', isMobile)}
                  className='flex h-[65px] w-full items-center justify-center bg-gradient-to-r from-[#078dcc] to-[#293e50] text-3xl shadow-md disabled:opacity-60'
                >
                  <span className={suit.color}>{suit.symbols}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Cards */}
        <div className='flex min-h-[140px] flex-col items-center justify-center border border-[#c8c8c8] p-2'>
          <div className='mb-3 text-center text-xl font-bold text-[#333]'>
            {getMarket('Card J', '3.75').back}
          </div>

          <div className='flex flex-wrap justify-center gap-1.5 sm:gap-2'>
            {cards.map((card) => {
              const cm = getMarket(card.nat, '3.75');
              return (
                <button
                  key={card.label}
                  type='button'
                  disabled={!cm.open}
                  onClick={() => openBetSlip(cm.nat, cm.back, 'back', isMobile)}
                  className='flex h-[65px] w-[42px] flex-col items-center justify-between border-2 border-yellow-300 bg-white py-0.5 text-black disabled:opacity-60 sm:h-[82px] sm:w-[55px]'
                >
                  <span className='text-2xl leading-none font-bold sm:text-4xl'>
                    {card.label}
                  </span>
                  <span className='text-base leading-none sm:text-xl'>♠ ♦</span>
                  <span className='text-base leading-none sm:text-xl'>♣ ♥</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableLucky15({ isMobile, isSuspended, openBetSlip, markets }) {
  const cricketRuns = [
    { label: '0 Runs', odds: '3.2' },
    { label: '1 Run', odds: '3.2' },
    { label: '2 Runs', odds: '3.2' },
    { label: '3 Runs', odds: '3.2' },
    { label: '4 Runs', odds: '5.5' },
    { label: '6 Runs', odds: '8.0' },
    { label: 'Wicket', odds: '4.5', danger: true },
  ];

  const teams = [
    {
      name: 'Team A',
      market: markets?.playerA,
    },
    {
      name: 'Team B',
      market: markets?.playerB,
    },
  ];

  const renderOutcome = (item) => (
    <button
      key={item.label}
      type='button'
      disabled={isSuspended}
      onClick={() =>
        !isSuspended && openBetSlip(item.label, item.odds, 'back', isMobile)
      }
      className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-md border border-[#d2d6da] px-1 py-2 transition-colors ${
        item.danger
          ? 'bg-[#fff0f0] hover:bg-[#ffe0e0]'
          : 'bg-white hover:bg-[#edf6fc]'
      } ${isSuspended ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <span
        className={`text-[15px] font-bold ${
          item.danger ? 'text-red-600' : 'text-[#263746]'
        }`}
      >
        {item.odds}
      </span>
      <span
        className={`text-center text-[11px] leading-tight font-semibold ${
          item.danger ? 'text-red-600' : 'text-[#424b54]'
        }`}
      >
        {item.label}
      </span>
    </button>
  );

  return (
    <div className='w-full space-y-2'>
      {/* Match Odds */}
      <div className='overflow-hidden rounded-md border border-[#d1d5d9] bg-white'>
        <div className='grid grid-cols-[minmax(0,1fr)_76px_76px] bg-[#4b5b6b] text-white'>
          <div className='flex h-[34px] items-center px-3 text-[13px] font-bold'>
            15-Ball Cricket Match Odds
          </div>
          <div className='flex h-[34px] items-center justify-center bg-[#72b9e8] text-[12px] font-bold text-[#263746]'>
            Back
          </div>
          <div className='flex h-[34px] items-center justify-center bg-[#f5a5b8] text-[12px] font-bold text-[#263746]'>
            Lay
          </div>
        </div>

        {teams.map((team, index) => (
          <div
            key={team.name}
            className={`grid grid-cols-[minmax(0,1fr)_76px_76px] items-center ${
              index !== 0 ? 'border-t border-[#d9dde1]' : ''
            }`}
          >
            <div className='min-w-0 px-3 py-3'>
              <div className='text-[13px] font-bold text-[#303943]'>
                {team.name}
              </div>
              <div className='text-[10px] text-gray-500'>15 Balls</div>
            </div>

            {['back', 'lay'].map((type) => {
              const odds =
                team.market?.[type] || (type === 'back' ? '1.98' : '2.02');

              return (
                <button
                  key={type}
                  type='button'
                  disabled={isSuspended}
                  onClick={() =>
                    !isSuspended && openBetSlip(team.name, odds, type, isMobile)
                  }
                  className={`flex h-[48px] items-center justify-center border-l border-white text-[16px] font-bold text-[#263746] ${
                    type === 'back'
                      ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
                      : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
                  } ${isSuspended ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  {odds}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Next Ball Outcome */}
      <div className='overflow-hidden rounded-md border border-[#d1d5d9] bg-[#f5f6f7]'>
        <div className='flex min-h-[36px] items-center justify-between bg-[#4b5b6b] px-3'>
          <span className='text-[13px] font-bold text-white'>
            Next Ball Outcome
          </span>
          <span className='text-[10px] font-medium text-gray-200'>
            Runs / Wicket
          </span>
        </div>

        <div className='grid grid-cols-4 gap-1.5 p-2 sm:grid-cols-7'>
          {cricketRuns.map(renderOutcome)}
        </div>
      </div>
    </div>
  );
}

function TableLucky7({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
  ];

  const groups = [
    { label: 'A-2-3', nat: 'Line 1', cards: ['A', '2', '3'] },
    { label: '4-5-6', nat: 'Line 2', cards: ['4', '5', '6'] },
    { label: '8-9-10', nat: 'Line 3', cards: ['8', '9', '10'] },
    { label: 'J-Q-K', nat: 'Line 4', cards: ['J', 'Q', 'K'] },
  ];

  const getOdds = (key, fallback) => markets?.[key]?.back || fallback;

  const Card = ({ value, compact = false }) => (
    <div
      className={`flex aspect-[0.72] flex-col justify-between border-2 border-yellow-400 bg-white ${
        compact
          ? 'w-[clamp(25px,5vw,48px)] p-[2px]'
          : 'w-[clamp(29px,4.5vw,43px)] p-[2px]'
      }`}
    >
      <span className='text-left text-[clamp(17px,2.5vw,32px)] leading-none font-bold text-black'>
        {value}
      </span>
      <div className='flex justify-between text-[clamp(11px,1.5vw,19px)] leading-none font-bold'>
        <span className='text-black'>♠</span>
        <span className='text-red-600'>♦</span>
      </div>
      <div className='flex justify-between text-[clamp(11px,1.5vw,19px)] leading-none font-bold'>
        <span className='text-black'>♣</span>
        <span className='text-red-600'>♥</span>
      </div>
    </div>
  );

  const BetButton = ({ label, odds, nation, className = '' }) => (
    <button
      type='button'
      disabled={isSuspended}
      onClick={() => openBetSlip(nation, odds, 'back', isMobile)}
      className={`flex min-h-[40px] flex-col items-center justify-center bg-gradient-to-r from-[#078bc5] to-[#29445a] px-1 py-1 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <span className='text-[clamp(12px,1.5vw,20px)] font-bold'>{label}</span>
    </button>
  );

  const MarketBox = ({ label, odds, nation, color }) => (
    <div className='flex min-w-0 flex-col items-center gap-1 bg-[#f1f1f1] p-1 sm:p-2'>
      <span className='text-[clamp(12px,1.5vw,19px)] font-bold text-[#333]'>
        {isSuspended ? '0' : odds}
      </span>
      <BetButton label={label} odds={odds} nation={nation} className='w-full' />
    </div>
  );

  return (
    <div className='w-full overflow-hidden bg-white text-[#333]'>
      {/* Low Card - Current Card - High Card */}
      <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-[#f3f3f3] px-1 py-2'>
        <MarketBox
          label='Low Card'
          odds={getOdds('low', '2')}
          nation='Low Card'
        />

        <div className='flex flex-col items-center'>
          <Card value='7' />
        </div>

        <MarketBox
          label='High Card'
          odds={getOdds('high', '2')}
          nation='High Card'
        />
      </div>

      {/* Even / Odd / Red / Black */}
      <div className='mt-2 grid grid-cols-2 gap-1 bg-[#f3f3f3] p-1 sm:gap-2 sm:p-2'>
        <div className='grid grid-cols-2 gap-1'>
          <MarketBox label='Even' odds={getOdds('even', '2.1')} nation='Even' />
          <MarketBox label='Odd' odds={getOdds('odd', '1.79')} nation='Odd' />
        </div>

        <div className='grid grid-cols-2 gap-1'>
          <MarketBox
            label={<span className='text-red-500'>♥ ♦</span>}
            odds={getOdds('red', '1.95')}
            nation='Red'
          />
          <MarketBox
            label={<span className='text-black'>♠ ♣</span>}
            odds={getOdds('black', '1.95')}
            nation='Black'
          />
        </div>
      </div>

      {/* Card Groups */}
      <div className='mt-2 grid grid-cols-4 gap-1 sm:gap-2'>
        {groups.map((group) => {
          const odds = markets?.[group.nat]?.back || '4';

          return (
            <div
              key={group.label}
              className='flex min-w-0 flex-col items-center justify-center gap-1 bg-[#f1f1f1] px-1 py-2 sm:py-3'
            >
              <button
                type='button'
                disabled={isSuspended}
                onClick={() => openBetSlip(group.nat, odds, 'back', isMobile)}
                className='flex flex-col items-center gap-1 disabled:opacity-50'
              >
                <span className='text-[clamp(12px,1.5vw,18px)] font-bold'>
                  {isSuspended ? '0' : odds}
                </span>

                <div className='flex items-center justify-center gap-[2px]'>
                  {group.cards.map((card) => (
                    <Card key={card} value={card} compact />
                  ))}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* All 13 Cards */}
      <div className='mt-2 bg-[#f3f3f3] px-1 py-2 sm:py-3'>
        <div className='mb-2 text-center text-[clamp(13px,1.5vw,19px)] font-bold'>
          {isSuspended ? '0' : markets?.['Card 1']?.back || '12'}
        </div>

        <div className='grid grid-cols-13 gap-[2px] sm:gap-2'>
          {cards.map((card) => {
            const natName = `Card ${card === 'A' ? '1' : card}`;
            const odds = markets?.[natName]?.back || '12';

            return (
              <button
                key={card}
                type='button'
                disabled={isSuspended}
                onClick={() => openBetSlip(natName, odds, 'back', isMobile)}
                className='flex min-w-0 justify-center disabled:cursor-not-allowed disabled:opacity-50'
              >
                <Card value={card} compact />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TableLucky7eu({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
  ];

  const groups = [
    { label: 'A-2-3', nat: 'Line 1', cards: ['A', '2', '3'] },
    { label: '4-5-6', nat: 'Line 2', cards: ['4', '5', '6'] },
    { label: '8-9-10', nat: 'Line 3', cards: ['8', '9', '10'] },
    { label: 'J-Q-K', nat: 'Line 4', cards: ['J', 'Q', 'K'] },
  ];

  const getOdds = (key, fallback) => markets?.[key]?.back || fallback;

  const placeBet = (nation, odds) => {
    if (!isSuspended) {
      openBetSlip(nation, odds, 'back', isMobile);
    }
  };

  const Card = ({ value, small = false }) => (
    <div
      className={`flex shrink-0 flex-col justify-between border border-yellow-400 bg-white ${
        small
          ? 'h-[45px] w-[32px] p-[2px] sm:h-[58px] sm:w-[43px] sm:p-[3px]'
          : 'h-[55px] w-[37px] p-[2px] sm:h-[68px] sm:w-[46px] sm:p-[3px]'
      }`}
    >
      <span className='text-[20px] leading-none font-bold text-black sm:text-[27px]'>
        {value}
      </span>

      <div className='flex justify-between text-[13px] leading-[12px] font-bold sm:text-[17px] sm:leading-[15px]'>
        <span className='text-black'>♠</span>
        <span className='text-red-600'>♦</span>
      </div>

      <div className='flex justify-between text-[13px] leading-[12px] font-bold sm:text-[17px] sm:leading-[15px]'>
        <span className='text-black'>♣</span>
        <span className='text-red-600'>♥</span>
      </div>
    </div>
  );

  const Market = ({ label, odds, nation, children }) => (
    <div className='flex min-w-0 flex-col items-center justify-center gap-1 bg-[#f1f1f1] p-1 sm:p-2'>
      <span className='text-[12px] leading-tight font-bold text-[#333] sm:text-[16px]'>
        {isSuspended ? '0' : odds}
      </span>

      <button
        type='button'
        disabled={isSuspended}
        onClick={() => placeBet(nation, odds)}
        className='flex min-h-[32px] w-full items-center justify-center bg-gradient-to-r from-[#078bc5] to-[#29445a] px-1 py-1 text-[12px] font-bold text-white shadow-sm disabled:opacity-50 sm:min-h-[43px] sm:text-[16px]'
      >
        {children || label}
      </button>
    </div>
  );

  return (
    <div className='w-full overflow-hidden bg-[#f5f5f5]'>
      {/* LOW CARD / 7 / HIGH CARD */}
      <div className='grid grid-cols-[1fr_42px_1fr] items-center gap-1 px-1 py-2 sm:grid-cols-[1fr_55px_1fr] sm:gap-2'>
        <Market label='Low Card' odds={getOdds('low', '2')} nation='Low Card' />

        <button
          type='button'
          disabled={isSuspended}
          onClick={() => placeBet('Exact 7', getOdds('seven', '12'))}
          className='flex justify-center disabled:opacity-50'
        >
          <Card value='7' />
        </button>

        <Market
          label='High Card'
          odds={getOdds('high', '2')}
          nation='High Card'
        />
      </div>

      {/* EVEN / ODD / RED / BLACK */}
      <div className='mt-1 grid grid-cols-2 gap-1'>
        <div className='grid grid-cols-2 gap-1'>
          <Market label='Even' odds={getOdds('even', '2.1')} nation='Even' />

          <Market label='Odd' odds={getOdds('odd', '1.79')} nation='Odd' />
        </div>

        <div className='grid grid-cols-2 gap-1'>
          <Market odds={getOdds('red', '1.95')} nation='Red'>
            <span className='text-red-500'>♥ ♦</span>
          </Market>

          <Market odds={getOdds('black', '1.95')} nation='Black'>
            <span className='text-black'>♠ ♣</span>
          </Market>
        </div>
      </div>

      {/* FOUR CARD GROUPS */}
      <div className='mt-1 grid grid-cols-4 gap-1'>
        {groups.map((group) => {
          const odds = '4';

          return (
            <button
              key={group.label}
              type='button'
              disabled={isSuspended}
              onClick={() => placeBet(`Group ${group.label}`, odds)}
              className='flex min-w-0 flex-col items-center justify-center gap-1 bg-[#f1f1f1] py-2 disabled:opacity-50 sm:py-3'
            >
              <span className='text-[12px] font-bold sm:text-[16px]'>
                {isSuspended ? '0' : odds}
              </span>

              <div className='flex items-center justify-center gap-[2px]'>
                {group.cards.map((card) => (
                  <Card key={card} value={card} small />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* ALL 13 CARDS */}
      <div className='mt-1 bg-[#f1f1f1] px-1 py-2 sm:py-3'>
        <div className='mb-1 text-center text-[12px] font-bold sm:text-[16px]'>
          {isSuspended ? '0' : getOdds('cards', '12')}
        </div>

        <div
          className='grid w-full gap-[2px] sm:gap-2'
          style={{
            gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
          }}
        >
          {cards.map((card) => {
            const odds = '12';

            return (
              <button
                key={card}
                type='button'
                disabled={isSuspended}
                onClick={() => placeBet(`Card ${card}`, odds)}
                className='flex min-w-0 justify-center disabled:opacity-50'
              >
                <Card value={card} small />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TableLucky7eu2({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  return (
    <div className='casino-table lucky7a'>
      <div className='casino-table-box'>
        <div className='casino-table-full-box'>
          <div className='lucky7low'>
            <div className='casino-odds fw-bold text-center'>
              {isSuspended ? '0' : markets?.low?.back || '2'}
            </div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () =>
                      openBetSlip(
                        'Low Card',
                        markets?.low?.back || '2',
                        'back',
                        isMobile
                      )
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className='casino-odds'>Low Card</span>
            </div>
            <NationBook id='low' />
          </div>

          <div className='lucky7'>
            <div className='casino-odds fw-bold text-center'>
              {isSuspended ? '0' : markets?.seven?.back || '12'}
            </div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () =>
                      openBetSlip(
                        'Exact 7',
                        markets?.seven?.back || '12',
                        'back',
                        isMobile
                      )
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className='casino-odds'>Exact 7</span>
            </div>
            <NationBook id='seven' />
          </div>

          <div className='lucky7high'>
            <div className='casino-odds fw-bold text-center'>
              {isSuspended ? '0' : markets?.high?.back || '2'}
            </div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () =>
                      openBetSlip(
                        'High Card',
                        markets?.high?.back || '2',
                        'back',
                        isMobile
                      )
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className='casino-odds'>High Card</span>
            </div>
            <NationBook id='high' />
          </div>
        </div>

        <div className='casino-table-box mt-3'>
          <div className='casino-table-left-box'>
            <div className='lucky7odds'>
              <div className='casino-odds fw-bold text-center'>
                {isSuspended ? '0' : markets?.even?.back || '2.10'}
              </div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={
                  isSuspended
                    ? undefined
                    : () =>
                        openBetSlip(
                          'Even',
                          markets?.even?.back || '2.10',
                          'back',
                          isMobile
                        )
                }
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className='casino-odds'>Even</span>
              </div>
            </div>
            <div className='lucky7odds'>
              <div className='casino-odds fw-bold text-center'>
                {isSuspended ? '0' : markets?.odd?.back || '1.79'}
              </div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={
                  isSuspended
                    ? undefined
                    : () =>
                        openBetSlip(
                          'Odd',
                          markets?.odd?.back || '1.79',
                          'back',
                          isMobile
                        )
                }
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className='casino-odds'>Odd</span>
              </div>
            </div>
          </div>

          <div className='casino-table-right-box'>
            <div className='lucky7odds'>
              <div className='casino-odds fw-bold text-center'>
                {isSuspended ? '0' : markets?.red?.back || '1.95'}
              </div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={
                  isSuspended
                    ? undefined
                    : () =>
                        openBetSlip(
                          'Red',
                          markets?.red?.back || '1.95',
                          'back',
                          isMobile
                        )
                }
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className='card-icon ms-1'>
                  <span className='card-red'>Red</span>
                </span>
              </div>
            </div>
            <div className='lucky7odds'>
              <div className='casino-odds fw-bold text-center'>
                {isSuspended ? '0' : markets?.black?.back || '1.95'}
              </div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={
                  isSuspended
                    ? undefined
                    : () =>
                        openBetSlip(
                          'Black',
                          markets?.black?.back || '1.95',
                          'back',
                          isMobile
                        )
                }
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className='card-icon ms-1'>
                  <span className='card-black'>Black</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='casino-table-box d-flex justify-content-between mt-3 gap-2'>
          {[
            { label: 'A-2-3', odds: '4.00' },
            { label: '4-5-6', odds: '4.00' },
            { label: '8-9-10', odds: '4.00' },
            { label: 'J-Q-K', odds: '4.00' },
          ].map((grp) => (
            <div key={grp.label} className='lucky7cards flex-fill text-center'>
              <div className='casino-odds fw-bold w-100 text-center'>
                {isSuspended ? '0' : grp.odds}
              </div>
              <div
                className={`card-odd-box-container rounded border p-1 ${isSuspended ? 'suspended-box' : ''}`}
                onClick={
                  isSuspended
                    ? undefined
                    : () =>
                        openBetSlip(
                          `Group ${grp.label}`,
                          grp.odds,
                          'back',
                          isMobile
                        )
                }
                style={{
                  cursor: isSuspended ? 'not-allowed' : 'pointer',
                  background: '#273646',
                }}
              >
                <span className='fw-bold text-white'>{grp.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className='casino-table-full-box lucky7acards mt-3'>
          <div className='casino-odds fw-bold mb-1 w-100 text-center'>
            Cards 1 to 13 (Payout 12.0)
          </div>
          <div className='d-flex justify-content-center w-100 flex-wrap gap-2'>
            {cards13.map((c) => (
              <div
                key={c}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={
                  isSuspended
                    ? undefined
                    : () => openBetSlip(`Card ${c}`, '12', 'back', isMobile)
                }
                style={{
                  cursor: isSuspended ? 'not-allowed' : 'pointer',
                  minWidth: '40px',
                  textAlign: 'center',
                }}
              >
                <div className='casino-odds'>{isSuspended ? '0' : '12'}</div>
                <div className='fw-bold'>{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableAaa({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  return (
    <div className='casino-table aaa'>
      <div className='casino-table-box'>
        <div className='d-flex justify-content-between mb-3 w-100 gap-2'>
          <div className='casino-odd-box-container w-100'>
            <div className='casino-nation-name'>A. Amar</div>
            <OddsBox
              nation='A. Amar'
              odds={markets?.amar?.back || '2.95'}
              type='back'
            />
            <OddsBox
              nation='A. Amar'
              odds={markets?.amar?.lay || '3.05'}
              type='lay'
            />
          </div>
          <div className='casino-odd-box-container w-100'>
            <div className='casino-nation-name'>B. Akbar</div>
            <OddsBox
              nation='B. Akbar'
              odds={markets?.akbar?.back || '2.95'}
              type='back'
            />
            <OddsBox
              nation='B. Akbar'
              odds={markets?.akbar?.lay || '3.05'}
              type='lay'
            />
          </div>
          <div className='casino-odd-box-container w-100'>
            <div className='casino-nation-name'>C. Anthony</div>
            <OddsBox
              nation='C. Anthony'
              odds={markets?.anthony?.back || '2.95'}
              type='back'
            />
            <OddsBox
              nation='C. Anthony'
              odds={markets?.anthony?.lay || '3.05'}
              type='lay'
            />
          </div>
        </div>

        <div className='casino-table-box d-flex justify-content-between mt-3 w-100 gap-2'>
          <div
            className='aaa-odd-box w-100 rounded border p-2 text-center'
            onClick={
              isSuspended
                ? undefined
                : () => openBetSlip('Even', '2.10', 'back', isMobile)
            }
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className='fw-bold'>Even</div>
            <div className='casino-odds'>{isSuspended ? '0' : '2.10'}</div>
          </div>
          <div
            className='aaa-odd-box w-100 rounded border p-2 text-center'
            onClick={
              isSuspended
                ? undefined
                : () => openBetSlip('Odd', '1.79', 'back', isMobile)
            }
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className='fw-bold'>Odd</div>
            <div className='casino-odds'>{isSuspended ? '0' : '1.79'}</div>
          </div>
          <div
            className='aaa-odd-box w-100 rounded border p-2 text-center'
            onClick={
              isSuspended
                ? undefined
                : () => openBetSlip('Red', '1.95', 'back', isMobile)
            }
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className='fw-bold text-danger'>Red</div>
            <div className='casino-odds'>{isSuspended ? '0' : '1.95'}</div>
          </div>
          <div
            className='aaa-odd-box w-100 rounded border p-2 text-center'
            onClick={
              isSuspended
                ? undefined
                : () => openBetSlip('Black', '1.95', 'back', isMobile)
            }
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className='fw-bold text-dark'>Black</div>
            <div className='casino-odds'>{isSuspended ? '0' : '1.95'}</div>
          </div>
        </div>

        <div className='casino-table-full-box aaacards mt-3'>
          <div className='casino-odds fw-bold mb-1 w-100 text-center'>
            13 Cards Market (Payout 12.0)
          </div>
          <div className='d-flex justify-content-center w-100 flex-wrap gap-2'>
            {cards13.map((c) => (
              <div
                key={c}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={
                  isSuspended
                    ? undefined
                    : () => openBetSlip(`Card ${c}`, '12', 'back', isMobile)
                }
                style={{
                  cursor: isSuspended ? 'not-allowed' : 'pointer',
                  minWidth: '40px',
                  textAlign: 'center',
                }}
              >
                <div className='casino-odds'>{isSuspended ? '0' : '12'}</div>
                <div className='fw-bold'>{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableAaa2({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  return (
    <div className='casino-table aaa'>
      <div className='casino-table-box'>
        <div className='d-flex justify-content-between mb-3 w-100 gap-2'>
          <div className='casino-odd-box-container w-100'>
            <div className='casino-nation-name'>A. Amar</div>
            <OddsBox
              nation='A. Amar'
              odds={markets?.amar?.back || '2.95'}
              type='back'
            />
            <OddsBox
              nation='A. Amar'
              odds={markets?.amar?.lay || '3.05'}
              type='lay'
            />
          </div>
          <div className='casino-odd-box-container w-100'>
            <div className='casino-nation-name'>B. Akbar</div>
            <OddsBox
              nation='B. Akbar'
              odds={markets?.akbar?.back || '2.95'}
              type='back'
            />
            <OddsBox
              nation='B. Akbar'
              odds={markets?.akbar?.lay || '3.05'}
              type='lay'
            />
          </div>
          <div className='casino-odd-box-container w-100'>
            <div className='casino-nation-name'>C. Anthony</div>
            <OddsBox
              nation='C. Anthony'
              odds={markets?.anthony?.back || '2.95'}
              type='back'
            />
            <OddsBox
              nation='C. Anthony'
              odds={markets?.anthony?.lay || '3.05'}
              type='lay'
            />
          </div>
        </div>

        <div className='casino-table-box d-flex justify-content-between mt-3 w-100 gap-2'>
          <div
            className='aaa-odd-box w-100 rounded border p-2 text-center'
            onClick={
              isSuspended
                ? undefined
                : () => openBetSlip('Even', '2.10', 'back', isMobile)
            }
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className='fw-bold'>Even</div>
            <div className='casino-odds'>{isSuspended ? '0' : '2.10'}</div>
          </div>
          <div
            className='aaa-odd-box w-100 rounded border p-2 text-center'
            onClick={
              isSuspended
                ? undefined
                : () => openBetSlip('Odd', '1.79', 'back', isMobile)
            }
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className='fw-bold'>Odd</div>
            <div className='casino-odds'>{isSuspended ? '0' : '1.79'}</div>
          </div>
          <div
            className='aaa-odd-box w-100 rounded border p-2 text-center'
            onClick={
              isSuspended
                ? undefined
                : () => openBetSlip('Red', '1.95', 'back', isMobile)
            }
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className='fw-bold text-danger'>Red</div>
            <div className='casino-odds'>{isSuspended ? '0' : '1.95'}</div>
          </div>
          <div
            className='aaa-odd-box w-100 rounded border p-2 text-center'
            onClick={
              isSuspended
                ? undefined
                : () => openBetSlip('Black', '1.95', 'back', isMobile)
            }
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className='fw-bold text-dark'>Black</div>
            <div className='casino-odds'>{isSuspended ? '0' : '1.95'}</div>
          </div>
        </div>

        <div className='casino-table-full-box aaacards mt-3'>
          <div className='casino-odds fw-bold mb-1 w-100 text-center'>
            13 Cards Market (Payout 12.0)
          </div>
          <div className='d-flex justify-content-center w-100 flex-wrap gap-2'>
            {cards13.map((c) => (
              <div
                key={c}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={
                  isSuspended
                    ? undefined
                    : () => openBetSlip(`Card ${c}`, '12', 'back', isMobile)
                }
                style={{
                  cursor: isSuspended ? 'not-allowed' : 'pointer',
                  minWidth: '40px',
                  textAlign: 'center',
                }}
              >
                <div className='casino-odds'>{isSuspended ? '0' : '12'}</div>
                <div className='fw-bold'>{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableBtable({ isMobile, isSuspended, openBetSlip, markets }) {
  const getM = (nat, fbBack = '0', fbLay = '0') => {
    const m = markets?.[nat];
    const open =
      !isSuspended &&
      (!m?.gstatus ||
        ['OPEN', 'ACTIVE'].includes(String(m.gstatus).toUpperCase()));
    return {
      nat: m?.nat || nat,
      back: open ? m?.back || fbBack : '0',
      lay: open ? m?.lay || fbLay : '0',
      open,
    };
  };

  const chars = [
    { key: 'A', name: 'Don', back: '15', lay: '17' },
    { key: 'B', name: 'Amar Akbar Anthony', back: '5.15', lay: '5.5' },
    { key: 'C', name: 'Sahib Bibi Aur Ghulam', back: '5.15', lay: '5.5' },
    { key: 'D', name: 'Dharam Veer', back: '7.65', lay: '8.35' },
    { key: 'E', name: 'Kis Kis Ko Pyaar Karoon', back: '3.85', lay: '4.15' },
    { key: 'F', name: 'Ghulam', back: '5.15', lay: '5.5' },
  ];

  const cardButton = (nation, odds, type = 'back', open = true, extra = '') => (
    <button
      type='button'
      disabled={!open || !(Number(odds) > 0)}
      onClick={() =>
        open && Number(odds) > 0 && openBetSlip(nation, odds, type, isMobile)
      }
      className={`flex min-h-[52px] min-w-0 flex-1 items-center justify-center text-xl font-bold text-[#30343a] md:text-2xl ${
        type === 'back' ? 'bg-[#72b9e8]' : 'bg-[#f5a5b8]'
      } ${!open || !(Number(odds) > 0) ? 'opacity-60' : 'hover:brightness-95'} ${extra}`}
    >
      {odds}
    </button>
  );

  const gradientButton = (nation, odds, label, open = true, extra = '') => (
    <button
      type='button'
      disabled={!open}
      onClick={() => open && openBetSlip(nation, odds, 'back', isMobile)}
      className={`min-h-[52px] w-full bg-gradient-to-r from-[#078bc5] to-[#293d50] text-lg font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60 md:text-xl ${extra}`}
    >
      {label}
    </button>
  );

  const oddM = getM('Odd', '1.32', '1.36');
  const dulhaM = getM('Dulha Dulhan K-Q', '1.97');
  const baratiM = getM('Barati J-A', '1.97');
  const redM = getM('Red', '1.97');
  const blackM = getM('Black', '1.97');
  const jqka = [
    { label: 'J', nat: 'Card J' },
    { label: 'Q', nat: 'Card Q' },
    { label: 'K', nat: 'card K' },
    { label: 'A', nat: 'card A' },
  ];

  return (
    <div className='w-full bg-[#f5f5f5] p-1 text-[#30343a] md:p-1.5'>
      {/* Top Character Markets */}
      <div className='grid grid-cols-2 gap-x-2 gap-y-5 md:grid-cols-3 md:gap-y-7'>
        {chars.map((char) => {
          const m = getM(char.name, char.back, char.lay);
          return (
            <div key={char.key} className='min-w-0'>
              <div className='mb-1 truncate text-center text-base font-bold md:text-xl'>
                {char.key}.{char.name}
              </div>

              <div className='flex gap-1.5'>
                {cardButton(m.nat, m.back, 'back', m.open)}
                {cardButton(m.nat, m.lay, 'lay', m.open)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Section */}
      <div className='mt-7 grid grid-cols-1 gap-2 md:grid-cols-[0.75fr_2.25fr]'>
        {/* Odd */}
        <div className='border border-[#c9c9c9] p-2'>
          <div className='mb-1 text-center text-lg font-bold md:text-xl'>
            Odd
          </div>

          <div className='flex gap-1.5'>
            {cardButton(oddM.nat, oddM.back, 'back', oddM.open)}
            {cardButton(oddM.nat, oddM.lay, 'lay', oddM.open)}
          </div>
        </div>

        {/* Dulha / Barati */}
        <div className='grid grid-cols-2 gap-2 border border-[#c9c9c9] p-2'>
          <div className='text-center'>
            <div className='mb-1 text-lg font-bold md:text-2xl'>
              {dulhaM.back}
            </div>
            {gradientButton(
              dulhaM.nat,
              dulhaM.back,
              'Dulha Dulhan K-Q',
              dulhaM.open
            )}
          </div>

          <div className='text-center'>
            <div className='mb-1 text-lg font-bold md:text-2xl'>
              {baratiM.back}
            </div>
            {gradientButton(
              baratiM.nat,
              baratiM.back,
              'Barati J-A',
              baratiM.open
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className='mt-3 grid grid-cols-1 gap-2 md:grid-cols-2'>
        {/* Suits */}
        <div className='border border-[#c9c9c9] p-2'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='text-center'>
              <div className='mb-1 text-lg font-bold md:text-2xl'>
                {redM.back}
              </div>
              {gradientButton(
                redM.nat,
                redM.back,
                <span className='text-3xl'>
                  <span className='text-red-500'>♥ ♦</span>
                </span>,
                redM.open
              )}
            </div>

            <div className='text-center'>
              <div className='mb-1 text-lg font-bold md:text-2xl'>
                {blackM.back}
              </div>
              {gradientButton(
                blackM.nat,
                blackM.back,
                <span className='text-3xl text-black'>♠ ♣</span>,
                blackM.open
              )}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className='border border-[#c9c9c9] p-2'>
          <div className='mb-2 text-center text-lg font-bold md:text-2xl'>
            {getM('Card J', '3.75').back}
          </div>

          <div className='flex w-full items-center justify-center gap-1.5 py-1 md:gap-2'>
            {jqka.map((card) => {
              const cm = getM(card.nat, '3.75');
              return (
                <button
                  key={card.label}
                  type='button'
                  disabled={!cm.open}
                  onClick={() =>
                    cm.open && openBetSlip(cm.nat, cm.back, 'back', isMobile)
                  }
                  className='flex h-[58px] w-10 flex-col items-center justify-between rounded-[2px] border-2 border-yellow-400 bg-white py-0.5 shadow-sm disabled:opacity-60 md:h-[76px] md:w-[54px]'
                >
                  <span className='text-2xl leading-none font-bold text-black md:text-4xl'>
                    {card.label}
                  </span>

                  <div className='flex w-full justify-between px-0.5 text-base leading-none md:text-xl'>
                    <span className='text-black'>♠</span>
                    <span className='text-red-500'>♦</span>
                  </div>

                  <div className='flex w-full justify-between px-0.5 text-base leading-none md:text-xl'>
                    <span className='text-black'>♣</span>
                    <span className='text-red-500'>♥</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableLottcard({ isMobile, isSuspended, openBetSlip }) {
  const [activeTab, setActiveTab] = React.useState('single');
  const [selectedNumbers, setSelectedNumbers] = React.useState([]);
  const [selectedAmount, setSelectedAmount] = React.useState(null);

  const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  const randomAmounts = {
    single: [],
    double: [5, 10, 15, 20, 25, 50, 75],
    triple: [5, 10, 15, 20, 25, 50, 100],
  };

  const toggleNumber = (card) => {
    if (isSuspended) return;

    setSelectedNumbers((prev) => {
      const exists = prev.includes(card);

      if (exists) {
        return prev.filter((item) => item !== card);
      }

      return [...prev, card];
    });

    openBetSlip(`Card ${card}`, '9.00', 'back', isMobile);
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSelectedNumbers([]);
    setSelectedAmount(null);
  };

  const handleRandomBet = (amount) => {
    if (isSuspended) return;
    setSelectedAmount(amount);
  };

  const tabs = [
    { id: 'single', label: 'Single' },
    { id: 'double', label: 'Double' },
    { id: 'triple', label: 'Tripple' },
  ];

  const renderCard = (card) => {
    const selected = selectedNumbers.includes(card);

    return (
      <button
        key={card}
        type='button'
        disabled={isSuspended}
        onClick={() => toggleNumber(card)}
        className={`flex h-[76px] w-[54px] shrink-0 flex-col justify-between border-2 border-[#fff000] bg-[#f5f5f5] p-1 transition-all sm:h-[150px] sm:w-[108px] sm:p-2 ${
          selected ? 'ring-2 ring-blue-500' : ''
        } ${isSuspended ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <span className='w-full text-center text-[24px] leading-none font-bold text-black sm:text-[58px]'>
          {card}
        </span>

        <div className='grid w-full grid-cols-2'>
          <div className='flex flex-col items-center text-black'>
            <span className='text-[17px] leading-none sm:text-[35px]'>♠</span>
            <span className='text-[17px] leading-none sm:text-[35px]'>♣</span>
          </div>

          <div className='flex flex-col items-center text-red-600'>
            <span className='text-[17px] leading-none sm:text-[35px]'>♦</span>
            <span className='text-[17px] leading-none sm:text-[35px]'>♥</span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className='w-full overflow-hidden bg-[#c6c8ca] p-2 sm:p-3'>
      {/* Tabs */}
      <div className='mb-3 flex w-fit max-w-full items-center'>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type='button'
            onClick={() => changeTab(tab.id)}
            className={`border-r border-[#263746] px-3 py-2 text-[14px] font-medium transition-colors sm:px-7 sm:py-3 sm:text-[27px] ${
              activeTab === tab.id
                ? 'bg-[#293d50] text-white'
                : 'bg-[#d0d0d0] text-black hover:bg-[#b8b8b8]'
            } ${index === 0 ? 'rounded-tl' : ''}`}
          >
            {tab.label} ({selectedNumbers.length})
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className='grid grid-cols-5 justify-items-center gap-x-2 gap-y-3 sm:grid-cols-10 sm:gap-x-0 sm:gap-y-2'>
        {cards.map((card) => renderCard(card))}
      </div>

      {/* Random Bets */}
      {activeTab !== 'single' && (
        <div className='mx-auto mt-4 w-full rounded-[22px] bg-[#5c6877] px-3 py-3 sm:mt-5 sm:w-[75%] sm:px-6 sm:py-3'>
          <h3 className='mb-2 text-center text-[17px] font-semibold text-white sm:text-[27px]'>
            Random Bets
          </h3>

          <div className='flex flex-wrap justify-center gap-2 sm:gap-3'>
            {randomAmounts[activeTab].map((amount) => (
              <button
                key={amount}
                type='button'
                disabled={isSuspended}
                onClick={() => handleRandomBet(amount)}
                className={`flex h-[42px] min-w-[52px] items-center justify-center rounded-xl border border-[#008bd0] text-[17px] font-semibold text-white transition-all sm:h-[78px] sm:min-w-[98px] sm:text-[28px] ${
                  selectedAmount === amount
                    ? 'bg-[#174d73] ring-2 ring-blue-300'
                    : 'bg-[#3284b2] hover:bg-[#2475a3]'
                } ${isSuspended ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const TABLES = {
  mogambo: TableMogambo,
  lucky5: TableLucky5,
  btable2: TableBtable2,
  lucky15: TableLucky15,
  lucky7: TableLucky7,
  plucky7: TableLucky7,
  lucky7eu: TableLucky7eu,
  lucky7eu2: TableLucky7eu2,
  aaa: TableAaa,
  aaa2: TableAaa2,
  btable: TableBtable,
  lottcard: TableLottcard,
};

export default TABLES;
