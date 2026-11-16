import { useNavigate } from 'react-router-dom';

function Casino({ casinos }) {
  const navigate = useNavigate();

  const handleGameClick = (casino) => {
    navigate(
      `/casino-bet/${encodeURIComponent(casino.name)}/${encodeURIComponent(casino.slug)}`
    );
  };

  return (
    <div className='grid grid-cols-3 md:grid-cols-7'>
      {casinos.map((casino) => (
        <button
          key={casino.id}
          type='button'
          onClick={() => handleGameClick(casino)}
          className='flex w-full cursor-pointer flex-col items-center overflow-hidden p-0.5'
        >
          <img
            src={casino.image}
            alt={casino.name}
            className='h-auto w-full object-cover transition-transform duration-200 hover:scale-[1.02]'
          />

          {/* Casino Name */}
          {/* <span className="text-[9px] font-semibold bg-[#0088CC] text-white w-full h-5 flex justify-center items-center truncate text-center">
            {casino.name}
          </span> */}
        </button>
      ))}
    </div>
  );
}

export default Casino;
