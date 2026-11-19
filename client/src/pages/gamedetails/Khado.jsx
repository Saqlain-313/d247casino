import { useMemo } from 'react';
import { StandardFancyExposureBadge } from './components/FancyTwoColumnTable';
import SuspendedOverlay from './components/SuspendedOverlay';
import {
  formatLimitCompact,
  resolveFancyItemSuspension,
} from './utils/marketHelpers';

const formatMax = (max) =>
  typeof max === 'string' ? max : formatLimitCompact(max);

function Khado({ onBetSelect, khadoData, pendingBetAmounts }) {
  const transformedData = useMemo(() => {
    if (!Array.isArray(khadoData) || khadoData.length === 0) return [];
    return khadoData.map((item, index) => {
      const backOdd = item.odds?.find((odd) => odd.otype === 'back');
      const layOdd = item.odds?.find((odd) => odd.otype === 'lay');
      return {
        id: index + 1,
        label: item.team || `Item ${index + 1}`,
        layOdds: layOdd && layOdd.odds > 0 ? layOdd.odds : null,
        back:
          backOdd && backOdd.odds > 0
            ? { rate: backOdd.odds, size: backOdd.size || 0 }
            : { rate: null, size: null },
        min: formatMax(item.min || 0),
        max: formatMax(item.max || 0),
        minRaw: item.min || 0,
        maxRaw: item.max || 0,
        sid: item.sid,
        status: item.status,
        gstatus: item.gstatus,
        gscode: item.gscode,
        marketStatus: item.marketStatus,
        marketGscode: item.marketGscode,
      };
    });
  }, [khadoData]);

  const handleOddsClick = (item) => {
    if (!onBetSelect || !item.back.rate) return;
    onBetSelect({
      team: item.label,
      odds: item.back.rate.toString(),
      type: 'back',
      stake: '',
      teams: [item.label],
      marketName: item.label,
      gameType: 'khado',
      khadoLayOdds: item.layOdds ?? null,
      maxAmount: item.maxRaw || 0,
      minAmount: item.minRaw || 0,
      size: item.back.size || 0,
    });
  };

  return (
    <div>
      <div className='text-secondary mt-1 flex items-center justify-between bg-[#2C3E50D9] p-1'>
        <span className='text-[15px] font-bold'>Khado</span>
      </div>
      <div>
        <div className='grid grid-cols-[1fr_60px] border-b border-b-[#c7c8ca] lg:grid-cols-[1fr_60px_60px]'>
          <div></div>
          <div className='flex items-center justify-center bg-[#72bbef] p-[2px] text-[13px] font-bold text-[#333] lg:text-[14px]'>
            Back
          </div>
          <div className='hidden lg:block'></div>
        </div>
        {transformedData.length > 0 ? (
          transformedData.map((item) => {
            const { suspended, label } = resolveFancyItemSuspension(item);
            return (
              <div
                key={item.id}
                className='grid grid-cols-[1fr_60px] border-b border-b-[#c7c8ca] hover:bg-[#f7f7f7] lg:grid-cols-[1fr_60px_60px]'
              >
                <div className='ml-2 flex min-w-0 flex-col justify-center py-1 text-[13px] font-[400] break-words text-[#333]'>
                  <div>
                    {item.label}
                    {item.layOdds ? ` - ${item.layOdds}` : ''}
                  </div>
                  <StandardFancyExposureBadge
                    pendingBetAmounts={pendingBetAmounts}
                    gameType='khado'
                    team={item.label}
                  />
                </div>

                {suspended ? (
                  <div className='relative col-span-1 grid grid-cols-1 lg:col-span-2 lg:grid-cols-2'>
                    <div className='flex min-h-[34px] flex-col items-center justify-center bg-[#72bbef]'>
                      <span className='text-[15px] font-bold text-[#333]'>
                        {item.back.rate || '-'}
                      </span>
                      {item.back.rate ? (
                        <span className='text-[11px] text-[#333]'>
                          {item.back.size}
                        </span>
                      ) : null}
                    </div>
                    <div className='hidden flex-col items-center justify-center lg:flex'>
                      <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                        Min:{item.min}
                      </span>
                      <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                        Max:{item.max}
                      </span>
                    </div>
                    <SuspendedOverlay label={label} compact />
                  </div>
                ) : (
                  <>
                    <button
                      type='button'
                      disabled={!item.back.rate}
                      className={`flex min-h-[34px] flex-col items-center justify-center border-0 bg-[#72bbef] text-[#333] ${
                        item.back.rate
                          ? 'cursor-pointer transition-opacity hover:opacity-85'
                          : 'cursor-default'
                      }`}
                      onClick={() => handleOddsClick(item)}
                    >
                      {item.back.rate ? (
                        <>
                          <span className='text-[15px] leading-4 font-bold lg:text-[16px]'>
                            {item.back.rate}
                          </span>
                          <span className='text-[11px] leading-4 lg:text-[12px]'>
                            {item.back.size}
                          </span>
                        </>
                      ) : (
                        <span className='text-[15px] font-bold'>-</span>
                      )}
                    </button>

                    <div className='hidden flex-col items-center justify-center lg:flex'>
                      <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                        Min:{item.min}
                      </span>
                      <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                        Max:{item.max}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className='py-4 text-center text-gray-500'>
            No data available
          </div>
        )}
      </div>
    </div>
  );
}

export default Khado;
