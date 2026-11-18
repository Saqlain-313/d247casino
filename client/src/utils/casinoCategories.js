// D247 Casino Categories & Sub-tabs definition
export const CASINO_SUB_TABS = [
  { code: 35, name: 'All Casino' },
  { code: 31, name: 'Roulette' },
  { code: 20, name: 'Teenpatti' },
  { code: 21, name: 'Poker' },
  { code: 22, name: 'Baccarat' },
  { code: 23, name: 'Dragon Tiger' },
  { code: 24, name: '32 Cards' },
  { code: 26, name: 'Andar Bahar' },
  { code: 27, name: 'Lucky 7' },
  { code: 28, name: '3 Card Judgement' },
  { code: 29, name: 'Casino War' },
  { code: 30, name: 'Worli' },
  { code: 34, name: 'Sports' },
  { code: 32, name: 'Bollywood' },
  { code: 33, name: 'Lottery' },
  { code: 40, name: 'Queen' },
  { code: 41, name: 'Race' },
  { code: 73, name: 'Others' },
];

export const CASINO_MAIN_TABS = [
  { cType: '4', name: 'Our Casino', path: '/casino-list/LC/4', blink: true },
  {
    cType: '10',
    name: 'Our VIP Casino',
    path: '/casino-list/LC/10',
    blink: true,
  },
  {
    cType: '11',
    name: 'Our Premium Casino',
    path: '/casino-list/LC/11',
    blink: false,
  },
  {
    cType: '19',
    name: 'Our Virtual',
    path: '/casino-list/LC/19',
    blink: false,
  },
];

export const CASINO_TOP_TABS = CASINO_MAIN_TABS;

export const SUB_TABS_BY_MAIN_TAB = {
  4: CASINO_SUB_TABS,
  10: [
    { code: 35, name: 'All Casino' },
    { code: 20, name: 'Teenpatti' },
    { code: 31, name: 'Roulette' },
    { code: 21, name: 'Poker' },
    { code: 22, name: 'Baccarat' },
    { code: 23, name: 'Dragon Tiger' },
    { code: 27, name: 'Lucky 7' },
    { code: 24, name: '32 Cards' },
    { code: 73, name: 'Others' },
  ],
  11: [
    { code: 35, name: 'All Casino' },
    { code: 31, name: 'Roulette' },
    { code: 20, name: 'Teenpatti' },
    { code: 22, name: 'Baccarat' },
    { code: 23, name: 'Dragon Tiger' },
    { code: 24, name: '32 Cards' },
    { code: 27, name: 'Lucky 7' },
    { code: 34, name: 'Sports' },
    { code: 73, name: 'Others' },
  ],
  19: [
    { code: 35, name: 'All Casino' },
    { code: 20, name: 'Teenpatti' },
    { code: 23, name: 'Dragon Tiger' },
    { code: 27, name: 'Lucky 7' },
    { code: 32, name: 'Bollywood' },
    { code: 73, name: 'Others' },
  ],
};

const CATEGORY_RULES = [
  {
    code: 31,
    name: 'Roulette',
    test: ({ name, slug }) => /roulette/i.test(name) || /roulette/i.test(slug),
  },
  {
    code: 21,
    name: 'Poker',
    test: ({ name, slug }) => /poker/i.test(name) || /poker/i.test(slug),
  },
  {
    code: 22,
    name: 'Baccarat',
    test: ({ name, slug }) => /baccarat/i.test(name) || /baccarat/i.test(slug),
  },
  {
    code: 23,
    name: 'Dragon Tiger',
    test: ({ name, slug }) =>
      /dragon\s*tiger|\bd\s*t\s*l\b|\bdt\b/i.test(name) ||
      /^(dt|vdt|pdt)/i.test(slug),
  },
  {
    code: 24,
    name: '32 Cards',
    test: ({ name, slug }) => /32\s*cards?/i.test(name) || /card32/i.test(slug),
  },
  {
    code: 26,
    name: 'Andar Bahar',
    test: ({ name, slug }) => /andar\s*bahar/i.test(name) || /^ab/i.test(slug),
  },
  {
    code: 27,
    name: 'Lucky 7',
    test: ({ name, slug }) => /lucky\s*7/i.test(name) || /lucky7/i.test(slug),
  },
  {
    code: 28,
    name: '3 Card Judgement',
    test: ({ name, slug }) =>
      /3\s*cards?\s*judg/i.test(name) || /3cardj/i.test(slug),
  },
  {
    code: 29,
    name: 'Casino War',
    test: ({ name, slug }) => /\bwar\b/i.test(name),
  },
  {
    code: 30,
    name: 'Worli',
    test: ({ name, slug }) => /worli|matka/i.test(name) || /worli/i.test(slug),
  },
  {
    code: 33,
    name: 'Lottery',
    test: ({ name, slug }) => /lotter/i.test(name) || /lott/i.test(slug),
  },
  {
    code: 32,
    name: 'Bollywood',
    test: ({ name, slug }) => /bollywood/i.test(name) || /btable/i.test(slug),
  },
  {
    code: 41,
    name: 'Race',
    test: ({ name, slug }) => /\brace/i.test(name) || /^race/i.test(slug),
  },
  {
    code: 34,
    name: 'Sports',
    test: ({ name, slug }) =>
      /cricket|super\s*over|\bgoal\b|ball by ball/i.test(name) ||
      /cricket|superover|goal/i.test(slug),
  },
  {
    code: 20,
    name: 'Teenpatti',
    test: ({ name, slug }) =>
      /teen\s*patti/i.test(name) ||
      /^(teen|patti|poison|joker|vteen|pteen)/i.test(slug),
  },
  {
    code: 40,
    name: 'Queen',
    test: ({ name, slug }) => /queen/i.test(name) || /queen/i.test(slug),
  },
];

export const getCasinoCategory = (game) => {
  const item = {
    name: game?.name || '',
    slug: game?.slug || game?.eventName || '',
  };
  const rule = CATEGORY_RULES.find((r) => r.test(item));
  return rule ? rule.name : 'Others';
};

export const getCasinoCategoryMeta = (game) => {
  const item = {
    name: game?.name || '',
    slug: game?.slug || game?.eventName || '',
  };
  const rule = CATEGORY_RULES.find((r) => r.test(item));
  return rule
    ? { code: rule.code, name: rule.name }
    : { code: 73, name: 'Others' };
};

export const isVirtualGame = (game) => {
  const slug = String(game?.eventName || game?.slug || '').toLowerCase();
  const name = String(game?.name || '').toLowerCase();
  return slug.startsWith('v') || name.startsWith('virtual');
};

export const isVipGame = (game) => {
  const slug = String(game?.eventName || game?.slug || '').toLowerCase();
  const name = String(game?.name || '').toLowerCase();
  return (
    /vip|poison|joker|1day|unique|teen62|teen20v1|roulette11/i.test(
      name + ' ' + slug
    ) ||
    [
      'roulette11',
      'poison',
      'teenunique',
      'poison20',
      'joker120',
      'joker20',
      'joker1',
      'teen62',
      'teen20v1',
      'ourroullete',
      'pteen',
      'pdt6',
      'dt202',
    ].includes(slug)
  );
};

export const isPremiumGame = (game) => {
  const slug = String(game?.eventName || game?.slug || '').toLowerCase();
  const name = String(game?.name || '').toLowerCase();
  return (
    slug.startsWith('p') ||
    /premium|roulette12|roulette13|btable2|baccarat2|superover2|superover3|teen20b|teen20c|card32eu|lucky7eu|dt20/i.test(
      name + ' ' + slug
    ) ||
    [
      'roulette12',
      'roulette13',
      'teen20c',
      'btable2',
      'superover3',
      'superover2',
      'baccarat2',
      'dt20',
      'dt202',
      'card32eu',
      'lucky7eu',
      'lucky7eu2',
      'teen20b',
      'pteen',
      'pteen20',
      'pbaccarat',
      'pdt20',
      'pdt6',
      'pcard32',
      'plucky7',
    ].includes(slug)
  );
};

export const getCategoryByCode = (code) => {
  const num = Number(code);
  return CASINO_SUB_TABS.find((t) => t.code === num) || null;
};

export const getCategoryByName = (name) => {
  const lower = String(name || '')
    .trim()
    .toLowerCase();
  return CASINO_SUB_TABS.find((t) => t.name.toLowerCase() === lower) || null;
};

// Playable slugs (kept for backwards compatibility)
export const PLAYABLE_SLUGS = new Set([
  'teen62',
  'poison',
  'teenmuf',
  'poison20',
  'joker120',
  'joker20',
  'joker1',
  'teen20c',
  'teen41',
  'teen42',
  'teen33',
  'teen32',
  'teen',
  'teen20',
  'teen9',
  'teen8',
]);

export const mapCasinoGames = (data) =>
  (data || [])
    .filter((game) => game?.eventName && game?.name)
    .map((game) => {
      const meta = getCasinoCategoryMeta({
        name: game.name,
        slug: game.eventName,
      });
      const isVirtual = isVirtualGame(game);
      const isVip = isVipGame(game);
      const isPremium = isPremiumGame(game);
      const base = {
        id: game.eventName,
        slug: game.eventName,
        eventName: game.eventName,
        name: game.name,
        image: game.imageUrl || game.image || '',
        imageUrl: game.imageUrl || game.image || '',
        gameId: game.gameId,
        providerGameId: game.providerGameId,
        category: meta.name,
        categoryCode: meta.code,
        isVirtual,
        isVip,
        isPremium,
      };

      return base;
    });
