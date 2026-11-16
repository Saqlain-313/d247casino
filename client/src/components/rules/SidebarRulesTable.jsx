import React from 'react';
import { useCasino } from '../../context/CasinoContext';
import { getCasinoRulesSidebarTable } from '../../data/rulesData';

export default function SidebarRulesTable({ isMobile = false }) {
  const { selectedGame, gameInfo } = useCasino();
  const tableHtml = getCasinoRulesSidebarTable(selectedGame, gameInfo.name);

  return (
    <div
      className={`sidebar-box my-bet-container ${isMobile ? 'd-xl-none mt-2' : 'mt-2'}`}
    >
      <div className='sidebar-title'>
        <h4>Rules</h4>
      </div>
      <div
        className='rules-table-container'
        dangerouslySetInnerHTML={{ __html: tableHtml }}
      />
    </div>
  );
}
