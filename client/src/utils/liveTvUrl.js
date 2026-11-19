import env from '../config/env';

export const getLiveTvUrl = (etid, id) => {
  if (!id || !env.liveTvUrl) return '';
  if (!env.liveTvKey) {
    return `${env.liveTvUrl}/${etid}_${id}`;
  }
  const params = new URLSearchParams({ key: env.liveTvKey });
  return `${env.liveTvUrl}/${etid}_${id}?${params.toString()}`;
};
