import { useEffect, useRef, useState } from 'react';
import { host } from '../../redux/api';
import CricketCard from './CricketCard';
import FlipClock from './FlipClock';

// Cricket-casino (cricketv) live game screen — reference /casino/cricketv3 jaisa.
// Video box (inplay -> live iframe, warna "Match will be start soon" banner) +
// cards overlay (.casino-video-cards) + FlipClock countdown (.clock).
// Cards/countdown WebSocket se (apitype 'cricket-casino', 1s inplay / 10s idle).
function CricketCasinoLive({ gmid, tvUrl, inplay, hasTv }) {
  const [feed, setFeed] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!gmid) return;

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
          setFeed(t1 && t1.card ? t1 : null);
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
    };
  }, [gmid]);

  const rows = feed?.card
    ? String(feed.card)
        .split('|')
        .map((seg) => seg.split(',').filter((s) => s !== ''))
        .filter((row) => row.length > 0)
    : [];
  const hasCards = rows.length > 0;
  // Live TV sirf jab event me tv flag ho (iscc 1 cricketv me tv=0 hota hy —
  // reference wahan casino launchother stream use karta hy jo hamare pass nahi).
  const showVideo = Boolean(inplay && hasTv && tvUrl);

  return (
    <div className='casino-video mt-1 overflow-hidden'>
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
              {!inplay && (
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

      {/* Cards overlay — video ke upar top-left translucent panel (reference) */}
      {hasCards && (
        <div className='casino-video-cards pointer-events-none'>
          {rows.map((row, i) => (
            <div className='mt-1' key={i}>
              <div className='flip-card-container'>
                {row.map((card, j) => (
                  <CricketCard card={card} key={`${card}-${j}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FlipClock countdown — bottom-right (reference .clock) */}
      {feed && (
        <div className='clock flip-clock-wrapper right-2 max-w-full'>
          <FlipClock seconds={feed.lt} />
        </div>
      )}
    </div>
  );
}

export default CricketCasinoLive;
