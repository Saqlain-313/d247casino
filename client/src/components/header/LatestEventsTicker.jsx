import React, { useEffect, useMemo } from 'react';
import {
  MdSportsCricket,
  MdSportsSoccer,
  MdSportsTennis,
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { fetchCricketData } from '../../redux/reducer/cricketSlice';
import { fetchSoccerData } from '../../redux/reducer/soccerSlice';
import { fetchTennisData } from '../../redux/reducer/tennisSlice';

const SPORT_META = {
  cricket: {
    icon: MdSportsCricket,
    betPath: (game, id) => `/cricket-bet/${game}/${id}`,
  },
  soccer: {
    icon: MdSportsSoccer,
    betPath: (game, id) => `/football-bet/${game}/${id}`,
  },
  tennis: {
    icon: MdSportsTennis,
    betPath: (game, id) => `/tennis-bet/${game}/${id}`,
  },
};

const MAX_EVENTS = 12;

// Live ticker of today's events (inplay first), fed by the same redux slices
// the sport pages use. Renders nothing when there are no events today.
function LatestEventsTicker() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cricket = useSelector((s) => s.cricket.matches) || [];
  const soccer = useSelector((s) => s.soccer.matches) || [];
  const tennis = useSelector((s) => s.tennis.matches) || [];

  useEffect(() => {
    if (!cricket.length) dispatch(fetchCricketData());
    if (!soccer.length) dispatch(fetchSoccerData());
    if (!tennis.length) dispatch(fetchTennisData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

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
              navigate(meta.betPath(m.game, m.id), { state: { time: m.time } })
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
