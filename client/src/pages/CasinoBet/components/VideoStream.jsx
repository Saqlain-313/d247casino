import { memo, useEffect, useState } from 'react';

import { VIDEO_LOAD_TIMEOUT } from '../constants';
import { getVideoStreamUrl } from '../utils/gameUtils';

import CardsDisplay from './CardsDisplay';
import RulesPopup from './RulesPopup';

const VideoStream = memo(function VideoStream({
  eventName,
  bettingData,
  showWinner,
  winnerLabel,
}) {
  const [videoload, setVideoload] = useState(true);
  const [failed, setFailed] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const streamUrl = getVideoStreamUrl(eventName);

  // Reset when event changes
  useEffect(() => {
    setVideoload(true);
    setFailed(false);
    setShowRules(false);
  }, [eventName]);

  // Video load timeout
  useEffect(() => {
    if (!eventName) return;

    const timeout = setTimeout(() => {
      setFailed(true);
      setVideoload(false);
    }, VIDEO_LOAD_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [eventName]);

  return (
    <div className="relative flex h-[200px] w-full items-center justify-center bg-black md:h-[420px]">

      {/* Video Iframe */}
      {streamUrl ? (
        <iframe
          key={eventName}
          src={streamUrl}
          title="Casino TV"
          frameBorder="0"
          allowFullScreen
          loading="lazy"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          className="h-full w-full border-0"
        />
      ) : (
        <div className="text-sm text-white">
          Casino stream unavailable
        </div>
      )}

      {/* Loading */}
    

      {/* Cards Overlay */}
      <div className="absolute top-0 left-0 flex items-start rounded-md">
        <div className="bg-black/50 p-3">
          <CardsDisplay bettingData={bettingData} />
        </div>

        <button
          type="button"
          className="cursor-pointer p-3 text-sm text-yellow-300 underline transition-colors hover:text-yellow-100"
          onClick={() => setShowRules(true)}
        >
          Rules
        </button>
      </div>

      {/* Rules */}
      {showRules && (
        <RulesPopup
          eventName={eventName}
          onClose={() => setShowRules(false)}
        />
      )}

      {/* Timer */}
      <div className="absolute top-2 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-black text-[20px] font-bold text-white">
        {bettingData?.lt || 0}
      </div>

      {/* Winner */}
      {showWinner && winnerLabel && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-tl-[15px] rounded-br-[15px] bg-gradient-to-t from-[#ff5100] to-[#ff8100] px-2 py-1 text-black">
          {winnerLabel} Win
        </div>
      )}
    </div>
  );
});

export default VideoStream;