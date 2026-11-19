import { useEffect, useRef, useState } from 'react';
import { host } from '../../redux/api';
import CricketCard from './CricketCard';
import FlipClock from './FlipClock';

// Exact D247 cricketvDetails (iscc 1, reference @9239496 + @9254477):
// Wrapped in `.five-cricket` so D247 card sizing (34x44 desktop / 18x24 mobile)
// and left-aligned `.flip-card-container` apply identically to D247.
// Cards update only when `t1.card` is non-empty; FlipClock mirrors server `lt`.
function CricketCasinoLive({ gmid, tvUrl, inplay, hasTv }) {
  const [cards, setCards] = useState([]);
  const [leftTime, setLeftTime] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!gmid) return undefined;

    const ws = new WebSocket(host);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'subscribe',
          gameid: gmid,
          apitype: 'cricket-casino',
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (
          msg.type === 'cricket_casino_update' &&
          String(msg.gameid) === String(gmid)
        ) {
          const t1 = msg.data?.t1;
          if (!t1) return;
          if (t1.card !== undefined && String(t1.card).trim() !== '') {
            const parsed = String(t1.card)
              .split('|')
              .map((seg) => seg.split(',').filter((s) => s !== ''))
              .filter((row) => row.length > 0);
            setCards(parsed);
          }
          if (t1.lt !== undefined && t1.lt !== null) {
            setLeftTime(Number(t1.lt) || 0);
          }
        }
      } catch {
        /* ignore malformed frame */
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'unsubscribe',
            gameid: gmid,
            apitype: 'cricket-casino',
          })
        );
      }
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      ws.close();
      wsRef.current = null;
      setCards([]);
      setLeftTime(null);
    };
  }, [gmid]);

  const hasCards = cards.length > 0;
  const isPreMatch = inplay === false;
  const showVideo = Boolean(!isPreMatch && hasTv && tvUrl);

  return (
    <div className='five-cricket mt-1'>
      <div className='casino-video overflow-hidden'>
        {/* Video box (right-aligned 16:9) — live iframe ya pre-match banner */}
        <div className='video-box-container'>
          <div className='casino-video-box'>
            {showVideo ? (
              <iframe
                src={tvUrl}
                title='Cricket Casino Live'
                allow='autoplay; encrypted-media; picture-in-picture'
                allowFullScreen
              />
            ) : (
              <div className='five-video-baner absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_30%,#1c1c1c,#000_75%)]'>
                {isPreMatch && (
                  <div className='animate-text text-[16px] font-bold tracking-wide text-white'>
                    {'Match will be start soon'.split('').map((ch, i) => (
                      <span
                        key={i}
                        style={{ animationDelay: `${i * 0.06}s` }}
                        className='inline-block animate-bounce'
                      >
                        {ch === ' ' ? ' ' : ch}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cards overlay — top-left vertical ball rows (reference @9254477) */}
        {hasCards && (
          <div className='casino-video-cards pointer-events-none'>
            {cards.map((row, i) => (
              <div className='mt-1' key={i}>
                <div className='flip-card-container'>
                  {row.map((card, j) => (
                    <CricketCard card={card} key={j} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FlipClock countdown — exact D247 single `.clock.flip-clock-wrapper` */}
        {leftTime !== null && (
          <FlipClock seconds={leftTime} className='clock' />
        )}
      </div>
    </div>
  );
}

export default CricketCasinoLive;
