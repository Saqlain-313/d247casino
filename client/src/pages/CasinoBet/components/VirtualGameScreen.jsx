import { memo } from 'react';
import FlipClock from '../../gamedetails/FlipClock';
import CricketCard from '../../gamedetails/CricketCard';
import env from '../../../config/env';

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
const CDN = env.assetCdnUrl;

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

// Parse card code e.g. "JHH", "10SS", "ADD" -> { rank: 1..13, suit: 'S'|'H'|'C'|'D' }
const SUIT_RANK = { S: 4, H: 3, C: 2, D: 1 };
const parseCard = (code) => {
  const s = String(code || '')
    .trim()
    .toUpperCase();
  if (!s || s === '1') return null;
  const m = s.match(/^(10|[2-9AJQK])([SHDC])/);
  if (!m) return null;
  const rMap = { A: 1, J: 11, Q: 12, K: 13 };
  return { rank: rMap[m[1]] || Number(m[1]), suit: m[2] };
};
const cmpCard = (a, b) => {
  if (a.rank !== b.rank) return a.rank > b.rank ? 1 : -1;
  return (SUIT_RANK[a.suit] || 0) - (SUIT_RANK[b.suit] || 0);
};
const rankTeenHand = (hand) => {
  const rs = hand.map((c) => c.rank).sort((a, b) => a - b);
  const flush = hand.every((c) => c.suit === hand[0].suit);
  const trio = rs[0] === rs[2];
  const pair = rs[0] === rs[1] || rs[1] === rs[2];
  let straight = false;
  let high = [...rs].map((r) => (r === 1 ? 14 : r)).sort((a, b) => b - a);
  if (new Set(rs).size === 3) {
    if (rs[2] - rs[0] === 2) straight = true;
    else if (rs[0] === 1 && rs[1] === 12 && rs[2] === 13) straight = true;
    else if (rs[0] === 1 && rs[1] === 2 && rs[2] === 3) {
      straight = true;
      high = [3, 2, 1];
    }
  }
  let cat = 1;
  if (trio) cat = 6;
  else if (straight && flush) cat = 5;
  else if (straight) cat = 4;
  else if (flush) cat = 3;
  else if (pair) {
    cat = 2;
    const p = rs[0] === rs[1] ? rs[0] : rs[1];
    const k = rs[0] === rs[1] ? rs[2] : rs[0];
    high = [p === 1 ? 14 : p, k === 1 ? 14 : k];
  }
  return { cat, high };
};
const cmpTeen = (a, b) => {
  if (a.cat !== b.cat) return a.cat > b.cat ? 1 : -1;
  for (let i = 0; i < Math.max(a.high.length, b.high.length); i++) {
    const x = a.high[i] || 0;
    const y = b.high[i] || 0;
    if (x !== y) return x > y ? 1 : -1;
  }
  return 0;
};

// Derive the CURRENT round's winner strictly from dealt cards (never previous round!)
const deriveWinnerFromCards = (slug, cards) => {
  if (slug === 'vaaa') return aaaWinnerFromCard(cards[0]);
  if (slug === 'vdt6') {
    const d = parseCard(cards[0]);
    const t = parseCard(cards[1]);
    if (!d || !t) return '';
    return cmpCard(d, t) >= 0 ? 'Dragon' : 'Tiger';
  }
  if (slug === 'vdtl20') {
    const d = parseCard(cards[0]);
    const t = parseCard(cards[1]);
    const l = parseCard(cards[2]);
    if (!d || !t || !l) return '';
    if (cmpCard(d, t) > 0 && cmpCard(d, l) > 0) return 'Dragon';
    if (cmpCard(t, d) > 0 && cmpCard(t, l) > 0) return 'Tiger';
    return 'Lion';
  }
  if (['vteen', 'vteen20', 'vteenmuf'].includes(slug)) {
    const parsed = cards.slice(0, 6).map(parseCard);
    if (parsed.length < 6 || parsed.some((c) => !c)) return '';
    const ra = rankTeenHand([parsed[0], parsed[2], parsed[4]]);
    const rb = rankTeenHand([parsed[1], parsed[3], parsed[5]]);
    let c = cmpTeen(ra, rb);
    if (slug === 'vteenmuf') c = -c;
    if (c === 0) return '';
    return c > 0 ? 'Player A' : 'Player B';
  }
  return '';
};

const VirtualGameScreen = memo(function VirtualGameScreen({
  slug,
  bettingData,
  showWinner,
  winnerLabel,
  latestResultMid,
}) {
  const cards = String(bettingData?.card || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  const firstCard = cards.find((c) => c !== '1') || '';
  const revealed = Boolean(firstCard);
  const columns = getColumns(slug, cards);
  const dealerBg = VIMG[`${slug}.png`];
  const btableWinnerCol = slug === 'vbtable' ? vbtableColForCard(cards[0]) : '';

  // Only show winner overlay for the CURRENT round when cards are actually dealt
  // (never bleed previous round's resultData.res[0] into the next round's betting phase!)
  const sameRoundResult =
    Boolean(bettingData?.mid) &&
    Boolean(latestResultMid) &&
    String(bettingData.mid) === String(latestResultMid);
  const cardWinner = deriveWinnerFromCards(slug, cards);
  const currentRoundWin =
    bettingData?.rdesc ||
    cardWinner ||
    (revealed && showWinner && sameRoundResult ? winnerLabel : '') ||
    '';
  const showWinnerBadgeForSlug = ![
    'vdtl20',
    'vbtable',
    'vlucky7',
    'vtrio',
  ].includes(slug);

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
          const won = Boolean(
            currentRoundWin && isWinningColumn(slug, col, currentRoundWin)
          );
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
          const cardClass =
            slug === 'vbtable' || slug === 'vlucky7' || slug === 'vtrio'
              ? ''
              : `vcasinocards-${col.cls}`;
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
              {won && showWinnerBadgeForSlug && (
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

      <FlipClock seconds={bettingData?.lt} className='clock' />
    </div>
  );
});

export default VirtualGameScreen;
