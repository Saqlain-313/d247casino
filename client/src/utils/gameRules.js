import {
  getCasinoRulesModalHtml,
  getCasinoRulesModalTitle,
  hasCasinoRules,
} from '../data/rulesData';
import { getRulesImageUrl, resolveRulesHtml } from './rulesConfig';

// Per-game rules content, reference modal jaisa:
// - scraped rules HTML (text / image / mixed) primary source hy;
// - image fallback sirf un keys ke liye jin ka koi scraped HTML nahi (iscc1).
export function getGameRulesContent(key, fallbackTitle) {
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
