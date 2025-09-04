import { useState, useEffect } from 'react';

interface UseGameTimerOptions {
  gameStarted: boolean;
  gameOver: boolean;
  duration: number;
  onExpire: () => void;
}

interface UseGameTimerReturn {
  timeLeft: number;
  reset: () => void;
}

export function useGameTimer({ gameStarted, gameOver, duration, onExpire }: UseGameTimerOptions): UseGameTimerReturn {
  const [timeLeft, setTimeLeft] = useState(duration);

  const reset = () => setTimeLeft(duration);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, onExpire]);

  return { timeLeft, reset };
}
