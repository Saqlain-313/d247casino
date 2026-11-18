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
        { key: 'a', label: 'A', cls: 'playera', cards: [] },
        { key: 'b', label: 'B', cls: 'playerb', cards: [] },
        { key: 'c', label: 'C', cls: 'playerc', cards: [] },
        { key: 'd', label: 'D', cls: 'playerd', cards: [] },
        { key: 'e', label: 'E', cls: 'playere', cards: [] },
        { key: 'f', label: 'F', cls: 'playerf', cards: [] },
      ];
    default:
      return [];
  }
}

const isWinningColumn = (slug, col, rawWinner) => {
  if (!rawWinner) return false;
  const w = String(rawWinner).trim().toLowerCase();
  if (slug === 'vdtl20') {
    if (w === '1' || w.includes('dragon')) return col.key === 'dragon';
    if (w === '21' || w === '2' || w.includes('tiger'))
      return col.key === 'tiger';
    if (w === '41' || w === '3' || w.includes('lion'))
      return col.key === 'lion';
  }
  if (w === '1' && ['playera', 'dragon', 'amar'].includes(col.key)) return true;
  if (w === '2' && ['playerb', 'tiger', 'akbar'].includes(col.key)) return true;
  if (w === '3' && ['playerc', 'lion', 'anthony'].includes(col.key))
    return true;
  const label = (col.label || col.key).toLowerCase();
  return w.includes(label) || label.includes(w);
};

// vbtable (Bollywood Table): dealt card ASS->a, AHH/ACC/ADD->b, KSS/QSS/JSS->c, KDD/KCC->d, KHH/QCC/QDD/QHH->e, JHH/JCC/JDD->f
const vbtableColForCard = (code) => {
  const c = String(code || '')
    .trim()
    .toLowerCase();
  if (!c || c === '1') return '';
  if (c === 'ass') return 'a';
  if (c === 'ahh' || c === 'acc' || c === 'add') return 'b';
  if (c === 'kss' || c === 'qss' || c === 'jss') return 'c';
  if (c === 'kdd' || c === 'kcc') return 'd';
  if (c === 'khh' || c === 'qcc' || c === 'qdd' || c === 'qhh') return 'e';
  if (c === 'jhh' || c === 'jcc' || c === 'jdd') return 'f';
  return '';
};

// AAA: deal hua card hi winner batata hy (A-6 Amar, 7-10 Akbar, J-K Anthony)
const aaaWinnerFromCard = (code) => {
  const s = String(code || '')
    .trim()
    .toUpperCase();
  if (!s || s === '1') return '';
  const rank = s.length === 4 ? s.slice(0, 2) : s.slice(0, 1);
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
    .map((x) => x.trim())
    .filter(Boolean);
  const firstCard = cards.find((c) => c !== '1') || '';
  const revealed = Boolean(firstCard);
  const columns = getColumns(slug, cards);
  const dealerBg = VIMG[`${slug}.png`];
  const liveWin = bettingData?.rdesc || winnerLabel || '';
  const btableWinnerCol = slug === 'vbtable' ? vbtableColForCard(cards[0]) : '';

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
            slug === 'vaaa' ? aaaWinnerFromCard(firstCard) : '';
          const won = isWinningColumn(slug, col, derivedWinner || liveWin);
          const colCards =
            slug === 'vaaa'
              ? revealed && won
                ? [firstCard]
                : []
              : slug === 'vbtable'
                ? btableWinnerCol === col.key
                  ? [cards[0]]
                  : []
                : col.cards;
          const cardClass = slug === 'vbtable' ? '' : `vcasinocards-${col.cls}`;
          return (
            <div key={col.key} className={cardClass}>
              {col.label && (
                <h5
                  className={`text-center ${
                    slug === 'vdtl20' && won ? 'winner-animation' : ''
                  }`}
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
              {won && slug !== 'vdtl20' && slug !== 'vbtable' && (
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

      {slug === 'vbtable' && (
        <div className='odds-title'>
          <div>
            <span className='card-character black-card ml-1'>{'A}'}</span>
          </div>
          <div>
            <span className='card-character red-card d-block ml-1'>{'A{'}</span>
            <span className='card-character black-card d-block ml-1'>
              {'A]'}
            </span>
            <span className='card-character red-card d-block ml-1'>{'A['}</span>
          </div>
          <div>
            <span className='card-character black-card d-block ml-1'>
              {'K}'}
            </span>
            <span className='card-character black-card d-block ml-1'>
              {'Q}'}
            </span>
            <span className='card-character black-card d-block ml-1'>
              {'J}'}
            </span>
          </div>
          <div>
            <span className='card-character red-card d-block ml-1'>{'K['}</span>
            <span className='card-character black-card d-block ml-1'>
              {'K]'}
            </span>
          </div>
          <div>
            <span className='card-character red-card d-block ml-1'>{'K{'}</span>
            <span className='card-character black-card d-block ml-1'>
              {'Q]'}
            </span>
            <span className='card-character red-card d-block ml-1'>{'Q['}</span>
            <span className='card-character red-card d-block ml-1'>{'Q{'}</span>
          </div>
          <div>
            <span className='card-character red-card d-block ml-1'>{'J{'}</span>
            <span className='card-character black-card d-block ml-1'>
              {'J]'}
            </span>
            <span className='card-character red-card d-block ml-1'>{'J['}</span>
          </div>
        </div>
      )}

      <div className='clock flip-clock-wrapper'>
        <FlipClock seconds={bettingData?.lt} />
      </div>
    </div>
  );
});

export default VirtualGameScreen;
