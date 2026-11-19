import { FaArrowRight } from 'react-icons/fa';
import { resolveFancyItemSuspension } from '../utils/marketHelpers';
import SuspendedOverlay from './SuspendedOverlay';

/**
 * Reusable 2-column responsive fancy/session market grid shared by
 * Normal, Fancy1, and OddEven markets (D247 market-6 / market-8 parity).
 */
export default function FancyTwoColumnTable({
  title,
  items = [],
  showColumnHeaders = true,
  leftColHeader = 'No',
  rightColHeader = 'Yes',
  leftCellBg = 'bg-[#faa9ba]',
  rightCellBg = 'bg-[#72bbef]',
  showStatusOverlay = true,
  renderBadge,
  onLeftClick,
  onRightClick,
}) {
  const mid = Math.ceil(items.length / 2);
  const columns = [
    { key: 'left', data: items.slice(0, mid), isRightCol: false },
    { key: 'right', data: items.slice(mid), isRightCol: true },
  ];

  const renderColumnHeader = (isRightCol) => {
    if (!showColumnHeaders) return null;
    const visibilityClass = isRightCol ? 'hidden lg:flex' : 'flex';
    return (
      <div className='grid grid-cols-[1fr_60px_60px] border-b border-b-[#c7c8ca] lg:grid-cols-[1fr_60px_60px_60px]'>
        <div></div>
        <div
          className={`${visibilityClass} items-center justify-center ${leftCellBg} p-[2px] text-[13px] font-bold text-[#333] lg:text-[14px]`}
        >
          {leftColHeader}
        </div>
        <div
          className={`${visibilityClass} items-center justify-center ${rightCellBg} p-[2px] text-[13px] font-bold text-[#333] lg:text-[14px]`}
        >
          {rightColHeader}
        </div>
        <div className='hidden lg:block'></div>
      </div>
    );
  };

  return (
    <div>
      <div className='text-secondary mt-1 flex items-center justify-between bg-[#2C3E50D9] p-1'>
        <span className='text-[14px] font-bold lg:text-[15px]'>{title}</span>
      </div>
      <div className='grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-2'>
        {columns.map(({ key, data, isRightCol }) => (
          <div key={key}>
            {renderColumnHeader(isRightCol)}
            {data.length > 0 ? (
              data.map((item) => {
                const { suspended, label } = showStatusOverlay
                  ? resolveFancyItemSuspension(item)
                  : { suspended: false, label: 'SUSPENDED' };

                return (
                  <div
                    key={item.id}
                    className='grid grid-cols-[1fr_60px_60px] border-b border-b-[#c7c8ca] hover:bg-[#f7f7f7] lg:grid-cols-[1fr_60px_60px_60px]'
                  >
                    <div className='ml-2 flex min-w-0 flex-col justify-center py-1 text-[13px] font-[400] break-words text-[#333]'>
                      <div>{item.label}</div>
                      {renderBadge ? renderBadge(item) : null}
                    </div>

                    {suspended ? (
                      <div className='relative col-span-2 grid grid-cols-2 lg:col-span-3 lg:grid-cols-3'>
                        <div
                          className={`flex min-h-[34px] flex-col items-center justify-center ${leftCellBg}`}
                        >
                          <span className='text-[15px] font-bold text-[#333]'>
                            {item.left.rate || '-'}
                          </span>
                          {item.left.rate ? (
                            <span className='text-[11px] text-[#333]'>
                              {item.left.subText}
                            </span>
                          ) : null}
                        </div>
                        <div
                          className={`flex min-h-[34px] flex-col items-center justify-center border-l border-white ${rightCellBg}`}
                        >
                          <span className='text-[15px] font-bold text-[#333]'>
                            {item.right.rate || '-'}
                          </span>
                          {item.right.rate ? (
                            <span className='text-[11px] text-[#333]'>
                              {item.right.subText}
                            </span>
                          ) : null}
                        </div>
                        <div className='hidden flex-col items-center justify-center lg:flex'>
                          <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                            Min:{item.minDisplay}
                          </span>
                          <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                            Max:{item.maxDisplay}
                          </span>
                        </div>
                        <SuspendedOverlay label={label} compact />
                      </div>
                    ) : (
                      <>
                        <button
                          type='button'
                          disabled={!item.left.rate}
                          className={`flex min-h-[34px] flex-col items-center justify-center border-0 ${leftCellBg} text-[#333] ${
                            item.left.rate
                              ? 'cursor-pointer transition-opacity hover:opacity-85'
                              : 'cursor-default'
                          }`}
                          onClick={() => item.left.rate && onLeftClick?.(item)}
                        >
                          {item.left.rate ? (
                            <>
                              <span className='text-[15px] leading-4 font-bold lg:text-[16px]'>
                                {item.left.rate}
                              </span>
                              <span className='text-[11px] leading-4 lg:text-[12px]'>
                                {item.left.subText}
                              </span>
                            </>
                          ) : (
                            <span className='text-[15px] font-bold'>-</span>
                          )}
                        </button>

                        <button
                          type='button'
                          disabled={!item.right.rate}
                          className={`flex min-h-[34px] flex-col items-center justify-center border-0 border-l border-white ${rightCellBg} text-[#333] ${
                            item.right.rate
                              ? 'cursor-pointer transition-opacity hover:opacity-85'
                              : 'cursor-default'
                          }`}
                          onClick={() =>
                            item.right.rate && onRightClick?.(item)
                          }
                        >
                          {item.right.rate ? (
                            <>
                              <span className='text-[15px] leading-4 font-bold lg:text-[16px]'>
                                {item.right.rate}
                              </span>
                              <span className='text-[11px] leading-4 lg:text-[12px]'>
                                {item.right.subText}
                              </span>
                            </>
                          ) : (
                            <span className='text-[15px] font-bold'>-</span>
                          )}
                        </button>

                        <div className='hidden flex-col items-center justify-center lg:flex'>
                          <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                            Min:{item.minDisplay}
                          </span>
                          <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                            Max:{item.maxDisplay}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            ) : !isRightCol ? (
              <div className='py-4 text-center text-gray-500'>
                No data available
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StandardFancyExposureBadge({
  pendingBetAmounts,
  gameType,
  team,
}) {
  const matchedBet = pendingBetAmounts?.find(
    (item) =>
      item.gameType === gameType &&
      item.teamName?.toLowerCase() === team?.toLowerCase()
  );
  const otype = matchedBet?.otype || '';
  const totalBetAmount = matchedBet?.totalBetAmount || '';
  const totalPrice = matchedBet?.totalPrice || '';
  const teamName = matchedBet?.teamName || '';
  const existingBet = (otype && totalBetAmount) || (totalPrice && teamName);
  if (!existingBet) return null;

  const displayValue = otype === 'back' ? totalBetAmount : totalPrice;
  if (!displayValue) return null;

  return (
    <div className='flex gap-1 text-[11px]'>
      <span className='flex items-center gap-0.5 text-red-500'>
        <FaArrowRight />
        {displayValue}
      </span>
    </div>
  );
}
