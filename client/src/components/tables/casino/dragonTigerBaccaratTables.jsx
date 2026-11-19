import React from 'react';
import { useCasino, normalizeSelection } from '../../../context/CasinoContext';
import { NationBook } from './shared';

function TableBaccarat({ isMobile, isSuspended, openBetSlip, markets }) {
  const topMarkets = [
    { name: 'Perfect Pair', odds: markets?.perfectPair?.back || '25:1' },
    { name: 'Big', odds: markets?.big?.back || '0.54:1' },
    { name: 'Small', odds: markets?.small?.back || '1.5:1' },
    { name: 'Either Pair', odds: markets?.eitherPair?.back || '5:1' },
  ];

  const mainMarkets = [
    {
      name: 'Player Pair',
      odds: markets?.playerPair?.back || '11:1',
      background: '#0868b5',
      shape: 'rounded-l-full',
    },
    {
      name: 'Player',
      odds: markets?.player?.back || '1:1',
      background: '#0868b5',
      cards: true,
    },
    {
      name: 'Tie',
      odds: markets?.tie?.back || '8:1',
      background: '#229632',
    },
    {
      name: 'Banker',
      odds: markets?.banker?.back || '1:1',
      background: '#b21e32',
      cards: true,
    },
    {
      name: 'Banker Pair',
      odds: markets?.bankerPair?.back || '11:1',
      background: '#b21e32',
      shape: 'rounded-r-full',
    },
  ];

  const handleBet = (name, odds) => {
    if (!isSuspended) {
      openBetSlip(name, odds, 'back', isMobile);
    }
  };

  return (
    <div className='w-full overflow-hidden border border-[#d1d1d1] bg-[#f1f1f1] p-1'>
      {/* TOP SECTION */}
      <div className='grid grid-cols-[190px_minmax(0,1fr)] gap-2'>
        {/* Statistics */}
        <div className='flex min-w-0 flex-col items-center justify-start'>
          <div className='text-xl font-medium text-[#333]'>Statistics</div>

          <div className='flex w-full items-center justify-center gap-3'>
            {/* Pie Chart */}
            <div
              className='relative h-[130px] w-[130px] shrink-0 rounded-full'
              style={{
                background:
                  'conic-gradient(#0871bd 0% 49%, #b51e35 49% 89%, #229632 89% 100%)',
              }}
            >
              <span className='absolute top-[48%] left-[65%] text-xs font-bold text-white'>
                49%
              </span>
              <span className='absolute top-[65%] left-[15%] text-xs font-bold text-white'>
                40%
              </span>
            </div>

            {/* Legend */}
            <div className='flex flex-col gap-1 text-xs text-[#333]'>
              <div className='flex items-center gap-1'>
                <span className='h-3 w-3 rounded-full bg-[#0871bd]' />
                Player
              </div>
              <div className='flex items-center gap-1'>
                <span className='h-3 w-3 rounded-full bg-[#b51e35]' />
                Banker
              </div>
              <div className='flex items-center gap-1'>
                <span className='h-3 w-3 rounded-full bg-[#229632]' />
                Tie
              </div>
            </div>
          </div>
        </div>

        {/* Top Bonus Markets */}
        <div className='grid grid-cols-4 gap-2'>
          {topMarkets.map((market) => (
            <button
              key={market.name}
              type='button'
              disabled={isSuspended}
              onClick={() => handleBet(market.name, market.odds)}
              className='flex h-[85px] min-w-0 flex-col items-center justify-center gap-2 bg-[#2c4052] px-1 text-center text-white hover:bg-[#354f65] disabled:opacity-60'
            >
              <span className='text-xs font-semibold sm:text-base'>
                {market.name}
              </span>
              <span className='text-sm font-bold sm:text-base'>
                {market.odds}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className='mt-3 grid w-full grid-cols-[0.85fr_1.3fr_1.3fr_1.3fr_0.85fr] gap-2'>
        {/* Player Pair */}
        <div
          onClick={() => openBetSlip('Player Pair', '11.0', 'back', isMobile)}
          className='flex h-[90px] cursor-pointer flex-col items-center justify-center bg-[#096bb5] px-1 text-center text-white'
          style={{ borderRadius: '45px 0 0 45px' }}
        >
          <span className='text-base font-bold sm:text-lg'>Player Pair</span>
          <span className='text-base font-bold sm:text-lg'>11:1</span>
        </div>

        {/* Player */}
        <div
          onClick={() => openBetSlip('Player', '1.0', 'back', isMobile)}
          className='flex h-[90px] cursor-pointer flex-col justify-center bg-[#096bb5] px-3 text-white'
        >
          <span className='text-base font-bold sm:text-lg'>Player</span>
          <span className='text-base font-bold sm:text-lg'>1:1</span>
          <div className='mt-1 flex gap-2'>
            <div className='h-[28px] w-[23px] border-2 border-yellow-300 bg-[#72b9e8]' />
            <div className='h-[28px] w-[23px] border-2 border-yellow-300 bg-[#72b9e8]' />
          </div>
        </div>

        {/* Tie */}
        <div
          onClick={() => openBetSlip('Tie', '8.0', 'back', isMobile)}
          className='flex h-[90px] cursor-pointer flex-col items-center justify-center bg-[#219638] text-center text-white'
        >
          <span className='text-base font-bold sm:text-lg'>Tie</span>
          <span className='text-base font-bold sm:text-lg'>8:1</span>
        </div>

        {/* Banker */}
        <div
          onClick={() => openBetSlip('Banker', '1.0', 'back', isMobile)}
          className='flex h-[90px] cursor-pointer flex-col justify-center bg-[#b51e32] px-3 text-white'
        >
          <span className='text-base font-bold sm:text-lg'>Banker</span>
          <span className='text-base font-bold sm:text-lg'>1:1</span>
          <div className='mt-1 flex gap-2'>
            <div className='h-[28px] w-[23px] border-2 border-yellow-300 bg-[#72b9e8]' />
            <div className='h-[28px] w-[23px] border-2 border-yellow-300 bg-[#72b9e8]' />
          </div>
        </div>

        {/* Banker Pair */}
        <div
          onClick={() => openBetSlip('Banker Pair', '11.0', 'back', isMobile)}
          className='flex h-[90px] cursor-pointer flex-col items-center justify-center bg-[#b51e32] px-1 text-center text-white'
          style={{ borderRadius: '0 45px 45px 0' }}
        >
          <span className='text-base font-bold sm:text-lg'>Banker Pair</span>
          <span className='text-base font-bold sm:text-lg'>11:1</span>
        </div>
      </div>
    </div>
  );
}

function TableBaccarat2({ isMobile, isSuspended, openBetSlip, markets }) {
  const scoreMarkets = [
    { name: 'Score 1-4', odds: '7.5:1' },
    { name: 'Score 5-6', odds: '4:1' },
    { name: 'Score 7', odds: '4.5:1' },
    { name: 'Score 8', odds: '3:1' },
    { name: 'Score 9', odds: '2.5:1' },
  ];

  const bottomMarkets = [
    {
      name: 'Player Pair',
      odds: '11:1',
      color: '#096bb5',
      radius: '60px 0 0 60px',
    },
    {
      name: 'Player',
      odds: '1:1',
      color: '#096bb5',
      cards: true,
    },
    {
      name: 'Tie',
      odds: '8:1',
      color: '#219638',
    },
    {
      name: 'Banker',
      odds: '1:1',
      color: '#b51e32',
      cards: true,
    },
    {
      name: 'Banker Pair',
      odds: '11:1',
      color: '#b51e32',
      radius: '0 60px 60px 0',
    },
  ];

  const getOdds = (name) => {
    if (name === 'Player') return markets?.player?.back || '1.98';
    if (name === 'Tie') return markets?.tie?.back || '9.0';
    if (name === 'Banker') return markets?.banker?.back || '1.95';
    return '11.0';
  };

  return (
    <div className='w-full bg-[#f1f1f1] p-2'>
      {/* Top Section */}
      <div className='flex flex-col gap-3 lg:flex-row lg:items-start'>
        {/* Statistics Section (Left Side) */}
        <div className='flex w-full shrink-0 items-center gap-4 px-2 py-1 lg:w-[260px]'>
          <div className='flex flex-col items-center'>
            <div className='text-xl font-semibold text-[#333]'>Statistics</div>

            {/* Pie Chart with Inner Cutout */}
            <div className='relative mt-2 h-[105px] w-[105px]'>
              <div
                className='absolute inset-0 rounded-full'
                style={{
                  background:
                    'conic-gradient(#0874bd 0% 49%, #b51e32 49% 89%, #219638 89% 100%)',
                }}
              />
              {/* White Center Cutout */}
              <div className='absolute inset-0 m-auto h-[65px] w-[65px] rounded-full bg-[#f1f1f1]' />

              {/* Percentage Labels */}
              <span className='absolute top-[40%] left-[55%] text-[10px] font-bold text-white'>
                49%
              </span>
              <span className='absolute top-[60%] left-[25%] text-[10px] font-bold text-white'>
                46%
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className='flex flex-col gap-1.5 text-sm font-medium text-[#333]'>
            <div className='flex items-center gap-2'>
              <span className='h-3.5 w-3.5 rounded-full bg-[#0874bd]' />
              Player
            </div>
            <div className='flex items-center gap-2'>
              <span className='h-3.5 w-3.5 rounded-full bg-[#b51e32]' />
              Banker
            </div>
            <div className='flex items-center gap-2'>
              <span className='h-3.5 w-3.5 rounded-full bg-[#219638]' />
              Tie
            </div>
          </div>
        </div>

        {/* Score Odds (Right Side) */}
        <div className='grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'>
          {scoreMarkets.map((item) => (
            <button
              key={item.name}
              type='button'
              disabled={isSuspended}
              onClick={() =>
                openBetSlip(item.name, item.odds, 'back', isMobile)
              }
              className='flex h-[75px] flex-col items-center justify-center bg-[#293e50] text-center text-white disabled:opacity-60'
            >
              <span className='text-base font-semibold sm:text-lg'>
                {item.name}
              </span>
              <span className='mt-1 text-base sm:text-lg'>{item.odds}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Betting Section (Bottom) */}
      <div className='mt-3 grid grid-cols-[1.1fr_1.3fr_1.3fr_1.3fr_1.1fr] gap-2'>
        {bottomMarkets.map((item) => (
          <button
            key={item.name}
            type='button'
            disabled={isSuspended}
            onClick={() =>
              openBetSlip(item.name, getOdds(item.name), 'back', isMobile)
            }
            className='flex h-[90px] min-w-0 cursor-pointer flex-col justify-center px-3 text-white disabled:opacity-60 sm:h-[105px] sm:px-4'
            style={{
              backgroundColor: item.color,
              borderRadius: item.radius || '0',
              textAlign: item.cards ? 'left' : 'center',
              alignItems: item.cards ? 'flex-start' : 'center',
            }}
          >
            <span className='text-sm leading-tight font-semibold sm:text-lg'>
              {item.name}
            </span>

            <span className='text-sm leading-tight font-semibold sm:text-lg'>
              {item.odds}
            </span>

            {/* Card Graphics for Player & Banker */}
            {item.cards && (
              <div className='mt-1 flex gap-1.5'>
                {/* First Card */}
                <div className='flex h-[30px] w-[22px] items-center justify-center border-[2px] border-yellow-300 bg-[#e4e4e4] shadow-sm sm:h-[35px] sm:w-[26px]'>
                  <div className='h-3 w-2 border border-blue-400 bg-blue-100 sm:h-4 sm:w-3'></div>
                </div>
                {/* Second Card */}
                <div className='flex h-[30px] w-[22px] items-center justify-center border-[2px] border-yellow-300 bg-[#e4e4e4] shadow-sm sm:h-[35px] sm:w-[26px]'>
                  <div className='h-3 w-2 border border-blue-400 bg-blue-100 sm:h-4 sm:w-3'></div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function TableDt20({ isMobile, isSuspended, openBetSlip, markets }) {
  const topMarkets = [
    {
      name: 'Dragon',
      odds: markets?.dragon?.back || '1.98',
      flex: 'flex-[2.5]',
    },
    {
      name: 'Tie',
      odds: markets?.tie?.back || '11',
      flex: 'flex-1',
    },
    {
      name: 'Tiger',
      odds: markets?.tiger?.back || '1.98',
      flex: 'flex-[2.5]',
    },
    {
      name: 'Pair',
      odds: markets?.pair?.back || '12',
      flex: 'flex-[2.5]',
    },
  ];

  const sideMarkets = [
    { name: 'Even', key: 'Even', odds: '2.10' },
    { name: 'Odd', key: 'Odd', odds: '1.79' },
    {
      name: 'Red',
      key: 'Red',
      odds: '1.95',
      label: '♥ ♦',
      color: 'text-red-500',
    },
    {
      name: 'Black',
      key: 'Black',
      odds: '1.95',
      label: '♠ ♣',
      color: 'text-black',
    },
  ];

  const cardRanks = [
    { label: 'A', nat: 'Card 1', value: 1 },
    { label: '2', nat: 'Card 2', value: 2 },
    { label: '3', nat: 'Card 3', value: 3 },
    { label: '4', nat: 'Card 4', value: 4 },
    { label: '5', nat: 'Card 5', value: 5 },
    { label: '6', nat: 'Card 6', value: 6 },
    { label: '7', nat: 'Card 7', value: 7 },
    { label: '8', nat: 'Card 8', value: 8 },
    { label: '9', nat: 'Card 9', value: 9 },
    { label: '10', nat: 'Card 10', value: 10 },
    { label: 'J', nat: 'Card J', value: 11 },
    { label: 'Q', nat: 'Card Q', value: 12 },
    { label: 'K', nat: 'Card K', value: 13 },
  ];

  const placeBet = (name, odds) => {
    if (!isSuspended) {
      openBetSlip(name, odds, 'back', isMobile);
    }
  };

  const buttonClass = `
    flex w-full min-w-0 items-center justify-center
    rounded-sm bg-gradient-to-r from-[#078bc5] to-[#293f50]
    font-bold text-white shadow-sm transition-all
    ${
      isSuspended
        ? 'cursor-not-allowed opacity-50'
        : 'cursor-pointer hover:brightness-110 active:scale-[0.99]'
    }
  `;

  const renderSide = (side) => (
    <div className='min-w-0 bg-[#f1f1f1] p-2'>
      <h3 className='mb-2 text-center text-lg font-extrabold text-[#333]'>
        {side.toUpperCase()}
      </h3>

      <div className='grid grid-cols-4 gap-1'>
        {sideMarkets.map((market) => {
          const natName = `${side} ${market.key || market.name}`;
          const liveOdds = markets?.[natName]?.back || market.odds;
          return (
            <div key={`${side}-${market.name}`} className='min-w-0'>
              <div className='mb-1 text-center text-sm font-bold text-[#333]'>
                {isSuspended ? '0' : liveOdds}
              </div>

              <button
                type='button'
                disabled={isSuspended}
                onClick={() => placeBet(natName, liveOdds)}
                className={`${buttonClass} h-[46px] text-sm sm:text-base`}
              >
                {market.label ? (
                  <span className={`text-xl sm:text-2xl ${market.color}`}>
                    {market.label}
                  </span>
                ) : (
                  market.name
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Playing card design
  const renderCard = (card, side) => {
    const natName = `${side} ${card.nat}`;
    const cardOdds = markets?.[natName]?.back || '12';
    return (
      <button
        key={`${side}-${card.value}`}
        type='button'
        disabled={isSuspended}
        onClick={() => placeBet(natName, cardOdds)}
        className={`relative flex h-[68px] w-[47px] shrink-0 flex-col justify-between border border-yellow-400 bg-white p-1 text-left shadow-sm transition-transform ${
          isSuspended
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:-translate-y-1'
        }`}
      >
        <span className='text-[25px] leading-none font-bold text-black'>
          {card.label}
        </span>

        <div className='flex items-center justify-between text-[18px] leading-none font-bold'>
          <span className='text-black'>♠</span>
          <span className='text-red-600'>♦</span>
        </div>

        <div className='flex items-center justify-between text-[18px] leading-none font-bold'>
          <span className='text-black'>♣</span>
          <span className='text-red-600'>♥</span>
        </div>
      </button>
    );
  };

  const renderCardMarket = (side) => (
    <div className='min-w-0 border border-[#d1d1d1] bg-[#f1f1f1] p-2'>
      <h3 className='mb-2 text-center text-lg font-extrabold text-[#333]'>
        {side.toUpperCase()} 12
      </h3>

      <div className='flex flex-wrap justify-center gap-1.5'>
        {cardRanks.map((card) => renderCard(card, side))}
      </div>
    </div>
  );

  return (
    <div className='w-full space-y-2 bg-white p-1'>
      {/* DRAGON / TIE / TIGER / PAIR */}
      <div className='flex items-end gap-1.5 sm:gap-2'>
        {topMarkets.map((market, index) => (
          <div
            key={market.name}
            className={`${market.flex} min-w-0 ${
              index === 3
                ? 'border-l-[4px] border-[#293d50] pl-1.5 sm:pl-2'
                : ''
            }`}
          >
            <div className='mb-1 text-center text-base font-extrabold text-[#333] sm:text-lg'>
              {isSuspended ? '0' : market.odds}
            </div>

            <button
              type='button'
              disabled={isSuspended}
              onClick={() => placeBet(market.name, market.odds)}
              className={`${buttonClass} h-[48px] text-sm sm:h-[52px] sm:text-lg`}
            >
              {market.name}
            </button>
          </div>
        ))}
      </div>

      {/* DRAGON / TIGER SIDE MARKETS */}
      <div className='grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2'>
        {renderSide('Dragon')}
        {renderSide('Tiger')}
      </div>

      {/* DRAGON 12 / TIGER 12 CARD MARKETS */}
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
        {renderCardMarket('Dragon')}
        {renderCardMarket('Tiger')}
      </div>
    </div>
  );
}

function TableDt1Day({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];

  const getItem = (nat, defaultOdds = 0) => {
    const target = normalizeSelection(nat);
    const found = subs.find((s) => normalizeSelection(s?.nat) === target);
    return (
      found || {
        sid: nat,
        nat,
        b: defaultOdds,
        l: defaultOdds,
        gstatus: isSuspended ? 'SUSPENDED' : 'OPEN',
      }
    );
  };

  const isOpen = (item) =>
    !isSuspended && String(item?.gstatus || '').toUpperCase() === 'OPEN';

  const clickBet = (item, type = 'back') => {
    if (!isOpen(item)) return;
    const odds = type === 'lay' ? item?.l : item?.b;
    if (!Number(odds)) return;
    openBetSlip(item.nat, String(odds), type, isMobile);
  };

  const renderOddsCell = (nat, fallbackOdds = 0, extraClass = 'back') => {
    const item = getItem(nat, fallbackOdds);
    const open = isOpen(item);
    return (
      <div
        className={`casino-odds-box ${extraClass} ${!open ? 'suspended-box' : ''}`}
        onClick={() => clickBet(item, 'back')}
        style={{ cursor: open ? 'pointer' : 'not-allowed' }}
      >
        <span className='casino-odds'>{item?.b ?? 0}</span>
        <NationBook id={normalizeSelection(nat)} />
      </div>
    );
  };

  const dragon = getItem('Dragon', 0);
  const tiger = getItem('Tiger', 0);
  const pair = getItem('Pair', 12);

  return (
    <div className='casino-table'>
      {/* Main Dragon / Tiger (Back/Lay) + Pair */}
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Back</div>
            <div className='casino-odds-box lay'>Lay</div>
          </div>
          <div className='casino-table-body'>
            {[dragon, tiger].map((row) => {
              const open = isOpen(row);
              return (
                <div className='casino-table-row' key={row.nat}>
                  <div className='casino-nation-detail'>
                    <div className='casino-nation-name'>{row.nat}</div>
                    <NationBook id={normalizeSelection(row.nat)} />
                  </div>
                  <div
                    className={`casino-odds-box back ${!open ? 'suspended-box' : ''}`}
                    onClick={() => clickBet(row, 'back')}
                    style={{ cursor: open ? 'pointer' : 'not-allowed' }}
                  >
                    <span className='casino-odds'>{row?.b ?? 0}</span>
                  </div>
                  <div
                    className={`casino-odds-box lay ${!open ? 'suspended-box' : ''}`}
                    onClick={() => clickBet(row, 'lay')}
                    style={{ cursor: open ? 'pointer' : 'not-allowed' }}
                  >
                    <span className='casino-odds'>{row?.l ?? 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='casino-table-right-box dtpair'>
          <div className='casino-odds text-center'>{pair?.b ?? 0}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${!isOpen(pair) ? 'suspended-box' : ''}`}
            onClick={() => clickBet(pair, 'back')}
            style={{ cursor: isOpen(pair) ? 'pointer' : 'not-allowed' }}
          >
            <span className='casino-odds'>Pair</span>
          </div>
          <NationBook id='pair' />
        </div>
      </div>

      {/* Even/Odd + Red/Black */}
      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Even</div>
            <div className='casino-odds-box back'>Odd</div>
          </div>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Dragon</div>
              </div>
              {renderOddsCell('Dragon Even')}
              {renderOddsCell('Dragon Odd')}
            </div>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Tiger</div>
              </div>
              {renderOddsCell('Tiger Even')}
              {renderOddsCell('Tiger Odd')}
            </div>
          </div>
        </div>

        <div className='casino-table-right-box dtredblack'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>
              <span>Red</span>
              <span className='card-icon ms-1'>
                <span className='card-red'>{'{'}</span>
              </span>
              <span className='card-icon ms-1'>
                <span className='card-red'>[</span>
              </span>
            </div>
            <div className='casino-odds-box back'>
              <span>Black</span>
              <span className='card-icon ms-1'>
                <span className='card-black'>{'}'}</span>
              </span>
              <span className='card-icon ms-1'>
                <span className='card-black'>]</span>
              </span>
            </div>
          </div>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Dragon</div>
              </div>
              {renderOddsCell('Dragon Red')}
              {renderOddsCell('Dragon Black')}
            </div>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Tiger</div>
              </div>
              {renderOddsCell('Tiger Red')}
              {renderOddsCell('Tiger Black')}
            </div>
          </div>
        </div>
      </div>

      {/* Suits: Spade }, Heart {, Club ], Diamond [ */}
      <div className='casino-table-full-box dt1day-other-odds mt-3'>
        <div className='casino-table-header'>
          <div className='casino-nation-detail' />
          <div className='casino-odds-box'>
            <span className='card-icon ms-1'>
              <span className='card-black'>{'}'}</span>
            </span>
          </div>
          <div className='casino-odds-box'>
            <span className='card-icon ms-1'>
              <span className='card-red'>{'{'}</span>
            </span>
          </div>
          <div className='casino-odds-box'>
            <span className='card-icon ms-1'>
              <span className='card-black'>]</span>
            </span>
          </div>
          <div className='casino-odds-box'>
            <span className='card-icon ms-1'>
              <span className='card-red'>[</span>
            </span>
          </div>
        </div>
        <div className='casino-table-body'>
          {['Dragon', 'Tiger'].map((side) => (
            <div className='casino-table-row' key={side}>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>{side}</div>
              </div>
              {renderOddsCell(`${side} Spade`)}
              {renderOddsCell(`${side} Heart`)}
              {renderOddsCell(`${side} Club`)}
              {renderOddsCell(`${side} Diamond`)}
            </div>
          ))}
        </div>
      </div>

      {roundData?.remark ? (
        <div className='casino-remark mt-1'>
          <marquee scrollAmount='3'>{roundData.remark}</marquee>
        </div>
      ) : null}
    </div>
  );
}

function TableDt6(props) {
  return <TableDt1Day {...props} />;
}

function TableDtl20({ isMobile, isSuspended, openBetSlip, markets }) {
  const columns = ['Dragon', 'Tiger', 'Lion'];

  const leftRows = [
    { label: 'Winner', key: 'winner', odds: '2.94' },
    { label: 'Black', key: 'black', odds: '1.97' },
    { label: 'Red', key: 'red', odds: '1.97' },
    { label: 'Odd', key: 'odd', odds: '1.83' },
    { label: 'Even', key: 'even', odds: '2.12' },
    { label: 'A', key: 'A', odds: '12', card: true },
    { label: '2', key: '2', odds: '12', card: true },
    { label: '3', key: '3', odds: '12', card: true },
    { label: '4', key: '4', odds: '12', card: true },
  ];

  const rightRows = [
    { label: '5', key: '5', odds: '12', card: true },
    { label: '6', key: '6', odds: '12', card: true },
    { label: '7', key: '7', odds: '12', card: true },
    { label: '8', key: '8', odds: '12', card: true },
    { label: '9', key: '9', odds: '12', card: true },
    { label: '10', key: '10', odds: '12', card: true },
    { label: 'J', key: 'J', odds: '12', card: true },
    { label: 'Q', key: 'Q', odds: '12', card: true },
    { label: 'K', key: 'K', odds: '12', card: true },
  ];

  const getOdds = (column, row) => {
    const market = markets?.[column.toLowerCase()];

    return (
      market?.[row.key]?.back ??
      market?.[row.key] ??
      (row.key === 'winner' ? market?.back : undefined) ??
      row.odds
    );
  };

  const renderCard = (value) => (
    <div className='flex h-[35px] w-[27px] flex-col justify-between border border-yellow-400 bg-white px-[2px] py-[1px] leading-none sm:h-[42px] sm:w-[32px]'>
      <span className='text-[15px] font-semibold text-black sm:text-[19px]'>
        {value}
      </span>

      <div className='grid grid-cols-2 gap-x-[1px] text-[10px] leading-[9px] sm:text-[12px]'>
        <span className='text-black'>♠</span>
        <span className='text-red-600'>♦</span>
        <span className='text-black'>♣</span>
        <span className='text-red-600'>♥</span>
      </div>
    </div>
  );

  const renderLabel = (row) => {
    if (row.card) {
      return renderCard(row.label);
    }

    if (row.key === 'black') {
      return (
        <span>
          Black <span className='text-black'>♠ ♣</span>
        </span>
      );
    }

    if (row.key === 'red') {
      return (
        <span>
          Red <span className='text-red-600'>♥ ♦</span>
        </span>
      );
    }

    return row.label;
  };

  const renderTable = (rows) => (
    <div className='w-full min-w-0'>
      <div className='grid grid-cols-[2fr_1fr_1fr_1fr]'>
        <div className='h-[30px] border border-[#c9c9c9] bg-[#f1f1f1]' />

        {columns.map((column) => (
          <div
            key={column}
            className='flex h-[30px] items-center justify-center border border-[#c9c9c9] bg-[#72b9e8] text-[13px] font-bold text-[#30343a] sm:text-base'
          >
            {column}
          </div>
        ))}

        {rows.map((row) => (
          <React.Fragment key={row.key}>
            <div className='flex h-[43px] items-center border border-[#c9c9c9] bg-[#f1f1f1] px-1.5 text-[13px] font-bold text-[#30343a] sm:h-[48px] sm:px-2 sm:text-base'>
              {renderLabel(row)}
            </div>

            {columns.map((column) => {
              const odds = getOdds(column, row);
              const nation = `${column} ${row.label}`;

              return (
                <button
                  key={`${row.key}-${column}`}
                  type='button'
                  onClick={() => openBetSlip(nation, odds, 'back', isMobile)}
                  className='flex h-[43px] w-full items-center justify-center border border-[#c9c9c9] bg-[#72b9e8] text-[15px] font-bold text-[#30343a] transition-colors hover:bg-[#5da9dc] active:bg-[#4899d0] sm:h-[48px] sm:text-xl'
                >
                  {odds}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className='w-full bg-[#f5f5f5] p-1'>
      <div className='grid grid-cols-1 gap-1.5 lg:grid-cols-2'>
        {renderTable(leftRows)}
        {renderTable(rightRows)}
      </div>
    </div>
  );
}

function TablePdt6(props) {
  return <TableDt1Day {...props} />;
}

export const TABLES = {
  baccarat: TableBaccarat,
  baccarat2: TableBaccarat2,
  pbaccarat: TableBaccarat,
  dt20: TableDt20,
  dt202: TableDt20,
  pdt20: TableDt20,
  dt6: TableDt6,
  pdt6: TablePdt6,
  dtl20: TableDtl20,
};

export default TABLES;
