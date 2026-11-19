import { useEffect, useState } from 'react';

const DEFAULT_PAGE_SIZES = [10, 20, 30, 40, 50];

/**
 * Reusable "Show [N] Entries" + "Search" toolbar for account/report tables.
 */
export function EntriesSearchBar({
  limit,
  onLimitChange,
  searchTerm,
  onSearchChange,
  options = DEFAULT_PAGE_SIZES,
}) {
  return (
    <div className='mt-4 flex items-center justify-between gap-2'>
      <div className='flex items-center gap-2'>
        <span className='text-[16px] font-[400]'>Show</span>
        <select
          name='entries'
          id='entries'
          className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className='text-[16px] font-[400]'>Entries</span>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-[16px] font-[400]'>Search:</span>
        <input
          type='text'
          placeholder='Search'
          className='h-[38px] w-[90px] border border-[#dbdbdb] p-1 outline-none lg:w-auto'
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}

/**
 * Reusable First / Previous / Next / Last + Go to Page pagination footer.
 */
export function TablePagination({ page, totalPages, onPageChange }) {
  const [goToPage, setGoToPage] = useState(page);

  useEffect(() => {
    setGoToPage(page);
  }, [page]);

  if (!totalPages || totalPages <= 1) return null;

  const btnClass =
    'border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white';

  return (
    <div className='mt-4 flex flex-col items-center gap-3'>
      <div className='flex items-center gap-2'>
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          className={btnClass}
        >
          First
        </button>
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className={btnClass}
        >
          Previous
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className={btnClass}
        >
          Next
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className={btnClass}
        >
          Last
        </button>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-sm'>Page</span>
        <span className='text-sm font-semibold'>{page}</span>
        <span className='text-sm'>of</span>
        <span className='text-sm font-semibold'>{totalPages}</span>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-sm'>Go to Page</span>
        <input
          type='number'
          min='1'
          max={totalPages}
          value={goToPage}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (value >= 1 && value <= totalPages) {
              setGoToPage(value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = parseInt(goToPage, 10);
              if (value >= 1 && value <= totalPages) {
                onPageChange(value);
              }
            }
          }}
          className='w-16 border border-gray-300 px-2 py-1 text-center text-sm'
        />
      </div>
    </div>
  );
}
