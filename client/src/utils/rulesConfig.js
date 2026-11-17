import config from '../data/rulesConfig.json';

// Per-game rules config (extracted 2026-11-17): har casino/sport/iscc ka apna
// rules image + Rules-link position. Images assets/rules/*.jpg se map hoti hy.
const ruleImages = import.meta.glob('../assets/rules/*.jpg', {
  eager: true,
  import: 'default',
});
const byFile = {};
for (const [path, url] of Object.entries(ruleImages)) {
  byFile[path.split('/').pop()] = url;
}

const byKey = {};
(config.games || []).forEach((g) => {
  byKey[g.key] = g;
});

export const getRulesConfig = (key) => byKey[key] || null;

// Reference rules bodies embed CDN posters (sitethemedata .../casino-rules/*).
// Jo posters local assets/rules me verified hy unko bundled URL se swap karo.
const REMOTE_RULES_BASE =
  'https://sitethemedata.com/v3/static/front/img/casino-rules/';
const REMOTE_RULES_RE = new RegExp(
  `${REMOTE_RULES_BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([a-zA-Z0-9_]+)\\.jpg`,
  'g'
);
export const resolveRulesHtml = (html) => {
  if (!html) return html;
  return html.replace(REMOTE_RULES_RE, (m, name) => byFile[`${name}.jpg`] || m);
};

// Rules image URL for a game key, null if is game ka image available nahi
// (tab rulesData ka per-game HTML use hota hy).
export const getRulesImageUrl = (key) => {
  const g = byKey[key];
  if (!g?.rulesImage) return null;
  return byFile[g.rulesImage] || null;
};

// 'after-name' | 'right' | 'none'
export const getRulesPosition = (key) => byKey[key]?.rulesPosition || 'none';
