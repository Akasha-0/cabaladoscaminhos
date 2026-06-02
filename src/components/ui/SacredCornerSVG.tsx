// Sacred geometry corner decoration
const SacredCornerSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2 L20 2 L20 5 L5 5 L5 20 L2 20 Z" fill="currentColor" opacity="0.3" />
    <path d="M2 2 Q20 2 20 20" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
    <circle cx="2" cy="2" r="1.5" fill="currentColor" opacity="0.4" />
  </svg>
);

export default SacredCornerSVG;
