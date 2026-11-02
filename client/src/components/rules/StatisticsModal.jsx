import React, { useEffect } from 'react';
import { useCasino } from '../../context/CasinoContext';
import StatisticsWidget from '../tables/StatisticsWidget';

export default function StatisticsModal() {
  const { statisticsModalOpen, setStatisticsModalOpen } = useCasino();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && statisticsModalOpen) {
        setStatisticsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [statisticsModalOpen, setStatisticsModalOpen]);

  if (!statisticsModalOpen) return null;

  return (
    <div
      className="modal fade show"
      id="casino-statistics-modal"
      tabIndex="-1"
      role="dialog"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={(e) => {
        if (e.target.id === 'casino-statistics-modal') {
          setStatisticsModalOpen(false);
        }
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: '600px' }}>
        <div
          className="modal-content shadow-lg"
          style={{
            borderRadius: '4px',
            overflow: 'hidden',
            border: 'none',
            background: '#ffffff',
          }}
        >
          <div
            className="modal-header d-flex justify-content-between align-items-center"
            style={{
              backgroundColor: '#0088cc',
              color: '#ffffff',
              padding: '12px 18px',
              borderBottom: 'none',
            }}
          >
            <h5 className="modal-title m-0 fw-bold" style={{ fontSize: '18px', color: '#ffffff' }}>
              Statistics
            </h5>
            <button
              type="button"
              id="stats-modal-close-btn"
              aria-label="Close"
              onClick={() => setStatisticsModalOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '24px',
                lineHeight: 1,
                cursor: 'pointer',
                padding: '0 4px',
                fontWeight: 300,
              }}
            >
              &times;
            </button>
          </div>

          <div className="modal-body p-3" style={{ background: '#f8f9fa' }}>
            <StatisticsWidget isSidebar={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

