import { memo } from 'react';
import CricketCard from '../../gamedetails/CricketCard';

const NO_CARD_OVERLAY_SLUGS = new Set([
  'worli3',
  'goal',
  'goal2',
  'teenunique',
  'lucky15',
  'ballbyball',
  'baccarat',
  'baccarat2',
  'pbaccarat',
  'superover2',
  'sicbo',
  'sicbo2',
]);

const ROULETTE_SLUGS = new Set([
  'roulette11',
  'roulette12',
  'roulette13',
  'ourroullete',
]);
const BALL_GAMES = new Set(['superover', 'superover3']);
const ONE_CARD_GAMES = new Set([
  'aaa',
  'aaa2',
  'btable',
  'btable2',
  'lucky5',
  'lucky7',
  'lucky7eu',
  'lucky7eu2',
  'plucky7',
  'cmatch20',
]);
const TWO_CARD_GAMES = new Set([
  'dt20',
  'dt202',
  'dt6',
  'pdt20',
  'pdt6',
  'cmeter1',
]);
const THREE_CARD_FLAT_GAMES = new Set([
  'worli',
  'worli2',
  'trio',
  '3cardj',
  'lottcard',
  'dtl20',
]);
const JOKER_SIX_GAMES = new Set(['joker1', 'joker120']);
const JOKER_SEVEN_GAMES = new Set(['joker20']);
const POISON_SEVEN_GAMES = new Set(['poison', 'poison20']);
const CARD32_GAMES = new Set(['card32', 'card32eu', 'pcard32']);

const splitCards = (raw) =>
  String(raw || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const splitGroups = (raw) =>
  String(raw || '')
    .split('|')
    .map((grp) => splitCards(grp))
    .filter((grp) => grp.length > 0);

const cardRankNum = (code, { faceAsTen = false, aceOne = true } = {}) => {
  const s = String(code ?? '')
    .trim()
    .toUpperCase();
  if (!s || s === '1') return 0;
  const m = s.match(/^(10|[2-9AJQK])/);
  if (!m) return 0;
  if (m[1] === 'A') return aceOne ? 1 : 1;
  if (m[1] === 'J') return faceAsTen ? 0 : 11;
  if (m[1] === 'Q') return faceAsTen ? 0 : 12;
  if (m[1] === 'K') return faceAsTen ? 0 : 13;
  if (m[1] === '10' && faceAsTen) return 0;
  return Number(m[1]) || 0;
};

const superoverBallSrc = (code) => {
  const s = String(code || '')
    .trim()
    .toUpperCase();
  const rank = s.length === 4 ? s.slice(0, 2) : s.slice(0, 1);
  if (['J', 'Q', 'K'].includes(rank))
    return '/assets/img/superover/balls/wicket.png';
  if (rank === 'A') return '/assets/img/superover/balls/A.png';
  if (rank === '10') return '/assets/img/superover/balls/10.png';
  if (['2', '3', '4', '6'].includes(rank))
    return `/assets/img/superover/balls/ball${rank}.png`;
  if (rank === '5') return '/balls/cricket20/ball5.png';
  return '/assets/img/superover/balls/ball0.png';
};

export const hasVideoCardsOverlay = (slug, bettingDataOrCard) => {
  const s = String(slug || '').toLowerCase();
  if (!s || NO_CARD_OVERLAY_SLUGS.has(s)) return false;

  const isObj = bettingDataOrCard && typeof bettingDataOrCard === 'object';
  const rawCard = isObj ? bettingDataOrCard.card : bettingDataOrCard;
  const cards = splitCards(String(rawCard || '').replace(/\|/g, ','));

  if (ROULETTE_SLUGS.has(s)) {
    return Boolean(cards[0] && cards[0] !== '1' && /^\d+$/.test(cards[0]));
  }
  if (s === 'dolidana') return cards.length > 1;
  if (s === 'dum10') {
    const lcard = isObj ? splitCards(bettingDataOrCard.lcard) : [];
    return Boolean((cards[0] && cards[0] !== '1') || lcard.length > 0);
  }
  if (s === 'ab20') {
    const aall = isObj ? splitCards(bettingDataOrCard.aall) : [];
    const ball = isObj ? splitCards(bettingDataOrCard.ball) : [];
    return Boolean(aall.length || ball.length || cards.some((c) => c !== '1'));
  }
  if (
    ['ab3', 'ab4', 'abj', 'trap', 'notenum', 'teen1', 'teen120'].includes(s)
  ) {
    return Boolean(cards[0] && cards[0] !== '1');
  }
  if (
    [
      'queen',
      'card32',
      'card32eu',
      'pcard32',
      'race20',
      'superover',
      'superover3',
    ].includes(s)
  ) {
    return cards.some((c) => c && c !== '1');
  }
  return Boolean(rawCard);
};

// Stable index key guarantees CSS 3D flip animation runs on card reveal ('1' -> card code)
const CardStrip = ({ list }) => (
  <div className='flip-card-container'>
    {list.map((c, idx) => (
      <CricketCard key={idx} card={c} />
    ))}
  </div>
);

const CardsDisplay = memo(function CardsDisplay({ bettingData }) {
  const slug = String(bettingData?.gtype || '').toLowerCase();
  if (!slug || NO_CARD_OVERLAY_SLUGS.has(slug)) return null;

  const rawCard = bettingData?.card;
  const cards = splitCards(rawCard);
  const at = (i) => cards[i] || '1';

  // 1. Roulette winning number badge (D247 ourroullete/3298.js)
  if (ROULETTE_SLUGS.has(slug)) {
    const num = cards[0];
    if (!num || num === '1' || !/^\d+$/.test(num)) return null;
    return (
      <div>
        <div className='flip-card-container'>
          <div className='flip-card'>
            <div className='flip-card-inner'>
              <div className='flip-card-front'>
                <img
                  src={`/assets/img/roulette/${num}.png`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  alt={`Roulette ${num}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Doli Dana dice (dolidana/9008.js -> only renders when cards.length > 1)
  if (slug === 'dolidana') {
    if (cards.length <= 1) return null;
    return (
      <div>
        <div className='flip-card-container'>
          {cards.slice(0, 2).map((d, i) => (
            <div className='flip-card' key={i}>
              <div className='flip-card-inner'>
                <div className='flip-card-front'>
                  <img src={`/assets/img/dice${d}.png`} alt={`Dice ${d}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Superover / Superover3 grouped over balls (superover/1013.js)
  if (BALL_GAMES.has(slug)) {
    const groups = splitGroups(rawCard);
    if (!groups.length || !groups.some((g) => g.some((c) => c !== '1')))
      return null;
    return (
      <>
        {groups.map((grp, gi) => {
          const valid = grp.filter((c) => c && c !== '1');
          if (!valid.length) return null;
          return (
            <div key={gi} className='mt-1 flex gap-1'>
              {valid.map((c, bi) => (
                <div key={bi}>
                  <img
                    src={superoverBallSrc(c)}
                    alt={c}
                    className='h-8 w-8 drop-shadow'
                    onError={(e) => {
                      e.currentTarget.src = '/balls/cricket20/ball0.png';
                    }}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </>
    );
  }

  // 4. Cricket v3 grouped flip-card strips (cricketv3/4650.js)
  if (slug === 'cricketv3') {
    const groups = splitGroups(rawCard);
    if (!groups.length) return null;
    return (
      <>
        {groups.map((grp, gi) => (
          <div key={gi} className='mt-1'>
            <CardStrip list={grp} />
          </div>
        ))}
      </>
    );
  }

  // 5. Dum 10 (dum10/3423.js)
  if (slug === 'dum10') {
    const prevCards = splitCards(bettingData?.lcard).reverse();
    const csum = bettingData?.csum ?? 0;
    const nat = bettingData?.sub?.[0]?.nat || '';
    if ((!at(0) || at(0) === '1') && !prevCards.length) return null;
    return (
      <>
        <div className='dkd-total mt-1 mb-1'>
          <div>
            <div>
              <div>Curr. Total:</div>
              <div className='numeric text-playerb'>{csum}</div>
            </div>
            <div>Card #: {prevCards.length}</div>
          </div>
          <div>{nat}</div>
        </div>
        {prevCards.length > 0 && (
          <div className='ab-cards-container'>
            <div className='ms-2 flex gap-1 overflow-x-auto'>
              {prevCards.slice(0, 5).map((c, idx) => (
                <img
                  key={`${idx}-${c}`}
                  src={`/assets/img/cards/${c}.jpg`}
                  alt={c}
                  className='h-[42px] w-auto rounded-[2px]'
                />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // 6. Trap (trap/7031.js -> even idx A + odd idx B with live point totals)
  if (slug === 'trap') {
    if (!cards[0] || cards[0] === '1') return null;
    const aList = [];
    const bList = [];
    cards.forEach((c, idx) => {
      if (c === '1') return;
      if (idx % 2 === 0) aList.push(c);
      else bList.push(c);
    });
    const sumA = aList.reduce((acc, c) => acc + cardRankNum(c), 0);
    const sumB = bList.reduce((acc, c) => acc + cardRankNum(c), 0);
    return (
      <div className='row row5'>
        <div className='col-6'>
          <div>
            <div>
              <b>A</b>
            </div>
            <div className='text-fancy'>{sumA}</div>
          </div>
          <div className='v-slider flex flex-col gap-1'>
            {aList.slice(-5).map((c, i) => (
              <img key={i} src={`/assets/img/cards/${c}.jpg`} alt={c} />
            ))}
          </div>
        </div>
        <div className='col-6'>
          <div>
            <div>
              <b>B</b>
            </div>
            <div className='text-fancy'>{sumB}</div>
          </div>
          <div className='v-slider flex flex-col gap-1'>
            {bList.slice(-5).map((c, i) => (
              <img key={i} src={`/assets/img/cards/${c}.jpg`} alt={c} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 7. Race 20 (race20/709.js -> Cards count, Total Points + 4 Suit lanes + Kings)
  if (slug === 'race20') {
    const sp = [];
    const ht = [];
    const cl = [];
    const dm = [];
    let dealtCount = 0;
    let totalPts = 0;
    for (const c of cards) {
      if (!c || c === '1') continue;
      dealtCount += 1;
      const suit = c.slice(-2);
      if (suit === 'SS') sp.push(c);
      else if (suit === 'HH') ht.push(c);
      else if (suit === 'CC') cl.push(c);
      else if (suit === 'DD') dm.push(c);
      totalPts += cardRankNum(c);
    }
    if (dealtCount === 0) return null;
    const suitRows = [
      { icon: 'spade.png', list: sp, king: 'KSS' },
      { icon: 'heart.png', list: ht, king: 'KHH' },
      { icon: 'club.png', list: cl, king: 'KCC' },
      { icon: 'diamond.png', list: dm, king: 'KDD' },
    ];
    return (
      <>
        <div className='race-total-point'>
          <div className='text-white'>
            <div>Cards</div>
            <div>{dealtCount}</div>
          </div>
          <div className='text-white'>
            <div>Points</div>
            <div>{totalPts}</div>
          </div>
        </div>
        {suitRows.map((row, rIdx) => (
          <div key={row.icon} className={rIdx > 0 ? 'mt-1' : ''}>
            <div className='flip-card-container'>
              <div className='flip-card'>
                <img src={`/assets/img/icons/${row.icon}`} alt={row.icon} />
              </div>
              {row.list.length > 0 && (
                <>
                  {row.list.map((c, ci) => (
                    <CricketCard key={ci} card={c} />
                  ))}
                  <CricketCard card={row.king} />
                </>
              )}
            </div>
          </div>
        ))}
      </>
    );
  }

  // 8. Andar Bahar 2 / ABJ (abj/563.js -> cards[0], A=[2]+even>2, B=[1]+odd>2)
  if (slug === 'abj') {
    if (!cards[0] || cards[0] === '1') return null;
    const aExtra = [];
    const bExtra = [];
    cards.forEach((c, idx) => {
      if (c !== '1' && idx > 2) {
        if (idx % 2 !== 0) bExtra.push(c);
        else aExtra.push(c);
      }
    });
    aExtra.reverse();
    bExtra.reverse();
    return (
      <div className='ab-cards-container'>
        <div className='row row5 align-items-center'>
          <div className='col-1'>
            <div className='row row5'>
              <div className='col-12'>
                <b>A</b>
              </div>
            </div>
            <div className='row row5'>
              <div className='col-12'>
                <b>B</b>
              </div>
            </div>
          </div>
          <div className='col-2'>
            <CricketCard card={at(0)} />
          </div>
          <div className='col-9'>
            <div className='row row5 mb-1'>
              <div className='col-3'>
                <CricketCard card={at(2)} />
              </div>
              <div className='col-9 flex gap-1 overflow-x-auto'>
                {aExtra.slice(0, 3).map((c, i) => (
                  <img
                    key={i}
                    src={`/assets/img/cards/${c}.jpg`}
                    alt={c}
                    className='h-[38px] w-auto'
                  />
                ))}
              </div>
            </div>
            <div className='row row5'>
              <div className='col-3'>
                <CricketCard card={at(1)} />
              </div>
              <div className='col-9 flex gap-1 overflow-x-auto'>
                {bExtra.slice(0, 3).map((c, i) => (
                  <img
                    key={i}
                    src={`/assets/img/cards/${c}.jpg`}
                    alt={c}
                    className='h-[38px] w-auto'
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 9. AB20 (ab20/2231.js -> aall / ball sliders)
  if (slug === 'ab20') {
    const aCards = bettingData?.aall
      ? splitCards(bettingData.aall).reverse()
      : cards.filter((c, i) => c !== '1' && i > 0 && i % 2 === 1).reverse();
    const bCards = bettingData?.ball
      ? splitCards(bettingData.ball).reverse()
      : cards.filter((c, i) => c !== '1' && i % 2 === 0).reverse();
    if (!aCards.length && !bCards.length) return null;
    return (
      <div className='ab-cards-container'>
        {aCards.length > 0 && (
          <>
            <h5>Andar</h5>
            <div className='ms-4 flex gap-1 overflow-x-auto'>
              {aCards.slice(0, 4).map((c, i) => (
                <img
                  key={i}
                  src={`/assets/img/cards/${c}.jpg`}
                  alt={c}
                  className='h-[42px] w-auto'
                />
              ))}
            </div>
          </>
        )}
        {bCards.length > 0 && (
          <>
            <h5>Bahar</h5>
            <div className='ms-4 flex gap-1 overflow-x-auto'>
              {bCards.slice(0, 4).map((c, i) => (
                <img
                  key={i}
                  src={`/assets/img/cards/${c}.jpg`}
                  alt={c}
                  className='h-[42px] w-auto'
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // 10. AB3 & AB4 (ab3/2146.js, ab4/1337.js -> Next Card Count + Andar/Bahar sliders)
  if (slug === 'ab3' || slug === 'ab4') {
    if (!cards[0] || cards[0] === '1') return null;
    const valid = cards.filter((c) => c !== '1');
    const nextCardCount = valid.length + 1;
    const maxCount = slug === 'ab3' ? 50 : 150;
    const aCards = [];
    const bCards = [];
    let lastSide = '';
    cards.forEach((c, idx) => {
      if (c === '1') return;
      if (idx % 2 === 0) {
        bCards.push(c);
        lastSide = 'Bahar';
      } else {
        aCards.push(c);
        lastSide = 'Andar';
      }
    });
    aCards.reverse();
    bCards.reverse();
    return (
      <>
        {nextCardCount <= maxCount && (
          <span className='text-white'>
            Next Card Count:{' '}
            <span className='text-warning'>
              {nextCardCount} / {lastSide}
            </span>
          </span>
        )}
        <div className='ab-cards-container'>
          {aCards.length > 0 && (
            <>
              <h5>Andar</h5>
              <div className='ms-4 flex gap-1 overflow-x-auto'>
                {aCards.slice(0, 4).map((c, i) => (
                  <img
                    key={i}
                    src={`/assets/img/cards/${c}.jpg`}
                    alt={c}
                    className='h-[42px] w-auto'
                  />
                ))}
              </div>
            </>
          )}
          {bCards.length > 0 && (
            <>
              <h5>Bahar</h5>
              <div className='ms-4 flex gap-1 overflow-x-auto'>
                {bCards.slice(0, 4).map((c, i) => (
                  <img
                    key={i}
                    src={`/assets/img/cards/${c}.jpg`}
                    alt={c}
                    className='h-[42px] w-auto'
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  if (!rawCard) return null;

  // 11. Single-card games
  if (ONE_CARD_GAMES.has(slug)) {
    return (
      <div>
        <CardStrip list={[at(0)]} />
      </div>
    );
  }

  // 12. Two-card flat games
  if (TWO_CARD_GAMES.has(slug)) {
    return (
      <div className='d-flex justify-content-between flex-wrap'>
        <div>
          <CardStrip list={[at(0), at(1)]} />
        </div>
      </div>
    );
  }

  // 13. 1-Card Teenpatti (teen1, teen120 -> only show when cards[0] != '1')
  if (slug === 'teen1' || slug === 'teen120') {
    if (!cards[0] || cards[0] === '1') return null;
    return (
      <div>
        <div>
          <h5>Player</h5>
          <CardStrip list={[at(0)]} />
        </div>
        <div className='mt-1'>
          <h5>Dealer</h5>
          <CardStrip list={[at(1)]} />
        </div>
      </div>
    );
  }

  // 14. Three-card flat games (worli, worli2, trio, 3cardj, dtl20, lottcard)
  if (THREE_CARD_FLAT_GAMES.has(slug)) {
    if (slug === 'lottcard') {
      return (
        <>
          <div>
            <CardStrip list={[at(0)]} />
          </div>
          <div className='mt-1'>
            <CardStrip list={[at(1)]} />
          </div>
          <div className='mt-1'>
            <CardStrip list={[at(2)]} />
          </div>
        </>
      );
    }
    if (slug === 'dtl20') {
      return (
        <div className='d-flex justify-content-between flex-wrap'>
          <div>
            <CardStrip list={[at(0), at(1), at(2)]} />
          </div>
        </div>
      );
    }
    return (
      <div>
        <CardStrip list={[at(0), at(1), at(2)]} />
      </div>
    );
  }

  // 15. Mogambo -> Daga/Teja [0, 1] + Mogambo [2]
  if (slug === 'mogambo') {
    const total = cardRankNum(at(0)) + cardRankNum(at(1)) + cardRankNum(at(2));
    return (
      <>
        <h5 className='mogambo-total'>Total: {total}</h5>
        <div className='mt-1'>
          <h5>Daga / Teja</h5>
          <div className='flip-card-container'>
            <CricketCard key='m0' card={at(0)} />
            <span className='card-devider' />
            <CricketCard key='m1' card={at(1)} />
          </div>
        </div>
        <div>
          <h5>Mogambo</h5>
          <CardStrip list={[at(2)]} />
        </div>
      </>
    );
  }

  // 16. Poison / Joker 20 -> Poison/Joker [0], Player A [1,3,5], Player B [2,4,6]
  if (POISON_SEVEN_GAMES.has(slug) || JOKER_SEVEN_GAMES.has(slug)) {
    return (
      <>
        <div className='joker-card'>
          <h5 className='text-playerb'>
            {POISON_SEVEN_GAMES.has(slug) ? 'Poison' : 'Joker'}
          </h5>
          <CardStrip list={[at(0)]} />
        </div>
        <div className='mt-1'>
          <h5>Player A</h5>
          <CardStrip list={[at(1), at(3), at(5)]} />
        </div>
        <div className='mt-1'>
          <h5>Player B</h5>
          <CardStrip list={[at(2), at(4), at(6)]} />
        </div>
      </>
    );
  }

  // 17. Joker 1 / Joker 120 -> Player A [0,2,4], Player B [1,3,5]
  if (JOKER_SIX_GAMES.has(slug)) {
    return (
      <>
        <div className='mt-1'>
          <h5>Player A</h5>
          <CardStrip list={[at(0), at(2), at(4)]} />
        </div>
        <div className='mt-1'>
          <h5>Player B</h5>
          <CardStrip list={[at(1), at(3), at(5)]} />
        </div>
      </>
    );
  }

  // 18. Teenpatti Open (teen8/5574.js -> Dealer is [8, 17, 26], Players 1..8 are shown in table!)
  if (slug === 'teen8') {
    return (
      <div>
        <h5>Dealer</h5>
        <CardStrip list={[at(8), at(17), at(26)]} />
      </div>
    );
  }

  // 19. Teenpatti Test (teen9/4943.js -> Tiger [0,3,6], Lion [1,4,7], Dragon [2,5,8])
  if (slug === 'teen9') {
    return (
      <>
        <div>
          <h5>Tiger</h5>
          <CardStrip list={[at(0), at(3), at(6)]} />
        </div>
        <div className='mt-1'>
          <h5>Lion</h5>
          <CardStrip list={[at(1), at(4), at(7)]} />
        </div>
        <div className='mt-1'>
          <h5>Dragon</h5>
          <CardStrip list={[at(2), at(5), at(8)]} />
        </div>
      </>
    );
  }

  // 20. 2 Cards Teenpatti (patti2/5968.js -> [0,2] & [1,3])
  if (slug === 'patti2') {
    return (
      <>
        <div>
          <CardStrip list={[at(0), at(2)]} />
        </div>
        <div className='mt-1'>
          <CardStrip list={[at(1), at(3)]} />
        </div>
      </>
    );
  }

  // 21. Poker 1-Day / Poker 20 (poker/1937.js)
  if (slug === 'poker' || slug === 'poker20') {
    return (
      <>
        <div className='d-flex justify-content-between flex-wrap'>
          <div>
            <h5>Player A</h5>
            <CardStrip list={[at(0), at(1)]} />
          </div>
          <div>
            <h5>Player B</h5>
            <div className='flip-card-container justify-content-end'>
              <CricketCard key='p2' card={at(2)} />
              <CricketCard key='p3' card={at(3)} />
            </div>
          </div>
        </div>
        <div className='mt-1'>
          <h5>Board</h5>
          <CardStrip list={[at(4), at(5), at(6), at(7), at(8)]} />
        </div>
      </>
    );
  }

  // 22. Poker 6 Players (poker6/1515.js -> Board [12..16])
  if (slug === 'poker6') {
    const board = [at(12), at(13), at(14), at(15), at(16)];
    return (
      <div>
        <CardStrip list={board} />
      </div>
    );
  }

  // 23. 32 Cards (card32/9433.js -> only render when Player 8 dealt, highlight leader text-success)
  if (CARD32_GAMES.has(slug)) {
    const hands = [8, 9, 10, 11].map((base, idx) => {
      const dealt = [];
      for (let pos = idx; pos < cards.length; pos += 4) {
        if (cards[pos] && cards[pos] !== '1') dealt.push(cards[pos]);
      }
      const pts = base + dealt.reduce((acc, c) => acc + cardRankNum(c), 0);
      return { base, dealt, pts };
    });
    if (!hands[0].dealt.length) return null;
    const maxPts = Math.max(...hands.map((h) => h.pts));
    return (
      <>
        {hands.map((h, idx) =>
          h.dealt.length > 0 ? (
            <div key={h.base} className={idx > 0 ? 'mt-1' : ''}>
              <h5 className={h.pts >= maxPts ? 'text-success' : ''}>
                Player {h.base}: <span className='text-warning'>{h.pts}</span>
              </h5>
              <CardStrip list={h.dealt} />
            </div>
          ) : null
        )}
      </>
    );
  }

  // 24. Queen (queen/4327.js -> Total 0..3, only render when Total 0 dealt, highlight leader text-success)
  if (slug === 'queen') {
    const hands = [0, 1, 2, 3].map((base) => {
      const dealt = [];
      for (let pos = base; pos < cards.length; pos += 4) {
        if (cards[pos] && cards[pos] !== '1') dealt.push(cards[pos]);
      }
      const pts = base + dealt.reduce((acc, c) => acc + cardRankNum(c), 0);
      return { base, dealt, pts };
    });
    if (!hands[0].dealt.length) return null;
    const maxPts = Math.max(...hands.map((h) => h.pts));
    return (
      <>
        {hands.map((h, idx) =>
          h.dealt.length > 0 ? (
            <div key={h.base} className={idx > 0 ? 'mt-1' : ''}>
              <h5 className={h.pts >= maxPts ? 'text-success' : ''}>
                Total {h.base}: <span className='text-warning'>{h.pts}</span>
              </h5>
              <CardStrip list={h.dealt} />
            </div>
          ) : null
        )}
      </>
    );
  }

  // 25. Race 17 (race17/2647.js -> Total (10/J/Q/K=0, A=1) + cards[0..4] stacked)
  if (slug === 'race17') {
    const total = cards.reduce(
      (acc, c) => acc + cardRankNum(c, { faceAsTen: true }),
      0
    );
    return (
      <>
        <h5>Total: {total}</h5>
        {cards.map((c, idx) => (
          <div key={idx} className='mt-1'>
            <CardStrip list={[c]} />
          </div>
        ))}
      </>
    );
  }

  // 26. Race 2 (race2/7573.js -> strided 4-player hands when dealt)
  if (slug === 'race2') {
    const names = ['Player A', 'Player B', 'Player C', 'Player D'];
    const hands = names.map((name, idx) => {
      const dealt = [];
      for (let pos = idx; pos < cards.length; pos += 4) {
        if (cards[pos] && cards[pos] !== '1') dealt.push(cards[pos]);
      }
      return { name, dealt };
    });
    if (!hands[0].dealt.length) return null;
    return (
      <>
        {hands.map((h, idx) =>
          h.dealt.length > 0 ? (
            <div key={h.name} className={idx > 0 ? 'mt-1' : ''}>
              <h5>{h.name}</h5>
              <CardStrip list={h.dealt} />
            </div>
          ) : null
        )}
      </>
    );
  }

  // 27. Note Number (notenum/1998.js -> vertical 6 cards only when cards[0] != '1')
  if (slug === 'notenum') {
    if (!cards[0] || cards[0] === '1') return null;
    return (
      <div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={i > 0 ? 'mt-1' : ''}>
            <CardStrip list={[at(i)]} />
          </div>
        ))}
      </div>
    );
  }

  // 28. Default 6-card 2-player Teenpatti family
  return (
    <>
      <div>
        <h5>Player A</h5>
        <CardStrip list={[at(0), at(2), at(4)]} />
      </div>
      <div className='mt-1'>
        <h5>Player B</h5>
        <CardStrip list={[at(1), at(3), at(5)]} />
      </div>
    </>
  );
});

export default CardsDisplay;
