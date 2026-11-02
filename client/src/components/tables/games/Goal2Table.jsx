
import { useCasino } from '../../../context/CasinoContext';

export default function Goal2Table() {
  const { roundData, isSuspended, openBetSlip } = useCasino();

  const isMobile =
    typeof window !== 'undefined' && window.innerWidth < 1200;

  // Who Will Goal Next
  const playersMarket = [
    { sid: 1, nat: 'Cristiano Ronaldo', b: '4.50', bs: '150k', l: '4.80', ls: '150k', min: 100, max: 50000 },
    { sid: 2, nat: 'Lionel Messi', b: '4.80', bs: '150k', l: '5.10', ls: '150k', min: 100, max: 50000 },
    { sid: 3, nat: 'Robert Lewandowski', b: '5.20', bs: '100k', l: '5.50', ls: '100k', min: 100, max: 50000 },
    { sid: 4, nat: 'Karim Benzema', b: '6.00', bs: '80k', l: '6.40', ls: '80k', min: 100, max: 50000 },
    { sid: 5, nat: 'Edinson Cavani', b: '7.50', bs: '60k', l: '8.00', ls: '60k', min: 100, max: 50000 },
    { sid: 6, nat: 'Luis Suarez', b: '8.00', bs: '50k', l: '8.50', ls: '50k', min: 100, max: 50000 },
    { sid: 7, nat: 'Neymar', b: '7.00', bs: '70k', l: '7.50', ls: '70k', min: 100, max: 50000 },
    { sid: 8, nat: 'Sergio Aguero', b: '9.00', bs: '40k', l: '9.60', ls: '40k', min: 100, max: 50000 },
    { sid: 9, nat: 'Olivier Giroud', b: '10.00', bs: '35k', l: '10.80', ls: '35k', min: 100, max: 50000 },
    { sid: 10, nat: 'Mohamed Salah', b: '6.50', bs: '90k', l: '7.00', ls: '90k', min: 100, max: 50000 },
    { sid: 11, nat: 'Kylian Mbappe', b: '5.00', bs: '120k', l: '5.30', ls: '120k', min: 100, max: 50000 },
    { sid: 12, nat: 'No Goal', b: '3.20', bs: '200k', l: '3.40', ls: '200k', min: 100, max: 25000 },
  ];

  // Method Of Next Goal
  const methodsMarket = [
    { sid: 21, nat: 'Shot Goal', b: '1.85', bs: '250k', l: '1.92', ls: '250k', min: 100, max: 50000 },
    { sid: 22, nat: 'Header Goal', b: '4.50', bs: '80k', l: '4.80', ls: '80k', min: 100, max: 50000 },
    { sid: 23, nat: 'Penalty Goal', b: '6.00', bs: '50k', l: '6.50', ls: '50k', min: 100, max: 50000 },
    { sid: 24, nat: 'Free Kick Goal', b: '12.00', bs: '30k', l: '13.00', ls: '30k', min: 100, max: 50000 },
    { sid: 25, nat: 'No Goal', b: '3.20', bs: '200k', l: '3.40', ls: '200k', min: 100, max: 25000 },
  ];

  // Method Of Combination Goal
  const combosMarket = [
    { sid: 121, nat: 'Cristiano Ronaldo and Shot Goal', b: '7.50', min: 100, max: 25000 },
    { sid: 122, nat: 'Cristiano Ronaldo and Header Goal', b: '15.00', min: 100, max: 10000 },
    { sid: 123, nat: 'Cristiano Ronaldo and Penalty Goal', b: '18.00', min: 100, max: 10000 },
    { sid: 124, nat: 'Cristiano Ronaldo and Free Kick Goal', b: '25.00', min: 100, max: 10000 },
    { sid: 125, nat: 'Cristiano Ronaldo and No Goal', b: '35.00', min: 100, max: 10000 },

    { sid: 221, nat: 'Lionel Messi and Shot Goal', b: '8.00', min: 100, max: 25000 },
    { sid: 222, nat: 'Lionel Messi and Header Goal', b: '20.00', min: 100, max: 10000 },
    { sid: 223, nat: 'Lionel Messi and Penalty Goal', b: '16.00', min: 100, max: 10000 },
    { sid: 224, nat: 'Lionel Messi and Free Kick Goal', b: '22.00', min: 100, max: 10000 },
    { sid: 225, nat: 'Lionel Messi and No Goal', b: '35.00', min: 100, max: 10000 },

    { sid: 321, nat: 'Robert Lewandowski and Shot Goal', b: '8.50', min: 100, max: 25000 },
    { sid: 322, nat: 'Robert Lewandowski and Header Goal', b: '14.00', min: 100, max: 10000 },
    { sid: 323, nat: 'Robert Lewandowski and Penalty Goal', b: '18.00', min: 100, max: 10000 },
    { sid: 324, nat: 'Robert Lewandowski and Free Kick Goal', b: '30.00', min: 100, max: 10000 },
    { sid: 325, nat: 'Robert Lewandowski and No Goal', b: '40.00', min: 100, max: 10000 },

    { sid: 1121, nat: 'Kylian Mbappe and Shot Goal', b: '8.00', min: 100, max: 25000 },
    { sid: 1122, nat: 'Kylian Mbappe and Header Goal', b: '18.00', min: 100, max: 10000 },
    { sid: 1123, nat: 'Kylian Mbappe and Penalty Goal', b: '18.00', min: 100, max: 10000 },
    { sid: 1124, nat: 'Kylian Mbappe and Free Kick Goal', b: '28.00', min: 100, max: 10000 },
    { sid: 1125, nat: 'Kylian Mbappe and No Goal', b: '40.00', min: 100, max: 10000 },

    { sid: 1021, nat: 'Mohamed Salah and Shot Goal', b: '10.00', min: 100, max: 25000 },
    { sid: 1022, nat: 'Mohamed Salah and Header Goal', b: '22.00', min: 100, max: 10000 },
    { sid: 1023, nat: 'Mohamed Salah and Penalty Goal', b: '20.00', min: 100, max: 10000 },
    { sid: 1024, nat: 'Mohamed Salah and Free Kick Goal', b: '30.00', min: 100, max: 10000 },
    { sid: 1025, nat: 'Mohamed Salah and No Goal', b: '45.00', min: 100, max: 10000 },

    { sid: 721, nat: 'Neymar and Shot Goal', b: '11.00', min: 100, max: 25000 },
    { sid: 722, nat: 'Neymar and Header Goal', b: '25.00', min: 100, max: 10000 },
    { sid: 723, nat: 'Neymar and Penalty Goal', b: '18.00', min: 100, max: 10000 },
    { sid: 724, nat: 'Neymar and Free Kick Goal', b: '24.00', min: 100, max: 10000 },
    { sid: 725, nat: 'Neymar and No Goal', b: '45.00', min: 100, max: 10000 },
  ];

  const formatMax = (max) =>
    max >= 1000 ? `${max / 1000}k` : max;

  // Reusable Back / Lay cell
  const OddsCell = ({ item, type }) => {
    const isBack = type === 'back';
    const odds = isBack ? item.b : item.l;
    const size = isBack ? item.bs : item.ls;

    return (
      <button
        type="button"
        disabled={isSuspended}
        onClick={() =>
          !isSuspended &&
          openBetSlip(item.nat, odds, type, isMobile)
        }
        className={`flex min-w-0 w-full flex-col items-center justify-center gap-0.5 border-r border-white/40 px-1 py-2 text-center text-[#303b45] transition-colors ${
          isBack
            ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
            : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
        } ${
          isSuspended
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer'
        }`}
      >
        <span className="text-sm font-bold leading-5">
          {isSuspended ? '-' : odds}
        </span>
        {size && (
          <span className="text-xs leading-4">
            {isSuspended ? '' : size}
          </span>
        )}
      </button>
    );
  };

  // Reusable market table
  const MarketTable = ({ title, items }) => (
    <section className="min-w-0 w-full overflow-hidden bg-[#f1f1f1]">

      {/* Market Title */}
      <div className="bg-[#4b5b6b] px-2 py-2">
        <h3 className="text-sm font-bold text-white">
          {title}
        </h3>
      </div>

      {/* Column Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_64px_64px_76px] border-b border-[#c9c9c9]">

        <div className="min-w-0" />

        <div className="flex items-center justify-center bg-[#72b9e8] py-2 text-sm font-bold text-[#303b45]">
          Back
        </div>

        <div className="flex items-center justify-center bg-[#f5a5b8] py-2 text-sm font-bold text-[#303b45]">
          Lay
        </div>

        <div />

      </div>

      {/* Market Rows */}
      <div>
        {items.map((item) => (
          <div
            key={item.sid}
            className="grid grid-cols-[minmax(0,1fr)_64px_64px_76px] min-h-[52px] border-b border-[#c9c9c9]"
          >

            {/* Name */}
            <div className="flex min-w-0 items-center px-2 py-2">
              <span className="break-words text-sm leading-5 text-[#333333]">
                {item.nat}
              </span>
            </div>

            {/* Back */}
            <div className="flex items-center">
              <OddsCell item={item} type="back" />
            </div>

            {/* Lay */}
            <div className="flex items-center">
              <OddsCell item={item} type="lay" />
            </div>

            {/* Min / Max */}
            <div className="flex flex-col items-center justify-center gap-1 px-0.5 text-center text-xs font-bold leading-4 text-[#00809b]">
              <span>Min: {item.min}</span>
              <span>Max: {formatMax(item.max)}</span>
            </div>

          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="w-full min-w-0">

      {/* TOP TWO MARKETS */}
      <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2">

        {/* LEFT */}
        <MarketTable
          title="Who Will Goal Next?"
          items={playersMarket}
        />

        {/* RIGHT */}
        <MarketTable
          title="Method Of Next Goal"
          items={methodsMarket}
        />

      </div>

      {/* METHOD OF COMBINATION GOAL */}
      <section className="mt-3 w-full overflow-hidden bg-[#f1f1f1]">

        <div className="bg-[#4b5b6b] px-2 py-2">
          <h3 className="text-sm font-bold text-white">
            Method Of Combination Goal
          </h3>
        </div>

        {/* Two Column Headers */}
        <div className="grid grid-cols-1 md:grid-cols-2">

          {[0, 1].map((side) => (
            <div
              key={side}
              className="grid grid-cols-[minmax(0,1fr)_68px_76px] border-b border-[#c9c9c9]"
            >
              <div />
              <div className="bg-[#72b9e8] py-2 text-center text-sm font-bold text-[#303b45]">
                Back
              </div>
              <div />
            </div>
          ))}

        </div>

        {/* Combination Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2">

          {combosMarket.map((item) => (
            <div
              key={item.sid}
              className="grid min-h-[42px] grid-cols-[minmax(0,1fr)_68px_76px] border-b border-r border-[#c9c9c9]"
            >

              {/* Name */}
              <div className="flex min-w-0 items-center px-2 py-2">
                <span className="break-words text-xs leading-4 text-[#333333]">
                  {item.nat}
                </span>
              </div>

              {/* Back Odds */}
              <button
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  !isSuspended &&
                  openBetSlip(item.nat, item.b, 'back', isMobile)
                }
                className={`flex flex-col items-center justify-center bg-[#72b9e8] py-1 text-sm font-bold text-[#303b45] hover:bg-[#5da9dc] ${
                  isSuspended
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer'
                }`}
              >
                {isSuspended ? '-' : item.b}
              </button>

              {/* Min Max */}
              <div className="flex flex-col items-center justify-center gap-1 px-1 text-center text-[11px] font-bold leading-4 text-[#00809b]">
                <span>Min: {item.min}</span>
                <span>Max: {formatMax(item.max)}</span>
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* REMARKS */}
      {roundData?.remark && (
        <div className="mt-2 overflow-hidden bg-[#fff3cd] px-2 py-2 text-sm text-[#856404]">
          <marquee scrollAmount="3">
            {roundData.remark}
          </marquee>
        </div>
      )}

    </div>
  );
}
