import { Link } from 'react-router-dom';
import { useScreenRecorder } from '../hooks/useScreenRecorder.js';
import { useWebcam } from '../hooks/useWebcam.js';
import RecordingControls from '../components/RecordingControls.jsx';
import { formatDuration } from '../utils/formatters.js';
import { ArrowLeftIcon, PlayIcon, WebcamIcon } from '../components/icons.jsx';

export default function RecordPage() {
  const {
    status,
    countdown,
    elapsedSeconds,
    startRecording,
    stopRecording,
  } = useScreenRecorder();
  const { webcamEnabled, toggleWebcam } = useWebcam();

  const isRecording = status === 'recording';

  return (
    <main
      className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm transition-colors duration-150"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ArrowLeftIcon width={14} height={14} /> Library
        </Link>
        <span
          className="font-display text-xl uppercase tracking-[0.2em]"
          style={{ color: 'var(--text-primary)' }}
        >
          ScreenDeck
        </span>
      </header>

      <div
        className="mt-5 mb-8 h-px w-full"
        style={{ background: 'var(--border)' }}
      />

      {/* Preview area */}
      <div
        className="relative flex items-center justify-center"
        style={{
          aspectRatio: '16 / 9',
          background: 'var(--bg-surface)',
          border:
            status === 'idle'
              ? '1px dashed var(--border-focus)'
              : '1px solid var(--border)',
        }}
      >
        {status === 'idle' && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your screen will appear here
          </p>
        )}

        {status === 'countdown' && (
          <span
            key={countdown}
            className="count-pop font-display text-8xl"
            style={{ color: 'var(--accent)' }}
          >
            {countdown}
          </span>
        )}

        {status === 'recording' && (
          <>
            <div className="absolute left-3 top-3 flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full pulse-dot"
                style={{ background: 'var(--danger)' }}
                aria-hidden="true"
              />
              <span
                className="text-xs tracking-widest"
                style={{ color: 'var(--danger)' }}
              >
                REC
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sharing your screen{'\u2026'}
            </p>
          </>
        )}

        {status === 'uploading' && (
          <div className="flex w-2/3 max-w-md flex-col items-center gap-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Uploading &amp; encoding{'\u2026'}
            </p>
            <div className="progress-track h-1 w-full">
              <span className="progress-bar" />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg" style={{ color: 'var(--success)' }}>
              {'\u2713'} Recording saved
            </p>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-sm transition-all duration-150"
              style={{ background: 'var(--accent)', color: 'var(--bg-base)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-dim)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent)';
              }}
            >
              View in Library {'\u2192'}
            </Link>
          </div>
        )}

        {/* Webcam preview inset */}
        {(status === 'recording' || status === 'countdown') &&
          webcamEnabled && (
            <div
              className="absolute bottom-3 right-3 flex items-center justify-center"
              style={{
                width: '22%',
                aspectRatio: '4 / 3',
                background: 'var(--bg-elevated)',
                boxShadow: '0 0 0 1px var(--border-focus)',
              }}
            >
              <span
                className="text-[10px] tracking-widest"
                style={{ color: 'var(--text-secondary)' }}
              >
                WEBCAM
              </span>
            </div>
          )}
      </div>

      {/* Control zone */}
      <div className="mt-8">
        {isRecording ? (
          <RecordingControls
            elapsedSeconds={elapsedSeconds}
            webcamEnabled={webcamEnabled}
            onToggleWebcam={toggleWebcam}
            onStop={stopRecording}
          />
        ) : (
          <>
            <div
              className="mb-6 h-px w-full"
              style={{ background: 'var(--border)' }}
            />
            <div className="flex flex-col items-center gap-5">
              {status === 'idle' && (
                <>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Select a screen to share, then press Start.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-2 px-4 py-2 text-sm"
                      style={{
                        color: 'var(--text-muted)',
                        boxShadow: '0 0 0 1px var(--border)',
                        cursor: 'not-allowed',
                      }}
                    >
                      <WebcamIcon width={14} height={14} />
                      WEBCAM OFF
                    </button>
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-2 px-5 py-2 text-sm transition-all duration-150"
                      style={{
                        background: 'var(--accent)',
                        color: 'var(--bg-base)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-dim)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--accent)';
                      }}
                    >
                      <PlayIcon width={14} height={14} />
                      START RECORDING
                    </button>
                  </div>
                </>
              )}

              {status === 'countdown' && (
                <button
                  type="button"
                  disabled
                  className="px-5 py-2 text-sm"
                  style={{
                    color: 'var(--text-muted)',
                    boxShadow: '0 0 0 1px var(--border)',
                    cursor: 'not-allowed',
                  }}
                >
                  STARTING{'\u2026'}
                </button>
              )}

              {status === 'uploading' && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Please wait{'\u2026'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
