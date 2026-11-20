import React, { useState } from 'react';

import api from '../../redux/api';

// worli3calendar reference feature hamare end se: dated casino results
// (/casino/direct-result-by-date) se month grid + per-day result list.
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function MatkaCalendar({ slug, bazaarName = '', onClose }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [day, setDay] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const bazaarFilter = String(bazaarName || '')
    .trim()
    .toLowerCase();

  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const today = new Date();
  const isFuture = (d) =>
    ym.y > today.getFullYear() ||
    (ym.y === today.getFullYear() && ym.m > today.getMonth()) ||
    (ym.y === today.getFullYear() &&
      ym.m === today.getMonth() &&
      d > today.getDate());

  const shiftMonth = (delta) => {
    setYm(({ y, m }) => {
      const nm = m + delta;
      if (nm < 0) return { y: y - 1, m: 11 };
      if (nm > 11) return { y: y + 1, m: 0 };
      return { y, m: nm };
    });
    setDay(null);
    setRows([]);
  };

  const pick = async (d) => {
    const date = `${ym.y}-${String(ym.m + 1).padStart(2, '0')}-${String(
      d
    ).padStart(2, '0')}`;
    setDay(date);
    setLoading(true);
    try {
      const r = await api.get('/casino/direct-result-by-date', {
        params: { date, eventName: slug },
      });
      const list = Array.isArray(r.data?.data) ? r.data.data : [];
      setRows(
        bazaarFilter
          ? list.filter((row) =>
              String(row?.nat || '')
                .toLowerCase()
                .includes(bazaarFilter)
            )
          : list
      );
    } catch {
      setRows([]);
    }
    setLoading(false);
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3'
      onClick={onClose}
    >
      <div
        className='w-full max-w-[560px] rounded bg-white p-3'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='mb-2 flex items-center justify-between'>
          <button
            type='button'
            className='btn btn-sm btn-outline-secondary'
            onClick={() => shiftMonth(-1)}
          >
            &lt;
          </button>
          <b>
            {bazaarName ? `${bazaarName} — ` : ''}
            {MONTHS[ym.m]} {ym.y}
          </b>
          <button
            type='button'
            className='btn btn-sm btn-outline-secondary'
            onClick={() => shiftMonth(1)}
          >
            &gt;
          </button>
          <button
            type='button'
            className='btn btn-sm btn-danger'
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className='grid grid-cols-7 gap-1 text-center'>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
            <button
              type='button'
              key={d}
              disabled={isFuture(d)}
              onClick={() => pick(d)}
              className={`rounded border p-1 text-[12px] font-semibold ${
                day ===
                `${ym.y}-${String(ym.m + 1).padStart(2, '0')}-${String(
                  d
                ).padStart(2, '0')}`
                  ? 'bg-[#0088cc] text-white'
                  : 'bg-[#f7f7f7]'
              } ${isFuture(d) ? 'opacity-40' : 'hover:bg-[#e7f4fb]'}`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className='mt-3 max-h-[240px] overflow-y-auto'>
          {loading ? (
            <div className='p-2 text-center text-xs text-gray-500'>
              Loading results...
            </div>
          ) : day ? (
            rows.length ? (
              <table className='table-bordered w-full text-[12px]'>
                <tbody>
                  {rows.map((r, i) => {
                    const parts = String(r.nat || '')
                      .split('-')
                      .map((p) => p.trim());
                    return (
                      <tr key={`${r.mid}-${i}`}>
                        <td className='border p-1 font-semibold'>
                          {parts[2] || '-'}
                        </td>
                        <td className='border p-1'>{parts[0] || '-'}</td>
                        <td className='border p-1 font-bold'>
                          {parts[1] || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className='p-2 text-center text-xs text-gray-500'>
                No results for {day}
              </div>
            )
          ) : (
            <div className='p-2 text-center text-xs text-gray-500'>
              Select a date to view results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
