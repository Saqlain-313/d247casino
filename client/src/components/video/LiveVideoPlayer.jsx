import React from 'react';
import { useCasino } from '../../context/CasinoContext';
import FlipClock from './FlipClock';
import CasinoChipBar from '../tables/CasinoChipBar';
import CasinoVideoCards from './CasinoVideoCards';

export default function LiveVideoPlayer() {
  const {
    selectedGame,
    roundData,
    cardsFlipped,
    flippedCards,
    showWinner,
    currentWinner,
    roundPhase,
  } = useCasino();

  const isRoulette =
    selectedGame === 'roulette11' ||
    selectedGame === 'roulette12' ||
    selectedGame === 'roulette13' ||
    selectedGame === 'ourroullete';

  return (
    <div className="position-relative">
      <div className="casino-video">
        <div className="video-box-container">
          <div className="casino-video-box">
            <iframe src="about:blank" title="Live Stream"></iframe>
            <div className="video-placeholder-overlay">
              <i className="fas fa-video-slash"></i>
              <span>Live Dealer Stream (Certified Studio Feed)</span>
            </div>

            {/* Special event popup for Goal 2 / Ball by Ball */}
            {selectedGame === 'goal2' && roundData?.rdesc && (
              <div className="cricket20ballpopup">
                <img src="/assets/img/balls/soccer-ball.png" alt="Goal" />
                <span>{roundData.rdesc}</span>
              </div>
            )}

            {/* Authentic Live Winner Ribbon & Trophy Celebration */}
            {showWinner && currentWinner && (
              <div className="casino-winner-announcement-banner">
                <div className="casino-winner-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="winner-details">
                  <div className="winner-sub">RESULT DECLARED</div>
                  <div className="winner-main">{currentWinner}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Casino Video Dealt Cards & Media Layer */}
        <div className="casino-video-cards">
          <CasinoVideoCards
            selectedGame={selectedGame}
            roundData={roundData}
            cardsFlipped={cardsFlipped}
            flippedCards={flippedCards}
            showWinner={showWinner}
            currentWinner={currentWinner}
          />
        </div>

        {/* Authentic 3D Countdown Flip Clock */}
        <FlipClock />

        {/* Casino Chip Bar for Roulette Games */}
        {isRoulette && <CasinoChipBar />}
      </div>
    </div>
  );
}
