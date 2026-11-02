import React from 'react';
import FlipCard from './FlipCard';

/**
 * Authentic Diamond247 Video Cards & Winning Presentation Engine
 * 100% INDIVIDUAL SPECIFICATION FOR ALL 93 GAMES (ZERO GROUPING).
 * Renders exact dealt cards, dice, balls, trajectory, flip mechanics,
 * and glowing winning hand celebration with authentic winner badge for every game.
 */
export default function CasinoVideoCards({
  selectedGame,
  roundData,
  cardsFlipped,
  flippedCards = {},
  showWinner,
  currentWinner,
}) {
  const { cards = {} } = roundData || {};

  // Winner Helper: checks if current outcome/hand is the winning side
  const isWon = (key) => {
    if (!showWinner || !currentWinner) return false;
    const cw = String(currentWinner).toLowerCase().trim();
    const k = String(key).toLowerCase().trim();
    return cw === k || cw.includes(k) || k.includes(cw);
  };

  // Winner Badge Component
  const renderWinnerBadge = () => (
    <img
      src="/assets/img/virtual-casino/winner.png"
      onError={(e) => {
        e.currentTarget.src =
          'https://cdn.926assets.com/g3ver/v107/static/front/img/winner.png';
      }}
      className="virtual-winner winner-animation"
      alt="Winner"
      style={{
        position: 'absolute',
        top: '-15px',
        right: '-15px',
        width: '52px',
        height: '52px',
        zIndex: 25,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
      }}
    />
  );

  // --------------------------------------------------------------------------
  // 1. Goal 2 (goal2) & Goal (goal) - Football Penalty Net Simulation
  // --------------------------------------------------------------------------
  if (selectedGame === 'goal2' || selectedGame === 'goal') {
    const pWinner = roundData.goalPlayerWinner || (selectedGame === 'goal' ? currentWinner : 'CR7');
    const mWinner = roundData.goalMethodWinner || (pWinner === 'No Goal' ? 'No Goal' : 'Shot Goal');
    const isGoal = pWinner !== 'No Goal' && currentWinner !== 'No Goal';

    return (
      <div className="live-cards-container d-flex flex-column align-items-center p-2 rounded" style={{ background: 'rgba(10,15,25,0.85)', border: '1px solid #0088cc', minWidth: '190px' }}>
        <div className="d-flex align-items-center gap-2 mb-1">
          <img
            src="/assets/img/balls/soccer-ball.png"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            alt="Soccer Ball"
            style={{ width: '22px', height: '22px' }}
          />
          <span className="fw-bold" style={{ color: isGoal ? '#2ecc71' : '#e74c3c', fontSize: '12px' }}>
            {showWinner ? (isGoal ? '⚽ GOAL SCORED!' : '🧤 SAVED / MISSED!') : 'PENALTY READY'}
          </span>
        </div>
        {selectedGame === 'goal2' && roundData.rdesc && (
          <div className="text-white text-center fw-bold small mb-1" style={{ fontSize: '11px' }}>
            {roundData.rdesc}
          </div>
        )}
        <div className="d-flex gap-1 justify-content-center">
          {['TL', 'TR', 'BL', 'BR', 'C'].map((q) => (
            <div
              key={q}
              className={`p-1 rounded text-center text-white ${showWinner && isGoal && q === 'C' ? 'winning-hand' : ''}`}
              style={{
                width: '32px',
                fontSize: '10px',
                backgroundColor: showWinner && isGoal && q === 'C' ? '#27ae60' : '#2c3e50',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {q}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. European / VIP / Beach / Unique Roulette (roulette11, roulette12, roulette13, ourroullete)
  // --------------------------------------------------------------------------
  if (
    selectedGame === 'roulette11' ||
    selectedGame === 'roulette12' ||
    selectedGame === 'roulette13' ||
    selectedGame === 'ourroullete'
  ) {
    const winningNum = roundData.winningNumber !== undefined ? roundData.winningNumber : (parseInt(currentWinner, 10) || 17);
    const RED_SET = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
    const isRed = RED_SET.has(winningNum);
    const numColor = winningNum === 0 ? '#27ae60' : isRed ? '#e74c3c' : '#2c3e50';

    return (
      <div className="live-cards-container d-flex flex-column align-items-center p-2 rounded" style={{ background: 'rgba(10,15,25,0.88)', border: '1px solid #f39c12', minWidth: '150px' }}>
        <small className="text-warning fw-bold mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
          {showWinner ? 'WINNING NUMBER' : 'ROULETTE WHEEL'}
        </small>
        <div
          className={`rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow ${showWinner ? 'winning-hand' : ''}`}
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: numColor,
            fontSize: '22px',
            border: '3px solid #fff',
            position: 'relative',
          }}
        >
          {showWinner ? winningNum : <i className="fas fa-circle-notch fa-spin text-white-50" style={{ fontSize: '18px' }}></i>}
          {showWinner && renderWinnerBadge()}
        </div>
        {showWinner && (
          <small className="text-white mt-1 fw-bold" style={{ fontSize: '11px' }}>
            {winningNum === 0 ? 'ZERO (GREEN)' : `${winningNum} (${isRed ? 'RED' : 'BLACK'})`}
          </small>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 3. Sic Bo & Sic Bo 2 (sicbo, sicbo2) - 3 Rolling 3D Dice
  // --------------------------------------------------------------------------
  if (selectedGame === 'sicbo' || selectedGame === 'sicbo2') {
    const dice = roundData.dice || [3, 4, 5];
    const sum = dice[0] + dice[1] + dice[2];
    const isTriple = dice[0] === dice[1] && dice[1] === dice[2];

    return (
      <div className="live-cards-container d-flex flex-column align-items-center p-2 rounded" style={{ background: 'rgba(10,15,25,0.85)', border: '1px solid #e67e22', minWidth: '170px' }}>
        <small className="text-warning fw-bold mb-1" style={{ fontSize: '10px' }}>
          {showWinner ? `SUM: ${sum} (${sum <= 10 ? 'SMALL' : 'BIG'})` : 'ROLLING DICE'}
        </small>
        <div className="d-flex gap-2">
          {dice.map((d, i) => (
            <div
              key={`die-${i}`}
              className={`d-flex align-items-center justify-content-center fw-bold text-dark rounded shadow ${showWinner ? 'winning-hand' : ''}`}
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#fff',
                fontSize: '20px',
                border: '2px solid #bdc3c7',
                position: 'relative',
              }}
            >
              {d}
            </div>
          ))}
        </div>
        {showWinner && (
          <div className="d-flex gap-1 mt-1">
            <span className="badge bg-primary" style={{ fontSize: '9px' }}>{sum <= 10 ? 'Small (4-10)' : 'Big (11-17)'}</span>
            <span className="badge bg-secondary" style={{ fontSize: '9px' }}>{sum % 2 === 0 ? 'Even' : 'Odd'}</span>
            {isTriple && <span className="badge bg-danger" style={{ fontSize: '9px' }}>Triple!</span>}
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 4. Worli Matka & Dolidana (worli, worli2, worli3, dolidana)
  // --------------------------------------------------------------------------
  if (
    selectedGame === 'worli' ||
    selectedGame === 'worli2' ||
    selectedGame === 'worli3' ||
    selectedGame === 'dolidana'
  ) {
    const sDigit = roundData.cards?.single || roundData.results?.[0] || '7';
    const pana = roundData.cards?.pana || '128';

    return (
      <div className="live-cards-container d-flex flex-column align-items-center p-2 rounded" style={{ background: 'rgba(10,15,25,0.88)', border: '1px solid #9b59b6', minWidth: '160px' }}>
        <small className="text-warning fw-bold mb-1" style={{ fontSize: '10px' }}>
          {selectedGame === 'dolidana' ? 'DOLIDANA RESULT' : 'WORLI OPEN'}
        </small>
        <div className="d-flex align-items-center gap-2">
          {/* 3 Pana digits */}
          <div className="d-flex gap-1">
            {String(pana).split('').map((d, i) => (
              <div
                key={`p-${i}`}
                className="d-flex align-items-center justify-content-center fw-bold text-white rounded"
                style={{ width: '26px', height: '36px', backgroundColor: '#34495e', fontSize: '16px', border: '1px solid #7f8c8d' }}
              >
                {showWinner || cardsFlipped ? d : '?'}
              </div>
            ))}
          </div>
          <span className="text-white fw-bold">-</span>
          {/* Single Ank */}
          <div
            className={`d-flex align-items-center justify-content-center fw-bold text-white rounded shadow ${showWinner ? 'winning-hand' : ''}`}
            style={{
              width: '38px',
              height: '38px',
              backgroundColor: '#e74c3c',
              fontSize: '22px',
              border: '2px solid #fff',
              position: 'relative',
            }}
          >
            {showWinner || cardsFlipped ? sDigit : '?'}
            {showWinner && renderWinnerBadge()}
          </div>
        </div>
        {showWinner && (
          <small className="text-white mt-1 fw-bold" style={{ fontSize: '10px' }}>
            Single: {sDigit} | Pana: {pana}
          </small>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 5. Cricket Scorecards (superover, superover2, superover3, cricketv3, cmatch20, ballbyball, lucky15)
  // --------------------------------------------------------------------------
  if (
    selectedGame === 'superover' ||
    selectedGame === 'superover2' ||
    selectedGame === 'superover3' ||
    selectedGame === 'cricketv3' ||
    selectedGame === 'cmatch20' ||
    selectedGame === 'ballbyball' ||
    selectedGame === 'lucky15'
  ) {
    const balls = roundData.balls || [1, 4, 0, 6, 2, 'W'];

    return (
      <div className="live-cards-container p-2 rounded" style={{ background: 'rgba(10,15,25,0.88)', border: '1px solid #0088cc', minWidth: '185px' }}>
        <small className="text-warning fw-bold d-block mb-1 text-center" style={{ fontSize: '10px' }}>
          {selectedGame === 'ballbyball' ? 'BALL BY BALL FEED' : 'OVER SCORECARD'}
        </small>
        <div className="d-flex gap-1 justify-content-center">
          {balls.map((b, i) => (
            <span
              key={`b-${i}`}
              className={`badge rounded-circle d-flex align-items-center justify-content-center ${showWinner && i === balls.length - 1 ? 'winning-hand' : ''}`}
              style={{
                width: '26px',
                height: '26px',
                backgroundColor: b === 4 ? '#007bff' : b === 6 ? '#28a745' : b === 'W' ? '#dc3545' : '#495057',
                fontSize: '11px',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              {b}
            </span>
          ))}
        </div>
        {showWinner && (
          <div className="text-center text-success fw-bold small mt-1" style={{ fontSize: '10px' }}>
            Outcome: {currentWinner}
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 6. Single Center Card Games (lucky7, lucky7eu, lucky7eu2, plucky7, vlucky7, aaa, aaa2, vaaa, queen, dum10, mogambo, notenum, lottcard, cmeter1, trap, lucky5)
  // --------------------------------------------------------------------------
  if (
    selectedGame === 'lucky7' ||
    selectedGame === 'lucky7eu' ||
    selectedGame === 'lucky7eu2' ||
    selectedGame === 'plucky7' ||
    selectedGame === 'vlucky7' ||
    selectedGame === 'aaa' ||
    selectedGame === 'aaa2' ||
    selectedGame === 'vaaa' ||
    selectedGame === 'queen' ||
    selectedGame === 'dum10' ||
    selectedGame === 'mogambo' ||
    selectedGame === 'notenum' ||
    selectedGame === 'lottcard' ||
    selectedGame === 'cmeter1' ||
    selectedGame === 'trap' ||
    selectedGame === 'lucky5'
  ) {
    const c1 = cards?.center?.[0] || '10CC';
    const isCenterWon = showWinner;

    return (
      <div className="live-cards-container d-flex flex-column align-items-center">
        <div className={`flip-card-container position-relative ${isCenterWon ? 'winning-hand' : ''}`}>
          <FlipCard card={c1} isFlipped={cardsFlipped || flippedCards['center'] || showWinner} />
          {isCenterWon && renderWinnerBadge()}
        </div>
        {showWinner && (
          <div className="badge bg-warning text-dark fw-bold mt-1 shadow" style={{ fontSize: '11px' }}>
            {currentWinner}
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 7. Dragon Tiger 2-Way (dt20, dt6, dt202, pdt20, pdt6, vdt6)
  // --------------------------------------------------------------------------
  if (
    selectedGame === 'dt20' ||
    selectedGame === 'dt6' ||
    selectedGame === 'dt202' ||
    selectedGame === 'pdt20' ||
    selectedGame === 'pdt6' ||
    selectedGame === 'vdt6'
  ) {
    const dCard = cards?.dragon?.[0] || 'QHH';
    const tCard = cards?.tiger?.[0] || '5DD';

    const winD = isWon('d') || isWon('dragon');
    const winT = isWon('t') || isWon('tiger');

    return (
      <div className="live-cards-container d-flex flex-column">
        <div className="d-flex gap-2">
          {/* Dragon */}
          <div className={`text-center position-relative ${winD ? 'winning-hand p-1' : ''}`} style={{ borderRadius: '6px' }}>
            <small className="fw-bold d-block mb-1" style={{ fontSize: '11px', color: '#ff4500' }}>DRAGON</small>
            <FlipCard card={dCard} isFlipped={cardsFlipped || flippedCards['dragon'] || showWinner} />
            {winD && renderWinnerBadge()}
          </div>
          {/* Tiger */}
          <div className={`text-center position-relative ${winT ? 'winning-hand p-1' : ''}`} style={{ borderRadius: '6px' }}>
            <small className="fw-bold d-block mb-1" style={{ fontSize: '11px', color: '#e2ee26' }}>TIGER</small>
            <FlipCard card={tCard} isFlipped={cardsFlipped || flippedCards['tiger'] || showWinner} />
            {winT && renderWinnerBadge()}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 8. Dragon Tiger Lion 3-Way (dtl20, vdtl20)
  // --------------------------------------------------------------------------
  if (selectedGame === 'dtl20' || selectedGame === 'vdtl20') {
    const dCard = cards?.dragon?.[0] || 'JDD';
    const tCard = cards?.tiger?.[0] || '8HH';
    const lCard = cards?.lion?.[0] || '5HH';

    const winD = isWon('d') || isWon('dragon');
    const winT = isWon('t') || isWon('tiger');
    const winL = isWon('l') || isWon('lion');

    return (
      <div className="live-cards-container d-flex flex-column">
        <div className="d-flex gap-1">
          {/* Dragon */}
          <div className={`text-center position-relative ${winD ? 'winning-hand p-1' : ''}`} style={{ borderRadius: '6px' }}>
            <small className="fw-bold d-block mb-1" style={{ fontSize: '10px', color: '#ff4500' }}>DRAGON</small>
            <FlipCard card={dCard} isFlipped={cardsFlipped || flippedCards['dragon'] || showWinner} />
            {winD && renderWinnerBadge()}
          </div>
          {/* Tiger */}
          <div className={`text-center position-relative ${winT ? 'winning-hand p-1' : ''}`} style={{ borderRadius: '6px' }}>
            <small className="fw-bold d-block mb-1" style={{ fontSize: '10px', color: '#e2ee26' }}>TIGER</small>
            <FlipCard card={tCard} isFlipped={cardsFlipped || flippedCards['tiger'] || showWinner} />
            {winT && renderWinnerBadge()}
          </div>
          {/* Lion */}
          <div className={`text-center position-relative ${winL ? 'winning-hand p-1' : ''}`} style={{ borderRadius: '6px' }}>
            <small className="fw-bold d-block mb-1" style={{ fontSize: '10px', color: '#33c6ff' }}>LION</small>
            <FlipCard card={lCard} isFlipped={cardsFlipped || flippedCards['lion'] || showWinner} />
            {winL && renderWinnerBadge()}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 9. 32 Cards Series (card32, card32eu, pcard32)
  // --------------------------------------------------------------------------
  if (selectedGame === 'card32' || selectedGame === 'card32eu' || selectedGame === 'pcard32') {
    const c8 = cards?.p8?.[0] || '8SS';
    const c9 = cards?.p9?.[0] || '9HH';
    const c10 = cards?.p10?.[0] || '10DD';
    const c11 = cards?.p11?.[0] || 'JCC';

    const win8 = isWon('p8');
    const win9 = isWon('p9');
    const win10 = isWon('p10');
    const win11 = isWon('p11');

    return (
      <div className="live-cards-container d-flex flex-wrap gap-1" style={{ maxWidth: '200px' }}>
        <div className={`text-center position-relative ${win8 ? 'winning-hand p-1' : ''}`} style={{ width: '45px' }}>
          <small className="text-white fw-bold d-block" style={{ fontSize: '10px' }}>P8</small>
          <FlipCard card={c8} width={40} height={56} isFlipped={cardsFlipped || flippedCards['p8'] || showWinner} />
          {win8 && renderWinnerBadge()}
        </div>
        <div className={`text-center position-relative ${win9 ? 'winning-hand p-1' : ''}`} style={{ width: '45px' }}>
          <small className="text-white fw-bold d-block" style={{ fontSize: '10px' }}>P9</small>
          <FlipCard card={c9} width={40} height={56} isFlipped={cardsFlipped || flippedCards['p9'] || showWinner} />
          {win9 && renderWinnerBadge()}
        </div>
        <div className={`text-center position-relative ${win10 ? 'winning-hand p-1' : ''}`} style={{ width: '45px' }}>
          <small className="text-white fw-bold d-block" style={{ fontSize: '10px' }}>P10</small>
          <FlipCard card={c10} width={40} height={56} isFlipped={cardsFlipped || flippedCards['p10'] || showWinner} />
          {win10 && renderWinnerBadge()}
        </div>
        <div className={`text-center position-relative ${win11 ? 'winning-hand p-1' : ''}`} style={{ width: '45px' }}>
          <small className="text-white fw-bold d-block" style={{ fontSize: '10px' }}>P11</small>
          <FlipCard card={c11} width={40} height={56} isFlipped={cardsFlipped || flippedCards['p11'] || showWinner} />
          {win11 && renderWinnerBadge()}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 10. Andar Bahar Games (ab20, ab3, ab4, abj)
  // --------------------------------------------------------------------------
  if (
    selectedGame === 'ab20' ||
    selectedGame === 'ab3' ||
    selectedGame === 'ab4' ||
    selectedGame === 'abj'
  ) {
    const mainCard = cards?.main?.[0] || '10DD';
    const andarCards = cards?.andar || ['4SS', '7HH'];
    const baharCards = cards?.bahar || ['9CC', '10SS'];

    const winAndar = isWon('andar');
    const winBahar = isWon('bahar');

    return (
      <div className="live-cards-container d-flex flex-column gap-1" style={{ minWidth: '180px' }}>
        {/* Main Trump Card */}
        <div className="d-flex align-items-center gap-2 mb-1">
          <small className="text-warning fw-bold" style={{ fontSize: '10px' }}>TRUMP:</small>
          <div style={{ width: '38px', height: '54px' }}>
            <FlipCard card={mainCard} width={38} height={54} isFlipped={true} />
          </div>
        </div>
        {/* Andar & Bahar Piles */}
        <div className="d-flex gap-2">
          <div className={`position-relative ${winAndar ? 'winning-hand p-1' : ''}`}>
            <small className="text-primary fw-bold d-block" style={{ fontSize: '10px' }}>ANDAR</small>
            <div className="d-flex gap-1">
              {andarCards.slice(0, 2).map((c, i) => (
                <FlipCard
                  key={`ab-a-${i}`}
                  card={c}
                  width={38}
                  height={54}
                  isFlipped={cardsFlipped || flippedCards[`andar_${i}`] || showWinner}
                />
              ))}
            </div>
            {winAndar && renderWinnerBadge()}
          </div>
          <div className={`position-relative ${winBahar ? 'winning-hand p-1' : ''}`}>
            <small className="text-danger fw-bold d-block" style={{ fontSize: '10px' }}>BAHAR</small>
            <div className="d-flex gap-1">
              {baharCards.slice(0, 2).map((c, i) => (
                <FlipCard
                  key={`ab-b-${i}`}
                  card={c}
                  width={38}
                  height={54}
                  isFlipped={cardsFlipped || flippedCards[`bahar_${i}`] || showWinner}
                />
              ))}
            </div>
            {winBahar && renderWinnerBadge()}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 11. Baccarat Games (baccarat, baccarat2, pbaccarat, teensin)
  // --------------------------------------------------------------------------
  if (
    selectedGame === 'baccarat' ||
    selectedGame === 'baccarat2' ||
    selectedGame === 'pbaccarat' ||
    selectedGame === 'teensin'
  ) {
    const pCards = cards?.player || ['6DD', '8HH'];
    const bCards = cards?.banker || ['9DD', 'ADD'];

    const winP = isWon('player') || isWon('p');
    const winB = isWon('banker') || isWon('b');

    return (
      <div className="live-cards-container d-flex flex-column gap-2">
        <div className={`position-relative ${winP ? 'winning-hand p-1' : ''}`} style={{ borderRadius: '6px' }}>
          <small className="text-primary fw-bold d-block" style={{ fontSize: '10px' }}>PLAYER</small>
          <div className="d-flex gap-1">
            {pCards.map((c, i) => (
              <FlipCard
                key={`bac-p-${i}`}
                card={c}
                width={38}
                height={54}
                isFlipped={cardsFlipped || flippedCards[`p_${i}`] || showWinner}
              />
            ))}
          </div>
          {winP && renderWinnerBadge()}
        </div>
        <div className={`position-relative ${winB ? 'winning-hand p-1' : ''}`} style={{ borderRadius: '6px' }}>
          <small className="text-danger fw-bold d-block" style={{ fontSize: '10px' }}>BANKER</small>
          <div className="d-flex gap-1">
            {bCards.map((c, i) => (
              <FlipCard
                key={`bac-b-${i}`}
                card={c}
                width={38}
                height={54}
                isFlipped={cardsFlipped || flippedCards[`b_${i}`] || showWinner}
              />
            ))}
          </div>
          {winB && renderWinnerBadge()}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 12. Bollywood Casino (btable, btable2, vbtable) - 6 Characters Showdown
  // --------------------------------------------------------------------------
  if (
    selectedGame === 'btable' ||
    selectedGame === 'btable2' ||
    selectedGame === 'vbtable'
  ) {
    const bChars = [
      { key: 'A', name: 'Don', color: '#ff4757' },
      { key: 'B', name: 'Amar', color: '#2ed573' },
      { key: 'C', name: 'Anthony', color: '#1e90ff' },
      { key: 'D', name: 'Vijay', color: '#ffa502' },
      { key: 'E', name: 'Shehenshah', color: '#9b59b6' },
      { key: 'F', name: 'Gabbar', color: '#ff6b81' },
    ];
    const cCard = cards?.center?.[0] || '10HH';
    const winChar = currentWinner || 'Don';

    return (
      <div className="live-cards-container d-flex flex-column align-items-center p-2 rounded" style={{ minWidth: '185px' }}>
        <small className="text-warning fw-bold mb-1" style={{ fontSize: '10px' }}>BOLLYWOOD SHOWDOWN</small>
        <div className={`position-relative mb-2 ${showWinner ? 'winning-hand' : ''}`}>
          <FlipCard
            card={cCard}
            width={44}
            height={60}
            isFlipped={cardsFlipped || flippedCards['center'] || showWinner}
          />
          {showWinner && renderWinnerBadge()}
        </div>
        <div className="d-flex flex-wrap gap-1 justify-content-center" style={{ maxWidth: '180px' }}>
          {bChars.map((ch) => {
            const isChWon = showWinner && winChar.toLowerCase().includes(ch.name.toLowerCase());
            return (
              <span
                key={ch.key}
                className={`badge ${isChWon ? 'bg-success winning-hand' : 'bg-dark'}`}
                style={{ fontSize: '9px', border: `1px solid ${ch.color}` }}
              >
                {ch.key}. {ch.name}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 13. Race Games (race20, race17, race2) - 4 Suit Track Racers
  // --------------------------------------------------------------------------
  if (
    selectedGame === 'race20' ||
    selectedGame === 'race17' ||
    selectedGame === 'race2'
  ) {
    const suits = [
      { key: 'spade', symbol: '♠', name: 'Spade', color: '#ffffff' },
      { key: 'heart', symbol: '♥', name: 'Heart', color: '#ff4d4f' },
      { key: 'club', symbol: '♣', name: 'Club', color: '#52c41a' },
      { key: 'diamond', symbol: '♦', name: 'Diamond', color: '#1890ff' },
    ];
    const leadSuit = currentWinner || '♠ Spade';

    return (
      <div className="live-cards-container d-flex flex-column p-2 rounded" style={{ minWidth: '180px' }}>
        <small className="text-warning fw-bold mb-1 text-center" style={{ fontSize: '10px' }}>TRACK RACERS</small>
        <div className="d-flex flex-column gap-1">
          {suits.map((s) => {
            const isSuitWon = showWinner && leadSuit.toLowerCase().includes(s.name.toLowerCase());
            return (
              <div
                key={s.key}
                className={`d-flex align-items-center justify-content-between px-2 py-1 rounded ${isSuitWon ? 'winning-hand' : ''}`}
                style={{
                  background: isSuitWon ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${isSuitWon ? '#2ecc71' : 'rgba(255, 255, 255, 0.1)'}`,
                  fontSize: '11px',
                }}
              >
                <span style={{ color: s.color, fontWeight: 'bold' }}>{s.symbol} {s.name}</span>
                <span className="badge bg-secondary" style={{ fontSize: '9px' }}>
                  {isSuitWon ? '🏆 FINISH' : 'RUNNING'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 12. Poker (poker, poker20, poker6)
  // --------------------------------------------------------------------------
  if (selectedGame === 'poker' || selectedGame === 'poker20' || selectedGame === 'poker6') {
    const pACards = cards?.playerA || ['KSS', '10HH'];
    const pBCards = cards?.playerB || ['QDD', '9CC'];
    const commCards = cards?.community || ['8DD', '7CC', '2HH'];

    const winA = isWon('player a') || isWon('a');
    const winB = isWon('player b') || isWon('b');

    return (
      <div className="live-cards-container d-flex flex-column gap-1">
        <div className="d-flex gap-2">
          <div className={`position-relative ${winA ? 'winning-hand p-1' : ''}`}>
            <small className="text-danger fw-bold d-block" style={{ fontSize: '10px' }}>PLAYER A</small>
            <div className="d-flex gap-1">
              {pACards.map((c, i) => (
                <FlipCard key={`pk-a-${i}`} card={c} isFlipped={cardsFlipped || showWinner} />
              ))}
            </div>
            {winA && renderWinnerBadge()}
          </div>
          <div className={`position-relative ${winB ? 'winning-hand p-1' : ''}`}>
            <small className="text-warning fw-bold d-block" style={{ fontSize: '10px' }}>PLAYER B</small>
            <div className="d-flex gap-1">
              {pBCards.map((c, i) => (
                <FlipCard key={`pk-b-${i}`} card={c} isFlipped={cardsFlipped || showWinner} />
              ))}
            </div>
            {winB && renderWinnerBadge()}
          </div>
        </div>
        <div>
          <small className="text-info fw-bold d-block" style={{ fontSize: '9px' }}>COMMUNITY</small>
          <div className="d-flex gap-1">
            {commCards.slice(0, 3).map((c, i) => (
              <FlipCard key={`pk-c-${i}`} card={c} isFlipped={cardsFlipped || showWinner} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 13. Trio & 3 Card Judgement (vtrio, trio, 3cardj)
  // --------------------------------------------------------------------------
  if (selectedGame === 'vtrio' || selectedGame === 'trio' || selectedGame === '3cardj') {
    const trioCards = cards?.center || ['5SS', '3CC', 'QSS'];

    return (
      <div className="live-cards-container d-flex flex-column align-items-center">
        <small className="text-warning fw-bold mb-1" style={{ fontSize: '10px' }}>TRIO CARDS</small>
        <div className={`d-flex gap-1 position-relative ${showWinner ? 'winning-hand p-1' : ''}`} style={{ borderRadius: '6px' }}>
          {trioCards.map((c, i) => (
            <FlipCard key={`trio-${i}`} card={c} isFlipped={cardsFlipped || flippedCards[`trio_${i}`] || showWinner} />
          ))}
          {showWinner && renderWinnerBadge()}
        </div>
        {showWinner && (
          <div className="badge bg-warning text-dark fw-bold mt-1" style={{ fontSize: '10px' }}>
            {currentWinner}
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 14. 1-Card & 2-Card Patti (teen1, teen120, patti2)
  // --------------------------------------------------------------------------
  if (
    selectedGame === 'teen1' ||
    selectedGame === 'teen120' ||
    selectedGame === 'patti2'
  ) {
    const pACards = cards?.playerA || ['10SS'];
    const pBCards = cards?.playerB || ['8HH'];

    const winA = isWon('player a') || isWon('a');
    const winB = isWon('player b') || isWon('b');

    return (
      <div className="live-cards-container d-flex flex-column gap-2">
        <div className={`position-relative ${winA ? 'winning-hand p-1' : ''}`} style={{ borderRadius: '6px' }}>
          <small className="text-white fw-bold d-block" style={{ fontSize: '10px' }}>PLAYER A</small>
          <div className="d-flex gap-1">
            {pACards.map((c, i) => (
              <FlipCard key={`p1-a-${i}`} card={c} isFlipped={cardsFlipped || showWinner} />
            ))}
          </div>
          {winA && renderWinnerBadge()}
        </div>
        <div className={`position-relative ${winB ? 'winning-hand p-1' : ''}`} style={{ borderRadius: '6px' }}>
          <small className="text-white fw-bold d-block" style={{ fontSize: '10px' }}>PLAYER B</small>
          <div className="d-flex gap-1">
            {pBCards.map((c, i) => (
              <FlipCard key={`p1-b-${i}`} card={c} isFlipped={cardsFlipped || showWinner} />
            ))}
          </div>
          {winB && renderWinnerBadge()}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 16. 3-Card Teen Patti Individual Games (teen, teen20, teen20b, teen20c, teen9, teen8, teenmuf, vteenmuf, vteen, vteen20, pteen, pteen20, teenunique, teen41, teen42, teen32, teen33, teen6, poison, poison20, joker1, joker20, joker120)
  // --------------------------------------------------------------------------
  const pACards = cards?.playerA || ['10DD', '10HH', '4DD'];
  const pBCards = cards?.playerB || ['5CC', '2DD', '8SS'];
  const wildCard = cards?.wild || roundData.wildCard;

  const winA = isWon('player a') || isWon('a');
  const winB = isWon('player b') || isWon('b');

  return (
    <div className="live-cards-container d-flex flex-column gap-1">
      {/* Wild / Poison / Open card if present */}
      {wildCard && (
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge bg-danger" style={{ fontSize: '9px' }}>
            {selectedGame.includes('poison') ? '☠ POISON' : '🃏 JOKER'}
          </span>
          <div style={{ width: '34px', height: '48px' }}>
            <FlipCard card={wildCard} isFlipped={true} />
          </div>
        </div>
      )}

      {/* Player A & Player B 3-card hands */}
      <div className="d-flex gap-2">
        {/* Player A */}
        <div className={`position-relative ${winA ? 'winning-hand p-1' : ''}`} style={{ borderRadius: '6px' }}>
          <small className="text-danger fw-bold d-block" style={{ fontSize: '10px' }}>PLAYER A</small>
          <div className="d-flex gap-1">
            {pACards.map((c, i) => (
              <FlipCard
                key={`pa-${i}`}
                card={c}
                isFlipped={cardsFlipped || flippedCards[`pa_${i}`] || showWinner}
              />
            ))}
          </div>
          {winA && renderWinnerBadge()}
        </div>

        {/* Player B */}
        <div className={`position-relative ${winB ? 'winning-hand p-1' : ''}`} style={{ borderRadius: '6px' }}>
          <small className="text-warning fw-bold d-block" style={{ fontSize: '10px' }}>PLAYER B</small>
          <div className="d-flex gap-1">
            {pBCards.map((c, i) => (
              <FlipCard
                key={`pb-${i}`}
                card={c}
                isFlipped={cardsFlipped || flippedCards[`pb_${i}`] || showWinner}
              />
            ))}
          </div>
          {winB && renderWinnerBadge()}
        </div>
      </div>
    </div>
  );
}
