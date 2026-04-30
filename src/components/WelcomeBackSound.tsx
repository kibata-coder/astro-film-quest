import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import soundUrl from "@/assets/we_r_back.mp3";

const PLAYED_KEY = "soudflex.we-are-back-sound.played.v1";

const WelcomeBackSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedRef = useRef(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(PLAYED_KEY)) {
      // Already played this session — keep button available but don't auto-trigger.
      return;
    }

    const audio = new Audio(soundUrl);
    audio.preload = "auto";
    audio.volume = 0.9;
    audioRef.current = audio;

    const tryPlay = () => {
      if (playedRef.current) return;
      audio
        .play()
        .then(() => {
          playedRef.current = true;
          sessionStorage.setItem(PLAYED_KEY, "1");
          removeFirstClickListener();
        })
        .catch(() => {
          // Autoplay blocked — wait for first user interaction below.
        });
    };

    const onFirstClick = () => {
      tryPlay();
    };

    const addFirstClickListener = () => {
      window.addEventListener("pointerdown", onFirstClick, { once: false });
      window.addEventListener("keydown", onFirstClick, { once: false });
    };
    const removeFirstClickListener = () => {
      window.removeEventListener("pointerdown", onFirstClick);
      window.removeEventListener("keydown", onFirstClick);
    };

    // Try autoplay 3s after load; if blocked, the first click will trigger it.
    const timer = window.setTimeout(tryPlay, 3000);
    addFirstClickListener();

    return () => {
      window.clearTimeout(timer);
      removeFirstClickListener();
      audio.pause();
    };
  }, []);

  const handleManualPlay = () => {
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio(soundUrl);
      audio.volume = 0.9;
      audioRef.current = audio;
    }
    audio.currentTime = 0;
    audio.play().catch(() => {});
    sessionStorage.setItem(PLAYED_KEY, "1");
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleManualPlay}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-primary/40 bg-background/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur transition hover:bg-primary hover:text-primary-foreground animate-in fade-in slide-in-from-bottom-4"
      aria-label="Play welcome back sound"
    >
      <Volume2 className="h-4 w-4" />
      Play music
    </button>
  );
};

export default WelcomeBackSound;
