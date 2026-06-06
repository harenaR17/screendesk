import { useState, useCallback } from 'react';

// Stub only — just a boolean toggle for now.
// TODO: wire up real getUserMedia for the webcam stream
export function useWebcam() {
  const [webcamEnabled, setWebcamEnabled] = useState(false);

  const toggleWebcam = useCallback(() => {
    setWebcamEnabled((v) => !v);
  }, []);

  return { webcamEnabled, toggleWebcam };
}
