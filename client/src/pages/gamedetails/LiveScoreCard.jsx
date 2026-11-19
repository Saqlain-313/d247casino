import React from 'react';
import { BiSolidCricketBall } from 'react-icons/bi';
import { MdSportsCricket } from 'react-icons/md';
import ScorecardBB from './ScorecardBB';

// Exact D247 ball-runs colors (style.css @3298-3321):
// normal -> #08c, four -> #087f23, six -> #883997, wicket -> #ff0000
const ballClass = (ball) => {
  const b = String(ball ?? '')
    .trim()
    .toLowerCase();
  if (b === '4') return 'bg-[#087f23] text-white';
  if (b === '6') return 'bg-[#883997] text-white';
  if (b === 'w' || b === 'ww' || b.startsWith('w')) {
    return 'bg-[#ff0000] text-white';
  }
  return 'bg-[#08c] text-white';
};

const TeamRow = ({ name, score, crr, rrr, batting }) => (
  <div className='flex items-center justify-between gap-2 py-0.5'>
    <div className='flex min-w-0 items-center gap-1.5'>
      {batting ? (
        <MdSportsCricket
          className='shrink-0 text-[15px] text-[#4ade80]'
          aria-label='Batting'
        />
      ) : (
        <BiSolidCricketBall
          className='shrink-0 text-[13px] text-[#f87171]'
          aria-label='Bowling'
        />
      )}
      <span
        className={`truncate text-[13px] font-bold sm:text-[14px] ${
          batting ? 'text-white' : 'text-white/80'
        }`}
      >
        {name || ''}
      </span>
    </div>

    <div className='flex shrink-0 items-baseline gap-2 text-right'>
      <span
        className={`text-[15px] font-extrabold tracking-tight sm:text-[17px] ${
          batting ? 'text-[#fde047]' : 'text-white/90'
        }`}
      >
        {score && String(score).trim() !== '' ? score : '-'}
      </span>
      {(crr || rrr) && (
        <span className='hidden text-[11px] font-semibold text-white/75 sm:inline'>
          {crr ? `CRR ${crr}` : ''}
          {crr && rrr ? ' · ' : ''}
          {rrr ? `RR ${rrr}` : ''}
        </span>
      )}
    </div>
  </div>
);

export default function LiveScoreCard({ data }) {
  if (!data || typeof data !== 'object') return null;

  // If provider sends E-Cricket teams schema (providerId=7), render ScorecardBB
  if (data.teams?.team1 || data.teams?.team2) {
    return <ScorecardBB data={data} />;
  }

  const balls = (Array.isArray(data.balls) ? data.balls : []).filter(
    (b) => b !== null && b !== undefined && String(b).trim() !== ''
  );
  const runningStatus = String(data.spnballrunningstatus || '').trim();
  const message = String(data.spnmessage || '').trim();
  const dayNo = String(data.dayno || '').trim();
  const statusLine = runningStatus || message;
  const active1 = String(data.activenation1) === '1';
  const active2 = String(data.activenation2) === '1';

  return (
    <div className='mt-1 w-full rounded-xs border border-[#2c4452] bg-[linear-gradient(135deg,#12241c_0%,#1b2d3b_55%,#14222c_100%)] px-3 py-2 text-white shadow-xs'>
      <div className='grid grid-cols-1 gap-2 md:grid-cols-2 md:items-center'>
        {/* Left: Team 1 & Team 2 scores + CRR/RR (D247 .scorecard @2578535) */}
        <div className='min-w-0 divide-y divide-white/10'>
          <TeamRow
            name={data.spnnation1}
            score={data.score1}
            crr={data.spnrunrate1}
            rrr={data.spnreqrate1}
            batting={active1}
          />
          <TeamRow
            name={data.spnnation2}
            score={data.score2}
            crr={data.spnrunrate2}
            rrr={data.spnreqrate2}
            batting={active2}
          />
        </div>

        {/* Right: Status / Commentary + Ball-by-Ball pills */}
        <div className='flex flex-col justify-center gap-1.5 md:items-end'>
          {statusLine ? (
            <div className='text-[12px] font-semibold text-[#ffd54f] md:text-right'>
              {dayNo ? `${dayNo} | ` : ''}
              {statusLine}
            </div>
          ) : (
            <div className='flex flex-wrap gap-2 text-[11px] font-semibold text-white/75 sm:hidden'>
              {data.spnrunrate1 && <span>CRR {data.spnrunrate1}</span>}
              {data.spnrunrate2 && <span>CRR {data.spnrunrate2}</span>}
              {data.spnreqrate1 && <span>RR {data.spnreqrate1}</span>}
              {data.spnreqrate2 && <span>RR {data.spnreqrate2}</span>}
            </div>
          )}

          {balls.length > 0 && (
            <div className='flex flex-wrap items-center gap-1 md:justify-end'>
              {balls.map((ball, index) => (
                <span
                  key={index}
                  className={`flex h-[24px] min-w-[24px] items-center justify-center rounded-full px-1 text-[11px] font-bold shadow-xs ${ballClass(ball)}`}
                >
                  {String(ball).trim().toLowerCase() === 'w'
                    ? 'W'
                    : String(ball).toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
