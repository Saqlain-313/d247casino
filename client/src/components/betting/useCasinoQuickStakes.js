import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export const DEFAULT_DESKTOP_CASINO_STAKES = [
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '500', value: 500 },
  { label: '5k', value: 5000 },
  { label: '10k', value: 10000 },
  { label: '25k', value: 25000 },
  { label: '100k', value: 100000 },
];

export const DEFAULT_MOBILE_CASINO_STAKES = [
  { label: '100', value: 100 },
  { label: '500', value: 500 },
  { label: '1k', value: 1000 },
  { label: '5k', value: 5000 },
  { label: '10k', value: 10000 },
  { label: '25k', value: 25000 },
];

const formatStakeLabel = (value) =>
  value >= 1000 ? `${value / 1000}k` : String(value);

export function useCasinoQuickStakes(fallback = DEFAULT_DESKTOP_CASINO_STAKES) {
  const { userInfo } = useSelector((state) => state.auth);

  return useMemo(() => {
    const source = userInfo?.casinoQuickStakes?.length
      ? userInfo.casinoQuickStakes
      : fallback;

    return source
      .map((s) => {
        const value = Number(s.value);
        return {
          label: s.label || formatStakeLabel(value),
          value,
        };
      })
      .filter((s) => Number.isFinite(s.value) && s.value > 0);
  }, [userInfo?.casinoQuickStakes, fallback]);
}

export default useCasinoQuickStakes;
