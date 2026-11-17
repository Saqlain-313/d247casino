import React, { useMemo, useState } from 'react';

import { useCasino } from '../../context/CasinoContext';

// worli/matka family: round-based feed. Tabs = OPEN rounds (tabdata), markets
// round ke sub[] se (sid 1-10 = digits sr%10, 11-14 = Line/ODD/EVEN), rates
// sections board se (sid 1 = single rate). Sections idle {} = normal state.
const SPECIAL = { 11: 'Line 1', 12: 'Line 2', 13: 'ODD', 14: 'EVEN' };

export default function MatkaTable({ isMobile, isSuspended }) {
  const { roundData, openBetSlip } = useCasino();

  const rounds = useMemo(
    () => (roundData?.rounds || []).filter((r) => r.mtype === 'OPEN'),
    [roundData]
  );

  const [activeMid, setActiveMid] = useState(null);

  const mid = rounds.some((r) => String(r.mid) === String(activeMid))
    ? activeMid
    : rounds[0]?.mid;

  const round =
    roundData?.subs?.[String(mid)] ||
    (String(roundData?.mid) === String(mid) ? roundData : null);

  const sub = Array.isArray(round?.sub) ? round.sub : [];
  const sections = roundData?.sections || {};
  const singleRate = sections?.['1']?.Table?.[0]?.single;
  const board = sections?.['2']?.Table?.[0] || null;

  const boxes = sub
    .map((m) => {
      const sid = Number(m.sid);
      return {
        sid,
        label: SPECIAL[sid] ?? String(Number(m.sr) % 10),
        open: String(m.gstatus ?? '').toUpperCase() === 'OPEN',
      };
    })
    .sort((a, b) => a.sid - b.sid);

  const dead = isSuspended || !singleRate;

  return (
    <div className='casino-table worli'>
      {/* Bazaar tabs = open rounds, reference matka-tabs pattern */}
      {rounds.length > 0 && (
        <div className='worli-tabs mb-2 overflow-auto'>
          <ul className='nav nav-pills flex-nowrap gap-1 pb-1'>
            {rounds.map((r) => (
              <li className='nav-item' key={String(r.mid)}>
                <button
                  type='button'
                  className={`nav-link small px-2 py-1 ${
                    String(r.mid) === String(mid) ? 'active' : ''
                  }`}
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => setActiveMid(String(r.mid))}
                >
                  <span>{r.mname}</span>
                  {r.ptime && <span className='fw-bold ms-1'>{r.ptime}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className='worli-full'>
        <div className='worli-box-title'>
          <b>Single Ank{singleRate ? ` @ ${singleRate}` : ''}</b>
        </div>
        <div className='worli-box-row'>
          {boxes.map((b) => {
            const suspended = dead || !b.open;
            return (
              <div
                key={b.sid}
                className={`worli-odd-box back ${suspended ? 'suspended-box' : ''}`}
                onClick={
                  suspended
                    ? undefined
                    : () => openBetSlip(b.label, singleRate, 'back', isMobile)
                }
                style={{ cursor: suspended ? 'not-allowed' : 'pointer' }}
              >
                <span className='worli-odd'>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sections board (SP/DP/TP rates) — info only, idle {} normal hy */}
      {board && (
        <div className='worli-clear-box d-flex justify-content-between align-items-center bg-light mt-2 rounded border p-2'>
          <span className='fw-bold'>SP {board.sp ?? '-'}</span>
          <span className='fw-bold'>DP {board.dp ?? '-'}</span>
          <span className='fw-bold'>TP {board.tp ?? '-'}</span>
        </div>
      )}

      {round?.remark && (
        <div className='mt-1 text-[12px] font-semibold text-[#097c93]'>
          {round.remark}
        </div>
      )}
    </div>
  );
}
