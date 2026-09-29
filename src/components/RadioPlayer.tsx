"use client"

import { useRef, useState, useEffect } from "react"

import { tracks } from "@/data/tracks";


const currentTrack = tracks[0]



type PlayerState = 'idle' | 'connecting' | 'playing' | 'error'



export function RadioPlayer() {
    const audioRef = useRef<HTMLAudioElement>(null)



    const [playerState, setPlayerState] = useState<PlayerState>("idle")

    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

    const currentTrack = tracks[currentTrackIndex];

    const handleNextTrack = () => {
  setCurrentTrackIndex((index) => (index + 1) % tracks.length);
};

    const isPlaying = playerState === "playing"

    

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
        const audio = audioRef.current

         if (!audio) {
        return
    }

    if (!audio.paused) {
      audio.pause();
      setPlayerState("idle");

      return;
    }

    try {
        setPlayerState("connecting")
    
        await audio.play()
        } catch (error) {
            console.log({
  trackSrc: currentTrack.src,
  audioSrc: audioRef.current?.src,
  currentSrc: audioRef.current?.currentSrc,
  readyState: audioRef.current?.readyState,
  networkState: audioRef.current?.networkState,
});
            console.error("Unable to start broadcast:", error)
            setPlayerState("error")
        }
    }

  

    return(
        <div className="player">
            <audio
                 ref={audioRef}
                src={currentTrack.src}
                loop
                preload="none"
                onPlaying={() => setPlayerState("playing")}
                onWaiting={() => setPlayerState("connecting")}
                onError={() => setPlayerState("error")}

                  onEnded={handleNextTrack}
                  onCanPlay={() => {
                    if (isPlaying) {
                    audioRef.current?.play().catch(console.error);
                    }
                }}
                />
                 <button className="player__button" type="button" onClick={togglePlayback}>
        <span>{isPlaying ? "DISCONNECT" : "TUNE IN"}</span>
        <span>{isPlaying ? "■" : "▶"}</span>
      </button>

      <button type="button" onClick={handleNextTrack}>
  Next
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