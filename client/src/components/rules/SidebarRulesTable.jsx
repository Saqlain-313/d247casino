import React from 'react';
import { getCasinoRulesSidebarTable } from '../../data/rulesData';

// Reference sidebar "Rules" box (sidebar-box my-bet-container + sidebar-title
// Rules + bordered payout tables) — sirf un games me jinka side-rules table
// hy (teen20 family, teenmuf family, dolidana); baaki slugs ke liye null.
export default function SidebarRulesTable({ slug }) {
  const tableHtml = getCasinoRulesSidebarTable(slug);
  if (!tableHtml) return null;

  return (
    <div className='mt-1'>
      <div className='bg-secondary text-secondary p-1'>
        <span className='font-bold'>Rules</span>
      </div>
      <div
        className='rules-table-container'
        dangerouslySetInnerHTML={{ __html: tableHtml }}
      />
    </div>
  );
}
