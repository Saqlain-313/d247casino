import { useCallback, useEffect, useState } from 'react';
import banner from '../../../assets/reddy-banner1.png';

const FLAG_KEY = 'showLoginBanner';

function LoginBannerPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Flag check karke popup kholo (login ke baad ek hi baar)
  const openIfFlagged = useCallback(() => {
    if (sessionStorage.getItem(FLAG_KEY) === '1') {
      sessionStorage.removeItem(FLAG_KEY);
      setIsClosing(false);
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    // Case 1: login ke baad navigate hoke MainLayout fresh mount hua
    openIfFlagged();

    // Case 2: MainLayout already mounted tha (login modal / same page login)
    window.addEventListener('login-success', openIfFlagged);
    return () => window.removeEventListener('login-success', openIfFlagged);
  }, [openIfFlagged]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 250);
  }, []);

  // Escape key se close + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && handleClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes lbp-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lbp-backdrop-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes lbp-modal-in {
          0%   { opacity: 0; transform: translateY(-40px) scale(0.85); }
          60%  { opacity: 1; transform: translateY(6px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lbp-modal-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(-30px) scale(0.9); }
        }
        .lbp-backdrop-in  { animation: lbp-backdrop-in 0.25s ease-out forwards; }
        .lbp-backdrop-out { animation: lbp-backdrop-out 0.25s ease-in forwards; }
        .lbp-modal-in     { animation: lbp-modal-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .lbp-modal-out    { animation: lbp-modal-out 0.25s ease-in forwards; }
      `}</style>

      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 ${
          isClosing ? 'lbp-backdrop-out' : 'lbp-backdrop-in'
        }`}
        onClick={handleClose}
      >
        <div
          className={`w-full max-w-[820px] overflow-hidden shadow-2xl ${
            isClosing ? 'lbp-modal-out' : 'lbp-modal-in'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top blue notice bar */}
          <div className='flex items-center justify-between gap-3 bg-[#3d8bcd] px-3 py-2.5 sm:px-5 sm:py-3'>
            <div className='flex items-center gap-2 sm:gap-3'>
              <span className='text-lg sm:text-2xl'>⚠️</span>
              <p className='text-[11px] font-bold leading-tight tracking-tight text-white sm:text-lg md:text-xl'>
                Beware Of Phishing Websites Before Login. Enable Security Auth
                To Secure Your ID.
              </p>
            </div>
            <button
              type='button'
              onClick={handleClose}
              aria-label='Close'
              className='shrink-0 text-white transition-transform duration-200 hover:rotate-90 hover:scale-110'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                className='h-6 w-6 sm:h-8 sm:w-8'
              >
                <path d='M4 4l16 16M20 4L4 20' />
              </svg>
            </button>
          </div>

          {/* Banner image */}
          <img
            src={banner}
            alt='Play more, Win more'
            className='block h-auto w-full select-none'
            draggable={false}
          />
        </div>
      </div>
    </>
  );
}

export default LoginBannerPopup;