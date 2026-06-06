import { useState, useRef, useEffect, useCallback } from 'react';
import { startCompositing } from '../utils/canvasCompositor.js';
import { uploadRecording, pollRecordingStatus } from '../utils/api.js';

// status: 'idle' | 'countdown' | 'recording' | 'uploading' | 'done'

const MIME_TYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];

function getSupportedMimeType() {
  return MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

async function startCapture() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  });

  const stop = () => {
    stream.getTracks().forEach((track) => track.stop());
  };

  return { stream, stop };
}

function buildOutputStream(canvasStream, micStream) {
  const tracks = [...canvasStream.getVideoTracks()];
  micStream?.getAudioTracks().forEach((track) => tracks.push(track));
  return new MediaStream(tracks);
}

export function useScreenRecorder({ canvasRef, webcamStream, webcamEnabled } = {}) {
  const [status, setStatus] = useState('idle');
  const [countdown, setCountdown] = useState(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [micActive, setMicActive] = useState(false);
  const [captureError, setCaptureError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [completedRecordingId, setCompletedRecordingId] = useState(null);

  const countdownRef = useRef(null);
  const tickRef = useRef(null);
  const screenStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const compositorRef = useRef(null);
  const stopScreenRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const mimeTypeRef = useRef('');
  const pollAbortRef = useRef(null);
  const elapsedRef = useRef(0);

  const clearCountdown = useCallback(() => {
    clearInterval(countdownRef.current);
    countdownRef.current = null;
  }, []);

  const stopCompositor = useCallback(() => {
    compositorRef.current?.stop();
    compositorRef.current = null;
  }, []);

  const releaseStreams = useCallback(() => {
    stopCompositor();
    stopScreenRef.current?.();
    stopScreenRef.current = null;
    screenStreamRef.current = null;

    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    setMicActive(false);
  }, [stopCompositor]);

  const restartCompositor = useCallback(() => {
    const canvas = canvasRef?.current;
    const screenStream = screenStreamRef.current;
    if (!canvas || !screenStream) return;

    stopCompositor();
    compositorRef.current = startCompositing(
      screenStream,
      webcamEnabled ? webcamStream : null,
      canvas,
      { showWebcam: webcamEnabled && !!webcamStream },
    );
  }, [canvasRef, webcamStream, webcamEnabled, stopCompositor]);

  const getOutputStream = useCallback(() => {
    const canvasStream = compositorRef.current?.getCompositedStream();
    if (!canvasStream) return null;
    return buildOutputStream(canvasStream, micStreamRef.current);
  }, []);

  const processRecordingBlob = useCallback(
    async (blob) => {
      setUploadProgress(0);
      setStatus('uploading');

      try {
        const { id } = await uploadRecording(
          blob,
          {
            duration: elapsedRef.current,
            has_webcam: webcamEnabled && !!webcamStream,
          },
          { onProgress: setUploadProgress },
        );
        setUploadProgress(100);

        pollAbortRef.current?.abort();
        pollAbortRef.current = new AbortController();

        const result = await pollRecordingStatus(id, {
          signal: pollAbortRef.current.signal,
        });

        if (result.status === 'error') {
          setCaptureError('Video encoding failed. Please try again.');
          setStatus('idle');
          return;
        }

        setCompletedRecordingId(id);
        setStatus('done');
      } catch (err) {
        if (err?.message !== 'Polling cancelled') {
          setCaptureError(err?.message || 'Upload failed');
        }
        setStatus('idle');
      }
    },
    [webcamEnabled, webcamStream],
  );

  const stopMediaRecorder = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeTypeRef.current || 'video/webm',
        });
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        resolve(blob);
      };
      recorder.stop();
    });
  }, []);

  const finalizeStop = useCallback(async () => {
    clearCountdown();
    clearInterval(tickRef.current);
    tickRef.current = null;

    const blob = await stopMediaRecorder();
    releaseStreams();
    setCountdown(3);

    if (!blob || blob.size === 0) {
      setElapsedSeconds(0);
      elapsedRef.current = 0;
      setStatus('idle');
      return;
    }

    await processRecordingBlob(blob);
    setElapsedSeconds(0);
    elapsedRef.current = 0;
  }, [clearCountdown, releaseStreams, stopMediaRecorder, processRecordingBlob]);

  useEffect(() => {
    if (status !== 'countdown' && status !== 'recording') return;
    restartCompositor();
  }, [status, webcamStream, webcamEnabled, restartCompositor]);

  useEffect(() => {
    if (status === 'recording') {
      elapsedRef.current = 0;
      tickRef.current = setInterval(() => {
        setElapsedSeconds((seconds) => {
          const next = seconds + 1;
          elapsedRef.current = next;
          return next;
        });
      }, 1000);
    } else {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => clearInterval(tickRef.current);
  }, [status]);

  useEffect(() => {
    if (status !== 'recording') return;

    let cancelled = false;
    let recorder = null;
    let rafId = null;

    const startRecorder = () => {
      if (cancelled) return;

      const stream = getOutputStream();
      if (!stream) {
        rafId = requestAnimationFrame(startRecorder);
        return;
      }

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      chunksRef.current = [];

      recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
    };

    startRecorder();

    return () => {
      cancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (recorder?.state !== 'inactive') {
        recorder.stop();
      }
    };
  }, [status, getOutputStream]);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      micStreamRef.current = stream;
      setMicActive(true);
      return stream;
    } catch {
      micStreamRef.current = null;
      setMicActive(false);
      return null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setCaptureError(null);
    setCompletedRecordingId(null);
    setUploadProgress(0);

    try {
      const { stream, stop } = await startCapture();
      screenStreamRef.current = stream;
      stopScreenRef.current = stop;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          if (mediaRecorderRef.current?.state === 'recording') {
            finalizeStop();
          } else {
            clearCountdown();
            releaseStreams();
            setElapsedSeconds(0);
            elapsedRef.current = 0;
            setCountdown(3);
            setStatus('idle');
          }
        };
      }

      await startMic();

      setElapsedSeconds(0);
      elapsedRef.current = 0;
      setCountdown(3);
      setStatus('countdown');

      let remaining = 3;
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearCountdown();
          setCountdown(0);
          setStatus('recording');
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    } catch (err) {
      releaseStreams();
      if (err?.name === 'NotAllowedError' || err?.name === 'AbortError') {
        return;
      }
      setCaptureError(err?.message || 'Screen capture failed');
    }
  }, [startMic, releaseStreams, clearCountdown, finalizeStop]);

  const stopRecording = useCallback(() => {
    finalizeStop();
  }, [finalizeStop]);

  const cancelRecording = useCallback(() => {
    pollAbortRef.current?.abort();
    clearCountdown();
    clearInterval(tickRef.current);
    tickRef.current = null;

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = () => {
        chunksRef.current = [];
        mediaRecorderRef.current = null;
      };
      recorder.stop();
    }

    releaseStreams();
    setElapsedSeconds(0);
    elapsedRef.current = 0;
    setCountdown(3);
    setUploadProgress(0);
    setStatus('idle');
  }, [clearCountdown, releaseStreams]);

  useEffect(
    () => () => {
      pollAbortRef.current?.abort();
      clearCountdown();
      clearInterval(tickRef.current);

      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }

      releaseStreams();
    },
    [clearCountdown, releaseStreams],
  );

  return {
    status,
    countdown,
    elapsedSeconds,
    micActive,
    captureError,
    uploadProgress,
    completedRecordingId,
    startRecording,
    stopRecording,
    cancelRecording,
    getOutputStream,
  };
}
