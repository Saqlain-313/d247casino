import env from '../../../config/env';

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

  if (!env.casinoTvKey) {
    console.error('Casino TV API key is missing');
    return '';
  }

  const params = new URLSearchParams({
    key: env.casinoTvKey,
  });

  return `${env.casinoTvBaseUrl}/diamond/casino/${encodeURIComponent(
    safeEventName
  )}?${params.toString()}`;
};
