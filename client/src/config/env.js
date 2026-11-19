const trimTrailingSlash = (url = '') => String(url).trim().replace(/\/+$/, '');

const toWebSocketUrl = (rawUrl) => {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed || trimmed === '/') {
    if (typeof window !== 'undefined' && window.location?.host) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}`;
    }
    return 'ws://localhost:3000';
  }
  if (trimmed.startsWith('ws://') || trimmed.startsWith('wss://')) {
    return trimmed;
  }
  if (trimmed.startsWith('https://')) {
    return `wss://${trimmed.slice('https://'.length)}`;
  }
  if (trimmed.startsWith('http://')) {
    return `ws://${trimmed.slice('http://'.length)}`;
  }
  return trimmed;
};

const isLocal =
  String(import.meta.env.VITE_IS_LOCAL || '').toLowerCase() === 'true';

const apiBaseUrl = isLocal
  ? trimTrailingSlash(
      import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_LOCAL_API_URL ||
        'http://localhost:3000/api'
    )
  : trimTrailingSlash(import.meta.env.VITE_API_URL || '/api');

const wsBaseUrl = toWebSocketUrl(
  isLocal
    ? import.meta.env.VITE_WS_URL ||
        import.meta.env.VITE_LOCAL_WS_URL ||
        'ws://localhost:3000'
    : import.meta.env.VITE_WS_URL || '/'
);

export const env = {
  isLocal,
  apiBaseUrl,
  wsBaseUrl,
  liveTvUrl: trimTrailingSlash(
    import.meta.env.VITE_LIVE_TV_URL || 'https://tv.nautical7.com/stream'
  ),
  liveTvKey: String(
    import.meta.env.VITE_LIVE_TV_KEY ||
      import.meta.env.VITE_LIVE_STREAM_KEY_NEW ||
      ''
  ).trim(),
  casinoTvBaseUrl: trimTrailingSlash(
    import.meta.env.VITE_CASINO_TV_BASE_URL || 'https://scoreapi.nautical7.com'
  ),
  casinoTvKey: String(import.meta.env.VITE_CASINO_TV_KEY || '').trim(),
  scoreIframeBaseUrl: trimTrailingSlash(
    import.meta.env.VITE_SCORE_IFRAME_BASE_URL ||
      import.meta.env.VITE_CASINO_TV_BASE_URL ||
      'https://scoreapi.nautical7.com'
  ),
  scoreIframeKey: String(
    import.meta.env.VITE_SCORE_IFRAME_KEY ||
      import.meta.env.VITE_CASINO_TV_KEY ||
      ''
  ).trim(),
  assetCdnUrl: trimTrailingSlash(
    import.meta.env.VITE_ASSET_CDN_URL ||
      'https://cdn.926assets.com/g3ver/v107/static/front/img'
  ),
};

export default env;
