import { lazy, Suspense, useEffect, useState } from 'react';
import { useCasino } from '../../context/CasinoContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  LIVE_SUB_SLUGS,
  LiveSubMarketTable,
  TableT2Generic,
} from './casino/shared';

const RouletteTable = lazy(() => import('./RouletteTable'));
const Goal2Table = lazy(() => import('./games/Goal2Table'));
const MatkaTable = lazy(() => import('./MatkaTable'));

const VIRTUAL_SLUGS = new Set([
  'vlucky7',
  'vtrio',
  'vdtl20',
  'vteenmuf',
  'vaaa',
  'vbtable',
  'vdt6',
  'vteen',
  'vteen20',
]);

const ROULETTE_SLUGS = new Set([
  'roulette11',
  'roulette12',
  'roulette13',
  'ourroullete',
]);

const MATKA_SLUGS = new Set(['worli', 'worli2', 'worli3']);

const GENERIC_T2_SLUGS = new Set([
  'superover',
  'superover2',
  'superover3',
  'cricketv3',
]);

// Game-family dynamic loaders so opening one casino game downloads only its
// family chunk instead of all 80+ casino tables at once.
const FAMILY_LOADERS = {
  teenpatti: () => import('./casino/teenpattiTables'),
  dragonTigerBaccarat: () => import('./casino/dragonTigerBaccaratTables'),
  pokerAndCard: () => import('./casino/pokerAndCardTables'),
  luckyAndBollywood: () => import('./casino/luckyAndBollywoodTables'),
  andarBahar: () => import('./casino/andarBaharTables'),
  diceSportsAndRace: () => import('./casino/diceSportsAndRaceTables'),
};

const SLUG_TO_FAMILY = {
  // Teenpatti, Poison, Joker, Trio
  poison: 'teenpatti',
  teenunique: 'teenpatti',
  poison20: 'teenpatti',
  joker120: 'teenpatti',
  joker20: 'teenpatti',
  joker1: 'teenpatti',
  teen20c: 'teenpatti',
  teen41: 'teenpatti',
  teen42: 'teenpatti',
  teen33: 'teenpatti',
  teen32: 'teenpatti',
  teen: 'teenpatti',
  teen20: 'teenpatti',
  teen9: 'teenpatti',
  teen8: 'teenpatti',
  teen6: 'teenpatti',
  patti2: 'teenpatti',
  teensin: 'teenpatti',
  teenmuf: 'teenpatti',
  teen20b: 'teenpatti',
  trio: 'teenpatti',
  teen120: 'teenpatti',
  teen1: 'teenpatti',
  teen3: 'teenpatti',
  pteen: 'teenpatti',
  pteen20: 'teenpatti',

  // Dragon Tiger & Baccarat
  baccarat: 'dragonTigerBaccarat',
  baccarat2: 'dragonTigerBaccarat',
  pbaccarat: 'dragonTigerBaccarat',
  dt20: 'dragonTigerBaccarat',
  dt202: 'dragonTigerBaccarat',
  pdt20: 'dragonTigerBaccarat',
  dt6: 'dragonTigerBaccarat',
  pdt6: 'dragonTigerBaccarat',
  dtl20: 'dragonTigerBaccarat',

  // Poker & Specialty Card Games
  poker: 'pokerAndCard',
  poker20: 'pokerAndCard',
  poker6: 'pokerAndCard',
  card32: 'pokerAndCard',
  pcard32: 'pokerAndCard',
  card32eu: 'pokerAndCard',
  '3cardj': 'pokerAndCard',
  queen: 'pokerAndCard',
  trap: 'pokerAndCard',
  notenum: 'pokerAndCard',
  dum10: 'pokerAndCard',
  cmeter1: 'pokerAndCard',

  // Lucky, AAA, Bollywood, Mogambo, Lottery
  mogambo: 'luckyAndBollywood',
  lucky5: 'luckyAndBollywood',
  btable2: 'luckyAndBollywood',
  lucky15: 'luckyAndBollywood',
  lucky7: 'luckyAndBollywood',
  plucky7: 'luckyAndBollywood',
  lucky7eu: 'luckyAndBollywood',
  lucky7eu2: 'luckyAndBollywood',
  aaa: 'luckyAndBollywood',
  aaa2: 'luckyAndBollywood',
  btable: 'luckyAndBollywood',
  lottcard: 'luckyAndBollywood',

  // Andar Bahar
  ab4: 'andarBahar',
  ab3: 'andarBahar',
  ab20: 'andarBahar',
  abj: 'andarBahar',

  // Dice, Sports Casino & Races
  dolidana: 'diceSportsAndRace',
  goal: 'diceSportsAndRace',
  sicbo2: 'diceSportsAndRace',
  sicbo: 'diceSportsAndRace',
  ballbyball: 'diceSportsAndRace',
  cmatch20: 'diceSportsAndRace',
  race20: 'diceSportsAndRace',
  race17: 'diceSportsAndRace',
  race2: 'diceSportsAndRace',
};

const familyCache = new Map();
let virtualTablesCache = null;

function useLazyTableComponent(slug) {
  const isVirtual = VIRTUAL_SLUGS.has(slug);
  const familyKey = SLUG_TO_FAMILY[slug] || null;

  const getCached = () => {
    if (isVirtual) return virtualTablesCache?.[slug] || null;
    if (familyKey) return familyCache.get(familyKey)?.[slug] || null;
    return null;
  };

  const [Component, setComponent] = useState(getCached);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setComponent(() => cached);
      return undefined;
    }
    if (!isVirtual && !familyKey) {
      setComponent(null);
      return undefined;
    }

    let cancelled = false;
    if (isVirtual) {
      import('./VirtualTables').then((mod) => {
        virtualTablesCache = mod.VIRTUAL_TABLES;
        if (!cancelled) {
          setComponent(() => mod.VIRTUAL_TABLES?.[slug] || null);
        }
      });
    } else if (familyKey && FAMILY_LOADERS[familyKey]) {
      FAMILY_LOADERS[familyKey]().then((mod) => {
        const tables = mod.TABLES || mod.default || {};
        familyCache.set(familyKey, tables);
        if (!cancelled) {
          setComponent(() => tables[slug] || null);
        }
      });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isVirtual, familyKey]);

  return { Component, isAsyncManaged: isVirtual || Boolean(familyKey) };
}

function TableFallback() {
  return (
    <div className='py-4 text-center text-xs text-gray-500'>
      Loading table...
    </div>
  );
}

export default function GameMarketTable() {
  const { selectedGame, roundData, isSuspended, openBetSlip } = useCasino();
  const markets = roundData?.markets || {};
  const isMobile = useIsMobile(1200);

  const { Component: LazyTable, isAsyncManaged } =
    useLazyTableComponent(selectedGame);

  if (LIVE_SUB_SLUGS.has(selectedGame)) {
    return (
      <LiveSubMarketTable
        isMobile={isMobile}
        isSuspended={isSuspended}
        openBetSlip={openBetSlip}
      />
    );
  }

  if (selectedGame === 'goal2') {
    return (
      <Suspense fallback={<TableFallback />}>
        <Goal2Table />
      </Suspense>
    );
  }

  if (MATKA_SLUGS.has(selectedGame)) {
    return (
      <Suspense fallback={<TableFallback />}>
        <MatkaTable isMobile={isMobile} isSuspended={isSuspended} />
      </Suspense>
    );
  }

  if (ROULETTE_SLUGS.has(selectedGame)) {
    return (
      <Suspense fallback={<TableFallback />}>
        <RouletteTable />
      </Suspense>
    );
  }

  if (GENERIC_T2_SLUGS.has(selectedGame)) {
    return <TableT2Generic />;
  }

  if (isAsyncManaged) {
    if (!LazyTable) return <TableFallback />;
    if (VIRTUAL_SLUGS.has(selectedGame)) return <LazyTable />;
    return (
      <LazyTable
        isMobile={isMobile}
        isSuspended={isSuspended}
        openBetSlip={openBetSlip}
        markets={markets}
      />
    );
  }

  return (roundData?.mgroups || []).length ? <TableT2Generic /> : null;
}
