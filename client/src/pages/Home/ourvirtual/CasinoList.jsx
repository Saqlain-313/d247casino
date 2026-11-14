
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Casino from './Casino';

const casinos = [
  {
    id: 1,
    slug: 'vlucky7',
    name: 'Virtual Lucky 7',
    category: 'Lucky 7',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vlucky7.jpg',
  },
  {
    id: 2,
    slug: 'vtrio',
    name: 'Virtual Trio',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vtrio.jpg',
  },
  {
    id: 3,
    slug: 'vdtl20',
    name: 'Virtual 20-20 D T L',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vdtl20.jpg',
  },
  {
    id: 4,
    slug: 'vteenmuf',
    name: 'Virtual Teenpatti Muf',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vteenmuf.jpg',
  },
  {
    id: 5,
    slug: 'vaaa',
    name: 'Virtual AAA',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vaaa.jpg',
  },
  {
    id: 6,
    slug: 'vbtable',
    name: 'Virtual Bollywood Table',
    category: 'Bollywood',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vbtable.jpg',
  },
  {
    id: 7,
    slug: 'vdt6',
    name: 'Virtual 1 Day Dragon Tiger',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vdt6.jpg',
  },
  {
    id: 8,
    slug: 'vteen',
    name: 'Virtual Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vteen.jpg',
  },
  {
    id: 9,
    slug: 'vteen20',
    name: 'Virtual 20-20 Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vteen20.jpg',
  },
];

const casinoCategories = [
  { id: 1, name: 'All Casino' },
  { id: 3, name: 'Teenpatti' },
  { id: 6, name: 'Dragon Tiger' },
  { id: 9, name: 'Lucky 7' },
  { id: 14, name: 'Bollywood' },
  { id: 15, name: 'Others' },
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
       
{/* Casino Categories Sidebar */}
<div
  className="
    scrollbar-hide
    flex flex-col
    w-full md:w-[200px]
    shrink-0
    bg-[#2D4051]
    overflow-x-auto md:overflow-x-hidden
    overflow-y-visible
  "
>
  {casinoCategories.map((item) => (
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
        backgroundColor:
          activeCategory === item.name
            ? '#2677A6'
            : '#2D4051',
        color: '#ffffff',
      }}
      className="
        px-2
        text-2xl
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
  ))}
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
