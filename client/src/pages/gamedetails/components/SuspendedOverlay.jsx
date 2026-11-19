/**
 * D247 reference suspended overlay (.suspended-row::after):
 * Semi-transparent dark charcoal veil (#373636d6) with centered bold red
 * uppercase status text ("SUSPENDED", "BALL RUNNING", "CLOSED", etc.)
 * that visually disables and blocks all interaction with the odds cells below.
 */
export default function SuspendedOverlay({
  label = 'SUSPENDED',
  compact = false,
}) {
  const displayLabel = String(label || 'SUSPENDED')
    .trim()
    .toUpperCase();

  return (
    <div
      aria-disabled='true'
      className='absolute inset-0 z-10 flex cursor-not-allowed items-center justify-center bg-[#373636d6] select-none'
    >
      <span
        className={`text-center font-bold tracking-wide text-[#ff0000] uppercase ${
          compact ? 'text-[11px] lg:text-[13px]' : 'text-[13px] lg:text-[15px]'
        }`}
      >
        {displayLabel || 'SUSPENDED'}
      </span>
    </div>
  );
}
