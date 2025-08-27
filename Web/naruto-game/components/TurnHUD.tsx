import { Character } from '../lib/types';

interface TurnHUDProps {
  timeLeft: number;
  currentPlayer: Character;
}

export function TurnHUD({ timeLeft, currentPlayer }: TurnHUDProps) {
  return (
    <div>
      <p>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
      <p>Current Turn: {currentPlayer.name}</p>
    </div>
  );
}
