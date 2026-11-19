import { useMemo } from 'react';
import FancyTwoColumnTable, {
  StandardFancyExposureBadge,
} from './components/FancyTwoColumnTable';

const formatMax = (max) => {
  if (typeof max === 'string') return max;
  if (max >= 100000) return `${(max / 100000).toFixed(0)}L`;
  if (max >= 1000) return `${(max / 1000).toFixed(0)}k`;
  return max;
};

function Fancy1({ onBetSelect, fancy1Data, pendingBetAmounts }) {
  const items = useMemo(() => {
    if (!Array.isArray(fancy1Data) || fancy1Data.length === 0) return [];
    return fancy1Data.map((item, index) => {
      const backOdd = item.odds?.find((odd) => odd.otype === 'back');
      const layOdd = item.odds?.find((odd) => odd.otype === 'lay');
      // fancy1 Yes/No session market: No = lay (pink), Yes = back (blue)
      return {
        id: index + 1,
        label: item.team || `Item ${index + 1}`,
        left:
          layOdd && layOdd.odds > 0
            ? { rate: layOdd.odds, subText: layOdd.size || 0 }
            : { rate: null, subText: null },
        right:
          backOdd && backOdd.odds > 0
            ? { rate: backOdd.odds, subText: backOdd.size || 0 }
            : { rate: null, subText: null },
        minDisplay: item.min || 0,
        maxDisplay: formatMax(item.max || 0),
        minRaw: Number(item.min) || 0,
        maxRaw: Number(item.max) || 0,
        sid: item.sid,
        status: item.status,
        gstatus: item.gstatus,
        gscode: item.gscode,
        marketStatus: item.marketStatus,
        marketGscode: item.marketGscode,
      };
    });
  }, [fancy1Data]);

  const selectSide = (item, type, cell) => {
    if (!onBetSelect || !cell.rate) return;
    onBetSelect({
      team: item.label,
      odds: cell.rate.toString(),
      type,
      stake: '',
      teams: [item.label],
      marketName: item.label,
      gameType: 'fancy1',
      maxAmount: item.maxRaw || 0,
      minAmount: item.minRaw || 0,
      size: cell.subText || 0,
    });
  };

  return (
    <FancyTwoColumnTable
      title='Fancy1'
      items={items}
      showStatusOverlay={true}
      renderBadge={(item) => (
        <StandardFancyExposureBadge
          pendingBetAmounts={pendingBetAmounts}
          gameType='fancy1'
          team={item.label}
        />
      )}
      onLeftClick={(item) => selectSide(item, 'lay', item.left)}
      onRightClick={(item) => selectSide(item, 'back', item.right)}
    />
  );
}

export default Fancy1;
