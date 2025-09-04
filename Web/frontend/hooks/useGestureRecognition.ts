import { useEffect } from 'react';
import { Ninjutsu } from '../lib/types';

interface UseGestureRecognitionOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentTurn: 1 | 2;
  gameStarted: boolean;
  gameOver: boolean;
  onJutsuDetected: (jutsu: Ninjutsu & { video_url: string }) => void;
  onSequenceUpdate: (sequence: string[]) => void;
}

export function useGestureRecognition({
  videoRef,
  canvasRef,
  currentTurn,
  gameStarted,
  gameOver,
  onJutsuDetected,
  onSequenceUpdate,
}: UseGestureRecognitionOptions) {
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };
    startWebcam();

    const intervalId = setInterval(() => {
      if (
        videoRef.current &&
        canvasRef.current &&
        videoRef.current.readyState === 4
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const formData = new FormData();
          formData.append('player_id', String(currentTurn));
          formData.append('image', blob, 'frame.png');

          try {
            const response = await fetch('http://localhost:8000/api/gesture/detect', {
              method: 'POST',
              body: formData,
            });
            const result = await response.json();

            if (result.status === 'jutsu_activated') {
              onJutsuDetected(result.jutsu);
            } else if (result.status === 'sequence_updated') {
              onSequenceUpdate(result.current_sequence);
            }
          } catch (error) {
            console.error('API Error:', error);
          }
        }, 'image/png');
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [canvasRef, currentTurn, gameOver, gameStarted, onJutsuDetected, onSequenceUpdate, videoRef]);
}
