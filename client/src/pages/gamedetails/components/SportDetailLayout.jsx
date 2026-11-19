import { FaTv } from 'react-icons/fa6';
import MatchedBet from '../MatchedBet';
import PlaceBet from '../PlaceBet';

const IFRAME_ALLOW =
  'autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope';

export function LiveTvIframe({ src, title = 'Watch Live' }) {
  if (!src) return null;
  return (
    <div className='live-tv bg-black'>
      <iframe
        src={src}
        title={title}
        allowFullScreen
        loading='lazy'
        allow={IFRAME_ALLOW}
      />
    </div>
  );
}

/**
 * Shared 2-column responsive layout for sport betting detail pages
 * (Cricket, Football, Tennis):
 * - Header bar (or custom header slot for Cricket Casino rules link)
 * - Mobile ODDS / MATCHED BET / TV tab strip
 * - Mobile Live TV iframe + Scorecard slot + Markets children
 * - Desktop sticky sidebar (Live Match TV toggle + PlaceBet + MatchedBet)
 * - Mobile PlaceBet modal
 */
export default function SportDetailLayout({
  header,
  match,
  time,
  showodds,
  setshowodds,
  showLive,
  setShowLive,
  showlivetv,
  setshowlivetv,
  hasLiveTv,
  liveTvUrl,
  scorecardSlot,
  matchedBetEventKey,
  placeBetProps,
  selectedBet,
  onCloseBet,
  mobileMatchedBetClassName = 'block lg:hidden',
  children,
  extraModals = null,
}) {
  return (
    <div className='mt-0.5 flex gap-px'>
      <div className='ml-0 w-full md:ml-1 lg:w-[calc(100%-352px)]'>
        {header || (
          <div className='bg-secondary text-secondary flex items-center justify-between p-1 text-[12px] font-bold lg:text-[15px]'>
            <span>{match}</span>
            <span>{time}</span>
          </div>
        )}

        <div className='bg-primary text-primary flex items-center justify-around text-[12px] font-bold lg:hidden'>
          <div
            className={`flex w-full items-center justify-center border-r border-r-[#FFFFFF] p-2 ${
              showodds ? 'border-t-2 border-t-[#cccccc]' : ''
            }`}
            onClick={() => {
              setshowodds(true);
              setShowLive(false);
            }}
          >
            ODDS
          </div>
          <div
            className={`flex w-full items-center justify-center border-r border-r-[#FFFFFF] p-2 ${
              showodds ? '' : 'border-t-2 border-t-[#cccccc]'
            }`}
            onClick={() => setshowodds(false)}
          >
            MATCHED BET
          </div>
          {hasLiveTv && (
            <div
              className='flex w-full cursor-pointer items-center justify-center p-2'
              onClick={() => {
                setShowLive(true);
                setshowodds(true);
              }}
            >
              <FaTv className='text-sm' />
            </div>
          )}
        </div>

        {showodds && (
          <div>
            {!showLive && scorecardSlot}
            {showLive && <LiveTvIframe src={liveTvUrl} />}
            {children}
          </div>
        )}

        {!showodds && (
          <div className={mobileMatchedBetClassName}>
            <MatchedBet eventName={matchedBetEventKey} />
          </div>
        )}
      </div>

      {/* Desktop Right Sidebar */}
      <div className='sticky top-0 hidden h-fit lg:block'>
        <div className='w-[350px]'>
          {hasLiveTv && (
            <div className='mb-1'>
              <div
                className='bg-secondary text-secondary cursor-pointer p-1'
                onClick={() => setshowlivetv((prev) => !prev)}
              >
                <span className='font-bold'>Live Match</span>
              </div>
              {showlivetv && <LiveTvIframe src={liveTvUrl} />}
            </div>
          )}
          <div>
            <PlaceBet
              {...placeBetProps}
              selectedBet={selectedBet}
              onClose={onCloseBet}
            />
          </div>
          <div className='bg-secondary text-secondary p-1'>
            <span className='font-bold'>My Bet</span>
          </div>
          <MatchedBet eventName={matchedBetEventKey} />
        </div>
      </div>

      {/* Mobile PlaceBet Modal */}
      {selectedBet && (
        <>
          <div
            className='bg-opacity-50 fixed inset-0 z-40 block bg-black/60 lg:hidden'
            onClick={onCloseBet}
          />
          <div className='fixed top-0 right-0 left-0 z-50 block max-h-screen overflow-y-auto bg-white shadow-lg lg:hidden'>
            <PlaceBet
              {...placeBetProps}
              selectedBet={selectedBet}
              onClose={onCloseBet}
              isMobile={true}
            />
          </div>
        </>
      )}

      {extraModals}
    </div>
  );
}
