import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCasinoData } from '../../../redux/reducer/casinoSlice';
import { mapCasinoGames } from '../../../utils/casinoCategories';

export default function AllCasino() {
  const dispatch = useDispatch();
  const { data, loader, error } = useSelector((state) => state.casino);

  useEffect(() => {
    if (!data?.length) {
      dispatch(fetchCasinoData());
    }
  }, [dispatch, data?.length]);

  const casinos = useMemo(() => {
    const list = mapCasinoGames(data);
    // Home page shows live casino games (not virtual)
    return list.filter((g) => !g.isVirtual);
  }, [data]);

  if (casinos.length === 0) {
    if (loader.games) {
      return <div className='p-2 text-xs text-gray-500'>Loading casino...</div>;
    }
    if (error.games) {
      return (
        <div className='p-2 text-xs text-red-500'>
          Casino games unavailable right now.
        </div>
      );
    }
    return null;
  }

  return (
    <div className='own-casino-page'>
      <div className='casino-list'>
        {casinos.map((casino) => {
          const bgImage =
            casino.image ||
            `https://cdn.926assets.com/g1-casino-icons/lc/${casino.eventName || casino.slug}.jpg`;

          return (
            <div
              className='casino-list-item'
              key={casino.eventName || casino.slug}
            >
              <Link to={`/casino/${casino.eventName || casino.slug}`}>
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
  );
}
