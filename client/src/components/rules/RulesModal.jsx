import React, { useEffect } from 'react';
import { useCasino } from '../../context/CasinoContext';
import { getCasinoRulesModalHtml, getCasinoRulesModalTitle } from '../../data/rulesData';

export default function RulesModal() {
  const { rulesModalOpen, setRulesModalOpen, selectedGame, gameInfo } = useCasino();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && rulesModalOpen) {
        setRulesModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rulesModalOpen, setRulesModalOpen]);

  if (!rulesModalOpen) return null;

  const rulesHtml = getCasinoRulesModalHtml(selectedGame, gameInfo.name);
  const modalTitle = getCasinoRulesModalTitle(selectedGame, gameInfo.name);

  return (
    <div
      className="modal fade show"
      id="casino-rules-modal"
      tabIndex="-1"
      role="dialog"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={(e) => {
        if (e.target.id === 'casino-rules-modal') {
          setRulesModalOpen(false);
        }
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '680px' }}>
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title h4" id="rules-modal-title">
              {modalTitle}
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setRulesModalOpen(false)}
            ></button>
          </div>

          <div
            className="modal-body"
            id="rules-modal-body"
            style={{
              maxHeight: '78vh',
              overflowY: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: rulesHtml }}
          />
        </div>
      </div>
    </div>
  );
}

