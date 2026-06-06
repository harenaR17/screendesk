function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Composites a screen capture with an optional webcam PiP on a canvas.
 * Returns { stop, getCompositedStream }.
 */
export function startCompositing(screenStream, webcamStream, canvas, options = {}) {
  const { showWebcam = true } = options;
  const ctx = canvas.getContext('2d');

  const screenVideo = document.createElement('video');
  screenVideo.srcObject = screenStream;
  screenVideo.muted = true;
  screenVideo.playsInline = true;

  let webcamVideo = null;
  if (webcamStream && showWebcam) {
    webcamVideo = document.createElement('video');
    webcamVideo.srcObject = webcamStream;
    webcamVideo.muted = true;
    webcamVideo.playsInline = true;
  }

  let rafId = null;
  let running = false;
  let compositedStream = null;

  const drawFrame = () => {
    if (!running) return;

    const track = screenStream.getVideoTracks()[0];
    const settings = track?.getSettings?.() ?? {};
    const width = screenVideo.videoWidth || settings.width || 1280;
    const height = screenVideo.videoHeight || settings.height || 720;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.drawImage(screenVideo, 0, 0, width, height);

    if (
      webcamVideo &&
      showWebcam &&
      webcamVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      const pipWidth = width * 0.2;
      const aspect =
        webcamVideo.videoWidth > 0
          ? webcamVideo.videoHeight / webcamVideo.videoWidth
          : 3 / 4;
      const pipHeight = pipWidth * aspect;
      const margin = width * 0.02;
      const x = width - pipWidth - margin;
      const y = height - pipHeight - margin;
      const radius = pipWidth * 0.08;

      ctx.save();
      roundRect(ctx, x, y, pipWidth, pipHeight, radius);
      ctx.clip();
      ctx.drawImage(webcamVideo, x, y, pipWidth, pipHeight);
      ctx.restore();
    }

    rafId = requestAnimationFrame(drawFrame);
  };

  const start = async () => {
    await screenVideo.play();
    if (webcamVideo) {
      await webcamVideo.play();
    }
    running = true;
    drawFrame();
    compositedStream = canvas.captureStream(30);
  };

  start();

  const stop = () => {
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    screenVideo.pause();
    screenVideo.srcObject = null;
    if (webcamVideo) {
      webcamVideo.pause();
      webcamVideo.srcObject = null;
    }
    compositedStream?.getTracks().forEach((track) => track.stop());
    compositedStream = null;
  };

  const getCompositedStream = () => compositedStream;

  return { stop, getCompositedStream };
}
