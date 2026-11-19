import { useMemo } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import FancyTwoColumnTable from './components/FancyTwoColumnTable';

const formatMax = (max) => {
  if (typeof max === 'string') return max;
  if (max >= 100000) return `${(max / 100000).toFixed(0)}L`;
  if (max >= 1000) return `${(max / 1000).toFixed(0)}k`;
  return max;
};

function OddEven({ onBetSelect, oddEvenData, pendingBetAmounts }) {
  const items = useMemo(() => {
    if (!Array.isArray(oddEvenData) || oddEvenData.length === 0) return [];
    return oddEvenData.map((item, index) => {
      const backOdd = item.odds?.find((odd) => odd.otype === 'back');
      const layOdd = item.odds?.find((odd) => odd.otype === 'lay');
      // Reference market-8: single blue colour for both buttons (back -> Odd, lay -> Even)
      return {
        id: index + 1,
        label: item.team || `Item ${index + 1}`,
        left:
          backOdd && backOdd.odds > 0
            ? { rate: backOdd.odds, subText: backOdd.size || 0 }
            : { rate: null, subText: null },
        right:
          layOdd && layOdd.odds > 0
            ? { rate: layOdd.odds, subText: layOdd.size || 0 }
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
  }, [oddEvenData]);

  const getBetDetails = (team) => {
    const marketBets =
      pendingBetAmounts?.filter(
        (item) =>
          item.gameType === 'oddeven' &&
          item.marketName?.toLowerCase() === team?.toLowerCase()
      ) || [];

    if (marketBets.length === 0) {
      return { hasBet: false, displayValue: null, color: 'red' };
    }

    let oddOutcome = 0;
    let evenOutcome = 0;

    marketBets.forEach((bet) => {
      const isOddSelection = bet.teamName?.toLowerCase() === 'odd';
      const betAmt = Number(bet.totalBetAmount) || 0;
      const stake = Number(bet.totalPrice) || 0;

      if (bet.otype === 'back') {
        oddOutcome += isOddSelection ? betAmt : -stake;
        evenOutcome += isOddSelection ? -stake : betAmt;
      } else {
        oddOutcome += isOddSelection ? -stake : betAmt;
        evenOutcome += isOddSelection ? betAmt : -stake;
      }
    });

    const worstOutcome = Math.min(oddOutcome, evenOutcome);
    const bestOutcome = Math.max(oddOutcome, evenOutcome);

    if (worstOutcome < 0) {
      return {
        hasBet: true,
        displayValue: Math.round(Math.abs(worstOutcome) * 100) / 100,
        color: 'red',
      };
    }

    return {
      hasBet: true,
      displayValue: Math.round(bestOutcome * 100) / 100,
      color: 'green',
    };
  };

  const selectSide = (item, rawType, cell) => {
    if (!onBetSelect || !cell.rate) return;
    const side = rawType === 'back' ? 'Odd' : 'Even';
    onBetSelect({
      team: side,
      odds: cell.rate.toString(),
      type: 'back',
      stake: '',
      teams: ['Odd', 'Even'],
      marketName: item.label,
      gameType: 'oddeven',
      maxAmount: item.maxRaw || 0,
      minAmount: item.minRaw || 0,
    });
  };

  return (
    <FancyTwoColumnTable
      title='OddEven'
      items={items}
      showColumnHeaders={false}
      leftCellBg='bg-[#72bbef]'
      rightCellBg='bg-[#72bbef]'
      renderBadge={(item) => {
        const { hasBet, displayValue, color } = getBetDetails(item.label);
        if (!hasBet || displayValue === null || displayValue <= 0) return null;
        return (
          <div className='flex gap-1 text-[11px]'>
            <span className='flex items-center gap-0.5' style={{ color }}>
              <FaArrowRight />
              {displayValue}
            </span>
          </div>
        );
      }}
      onLeftClick={(item) => selectSide(item, 'back', item.left)}
      onRightClick={(item) => selectSide(item, 'lay', item.right)}
    />
  );
}

export default OddEven;
