import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTv } from 'react-icons/fa';
import { fetchHorseRacingData } from '../../redux/reducer/horseRacingSlice';

function formatRaceTime(stime) {
  const date = new Date(stime);
  if (Number.isNaN(date.getTime())) return stime;
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
}

export default function HorseRacing({ panel = false }) {
  const dispatch = useDispatch();
  const { venues, loading, error } = useSelector((state) => state.horseRacing);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    if (!venues.length && !loading) {
      dispatch(fetchHorseRacingData());
    }
  }, [dispatch, venues.length, loading]);

  // Reference D247 #horse-tabs: group venues by country code (cname)
  const countryGroups = useMemo(() => {
    const groups = new Map();
    for (const venue of venues) {
      const code = (venue.cname || 'INT').trim();
      if (!groups.has(code)) groups.set(code, []);
      groups.get(code).push(venue);
    }
    return Array.from(groups.entries()).map(([cname, children]) => ({
      cname,
      children,
    }));
  }, [venues]);

  const activeCountry =
    selectedCountry && countryGroups.some((g) => g.cname === selectedCountry)
      ? selectedCountry
      : countryGroups[0]?.cname || null;

  const activeGroup =
    countryGroups.find((g) => g.cname === activeCountry) || null;

  return (
    <section
      className={`z-[99999] flex min-h-0 flex-col bg-white text-[#252a2e] ${
        panel
          ? 'h-[calc(100vh-3rem)] w-[min(380px,100vw)] border border-gray-300 shadow-lg lg:w-[min(280px,calc(100vw-220px))]'
          : 'w-full border border-gray-300'
      }`}
      aria-label='All Horse Racing'
    >
      {panel && (
        <h2 className='border-b border-gray-300 px-4 py-2 text-lg font-bold'>
          Horse Racing
        </h2>
      )}
      {loading && countryGroups.length === 0 && (
        <p className='px-4 py-4 text-sm text-gray-600'>Loading races...</p>
      )}
      {error && (
        <p className='px-4 py-4 text-sm text-red-600' role='alert'>
          {error}
        </p>
      )}
      {!loading && !error && countryGroups.length === 0 && (
        <div className='bet-table-row px-4 py-4 text-sm text-gray-600'>
          No Record Found
        </div>
      )}
      {countryGroups.length > 0 && (
        <div id='horse-tabs' className='min-h-0 flex-1 overflow-y-auto'>
          <ul className='nav nav-pills flex flex-nowrap gap-1 overflow-x-auto border-b border-gray-200 bg-[#f1f3f5] px-2 py-1.5'>
            {countryGroups.map((group) => {
              const isActive = group.cname === activeCountry;
              return (
                <li className='nav-item shrink-0' key={group.cname}>
                  <button
                    type='button'
                    onClick={() => setSelectedCountry(group.cname)}
                    className={`nav-link cursor-pointer rounded px-3 py-1 text-xs font-bold uppercase transition-colors ${
                      isActive
                        ? 'bg-primary text-primary active'
                        : 'bg-white text-[#333] hover:bg-gray-200'
                    }`}
                  >
                    {group.cname}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className='bet-table position-relative horse-table'>
            <div className='bet-table-body'>
              {(activeGroup?.children || []).map((venue, idx) => (
                <div
                  className='bet-table-row flex flex-col gap-1.5 border-b border-gray-200 px-3 py-2 md:flex-row md:items-center md:justify-between'
                  key={`${venue.cid || 'v'}-${venue.ename || 'venue'}-${idx}`}
                >
                  <div className='bet-nation-name flex items-center gap-2 text-sm font-bold text-[#333]'>
                    <span className='game-icon inline-flex items-center text-gray-600'>
                      <FaTv />
                    </span>
                    <span className='truncate'>{venue.ename}</span>
                  </div>
                  <div className='horse-time-detail flex flex-wrap gap-1.5'>
                    {(venue.races || []).map((race) => (
                      <Link
                        to={`/hourse-racing-bet/${race.gmid}`}
                        state={{
                          name: venue.ename,
                          time: formatRaceTime(race.stime),
                          iplay: race.iplay,
                        }}
                        key={race.gmid}
                        className='no-underline'
                      >
                        <span
                          className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${
                            race.iplay
                              ? 'active border-[#28a745] bg-[#28a745] text-white'
                              : 'border-gray-300 bg-[#e9ecef] text-[#333] hover:bg-gray-300'
                          }`}
                        >
                          {formatRaceTime(race.stime)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
