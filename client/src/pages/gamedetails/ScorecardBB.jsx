import React from 'react';

// Reference e-cricket ball-by-ball scorecard (.scorecard-bb): two team blocks
// (score + name + recent-ball form dots) with a centre scorebox (inning status +
// commentary line). Data se banata hy (scoreData = liveScoreFeed).
const dotClass = (ball) => {
  const b = String(ball).toLowerCase();
  if (b === '4') return 'dot four';
  if (b === '6') return 'dot six';
  if (b === 'w' || b === 'ww') return 'dot wicket';
  return 'dot';
};

const TeamBlock = ({ name, score, balls, current }) => (
  <div className='bb-team'>
    <div className='bb-score'>
      {current ? (
        <span className='bb-current'>{score || '0/0'}</span>
      ) : (
        <span>{score || '0/0'}</span>
      )}
    </div>
    <div className='bb-team-name'>{name || ''}</div>
    {balls && balls.length > 0 && (
      <div className='bb-team-form'>
        {balls.slice(-6).map((b, i) => (
          <span className={dotClass(b)} key={i}>
            {String(b).toUpperCase()}
          </span>
        ))}
      </div>
    )}
  </div>
);

function ScorecardBB({ data }) {
  if (!data) return null;
  const balls = Array.isArray(data.balls) ? data.balls : [];
  const status = data.spnballrunningstatus || 'Started';
  const commentary = data.spnmessage;

  return (
    <div className='scorecard-bb mt-1 bg-white'>
      <div className='bb-match'>
        <TeamBlock name={data.spnnation1} score={data.score1} />
        <div className='bb-scorebox'>
          <div className='bb-inning'>
            <span>{status}</span>
          </div>
          {commentary && (
            <div className='bb-mini d-none-md'>
              <span>{commentary}</span>
            </div>
          )}
        </div>
        <TeamBlock
          name={data.spnnation2}
          score={data.score2}
          balls={balls}
          current={String(data.activenation2) === '1'}
        />
      </div>
      {commentary && (
        <div className='bb-mini d-md-none'>
          <span>{commentary}</span>
        </div>
      )}
    </div>
  );
}

export default ScorecardBB;
