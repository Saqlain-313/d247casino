import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';
import { fetchCasinoData } from '../../../redux/reducer/casinoSlice';
import {
  CASINO_SUB_TABS,
  SUB_TABS_BY_MAIN_TAB,
  getCategoryByCode,
  getCategoryByName,
  mapCasinoGames,
} from '../../../utils/casinoCategories';

export default function CasinoList({ initialTab, initialCategory }) {
  const { provider, tabId, subTabId, category } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const { data, loader, error } = useSelector((state) => state.casino);
  const subTabRef = useRef(null);

  // Fetch games list if empty
  useEffect(() => {
    if (!data?.length) {
      dispatch(fetchCasinoData());
    }
  }, [dispatch, data?.length]);

  // Determine active main tab:
  // '4'  = Our Casino
  // '10' = Our VIP Casino
  // '11' = Our Premium Casino
  // '19' = Our Virtual
  const activeTab = useMemo(() => {
    if (tabId && ['4', '10', '11', '19'].includes(String(tabId))) {
      return String(tabId);
    }
    if (initialTab && ['4', '10', '11', '19'].includes(String(initialTab))) {
      return String(initialTab);
    }
    const path = location.pathname;
    if (
      path.includes('/our-vip-casino') ||
      path.includes('/casino-list/LC/10')
    ) {
      return '10';
    }
    if (
      path.includes('/our-prem-casino') ||
      path.includes('/casino-list/LC/11')
    ) {
      return '11';
    }
    if (
      path.includes('/our-virtual-casino') ||
      path.includes('/casino-list/LC/19')
    ) {
      return '19';
    }
    if (category) {
      const lower = String(category).toLowerCase();
      if (lower.includes('vip') || lower === '10') return '10';
      if (lower.includes('prem') || lower === '11') return '11';
      if (lower.includes('virtual') || lower === '19') return '19';
    }
    return '4'; // Default to Our Casino
  }, [tabId, initialTab, location.pathname, category]);

  // Get available sub-tabs for the active main casino tab
  const currentSubTabs = useMemo(() => {
    return SUB_TABS_BY_MAIN_TAB[activeTab] || CASINO_SUB_TABS;
  }, [activeTab]);

  // Determine active sub-tab numeric code (default 35 = 'All Casino')
  const activeSubTab = useMemo(() => {
    if (subTabId) {
      const parsed = Number(subTabId);
      if (currentSubTabs.some((t) => t.code === parsed)) return parsed;
    }
    const catParam = category || initialCategory;
    if (catParam) {
      if (!isNaN(Number(catParam))) {
        const parsed = Number(catParam);
        if (currentSubTabs.some((t) => t.code === parsed)) return parsed;
      }
      const matched = getCategoryByName(catParam);
      if (matched && currentSubTabs.some((t) => t.code === matched.code)) {
        return matched.code;
      }
    }
    return 35; // All Casino default
  }, [subTabId, category, initialCategory, currentSubTabs]);

  // Scroll active sub-tab into view horizontally
  useEffect(() => {
    if (!subTabRef.current) return;
    const activeEl = subTabRef.current.querySelector('.nav-link.active');
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeSubTab, activeTab]);

  const handleScrollLeft = (e) => {
    e.preventDefault();
    if (subTabRef.current) {
      subTabRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const handleScrollRight = (e) => {
    e.preventDefault();
    if (subTabRef.current) {
      subTabRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  // Map and filter games
  const allMappedCasinos = useMemo(() => mapCasinoGames(data), [data]);

  const visibleCasinos = useMemo(() => {
    let list = [];
    if (activeTab === '19') {
      list = allMappedCasinos.filter((c) => c.isVirtual);
    } else if (activeTab === '10') {
      list = allMappedCasinos.filter((c) => c.isVip);
    } else if (activeTab === '11') {
      list = allMappedCasinos.filter((c) => c.isPremium);
    } else {
      list = allMappedCasinos.filter((c) => !c.isVirtual);
    }

    if (activeSubTab !== 35) {
      list = list.filter((c) => c.categoryCode === activeSubTab);
    }

    return list;
  }, [allMappedCasinos, activeTab, activeSubTab]);

  return (
    <div className='own-casino-page list-page'>
      <div className='center-container'>
        {/* Sub-tab Horizontal Scroll Carousel */}
        <div className='casino-sub-tab-list'>
          <a
            className='tabs-arow tabs-arow-left'
            onClick={handleScrollLeft}
            role='button'
            tabIndex={0}
            title='Scroll left'
          >
            <i className='fas fa-angle-left'></i>
          </a>
          <ul
            className='nav nav-pills casino-sub-tab'
            id='casino-sub-tab'
            ref={subTabRef}
          >
            {currentSubTabs.map((subTab) => {
              const isActive = activeSubTab === subTab.code;
              return (
                <li className='nav-item' key={subTab.code}>
                  <Link
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    to={`/casino-list/LC/${activeTab}/${subTab.code}`}
                  >
                    <span>{subTab.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <a
            className='tabs-arow tabs-arow-right'
            onClick={handleScrollRight}
            role='button'
            tabIndex={0}
            title='Scroll right'
          >
            <i className='fas fa-angle-right'></i>
          </a>
        </div>

        {/* Tab Content & Casino Grid */}
        <div className='tab-content mt-xl-2 mt-1'>
          <div className='tab-pane active' id='all-casino'>
            {loader.games && visibleCasinos.length === 0 && (
              <div className='p-4 text-center text-xs text-gray-500'>
                Loading casino...
              </div>
            )}
            {!loader.games && error.games && visibleCasinos.length === 0 && (
              <div className='p-4 text-center text-xs text-red-500'>
                Casino games unavailable right now.
              </div>
            )}
            {!loader.games && visibleCasinos.length === 0 && !error.games && (
              <div className='p-4 text-center text-xs text-gray-400'>
                No games found in this category.
              </div>
            )}

            <div className='casino-list'>
              {visibleCasinos.map((casino) => {
                const bgImage =
                  casino.image ||
                  `https://cdn.926assets.com/g1-casino-icons/lc/${casino.eventName}.jpg`;

                return (
                  <div className='casino-list-item' key={casino.eventName}>
                    <Link to={`/casino/${casino.eventName}`}>
                      <div
                        className='casino-list-item-banner'
                        style={{
                          backgroundImage: `url("${bgImage}"), url("https://cdn.926assets.com/g1-casino-icons/default.jpg")`,
                        }}
                      />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Slot iframe placeholder (matching D247 DOM) */}
        <div className='slot-iframe'>
          <div className='slot-header'>
            <div className='title'>
              <h4></h4>
            </div>
          </div>
          <iframe
            scrolling='no'
            allow='fullscreen;'
            src=''
            style={{ width: '100%', border: '0px' }}
          />
        </div>
      </div>
    </div>
  );
}
