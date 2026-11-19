import React from 'react';

function TablePoker({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '0',
      twoCards: markets?.playerA?.twoCardsBonus,
      sevenCards: markets?.playerA?.sevenCardsBonus,
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '0',
      twoCards: markets?.playerB?.twoCardsBonus,
      sevenCards: markets?.playerB?.sevenCardsBonus,
    },
  ];

  return (
    <div className='w-full'>
      <div className='grid grid-cols-2 gap-2'>
        {players.map((player) => (
          <div key={player.name} className='min-w-0'>
            {/* Player Main Market */}
            <div className='grid grid-cols-[minmax(0,3fr)_1fr_1fr] overflow-hidden border border-[#c9c9c9]'>
              <div className='flex h-[48px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base'>
                {player.name}
              </div>

              <button
                type='button'
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(player.name, player.back, 'back', isMobile)
                }
                className='flex h-[48px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] disabled:opacity-60 sm:text-base'
              >
                {player.back}
              </button>

              <button
                type='button'
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(player.name, player.lay, 'lay', isMobile)
                }
                className='flex h-[48px] items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] hover:bg-[#ed91a7] disabled:opacity-60 sm:text-base'
              >
                {player.lay}
              </button>
            </div>

            {/* Bonus Markets */}
            <div className='mt-2 grid grid-cols-2 gap-2'>
              <button
                type='button'
                disabled={isSuspended || player.twoCards == null}
                onClick={() =>
                  openBetSlip(
                    `2 Cards Bonus ${player.name}`,
                    player.twoCards,
                    'back',
                    isMobile
                  )
                }
                className='flex h-[48px] min-w-0 items-center justify-center bg-[#72b9e8] px-1 text-xs font-bold text-[#333333] hover:bg-[#5da9dc] disabled:cursor-default disabled:opacity-100 sm:text-base'
              >
                2 Cards Bonus
              </button>

              <button
                type='button'
                disabled={isSuspended || player.sevenCards == null}
                onClick={() =>
                  openBetSlip(
                    `7 Cards Bonus ${player.name}`,
                    player.sevenCards,
                    'back',
                    isMobile
                  )
                }
                className='flex h-[48px] min-w-0 items-center justify-center bg-[#72b9e8] px-1 text-xs font-bold text-[#333333] hover:bg-[#5da9dc] disabled:cursor-default disabled:opacity-100 sm:text-base'
              >
                7 Cards Bonus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TablePoker20({ isMobile, isSuspended, openBetSlip, markets }) {
  const marketNames = [
    'Winner',
    'One Pair',
    'Two Pair',
    'Three of a Kind',
    'Straight',
    'Flush',
    'Full House',
    'Four of a Kind',
    'Straight Flush',
  ];

  const defaultOdds = [
    '1.98',
    '2',
    '3.75',
    '16',
    '16',
    '26',
    '29',
    '251',
    '501',
  ];

  const players = [
    {
      name: 'Player A',
      key: 'playerA',
    },
    {
      name: 'Player B',
      key: 'playerB',
    },
  ];

  return (
    <div className='grid w-full grid-cols-2 gap-2'>
      {players.map((player) => (
        <div key={player.key} className='min-w-0'>
          <div className='grid grid-cols-3 gap-2'>
            {marketNames.map((name, index) => {
              const odds =
                markets?.[player.key]?.[name] ??
                markets?.[player.key]?.[
                  [
                    'winner',
                    'onePair',
                    'twoPair',
                    'threeOfAKind',
                    'straight',
                    'flush',
                    'fullHouse',
                    'fourOfAKind',
                    'straightFlush',
                  ][index]
                ] ??
                defaultOdds[index];

              return (
                <div key={name} className='min-w-0'>
                  {/* Market Name */}
                  <div className='flex h-[46px] items-center justify-center bg-[#f1f1f1] px-1 text-center text-xs font-bold text-[#333333] sm:text-sm'>
                    {name}
                  </div>

                  {/* Odds Button */}
                  <button
                    type='button'
                    disabled={isSuspended}
                    onClick={() =>
                      openBetSlip(
                        `${player.name} ${name}`,
                        odds,
                        'back',
                        isMobile
                      )
                    }
                    className='mt-0.5 flex h-[48px] w-full items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#333333] transition-colors hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base'
                  >
                    {odds}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TablePoker6({ isMobile, isSuspended, openBetSlip, markets }) {
  const [activeTab, setActiveTab] = React.useState('hands');

  const players = [
    { name: 'Player 1', cards: ['A', '♠', '9', '♣'], odds: '4.68' },
    { name: 'Player 2', cards: ['7', '♥', '7', '♦'], odds: '1.29' },
    { name: 'Player 3', cards: ['4', '♥', '7', '♠'], odds: '10.4' },
    {
      name: 'Player 4',
      cards: ['6', '♠', 'A', '♦'],
      odds: '0',
      suspended: true,
    },
    { name: 'Player 5', cards: ['3', '♥', 'Q', '♣'], odds: '7.9' },
    { name: 'Player 6', cards: ['2', '♦', '2', '♥'], odds: '10.4' },
  ];

  const patterns = [
    { name: 'High Card', odds: '100' },
    { name: 'Pair', odds: '5.8' },
    { name: 'Two Pair', odds: '3.1' },
    { name: 'Three of a Kind', odds: '6.8' },
    { name: 'Straight', odds: '5.7' },
    { name: 'Flush', odds: '8.7' },
    { name: 'Full House', odds: '8.7' },
    { name: 'Four of a Kind', odds: '80' },
    { name: 'Straight Flush', odds: '100' },
  ];

  const getSuitColor = (suit) =>
    suit === '♥' || suit === '♦' ? 'text-red-600' : 'text-black';

  const getPlayerOdds = (player, index) =>
    markets?.[`player${index + 1}`]?.back ?? player.odds;

  return (
    <div className='w-full overflow-hidden bg-[#f5f5f5]'>
      {/* Tabs */}
      <div className='flex items-center border-b border-[#d1d1d1]'>
        <button
          type='button'
          onClick={() => setActiveTab('hands')}
          className={`h-[48px] px-6 text-sm font-semibold sm:text-base ${
            activeTab === 'hands'
              ? 'bg-[#293d50] text-white'
              : 'bg-[#d1d1d1] text-black'
          }`}
        >
          Hands
        </button>

        <button
          type='button'
          onClick={() => setActiveTab('pattern')}
          className={`h-[48px] px-6 text-sm font-semibold sm:text-base ${
            activeTab === 'pattern'
              ? 'bg-[#293d50] text-white'
              : 'bg-[#d1d1d1] text-black'
          }`}
        >
          Pattern
        </button>
      </div>

      {/* HANDS TAB */}
      {activeTab === 'hands' && (
        <div className='grid grid-cols-2 gap-2 p-2'>
          {players.map((player, index) => {
            const suspended = player.suspended;

            return (
              <button
                key={player.name}
                type='button'
                disabled={suspended}
                onClick={() =>
                  openBetSlip(
                    player.name,
                    getPlayerOdds(player, index),
                    'back',
                    isMobile
                  )
                }
                className={`relative flex h-[70px] min-w-0 items-center justify-between gap-2 px-2 text-left sm:h-[90px] sm:px-4 ${
                  suspended ? 'bg-[#414d57]' : 'bg-[#72b9e8] hover:bg-[#5da9dc]'
                }`}
              >
                <div className='flex min-w-0 items-center gap-2'>
                  <span
                    className={`shrink-0 text-sm font-bold sm:text-base ${
                      suspended ? 'text-[#333]' : 'text-[#293d50]'
                    }`}
                  >
                    {player.name}
                  </span>

                  <div className='flex shrink-0 items-center gap-1 bg-[#dedede] px-2 py-1 sm:gap-2 sm:px-3'>
                    {[0, 2].map((cardIndex) => (
                      <span
                        key={cardIndex}
                        className='text-sm font-bold text-black sm:text-base'
                      >
                        {player.cards[cardIndex]}
                        <span
                          className={getSuitColor(player.cards[cardIndex + 1])}
                        >
                          {player.cards[cardIndex + 1]}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <span
                  className={`shrink-0 text-sm font-bold sm:text-base ${
                    suspended ? 'text-[#333]' : 'text-[#293d50]'
                  }`}
                >
                  {getPlayerOdds(player, index)}
                </span>

                {suspended && (
                  <span className='absolute inset-0 flex items-center justify-center bg-[#414d57]/80 text-2xl text-white'>
                    🔒
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* PATTERN TAB */}
      {activeTab === 'pattern' && (
        <div className='grid grid-cols-3 gap-2 p-2'>
          {patterns.map((pattern, index) => {
            const odds =
              markets?.patterns?.[
                [
                  'highCard',
                  'pair',
                  'twoPair',
                  'threeOfAKind',
                  'straight',
                  'flush',
                  'fullHouse',
                  'fourOfAKind',
                  'straightFlush',
                ][index]
              ]?.back ?? pattern.odds;

            return (
              <button
                key={pattern.name}
                type='button'
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(pattern.name, odds, 'back', isMobile)
                }
                className='flex h-[72px] min-w-0 flex-col items-center justify-center gap-1 bg-[#72b9e8] px-1 text-[#293d50] transition-colors hover:bg-[#5da9dc] sm:h-[90px]'
              >
                <span className='text-center text-xs font-bold sm:text-base'>
                  {pattern.name}
                </span>

                <span className='text-sm font-bold sm:text-base'>{odds}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TableCard32({ isMobile, isSuspended, openBetSlip, markets }) {
  const panels = [
    [
      {
        name: 'Player 8',
        key: 'player8',
        back: '12.2',
        lay: '13.7',
      },
      {
        name: 'Player 9',
        key: 'player9',
        back: '5.95',
        lay: '6.45',
      },
    ],
    [
      {
        name: 'Player 10',
        key: 'player10',
        back: '3.2',
        lay: '3.45',
      },
      {
        name: 'Player 11',
        key: 'player11',
        back: '2.08',
        lay: '2.18',
      },
    ],
  ];

  const getOdds = (player, type) =>
    markets?.[player.key]?.[type] ?? player[type];

  const headerClass =
    'flex h-[29px] items-center justify-center border border-[#c8c8c8] text-[13px] font-bold sm:h-[32px] sm:text-[15px]';

  const cellClass =
    'flex h-[45px] items-center justify-center border border-[#c8c8c8] text-[15px] font-bold text-[#30343a] sm:h-[47px] sm:text-[17px]';

  const renderPanel = (players, panelIndex) => (
    <div key={panelIndex} className='min-w-0 flex-1'>
      <div className='grid grid-cols-[minmax(0,3fr)_repeat(2,minmax(0,1fr))]'>
        <div className='border border-[#c8c8c8] bg-[#f1f1f1]' />

        <div className={`${headerClass} border-[#c8c8c8] bg-[#72b9e8]`}>
          Back
        </div>

        <div className={`${headerClass} border-[#c8c8c8] bg-[#f5a5b8]`}>
          Lay
        </div>

        {players.map((player) => {
          const backOdds = getOdds(player, 'back');
          const layOdds = getOdds(player, 'lay');

          return (
            <React.Fragment key={player.key}>
              <div className='flex h-[45px] items-center border border-[#c8c8c8] bg-[#f1f1f1] px-2 sm:h-[47px]'>
                <span className='truncate text-[14px] font-bold text-[#333] sm:text-[16px]'>
                  {player.name}
                </span>
              </div>

              <button
                type='button'
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(player.name, backOdds, 'back', isMobile)
                }
                className={`${cellClass} border-[#c8c8c8] bg-[#72b9e8] transition-colors hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isSuspended ? '0' : backOdds}
              </button>

              <button
                type='button'
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(player.name, layOdds, 'lay', isMobile)
                }
                className={`${cellClass} border-[#c8c8c8] bg-[#f5a5b8] transition-colors hover:bg-[#ed91a7] disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isSuspended ? '0' : layOdds}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className='w-full bg-[#f5f5f5] p-1'>
      <div className='flex flex-col gap-1.5 md:flex-row md:gap-2'>
        {panels.map((players, index) => renderPanel(players, index))}
      </div>
    </div>
  );
}

function TableCard32eu({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    { name: 'Player 8', key: 'player8', back: '12.2', lay: '13.7' },
    { name: 'Player 9', key: 'player9', back: '5.95', lay: '6.45' },
    { name: 'Player 10', key: 'player10', back: '3.2', lay: '3.45' },
    { name: 'Player 11', key: 'player11', back: '2.08', lay: '2.18' },
  ];

  const patterns = [
    { name: 'Any 3 Card Black', key: 'any3Black', back: '3.25', lay: '3.45' },
    { name: 'Any 3 Card Red', key: 'any3Red', back: '3.25', lay: '3.45' },
    {
      name: 'Two Black Two Red',
      key: 'twoBlackTwoRed',
      back: '2.44',
      lay: '2.54',
    },
  ];

  const totals = [
    { name: '8 & 9 Total', key: 'total89', odds: '1.97' },
    { name: '10 & 11 Total', key: 'total1011', odds: '1.97' },
  ];

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  const getOdds = (key, type, fallback) => markets?.[key]?.[type] ?? fallback;

  const headerCell =
    'flex h-[29px] items-center justify-center border border-[#c8c8c8] text-[13px] font-bold sm:h-[32px] sm:text-[15px]';

  const nameCell =
    'flex min-h-[38px] items-center border border-[#c8c8c8] bg-[#f1f1f1] px-1.5 text-[13px] font-bold text-[#333] sm:min-h-[40px] sm:text-[15px]';

  const oddsCell =
    'flex min-h-[38px] items-center justify-center border border-[#c8c8c8] text-[14px] font-bold text-[#30343a] sm:min-h-[40px] sm:text-[16px]';

  const renderButton = (name, odds, type = 'back', color = 'back') => (
    <button
      type='button'
      disabled={isSuspended}
      onClick={() => openBetSlip(name, odds, type, isMobile)}
      className={`${oddsCell} ${
        color === 'lay'
          ? 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
          : 'bg-[#72b9e8] hover:bg-[#5da9dc]'
      } transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isSuspended ? '0' : odds}
    </button>
  );

  const renderBackLayTable = (items, isPlayer = false) => (
    <div className='min-w-0'>
      <div className='grid grid-cols-[minmax(0,3fr)_repeat(2,minmax(0,1fr))]'>
        <div className='border border-[#c8c8c8] bg-[#f1f1f1]' />
        <div className={`${headerCell} bg-[#72b9e8]`}>Back</div>
        <div className={`${headerCell} bg-[#f5a5b8]`}>Lay</div>

        {items.map((item) => {
          const back = getOdds(item.key, 'back', item.back);
          const lay = getOdds(item.key, 'lay', item.lay);

          return (
            <React.Fragment key={item.key}>
              <div className={nameCell}>{item.name}</div>
              {renderButton(item.name, back, 'back', 'back')}
              {renderButton(item.name, lay, 'lay', 'lay')}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderOddEvenTable = () => (
    <div className='min-w-0'>
      <div className='grid grid-cols-[minmax(0,3fr)_repeat(2,minmax(0,1fr))]'>
        <div className='border border-[#c8c8c8] bg-[#f1f1f1]' />
        <div className={`${headerCell} bg-[#72b9e8]`}>Odd</div>
        <div className={`${headerCell} bg-[#72b9e8]`}>Even</div>

        {players.map((player) => (
          <React.Fragment key={player.key}>
            <div className={nameCell}>{player.name}</div>
            {renderButton(
              `${player.name} Odd`,
              getOdds(player.key, 'odd', '1.97')
            )}
            {renderButton(
              `${player.name} Even`,
              getOdds(player.key, 'even', '1.97')
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderTotalsTable = () => (
    <div className='min-w-0'>
      <div className='grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
        <div className='border border-[#c8c8c8] bg-[#f1f1f1]' />
        <div className={`${headerCell} bg-[#72b9e8]`}>Back</div>

        {totals.map((item) => {
          const odds = getOdds(item.key, 'back', item.odds);

          return (
            <React.Fragment key={item.key}>
              <div className={nameCell}>{item.name}</div>
              {renderButton(item.name, odds)}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className='w-full bg-[#f5f5f5] p-1'>
      {/* Top two tables */}
      <div className='grid grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2'>
        {renderBackLayTable(players, true)}
        {renderOddEvenTable()}
      </div>

      {/* Middle two tables */}
      <div className='mt-1.5 grid grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2'>
        {renderBackLayTable(patterns)}
        {renderTotalsTable()}
      </div>

      {/* Number section */}
      <div className='mt-1.5'>
        <div className='flex h-[29px] items-center justify-center border border-[#c8c8c8] bg-[#f1f1f1] text-[14px] font-bold text-[#333] sm:h-[32px] sm:text-[16px]'>
          {getOdds('numberMarket', 'back', '9.5')}
        </div>

        <div className='grid grid-cols-5'>
          {numbers.map((number) => {
            const odds = getOdds(`number${number}`, 'back', '9.5');

            return (
              <button
                type='button'
                key={number}
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(`Number ${number}`, odds, 'back', isMobile)
                }
                className='flex h-[42px] items-center justify-center border border-[#c8c8c8] bg-[#72b9e8] text-[30px] leading-none font-bold text-[#30343a] hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[48px] sm:text-[36px]'
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Table3cardj({ isMobile, isSuspended, openBetSlip, markets }) {
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

  const rows = [
    {
      label: 'Yes',
      odds: markets?.yes?.back || '1.78',
      bg: '#72b9e8',
    },
    {
      label: 'No',
      odds: markets?.no?.back || '1.84',
      bg: '#f5a5b8',
    },
  ];

  const renderCard = (value) => (
    <div className='flex aspect-[0.72] w-full flex-col justify-between border-2 border-yellow-400 bg-white p-[2px] sm:p-[3px]'>
      <span className='text-[clamp(15px,2.2vw,29px)] leading-none font-bold text-black'>
        {value}
      </span>

      <div className='grid grid-cols-2 text-[clamp(10px,1.5vw,19px)] leading-[0.9] font-bold'>
        <span className='text-black'>♠</span>
        <span className='text-center text-red-600'>♦</span>
        <span className='text-black'>♣</span>
        <span className='text-center text-red-600'>♥</span>
      </div>
    </div>
  );

  return (
    <div className='w-full overflow-hidden border border-[#c8c8c8] bg-white'>
      {rows.map((row) => (
        <div
          key={row.label}
          className='grid min-h-[105px] grid-cols-[76px_minmax(0,1fr)] border-b-2 border-black last:border-b-0 sm:min-h-[126px] sm:grid-cols-[124px_minmax(0,1fr)]'
          style={{ backgroundColor: row.bg }}
        >
          {/* YES / NO */}
          <div className='flex items-center justify-center border-r-2 border-black'>
            <span className='text-[14px] font-bold text-[#303030] sm:text-[18px]'>
              {row.label}
            </span>
          </div>

          {/* ODDS + CARDS */}
          <div className='flex min-w-0 flex-col items-center justify-center gap-2 px-1 py-2 sm:gap-3 sm:px-3'>
            <div className='text-[16px] leading-none font-bold text-[#333] sm:text-[22px]'>
              {isSuspended ? '0' : row.odds}
            </div>

            <div className='grid w-full max-w-[780px] grid-cols-[repeat(13,minmax(0,1fr))] gap-[3px] sm:gap-[5px]'>
              {cards.map((card) => (
                <button
                  key={`${row.label}-${card}`}
                  type='button'
                  disabled={isSuspended}
                  onClick={() =>
                    openBetSlip(
                      `${row.label} ${card}`,
                      row.odds,
                      'back',
                      isMobile
                    )
                  }
                  className='min-w-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {renderCard(card)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TableQueen({ isMobile, isSuspended, openBetSlip }) {
  const totals = [
    {
      label: 'Total 0',
      back: '0',
      lay: '0',
    },
    {
      label: 'Total 1',
      back: '0',
      lay: '0',
    },
    {
      label: 'Total 2',
      back: '2.44',
      lay: '2.56',
    },
    {
      label: 'Total 3',
      back: '1.65',
      lay: '1.69',
    },
  ];

  const renderOdds = (item, type) => {
    const odds = type === 'back' ? item.back : item.lay;

    return (
      <button
        type='button'
        disabled={isSuspended || Number(odds) <= 0}
        onClick={() => openBetSlip(item.label, odds, type, isMobile)}
        className={`flex h-[60px] w-full items-center justify-center text-[18px] font-bold text-[#263746] transition-all sm:h-[62px] sm:text-[22px] ${
          type === 'back'
            ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
            : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
        } ${
          isSuspended || Number(odds) <= 0
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer'
        }`}
      >
        {isSuspended ? '0' : odds}
      </button>
    );
  };

  return (
    <div className='w-full bg-white'>
      {/* Queen Bottom Place Bet Section */}
      <div className='grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-3'>
        {totals.map((item) => (
          <div key={item.label} className='min-w-0 bg-[#f5f5f5]'>
            {/* Total Heading */}
            <div className='flex h-[32px] items-center justify-center text-[17px] font-bold text-[#333] sm:text-[20px]'>
              {item.label}
            </div>

            {/* Back & Lay */}
            <div className='grid grid-cols-2 gap-1.5'>
              {renderOdds(item, 'back')}

              {renderOdds(item, 'lay')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableTrap({ isMobile, isSuspended, openBetSlip }) {
  return (
    <div className='casino-table trap'>
      <div className='casino-table-box rounded border p-3 text-center'>
        <h5 className='fw-bold mb-3'>The Trap - Escape Duel</h5>

        {/* Core Inside vs Outside vs Trap Hit */}
        <div className='row g-3 mb-3'>
          <div className='col-4'>
            <div
              className={`card-odd-box rounded border bg-white p-3 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () =>
                      openBetSlip(
                        'Inside (Between Limits)',
                        '2.00',
                        'back',
                        isMobile
                      )
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold'>Inside</div>
              <div className='small text-muted'>Falls Between</div>
              <div className='casino-odds text-primary fs-5'>
                {isSuspended ? '0' : '2.00'}
              </div>
            </div>
          </div>
          <div className='col-4'>
            <div
              className={`card-odd-box rounded border bg-white p-3 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () =>
                      openBetSlip(
                        'Outside (Beyond Limits)',
                        '2.00',
                        'back',
                        isMobile
                      )
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold'>Outside</div>
              <div className='small text-muted'>Falls Outside</div>
              <div className='casino-odds text-primary fs-5'>
                {isSuspended ? '0' : '2.00'}
              </div>
            </div>
          </div>
          <div className='col-4'>
            <div
              className={`card-odd-box bg-warning bg-opacity-25 border-warning rounded border p-3 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () =>
                      openBetSlip(
                        'Trap Hit (Exact Match)',
                        '15.00',
                        'back',
                        isMobile
                      )
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold text-danger'>Trap Hit</div>
              <div className='small text-muted'>Matches Limit</div>
              <div className='casino-odds text-danger fs-5'>
                {isSuspended ? '0' : '15.00'}
              </div>
            </div>
          </div>
        </div>

        {/* Seven Up-Down Trap Box */}
        <div className='seven-up-down-box bg-light mb-2 rounded border p-2'>
          <h6 className='fw-bold text-muted mb-2'>The Trap 7 High/Low</h6>
          <div className='row g-2'>
            <div className='col-4'>
              <div
                className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
                onClick={
                  isSuspended
                    ? undefined
                    : () => openBetSlip('Down (< 7)', '2.00', 'back', isMobile)
                }
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <div className='fw-bold'>Down (&lt; 7)</div>
                <div className='casino-odds'>{isSuspended ? '0' : '2.00'}</div>
              </div>
            </div>
            <div className='col-4'>
              <div
                className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
                onClick={
                  isSuspended
                    ? undefined
                    : () =>
                        openBetSlip(
                          'Trap Seven (= 7)',
                          '12.00',
                          'back',
                          isMobile
                        )
                }
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <div className='fw-bold text-danger'>Trap Seven (= 7)</div>
                <div className='casino-odds text-danger'>
                  {isSuspended ? '0' : '12.00'}
                </div>
              </div>
            </div>
            <div className='col-4'>
              <div
                className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
                onClick={
                  isSuspended
                    ? undefined
                    : () => openBetSlip('Up (> 7)', '2.00', 'back', isMobile)
                }
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <div className='fw-bold'>Up (&gt; 7)</div>
                <div className='casino-odds'>{isSuspended ? '0' : '2.00'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableNotenum({ isMobile, isSuspended, openBetSlip }) {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className='casino-table notenum'>
      <div className='casino-table-box rounded border p-3 text-center'>
        <h5 className='fw-bold mb-3'>Note Number (Ending Digit 0 - 9)</h5>

        {/* Digits 0-9 */}
        <div className='d-flex justify-content-center mb-3 flex-wrap gap-2'>
          {digits.map((n) => (
            <div
              key={n}
              className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () => openBetSlip(`Number ${n}`, '9.50', 'back', isMobile)
              }
              style={{
                cursor: isSuspended ? 'not-allowed' : 'pointer',
                minWidth: '55px',
              }}
            >
              <div className='casino-odds'>{isSuspended ? '0' : '9.50'}</div>
              <div className='fw-bold h5 mb-0'>{n}</div>
            </div>
          ))}
        </div>

        {/* Odd/Even, Low/High */}
        <div className='row g-2 justify-content-center'>
          <div className='col-md-3 col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () => openBetSlip('Even Digit', '1.95', 'back', isMobile)
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold'>Even</div>
              <div className='casino-odds'>{isSuspended ? '0' : '1.95'}</div>
            </div>
          </div>
          <div className='col-md-3 col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () => openBetSlip('Odd Digit', '1.95', 'back', isMobile)
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold'>Odd</div>
              <div className='casino-odds'>{isSuspended ? '0' : '1.95'}</div>
            </div>
          </div>
          <div className='col-md-3 col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () => openBetSlip('Low (0-4)', '1.95', 'back', isMobile)
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold'>Low (0-4)</div>
              <div className='casino-odds'>{isSuspended ? '0' : '1.95'}</div>
            </div>
          </div>
          <div className='col-md-3 col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () => openBetSlip('High (5-9)', '1.95', 'back', isMobile)
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold'>High (5-9)</div>
              <div className='casino-odds'>{isSuspended ? '0' : '1.95'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableDum10({ isMobile, isSuspended, openBetSlip }) {
  const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className='casino-table dum10'>
      <div className='casino-table-box rounded border p-3 text-center'>
        <h5 className='fw-bold mb-3'>10 Dosh / Dum 10 (Pick 1 to 10)</h5>

        {/* Card 1 to 10 Grid */}
        <div className='d-flex justify-content-center mb-3 flex-wrap gap-2'>
          {cards.map((c) => (
            <div
              key={c}
              className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () => openBetSlip(`Card ${c}`, '9.50', 'back', isMobile)
              }
              style={{
                cursor: isSuspended ? 'not-allowed' : 'pointer',
                minWidth: '60px',
              }}
            >
              <div className='casino-odds'>{isSuspended ? '0' : '9.50'}</div>
              <div className='fw-bold h5 mb-0'>{c}</div>
            </div>
          ))}
        </div>

        {/* Low/High, Even/Odd, Red/Black */}
        <div className='row g-2 justify-content-center'>
          <div className='col-md-3 col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () => openBetSlip('Low (1-5)', '1.95', 'back', isMobile)
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold'>Low (1-5)</div>
              <div className='casino-odds'>{isSuspended ? '0' : '1.95'}</div>
            </div>
          </div>
          <div className='col-md-3 col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () => openBetSlip('High (6-10)', '1.95', 'back', isMobile)
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold'>High (6-10)</div>
              <div className='casino-odds'>{isSuspended ? '0' : '1.95'}</div>
            </div>
          </div>
          <div className='col-md-3 col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () => openBetSlip('Even Cards', '1.95', 'back', isMobile)
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold'>Even</div>
              <div className='casino-odds'>{isSuspended ? '0' : '1.95'}</div>
            </div>
          </div>
          <div className='col-md-3 col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-2 ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () => openBetSlip('Odd Cards', '1.95', 'back', isMobile)
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold'>Odd</div>
              <div className='casino-odds'>{isSuspended ? '0' : '1.95'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableCmeter1({ isMobile, isSuspended, openBetSlip, markets }) {
  // API response se markets extract karo
  const rawMarkets = Array.isArray(markets?.data?.sub)
    ? markets.data.sub
    : Array.isArray(markets?.sub)
      ? markets.sub
      : Array.isArray(markets)
        ? markets
        : markets && typeof markets === 'object'
          ? Object.values(markets).filter(
              (item) =>
                item && typeof item === 'object' && item.sid != null && item.nat
            )
          : [];

  // Duplicate SID remove
  const uniqueMarkets = [
    ...new Map(
      rawMarkets
        .filter((market) => market?.sid != null)
        .map((market) => [String(market.sid), market])
    ).values(),
  ];

  const fighters = uniqueMarkets
    .filter((market) => ['1', '2'].includes(String(market.sid)))
    .sort((a, b) => Number(a.sid) - Number(b.sid));

  const BoxingGlove = ({ reverse = false }) => (
    <svg
      width='42'
      height='42'
      viewBox='0 0 48 48'
      fill='white'
      className={`shrink-0 ${reverse ? 'scale-x-[-1]' : ''}`}
    >
      <path d='M14 22V12a3.5 3.5 0 0 1 7 0v7-11a3.5 3.5 0 0 1 7 0v11-9a3.5 3.5 0 0 1 7 0v11-5a3.5 3.5 0 0 1 7 0v15c0 10-6 15-16 15h-5c-6 0-10-3-13-9l-5-10a4 4 0 0 1 7-4l4 6v-7Z' />
      <path d='M10 36h27v7H14a8 8 0 0 1-4-7Z' fill='white' opacity='.8' />
    </svg>
  );

  const placeBet = (market) => {
    const status = String(market.gstatus || '').toUpperCase();
    const suspended = status ? status !== 'OPEN' : Boolean(isSuspended);

    const odds = Number(market.b);

    if (
      suspended ||
      market.b === undefined ||
      market.b === null ||
      market.b === '' ||
      !Number.isFinite(odds) ||
      odds <= 0
    ) {
      return;
    }

    openBetSlip(market.nat, String(market.b), 'back', isMobile);
  };

  return (
    <div className='w-full bg-[#f1f1f1] p-1'>
      <div className='grid grid-cols-2 gap-1.5'>
        {fighters.map((market, index) => {
          const status = String(market.gstatus || '').toUpperCase();

          const suspended = status ? status !== 'OPEN' : Boolean(isSuspended);

          const hasOdds =
            market.b !== undefined && market.b !== null && market.b !== '';

          const disabled = suspended || !hasOdds || Number(market.b) <= 0;

          return (
            <button
              key={market.sid}
              type='button'
              disabled={disabled}
              onClick={() => placeBet(market)}
              className={`relative flex min-h-[76px] items-center justify-center gap-2 border-[3px] px-2 py-3 text-[#263746] shadow-sm transition-colors ${
                index === 0 ? 'border-[#ff3b43]' : 'border-[#ffdc00]'
              } ${
                suspended
                  ? 'cursor-not-allowed bg-[#414c55]'
                  : 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
              }`}
            >
              {suspended && (
                <span className='absolute inset-0 z-10 flex items-center justify-center bg-[#414c55]/20'>
                  <svg width='27' height='29' viewBox='0 0 24 24' fill='white'>
                    <path d='M18 9h-1V7a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2ZM9 7a3 3 0 0 1 6 0v2H9V7Z' />
                  </svg>
                </span>
              )}

              {index === 0 && <BoxingGlove />}

              <span className='text-lg font-extrabold sm:text-2xl'>
                {market.nat}
              </span>

              {index === 1 && <BoxingGlove reverse />}
            </button>
          );
        })}
      </div>

      {fighters.length === 0 && (
        <div className='py-4 text-center text-sm font-semibold text-gray-500'>
          No markets available
        </div>
      )}
    </div>
  );
}

export const TABLES = {
  poker: TablePoker,
  poker20: TablePoker20,
  poker6: TablePoker6,
  card32: TableCard32,
  pcard32: TableCard32,
  card32eu: TableCard32eu,
  '3cardj': Table3cardj,
  queen: TableQueen,
  trap: TableTrap,
  notenum: TableNotenum,
  dum10: TableDum10,
  cmeter1: TableCmeter1,
};

export default TABLES;
