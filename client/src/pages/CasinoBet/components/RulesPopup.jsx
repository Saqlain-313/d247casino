import { memo } from 'react';
import {
  getCasinoRulesModalHtml,
  getCasinoRulesModalTitle,
} from '../../../data/rulesData';

const RulesPopup = memo(function RulesPopup({ eventName, onClose }) {
  const title = getCasinoRulesModalTitle(eventName);
  const rulesHtml = getCasinoRulesModalHtml(eventName, title);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="mx-4 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl border  bg-white text-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between rounded-t-xl bg-[#0188CC] px-4 py-3">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="h-7 w-7 rounded-full bg-black/20 text-black">
            ✕
          </button>
        </div>

        <div
          className="p-4 text-sm text-black"
          dangerouslySetInnerHTML={{ __html: rulesHtml }}
        />
      </div>
    </div>
  );
});

export default RulesPopup;