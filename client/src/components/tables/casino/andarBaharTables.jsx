import { useCasino } from '../../../context/CasinoContext';

function TableAbChild({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const visibleSubs = subs.filter((s) => Number(s.visible) === 1);
  const active = visibleSubs[0] || subs[0];
  const child = [
    ...(Array.isArray(roundData?.child) ? roundData.child : []),
  ].sort((a, b) => Number(a.sr || 0) - Number(b.sr || 0));
  const rowSuspended = (isAndar) =>
    isSuspended ||
    !active ||
    String(active.gstatus || '').toUpperCase() !== 'OPEN' ||
    (isAndar && Number(active.sid) % 2 === 0);

  const renderRow = (type, offset, isAndar) => {
    const susp = rowSuspended(isAndar);
    return (
      <div
        className={
          isAndar
            ? `andar-box ${susp ? 'suspended-box' : ''}`
            : `bahar-box ${susp ? 'suspended-box' : ''}`
        }
      >
        <div className='ab-title'>{type}</div>
        <div className='ab-cards'>
          {Array.from({ length: 13 }, (_, e) => {
            const item = child[e + offset];
            const openCard = item && Number(item.l) > 0 && Number(item.b) === 1;
            return (
              <div className='card-odd-box' key={`${type}-${e}`}>
                <div className='casino-odds'>{item?.l ?? 0}</div>
                <div
                  style={{ cursor: openCard && !susp ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (openCard && !susp && active) {
                      openBetSlip(
                        `${item.nat}/${active.sid}`,
                        active.b,
                        'back',
                        isMobile
                      );
                    }
                  }}
                >
                  <img
                    src={`/assets/img/andar-bahar-cards/${openCard ? e + 1 : 0}.jpg`}
                    alt={openCard ? item.nat : 'back'}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        {renderRow('ANDAR', 0, true)}
        {renderRow('BAHAR', 13, false)}
      </div>
    </div>
  );
}

function TableAb4(props) {
  return <TableAbChild {...props} />;
}

function TableAb20({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = [...(Array.isArray(roundData?.sub) ? roundData.sub : [])]
    .filter((s) => !s.subtype || String(s.subtype).toLowerCase() === 'ab20')
    .sort((a, b) => Number(a.sr || 0) - Number(b.sr || 0));
  const aCards = String(roundData?.ares || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  const bCards = String(roundData?.bres || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  const renderBox = (title, dealtList, offset, cls) => (
    <div className={cls}>
      <div className='ab-title'>{title}</div>
      <div className='ab-cards'>
        {Array.from({ length: 13 }, (_, e) => {
          const m = subs[e + offset];
          const dealt =
            dealtList.length > 0 && dealtList[e] && dealtList[e] !== '0';
          const dead =
            isSuspended ||
            !m ||
            String(m.gstatus || '').toUpperCase() !== 'OPEN';
          return (
            <div className='card-odd-box' key={`${title}-${e}`}>
              {dealt ? (
                <div>
                  <img
                    src={`/assets/img/andar-bahar-cards/${dealtList[e]}.jpg`}
                    alt={m?.nat || String(e + 1)}
                  />
                </div>
              ) : (
                <div
                  className={dead ? 'suspended-box' : ''}
                  style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
                  onClick={() =>
                    !dead &&
                    m &&
                    openBetSlip(m.sid ?? m.nat, m.b, 'back', isMobile)
                  }
                >
                  <img
                    src={`/assets/img/andar-bahar-cards/${e + 1}.jpg`}
                    alt={m?.nat || String(e + 1)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        {renderBox('ANDAR', aCards, 0, 'andar-box')}
        {renderBox('BAHAR', bCards, 13, 'bahar-box')}
      </div>
    </div>
  );
}

function TableAbj({ isMobile, isSuspended, openBetSlip, markets }) {
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

  const defaultOdds = [
    '4',
    '4',
    '4',
    '4',
    '4',
    '4',
    '4',
    '2',
    '3',
    '4',
    '4',
    '3',
    '4',
  ];

  const renderCard = (card, type, index) => {
    const odds =
      markets?.[type.toLowerCase()]?.[card]?.back ||
      markets?.[type.toLowerCase()]?.back ||
      defaultOdds[index];

    return (
      <button
        key={`${type}-${card}`}
        type='button'
        disabled={isSuspended}
        onClick={() => openBetSlip(`${type} ${card}`, odds, 'back', isMobile)}
        className='flex min-w-0 flex-col items-center justify-center gap-[3px] bg-transparent p-0 disabled:cursor-not-allowed'
      >
        {/* Odds */}
        <span className='h-[19px] text-[12px] leading-[19px] font-bold text-[#333] sm:text-[15px]'>
          {isSuspended ? '0' : odds}
        </span>

        {/* Playing Card */}
        <div className='flex aspect-[0.72] w-full flex-col justify-between border-2 border-yellow-300 bg-white p-[2px] sm:p-[3px]'>
          <span className='text-left text-[clamp(12px,2vw,29px)] leading-none font-bold text-black'>
            {card}
          </span>

          <div className='flex justify-between text-[clamp(10px,1.5vw,21px)] leading-none font-bold'>
            <span className='text-black'>♠</span>
            <span className='text-red-600'>♦</span>
          </div>

          <div className='flex justify-between text-[clamp(10px,1.5vw,21px)] leading-none font-bold'>
            <span className='text-black'>♣</span>
            <span className='text-red-600'>♥</span>
          </div>
        </div>
      </button>
    );
  };

  const renderRow = (type, background) => (
    <div
      className='grid grid-cols-[10%_90%] items-center border-2 border-black'
      style={{ backgroundColor: background }}
    >
      {/* Row Label */}
      <div className='flex h-full items-center justify-center border-r-2 border-black'>
        <span className='text-[clamp(10px,1.5vw,22px)] font-bold text-[#333]'>
          {type}
        </span>
      </div>

      {/* Cards Grid */}
      <div className='mx-auto grid w-full max-w-[900px] grid-cols-13 items-center gap-[3px] px-1 py-2 sm:gap-[5px] sm:px-2'>
        {cards.map((card, index) => renderCard(card, type, index))}
      </div>
    </div>
  );

  return (
    <div className='w-full overflow-hidden bg-white'>
      {renderRow('ANDAR', '#fca3a3')}
      {renderRow('BAHAR', '#ffe59a')}
    </div>
  );
}

function TableAb3(props) {
  return <TableAbChild {...props} />;
}

export const TABLES = {
  ab4: TableAb4,
  ab3: TableAb3,
  ab20: TableAb20,
  abj: TableAbj,
};

export default TABLES;
