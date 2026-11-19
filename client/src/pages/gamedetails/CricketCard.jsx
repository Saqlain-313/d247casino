import { useEffect, useState } from 'react';

// Exact D247 FlipCard (module 57211 + style.css @4537-4573):
// `.flip-card-inner` has NO transition; ONLY `.flip-card-inner.flip` has
// `transition: transform 0.6s; transform: rotateY(180deg)`.
// When `card` changes ('1' -> 'ADD', 'ADD' -> '6DD', or 'ADD' -> '1'), front
// holds the previous card while back holds the new card during the 0.6s 3D
// flip; after 650ms `.flip` is removed and front snaps seamlessly to the new
// card at 0deg with zero reverse-flip flash.
const cardImages = import.meta.glob('../../assets/cards/*.jpg', {
  eager: true,
  import: 'default',
});
const byCode = {};
for (const [path, url] of Object.entries(cardImages)) {
  const code = path.split('/').pop().replace('.jpg', '');
  byCode[code] = url;
}
const cardUrl = (code) => byCode[code] || byCode['1'];

function CricketCard({ card }) {
  const code = String(card ?? '1').trim() || '1';
  const [anim, setAnim] = useState(() => ({
    cardCode: code,
    prevCode: code,
    flipping: false,
  }));

  if (anim.cardCode !== code) {
    setAnim({
      cardCode: code,
      prevCode: anim.cardCode,
      flipping: true,
    });
  }

  useEffect(() => {
    if (!anim.flipping) return undefined;
    const t = setTimeout(() => {
      setAnim((s) => ({
        cardCode: s.cardCode,
        prevCode: s.cardCode,
        flipping: false,
      }));
    }, 650);
    return () => clearTimeout(t);
  }, [anim.flipping, anim.cardCode]);

  const frontCode = anim.flipping ? anim.prevCode : anim.cardCode;
  const backCode = anim.cardCode;

  return (
    <div className='flip-card'>
      <div className={`flip-card-inner ${anim.flipping ? 'flip' : ''}`}>
        <div className='flip-card-front'>
          <img src={cardUrl(frontCode)} alt={frontCode} />
        </div>
        <div className='flip-card-back'>
          <img src={cardUrl(backCode)} alt={backCode} />
        </div>
      </div>
    </div>
  );
}

export default CricketCard;
