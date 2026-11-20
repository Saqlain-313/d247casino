import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { TablePagination } from '../../components/common/ReportTableControls';
import { getDirectCasinoResultByDate } from '../../redux/reducer/casinoBetSlice';
import { fetchCasinoData } from '../../redux/reducer/casinoSlice';
import ResultPopup from '../CasinoBet/components/CasinoResult1';
import { getResultLabel, getWinnerMap } from '../CasinoBet/constants';

const FALLBACK_CASINOS = [
  { slug: 'teen20', name: '20-20 Teenpatti' },
  { slug: 'teen', name: 'Teenpatti 1-day' },
  { slug: 'lucky7', name: 'Lucky 7 - A' },
  { slug: 'lucky7eu', name: 'Lucky 7 - B' },
  { slug: 'dt20', name: '20-20 Dragon Tiger' },
  { slug: 'dt6', name: '1 Day Dragon Tiger' },
  { slug: 'baccarat', name: 'Baccarat' },
  { slug: 'aaa', name: 'Amar Akbar Anthony' },
  { slug: 'btable', name: 'Bollywood Casino' },
  { slug: 'card32', name: '32 Cards A' },
  { slug: 'ab20', name: 'Andar Bahar' },
  { slug: 'worli3', name: 'Matka' },
];

const formatLocalYmd = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function CasinoResults() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const initialGameParam = (searchParams.get('game') || '')
    .trim()
    .toLowerCase();

  const { data: casinoListData } = useSelector((state) => state.casino);
  const {
    directCasinoResult,
    directCasinoResultLoading,
    directCasinoResultError,
  } = useSelector((state) => state.casinoBet);

  // Local date avoids UTC shifting; allow today back to last 4 days (matches DB 4-day retention)
  const { today, minDate } = useMemo(() => {
    const now = new Date();
    const minD = new Date(now);
    minD.setDate(now.getDate() - 3);
    return {
      today: formatLocalYmd(now),
      minDate: formatLocalYmd(minD),
    };
  }, []);

  // Load full live 93-casino catalog from /api/casino-data
  useEffect(() => {
    if (!Array.isArray(casinoListData) || casinoListData.length === 0) {
      dispatch(fetchCasinoData());
    }
  }, [dispatch, casinoListData]);

  const casinos = useMemo(() => {
    if (Array.isArray(casinoListData) && casinoListData.length > 0) {
      const seen = new Set();
      const mapped = [];
      for (const item of casinoListData) {
        const slug = String(item?.eventName || item?.slug || '')
          .trim()
          .toLowerCase();
        if (!slug || seen.has(slug)) continue;
        seen.add(slug);
        mapped.push({
          slug,
          name: String(item?.name || item?.gname || slug).trim(),
        });
      }
      if (mapped.length > 0) {
        return mapped.sort((a, b) => a.name.localeCompare(b.name));
      }
    }
    return FALLBACK_CASINOS;
  }, [casinoListData]);

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedGameId, setSelectedGameId] = useState(
    initialGameParam || 'teen20'
  );
  const [entries, setEntries] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Ensure selectedGameId exists in loaded catalog (or honors ?game= param)
  useEffect(() => {
    if (!casinos.length) return;
    if (
      initialGameParam &&
      casinos.some((c) => c.slug === initialGameParam) &&
      selectedGameId !== initialGameParam
    ) {
      setSelectedGameId(initialGameParam);
      return;
    }
    if (!casinos.some((c) => c.slug === selectedGameId)) {
      setSelectedGameId(casinos[0].slug);
    }
  }, [casinos, initialGameParam, selectedGameId]);

  useEffect(() => {
    if (!selectedGameId || !selectedDate) return;
    setPage(1);
    dispatch(
      getDirectCasinoResultByDate({
        date: selectedDate,
        eventName: selectedGameId,
      })
    );
  }, [dispatch, selectedGameId, selectedDate]);

  const handleSubmit = () => {
    if (!selectedGameId || !selectedDate) return;
    setPage(1);
    dispatch(
      getDirectCasinoResultByDate({
        date: selectedDate,
        eventName: selectedGameId,
      })
    );
  };

  // API shape: { success: true, data: { date, eventName, count, data: [...] } }
  const resultRows = useMemo(() => {
    const rows = directCasinoResult?.data;
    return Array.isArray(rows) ? rows : [];
  }, [directCasinoResult]);

  const resolveWinnerText = (row) => {
    if (row?.nat && String(row.nat).trim()) return String(row.nat).trim();
    const w = String(row?.win ?? row?.winner ?? '').trim();
    if (!w) return '-';
    const wMap = getWinnerMap(selectedGameId);
    if (wMap?.[w]) return wMap[w];
    return getResultLabel(selectedGameId, w) || w;
  };

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return resultRows;
    return resultRows.filter((row) => {
      const roundId = String(row?.mid ?? row?.roundId ?? '').toLowerCase();
      const winner = resolveWinnerText(row).toLowerCase();
      return roundId.includes(query) || winner.includes(query);
    });
  }, [resultRows, search, selectedGameId]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / entries));
  const paginatedRows = useMemo(
    () => filteredRows.slice((page - 1) * entries, page * entries),
    [filteredRows, page, entries]
  );

  const selectedGameName =
    casinos.find((c) => c.slug === selectedGameId)?.name || selectedGameId;

  // Treat 404 / empty provider response gracefully as "No results found"
  const isNotFoundError =
    directCasinoResultError &&
    /404|not found/i.test(
      typeof directCasinoResultError === 'string'
        ? directCasinoResultError
        : directCasinoResultError?.message || ''
    );

  return (
    <div className='w-full overflow-x-auto p-0.5'>
      <div className='w-full border border-[#00000020] bg-[#fff] shadow-[0_0_5px_#a4a4a4]'>
        <div className='bg-secondary text-secondary p-2'>
          <h4 className='text-[16px] font-[400]'>Casino Results</h4>
        </div>
        <div className='mb-2 w-full p-2'>
          <div className='flex flex-wrap gap-2'>
            <div className='flex gap-2'>
              <input
                type='date'
                value={selectedDate}
                min={minDate}
                max={today}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }}
                placeholder='Start Date'
                className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
              />
            </div>
            <select
              name='type'
              id='type'
              value={selectedGameId}
              onChange={(e) => {
                setSelectedGameId(e.target.value);
                setPage(1);
              }}
              className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
            >
              {casinos.map((casino) => (
                <option key={casino.slug} value={casino.slug}>
                  {casino.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSubmit}
              className='bg-primary text-primary h-[38px] w-full rounded-xs px-4 py-1 text-[16px] font-[400] lg:w-auto'
            >
              Submit
            </button>
          </div>
          <div className='mt-4 flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <span className='text-[16px] font-[400]'>Show</span>
              <select
                name='entries'
                id='entries'
                value={entries}
                onChange={(e) => {
                  setEntries(Number(e.target.value));
                  setPage(1);
                }}
                className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
              >
                <option value='10'>10</option>
                <option value='20'>20</option>
                <option value='30'>30</option>
                <option value='40'>40</option>
                <option value='50'>50</option>
              </select>
              <span className='text-[16px] font-[400]'>Entries</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-[16px] font-[400]'>Search:</span>
              <input
                type='text'
                placeholder='Search'
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className='h-[38px] w-[90px] border border-[#dbdbdb] p-1 outline-none lg:w-auto'
              />
            </div>
          </div>
          <div className='scrollbar-hide mt-4 overflow-x-auto'>
            <table className='w-full min-w-[500px] bg-[#f7f7f7]'>
              <thead className='border border-[#c7c8ca]'>
                <tr>
                  <th className='h-8 min-w-[150px] border-r border-[#c7c8ca] p-1 text-left text-sm font-semibold whitespace-nowrap'>
                    Round Id
                  </th>
                  <th className='h-8 min-w-[300px] border-r border-[#c7c8ca] p-1 text-left text-sm font-semibold whitespace-nowrap'>
                    Winner
                  </th>
                </tr>
              </thead>
              <tbody>
                {directCasinoResultLoading ? (
                  <tr>
                    <td
                      colSpan={2}
                      className='border border-[#c7c8ca] p-2 text-center text-sm'
                    >
                      Loading...
                    </td>
                  </tr>
                ) : directCasinoResultError && !isNotFoundError ? (
                  <tr>
                    <td
                      colSpan={2}
                      className='border border-[#c7c8ca] p-2 text-center text-sm'
                    >
                      No results found
                    </td>
                  </tr>
                ) : paginatedRows.length > 0 ? (
                  paginatedRows.map((row, index) => (
                    <tr key={`${row?.mid || row?.roundId || 'row'}-${index}`}>
                      <td
                        onClick={() =>
                          setSelectedItem({
                            ...row,
                            ename: selectedGameName,
                            resultDate: row?.date || selectedDate,
                            eventName: selectedGameId,
                          })
                        }
                        className='cursor-pointer border border-[#c7c8ca] p-1 text-sm underline-offset-2 hover:underline'
                      >
                        {row?.mid || row?.roundId || '-'}
                      </td>
                      <td
                        onClick={() =>
                          setSelectedItem({
                            ...row,
                            ename: selectedGameName,
                            resultDate: row?.date || selectedDate,
                            eventName: selectedGameId,
                          })
                        }
                        className='cursor-pointer border border-[#c7c8ca] p-1 text-sm underline-offset-2 hover:underline'
                      >
                        {resolveWinnerText(row)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className='border border-[#c7c8ca] p-2 text-center text-sm'
                    >
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!directCasinoResultLoading && paginatedRows.length > 0 && (
            <TablePagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
      {selectedItem && (
        <ResultPopup
          gameId={selectedGameId}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          showSideBets={true}
        />
      )}
    </div>
  );
}

export default CasinoResults;
