const CASINO_TV_BASE_URL = (
  import.meta.env.VITE_CASINO_TV_BASE_URL ||
  'https://scoreapi.nautical7.com'
).replace(/\/+$/, '');

const CASINO_TV_KEY =
  import.meta.env.VITE_CASINO_TV_KEY || '';

export const getVideoStreamUrl = (eventName) => {
  if (!eventName) {
    console.warn('Casino eventName is missing');
    return '';
  }

  const safeEventName = String(eventName).trim();

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