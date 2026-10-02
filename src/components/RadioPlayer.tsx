"use client";

import { useEffect, useRef, useState } from "react";
import type { Track } from "@/types/track";

type PlayerState = "idle" | "connecting" | "playing" | "error";

type RadioPlayerProps = {
  currentTrack: Track;
  onNextTrack: () => void;
};

export function RadioPlayer({
  currentTrack,
  onNextTrack,
}: RadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [playerState, setPlayerState] =
    useState<PlayerState>("idle");

  const isPlaying = playerState === "playing";

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !isPlaying) return;

    audio.play().catch((error) => {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    });
  }, [currentTrack.src, isPlaying]);

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setPlayerState("idle");
      return;
    }

    try {
      setPlayerState("connecting");
      await audio.play();
    } catch (error) {
      console.error("Unable to start broadcast:", error);
      setPlayerState("error");
    }
  };

  return (
    <div className="player">
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="none"
        onPlaying={() => setPlayerState("playing")}
        onWaiting={() => setPlayerState("connecting")}
        onError={() => setPlayerState("error")}
        onEnded={onNextTrack}
      />

      <button
        className="player__button"
        type="button"
        onClick={togglePlayback}
      >
        <span>{isPlaying ? "DISCONNECT" : "TUNE IN"}</span>
        <span>{isPlaying ? "■" : "▶"}</span>
      </button>

      <button type="button" onClick={onNextTrack}>
        Next
      </button>

      <span className="player__state">
        {playerState === "idle" && "RECEIVER IDLE"}
        {playerState === "connecting" && "CONNECTING..."}
        {playerState === "playing" && "SIGNAL LOCKED"}
        {playerState === "error" && "SIGNAL LOST"}
      </span>
    </div>
  );
}