import { useEffect, useRef, useState } from 'react';

// Reference FlipClock (flip-clock-wrapper) jaisa countdown — digits flip hote
// hy jab value badalti hy. Seconds ko 2 digits (tens/ones) me dikhata hy.
function FlipDigit({ digit }) {
  const [flipping, setFlipping] = useState(false);
  const prevRef = useRef(digit);

  useEffect(() => {
    if (prevRef.current !== digit) {
      setFlipping(true);
      prevRef.current = digit;
      const t = setTimeout(() => setFlipping(false), 450);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [digit]);

  return (
    <div className='flip-clock-digit'>
      <div className={`flip-clock-card ${flipping ? 'flip' : ''}`}>
        <div className='flip-clock-top'>
          <span>{digit}</span>
        </div>
        <div className='flip-clock-bottom'>
          <span>{digit}</span>
        </div>
        <div className='flip-clock-line' />
      </div>
    </div>
  );
}

function FlipClock({ seconds }) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const tens = Math.floor(s / 10);
  const ones = s % 10;
  return (
    <div className='flip-clock-wrapper flex items-center gap-[3px]'>
      <FlipDigit digit={tens} />
      <FlipDigit digit={ones} />
    </div>
  );
}

export default FlipClock;
