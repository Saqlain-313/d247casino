import React, { useEffect, useRef } from 'react';
import { useCasino } from '../../context/CasinoContext';

export default function FlipClock() {
  const { countdown, isSuspended } = useCasino();
  const prevNum = useRef(countdown);

  const numStr = String(Math.max(0, countdown)).padStart(2, '0');
  const d1 = numStr[0];
  const d2 = numStr[1];

  const prevNumStr = String(Math.max(0, prevNum.current)).padStart(2, '0');
  const prevD1 = prevNumStr[0];
  const prevD2 = prevNumStr[1];

  useEffect(() => {
    prevNum.current = countdown;
  }, [countdown]);

  const isUrgent = countdown <= 4 && countdown > 0;

  return (
    <div className={`clock flip-clock-wrapper ${isUrgent ? 'urgent' : ''}`} title={`Timer: ${countdown}s`}>
      {/* Tens Digit */}
      <ul className="flip play">
        <li className="flip-clock-before">
          <a href="#tens-before">
            <div className="up">
              <div className="shadow"></div>
              <div className="inn">{prevD1}</div>
            </div>
            <div className="down">
              <div className="shadow"></div>
              <div className="inn">{prevD1}</div>
            </div>
          </a>
        </li>
        <li className="flip-clock-active">
          <a href="#tens-active">
            <div className="up">
              <div className="shadow"></div>
              <div className="inn">{d1}</div>
            </div>
            <div className="down">
              <div className="shadow"></div>
              <div className="inn">{d1}</div>
            </div>
          </a>
        </li>
      </ul>

      {/* Ones Digit */}
      <ul className="flip play">
        <li className="flip-clock-before">
          <a href="#ones-before">
            <div className="up">
              <div className="shadow"></div>
              <div className="inn">{prevD2}</div>
            </div>
            <div className="down">
              <div className="shadow"></div>
              <div className="inn">{prevD2}</div>
            </div>
          </a>
        </li>
        <li className="flip-clock-active">
          <a href="#ones-active">
            <div className="up">
              <div className="shadow"></div>
              <div className="inn">{d2}</div>
            </div>
            <div className="down">
              <div className="shadow"></div>
              <div className="inn">{d2}</div>
            </div>
          </a>
        </li>
      </ul>
    </div>
  );
}

