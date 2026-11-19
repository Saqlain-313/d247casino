import { normalizeSelection } from '../../../context/CasinoContext';

function TableDolidana({ isMobile, isSuspended, openBetSlip, markets }) {
  const playerOdds = [
    {
      name: 'Player A',
      odds: markets?.playerA?.back || '1.97',
      stake: '500000',
    },
    {
      name: 'Player B',
      odds: markets?.playerB?.back || '1.97',
      stake: '500000',
    },
  ];

  const particularPairs = [
    { name: '1-1 Pair', odds: '29.5' },
    { name: '2-2 Pair', odds: '29.5' },
    { name: '3-3 Pair', odds: '29.5' },
    { name: '4-4 Pair', odds: '29.5' },
    { name: '5-5 Pair', odds: '29.5' },
    { name: '6-6 Pair', odds: '29.5' },
  ];

  const sumOdds = [
    { sum: 2, odds: '29.8' },
    { sum: 3, odds: '15.4' },
    { sum: 4, odds: '10.6' },
    { sum: 5, odds: '8.2' },
    { sum: 6, odds: '6.76' },
    { sum: 7, odds: '5.8' },
    { sum: 8, odds: '6.76' },
    { sum: 9, odds: '8.2' },
    { sum: 10, odds: '10.6' },
    { sum: 11, odds: '15.4' },
    { sum: 12, odds: '29.8' },
  ];

  const placeBet = (name, odds) => {
    if (!isSuspended) {
      openBetSlip(name, odds, 'back', isMobile);
    }
  };

  const OddsButton = ({ name, odds, className = '' }) => (
    <button
      type='button'
      disabled={isSuspended}
      onClick={() => placeBet(name, odds)}
      className={`flex min-w-0 items-center justify-center rounded-md bg-[#72b9e8] font-bold text-[#263746] transition-colors ${
        isSuspended
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:bg-[#5da9dc]'
      } ${className}`}
    >
      {isSuspended ? '0' : odds}
    </button>
  );

  return (
    <div className='w-full space-y-2 bg-white text-[#333]'>
      {/* TOP MARKETS */}
      <div className='grid grid-cols-1 gap-2 lg:grid-cols-[1.35fr_0.65fr_1.15fr_1.5fr]'>
        {/* PLAYER A / PLAYER B */}
        <div className='overflow-hidden border border-[#d1d1d1] bg-[#f4f4f4]'>
          {playerOdds.map((player) => (
            <div
              key={player.name}
              className='grid min-h-[58px] grid-cols-[minmax(0,1fr)_80px] border-b border-[#c9c9c9] last:border-b-0'
            >
              <div className='flex items-center px-3 text-lg font-extrabold'>
                {player.name}
              </div>

              <button
                type='button'
                disabled={isSuspended}
                onClick={() => placeBet(player.name, player.odds)}
                className={`flex flex-col items-center justify-center bg-[#72b9e8] text-[#263746] ${
                  isSuspended
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:bg-[#5da9dc]'
                }`}
              >
                <span className='text-lg font-extrabold'>
                  {isSuspended ? '0' : player.odds}
                </span>
                <span className='text-xs font-medium'>{player.stake}</span>
              </button>
            </div>
          ))}
        </div>

        {/* ANY PAIR */}
        <div className='flex flex-col items-center justify-center rounded-md bg-[#eeeeee] p-2'>
          <div className='mb-1 text-sm font-extrabold'>Any Pair</div>

          <OddsButton
            name='Any Pair'
            odds='5.75'
            className='min-h-[85px] w-full text-2xl'
          />
        </div>

        {/* ODD / EVEN */}
        <div className='grid grid-cols-2 gap-2 rounded-md bg-[#eeeeee] p-2'>
          {[
            { name: 'Odd', odds: '1.95' },
            { name: 'Even', odds: '1.95' },
          ].map((item) => (
            <div
              key={item.name}
              className='flex min-w-0 flex-col items-center justify-center'
            >
              <div className='mb-2 text-base font-extrabold'>{item.name}</div>

              <OddsButton
                name={item.name}
                odds={item.odds}
                className='min-h-[70px] w-full text-xl'
              />
            </div>
          ))}
        </div>

        {/* LESS THAN 7 / SEVEN / GREATER THAN 7 */}
        <div className='grid grid-cols-[1fr_80px_1fr] items-center gap-2 rounded-md bg-[#eeeeee] p-2'>
          <div className='flex min-w-0 flex-col items-center'>
            <div className='mb-2 text-base font-extrabold'>{'< 7'}</div>

            <OddsButton
              name='Less than 7'
              odds='2'
              className='min-h-[70px] w-full text-xl'
            />
          </div>

          <div className='flex items-center justify-center'>
            <div className='flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#ffcc16]'>
              <span
                className='text-[58px] leading-none font-black text-[#a90020]'
                style={{
                  WebkitTextStroke: '1.5px #222',
                  textShadow: '2px 2px 0 #222',
                }}
              >
                7
              </span>
            </div>
          </div>

          <div className='flex min-w-0 flex-col items-center'>
            <div className='mb-2 text-base font-extrabold'>{'> 7'}</div>

            <OddsButton
              name='Greater than 7'
              odds='2'
              className='min-h-[70px] w-full text-xl'
            />
          </div>
        </div>
      </div>

      {/* BOTTOM MARKETS */}
      <div className='grid grid-cols-1 gap-2 lg:grid-cols-[0.95fr_1.8fr]'>
        {/* PARTICULAR PAIR */}
        <div className='rounded-md bg-[#eeeeee] p-3'>
          <h3 className='mb-3 text-xl font-extrabold'>Particular Pair</h3>

          <div className='grid grid-cols-3 gap-x-2 gap-y-3'>
            {particularPairs.map((pair) => (
              <div key={pair.name} className='min-w-0'>
                <div className='mb-1 text-center text-sm font-bold'>
                  {pair.name}
                </div>

                <OddsButton
                  name={pair.name}
                  odds={pair.odds}
                  className='min-h-[58px] w-full text-xl'
                />
              </div>
            ))}
          </div>
        </div>

        {/* ODDS OF SUM TOTAL */}
        <div className='rounded-md bg-[#eeeeee] p-3'>
          <h3 className='mb-3 text-xl font-extrabold'>Odds of Sum Total</h3>

          {/* FIRST ROW: SUM 2 TO 7 */}
          <div className='grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-3 lg:grid-cols-6'>
            {sumOdds.slice(0, 6).map((item) => (
              <div key={item.sum} className='min-w-0'>
                <div className='mb-1 text-center text-sm font-bold'>
                  Sum Total {item.sum}
                </div>

                <OddsButton
                  name={`Sum Total ${item.sum}`}
                  odds={item.odds}
                  className='min-h-[58px] w-full text-xl'
                />
              </div>
            ))}
          </div>

          {/* SECOND ROW: SUM 8 TO 12 */}
          <div className='mt-3 grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-3 lg:mx-auto lg:max-w-[88%] lg:grid-cols-5'>
            {sumOdds.slice(6).map((item) => (
              <div key={item.sum} className='min-w-0'>
                <div className='mb-1 text-center text-sm font-bold'>
                  Sum Total {item.sum}
                </div>

                <OddsButton
                  name={`Sum Total ${item.sum}`}
                  odds={item.odds}
                  className='min-h-[58px] w-full text-xl'
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableGoal({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    { label: 'Cristiano Ronaldo', odds: '5.05', max: '1L' },
    { label: 'Lionel Messi', odds: '5.54', max: '1L' },
    { label: 'Robert Lewandowski', odds: '6.6', max: '1L' },
    { label: 'Neymar', odds: '7.63', max: '1L' },
    { label: 'Harry Kane', odds: '9.04', max: '1L' },
    { label: 'Zlatan Ibrahimovic', odds: '11.84', max: '50K' },
    { label: 'Romelu Lukaku', odds: '13.21', max: '50K' },
    { label: 'Kylian Mbappe', odds: '15.61', max: '50K' },
    { label: 'Erling Haaland', odds: '15.61', max: '50K' },
    { label: 'No Goal', odds: '38.16', stake: '30000', max: '25K' },
  ];

  const methods = [
    { label: 'Shot Goal', odds: '1.73' },
    { label: 'Header Goal', odds: '4.4' },
    { label: 'Penalty Goal', odds: '7.01' },
    { label: 'Free Kick Goal', odds: '11.45', max: '50K' },
    { label: 'No Goal', odds: '38.16', stake: '30000', max: '25K' },
  ];

  const renderMarket = (title, items, marketType) => (
    <div className='w-full min-w-0'>
      {/* Market Header */}
      <div className='bg-[#4b5b6b] px-2 py-2 text-[13px] font-bold text-white sm:text-[15px]'>
        {title}
      </div>

      {/* Column Header */}
      <div className='grid grid-cols-[minmax(0,1fr)_78px_95px] border-b border-gray-300 bg-[#f1f1f1] sm:grid-cols-[minmax(0,1fr)_90px_98px]'>
        <div />
        <div className='bg-[#72b9e8] py-1 text-center text-[12px] font-bold sm:text-[14px]'>
          Back
        </div>
        <div />
      </div>

      {/* Market Rows */}
      {items.map((item, index) => {
        const marketKey = item.key || normalizeSelection(item.label);
        const marketOdds = markets?.[marketKey]?.back;

        const odds = Number(marketOdds) > 0 ? marketOdds : item.odds;
        const stake = item.stake || '100000';
        const max = item.max || '1L';

        return (
          <div
            key={item.label}
            className='grid min-h-[43px] grid-cols-[minmax(0,1fr)_78px_95px] border-b border-[#c9c9c9] bg-[#f1f1f1] sm:grid-cols-[minmax(0,1fr)_90px_98px]'
          >
            {/* Name */}
            <div className='flex min-w-0 items-center px-2 py-1 text-[12px] sm:text-[14px]'>
              <span className='truncate'>{item.label}</span>
            </div>

            {/* Back Odds */}
            <button
              type='button'
              disabled={isSuspended}
              onClick={() =>
                !isSuspended && openBetSlip(item.label, odds, 'back', isMobile)
              }
              className={`flex min-w-0 flex-col items-center justify-center bg-[#72b9e8] text-[#263746] ${
                isSuspended
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:brightness-95'
              }`}
            >
              <span className='text-[14px] leading-tight font-bold sm:text-[17px]'>
                {isSuspended ? '0' : odds}
              </span>
              <span className='text-[10px] leading-tight'>{stake}</span>
              {isSuspended && (
                <span className='text-[8px] font-bold text-red-600'>
                  SUSPENDED
                </span>
              )}
            </button>

            {/* Min Max */}
            <div className='flex flex-col items-end justify-center pr-1 text-[10px] leading-[16px] font-bold text-[#0085a8] sm:pr-2 sm:text-[12px]'>
              <span>Min: 100</span>
              <span>Max: {max}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className='w-full min-w-0 overflow-hidden bg-white'>
      <div className='grid grid-cols-1 items-start gap-[3px] md:grid-cols-2'>
        {renderMarket('Who Will Goal Next?', players, 'players')}

        {renderMarket('Method Of Next Goal', methods, 'methods')}
      </div>
    </div>
  );
}

function TableSicbo2({ isMobile, isSuspended, openBetSlip, markets }) {
  const topBets = [
    { name: 'ODD', odds: '1:1' },
    { name: '4', odds: '50:1' },
    { name: '5', odds: '20:1' },
    { name: '6', odds: '15:1' },
    { name: '7', odds: '12:1' },
    { name: '8', odds: '8:1' },
    { name: '9', odds: '6:1' },
    { name: '10', odds: '6:1' },
    { name: 'ANY TRIPLE', odds: '30:1', span: true },
    { name: '11', odds: '6:1' },
    { name: '12', odds: '6:1' },
    { name: '13', odds: '8:1' },
    { name: '14', odds: '12:1' },
    { name: '15', odds: '15:1' },
    { name: '16', odds: '20:1' },
    { name: '17', odds: '50:1' },
    { name: 'EVEN', odds: '1:1' },
  ];

  const diceBets = [
    { name: '1', dice: [1] },
    { name: '2', dice: [2] },
    { name: '3', dice: [3] },
    { name: '4', dice: [4] },
    { name: '5', dice: [5] },
    { name: '6', dice: [6] },
    { name: '1-1', dice: [1, 1] },
    { name: '1-2', dice: [1, 2] },
    { name: '1-3', dice: [1, 3] },
    { name: '1-4', dice: [1, 4] },
    { name: '1-5', dice: [1, 5] },
    { name: '1-6', dice: [1, 6] },
    { name: '2-2', dice: [2, 2] },
    { name: '2-3', dice: [2, 3] },
    { name: '2-4', dice: [2, 4] },
    { name: '2-5', dice: [2, 5] },
    { name: '2-6', dice: [2, 6] },
    { name: '3-3', dice: [3, 3] },
  ];

  const twoDiceBets = [
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [1, 6],
    [2, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [2, 6],
    [3, 3],
    [3, 4],
    [3, 5],
    [3, 6],
    [4, 4],
    [4, 5],
    [4, 6],
    [5, 5],
    [5, 6],
    [6, 6],
  ];

  const pipPositions = {
    1: ['center'],
    2: ['top-left', 'bottom-right'],
    3: ['top-left', 'center', 'bottom-right'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: [
      'top-left',
      'top-right',
      'middle-left',
      'middle-right',
      'bottom-left',
      'bottom-right',
    ],
  };

  const positionClasses = {
    'top-left': 'top-[17%] left-[17%]',
    'top-right': 'top-[17%] right-[17%]',
    'middle-left': 'top-1/2 left-[17%] -translate-y-1/2',
    'middle-right': 'top-1/2 right-[17%] -translate-y-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-[17%] left-[17%]',
    'bottom-right': 'bottom-[17%] right-[17%]',
  };

  const placeBet = (name, odds) => {
    if (!isSuspended) {
      openBetSlip(name, odds, 'back', isMobile);
    }
  };

  const renderDie = (number, key, size = 'h-6 w-6') => (
    <div
      key={key}
      className={`relative shrink-0 rounded-[4px] bg-[#a90032] ${size}`}
    >
      {pipPositions[number].map((position, index) => (
        <span
          key={index}
          className={`absolute h-[4px] w-[4px] rounded-full bg-white ${
            positionClasses[position]
          }`}
        />
      ))}
    </div>
  );

  const BetBox = ({ name, odds, children, className = '', onClick }) => (
    <button
      type='button'
      disabled={isSuspended}
      onClick={onClick || (() => placeBet(name, odds))}
      className={`flex min-w-0 items-center justify-center rounded-md border border-[#c8c0bb] bg-[#bdb5af] text-center text-[#202033] transition-colors ${
        isSuspended
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer hover:bg-[#aaa29c]'
      } ${className}`}
    >
      {children || (
        <div className='flex flex-col items-center gap-0.5'>
          <span className='text-[12px] leading-tight font-semibold'>
            {name}
          </span>
          <span className='text-[13px] leading-tight font-extrabold'>
            {isSuspended ? '0' : odds}
          </span>
        </div>
      )}
    </button>
  );

  return (
    <div className='w-full overflow-x-auto rounded-md bg-[#f7f7f7] p-1'>
      <div className='min-w-[900px]'>
        {/* TOP PAYOUT LABELS */}
        <div className='mb-1 grid grid-cols-[66px_minmax(0,1fr)_66px] gap-1'>
          <div className='rounded-full bg-[#666] px-1.5 py-1 text-center text-[10px] leading-tight font-bold text-white'>
            1:1 Lose if Any Triple
          </div>

          <div className='flex justify-center'>
            <div className='w-[76px] rounded-full bg-[#666] py-1 text-center text-[11px] font-bold text-white'>
              30:1
            </div>
          </div>

          <div className='rounded-full bg-[#666] px-1.5 py-1 text-center text-[10px] leading-tight font-bold text-white'>
            1:1 Lose if Any Triple
          </div>
        </div>

        {/* MAIN NUMBERS */}
        <div className='grid grid-cols-[66px_minmax(0,1fr)_66px] gap-1'>
          <button
            type='button'
            disabled={isSuspended}
            onClick={() => placeBet('Small (4-10)', '1.98')}
            className='flex flex-col items-center justify-center gap-1 rounded-md border border-[#c8c0bb] bg-[#bdb5af] text-[#202033]'
          >
            <span className='text-[14px] font-extrabold'>SMALL</span>
            <span className='text-[14px] font-bold'>4-10</span>
            <span className='text-[12px] font-bold'>
              {isSuspended ? '0' : '1:1'}
            </span>
          </button>

          <div className='grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1'>
            {topBets.map((bet) => (
              <BetBox
                key={bet.name}
                name={bet.name}
                odds={bet.odds}
                className={`h-[58px] px-0.5 ${bet.span ? 'col-span-2' : ''}`}
              />
            ))}
          </div>

          <button
            type='button'
            disabled={isSuspended}
            onClick={() => placeBet('Big (11-17)', '1.98')}
            className='flex flex-col items-center justify-center gap-1 rounded-md border border-[#c8c0bb] bg-[#bdb5af] text-[#202033]'
          >
            <span className='text-[14px] font-extrabold'>BIG</span>
            <span className='text-[14px] font-bold'>11-17</span>
            <span className='text-[12px] font-bold'>
              {isSuspended ? '0' : '1:1'}
            </span>
          </button>

          {/* PAYOUT GROUPS */}
          <div />

          <div className='grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1'>
            {[
              { label: '1:1 on Single', span: 1 },
              { label: '2:1 on Double', span: 1 },
              { label: '3:1 on Triple', span: 1 },
              { label: '8:1 Each Double', span: 6 },
              { label: '150:1 Each Triple', span: 9 },
            ].map((item) => (
              <div
                key={item.label}
                style={{ gridColumn: `span ${item.span}` }}
                className='flex h-[25px] items-center justify-center rounded-full bg-[#666] px-1 text-center text-[10px] font-bold text-white'
              >
                {item.label}
              </div>
            ))}
          </div>

          <div />

          {/* DICE COMBINATIONS */}
          <div />

          <div className='grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1'>
            {diceBets.map((bet) => (
              <BetBox
                key={bet.name}
                name={bet.name}
                odds='8:1'
                className='h-[48px] flex-row gap-0.5 px-0.5'
              >
                <div className='flex items-center gap-0.5'>
                  {bet.dice.map((die, index) =>
                    renderDie(die, index, 'h-5 w-5')
                  )}
                </div>
              </BetBox>
            ))}
          </div>

          <div />
        </div>

        {/* TWO DICE */}
        <div className='mx-auto mt-3 max-w-[650px]'>
          <div className='mb-1 rounded-full bg-[#666] py-1 text-center text-[11px] font-bold text-white'>
            5:1 Two Dice
          </div>

          <div className='grid grid-cols-15 gap-1'>
            {twoDiceBets.map((pair, index) => (
              <BetBox
                key={`${pair[0]}-${pair[1]}-${index}`}
                name={`Two Dice ${pair[0]}-${pair[1]}`}
                odds='5:1'
                className='min-h-[52px] flex-col gap-0.5 p-1'
              >
                <div className='flex flex-col gap-0.5'>
                  {renderDie(pair[0], 'first', 'h-5 w-5')}
                  {renderDie(pair[1], 'second', 'h-5 w-5')}
                </div>
              </BetBox>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableSicbo({ isMobile, isSuspended, openBetSlip, markets }) {
  const bets = [
    {
      name: 'Small',
      range: '4 - 10',
      odds: '1.98',
      subtitle: 'Lose to Any Triple',
      onClick: () => openBetSlip('Small (4-10)', '1.98', 'back', isMobile),
    },
    {
      name: 'Big',
      range: '11 - 17',
      odds: '1.98',
      subtitle: 'Lose to Any Triple',
      onClick: () => openBetSlip('Big (11-17)', '1.98', 'back', isMobile),
    },
  ];

  return (
    <div className='w-full'>
      <div className='grid grid-cols-2 gap-2 sm:gap-3'>
        {bets.map((bet) => (
          <button
            key={bet.name}
            type='button'
            disabled={isSuspended}
            onClick={bet.onClick}
            className={`min-w-0 rounded-lg border border-[#d1d5d9] bg-white p-3 text-center transition-colors ${
              isSuspended
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:border-[#72b9e8]'
            }`}
          >
            <div className='mb-2 text-[13px] font-bold text-[#4b5b6b] sm:text-sm'>
              {bet.name} ({bet.range})
            </div>

            <div className='mb-2 text-[11px] text-[#7b8794]'>
              {bet.subtitle}
            </div>

            <div className='rounded-md bg-[#72b9e8] px-2 py-2 text-base font-bold text-[#263746]'>
              {isSuspended ? '0' : bet.odds}
            </div>
          </button>
        ))}
      </div>

      <div className='mt-3 flex justify-center'>
        <button
          type='button'
          disabled={isSuspended}
          onClick={() => openBetSlip('Any Triple', '31.0', 'back', isMobile)}
          className={`w-full max-w-[220px] rounded-lg border border-[#d1d5d9] bg-white p-3 text-center transition-colors ${
            isSuspended
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer hover:border-[#72b9e8]'
          }`}
        >
          <div className='mb-2 text-sm font-bold text-[#4b5b6b]'>
            Any Triple
          </div>

          <div className='rounded-md bg-[#72b9e8] px-2 py-2 text-base font-bold text-[#263746]'>
            {isSuspended ? '0' : '31.0'}
          </div>
        </button>
      </div>
    </div>
  );
}

function TableBallbyball({ isMobile, isSuspended, openBetSlip }) {
  const groups = [
    [
      { label: '0 Runs', odds: '2.50', min: '50', max: '25K' },
      { label: '3 Runs', odds: '12.00', min: '50', max: '25K' },
      { label: 'Boundary', odds: '5.50', min: '50', max: '25K' },
    ],
    [
      { label: '1 Runs', odds: '2.20', min: '50', max: '25K' },
      { label: '4 Runs', odds: '5.50', min: '50', max: '25K' },
      { label: 'Wicket', odds: '4.00', min: '50', max: '25K' },
    ],
    [
      { label: '2 Runs', odds: '4.50', min: '50', max: '25K' },
      { label: '6 Runs', odds: '8.00', min: '50', max: '20K' },
      { label: 'Extra Runs', odds: '6.00', min: '50', max: '25K' },
    ],
  ];

  const message =
    'Results are based on stream only. Score board may be different or updated later.';

  const LockIcon = () => (
    <svg
      width='22'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      className='mx-auto'
    >
      <path
        d='M7 10V7a5 5 0 0 1 10 0v3'
        stroke='white'
        strokeWidth='3.5'
        strokeLinecap='round'
      />
      <rect x='4' y='9' width='16' height='13' rx='2.5' fill='white' />
      <circle cx='12' cy='15' r='1.8' fill='#414c55' />
      <path
        d='M12 16v2'
        stroke='#414c55'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
    </svg>
  );

  return (
    <div className='w-full overflow-hidden bg-white'>
      <style>{`
        @keyframes ballbyball-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .ballbyball-marquee {
          display: flex;
          width: max-content;
          animation: ballbyball-marquee 18s linear infinite;
        }

        .ballbyball-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* HEADER */}
      <div className='bg-[#4b5968] px-2 py-2 text-[15px] font-bold text-white'>
        Runs
      </div>

      {/* RUNS TABLE */}
      <div className='grid grid-cols-1 gap-1 md:grid-cols-3 md:gap-2'>
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className='min-w-0'>
            {/* BACK HEADER */}
            <div className='grid grid-cols-[minmax(0,1fr)_82px_105px] border-b border-[#c9c9c9] bg-[#f1f1f1]'>
              <div />
              <div className='bg-[#72b9e8] py-2 text-center text-sm font-bold text-[#263746]'>
                Back
              </div>
              <div />
            </div>

            {/* OUTCOME ROWS */}
            {group.map((item) => (
              <div
                key={item.label}
                className='grid min-h-[50px] grid-cols-[minmax(0,1fr)_82px_105px] border-b border-[#c9c9c9] bg-[#f1f1f1]'
              >
                <div className='flex items-center px-2 text-[14px] font-medium text-[#333]'>
                  {item.label}
                </div>

                <button
                  type='button'
                  disabled={isSuspended}
                  onClick={() =>
                    !isSuspended &&
                    openBetSlip(item.label, item.odds, 'back', isMobile)
                  }
                  className={`flex items-center justify-center bg-[#414c55] ${
                    isSuspended
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer hover:bg-[#34404a]'
                  }`}
                >
                  {isSuspended ? (
                    <LockIcon />
                  ) : (
                    <span className='text-sm font-bold text-white'>
                      {item.odds}
                    </span>
                  )}
                </button>

                <div className='flex flex-col items-end justify-center px-2 text-[13px] leading-5 font-bold text-[#00819a]'>
                  <span>Min: {item.min}</span>
                  <span>Max: {item.max}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* INFINITE SCROLLING FOOTER */}
      <div className='mt-1 flex h-[44px] items-center overflow-hidden bg-[#087343] text-white'>
        <div className='z-10 flex h-full shrink-0 items-center px-4'>
          <svg width='27' height='27' viewBox='0 0 24 24' fill='none'>
            <path
              d='M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-4.7A8.5 8.5 0 1 1 21 11.5Z'
              stroke='white'
              strokeWidth='1.7'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>

        <div className='min-w-0 flex-1 overflow-hidden'>
          <div className='ballbyball-marquee'>
            {[0, 1, 2, 3].map((item) => (
              <span
                key={item}
                className='px-8 text-[13px] font-bold whitespace-nowrap'
              >
                {message}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableCmatch20({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className='casino-table cmatch20'>
      <div className='casino-table-box rounded border p-3'>
        <h5 className='fw-bold mb-3 text-center'>
          Cricket Match 20-20 (Batsman vs Bowler)
        </h5>

        {/* Main Duel: Batsman vs Bowler */}
        <div className='row mb-3'>
          <div className='col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-3 text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () =>
                      openBetSlip(
                        'Batsman (Runs >= 11)',
                        '1.95',
                        'back',
                        isMobile
                      )
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold'>Batsman (Runs &ge; 11)</div>
              <div className='casino-odds text-primary fs-5'>
                {isSuspended ? '0' : '1.95'}
              </div>
            </div>
          </div>
          <div className='col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-3 text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () =>
                      openBetSlip(
                        'Bowler (Runs <= 10)',
                        '1.95',
                        'back',
                        isMobile
                      )
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='fw-bold'>Bowler (Runs &le; 10)</div>
              <div className='casino-odds text-primary fs-5'>
                {isSuspended ? '0' : '1.95'}
              </div>
            </div>
          </div>
        </div>

        {/* Side Markets: Over Total & Boundary / Wicket */}
        <div className='row g-2'>
          <div className='col-md-3 col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-2 text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () =>
                      openBetSlip('Runs Over 10.5', '1.90', 'back', isMobile)
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='small text-muted'>Total Over Runs</div>
              <div className='fw-bold'>Over 10.5</div>
              <div className='casino-odds'>{isSuspended ? '0' : '1.90'}</div>
            </div>
          </div>
          <div className='col-md-3 col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-2 text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () =>
                      openBetSlip('Runs Under 10.5', '1.90', 'back', isMobile)
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='small text-muted'>Total Over Runs</div>
              <div className='fw-bold'>Under 10.5</div>
              <div className='casino-odds'>{isSuspended ? '0' : '1.90'}</div>
            </div>
          </div>
          <div className='col-md-3 col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-2 text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () =>
                      openBetSlip(
                        'Boundary In Over (YES)',
                        '1.65',
                        'back',
                        isMobile
                      )
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='small text-muted'>Boundary In Over</div>
              <div className='fw-bold'>YES</div>
              <div className='casino-odds'>{isSuspended ? '0' : '1.65'}</div>
            </div>
          </div>
          <div className='col-md-3 col-6'>
            <div
              className={`card-odd-box rounded border bg-white p-2 text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                isSuspended
                  ? undefined
                  : () =>
                      openBetSlip(
                        'Wicket In Over (YES)',
                        '2.20',
                        'back',
                        isMobile
                      )
              }
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className='small text-muted'>Wicket In Over</div>
              <div className='fw-bold'>YES</div>
              <div className='casino-odds'>{isSuspended ? '0' : '2.20'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableRace20({ isMobile, isSuspended, openBetSlip }) {
  const kings = [
    {
      id: 'spade',
      name: 'Spade King',
      symbol: '♠',
      color: '#111111',
      oddsYes: '3.75',
      oddsNo: '1.25',
    },
    {
      id: 'heart',
      name: 'Heart King',
      symbol: '♥',
      color: '#e53935',
      oddsYes: '3.75',
      oddsNo: '1.25',
    },
    {
      id: 'club',
      name: 'Club King',
      symbol: '♣',
      color: '#111111',
      oddsYes: '3.75',
      oddsNo: '1.25',
    },
    {
      id: 'diamond',
      name: 'Diamond King',
      symbol: '♦',
      color: '#e53935',
      oddsYes: '3.75',
      oddsNo: '1.25',
    },
  ];

  const renderOdds = (king, type) => {
    const odds = type === 'back' ? king.oddsYes : king.oddsNo;

    return (
      <button
        key={type}
        type='button'
        disabled={isSuspended}
        onClick={() =>
          openBetSlip(
            `${king.name} ${type === 'back' ? 'YES' : 'NO'}`,
            odds,
            type,
            isMobile
          )
        }
        className={`flex h-[52px] w-full items-center justify-center text-[17px] font-bold text-[#263746] transition-colors sm:h-[58px] sm:text-[21px] ${
          type === 'back'
            ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
            : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
        } ${isSuspended ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        {isSuspended ? '0' : odds}
      </button>
    );
  };

  return (
    <div className='w-full bg-white'>
      <div className='grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-3'>
        {kings.map((king) => (
          <div key={king.id} className='min-w-0 bg-[#f5f5f5]'>
            {/* King Name */}
            <div className='flex h-[30px] items-center justify-center gap-1 text-[15px] font-bold text-[#333] sm:text-[19px]'>
              <span style={{ color: king.color }}>{king.symbol}</span>
              {king.name}
            </div>

            {/* Back / Lay */}
            <div className='grid grid-cols-2 gap-1'>
              {renderOdds(king, 'back')}
              {renderOdds(king, 'lay')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableRace17({ isMobile, isSuspended, openBetSlip }) {
  const markets = [
    {
      id: 'race17',
      name: 'Race to 17',
      back: '1.45',
      lay: '1.49',
    },
    {
      id: 'bigCard',
      name: 'Big Card (7,8,9) - 4',
      back: '4.28',
      lay: '4.63',
    },
    {
      id: 'zeroCard',
      name: 'Zero Card - 4',
      back: '3.15',
      lay: '3.38',
    },
    {
      id: 'anyZero',
      name: 'Any Zero',
      back: null,
      lay: null,
      locked: true,
    },
  ];

  const renderOdds = (market, type) => {
    const odds = type === 'back' ? market.back : market.lay;
    const locked = isSuspended || market.locked;

    return (
      <button
        key={type}
        type='button'
        disabled={locked}
        onClick={() => {
          if (!locked && odds) {
            openBetSlip(market.name, odds, type, isMobile);
          }
        }}
        className={`flex h-[52px] w-full items-center justify-center text-[17px] font-bold text-[#263746] transition-colors sm:h-[58px] sm:text-[21px] ${
          type === 'back'
            ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
            : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
        } ${
          locked
            ? 'cursor-not-allowed bg-[#414c55] text-white opacity-100'
            : 'cursor-pointer'
        }`}
      >
        {locked ? (
          <svg
            viewBox='0 0 24 24'
            className='h-5 w-5 fill-current'
            aria-hidden='true'
          >
            <path d='M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm3 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z' />
          </svg>
        ) : (
          odds
        )}
      </button>
    );
  };

  return (
    <div className='w-full bg-white'>
      <div className='grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-3'>
        {markets.map((market) => (
          <div key={market.id} className='min-w-0 bg-[#f5f5f5]'>
            {/* Market Heading */}
            <div className='flex h-[30px] items-center justify-center px-1 text-center text-[13px] font-bold whitespace-nowrap text-[#333] sm:text-[17px]'>
              {market.name}
            </div>

            {/* Back / Lay Odds */}
            <div className='grid grid-cols-2 gap-1'>
              {renderOdds(market, 'back')}
              {renderOdds(market, 'lay')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableRace2({ isMobile, isSuspended, openBetSlip }) {
  const players = [
    {
      id: 'A',
      name: 'Player A',
      back: null,
      lay: null,
      locked: true,
    },
    {
      id: 'B',
      name: 'Player B',
      back: '3.33',
      lay: '3.67',
    },
    {
      id: 'C',
      name: 'Player C',
      back: '1.62',
      lay: '1.67',
    },
    {
      id: 'D',
      name: 'Player D',
      back: '9.1',
      lay: '10.5',
    },
  ];

  const renderOdds = (player, type) => {
    const odds = type === 'back' ? player.back : player.lay;
    const locked = isSuspended || player.locked;

    return (
      <button
        key={type}
        type='button'
        disabled={locked}
        onClick={() => {
          if (!locked && odds) {
            openBetSlip(player.name, odds, type, isMobile);
          }
        }}
        className={`flex h-[52px] w-full items-center justify-center text-[17px] font-bold transition-colors sm:h-[58px] sm:text-[21px] ${
          type === 'back'
            ? 'bg-[#72b9e8] text-[#263746] hover:bg-[#5da9dc]'
            : 'bg-[#f5a5b8] text-[#263746] hover:bg-[#ed91a7]'
        } ${
          locked
            ? type === 'back'
              ? 'cursor-not-allowed bg-[#414c55] text-white'
              : 'cursor-not-allowed bg-[#59494d] text-white'
            : 'cursor-pointer'
        }`}
      >
        {locked ? (
          <svg
            viewBox='0 0 24 24'
            className='h-5 w-5 fill-current'
            aria-hidden='true'
          >
            <path d='M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm3 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z' />
          </svg>
        ) : (
          odds
        )}
      </button>
    );
  };

  return (
    <div className='w-full bg-white'>
      <div className='grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-3'>
        {players.map((player) => (
          <div key={player.id} className='min-w-0 bg-[#f5f5f5]'>
            {/* Player Heading */}
            <div className='flex h-[30px] items-center justify-center text-[15px] font-bold text-[#333] sm:text-[19px]'>
              {player.name}
            </div>

            {/* Back and Lay */}
            <div className='grid grid-cols-2 gap-1'>
              {renderOdds(player, 'back')}
              {renderOdds(player, 'lay')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const TABLES = {
  dolidana: TableDolidana,
  goal: TableGoal,
  sicbo2: TableSicbo2,
  sicbo: TableSicbo,
  ballbyball: TableBallbyball,
  cmatch20: TableCmatch20,
  race20: TableRace20,
  race17: TableRace17,
  race2: TableRace2,
};

export default TABLES;
