import { memo } from 'react';
import FlipClock from '../../gamedetails/FlipClock';
import CricketCard from '../../gamedetails/CricketCard';

// Virtual casino games (reference .vcasino, style.css @8580-8660): iframe
// stream NAHI hota — dealer background image + green felt (table-bg) +
// bottom-center cards overlay + flip countdown clock.
export const VIRTUAL_SLUGS = new Set([
  'vlucky7',
  'vtrio',
  'vdtl20',
  'vteenmuf',
  'vaaa',
  'vbtable',
  'vdt6',
  'vteen',
  'vteen20',
]);

const virtualImgs = import.meta.glob('../../../assets/virtual-casino/*', {
  eager: true,
  import: 'default',
});
const byFile = (map) => {
  const out = {};
  for (const [p, url] of Object.entries(map)) out[p.split('/').pop()] = url;
  return out;
};
const VIMG = byFile(virtualImgs);
const CDN = 'https://cdn.926assets.com/g3ver/v107/static/front/img';

// Har virtual game ka cards layout: bettingData.card (comma codes) se columns.
function getColumns(slug, cards) {
  const at = (i) => cards[i] || '1';
  switch (slug) {
    case 'vdtl20':
      return [
        { key: 'dragon', label: 'Dragon', cls: 'playera', cards: [at(0)] },
        { key: 'tiger', label: 'Tiger', cls: 'playerb', cards: [at(1)] },
        { key: 'lion', label: 'Lion', cls: 'playerc', cards: [at(2)] },
      ];
    case 'vdt6':
      return [
        { key: 'dragon', label: 'Dragon', cls: 'playera', cards: [at(0)] },
        { key: 'tiger', label: 'Tiger', cls: 'playerb', cards: [at(1)] },
      ];
    case 'vteen20':
    case 'vteen':
    case 'vteenmuf':
      return [
        {
          key: 'playera',
          label: 'Player A',
          cls: 'playera',
          cards: [at(0), at(2), at(4)],
        },
        {
          key: 'playerb',
          label: 'Player B',
          cls: 'playerb',
          cards: [at(1), at(3), at(5)],
        },
      ];
    case 'vtrio':
      return [
        { key: 'trio', label: '', cls: 'trio', cards: [at(0), at(1), at(2)] },
      ];
    case 'vlucky7':
      return [{ key: 'center', label: '', cls: 'center', cards: [at(0)] }];
    case 'vaaa':
      // AAA me sirf EK card deal hota hy — sirf winner column me.
      return [
        {
          key: 'amar',
          label: 'Amar',
          cls: 'playera',
          cards: [],
          winCard: at(0),
        },
        {
          key: 'akbar',
          label: 'Akbar',
          cls: 'playerb',
          cards: [],
          winCard: at(0),
        },
        {
          key: 'anthony',
          label: 'Anthony',
          cls: 'playerc',
          cards: [],
          winCard: at(0),
        },
      ];
    case 'vbtable':
      return [
        {
          key: 'player',
          label: 'Player',
          cls: 'playera',
          color: '#33c6ff',
          cards: [at(0), at(1)],
        },
        {
          key: 'banker',
          label: 'Banker',
          cls: 'playerb',
          color: '#ff4500',
          cards: [at(2), at(3)],
        },
      ];
    default:
      return [];
  }
}

const isWinningColumn = (col, winnerLabel) => {
  if (!winnerLabel) return false;
  const w = String(winnerLabel).toLowerCase();
  const label = (col.label || col.key).toLowerCase();
  return w.includes(label) || label.includes(w);
};

// AAA: deal hua card hi winner batata hy (A-6 Amar, 7-10 Akbar, J-K Anthony)
const aaaWinnerFromCard = (code) => {
  const rank = String(code).slice(0, -2);
  if (['A', '2', '3', '4', '5', '6'].includes(rank)) return 'Amar';
  if (['7', '8', '9', '10'].includes(rank)) return 'Akbar';
  if (['J', 'Q', 'K'].includes(rank)) return 'Anthony';
  return '';
};

const VirtualGameScreen = memo(function VirtualGameScreen({
  slug,
  bettingData,
  showWinner,
  winnerLabel,
}) {
  const cards = String(bettingData?.card || '')
    .split(',')
    .filter(Boolean);
  const revealed = cards.some((c) => c !== '1');
  const columns = getColumns(slug, cards);
  const dealerBg = VIMG[`${slug}.png`];

  return (
    <div
      className='casino-video vcasino'
      style={
        VIMG['table-bg.jpg']
          ? { backgroundImage: `url(${VIMG['table-bg.jpg']})` }
          : undefined
      }
    >
      <div className='video-box-container'>
        <div className='casino-video-box'>
          <img
            src={dealerBg}
            onError={(e) => {
              e.currentTarget.src = `${CDN}/virtual-casino/dealer-bg/${slug}.png`;
            }}
            className='vcasinobg'
            alt={`${slug} dealer`}
          />
        </div>
      </div>

      <div className='casino-video-cards'>
        {columns.map((col) => {
          const derivedWinner =
            slug === 'vaaa'
              ? aaaWinnerFromCard(cards.find((c) => c !== '1') || '')
              : '';
          const won = isWinningColumn(col, winnerLabel || derivedWinner);
          const colCards =
            slug === 'vaaa'
              ? revealed && won
                ? [col.winCard]
                : []
              : col.cards;
          return (
            <div key={col.key} className={`vcasinocards-${col.cls}`}>
              {col.label && (
                <h5
                  className='text-center'
                  style={col.color ? { color: col.color } : undefined}
                >
                  {col.label}
                </h5>
              )}
              <div className='flip-card-container'>
                {colCards.map((c, i) => (
                  <CricketCard key={`${col.key}-${i}`} card={c} />
                ))}
              </div>
              {won && (
                <img
                  src={VIMG['winner.png']}
                  onError={(e) => {
                    e.currentTarget.src = `${CDN}/winner.png`;
                  }}
                  className='virtual-winner winner-animation'
                  alt='Winner'
                />
              )}
            </div>
          );
        })}
      </div>

      <div className='clock flip-clock-wrapper'>
        <FlipClock seconds={bettingData?.lt} />
      </div>
    </div>
  );
});

export default VirtualGameScreen;
