import { Character, Ninjutsu, characters } from './types';

export interface BattleResult {
  attacker: Character;
  defender: Character;
  logMessage: string;
  gameOver: boolean;
  winner?: string;
}

export function getInitialPlayers(): [Character, Character] {
  return [{ ...characters[0] }, { ...characters[1] }];
}

export function resolveNinjutsu(
  currentTurn: 1 | 2,
  player1: Character,
  player2: Character,
  ninjutsu: Ninjutsu
): BattleResult {
  const attacker = currentTurn === 1 ? player1 : player2;
  const defender = currentTurn === 1 ? player2 : player1;
  
  let newPlayer1 = { ...player1 };
  let newPlayer2 = { ...player2 };
  let logMessage = '';
  let gameOver = false;
  let winner: string | undefined;

  if (ninjutsu.damage < 0) {
    // Healing move
    const healAmount = Math.abs(ninjutsu.damage);
    const newHealth = Math.min(attacker.health + healAmount, attacker.maxHealth);
    const actualHeal = newHealth - attacker.health;
    
    if (currentTurn === 1) {
      newPlayer1.health = newHealth;
    } else {
      newPlayer2.health = newHealth;
    }
    
    logMessage = `${attacker.name} used ${ninjutsu.name}! Restored ${actualHeal} HP!`;
  } else {
    // Damage move
    const damage = Math.min(ninjutsu.damage, defender.health);
    const newHealth = defender.health - damage;
    
    if (currentTurn === 1) {
      newPlayer2.health = newHealth;
    } else {
      newPlayer1.health = newHealth;
    }
    
    logMessage = `${attacker.name} used ${ninjutsu.name}! Dealt ${damage} damage to ${defender.name}!`;

    if (newHealth <= 0) {
      gameOver = true;
      winner = attacker.name;
      logMessage += ` ${defender.name} is defeated! ${attacker.name} wins!`;
    }
  }

  return {
    attacker: newPlayer1,
    defender: newPlayer2,
    logMessage,
    gameOver,
    winner
  };
}

export function checkKO(player1: Character, player2: Character): { gameOver: boolean; winner?: string } {
  if (player1.health <= 0) {
    return { gameOver: true, winner: player2.name };
  }
  if (player2.health <= 0) {
    return { gameOver: true, winner: player1.name };
  }
  return { gameOver: false };
}

export function determineWinnerByHealth(player1: Character, player2: Character): string {
  if (player1.health > player2.health) {
    return player1.name;
  } else if (player2.health > player1.health) {
    return player2.name;
  } else {
    return 'Draw';
  }
}

export function resetGame(): [Character, Character] {
  return getInitialPlayers();
}
