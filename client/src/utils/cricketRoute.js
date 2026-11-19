// Exact D247 iscc route-resolver (776178602-new.devtools @162388):
// 0 -> Real Cricket (/cricket-bet/:id)
// 1 -> Cricket Casino (/cricketv/:id)
// 2 -> Virtual Cricket (/virtual-cricket/:id)
// 3 -> Super Over (/casino/superover | /casino/superover2 | /casino/superover3)
// 4 -> E-Cricket (/e-games/:id)
export function cricketMatchPath(iscc, id, name = '') {
  const n = Number(iscc);
  const label = String(name || '');
  switch (n) {
    case 1:
      return `/cricketv/${id}`;
    case 2:
      return `/virtual-cricket/${id}`;
    case 3:
      if (/over\s*2/i.test(label)) return '/casino/superover2';
      if (/mini/i.test(label)) return '/casino/superover3';
      return '/casino/superover';
    case 4:
      return `/e-games/${id}`;
    default:
      return `/cricket-bet/${id}`;
  }
}

// Navigation state — iscc bhi carry karo taaki bet page refresh pe redux
// match-list load hone ka wait na kare.
export function cricketMatchState(m) {
  return {
    name: m.game,
    time: m.time,
    beventId: m.beventId,
    iscc: m.iscc,
  };
}
