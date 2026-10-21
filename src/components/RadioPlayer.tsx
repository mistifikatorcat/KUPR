"use client";

import React, { useRef, useState } from "react";


type PlayerState = "idle" | "playing" | "connecting" | "error";

const STREAM_URL = "http://57.129.178.112/listen/kotik_underground_pirate_radio_(kupr_133.7)/radio.mp3";

export function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");

  const isPlaying = playerState === "playing";


  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return
    }

    try {
      setPlayerState("connecting");
      await audio.play();
    } catch (error) {
      console.error("Unable to connect", error);
      setPlayerState("error");
    }
  };

  return (
    <div className="player">
      <audio
        ref={audioRef}
        src={STREAM_URL}
        preload="none"
        onPlaying={() => setPlayerState("playing")}
        onPause={() => setPlayerState("idle")}
        onWaiting={() => setPlayerState("connecting")}
        onError={() => setPlayerState("error")}
      />
      <button
        className="player__button"
        type="button"
        onClick={togglePlayback}
      >
        <span>
          {isPlaying ? "DISCONNECT" : "TUNE IN"}
        </span>
        <span>{isPlaying ? "■" : "▶"}</span>
      </button>

      <span className="player__state">
        {playerState === "idle" && "RECEIVER IDLE"}
        {playerState === "connecting" && "CONNECTING..."}
        {playerState === "playing" && "SIGNAL LOCKED"}
        {playerState === "error" && "SIGNAL LOST"}
      </span>
    </div>
  )
}