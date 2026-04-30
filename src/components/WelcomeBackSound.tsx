import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import soundUrl from "@/assets/we_r_back.mp3";

const PLAYED_KEY = "soudflex.we-are-back-sound.played.v1";

const WelcomeBackSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(PLAYED_KEY)) return;

    const audio = new Audio(soundUrl);
    audio.preload = "auto";
    audio.volume = 0.9;
    audioRef.current = audio;

    const markPlayed = () => sessionStorage.setItem(PLAYED_KEY, "1");

    const timer = window.setTimeout(() => {
      audio
        .play()
        .then(() => markPlayed())
        .catch(() => setNeedsTap(true));
    }, 3000);

    return () => {
      window.clearTimeout(timer);
      audio.pause();
    };
  }, []);

  const handleTap = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio
      .play()
      .then(() => {
        sessionStorage.setItem(PLAYED_KEY, "1");
        setNeedsTap(false);
      })
      .catch(() => {});
  };

  if (!needsTap) return null;

  return (
    <button
      onClick={handleTap}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-primary/40 bg-background/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur transition hover:bg-primary hover:text-primary-foreground animate-in fade-in slide-in-from-bottom-4"
      aria-label="Play welcome back sound"
    >
      <Volume2 className="h-4 w-4" />
      Tap to play
    </button>
  );
};

export default WelcomeBackSound;
