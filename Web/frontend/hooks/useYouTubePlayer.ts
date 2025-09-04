import { useEffect } from 'react';

export interface YouTubePlayer {
  destroy: () => void;
}

interface YTEvent {
  target: { playVideo: () => void };
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          height: string;
          width: string;
          videoId: string;
          playerVars: { autoplay: number; controls: number };
          events: { onReady: (event: YTEvent) => void };
        }
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface UseYouTubePlayerOptions {
  activeVideoId: string | null;
  gameStarted: boolean;
  playerRef: React.MutableRefObject<YouTubePlayer | null>;
}

export function useYouTubePlayer({ activeVideoId, gameStarted, playerRef }: UseYouTubePlayerOptions) {
  useEffect(() => {
    if (!gameStarted) return;

    window.onYouTubeIframeAPIReady = () => {
      if (activeVideoId) {
        playerRef.current = new window.YT.Player('jutsu-player', {
          height: '480',
          width: '854',
          videoId: activeVideoId,
          playerVars: { autoplay: 1, controls: 0 },
          events: {
            onReady: (event: YTEvent) => {
              event.target.playVideo();
            },
          },
        });
      }
    };

    if (activeVideoId && window.YT) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [activeVideoId, gameStarted, playerRef]);
}
