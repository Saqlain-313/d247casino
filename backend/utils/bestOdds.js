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

// Listing odds array for the 1/X/2 columns. Reference listing = 3 selections.
// 3 sections (football home/draw/away) -> [sec0, sec1, sec2]; 2 sections
// (tennis/cricket) -> [sec0, empty, sec1] (X column empty). Pehle interleaved
// empty padding [sel0, empty, sel1, empty, sel2] banta tha jisse frontend
// odds[0]/[1]/[2] galat columns padhta tha (away gayab, draw wrong column).
export const listingOdds = (sections) => {
  const empty = { home: '0', away: '0' };
  const secs = (Array.isArray(sections) ? sections : []).map((s) => {
    const b = bestBackLay(s?.odds);
    return { home: b.back, away: b.lay };
  });
  if (secs.length >= 3) return [secs[0], secs[1], secs[2]];
  if (secs.length === 2) return [secs[0], empty, secs[1]];
  if (secs.length === 1) return [secs[0], empty, empty];
  return [empty, empty, empty];
};
