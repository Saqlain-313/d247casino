import { useEffect, useState } from 'react';
import { loadGameRulesContent } from '../../utils/gameRules';

// Reusable rules modal — reference modal theme (style.css @1728-1764):
// Supports either pre-resolved props (title/image/html) OR lazy-loading via
// gameKey + fallbackTitle only when `open` becomes true.
function RulesModal({
  open,
  onClose,
  title: propTitle,
  image: propImage,
  html: propHtml,
  gameKey,
  fallbackTitle,
}) {
  const [loaded, setLoaded] = useState(null);

  const shouldLazyLoad = open && Boolean(gameKey) && !propHtml && !propImage;
  const cacheKey = `${gameKey || ''}::${fallbackTitle || ''}`;
  const isCurrentLoaded = loaded?.cacheKey === cacheKey;

  useEffect(() => {
    if (!shouldLazyLoad || isCurrentLoaded) return undefined;
    let cancelled = false;
    loadGameRulesContent(gameKey, fallbackTitle).then((res) => {
      if (!cancelled) setLoaded({ cacheKey, ...res });
    });
    return () => {
      cancelled = true;
    };
  }, [shouldLazyLoad, isCurrentLoaded, cacheKey, gameKey, fallbackTitle]);

  if (!open) return null;

  const loading = shouldLazyLoad && !isCurrentLoaded;
  const activeLoaded = isCurrentLoaded ? loaded : null;
  const title = propTitle || activeLoaded?.title || fallbackTitle || 'Rules';
  const image = propImage ?? activeLoaded?.image ?? null;
  const html = propHtml ?? activeLoaded?.html ?? null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
    >
      <div
        className='flex max-h-[85vh] w-full max-w-[760px] flex-col overflow-hidden bg-white shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='bg-primary text-primary flex items-center justify-between p-[10px]'>
          <div className='text-[16px] font-bold'>{title}</div>
          <button
            type='button'
            aria-label='Close'
            className='text-[20px] leading-none text-white hover:opacity-80'
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className='rules-section max-h-[calc(85vh-50px)] overflow-y-auto bg-white p-[10px] text-black'>
          {loading ? (
            <p className='text-center text-sm'>Loading rules...</p>
          ) : image ? (
            <img src={image} alt={title} className='img-fluid w-full' />
          ) : html ? (
            <div
              className='text-[13px]'
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className='text-center text-sm'>Rules not available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RulesModal;
