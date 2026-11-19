import { memo } from 'react';
import RulesModal from '../../gamedetails/RulesModal.jsx';

// Casino per-game rules — reusable RulesModal with on-demand lazy loading.
const RulesPopup = memo(function RulesPopup({ eventName, onClose }) {
  return <RulesModal open onClose={onClose} gameKey={eventName} />;
});

export default RulesPopup;
