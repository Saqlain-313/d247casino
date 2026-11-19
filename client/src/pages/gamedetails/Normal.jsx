import { useMemo } from 'react';
import FancyTwoColumnTable, {
  StandardFancyExposureBadge,
} from './components/FancyTwoColumnTable';

function Normal({ onBetSelect, NormalData, pendingBetAmounts }) {
  const items = useMemo(() => {
    if (!Array.isArray(NormalData) || NormalData.length === 0) return [];
    return NormalData.map((item, index) => {
      const backOdd = item.odds?.find((odd) => odd.otype === 'back');
      const layOdd = item.odds?.find((odd) => odd.otype === 'lay');
      return {
        id: index + 1,
        label: item.team || `Item ${index + 1}`,
        left: layOdd
          ? { rate: layOdd.odds, subText: layOdd.size || 0 }
          : { rate: null, subText: 0 },
        right: backOdd
          ? { rate: backOdd.odds, subText: backOdd.size || 0 }
          : { rate: null, subText: 0 },
        minRaw: item.min || 0,
        maxRaw: item.max || 0,
        minDisplay: item.min || 0,
        maxDisplay: item.max || 0,
        sid: item.sid,
        status: item.status,
        gstatus: item.gstatus,
        gscode: item.gscode,
        marketStatus: item.marketStatus,
        marketGscode: item.marketGscode,
      };
    });
  }, [NormalData]);

  const selectSide = (item, type, cell) => {
    if (!onBetSelect || !cell.rate) return;
    onBetSelect({
      team: item.label,
      odds: cell.rate.toString(),
      type,
      stake: '',
      teams: [item.label],
      marketName: item.label,
      gameType: 'Normal',
      maxAmount: item.maxRaw || 0,
      minAmount: item.minRaw || 0,
      size: cell.subText || 0,
    });
  };

  return (
    <FancyTwoColumnTable
      title='Normal'
      items={items}
      renderBadge={(item) => (
        <StandardFancyExposureBadge
          pendingBetAmounts={pendingBetAmounts}
          gameType='Normal'
          team={item.label}
        />
      )}
      onLeftClick={(item) => selectSide(item, 'lay', item.left)}
      onRightClick={(item) => selectSide(item, 'back', item.right)}
    />
  );
}

export default Normal;
