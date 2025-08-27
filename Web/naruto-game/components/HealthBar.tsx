import { Character } from '../lib/types';

interface HealthBarProps {
  player: Character;
  playerNumber: 1 | 2;
}

export function HealthBar({ player, playerNumber }: HealthBarProps) {
  return (
    <div>
      <h2>Player {playerNumber}: {player.name}</h2>
      <p>HP: {player.health}/{player.maxHealth}</p>
      <progress value={player.health} max={player.maxHealth}></progress>
    </div>
  );
}
