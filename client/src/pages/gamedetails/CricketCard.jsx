// Reference FlipCard semantics (d247-casino-react FlipCard.jsx + style.css
// @4512): front face = card BACK (1.jpg), back face = card image; 'flip'
// class tab lagti hy jab card reveal ho (code != '1'). Code '1'/empty =
// face-down. Card change pe CSS transition se 3D flip dikhta hy.
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
  const code = String(card ?? '1');
  const faceUp = code !== '1' && code !== '';

  return (
    <div className='flip-card'>
      <div className={`flip-card-inner ${faceUp ? 'flip' : ''}`}>
        <div className='flip-card-front'>
          <img src={cardUrl('1')} alt='card back' />
        </div>
        <div className='flip-card-back'>
          <img src={cardUrl(code)} alt={code} />
        </div>
      </div>
    </div>
  );
}

export default CricketCard;
