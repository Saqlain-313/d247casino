
import { useNavigate } from 'react-router-dom';

function Casino({ casinos }) {
  const navigate = useNavigate();

  const handleGameClick = (casino) => {
    navigate(`/casino-bet/${encodeURIComponent(casino.name)}/${casino.eventName || casino.slug}`);
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-7">
      {casinos.map((casino) => (
        <div
          key={casino.id}
          onClick={() => handleGameClick(casino)}
          className="
            flex flex-col items-center
            p-0.5
            cursor-pointer
            overflow-hidden
          "
        >
          <img
            src={casino.image}
            alt={casino.name}
            className="
              w-full
              h-auto
              object-cover
              transition-transform
              duration-200
              hover:scale-[1.02]
            "
          />
        </div>
      ))}
    </div>
  );
}

export default Casino;
