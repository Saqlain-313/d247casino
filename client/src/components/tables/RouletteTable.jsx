import { useCasino } from '../../context/CasinoContext';

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export default function RouletteTable() {
  const {
    rouletteMode,
    setRouletteMode,
    setStatisticsModalOpen,
    placeRouletteBet,
    rouletteBets,
    isSuspended,
  } = useCasino();

  const handleSpotClick = (id, name, odds = 36) => {
    if (isSuspended) return;
    placeRouletteBet(id, name, odds);
  };

  const renderChip = (amount) => {
    if (!amount) return null;
    const color =
      amount <= 100
        ? '#138cf5'
        : amount <= 500
        ? '#00d700'
        : amount <= 2000
        ? '#9541f9'
        : '#e67e22';
    const label = amount >= 1000 ? `${(amount / 1000).toFixed(0)}K` : amount;

    return (
      <div
        className="casino-coin"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        <div
          className="bet-chip-holder"
          style={{
            '--g-chip-inner-color': color,
            width: '28px',
            height: '28px',
          }}
        >
          <div className="bet-chip" style={{ width: '28px', height: '28px' }}>
            <div className="bet-chip-front"></div>
            <div className="bet-chip-top"></div>
            <div className="bet-chip-amount">
              <svg
                className="bet-chip-amount-in"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 108 108"
              >
                <text
                  className="bet-chip-amount-label"
                  x="50%"
                  y="53.5%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="34"
                  fontWeight="700"
                >
                  {label}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="casino-table">
      {/* Transfer Board: Back/Lay Toggle + Statistics link */}
      <div className="transfer-board">
      <div className="flex w-[190px] max-w-full h-[48px] overflow-hidden rounded-full bg-[#f5f5f5] mb-2.5">
  <div
    onClick={() => setRouletteMode('back')}
    className={`flex flex-1 items-center justify-center text-[18px] font-bold cursor-pointer rounded-l-full bg-[#72b9e8] text-[#344454] border-[3px] transition-colors ${
      rouletteMode === 'back'
        ? 'border-black'
        : 'border-transparent'
    }`}
  >
    Back
  </div>

  <div
    onClick={() => setRouletteMode('lay')}
    className={`flex flex-1 items-center justify-center text-[18px] font-bold cursor-pointer rounded-r-full bg-[#f5a5b8] text-[#344454] border-[3px] transition-colors ${
      rouletteMode === 'lay'
        ? 'border-black'
        : 'border-transparent'
    }`}
  >
    Lay
  </div>
</div>
        <h5 className="d-block d-lg-none m-0">
          <a
            onClick={(e) => {
              e.preventDefault();
              setStatisticsModalOpen(true);
            }}
            style={{ cursor: 'pointer', color: '#0088cc', textDecoration: 'underline' }}
          >
            Statistics
          </a>
        </h5>
      </div>

      {/* Main Roulette Board Box */}
      <div className="casino-table-box">
        <div className="roulette-box-container">
          <div className="board-in">
            {/* Right Column: 2 to 1 for the 3 rows */}
            <div className="board-right">
              <div
                className="board-cell yellow"
                onClick={() => handleSpotClick('138', '2to1 (Row 1)', 3)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-text">2to1</span>
                  <div className="bet-chip-area center-center coin-place" id="138">
                    {renderChip(rouletteBets['138'])}
                  </div>
                </div>
              </div>
              <div
                className="board-cell yellow"
                onClick={() => handleSpotClick('137', '2to1 (Row 2)', 3)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-text">2to1</span>
                  <div className="bet-chip-area center-center coin-place" id="137">
                    {renderChip(rouletteBets['137'])}
                  </div>
                </div>
              </div>
              <div
                className="board-cell yellow"
                onClick={() => handleSpotClick('136', '2to1 (Row 3)', 3)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-text">2to1</span>
                  <div className="bet-chip-area center-center coin-place" id="136">
                    {renderChip(rouletteBets['136'])}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Dozens and Even Money bets */}
            <div className="board-bottom">
              <div
                className="board-cell yellow"
                onClick={() => handleSpotClick('133', '1st 12', 3)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-text">1st12</span>
                  <div className="bet-chip-area center-center coin-place" id="133">
                    {renderChip(rouletteBets['133'])}
                  </div>
                </div>
              </div>
              <div
                className="board-cell yellow"
                onClick={() => handleSpotClick('134', '2nd 12', 3)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-text">2nd12</span>
                  <div className="bet-chip-area center-center coin-place" id="134">
                    {renderChip(rouletteBets['134'])}
                  </div>
                </div>
              </div>
              <div
                className="board-cell yellow"
                onClick={() => handleSpotClick('135', '3rd 12', 3)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-text">3rd12</span>
                  <div className="bet-chip-area center-center coin-place" id="135">
                    {renderChip(rouletteBets['135'])}
                  </div>
                </div>
              </div>
              <div
                className="board-cell yellow"
                onClick={() => handleSpotClick('139', '1 - 18', 2)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-text">1 - 18</span>
                  <div className="bet-chip-area center-center coin-place" id="139">
                    {renderChip(rouletteBets['139'])}
                  </div>
                </div>
              </div>
              <div
                className="board-cell yellow"
                onClick={() => handleSpotClick('144', 'Even', 2)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-text">Even</span>
                  <div className="bet-chip-area center-center coin-place" id="144">
                    {renderChip(rouletteBets['144'])}
                  </div>
                </div>
              </div>
              <div
                className="board-cell yellow"
                onClick={() => handleSpotClick('141', 'Red', 2)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-text" style={{ color: '#ff3333' }}>Red</span>
                  <div className="bet-chip-area center-center coin-place" id="141">
                    {renderChip(rouletteBets['141'])}
                  </div>
                </div>
              </div>
              <div
                className="board-cell yellow"
                onClick={() => handleSpotClick('142', 'Black', 2)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-text" style={{ color: '#000000' }}>Black</span>
                  <div className="bet-chip-area center-center coin-place" id="142">
                    {renderChip(rouletteBets['142'])}
                  </div>
                </div>
              </div>
              <div
                className="board-cell yellow"
                onClick={() => handleSpotClick('143', 'Odd', 2)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-text">Odd</span>
                  <div className="bet-chip-area center-center coin-place" id="143">
                    {renderChip(rouletteBets['143'])}
                  </div>
                </div>
              </div>
              <div
                className="board-cell yellow"
                onClick={() => handleSpotClick('140', '19 - 36', 2)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-text">19 - 36</span>
                  <div className="bet-chip-area center-center coin-place" id="140">
                    {renderChip(rouletteBets['140'])}
                  </div>
                </div>
              </div>
            </div>

            {/* Center Section: 0 and Numbers 1 to 36 */}
            <div className="board-center">
              {/* Zero */}
              <div
                className="board-cell green"
                onClick={() => handleSpotClick('1', '0', 36)}
                style={{ cursor: 'pointer' }}
              >
                <div className="board-cell-in">
                  <span className="board-number">0</span>
                  <div className="bet-chip-area center-center coin-place" id="1">
                    {renderChip(rouletteBets['1'])}
                  </div>
                </div>
              </div>

              {/* Numbers 1 to 36 */}
              {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
                const color = RED_NUMBERS.has(num) ? 'red' : 'black';
                const cellId = String(num + 1); // 1 is cellId 2, 2 is cellId 3, etc.
                return (
                  <div
                    key={num}
                    className={`board-cell ${color}`}
                    onClick={() => handleSpotClick(cellId, String(num), 36)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="board-cell-in">
                      <span className="board-number">{num}</span>
                      <div
                        className="bet-chip-area center-center coin-place"
                        id={cellId}
                      >
                        {renderChip(rouletteBets[cellId])}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

