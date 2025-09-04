"use client";

import { useState, useRef } from "react";
import Script from "next/script";
import { Character, Ninjutsu } from "../lib/types";
import {
  getInitialPlayers,
  resolveNinjutsu,
  determineWinnerByHealth,
  resetGame as resetPlayers,
} from "../lib/engine";
import { getYouTubeVideoId } from "../lib/utils";
import { useGameTimer } from "../hooks/useGameTimer";
import { useYouTubePlayer, YouTubePlayer } from "../hooks/useYouTubePlayer";
import { useGestureRecognition } from "../hooks/useGestureRecognition";
import { TurnHUD } from "../components/TurnHUD";
import { HealthBar } from "../components/HealthBar";
import { BattleLog } from "../components/BattleLog";
import { GestureInput } from "../components/GestureInput";
import { StartScreen } from "../components/StartScreen";
import { JutsuOverlay } from "../components/JutsuOverlay";

export default function NarutoFightingGame() {
  const [player1, player2Init] = getInitialPlayers();
  const [playerState1, setPlayer1] = useState<Character>(player1);
  const [playerState2, setPlayer2] = useState<Character>(player2Init);
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [detectedSequence, setDetectedSequence] = useState<string[]>([]);
  const [activeJutsuVideoId, setActiveJutsuVideoId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);

  const { timeLeft, reset: resetTimer } = useGameTimer({
    gameStarted,
    gameOver,
    duration: 60,
    onExpire: () => {
      setGameOver(true);
      setWinner(determineWinnerByHealth(playerState1, playerState2));
    },
  });

  useYouTubePlayer({ activeVideoId: activeJutsuVideoId, gameStarted, playerRef });

  useGestureRecognition({
    videoRef,
    canvasRef,
    currentTurn,
    gameStarted,
    gameOver,
    onJutsuDetected: (jutsu: Ninjutsu & { video_url: string }) => {
      handleNinjutsu(jutsu);
      setDetectedSequence([]);
      const videoId = getYouTubeVideoId(jutsu.video_url);
      setActiveJutsuVideoId(videoId);
      setTimeout(() => setActiveJutsuVideoId(null), 7000);
    },
    onSequenceUpdate: setDetectedSequence,
  });

  function handleStartGame() {
    setGameStarted(true);
    setBattleLog(["Battle started! 60 seconds on the clock!"]); // manual message
    resetTimer();
  }

  function handleNinjutsu(ninjutsu: Ninjutsu) {
    if (gameOver) return;
    const result = resolveNinjutsu(currentTurn, playerState1, playerState2, ninjutsu);
    setPlayer1(result.attacker);
    setPlayer2(result.defender);
    setBattleLog((prev) => [...prev, result.logMessage]);
    if (result.gameOver) {
      setGameOver(true);
      if (result.winner) setWinner(result.winner);
    } else {
      setCurrentTurn(currentTurn === 1 ? 2 : 1);
    }
  }

  function resetGame() {
    const [p1, p2] = resetPlayers();
    setPlayer1(p1);
    setPlayer2(p2);
    setCurrentTurn(1);
    setGameOver(false);
    setWinner("");
    setGameStarted(false);
    setBattleLog([]);
    setDetectedSequence([]);
    setActiveJutsuVideoId(null);
    resetTimer();
  }

  return (
    <div>
      <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
      {activeJutsuVideoId && <JutsuOverlay />}
      <h1>Naruto Fighting Game</h1>
      {!gameStarted ? (
        <StartScreen onStart={handleStartGame} />
      ) : (
        <>
          <TurnHUD timeLeft={timeLeft} currentPlayer={currentTurn === 1 ? playerState1 : playerState2} />
          <div style={{ display: "flex", justifyContent: "space-around", margin: "20px 0" }}>
            <HealthBar player={playerState1} playerNumber={1} />
            <HealthBar player={playerState2} playerNumber={2} />
          </div>
          {gameOver ? (
            <div>
              <h2>Game Over!</h2>
              <p>{winner === "Draw" ? "It's a draw!" : `${winner} wins!`}</p>
              <button onClick={resetGame}>Play Again</button>
            </div>
          ) : (
            <GestureInput
              videoRef={videoRef}
              canvasRef={canvasRef}
              detectedSequence={detectedSequence}
            />
          )}
          <BattleLog logs={battleLog} />
        </>
      )}
    </div>
  );
}
