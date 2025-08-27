import { useState, useEffect } from 'react';

interface UseTurnTimerProps {
  gameStarted: boolean;
  gameOver: boolean;
  currentTurn: 1 | 2;
  onTimeExpire: () => void;
}

interface UseTurnTimerReturn {
  timeLeft: number;
  resetTimer: () => void;
}

export function useTurnTimer({ 
  gameStarted, 
  gameOver, 
  currentTurn,
  onTimeExpire 
}: UseTurnTimerProps): UseTurnTimerReturn {
  const [timeLeft, setTimeLeft] = useState(60);

  const resetTimer = () => {
    setTimeLeft(60);
  };

  // Reset timer whenever the turn changes
  useEffect(() => {
    setTimeLeft(60);
  }, [currentTurn]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeExpire();
          return 60; // Reset to 60 for next turn
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, currentTurn, onTimeExpire]);

  return { timeLeft, resetTimer };
}
