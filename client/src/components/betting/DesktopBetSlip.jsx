
import { useDispatch, useSelector } from 'react-redux';
import { useCasino } from '../../context/CasinoContext';
import {
  clearCasinoBetError,
  placeCasinoBet,
} from '../../redux/reducer/casinoBetSlice';

export default function DesktopBetSlip() {
  const dispatch = useDispatch();

  const {
    betSlip,
    closeBetSlip,
    updateStake,
  } = useCasino();

  const {
    placeBetLoading,
    placeBetError,
    balance,
  } = useSelector((state) => state.casinoBet);

  if (!betSlip.isOpen) return null;

  const quickStakes = [
    { label: '100', val: 100 },
    { label: '500', val: 500 },
    { label: '1k', val: 1000 },
    { label: '2k', val: 2000 },
    { label: '5k', val: 5000 },
    { label: '10k', val: 10000 },
    { label: '25k', val: 25000 },
    { label: '50k', val: 50000 },
  ];

  // -----------------------------------------
  // SUBMIT CASINO BET
  // -----------------------------------------
  const handleSubmitBet = async () => {
    const slug = betSlip.slug;
    const roundId = betSlip.roundId;
    const stake = Number(betSlip.stake);
    const odds = Number(betSlip.odds);

    if (!slug || !roundId) {
      alert('Game or round information is missing');
      console.error('Missing casino data:', {
        slug,
        roundId,
        betSlip,
      });
      return;
    }

    if (!stake || stake < 100) {
      alert('Minimum stake is ₹100');
      return;
    }

    if (!odds || odds <= 1) {
      alert('Invalid odds');
      return;
    }

    dispatch(clearCasinoBetError());

    try {
      const response = await dispatch(
        placeCasinoBet({
          slug,
          roundId,
          side: betSlip.type,
          selection: betSlip.selection,
          odds,
          stake,
        })
      ).unwrap();

      if (response.success) {
        alert('Bet placed successfully!');
        closeBetSlip();
      }
    } catch (error) {
      console.error('Casino bet failed:', error);
      alert(
        typeof error === 'string'
          ? error
          : 'Unable to place bet'
      );
    }
  };

  // -----------------------------------------
  // RESET
  // -----------------------------------------
  const handleReset = () => {
    dispatch(clearCasinoBetError());
    closeBetSlip();
  };

  return (
    <div
      className="sidebar-box place-bet-container"
      id="sidebar-place-bet-box"
    >
      {/* HEADER */}
      <div className="sidebar-title d-flex justify-content-between align-items-center">
        <h4>Place Bet</h4>

        <button
          type="button"
          className="btn-close-slip text-white"
          onClick={closeBetSlip}
          disabled={placeBetLoading}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 5px',
          }}
        >
          &times;
        </button>
      </div>

      {/* BET HEADER */}
      <div className="place-bet-box-header">
        <div className="place-bet-for">(Bet for)</div>
        <div className="place-bet-odds">Odds</div>
        <div className="place-bet-stake">Stake</div>

        <div className="place-bet-profit">
          {betSlip.type === 'lay' ? 'Liability' : 'Profit'}
        </div>
      </div>

      {/* BET BODY */}
      <div className={`place-bet-box-body ${betSlip.type}`}>
        <div className="place-bet-for">
          <span className="fw-bold">
            {betSlip.nation}
          </span>
        </div>

        <div className="place-bet-odds">
          <input
            type="text"
            className="form-control text-center fw-bold"
            value={betSlip.odds}
            readOnly
          />
        </div>

        <div className="place-bet-stake">
          <input
            type="number"
            className="form-control text-center fw-bold"
            value={betSlip.stake || ''}
            onChange={(e) => updateStake(e.target.value)}
            placeholder="0"
            min="0"
            disabled={placeBetLoading}
          />
        </div>

        <div className="place-bet-profit">
          {betSlip.type === 'lay' ? (
            <span className="fw-bold text-danger">
              ₹
              {Number(
                betSlip.liability || 0
              ).toLocaleString('en-IN')}
            </span>
          ) : (
            <span className="fw-bold text-success">
              ₹
              {Number(
                betSlip.profit || 0
              ).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* QUICK STAKE BUTTONS */}
      <div className="place-bet-buttons">
        {quickStakes.map((stk) => (
          <button
            key={stk.label}
            type="button"
            className="btn btn-place-bet"
            onClick={() => updateStake(stk.val)}
            disabled={placeBetLoading}
          >
            {stk.label}
          </button>
        ))}

        <button
          type="button"
          className="btn btn-place-bet btn-clear-stake"
          onClick={() => updateStake(0)}
          disabled={placeBetLoading}
        >
          Clear
        </button>
      </div>

      {/* BALANCE */}
      {balance !== null && (
        <div className="px-2 py-1">
          <small>
            Balance: ₹
            {Number(balance).toLocaleString('en-IN')}
          </small>
        </div>
      )}

      {/* ERROR */}
      {placeBetError && (
        <div className="alert alert-danger py-2 mx-2 mb-2">
          {placeBetError}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="place-bet-action-buttons">
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleReset}
          disabled={placeBetLoading}
        >
          Reset
        </button>

        <button
          type="button"
          className="btn btn-success"
          onClick={handleSubmitBet}
          disabled={placeBetLoading}
        >
          {placeBetLoading ? 'Placing Bet...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
