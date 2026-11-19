import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  EntriesSearchBar,
  TablePagination,
} from '../../components/common/ReportTableControls';
import {
  getUser,
  getLoginHistory,
  passwordHistory,
} from '../../redux/reducer/authReducer';

function ActivityLog() {
  const dispatch = useDispatch();
  const { LoginData, passwordData, loading, pagination } = useSelector(
    (state) => state.auth
  );
  const { userInfo } = useSelector((state) => state.auth);

  // Date setup - default to last 4 months
  const currentDate = new Date();
  const fourMonthsAgo = new Date();
  fourMonthsAgo.setMonth(currentDate.getMonth() - 4);
  const formatDate = (date) => date.toISOString().split('T')[0];

  const [logType, setLogType] = useState('login');
  const [startDate, setStartDate] = useState(formatDate(fourMonthsAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const userId = userInfo?._id;

  // Fetch login history
  const fetchLoginHistory = useCallback(() => {
    if (userId) {
      dispatch(getLoginHistory(userId));
    }
  }, [dispatch, userId]);

  // Fetch password history
  const fetchPasswordHistory = useCallback(() => {
    dispatch(passwordHistory({ page, limit }));
  }, [dispatch, page, limit]);

  // Fetch user info on mount
  useEffect(() => {
    if (!userInfo) {
      dispatch(getUser());
    }
  }, [dispatch, userInfo]);

  // Fetch data based on log type
  useEffect(() => {
    if (logType === 'login' && userInfo?._id) {
      fetchLoginHistory();
    } else if (logType === 'change-password') {
      fetchPasswordHistory();
    }
  }, [logType, fetchLoginHistory, fetchPasswordHistory, userInfo?._id]);

  // Re-fetch password history when page or limit changes
  useEffect(() => {
    if (logType === 'change-password') {
      fetchPasswordHistory();
    }
  }, [page, limit, logType, fetchPasswordHistory]);

  // Get current data based on log type
  const currentData =
    logType === 'login' ? LoginData || [] : passwordData || [];

  // Filter data by search term (client-side for login, server-side for password)
  const filteredData =
    logType === 'login'
      ? currentData.filter((item) => {
          if (!searchTerm) return true;
          const searchLower = searchTerm.toLowerCase();
          return (
            item.userName?.toLowerCase().includes(searchLower) ||
            item.ip?.toLowerCase().includes(searchLower) ||
            item.dateTime?.toLowerCase().includes(searchLower)
          );
        })
      : currentData.filter((item) => {
          if (!searchTerm) return true;
          const searchLower = searchTerm.toLowerCase();
          return (
            item.userName?.toLowerCase().includes(searchLower) ||
            item.remark?.toLowerCase().includes(searchLower) ||
            (item.createdAt &&
              new Date(item.createdAt)
                .toLocaleString()
                .toLowerCase()
                .includes(searchLower))
          );
        });

  // Calculate pagination for login history (client-side)
  const loginTotalPages =
    logType === 'login' ? Math.ceil(filteredData.length / limit) || 1 : 1;

  // Get paginated data for login history
  const paginatedLoginData =
    logType === 'login'
      ? filteredData.slice((page - 1) * limit, page * limit)
      : filteredData;

  // Get pagination info
  const paginationInfo =
    logType === 'change-password'
      ? { pages: pagination?.pages || 1, total: pagination?.total || 0 }
      : { pages: loginTotalPages, total: filteredData.length };

  // Use paginated data for display
  const displayData = logType === 'login' ? paginatedLoginData : filteredData;

  const handleSubmit = () => {
    if (logType === 'login') {
      fetchLoginHistory();
    } else if (logType === 'change-password') {
      setPage(1);
      fetchPasswordHistory();
    }
  };

  return (
    <div className='w-full overflow-x-auto p-0.5'>
      <div className='w-full border border-[#00000020] bg-[#fff] shadow-[0_0_5px_#a4a4a4]'>
        <div className='bg-secondary text-secondary p-2'>
          <h4 className='text-[16px] font-[400]'>Activity Log</h4>
        </div>
        <div className='mb-2 w-full p-2'>
          <div className='flex flex-wrap gap-2'>
            <div className='flex gap-2'>
              <input
                type='date'
                placeholder='Start Date'
                className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              <input
                type='date'
                placeholder='End Date'
                className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <select
              name='type'
              id='type'
              className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
              value={logType}
              onChange={(e) => {
                setLogType(e.target.value);
                setPage(1);
              }}
            >
              <option value='login'>Login</option>
              <option value='change-password'>Change Password</option>
            </select>
            <button
              onClick={handleSubmit}
              className='bg-primary text-primary h-[38px] w-full rounded-xs px-4 py-1 text-[16px] font-[400] lg:w-auto'
            >
              Submit
            </button>
          </div>
          <EntriesSearchBar
            limit={limit}
            onLimitChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <div className='scrollbar-hide mt-4 overflow-x-auto'>
            <table className='w-full min-w-[600px] border border-gray-300'>
              <thead>
                <tr className='bg-[#e0e6e6]'>
                  {logType === 'login' ? (
                    <>
                      <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                        Username
                      </th>
                      <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                        Date
                      </th>
                      <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                        IP Address
                      </th>
                    </>
                  ) : (
                    <>
                      <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                        Username
                      </th>
                      <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                        Date
                      </th>
                      <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                        Remark
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={logType === 'login' ? '3' : '3'}
                      className='h-8 border border-gray-300 p-2 text-center'
                    >
                      Loading...
                    </td>
                  </tr>
                ) : displayData.length > 0 ? (
                  displayData.map((item, index) => (
                    <tr
                      key={item._id || index}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      {logType === 'login' ? (
                        <>
                          <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                            {item.userName || '-'}
                          </td>
                          <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                            {item.dateTime || '-'}
                          </td>
                          <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                            {item.ip || '-'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                            {item.userName || '-'}
                          </td>
                          <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : '-'}
                          </td>
                          <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                            {item.remark || '-'}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={logType === 'login' ? '3' : '3'}
                      className='h-8 border border-gray-300 p-2 text-center'
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && displayData.length > 0 && (
            <TablePagination
              page={page}
              totalPages={paginationInfo.pages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;
