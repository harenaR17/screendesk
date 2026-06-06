// A small inline status indicator.
// variant: 'ready' | 'processing' | 'error'
const CONFIG = {
  ready: { color: 'var(--success)', label: 'READY', pulse: false },
  processing: { color: 'var(--processing)', label: 'ENCODING', pulse: true },
  error: { color: 'var(--danger)', label: 'ERROR', pulse: true },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.ready;
  return (
    <span className="inline-flex items-center gap-2 text-[11px] tracking-widest">
      <span
        className={`inline-block h-2 w-2 rounded-full ${cfg.pulse ? 'pulse-dot' : ''}`}
        style={{ background: cfg.color }}
      />
      <span style={{ color: 'var(--text-secondary)' }}>{cfg.label}</span>
    </span>
  );
}
