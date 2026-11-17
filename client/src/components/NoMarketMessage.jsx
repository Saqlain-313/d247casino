import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Shown after a bet page redirects home because its event vanished from the
// provider list. White box 25% from the top, red bold text, auto-clears after
// 3s and strips the router state so a manual refresh does not show it again.
function NoMarketMessage() {
  const location = useLocation();
  const message = location.state?.noMarketMessage;
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) return undefined;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      window.history.replaceState({}, '');
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div
      className='pointer-events-none fixed left-1/2 z-50 w-[92%] max-w-lg -translate-x-1/2'
      style={{ top: '25%' }}
    >
      <div className='rounded border border-gray-300 bg-white px-4 py-3 text-center shadow-lg'>
        <span className='text-[15px] font-bold text-red-600'>{message}</span>
      </div>
    </div>
  );
}

export default NoMarketMessage;
