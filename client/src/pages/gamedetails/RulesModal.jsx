import React from 'react';

// Reusable rules modal — reference modal theme (style.css @1728-1764):
// .modal-header = var(--bg-primary) blue + white text + inverted close;
// .modal-content/.modal-body = white bg, black text, scrollable.
// Supports EITHER an image (cricketv/superover rules jpg) OR html (casino
// per-game rules from data/rulesData).
function RulesModal({ open, onClose, title, image, html }) {
  if (!open) return null;

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
          {image ? (
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
