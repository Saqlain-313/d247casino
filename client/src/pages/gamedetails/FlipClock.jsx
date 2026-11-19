// Authentic D247 FlipClock (CounterFace — flipclock.js @1960 + flipclock.css +
// style.css @4590-4619 + responsive.css @451-465).
// Strictly tracks server `seconds` (`lt`) with zero local drift timer, and
// renders `.clock.flip-clock-wrapper` on a single root element just like D247.
import { useState } from 'react';

function FlipDigit({ digit, prevDigit, flipKey }) {
  const isChanged = digit !== prevDigit;
  return (
    <ul key={flipKey} className={`flip ${isChanged ? 'play' : ''}`}>
      <li className='flip-clock-before'>
        <a href='#!' onClick={(e) => e.preventDefault()} tabIndex={-1}>
          <div className='up'>
            <div className='shadow' />
            <div className='inn'>{prevDigit}</div>
          </div>
          <div className='down'>
            <div className='shadow' />
            <div className='inn'>{prevDigit}</div>
          </div>
        </a>
      </li>
      <li className='flip-clock-active'>
        <a href='#!' onClick={(e) => e.preventDefault()} tabIndex={-1}>
          <div className='up'>
            <div className='shadow' />
            <div className='inn'>{digit}</div>
          </div>
          <div className='down'>
            <div className='shadow' />
            <div className='inn'>{digit}</div>
          </div>
        </a>
      </li>
    </ul>
  );
}

function FlipClock({ seconds, className = 'clock', hideAtZero = false }) {
  const normalized = Math.max(
    0,
    Math.min(99, Math.floor(Number(seconds) || 0))
  );

  const [state, setState] = useState(() => ({
    current: normalized,
    prev: normalized,
    tick: 0,
  }));

  if (state.current !== normalized) {
    setState({
      current: normalized,
      prev: state.current,
      tick: state.tick + 1,
    });
  }

  const curStr = String(state.current).padStart(2, '0');
  const prevStr = String(state.prev).padStart(2, '0');
  const tensChanged = curStr[0] !== prevStr[0];
  const onesChanged = curStr[1] !== prevStr[1];
  const hiddenClass = hideAtZero && state.current === 0 ? 'd-none' : '';

  return (
    <div
      className={`${className} flip-clock-wrapper ${hiddenClass}`.trim()}
      title={`Timer: ${state.current}s`}
    >
      <FlipDigit
        digit={curStr[0]}
        prevDigit={prevStr[0]}
        flipKey={tensChanged ? `t-${state.tick}` : 't-static'}
      />
      <FlipDigit
        digit={curStr[1]}
        prevDigit={prevStr[1]}
        flipKey={onesChanged ? `o-${state.tick}` : 'o-static'}
      />
    </div>
  );
}

export default FlipClock;
