// In-flight request dedupe: concurrent identical GETs (StrictMode double
// effects, Sidebar + listing pages + ticker mounting together) collapse into
// a single HTTP request whose promise every caller shares.
const inflight = new Map();

export const dedupedGet = (key, fn) => {
  if (inflight.has(key)) return inflight.get(key);

  const promise = Promise.resolve()
    .then(fn)
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
};
