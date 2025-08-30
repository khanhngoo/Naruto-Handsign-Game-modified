"use client";

import { useState, useEffect, useRef } from "react";
import { Ninjutsu, Character, characters } from "../lib/types";

export default function NarutoFightingGame() {
  const [player1, setPlayer1] = useState<Character>({ ...characters[0] });
  const [player2, setPlayer2] = useState<Character>({ ...characters[1] });
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(true);
  const [battleLog, setBattleLog] = useState<string[]>([
    "Battle started! 60 seconds on the clock!",
  ]);

  // New state for gesture detection UI
  const [detectedSequence, setDetectedSequence] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Webcam and API call loop
  useEffect(() => {
    if (gameOver) return;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setBattleLog((prev) => [...prev, "Error: Could not access webcam."]);
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
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const formData = new FormData();
          formData.append("player_id", String(currentTurn));
          formData.append("image", blob, "frame.png");

          try {
            const response = await fetch(
              "http://localhost:8000/api/gesture/detect",
              {
                method: "POST",
                body: formData,
              }
            );
            const result = await response.json();

            if (result.status === "jutsu_activated") {
              useNinjutsu(result.jutsu);
              setDetectedSequence([]);
            } else if (result.status === "sequence_updated") {
              setDetectedSequence(result.current_sequence);
            }
          } catch (error) {
            console.error("API Error:", error);
          }
        }, "image/png");
      }
    }, 1000); // Sends 1 frame per second

    return () => clearInterval(intervalId);
  }, [currentTurn, gameOver]);

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
            setWinner("Draw");
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
    setWinner("");
    setTimeLeft(60);
    setGameStarted(true);
    setBattleLog(["Battle started! 60 seconds on the clock!"]);
  };

  const useNinjutsu = (ninjutsu: Ninjutsu) => {
    if (gameOver) return;

    const attacker = currentTurn === 1 ? player1 : player2;
    const defender = currentTurn === 1 ? player2 : player1;
    const setDefender = currentTurn === 1 ? setPlayer2 : setPlayer1;

    let logMessage = "";

    if (ninjutsu.damage < 0) {
      // Healing move
      const healAmount = Math.abs(ninjutsu.damage);
      const newHealth = Math.min(
        attacker.health + healAmount,
        attacker.maxHealth
      );
      const actualHeal = newHealth - attacker.health;

      if (currentTurn === 1) {
        setPlayer1((prev) => ({ ...prev, health: newHealth }));
      } else {
        setPlayer2((prev) => ({ ...prev, health: newHealth }));
      }

      logMessage = `${attacker.name} used ${ninjutsu.name}! Restored ${actualHeal} HP!`;
    } else {
      // Damage move
      const damage = Math.min(ninjutsu.damage, defender.health);
      const newHealth = defender.health - damage;

      setDefender((prev) => ({ ...prev, health: newHealth }));
      logMessage = `${attacker.name} used ${ninjutsu.name}! Dealt ${damage} damage to ${defender.name}!`;

      if (newHealth <= 0) {
        setGameOver(true);
        setWinner(attacker.name);
        logMessage += ` ${defender.name} is defeated! ${attacker.name} wins!`;
      }
    }

    setBattleLog((prev) => [...prev, logMessage]);
    setCurrentTurn(currentTurn === 1 ? 2 : 1);
  };

  return (
    <div>
      <h1>Naruto Fighting Game</h1>

      <div>
        <p>
          Time Left: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </p>
        <p>Current Turn: {currentTurn === 1 ? player1.name : player2.name}</p>
      </div>

      <div>
        <h2>Player 1: {player1.name}</h2>
        <p>
          HP: {player1.health}/{player1.maxHealth}
        </p>
        <progress value={player1.health} max={player1.maxHealth}></progress>
      </div>

      <div>
        <h2>Player 2: {player2.name}</h2>
        <p>
          HP: {player2.health}/{player2.maxHealth}
        </p>
        <progress value={player2.health} max={player2.maxHealth}></progress>
      </div>

      {gameOver ? (
        <div>
          <h2>Game Over!</h2>
          <p>{winner === "Draw" ? "It's a draw!" : `${winner} wins!`}</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      ) : (
        <div>
          <h3>
            What will {currentTurn === 1 ? player1.name : player2.name} do?
          </h3>
          <div>
            {/* --- Detection Zone --- */}
            <h3>Perform Hand Signs!</h3>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "320px",
                transform: "scaleX(-1)",
                borderRadius: "8px",
              }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <p>
              Current Sequence: <strong>{detectedSequence.join(" → ")}</strong>
            </p>
          </div>
        </div>
      )}

      <div>
        <h3>Battle Log</h3>
        <div
          style={{
            height: "200px",
            overflowY: "scroll",
            border: "1px solid black",
            padding: "10px",
            background: "#black",
          }}
        >
          {battleLog.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
