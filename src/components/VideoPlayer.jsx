import { useEffect } from 'react';
import { formatDate, formatDuration, formatFileSize } from '../utils/formatters.js';
import { CloseIcon, DownloadIcon } from './icons.jsx';

// Public-domain sample so the player actually works with mock data.
const SAMPLE_SRC = 'https://www.w3schools.com/html/mov_bbb.mp4';

export default function VideoPlayer({ recording, onClose }) {
  useEffect(() => {
    if (!recording) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [recording, onClose]);

  if (!recording) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 fade-in"
      style={{ background: 'rgba(0,0,0,0.9)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close player"
        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center transition-all duration-150"
        style={{ color: 'var(--text-secondary)', boxShadow: '0 0 0 1px var(--border)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'var(--bg-elevated)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <CloseIcon width={18} height={18} />
      </button>

      <div className="scale-in w-full max-w-3xl">
        <div style={{ boxShadow: '0 0 0 1px var(--border)' }}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={SAMPLE_SRC}
            controls
            autoPlay
            className="block w-full"
            style={{ background: '#000', aspectRatio: '16 / 9' }}
          />
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2
              className="font-display text-2xl leading-tight text-balance"
              style={{ color: 'var(--text-primary)' }}
            >
              {recording.title}
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {formatDate(recording.created_at)}
              {' \u00b7 '}
              {formatDuration(recording.duration)}
              {' \u00b7 '}
              {formatFileSize(recording.size_bytes)}
            </p>
          </div>

          <a
            href={SAMPLE_SRC}
            download={recording.filename}
            className="flex shrink-0 items-center gap-2 px-4 py-2 text-sm transition-all duration-150"
            style={{ color: 'var(--text-primary)', boxShadow: '0 0 0 1px var(--border)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.boxShadow = '0 0 0 1px var(--border-focus)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = '0 0 0 1px var(--border)';
            }}
          >
            <DownloadIcon width={14} height={14} />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
