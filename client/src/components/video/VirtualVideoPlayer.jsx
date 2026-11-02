import React from 'react';
import { useCasino } from '../../context/CasinoContext';
import FlipClock from './FlipClock';
import FlipCard from './FlipCard';

export default function VirtualVideoPlayer() {
  const {
    selectedGame,
    roundData,
    cardsFlipped,
    flippedCards,
    showWinner,
    currentWinner,
    roundPhase,
  } = useCasino();

  const { cards } = roundData;

  const renderCardsLayout = () => {
    // 1. Dragon Tiger Lion (vdtl20, dtl20)
    if (selectedGame === 'vdtl20' || selectedGame === 'dtl20') {
      const dCard = cards?.dragon?.[0] || 'JDD';
      const tCard = cards?.tiger?.[0] || '8HH';
      const lCard = cards?.lion?.[0] || '5HH';

      const isWinnerD = showWinner && (currentWinner === 'D' || currentWinner === 'Dragon');
      const isWinnerT = showWinner && (currentWinner === 'T' || currentWinner === 'Tiger');
      const isWinnerL = showWinner && (currentWinner === 'L' || currentWinner === 'Lion');

      return (
        <div className="casino-video-cards">
          {/* Dragon */}
          <div className={`vcasinocards-playera ${isWinnerD ? 'winning-hand' : ''}`}>
            <h5 className="text-center" style={{ color: '#ff4500' }}>Dragon</h5>
            <div className="flip-card-container">
              <FlipCard card={dCard} isFlipped={cardsFlipped || flippedCards['dragon']} />
            </div>
            {isWinnerD && (
              <img
                src="/assets/img/virtual-casino/winner.png"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://cdn.926assets.com/g3ver/v107/static/front/img/winner.png';
                }}
                className="virtual-winner winner-animation"
                alt="Winner"
              />
            )}
          </div>

          {/* Tiger */}
          <div className={`vcasinocards-playerb ${isWinnerT ? 'winning-hand' : ''}`}>
            <h5 className="text-center" style={{ color: '#e2ee26' }}>Tiger</h5>
            <div className="flip-card-container">
              <FlipCard card={tCard} isFlipped={cardsFlipped || flippedCards['tiger']} />
            </div>
            {isWinnerT && (
              <img
                src="/assets/img/virtual-casino/winner.png"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://cdn.926assets.com/g3ver/v107/static/front/img/winner.png';
                }}
                className="virtual-winner winner-animation"
                alt="Winner"
              />
            )}
          </div>

          {/* Lion */}
          <div className={`vcasinocards-playerc ${isWinnerL ? 'winning-hand' : ''}`}>
            <h5 className="text-center" style={{ color: '#33c6ff' }}>Lion</h5>
            <div className="flip-card-container">
              <FlipCard card={lCard} isFlipped={cardsFlipped || flippedCards['lion']} />
            </div>
            {isWinnerL && (
              <img
                src="/assets/img/virtual-casino/winner.png"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://cdn.926assets.com/g3ver/v107/static/front/img/winner.png';
                }}
                className="virtual-winner winner-animation"
                alt="Winner"
              />
            )}
          </div>
        </div>
      );
    }

    // 2. Teenpatti 20-20 & Variants (vteen20, vteenmuf, vteen, teen20, teen20b, teen20c)
    if (selectedGame === 'vteen20' || selectedGame === 'vteenmuf' || selectedGame === 'vteen' || selectedGame === 'teen20' || selectedGame === 'teen20b' || selectedGame === 'teen20c') {
      const pACards = cards?.playerA || ['10DD', '10HH', '4DD'];
      const pBCards = cards?.playerB || ['5CC', '2DD', '8SS'];

      const isWinnerA = showWinner && (currentWinner === 'A' || currentWinner === 'Player A');
      const isWinnerB = showWinner && (currentWinner === 'B' || currentWinner === 'Player B');

      return (
        <div className="casino-video-cards">
          {/* Player A */}
          <div className={`vcasinocards-playera ${isWinnerA ? 'winning-hand' : ''}`}>
            <h5 className="text-center" style={{ color: '#ff4500' }}>Player A</h5>
            <div className="flip-card-container">
              {pACards.map((c, i) => (
                <FlipCard
                  key={`pa-${i}`}
                  card={c}
                  isFlipped={cardsFlipped || flippedCards[`pa_${i}`]}
                />
              ))}
            </div>
            {isWinnerA && (
              <img
                src="/assets/img/virtual-casino/winner.png"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://cdn.926assets.com/g3ver/v107/static/front/img/winner.png';
                }}
                className="virtual-winner winner-animation"
                alt="Winner"
              />
            )}
          </div>

          {/* Player B */}
          <div className={`vcasinocards-playerb ${isWinnerB ? 'winning-hand' : ''}`}>
            <h5 className="text-center" style={{ color: '#e2ee26' }}>Player B</h5>
            <div className="flip-card-container">
              {pBCards.map((c, i) => (
                <FlipCard
                  key={`pb-${i}`}
                  card={c}
                  isFlipped={cardsFlipped || flippedCards[`pb_${i}`]}
                />
              ))}
            </div>
            {isWinnerB && (
              <img
                src="/assets/img/virtual-casino/winner.png"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://cdn.926assets.com/g3ver/v107/static/front/img/winner.png';
                }}
                className="virtual-winner winner-animation"
                alt="Winner"
              />
            )}
          </div>
        </div>
      );
    }

    // 3. Trio (vtrio, trio) - Center 3 cards, NO trophy (no competing players)
    if (selectedGame === 'vtrio' || selectedGame === 'trio') {
      const trioCards = cards?.center || ['5SS', '3CC', 'QSS'];
      return (
        <div className="casino-video-cards">
          <div className="vcasinocards-trio">
            <div className="flip-card-container">
              {trioCards.map((c, i) => (
                <FlipCard
                  key={`trio-${i}`}
                  card={c}
                  isFlipped={cardsFlipped || flippedCards[`trio_${i}`]}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Virtual Lucky 7 (vlucky7) - Standalone Individual Game
    if (selectedGame === 'vlucky7') {
      const c1 = cards?.center?.[0] || '10CC';
      return (
        <div className="casino-video-cards">
          <div className="vcasinocards-center">
            <div className="flip-card-container">
              <FlipCard card={c1} isFlipped={cardsFlipped || flippedCards['center']} />
            </div>
          </div>
        </div>
      );
    }

    // Lucky 7 (lucky7, lucky7eu, lucky7eu2)
    if (selectedGame === 'lucky7' || selectedGame === 'lucky7eu' || selectedGame === 'lucky7eu2') {
      const c1 = cards?.center?.[0] || '10CC';
      return (
        <div className="casino-video-cards">
          <div className="vcasinocards-center">
            <div className="flip-card-container">
              <FlipCard card={c1} isFlipped={cardsFlipped || flippedCards['center']} />
            </div>
          </div>
        </div>
      );
    }

    // 5. Amar Akbar Anthony (vaaa, aaa, aaa2)
    if (selectedGame === 'vaaa' || selectedGame === 'aaa' || selectedGame === 'aaa2') {
      const dealtCard = cards?.center?.[0] || '7DD';
      const isWinnerAmar = showWinner && (currentWinner === 'Amar' || currentWinner === 'A');
      const isWinnerAkbar = showWinner && (currentWinner === 'Akbar' || currentWinner === 'B');
      const isWinnerAnthony = showWinner && (currentWinner === 'Anthony' || currentWinner === 'C');

      // Authentic Amar Akbar Anthony Card Rule:
      // In AAA, exactly ONE card is dealt in total.
      // During Betting & Suspended phases (countdown > 0): All 3 containers are empty (<div className="flip-card-container"></div>).
      // During Dealing & Result phases: ONLY the winning character receives the 1 dealt card!
      const isDealingOrResult = roundPhase === 'dealing' || roundPhase === 'result';
      const isAmarCard = isDealingOrResult && (currentWinner === 'Amar' || currentWinner === 'A');
      const isAkbarCard = isDealingOrResult && (currentWinner === 'Akbar' || currentWinner === 'B');
      const isAnthonyCard = isDealingOrResult && (currentWinner === 'Anthony' || currentWinner === 'C');

      return (
        <div className="casino-video-cards">
          {/* Amar */}
          <div className={`vcasinocards-playera ${isWinnerAmar ? 'winning-hand' : ''}`}>
            <h5 className="text-center" style={{ color: '#ff4500' }}>Amar</h5>
            <div className="flip-card-container">
              {isAmarCard && (
                <FlipCard
                  card={dealtCard}
                  isFlipped={cardsFlipped || flippedCards['amar']}
                />
              )}
            </div>
            {isWinnerAmar && (
              <img
                src="/assets/img/virtual-casino/winner.png"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://cdn.926assets.com/g3ver/v107/static/front/img/winner.png';
                }}
                className="virtual-winner winner-animation"
                alt="Winner"
              />
            )}
          </div>

          {/* Akbar */}
          <div className={`vcasinocards-playerb ${isWinnerAkbar ? 'winning-hand' : ''}`}>
            <h5 className="text-center" style={{ color: '#e2ee26' }}>Akbar</h5>
            <div className="flip-card-container">
              {isAkbarCard && (
                <FlipCard
                  card={dealtCard}
                  isFlipped={cardsFlipped || flippedCards['akbar']}
                />
              )}
            </div>
            {isWinnerAkbar && (
              <img
                src="/assets/img/virtual-casino/winner.png"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://cdn.926assets.com/g3ver/v107/static/front/img/winner.png';
                }}
                className="virtual-winner winner-animation"
                alt="Winner"
              />
            )}
          </div>

          {/* Anthony */}
          <div className={`vcasinocards-playerc ${isWinnerAnthony ? 'winning-hand' : ''}`}>
            <h5 className="text-center" style={{ color: '#33c6ff' }}>Anthony</h5>
            <div className="flip-card-container">
              {isAnthonyCard && (
                <FlipCard
                  card={dealtCard}
                  isFlipped={cardsFlipped || flippedCards['anthony']}
                />
              )}
            </div>
            {isWinnerAnthony && (
              <img
                src="/assets/img/virtual-casino/winner.png"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://cdn.926assets.com/g3ver/v107/static/front/img/winner.png';
                }}
                className="virtual-winner winner-animation"
                alt="Winner"
              />
            )}
          </div>
        </div>
      );
    }

    // 6. Dragon Tiger (vdt6, dt6, dt20)
    if (selectedGame === 'vdt6' || selectedGame.includes('dt')) {
      const dCard = cards?.dragon?.[0] || 'QHH';
      const tCard = cards?.tiger?.[0] || '5DD';
      const isWinnerD = showWinner && (currentWinner === 'D' || currentWinner === 'Dragon');
      const isWinnerT = showWinner && (currentWinner === 'T' || currentWinner === 'Tiger');

      return (
        <div className="casino-video-cards">
          <div className={`vcasinocards-playera ${isWinnerD ? 'winning-hand' : ''}`}>
            <h5 className="text-center" style={{ color: '#ff4500' }}>Dragon</h5>
            <div className="flip-card-container">
              <FlipCard card={dCard} isFlipped={cardsFlipped || flippedCards['dragon']} />
            </div>
            {isWinnerD && (
              <img
                src="/assets/img/virtual-casino/winner.png"
                className="virtual-winner winner-animation"
                alt="Winner"
              />
            )}
          </div>
          <div className={`vcasinocards-playerb ${isWinnerT ? 'winning-hand' : ''}`}>
            <h5 className="text-center" style={{ color: '#e2ee26' }}>Tiger</h5>
            <div className="flip-card-container">
              <FlipCard card={tCard} isFlipped={cardsFlipped || flippedCards['tiger']} />
            </div>
            {isWinnerT && (
              <img
                src="/assets/img/virtual-casino/winner.png"
                className="virtual-winner winner-animation"
                alt="Winner"
              />
            )}
          </div>
        </div>
      );
    }

    // 7. Bollywood Casino / Baccarat (vbtable, btable, baccarat)
    if (selectedGame === 'vbtable' || selectedGame.includes('baccarat') || selectedGame.includes('btable')) {
      const pCards = cards?.player || ['6DD', '8HH'];
      const bCards = cards?.banker || ['9DD', '1'];
      const isWinnerP = showWinner && (currentWinner === 'P' || currentWinner === 'Player');
      const isWinnerB = showWinner && (currentWinner === 'B' || currentWinner === 'Banker');

      return (
        <div className="casino-video-cards">
          <div className="vcasinocards-playera">
            <h5 className="text-center" style={{ color: '#33c6ff' }}>Player</h5>
            <div className="flip-card-container">
              {pCards.map((c, i) => (
                <FlipCard key={`bac-p-${i}`} card={c} isFlipped={cardsFlipped} />
              ))}
            </div>
            {isWinnerP && (
              <img
                src="/assets/img/virtual-casino/winner.png"
                className="virtual-winner winner-animation"
                alt="Winner"
              />
            )}
          </div>
          <div className="vcasinocards-playerb">
            <h5 className="text-center" style={{ color: '#ff4500' }}>Banker</h5>
            <div className="flip-card-container">
              {bCards.map((c, i) => (
                <FlipCard key={`bac-b-${i}`} card={c} isFlipped={cardsFlipped} />
              ))}
            </div>
            {isWinnerB && (
              <img
                src="/assets/img/virtual-casino/winner.png"
                className="virtual-winner winner-animation"
                alt="Winner"
              />
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="">
      <div className="casino-video">
        <div className="video-box-container">
          <div className="casino-video-box">
            <img
              src={`/assets/img/virtual-casino/${selectedGame}.png`}
              onError={(e) => {
                e.currentTarget.src = `https://cdn.926assets.com/g3ver/v107/static/front/img/virtual-casino/dealer-bg/${selectedGame}.png`;
              }}
              className="vcasinobg"
              alt={`${selectedGame} Dealer`}
            />
          </div>
        </div>

        {/* Dynamic Responsive Cards Layout */}
        {renderCardsLayout()}

        {/* Authentic 3D Countdown Flip Clock on the Green Table */}
        <FlipClock />
      </div>
    </div>
  );
}
