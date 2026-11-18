import { Link } from 'react-router-dom';

export default function Casino({ casinos = [] }) {
  return (
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
  );
}
