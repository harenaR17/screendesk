// Lightweight inline SVG icons so we don't depend on glyphs the mono font lacks.
const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function PlayIcon(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PencilIcon(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function DownloadIcon(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function StopIcon(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <rect x="5" y="5" width="14" height="14" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WebcamIcon(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <circle cx="12" cy="10" r="6" />
      <circle cx="12" cy="10" r="2" fill="currentColor" stroke="none" />
      <path d="M5 21h14" />
      <path d="M12 16v5" />
    </svg>
  );
}
