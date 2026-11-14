
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Casino from './Casino';

const casinos = [
  {
    id: 1,
    slug: 'pteen',
    name: 'Premium Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/pteen.jpg',
  },
  {
    id: 2,
    slug: 'pteen20',
    name: 'Premium 20-20 Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/pteen20.jpg',
  },
  {
    id: 3,
    slug: 'pbaccarat',
    name: 'Premium Baccarat',
    category: 'Baccarat',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/pbaccarat.jpg',
  },
  {
    id: 4,
    slug: 'pdt20',
    name: 'Premium 20-20 Dragon Tiger',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/pdt20.jpg',
  },
  {
    id: 5,
    slug: 'pdt6',
    name: 'Premium 1 Day Dragon Tiger',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/pdt6.jpg',
  },
  {
    id: 6,
    slug: 'pcard32',
    name: 'Premium 32 Cards',
    category: '32 Cards',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/pcard32.jpg',
  },
  {
    id: 7,
    slug: 'plucky7',
    name: 'Premium Lucky 7',
    category: 'Lucky 7',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/plucky7.jpg',
  },
];

const casinoCategories = [
  { id: 1, name: 'All Casino' },
  { id: 3, name: 'Teenpatti' },
  { id: 5, name: 'Baccarat' },
  { id: 6, name: 'Dragon Tiger' },
  { id: 7, name: '32 Cards' },
  { id: 9, name: 'Lucky 7' },
];

function CasinoList() {
  const { category } = useParams();

  const [activeCategory, setActiveCategory] = useState(
    category || 'All Casino'
  );

  // Sync category with URL params
  useEffect(() => {
    if (category) {
      setActiveCategory(category);
    } else {
      setActiveCategory('All Casino');
    }
  }, [category]);

  // Filter casinos
  const filteredCasinos =
    activeCategory === 'All Casino'
      ? casinos
      : casinos.filter(
          (casino) => casino.category === activeCategory
        );

  return (
    <>
      <div className="flex w-full flex-col md:flex-row md:p-0.5">

        {/* Casino Categories Sidebar */}
        <div
          className="
            scrollbar-hide
            flex flex-col
            w-full
            shrink-0
            bg-[#2D4051]
            overflow-x-auto
            md:w-1/6
            md:min-w-[200px]
            md:overflow-x-hidden
            md:overflow-y-visible
          "
        >
          {casinoCategories.map((item) => {
            const isActive = activeCategory === item.name;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCategory(item.name)}
                style={{
                  display: 'flex',
                  width: '100%',
                  minWidth: '100%',
                  height: '43px',
                  minHeight: '43px',
                  flexShrink: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive
                    ? '#2677A6'
                    : '#2D4051',
                  color: '#ffffff',
                }}
                className="
                  px-2
                  text-[18px]
                  md:text-[20px]
                  font-semibold
                  whitespace-nowrap
                  cursor-pointer
                  transition-colors
                  duration-200
                  hover:bg-[#354D61]
                "
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Casino Grid */}
        <div className="w-full min-w-0 md:w-5/6">
          <Casino casinos={filteredCasinos} />
        </div>

      </div>
    </>
  );
}

export default CasinoList;
