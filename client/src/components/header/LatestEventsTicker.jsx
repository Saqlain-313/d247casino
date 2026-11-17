import React, { useMemo } from 'react';
import {
  MdSportsCricket,
  MdSportsSoccer,
  MdSportsTennis,
} from 'react-icons/md';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const SPORT_META = {
  cricket: {
    icon: MdSportsCricket,
    betPath: (id) => `/cricket-bet/${id}`,
  },
  soccer: {
    icon: MdSportsSoccer,
    betPath: (id) => `/football-bet/${id}`,
  },
  tennis: {
    icon: MdSportsTennis,
    betPath: (id) => `/tennis-bet/${id}`,
  },
};

const MAX_EVENTS = 12;

// Live ticker of today's events (inplay first), fed by the same redux slices
// the sport pages use. Sidebar owns the fetching (mount + 5s refresh), so the
// ticker only reads the store. Renders nothing when there are no events today.
function LatestEventsTicker() {
  const navigate = useNavigate();

  const cricket = useSelector((s) => s.cricket.matches) || [];
  const soccer = useSelector((s) => s.soccer.matches) || [];
  const tennis = useSelector((s) => s.tennis.matches) || [];

  const events = useMemo(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const todayPrefix = `${dd}/${mm}/${now.getFullYear()}`;

    const tagged = [
      ...cricket.map((m) => ({ ...m, sport: 'cricket' })),
      ...soccer.map((m) => ({ ...m, sport: 'soccer' })),
      ...tennis.map((m) => ({ ...m, sport: 'tennis' })),
    ];

    return tagged
      .filter((m) => m.inplay || (m.time || '').startsWith(todayPrefix))
      .sort((a, b) => Number(b.inplay || false) - Number(a.inplay || false))
      .slice(0, MAX_EVENTS);
  }, [cricket, soccer, tennis]);

  if (!events.length) return null;

  return (
    <div className='text-primary scrollbar-hide flex overflow-x-auto'>
      {events.map((m) => {
        const meta = SPORT_META[m.sport];
        const Icon = meta.icon;
        return (
          <div
            key={`${m.sport}-${m.id}`}
            onClick={() =>
              navigate(meta.betPath(m.id), {
                state: { name: m.game, time: m.time, beventId: m.beventId },
              })
            }
            className='bg-secondary text-secondary mr-1 flex min-w-[50%] cursor-pointer items-center p-1 text-[14px] font-semibold sm:min-w-fit lg:min-w-[20%]'
          >
            <div className='animate-blink flex shrink-0 items-center pr-1'>
              <Icon />
            </div>
            <div className='flex items-center overflow-hidden sm:py-2'>
              <span className='overflow-hidden text-ellipsis whitespace-nowrap'>
                {m.game}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LatestEventsTicker;
