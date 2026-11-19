import { useEffect, useState } from 'react';
import { loadSidebarRulesTable } from '../../utils/gameRules';

// Reference sidebar "Rules" box — lazy-loads rulesData only for games that
// have a sidebar payout table (teen20 family, teenmuf family, dolidana).
export default function SidebarRulesTable({ slug }) {
  const [state, setState] = useState({ slug: null, html: null });

  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;
    loadSidebarRulesTable(slug).then((html) => {
      if (!cancelled) setState({ slug, html });
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const tableHtml = slug && state.slug === slug ? state.html : null;
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
