import { useState, useRef, useEffect, useCallback } from 'react';

// Fake state machine standing in for the real recorder.
// status: 'idle' | 'countdown' | 'recording' | 'uploading' | 'done'
// TODO: wire up real MediaRecorder, getDisplayMedia, canvas compositor
export function useScreenRecorder() {
  const [status, setStatus] = useState('idle');
  const [countdown, setCountdown] = useState(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const countdownRef = useRef(null);
  const tickRef = useRef(null);
  const timeoutRef = useRef(null);

  const clearTimers = useCallback(() => {
    clearInterval(countdownRef.current);
    clearInterval(tickRef.current);
    clearTimeout(timeoutRef.current);
    countdownRef.current = null;
    tickRef.current = null;
    timeoutRef.current = null;
  }, []);

  // Drive the elapsed timer whenever we are recording.
  useEffect(() => {
    if (status === 'recording') {
      tickRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => clearInterval(tickRef.current);
  }, [status]);

  const startRecording = useCallback(() => {
    // TODO: getDisplayMedia + MediaRecorder.start()
    setElapsedSeconds(0);
    setCountdown(3);
    setStatus('countdown');

    let n = 3;
    countdownRef.current = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(0);
        setStatus('recording');
      } else {
        setCountdown(n);
      }
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    // TODO: MediaRecorder.stop() + upload the produced blob
    clearTimers();
    setStatus('uploading');
    timeoutRef.current = setTimeout(() => {
      setStatus('done');
    }, 2000);
  }, [clearTimers]);

  const cancelRecording = useCallback(() => {
    clearTimers();
    setElapsedSeconds(0);
    setCountdown(3);
    setStatus('idle');
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    status,
    countdown,
    elapsedSeconds,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
