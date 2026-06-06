import { useState, useRef, useEffect, useCallback } from 'react';
import { startCompositing } from '../utils/canvasCompositor.js';

// status: 'idle' | 'countdown' | 'recording' | 'uploading' | 'done'
// Upload/recording blob assembly deferred to Phase 3.

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

  const countdownRef = useRef(null);
  const tickRef = useRef(null);
  const screenStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const compositorRef = useRef(null);
  const stopScreenRef = useRef(null);

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

  useEffect(() => {
    if (status !== 'countdown' && status !== 'recording') return;
    restartCompositor();
  }, [status, webcamStream, webcamEnabled, restartCompositor]);

  useEffect(() => {
    if (status === 'recording') {
      tickRef.current = setInterval(() => {
        setElapsedSeconds((seconds) => seconds + 1);
      }, 1000);
    } else {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => clearInterval(tickRef.current);
  }, [status]);

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

    try {
      const { stream, stop } = await startCapture();
      screenStreamRef.current = stream;
      stopScreenRef.current = stop;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          releaseStreams();
          clearCountdown();
          setElapsedSeconds(0);
          setCountdown(3);
          setStatus('idle');
        };
      }

      await startMic();

      setElapsedSeconds(0);
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
  }, [startMic, releaseStreams, clearCountdown]);

  const stopRecording = useCallback(() => {
    clearCountdown();
    releaseStreams();
    setElapsedSeconds(0);
    setCountdown(3);
    setStatus('idle');
  }, [clearCountdown, releaseStreams]);

  const cancelRecording = useCallback(() => {
    clearCountdown();
    releaseStreams();
    setElapsedSeconds(0);
    setCountdown(3);
    setStatus('idle');
  }, [clearCountdown, releaseStreams]);

  const getOutputStream = useCallback(() => {
    const canvasStream = compositorRef.current?.getCompositedStream();
    if (!canvasStream) return null;
    return buildOutputStream(canvasStream, micStreamRef.current);
  }, []);

  useEffect(
    () => () => {
      clearCountdown();
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
    startRecording,
    stopRecording,
    cancelRecording,
    getOutputStream,
  };
}
