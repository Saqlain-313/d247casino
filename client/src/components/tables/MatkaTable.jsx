import React, { useMemo, useState } from 'react';

import { useCasino } from '../../context/CasinoContext';

// worli/matka family: round-based feed. Tabs = OPEN rounds (tabdata), markets
// round ke sub[] se (backend nat label + sections rate merge karta hy),
// payout boards sections se (idle {} = normal state, reference jaisa).
const PANE_LABEL = {
  2: 'SP / DP / TP',
  3: 'SP',
  4: 'DP',
  5: 'TP',
};

export default function MatkaTable({ isMobile, isSuspended }) {
  const { roundData, openBetSlip } = useCasino();
  const [pane, setPane] = useState('single');

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
  const boards = Object.entries(sections)
    .filter(([sid]) => sid !== '1')
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  const boxes = sub
    .map((m) => ({
      sid: Number(m.sid),
      label: String(m.nat ?? m.sid),
      odds: Number(m.b ?? 0),
      open: String(m.gstatus ?? '').toUpperCase() === 'OPEN',
    }))
    .sort((a, b) => a.sid - b.sid);

  return (
    <div className='casino-table worli'>
      {/* Bazaar tabs = open rounds (reference matka-tabs) */}
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

      {/* Pane bar (reference casino-sub-tab) */}
      <div className='worli-tabs mb-2 overflow-auto' id='casino-sub-tab'>
        <ul className='nav nav-pills flex-nowrap gap-1 pb-1'>
          {[
            { id: 'single', name: 'Single Ank' },
            { id: 'payout', name: 'Payout' },
          ].map((t) => (
            <li className='nav-item' key={t.id}>
              <button
                type='button'
                className={`nav-link small px-2 py-1 ${pane === t.id ? 'active' : ''}`}
                style={{ whiteSpace: 'nowrap' }}
                onClick={() => setPane(t.id)}
              >
                {t.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {pane === 'single' && (
        <div className='worli-full'>
          <div className='worli-box-title'>
            <b>Single Ank</b>
          </div>
          <div className='worli-box-row'>
            {boxes.map((b) => {
              const dead = isSuspended || !b.open || !(b.odds > 1);
              return (
                <div
                  key={b.sid}
                  className={`worli-odd-box back ${dead ? 'suspended-box' : ''}`}
                  onClick={
                    dead
                      ? undefined
                      : () => openBetSlip(b.label, b.odds, 'back', isMobile)
                  }
                  style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
                >
                  <span className='worli-odd'>{b.label}</span>
                  {b.odds > 1 && (
                    <span className='worli-odd d-block small'>{b.odds}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pane === 'payout' && (
        <div className='worli-full'>
          {boards.length === 0 ? (
            <div className='text-muted p-2 text-center text-[12px]'>
              No Data Found.
            </div>
          ) : (
            boards.map(([sid, board]) => (
              <div key={sid} className='mb-2'>
                <div className='worli-box-title'>
                  <b>{PANE_LABEL[sid] || `Board ${sid}`}</b>
                </div>
                <div className='table-responsive'>
                  <table className='table-sm table-bordered mb-0 table text-center'>
                    <tbody>
                      {(board?.Table || []).slice(0, 12).map((row, i) => (
                        <tr key={i}>
                          {Object.entries(row)
                            .filter(([k]) => k !== 'msg')
                            .map(([k, v]) => (
                              <td key={k} className='small'>
                                <b className='text-uppercase'>{k}</b> {v}
                              </td>
                            ))}
                          {row?.msg ? (
                            <td className='small text-muted'>{row.msg}</td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
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
