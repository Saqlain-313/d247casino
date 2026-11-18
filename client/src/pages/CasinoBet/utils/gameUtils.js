const CASINO_TV_BASE_URL = (
  import.meta.env.VITE_CASINO_TV_BASE_URL || 'https://scoreapi.nautical7.com'
).replace(/\/+$/, '');

const CASINO_TV_KEY = import.meta.env.VITE_CASINO_TV_KEY || '';

const TV_SLUG_MAP = {
  pbaccarat: 'baccarat',
  pteen: 'teen',
  pteen20: 'teen20',
  plucky7: 'lucky7',
  pcard32: 'card32',
  pdt6: 'dt6',
  pdt20: 'dt20',
};

export const getVideoStreamUrl = (eventName) => {
  if (!eventName) {
    console.warn('Casino eventName is missing');
    return '';
  }

  const normalizedName = String(eventName).trim();
  const safeEventName =
    TV_SLUG_MAP[normalizedName.toLowerCase()] || normalizedName;

  if (!/^[a-zA-Z0-9_-]+$/.test(safeEventName)) {
    console.error('Invalid casino event name:', safeEventName);
    return '';
  }

  if (!CASINO_TV_KEY) {
    console.error('Casino TV API key is missing');
    return '';
  }

  const params = new URLSearchParams({
    key: CASINO_TV_KEY,
  });

  return `${CASINO_TV_BASE_URL}/diamond/casino/${encodeURIComponent(
    safeEventName
  )}?${params.toString()}`;
};
