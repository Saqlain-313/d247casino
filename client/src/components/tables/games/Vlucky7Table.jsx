import React from 'react';
import { useCasino } from '../../../context/CasinoContext';

/**
 * Game: Virtual Lucky 7 (vlucky7)
 * 100% Dedicated Standalone Market Table
 * Exact DOM, class names, card images, and button layout matching production Diamond247 (lucky7_2474.js)
 */
export default function Vlucky7Table() {
  const { roundData, isSuspended, openBetSlip } = useCasino();
  const { markets, remark } = roundData || {};
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1200;

  // 4 Groups of 3 cards from production chunk (b[19], b[20], b[21], b[22])
  const cardGroups = [
    { label: 'A-2-3', cards: ['A', '2', '3'], odds: '3.90' },
    { label: '4-5-6', cards: ['4', '5', '6'], odds: '3.90' },
    { label: '8-9-10', cards: ['8', '9', '10'], odds: '3.90' },
    { label: 'J-Q-K', cards: ['J', 'Q', 'K'], odds: '3.90' },
  ];

  // 13 Individual Cards from production chunk (b[6] to b[18])
  const cards13 = [
    { code: 'A', num: 1 },
    { code: '2', num: 2 },
    { code: '3', num: 3 },
    { code: '4', num: 4 },
    { code: '5', num: 5 },
    { code: '6', num: 6 },
    { code: '7', num: 7 },
    { code: '8', num: 8 },
    { code: '9', num: 9 },
    { code: '10', num: 10 },
    { code: 'J', num: 11 },
    { code: 'Q', num: 12 },
    { code: 'K', num: 13 },
  ];

  return (
    <div className="casino-table lucky7a vlucky7">
      <div className="casino-table-box">
        {/* Top Main Row: Low Card, Card 7 Image, High Card */}
        <div className="casino-table-full-box">
          {/* Low Card (Ace to 6) */}
          <div className="lucky7low">
            <div className="casino-odds text-center fw-bold">
              {isSuspended ? '-' : (markets?.low?.back || '2.0')}
            </div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Low Card', markets?.low?.back || '2.0', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Low Card</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          {/* Center Card 7 Image */}
          <div
            className={`lucky7 ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Exact 7', markets?.seven?.back || '12.0', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <img src="/assets/img/cards/7.png" alt="7" />
          </div>

          {/* High Card (8 to King) */}
          <div className="lucky7high">
            <div className="casino-odds text-center fw-bold">
              {isSuspended ? '-' : (markets?.high?.back || '2.0')}
            </div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('High Card', markets?.high?.back || '2.0', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">High Card</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>
        </div>

        {/* Side Bets: Even, Odd, Red, Black */}
        <div className="casino-table-box mt-3">
          {/* Left Box: Even (2.10) & Odd (1.79) */}
          <div className="casino-table-left-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">
                {isSuspended ? '-' : (markets?.even?.back || '2.10')}
              </div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Even', markets?.even?.back || '2.10', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Even</span>
              </div>
              <div className="casino-nation-book text-center"></div>
            </div>

            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">
                {isSuspended ? '-' : (markets?.odd?.back || '1.79')}
              </div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Odd', markets?.odd?.back || '1.79', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Odd</span>
              </div>
              <div className="casino-nation-book text-center"></div>
            </div>
          </div>

          {/* Right Box: Red (1.95) & Black (1.95) */}
          <div className="casino-table-right-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">
                {isSuspended ? '-' : (markets?.red?.back || '1.95')}
              </div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Red', markets?.red?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">
                  <span className="card-icon ms-1"><span className="card-red" style={{ fontSize: '18px', fontWeight: 'bold' }}>♥ ♦</span></span>
                </span>
              </div>
              <div className="casino-nation-book text-center"></div>
            </div>

            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">
                {isSuspended ? '-' : (markets?.black?.back || '1.95')}
              </div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Black', markets?.black?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">
                  <span className="card-icon ms-1"><span className="card-black" style={{ fontSize: '18px', fontWeight: 'bold' }}>♠ ♣</span></span>
                </span>
              </div>
              <div className="casino-nation-book text-center"></div>
            </div>
          </div>
        </div>

        {/* 4 Card Groups of 3: A-2-3, 4-5-6, 8-9-10, J-Q-K (Payout 3.90) */}
        <div className="casino-table-box mt-3">
          {cardGroups.map((grp) => (
            <div key={grp.label} className="lucky7cards">
              <div className="casino-odds w-100 text-center fw-bold">
                {isSuspended ? '-' : grp.odds}
              </div>
              <div
                className={`card-odd-box-container ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Group ${grp.label}`, grp.odds, 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                {grp.cards.map((c) => (
                  <div key={c} className="card-odd-box">
                    <div>
                      <img src={`/assets/img/cards/${c}.png`} alt={c} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="casino-nation-book text-center w-100"></div>
            </div>
          ))}
        </div>

        {/* 13 Individual Cards: A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K (Payout 12.0) */}
        <div className="casino-table-full-box lucky7acards mt-3">
          <div className="casino-odds w-100 text-center fw-bold mb-1">
            Cards 1 to 13 (Payout 12.0)
          </div>
          <div className="d-flex flex-wrap justify-content-center w-100 gap-2">
            {cards13.map((card) => (
              <div
                key={card.code}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Card ${card.code}`, '12.0', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '42px', textAlign: 'center' }}
              >
                <div>
                  <img src={`/assets/img/cards/${card.code}.png`} alt={card.code} style={{ width: '38px', height: 'auto', display: 'block', margin: '0 auto' }} />
                </div>
                <div className="casino-odds mt-1">{isSuspended ? '-' : '12'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Game Remarks Marquee */}
        {remark && (
          <div className="casino-remark mt-2">
            <marquee scrollamount="3">{remark}</marquee>
          </div>
        )}
      </div>
    </div>
  );
}
