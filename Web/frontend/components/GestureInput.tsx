interface GestureInputProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  detectedSequence: string[];
}

export function GestureInput({ videoRef, canvasRef, detectedSequence }: GestureInputProps) {
  return (
    <div>
      <h3>Perform Hand Signs!</h3>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '320px', transform: 'scaleX(-1)', borderRadius: '8px' }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <p>
        Current Sequence: <strong>{detectedSequence.join(' → ')}</strong>
      </p>
    </div>
  );
}
