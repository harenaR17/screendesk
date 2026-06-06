import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecordings } from '../hooks/useRecordings.js';
import RecordingCard from '../components/RecordingCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import VideoPlayer from '../components/VideoPlayer.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg-surface)', boxShadow: '0 0 0 1px var(--border)' }}>
      <div className="shimmer" style={{ aspectRatio: '16 / 9' }} />
      <div className="flex flex-col gap-3 p-3">
        <div className="shimmer h-4 w-3/4" />
        <div className="shimmer h-3 w-1/2" />
        <div className="flex gap-2">
          <div className="shimmer h-8 w-8" />
          <div className="shimmer h-8 w-8" />
          <div className="shimmer h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const { recordings, loading, deleteRecording, renameRecording } =
    useRecordings();
  const [playing, setPlaying] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const startRecording = () => navigate('/record');

  return (
    <main
      className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <h1
          className="font-display text-2xl uppercase tracking-[0.2em] sm:text-3xl"
          style={{ color: 'var(--text-primary)' }}
        >
          ScreenDeck
        </h1>
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2 text-sm transition-all duration-150"
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
          <span className="hidden sm:inline">Start Recording</span>
          <span className="sm:hidden">Record</span>
        </button>
      </header>

      <div
        className="mt-5 mb-6 h-px w-full"
        style={{ background: 'var(--border)' }}
      />

      {/* Count */}
      {!loading && recordings.length > 0 && (
        <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {recordings.length} recording{recordings.length === 1 ? '' : 's'}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : recordings.length === 0 ? (
        <EmptyState onStart={startRecording} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recordings.map((rec) => (
            <RecordingCard
              key={rec.id}
              recording={rec}
              onPlay={setPlaying}
              onRename={renameRecording}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <VideoPlayer recording={playing} onClose={() => setPlaying(null)} />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete recording?"
        body="This cannot be undone."
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          deleteRecording(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </main>
  );
}
