export default function EmptyState({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span
        className="text-6xl leading-none"
        style={{ color: 'var(--text-muted)' }}
        aria-hidden="true"
      >
        {'\u25FC'}
      </span>
      <div>
        <p className="text-base" style={{ color: 'var(--text-primary)' }}>
          No recordings yet.
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Hit record to make your first one.
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-2 flex items-center gap-2 px-4 py-2 text-sm transition-all duration-150"
        style={{ background: 'var(--accent)', color: 'var(--bg-base)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent-dim)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--accent)';
        }}
      >
        <span className="pulse-dot" aria-hidden="true">
          {'\u25CF'}
        </span>
        Start Recording
      </button>
    </div>
  );
}
