import { useNavigate } from 'react-router-dom';

function Casino({ casinos }) {
  const navigate = useNavigate();

  const handleGameClick = (casino) => {
    navigate(`/casino-bet/${casino.eventName || casino.slug}`);
  };

  return (
    <div className='grid grid-cols-3 md:grid-cols-7'>
      {casinos.map((casino) => (
        <div
          key={casino.id}
          onClick={() => handleGameClick(casino)}
          className='flex cursor-pointer flex-col items-center overflow-hidden p-0.5'
        >
          <img
            src={casino.image}
            alt={casino.name}
            className='h-auto w-full object-cover transition-transform duration-200 hover:scale-[1.02]'
          />
        </div>
      ))}
    </div>
  );
}

export default Casino;
