// Game phase management - placeholder for future state machine implementation
// This will be expanded when hand sign recognition and phases are added

export type GamePhase = 'SELECT_ACTION' | 'PERFORMING_SIGNS' | 'RESOLVING' | 'GAME_OVER';

export interface GameState {
  phase: GamePhase;
  currentTurn: 1 | 2;
  gameOver: boolean;
  winner?: string;
}

export function getInitialGameState(): GameState {
  return {
    phase: 'SELECT_ACTION',
    currentTurn: 1,
    gameOver: false
  };
}

// Placeholder for future state machine logic
export function nextPhase(currentPhase: GamePhase, event: string): GamePhase {
  // This will be implemented when we add hand sign recognition
  switch (currentPhase) {
    case 'SELECT_ACTION':
      if (event === 'ninjutsu_selected') return 'PERFORMING_SIGNS';
      break;
    case 'PERFORMING_SIGNS':
      if (event === 'signs_completed') return 'RESOLVING';
      break;
    case 'RESOLVING':
      if (event === 'action_resolved') return 'SELECT_ACTION';
      if (event === 'game_ended') return 'GAME_OVER';
      break;
    case 'GAME_OVER':
      if (event === 'restart') return 'SELECT_ACTION';
      break;
  }
  return currentPhase;
}
