
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Casino from './Casino';

const casinos = [
  {
    id: 1,
    slug: 'teen20v1',
    name: '20-20 Teenpatti VIP1',
    category: 'Teenpatti',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen20v1_red.gif',
  },
];

const casinoCategories = [
  { id: 1, name: 'All Casino' },
  { id: 2, name: 'Teenpatti' },
];

function CasinoList() {
  const { category } = useParams();

  const [activeCategory, setActiveCategory] = useState(
    category || 'All Casino'
  );

  useEffect(() => {
    if (category) {
      setActiveCategory(category);
    } else {
      setActiveCategory('All Casino');
    }
  }, [category]);

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
            md:w-[200px]
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
