import { useState, useRef, useCallback } from 'react';

export function useWebcam() {
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const streamRef = useRef(null);

  const stopWebcam = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setWebcamStream(null);
    setWebcamEnabled(false);
  }, []);

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      setWebcamStream(stream);
      setWebcamEnabled(true);
      return stream;
    } catch {
      streamRef.current = null;
      setWebcamStream(null);
      setWebcamEnabled(false);
      return null;
    }
  }, []);

  const toggleWebcam = useCallback(async () => {
    if (webcamEnabled) {
      stopWebcam();
    } else {
      await startWebcam();
    }
  }, [webcamEnabled, startWebcam, stopWebcam]);

  return {
    webcamEnabled,
    webcamStream,
    toggleWebcam,
    startWebcam,
    stopWebcam,
  };
}
