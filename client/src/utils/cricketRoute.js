// Reference iscc routing (d247-refrences route-resolver): real sport (0) aur
// e-games (4) sportsbook pe; virtual cricket casino (1), virtual cricket (2)
// aur superover (3) apne alag casino game pages pe.
export function cricketMatchPath(iscc, id) {
  switch (Number(iscc)) {
    case 1:
      return `/cricketv/${id}`;
    case 2:
      return `/virtual-cricket/${id}`;
    case 3:
      return `/superover/${id}`;
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
