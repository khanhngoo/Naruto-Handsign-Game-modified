'use client';

import { useState, useEffect } from 'react';

interface Ninjutsu {
  name: string;
  damage: number;
  description: string;
}

interface Character {
  name: string;
  maxHealth: number;
  health: number;
  ninjutsu: Ninjutsu[];
}

const characters: Character[] = [
  {
    name: 'Naruto',
    maxHealth: 100,
    health: 100,
    ninjutsu: [
      { name: 'Rasengan', damage: 35, description: 'A powerful spinning chakra sphere' },
      { name: 'Shadow Clone', damage: 20, description: 'Multiple clones attack the enemy' },
      { name: 'Nine-Tails Chakra', damage: 45, description: 'Unleash the power of Kurama' },
      { name: 'Sage Mode Punch', damage: 30, description: 'Enhanced physical attack with nature energy' }
    ]
  },
  {
    name: 'Sasuke',
    maxHealth: 100,
    health: 100,
    ninjutsu: [
      { name: 'Chidori', damage: 40, description: 'Lightning blade technique' },
      { name: 'Fireball Jutsu', damage: 25, description: 'Great fireball technique' },
      { name: 'Amaterasu', damage: 50, description: 'Black flames that never extinguish' },
      { name: 'Susanoo Arrow', damage: 35, description: 'Ethereal warrior\'s arrow attack' }
    ]
  },
  {
    name: 'Sakura',
    maxHealth: 100,
    health: 100,
    ninjutsu: [
      { name: 'Cherry Blossom Impact', damage: 30, description: 'Devastating punch with medical chakra' },
      { name: 'Healing Jutsu', damage: -20, description: 'Restore health instead of dealing damage' },
      { name: 'Strength of a Hundred', damage: 40, description: 'Release stored chakra for massive damage' },
      { name: 'Poison Needle', damage: 15, description: 'Quick poisoned senbon attack' }
    ]
  }
];

export default function NarutoFightingGame() {
  const [player1, setPlayer1] = useState<Character>({ ...characters[0] });
  const [player2, setPlayer2] = useState<Character>({ ...characters[1] });
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(true);
  const [battleLog, setBattleLog] = useState<string[]>(['Battle started! 60 seconds on the clock!']);

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          // Determine winner by remaining health
          if (player1.health > player2.health) {
            setWinner(player1.name);
          } else if (player2.health > player1.health) {
            setWinner(player2.name);
          } else {
            setWinner('Draw');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, player1.health, player2.health]);

  const resetGame = () => {
    setPlayer1({ ...characters[0] });
    setPlayer2({ ...characters[1] });
    setCurrentTurn(1);
    setGameOver(false);
    setWinner('');
    setTimeLeft(60);
    setGameStarted(true);
    setBattleLog(['Battle started! 60 seconds on the clock!']);
  };

  const useNinjutsu = (ninjutsu: Ninjutsu) => {
    if (gameOver) return;

    const attacker = currentTurn === 1 ? player1 : player2;
    const defender = currentTurn === 1 ? player2 : player1;
    const setDefender = currentTurn === 1 ? setPlayer2 : setPlayer1;

    let logMessage = '';

    if (ninjutsu.damage < 0) {
      // Healing move
      const healAmount = Math.abs(ninjutsu.damage);
      const newHealth = Math.min(attacker.health + healAmount, attacker.maxHealth);
      const actualHeal = newHealth - attacker.health;
      
      if (currentTurn === 1) {
        setPlayer1(prev => ({ ...prev, health: newHealth }));
      } else {
        setPlayer2(prev => ({ ...prev, health: newHealth }));
      }
      
      logMessage = `${attacker.name} used ${ninjutsu.name}! Restored ${actualHeal} HP!`;
    } else {
      // Damage move
      const damage = Math.min(ninjutsu.damage, defender.health);
      const newHealth = defender.health - damage;
      
      setDefender(prev => ({ ...prev, health: newHealth }));
      logMessage = `${attacker.name} used ${ninjutsu.name}! Dealt ${damage} damage to ${defender.name}!`;

      if (newHealth <= 0) {
        setGameOver(true);
        setWinner(attacker.name);
        logMessage += ` ${defender.name} is defeated! ${attacker.name} wins!`;
      }
    }

    setBattleLog(prev => [...prev, logMessage]);
    setCurrentTurn(currentTurn === 1 ? 2 : 1);
  };

  return (
    <div>
      <h1>Naruto Fighting Game</h1>
      
      <div>
        <p>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
        <p>Current Turn: {currentTurn === 1 ? player1.name : player2.name}</p>
      </div>

      <div>
        <h2>Player 1: {player1.name}</h2>
        <p>HP: {player1.health}/{player1.maxHealth}</p>
        <progress value={player1.health} max={player1.maxHealth}></progress>
      </div>

      <div>
        <h2>Player 2: {player2.name}</h2>
        <p>HP: {player2.health}/{player2.maxHealth}</p>
        <progress value={player2.health} max={player2.maxHealth}></progress>
      </div>

      {gameOver ? (
        <div>
          <h2>Game Over!</h2>
          <p>{winner === 'Draw' ? "It's a draw!" : `${winner} wins!`}</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      ) : (
        <div>
          <h3>What will {currentTurn === 1 ? player1.name : player2.name} do?</h3>
          <div>
            {(currentTurn === 1 ? player1.ninjutsu : player2.ninjutsu).map((ninjutsu, index) => (
              <button
                key={index}
                onClick={() => useNinjutsu(ninjutsu)}
                style={{ margin: '5px', padding: '10px' }}
              >
                <div><strong>{ninjutsu.name}</strong></div>
                <div>{ninjutsu.description}</div>
                <div>{ninjutsu.damage < 0 ? `Heal: +${Math.abs(ninjutsu.damage)}` : `Damage: ${ninjutsu.damage}`}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3>Battle Log</h3>
        <div style={{ height: '200px', overflow: 'auto', border: '1px solid black', padding: '10px' }}>
          {battleLog.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
