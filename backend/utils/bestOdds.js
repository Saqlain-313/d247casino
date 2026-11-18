// Best back/lay odds picker for provider section odds.
// Provider order is back3→back2→back1 then lay1→lay2→lay3, so positional
// picks (odds[0]/odds[1]) are wrong. Pick by tno (0 = best); fall back to
// best price (highest back / lowest lay) when tno is missing.
export const bestBackLay = (odds) => {
  const list = Array.isArray(odds) ? odds : [];

  const pick = (type) => {
    const arr = list.filter((o) => o?.otype === type && Number(o.odds) > 0);
    if (!arr.length) return '0';
    const best = arr.reduce((a, b) => {
      const at = Number(a.tno);
      const bt = Number(b.tno);
      if (Number.isFinite(at) && Number.isFinite(bt) && at !== bt) {
        return bt < at ? b : a;
      }
      const ao = Number(a.odds);
      const bo = Number(b.odds);
      return type === 'back' ? (bo > ao ? b : a) : bo < ao ? b : a;
    }, arr[0]);
    return String(best.odds);
  };

  return { back: pick('back'), lay: pick('lay') };
};

// Listing odds array for the 1/X/2 columns. Reference listing = 3 selections
// ordered by provider sno (Test matches/football send [1, 3, 2] i.e. Home, Away, Draw).
export const listingOdds = (sections) => {
  const empty = { home: '0', away: '0' };
  const sorted = (Array.isArray(sections) ? sections : [])
    .map((s, idx) => ({ s, idx }))
    .sort((a, b) => {
      const snoA = Number.isFinite(Number(a.s?.sno)) ? Number(a.s.sno) : a.idx;
      const snoB = Number.isFinite(Number(b.s?.sno)) ? Number(b.s.sno) : b.idx;
      return snoA - snoB || a.idx - b.idx;
    });
  const secs = sorted.map(({ s }) => {
    const b = bestBackLay(s?.odds);
    return { home: b.back, away: b.lay };
  });
  if (secs.length >= 3) return [secs[0], secs[1], secs[2]];
  if (secs.length === 2) return [secs[0], empty, secs[1]];
  if (secs.length === 1) return [secs[0], empty, empty];
  return [empty, empty, empty];
};

// Matches D247 reference listing order without dropping multi-day/paused events:
// 1 <= oid < 2 pinned first, then live (inplay=true, with 2 <= oid < 3 first), then stime ascending.
export const sortSportsMatches = (matches) =>
  [...(Array.isArray(matches) ? matches : [])].sort((a, b) => {
    const oidA = Number(a?.oid);
    const oidB = Number(b?.oid);
    const pinnedA = Number.isFinite(oidA) && oidA >= 1 && oidA < 2;
    const pinnedB = Number.isFinite(oidB) && oidB >= 1 && oidB < 2;
    if (pinnedA !== pinnedB) return pinnedA ? -1 : 1;
    if (pinnedA && pinnedB && oidA !== oidB) return oidA - oidB;

    const inplayA = a?.inplay === true;
    const inplayB = b?.inplay === true;
    if (inplayA !== inplayB) return inplayA ? -1 : 1;

    if (inplayA && inplayB) {
      const liveFeatA = Number.isFinite(oidA) && oidA >= 2 && oidA < 3;
      const liveFeatB = Number.isFinite(oidB) && oidB >= 2 && oidB < 3;
      if (liveFeatA !== liveFeatB) return liveFeatA ? -1 : 1;
      if (liveFeatA && liveFeatB && oidA !== oidB) return oidA - oidB;
    }

    const timeA = new Date(a?.date ?? a?.stime).getTime();
    const timeB = new Date(b?.date ?? b?.stime).getTime();
    const validA = Number.isFinite(timeA);
    const validB = Number.isFinite(timeB);
    if (validA && validB && timeA !== timeB) return timeA - timeB;
    if (validA !== validB) return validA ? -1 : 1;
    return 0;
  });
