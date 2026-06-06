import { useState, useRef, useEffect } from 'react';
import { formatDate, formatDuration, formatFileSize } from '../utils/formatters.js';
import { PlayIcon, PencilIcon, TrashIcon } from './icons.jsx';

function IconButton({ label, onClick, children, danger }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center text-sm transition-all duration-150"
      style={{ color: 'var(--text-secondary)', boxShadow: '0 0 0 1px var(--border)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.boxShadow = `0 0 0 1px ${danger ? 'var(--danger)' : 'var(--border-focus)'}`;
        e.currentTarget.style.color = danger ? 'var(--danger)' : 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.boxShadow = '0 0 0 1px var(--border)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      {children}
    </button>
  );
}

export default function RecordingCard({ recording, onPlay, onRename, onDelete }) {
  const isProcessing = recording.status === 'processing';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(recording.title);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== recording.title) {
      onRename?.(recording.id, next);
    } else {
      setDraft(recording.title);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(recording.title);
    setEditing(false);
  };

  return (
    <div
      className="flex flex-col transition-all duration-150"
      style={{ background: 'var(--bg-surface)', boxShadow: '0 0 0 1px var(--border)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail 16:9 */}
      <div className="thumb-stripes relative" style={{ aspectRatio: '16 / 9' }}>
        {recording.has_webcam && (
          <div
            className="absolute left-2 top-2 flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-widest"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
            <span style={{ color: 'var(--text-primary)' }}>WEBCAM</span>
          </div>
        )}

        {isProcessing && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: 'rgba(10,10,10,0.7)' }}
          >
            <span
              className="h-6 w-6 rounded-full border-2 pulse-dot"
              style={{
                borderColor: 'var(--processing)',
                borderTopColor: 'transparent',
              }}
            />
            <span
              className="text-[11px] tracking-widest pulse-dot"
              style={{ color: 'var(--processing)' }}
            >
              ENCODING{'\u2026'}
            </span>
          </div>
        )}

        {!isProcessing && hovered && (
          <button
            type="button"
            aria-label={`Play ${recording.title}`}
            onClick={() => onPlay?.(recording)}
            className="absolute inset-0 flex items-center justify-center fade-in"
            style={{ background: 'rgba(10,10,10,0.5)' }}
          >
            <span
              className="flex h-12 w-12 items-center justify-center"
              style={{
                color: 'var(--bg-base)',
                background: 'var(--accent)',
              }}
            >
              <PlayIcon width={20} height={20} />
            </span>
          </button>
        )}

        {!isProcessing && (
          <span
            className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[11px]"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--text-primary)' }}
          >
            {formatDuration(recording.duration)}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 p-3">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') cancel();
            }}
            className="w-full px-2 py-1 text-sm outline-none"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              boxShadow: '0 0 0 1px var(--border-focus)',
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            title="Click to rename"
            className="truncate text-left text-sm transition-colors duration-150"
            style={{ color: 'var(--text-primary)' }}
          >
            {recording.title}
          </button>
        )}

        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {formatDate(recording.created_at)}
          {' \u00b7 '}
          {formatFileSize(recording.size_bytes)}
        </p>

        <div className="flex items-center gap-2">
          <IconButton
            label="Play"
            onClick={() => !isProcessing && onPlay?.(recording)}
          >
            <PlayIcon width={14} height={14} />
          </IconButton>
          <IconButton label="Rename" onClick={() => setEditing(true)}>
            <PencilIcon width={14} height={14} />
          </IconButton>
          <IconButton
            label="Delete"
            danger
            onClick={() => onDelete?.(recording)}
          >
            <TrashIcon width={14} height={14} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
