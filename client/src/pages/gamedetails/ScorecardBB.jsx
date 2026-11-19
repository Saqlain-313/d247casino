import React from 'react';

// Exact D247 E-Cricket ball-by-ball scorecard (.scorecard-bb, reference
// 776178602-new.devtools @9309087 + style.css @13076-13207).
// Supports E-Cricket providerId=7 JSON (`teams.team1/team2`, `inPlay`,
// `matchStatus`, `commentaryMessage`) as well as flat `spnnation1/2` fallback.
const dotClass = (ball) => {
  const b = String(ball ?? '')
    .trim()
    .toLowerCase();
  if (b === '4') return 'dot four';
  if (b === '6') return 'dot six';
  if (b === 'w' || b === 'ww' || b.startsWith('w')) return 'dot wicket';
  return 'dot';
};

const formatBallLabel = (ball) => {
  const s = String(ball ?? '').trim();
  return s.toLowerCase() === 'w' ? 'W' : s.toUpperCase();
};

const TeamBlock = ({ name, score, over, balls, current }) => (
  <div className='bb-team min-w-0 px-1'>
    <div className='bb-score flex items-baseline justify-center gap-1'>
      <span className={current ? 'bb-current' : ''}>{score || '0/0'}</span>
      {over !== undefined && over !== null && String(over) !== '' && (
        <span className='text-[11px] font-semibold text-gray-500'>
          ({over})
        </span>
      )}
    </div>
    <div className='bb-team-name max-w-full truncate px-1' title={name || ''}>
      {name || ''}
    </div>
    {Array.isArray(balls) && balls.length > 0 && (
      <div className='bb-team-form flex-wrap justify-center'>
        {balls.slice(-6).map((b, i) => (
          <span className={dotClass(b)} key={i}>
            {formatBallLabel(b)}
          </span>
        ))}
      </div>
    )}
  </div>
);

function ScorecardBB({ data }) {
  if (!data || typeof data !== 'object') return null;

  const hasTeamsShape = Boolean(data.teams?.team1 || data.teams?.team2);

  const team1 = hasTeamsShape
    ? {
        name: data.teams?.team1?.name || '',
        score: data.teams?.team1?.score || '0/0',
        over: data.teams?.team1?.over,
        balls: Array.isArray(data.teams?.team1?.balls)
          ? data.teams.team1.balls
          : [],
        current: data.inPlay === 'team1',
      }
    : {
        name: data.spnnation1 || '',
        score: data.score1 || '0/0',
        over: null,
        balls:
          String(data.activenation1) === '1' && Array.isArray(data.balls)
            ? data.balls
            : [],
        current: String(data.activenation1) === '1',
      };

  const team2 = hasTeamsShape
    ? {
        name: data.teams?.team2?.name || '',
        score: data.teams?.team2?.score || '0/0',
        over: data.teams?.team2?.over,
        balls: Array.isArray(data.teams?.team2?.balls)
          ? data.teams.team2.balls
          : [],
        current: data.inPlay === 'team2',
      }
    : {
        name: data.spnnation2 || '',
        score: data.score2 || '0/0',
        over: null,
        balls:
          String(data.activenation2) === '1' && Array.isArray(data.balls)
            ? data.balls
            : [],
        current: String(data.activenation2) === '1',
      };

  const status = data.matchStatus || data.spnballrunningstatus || 'Started';
  const commentary = data.commentaryMessage || data.spnmessage || '';

  return (
    <div className='scorecard-bb mt-1 rounded-xs border border-gray-300 bg-white py-1.5 shadow-xs'>
      <div className='bb-match'>
        <TeamBlock {...team1} />
        <div className='bb-scorebox px-1'>
          <div className='bb-inning'>
            <span>{status}</span>
          </div>
          {commentary && (
            <div className='bb-mini d-none d-md-flex text-center'>
              <span>{commentary}</span>
            </div>
          )}
        </div>
        <TeamBlock {...team2} />
      </div>
      {commentary && (
        <div className='bb-mini d-md-none border-t border-gray-200 px-2 pt-1 text-center'>
          <span>{commentary}</span>
        </div>
      )}
    </div>
  );
}

export default ScorecardBB;
