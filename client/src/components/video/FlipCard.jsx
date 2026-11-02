import React, { useState } from 'react';

export default function FlipCard({
  card = '1',
  isFlipped = false,
  onToggle,
  width = 44,
  height = 60,
  className = '',
  style = {},
}) {
  const [localFlip, setLocalFlip] = useState(false);

  const effectiveFlipped = onToggle ? isFlipped : (isFlipped || localFlip);

  const handleClick = (e) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle();
    } else {
      setLocalFlip((prev) => !prev);
    }
  };

  return (
    <div
      className={`flip-card ${className}`}
      onClick={handleClick}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        cursor: 'pointer',
        display: 'inline-block',
        flexShrink: 0,
        ...style,
      }}
      title="Click to flip card"
    >
      <div className={`flip-card-inner ${effectiveFlipped ? 'flip' : ''}`}>
        <div className="flip-card-front">
          <img src="/assets/img/cards/1.jpg" alt="Back" />
        </div>
        <div className="flip-card-back">
          <img
            src={`/assets/img/cards/${card}.jpg`}
            onError={(e) => {
              e.currentTarget.src = `https://cdn.926assets.com/g3ver/v107/static/front/img/cards/${card}.jpg`;
            }}
            alt={`Card ${card}`}
          />
        </div>
      </div>
    </div>
  );
}

