import { useCasino } from '../../../context/CasinoContext';

export default function Goal2Table() {
  const { roundData, isSuspended, openBetSlip } = useCasino();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1200;

  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const playersMarket = subs.filter(
    (s) => s.subtype === 'player' || (!s.subtype && Number(s.sid) <= 12)
  );
  const methodsMarket = subs.filter(
    (s) =>
      s.subtype === 'method' ||
      (!s.subtype && Number(s.sid) >= 21 && Number(s.sid) <= 25)
  );
  const combosMarket = subs.filter(
    (s) => s.subtype === 'combo' || (!s.subtype && Number(s.sid) > 100)
  );

  const formatMax = (max) => {
    const n = Number(max || 50000);
    return n >= 1000 ? `${Math.round(n / 1000)}K` : n;
  };

  const OddsCell = ({ item, type }) => {
    const isBack = type === 'back';
    const odds = isBack ? item.b : item.l;
    const size = isBack ? item.bs : item.ls;
    const gs = String(item.gstatus || '').toUpperCase();
    const dead =
      isSuspended ||
      (gs && !['OPEN', 'ACTIVE'].includes(gs)) ||
      !(Number(odds) > 1);

    return (
      <div
        onClick={() =>
          !dead && openBetSlip(item.sid ?? item.nat, odds, type, isMobile)
        }
        className={`market-odd-box ${type} ${dead ? 'suspended-box' : ''}`}
        style={{
          cursor: dead ? 'not-allowed' : 'pointer',
          flex: 1,
          minHeight: '42px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className='market-odd'>{dead ? '0' : odds}</span>
        {!dead && size ? <span className='market-volume'>{size}</span> : null}
      </div>
    );
  };

  const MarketTable = ({ title, items }) => (
    <div className='game-market market-6 container-fluid container-fluid-5'>
      <div className='market-title row row5'>{title}</div>
      <div className='market-header row row5'>
        <div className='col-md-12 col-12'>
          <div className='market-row'>
            <div className='market-nation-detail' />
            <div className='goal2-odds-box'>
              <div className='market-odd-box back'>
                <b>Back</b>
              </div>
              <div className='market-odd-box lay'>
                <b>Lay</b>
              </div>
            </div>
            <div className='fancy-min-max-box' />
          </div>
        </div>
      </div>
      <div className='market-body row'>
        <div className='col-md-12 col-12'>
          {items.map((item) => (
            <div className='fancy-market' key={item.sid}>
              <div className='market-row'>
                <div className='market-nation-detail'>
                  <span className='market-nation-name pointer'>{item.nat}</span>
                </div>
                <div className='blb-box goal2-odds-box'>
                  <OddsCell item={item} type='back' />
                  <OddsCell item={item} type='lay' />
                </div>
                <div className='fancy-min-max-box'>
                  <div className='fancy-min-max'>
                    <span>Min: {Number(item.min || 100).toFixed(2)}</span>
                    <span>Max: {formatMax(item.max)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className='w-full min-w-0'>
      <div className='detail-page-container position-relative flex flex-wrap items-start'>
        <MarketTable title='Who Will Goal Next?' items={playersMarket} />
        <MarketTable title='Method Of Next Goal' items={methodsMarket} />
      </div>

      {combosMarket.length > 0 && (
        <div className='game-market market-comb container-fluid container-fluid-5 mt-2'>
          <div className='market-title row row5'>
            Method Of Combination Goal
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2'>
            {combosMarket.map((item) => {
              const gs = String(item.gstatus || '').toUpperCase();
              const dead =
                isSuspended ||
                (gs && !['OPEN', 'ACTIVE'].includes(gs)) ||
                !(Number(item.b) > 1);
              return (
                <div
                  className='market-row border-r border-b border-[#c9c9c9]'
                  key={item.sid}
                >
                  <div className='market-nation-detail'>
                    <span className='market-nation-name'>{item.nat}</span>
                  </div>
                  <div className='blb-box goal2-odds-box'>
                    <div
                      className={`market-odd-box back ${dead ? 'suspended-box' : ''}`}
                      onClick={() =>
                        !dead &&
                        openBetSlip(
                          item.sid ?? item.nat,
                          item.b,
                          'back',
                          isMobile
                        )
                      }
                      style={{
                        cursor: dead ? 'not-allowed' : 'pointer',
                        flex: 1,
                      }}
                    >
                      <span className='market-odd'>{dead ? '0' : item.b}</span>
                      {!dead && item.bs ? (
                        <span className='market-volume'>{item.bs}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className='fancy-min-max-box'>
                    <div className='fancy-min-max'>
                      <span>Min: {Number(item.min || 100).toFixed(2)}</span>
                      <span>Max: {formatMax(item.max)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
