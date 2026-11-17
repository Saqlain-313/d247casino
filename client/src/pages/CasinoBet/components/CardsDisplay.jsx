import { memo } from 'react';
import { distributeCards } from './utils';
import CricketCard from '../../gamedetails/CricketCard';

/**
 * CardsDisplay - Displays cards for the current round
 * Shows cards for different players based on game type
 */
const CardsDisplay = memo(function CardsDisplay({ bettingData }) {
  if (!bettingData?.card) return null;

  const cards = String(bettingData.card).split(/[|,]/);
  const gameType = bettingData.gtype;
  const distributedCards = distributeCards(cards, bettingData.gtype, gameType);

  if (!distributedCards) return null;

  const isBaccaratGame = gameType === 'baccarat' || gameType === 'baccarat2';
  const isCard32Game = gameType === 'card32' || gameType === 'card32eu';
  const isLuckyCard =
    gameType === 'lucky7' ||
    gameType === 'lucky7eu' ||
    gameType === 'lucky7eu2';
  // Build a generic list of player entries from the distributed cards
  const playerEntries = [];

  if (isCard32Game) {
    ['player8', 'player9', 'player10', 'player11'].forEach((key, idx) => {
      if (distributedCards[key]?.length > 0) {
        playerEntries.push({
          key,
          label: bettingData?.sub?.[idx]?.nat || key.toUpperCase(),
          cards: distributedCards[key],
        });
      }
    });
  } else if (isLuckyCard) {
    ['card'].forEach((key) => {
      if (distributedCards[key]?.length > 0) {
        playerEntries.push({
          key,
          label: 'card',
          cards: distributedCards[key],
        });
      }
    });
  } else {
    // Default: playerA/player and playerB/banker
    const playerACards = distributedCards.playerA || distributedCards.player;
    const playerBCards = distributedCards.playerB || distributedCards.banker;
    if (playerACards) {
      playerEntries.push({
        key: 'playerA',
        label: bettingData?.sub?.[0]?.nat,
        cards: playerACards,
      });
    }
    if (playerBCards) {
      playerEntries.push({
        key: 'playerB',
        label: bettingData?.sub?.[1]?.nat,
        cards: playerBCards,
      });
    }
  }
  // Reference overlay types: dolidana/sicbo = DICE, superover family = BALLS
  const DICE_GAMES = new Set(['dolidana', 'sicbo', 'sicbo2']);
  const BALL_GAMES = new Set([
    'superover',
    'superover2',
    'superover3',
    'cmatch20',
  ]);
  const ballFor = (code) => {
    const rank =
      String(code).length > 2 ? String(code).slice(0, -2) : String(code);
    if (['J', 'Q', 'K'].includes(rank)) return '/balls/cricket20/wicket.png';
    if (rank === 'A') return '/balls/cricket20/ball1.png';
    if (['7', '8', '9', '10'].includes(rank))
      return '/balls/cricket20/ball0.png';
    return `/balls/cricket20/ball${rank}.png`;
  };
  const revealed = cards.filter((c) => c && c !== '1');

  // Joker/poison family: reference overlay me alag .joker-card block hota hy
  const JOKER_GAMES = new Set(['joker1', 'joker20', 'joker120']);
  const POISON_GAMES = new Set(['poison', 'poison20']);
  const poisonCard = distributedCards.poison?.[0] || '1';

  if (DICE_GAMES.has(gameType) || BALL_GAMES.has(gameType)) {
    return (
      <div>
        <div className='text-[10px] font-bold text-white'>
          RID: {bettingData.mid}
        </div>
        <div className='flex gap-1'>
          {revealed.map((c, i) => (
            <img
              key={i}
              src={DICE_GAMES.has(gameType) ? `/dice/dice${c}.png` : ballFor(c)}
              alt={c}
              className='h-10 w-10 drop-shadow'
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='text-[10px] font-bold text-white'>
        RID: {bettingData.mid}
      </div>

      {/* Board Cards */}
      {distributedCards.board && distributedCards.board.length > 0 && (
        <div className='mb-1'>
          <h4 className='text-xs font-bold text-white'>BOARD</h4>
          <div className='flex gap-1'>
            {distributedCards.board.map((card, index) => (
              <CricketCard key={`board-${index}`} card={card} />
            ))}
          </div>
        </div>
      )}

      {JOKER_GAMES.has(gameType) && (
        <div className='joker-card mb-1 text-center'>
          <h4 className='text-playerb mb-1 text-xs font-bold'>Joker</h4>
          <span>
            <img src='/joker/14.png' alt='Joker' className='h-14 w-auto' />
          </span>
        </div>
      )}
      {POISON_GAMES.has(gameType) && (
        <div className='joker-card mb-1'>
          <h5 className='text-playerb mb-1 text-xs font-bold'>Poison</h5>
          <div className='flip-card-container'>
            <CricketCard card={poisonCard} />
          </div>
        </div>
      )}
      {playerEntries
        .filter(
          (entry) => !(POISON_GAMES.has(gameType) && entry.key === 'poison')
        )
        .map((entry) => (
          <div key={entry.key} className='mb-1'>
            <h4 className='text-xs font-bold text-white uppercase'>
              {entry.label}
            </h4>
            <div className='flex gap-1'>
              {entry.cards.map((card, index) => {
                const isFirstCard = index === 0;
                const isLastCard = index === entry.cards.length - 1;
                const shouldRotateFirst =
                  isBaccaratGame && entry.key === 'playerA' && isFirstCard;
                const shouldRotateLast =
                  isBaccaratGame && entry.key === 'playerB' && isLastCard;
                if (shouldRotateFirst && card === '1') return null;
                if (shouldRotateLast && card === '1') return null;
                return (
                  <div
                    key={`${entry.key}-${index}`}
                    className={
                      shouldRotateFirst
                        ? 'mr-1 rotate-90'
                        : shouldRotateLast
                          ? 'ml-1 rotate-90'
                          : ''
                    }
                  >
                    <CricketCard card={card} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
});

export default CardsDisplay;
