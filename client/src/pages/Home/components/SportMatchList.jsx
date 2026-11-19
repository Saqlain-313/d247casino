import { useEffect } from 'react';
import { FaCircle } from 'react-icons/fa';
import { GiTv } from 'react-icons/gi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Bm from '../../../assets/ic_bm.png';
import F from '../../../assets/ic_fancy.png';
import IsccIcon from '../../../components/IsccIcon';

const OddsCell = ({ value, type }) => (
  <div
    className={`flex h-6 items-center justify-center text-sm font-semibold ${
      type === 'back' ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'
    }`}
  >
    {value}
  </div>
);

/**
 * Reusable 1-X-2 sport match listing table (used by Football and Tennis pages).
 */
export default function SportMatchList({
  sliceKey,
  fetchAction,
  routePrefix,
  refreshMs = 5000,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { matches = [] } = useSelector((state) => state[sliceKey] || {});

  useEffect(() => {
    const refresh = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      dispatch(fetchAction());
    };
    refresh();
    const intervalId = setInterval(refresh, refreshMs);
    return () => clearInterval(intervalId);
  }, [dispatch, fetchAction, refreshMs]);

  const openMatch = (m) =>
    navigate(`${routePrefix}/${m.id}`, {
      state: { name: m.game, time: m.time, beventId: m.beventId },
    });

  return (
    <div className='w-full text-sm text-gray-900'>
      {/* DESKTOP HEADER */}
      <div className='hidden grid-cols-[1fr_70px_70px_70px_70px_70px_70px] border border-b-0 border-gray-300 bg-gray-100 font-bold md:grid'>
        <div className='px-2 py-2'>Game</div>
        <div className='col-span-2 text-center'>1</div>
        <div className='col-span-2 text-center'>X</div>
        <div className='col-span-2 text-center'>2</div>
      </div>

      {/* ROWS */}
      {matches.map((m) => (
        <div key={m.id} className='border border-t-0 border-gray-300'>
          {/* DESKTOP VIEW */}
          <div
            className='hidden cursor-pointer grid-cols-[1fr_70px_70px_70px_70px_70px_70px] hover:bg-gray-50 md:grid'
            onClick={() => openMatch(m)}
          >
            <div className='flex min-w-0 items-center justify-between gap-2 px-2'>
              <div className='flex min-w-0 flex-1 items-center gap-2'>
                <div className='truncate text-[14px] font-[400] text-[#333]'>
                  {m.game}
                </div>
                <div className='shrink-0 text-[13px] font-[400] text-[#555]'>
                  {m.time}
                </div>
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                {m.inplay && (
                  <FaCircle className='h-[14px] w-[14px] text-[#28a745]' />
                )}
                {m.tv && <GiTv className='h-[14px] w-[14px]' />}
                {m.f && <img src={F} alt='F' className='h-[12px]' />}
                {m.bm && <img src={Bm} alt='Bm' className='h-[12px]' />}
                <IsccIcon iscc={m.iscc} />
              </div>
            </div>

            <OddsCell value={m.one.back} type='back' />
            <OddsCell value={m.one.lay} type='lay' />
            <OddsCell value={m.x.back} type='back' />
            <OddsCell value={m.x.lay} type='lay' />
            <OddsCell value={m.two.back} type='back' />
            <OddsCell value={m.two.lay} type='lay' />
          </div>

          {/* MOBILE VIEW */}
          <div
            className='space-y-2 bg-white p-2 md:hidden'
            onClick={() => openMatch(m)}
          >
            <div className='flex items-center justify-between gap-2'>
              <div className='min-w-0 flex-1'>
                <div className='truncate text-[14px] font-bold text-[#333]'>
                  {m.game}
                </div>
                <div className='text-[12px] font-[400] text-[#555]'>
                  {m.time}
                </div>
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                {m.inplay && (
                  <FaCircle className='h-[12px] w-[12px] text-[#28a745]' />
                )}
                {m.tv && <GiTv className='h-[14px] w-[14px]' />}
                {m.f && <img src={F} alt='F' className='h-[12px]' />}
                {m.bm && <img src={Bm} alt='Bm' className='h-[12px]' />}
                <IsccIcon iscc={m.iscc} />
              </div>
            </div>

            <div className='grid grid-cols-3 text-center text-xs font-semibold text-gray-600'>
              <div>1</div>
              <div>X</div>
              <div>2</div>
            </div>

            <div className='grid grid-cols-3 gap-1'>
              <div className='grid grid-cols-2 gap-1'>
                <OddsCell value={m.one.back} type='back' />
                <OddsCell value={m.one.lay} type='lay' />
              </div>
              <div className='grid grid-cols-2 gap-1'>
                <OddsCell value={m.x.back} type='back' />
                <OddsCell value={m.x.lay} type='lay' />
              </div>
              <div className='grid grid-cols-2 gap-1'>
                <OddsCell value={m.two.back} type='back' />
                <OddsCell value={m.two.lay} type='lay' />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
