import { memo } from 'react';
import { getVideoStreamUrl } from '../utils/gameUtils';
import FlipClock from '../../gamedetails/FlipClock';
import CricketCard from '../../gamedetails/CricketCard';
import CardsDisplay, { hasVideoCardsOverlay } from './CardsDisplay';

const VideoStream = memo(function VideoStream({
  eventName,
  bettingData,
  showWinner,
  winnerLabel,
}) {
  const slug = String(bettingData?.gtype || eventName || '').toLowerCase();
  const streamUrl = getVideoStreamUrl(eventName);
  const showCards = hasVideoCardsOverlay(slug, bettingData);
  const showClock = slug !== 'worli3';
  const rdesc = bettingData?.rdesc;
  const dum10Card =
    slug === 'dum10' ? String(bettingData?.card || '').split(',')[0] : '';

  return (
    <div className={`casino-video ${showCards ? '' : 'no-cards'}`}>
      <div className='video-box-container'>
        <div className='casino-video-box'>
          {streamUrl ? (
            <iframe
              key={eventName}
              src={streamUrl}
              title='Casino TV'
              frameBorder='0'
              allowFullScreen
              loading='lazy'
              allow='autoplay; encrypted-media; fullscreen; picture-in-picture'
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center text-sm text-white'>
              Casino stream unavailable
            </div>
          )}

          {/* Goal / Lucky15 / BallByBall live result ball popup */}
          {(slug === 'goal' || slug === 'goal2') && rdesc && (
            <div className='cricket20ballpopup'>
              <img src='/assets/img/balls/soccer-ball.png' alt='Goal' />
              <span>{rdesc}</span>
            </div>
          )}
          {(slug === 'lucky15' || slug === 'ballbyball') && rdesc && (
            <div className='cricket20ballpopup'>
              <img src='/balls/cricket20/ball0.png' alt='Ball' />
              <span>{rdesc}</span>
            </div>
          )}

          {/* Winner Banner */}
          {showWinner && winnerLabel && (
            <div className='absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-tl-[15px] rounded-br-[15px] bg-gradient-to-t from-[#ff5100] to-[#ff8100] px-3 py-1 font-bold text-black shadow-lg'>
              {winnerLabel} Win
            </div>
          )}
        </div>
      </div>

      {/* Cards / Dice / Balls Overlay (only for games that render overlay elements) */}
      {showCards && (
        <div className='casino-video-cards'>
          <CardsDisplay bettingData={bettingData} />
        </div>
      )}

      {slug === 'dum10' && dum10Card && dum10Card !== '1' && (
        <div className='casino-video-current-card'>
          <CricketCard card={dum10Card} />
        </div>
      )}

      {/* Authentic D247 FlipClock */}
      {showClock && (
        <div className='clock'>
          <FlipClock seconds={bettingData?.lt || 0} />
        </div>
      )}
    </div>
  );
});

export default VideoStream;
