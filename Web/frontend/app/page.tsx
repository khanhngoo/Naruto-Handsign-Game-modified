"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { Ninjutsu, Character, characters } from "../lib/types";

export default function NarutoFightingGame() {
  const [player1, setPlayer1] = useState<Character>({ ...characters[0] });
  const [player2, setPlayer2] = useState<Character>({ ...characters[1] });
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameStarted, setGameStarted] = useState(false); // Game starts paused
  const [battleLog, setBattleLog] = useState<string[]>([]);

  // State for gesture detection UI
  const [detectedSequence, setDetectedSequence] = useState<string[]>([]);
  // State for activating the video player with a specific video ID
  const [activeJutsuVideoId, setActiveJutsuVideoId] = useState<string | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<any>(null); // Ref to hold the YouTube player instance

  // Helper function to extract the video ID from any YouTube URL
    // --- START OF UPDATED FUNCTION ---
  // This function is now more robust and handles all provided URL formats.
  const getYouTubeVideoId = (url: string): string => {
    let videoId = "";
    try {
      if (url.includes("youtu.be/")) {
        videoId = new URL(url).pathname.substring(1);
      } else if (url.includes("youtubetrimmer.com")) {
        const parsedUrl = new URL(url);
        videoId = parsedUrl.searchParams.get("v") || "";
      } else if (url.includes("youtube.com/watch")) {
        const parsedUrl = new URL(url);
        videoId = parsedUrl.searchParams.get("v") || "";
      }
    } catch (error) {
      console.error("Error parsing video URL:", error);
      return ""; // Return empty string if URL is invalid
    }
    return videoId.split("?")[0].split("&")[0]; // Clean up any extra params
  };
  // --- END OF UPDATED FUNCTION ---
  // Function to officially start the game
  const handleStartGame = () => {
    setGameStarted(true);
    setBattleLog(["Battle started! 60 seconds on the clock!"]);
  };

  // This useEffect hook creates and controls the YouTube player
  useEffect(() => {
    if (!gameStarted) return;

    (window as any).onYouTubeIframeAPIReady = () => {
      if (activeJutsuVideoId) {
        playerRef.current = new (window as any).YT.Player("jutsu-player", {
          height: "480",
          width: "854",
          videoId: activeJutsuVideoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
          },
          events: {
            onReady: (event: any) => {
              // We no longer need to mute the video!
              event.target.playVideo();
            },
          },
        });
      }
    };

    if (activeJutsuVideoId && (window as any).YT) {
      (window as any).onYouTubeIframeAPIReady();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [activeJutsuVideoId, gameStarted]);

  // Main useEffect for webcam and API calls
  useEffect(() => {
    if (!gameStarted || gameOver) return;

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
              const videoId = getYouTubeVideoId(result.jutsu.video_url);
              setActiveJutsuVideoId(videoId);
              setTimeout(() => {
                setActiveJutsuVideoId(null);
              }, 7000);
            } else if (result.status === "sequence_updated") {
              setDetectedSequence(result.current_sequence);
            }
          } catch (error) {
            console.error("API Error:", error);
          }
        }, "image/png");
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentTurn, gameOver, gameStarted]);

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          if (player1.health > player2.health) setWinner(player1.name);
          else if (player2.health > player1.health) setWinner(player2.name);
          else setWinner("Draw");
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
    setTimeLeft(20);
    setGameStarted(false); // Go back to the start screen
    setBattleLog([]);
  };

  const useNinjutsu = (ninjutsu: Ninjutsu) => {
    if (gameOver) return;
    const attacker = currentTurn === 1 ? player1 : player2;
    const defender = currentTurn === 1 ? player2 : player1;
    const setDefender = currentTurn === 1 ? setPlayer2 : setPlayer1;
    let logMessage = "";
    if (ninjutsu.damage < 0) {
      const healAmount = Math.abs(ninjutsu.damage);
      const newHealth = Math.min(
        attacker.health + healAmount,
        attacker.maxHealth
      );
      const actualHeal = newHealth - attacker.health;
      if (currentTurn === 1)
        setPlayer1((prev) => ({ ...prev, health: newHealth }));
      else setPlayer2((prev) => ({ ...prev, health: newHealth }));
      logMessage = `${attacker.name} used ${ninjutsu.name}! Restored ${actualHeal} HP!`;
    } else {
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
      <Script
        src="https://www.youtube.com/iframe_api"
        strategy="afterInteractive"
      />

      {activeJutsuVideoId && (
        <div style={videoOverlayStyle}>
          <div id="jutsu-player"></div>
        </div>
      )}

      <h1>Naruto Fighting Game</h1>

      {!gameStarted ? (
        <div style={startScreenStyle}>
          <h2>Ready to Fight?</h2>
          <button onClick={handleStartGame} style={startButtonSyle}>
            Start Game
          </button>
        </div>
      ) : (
        <>
          {/* Timer and Turn Info */}
          <div>
            <p>
              Time Left: {Math.floor(timeLeft / 20)}:
              {(timeLeft % 20).toString().padStart(2, "0")}
            </p>
            <p>
              Current Turn: {currentTurn === 1 ? player1.name : player2.name}
            </p>
          </div>

          {/* Player Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              margin: "20px 0",
            }}
          >
            <div>
              <h2>Player 1: {player1.name}</h2>
              <p>
                HP: {player1.health}/{player1.maxHealth}
              </p>
              <progress
                value={player1.health}
                max={player1.maxHealth}
              ></progress>
            </div>
            <div>
              <h2>Player 2: {player2.name}</h2>
              <p>
                HP: {player2.health}/{player2.maxHealth}
              </p>
              <progress
                value={player2.health}
                max={player2.maxHealth}
              ></progress>
            </div>
          </div>

          {gameOver ? (
            <div>
              <h2>Game Over!</h2>
              <p>{winner === "Draw" ? "It's a draw!" : `${winner} wins!`}</p>
              <button onClick={resetGame}>Play Again</button>
            </div>
          ) : (
            <div>
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
                Current Sequence:{" "}
                <strong>{detectedSequence.join(" → ")}</strong>
              </p>
            </div>
          )}

          {/* Battle Log */}
          <div>
            <h3>Battle Log</h3>
            <div
              style={{
                height: "200px",
                overflowY: "scroll",
                border: "1px solid black",
                padding: "10px",
                marginTop: "20px",
              }}
            >
              {battleLog.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Styles
const videoOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const startScreenStyle: React.CSSProperties = {
  textAlign: "center",
  marginTop: "100px",
};

const startButtonSyle: React.CSSProperties = {
  fontSize: "2em",
  padding: "20px 40px",
  cursor: "pointer",
};
