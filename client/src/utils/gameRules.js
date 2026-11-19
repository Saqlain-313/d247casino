import { getRulesImageUrl, resolveRulesHtml } from './rulesConfig';

let rulesDataPromise = null;

function loadRulesDataModule() {
  if (!rulesDataPromise) {
    rulesDataPromise = import('../data/rulesData');
  }
  return rulesDataPromise;
}

/**
 * Dynamically loads per-game rules content so the 788 KB rulesData catalog
 * is code-split into an on-demand chunk instead of bloating the initial bundle.
 */
export async function loadGameRulesContent(key, fallbackTitle) {
  const { getCasinoRulesModalHtml, getCasinoRulesModalTitle, hasCasinoRules } =
    await loadRulesDataModule();

  const title = getCasinoRulesModalTitle(key, fallbackTitle);
  if (hasCasinoRules(key)) {
    return {
      title,
      html: resolveRulesHtml(getCasinoRulesModalHtml(key, title)),
      image: null,
    };
  }
  return { title, html: null, image: getRulesImageUrl(key) };
}

export async function loadSidebarRulesTable(slug) {
  if (!slug) return null;
  const { getCasinoRulesSidebarTable } = await loadRulesDataModule();
  return getCasinoRulesSidebarTable(slug) || null;
}
