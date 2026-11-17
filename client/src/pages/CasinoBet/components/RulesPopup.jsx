import { memo } from 'react';
import { getGameRulesContent } from '../../../utils/gameRules';
import RulesModal from '../../gamedetails/RulesModal.jsx';

// Casino per-game rules — reusable RulesModal (reference blue/white theme).
// Har game ka apna rules: scraped per-game HTML (text ya image/mixed),
// image fallback sirf jab koi scraped HTML na ho.
const RulesPopup = memo(function RulesPopup({ eventName, onClose }) {
  const { title, html, image } = getGameRulesContent(eventName);

  return (
    <RulesModal
      open
      onClose={onClose}
      title={title}
      image={image}
      html={html}
    />
  );
});

export default RulesPopup;
