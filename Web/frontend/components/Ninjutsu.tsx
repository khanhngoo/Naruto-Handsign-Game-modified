import { Ninjutsu, Character } from '../lib/types';

interface NinjutsuButtonsProps {
  currentPlayer: Character;
  onNinjutsuUse: (ninjutsu: Ninjutsu) => void;
  disabled?: boolean;
}

export function NinjutsuButtons({ currentPlayer, onNinjutsuUse, disabled = false }: NinjutsuButtonsProps) {
  return (
    <div>
      <h3>What jutsu will {currentPlayer.name} do?</h3>
      <div>
        {currentPlayer.ninjutsu.map((ninjutsu, index) => (
          <button
            key={index}
            onClick={() => onNinjutsuUse(ninjutsu)}
            disabled={disabled}
            style={{ margin: '5px', padding: '10px' }}
          >
            <div><strong>{ninjutsu.name}</strong></div>
            <div>{ninjutsu.description}</div>
            <div>{ninjutsu.damage < 0 ? `Heal: +${Math.abs(ninjutsu.damage)}` : `Damage: ${ninjutsu.damage}`}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
