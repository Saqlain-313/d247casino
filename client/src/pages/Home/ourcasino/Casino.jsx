import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CasinoCard({ casino, navigate }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = casino.imageUrl || casino.image || '';

  return (
    <div
      key={casino.eventName || casino.slug}
      className='flex min-w-0 cursor-pointer flex-col items-center p-0.5'
      onClick={() => {
        navigate(`/casino-bet/${casino.eventName || casino.slug}`);
      }}
    >
      {!imageError && imageUrl ? (
        <img
          src={imageUrl}
          alt={casino.name}
          loading='lazy'
          onError={() => setImageError(true)}
          className='block aspect-[4/3] w-full rounded-sm object-cover'
        />
      ) : (
        <div className='flex aspect-[4/3] w-full items-center justify-center bg-gray-200 text-center text-xs text-gray-500'>
          {casino.name}
        </div>
      )}

      <span className='flex h-5 w-full items-center justify-center truncate bg-[#0088CC] px-1 text-center text-[10px] font-semibold text-white'>
        {casino.name}
      </span>
    </div>
  );
}

function Casino({ casinos = [] }) {
  const navigate = useNavigate();

  return (
    <div className='grid grid-cols-3 md:grid-cols-7'>
      {casinos.map((casino) => (
        <CasinoCard
          key={casino.eventName || casino.slug}
          casino={casino}
          navigate={navigate}
        />
      ))}
    </div>
  );
}

export default Casino;
