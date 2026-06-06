import { formatDuration } from '../utils/formatters.js';
import { WebcamIcon, StopIcon } from './icons.jsx';

// The control bar shown inside RecordPage during the 'recording' state.
export default function RecordingControls({
  elapsedSeconds,
  webcamEnabled,
  onToggleWebcam,
  onStop,
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {/* Left: webcam toggle */}
      <button
        type="button"
        onClick={onToggleWebcam}
        className="flex items-center gap-2 px-4 py-2 text-sm transition-all duration-150"
        style={{
          color: webcamEnabled ? 'var(--bg-base)' : 'var(--text-secondary)',
          background: webcamEnabled ? 'var(--accent)' : 'transparent',
          boxShadow: `0 0 0 1px ${webcamEnabled ? 'var(--accent)' : 'var(--border)'}`,
        }}
      >
        <WebcamIcon width={14} height={14} />
        WEBCAM {webcamEnabled ? 'ON' : 'OFF'}
      </button>

      {/* Center: REC + timer */}
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full pulse-dot"
          style={{ background: 'var(--danger)' }}
          aria-hidden="true"
        />
        <span
          className="text-sm tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          REC
        </span>
        <span
          className="ml-2 text-lg tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
          {formatDuration(elapsedSeconds).padStart(5, '0')}
        </span>
      </div>

      {/* Right: stop */}
      <button
        type="button"
        onClick={onStop}
        className="flex items-center gap-2 px-4 py-2 text-sm transition-all duration-150"
        style={{ color: 'var(--danger)', boxShadow: '0 0 0 1px var(--danger)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--danger)';
          e.currentTarget.style.color = '#0a0a0a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--danger)';
        }}
      >
        <StopIcon width={14} height={14} />
        STOP RECORDING
      </button>
    </div>
  );
}
