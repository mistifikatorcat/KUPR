"use client";

import { useState, useEffect, useRef } from "react";

import { RadioPlayer } from "@/components/RadioPlayer";

import { Oscilloscope } from "@/components/Oscilloscope";



type NowPlaying = {
  artist: string;
  title: string;
  listeners: number;
  isOnline: boolean;
  bitrate: number | null;
};


export default function Home() {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [metadataError, setMetadataError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [keepAwake, setKeepAwake] = useState(true);

  const artistRef = useRef<HTMLHeadingElement>(null);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };



  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchNowPlaying = async () => {
      try {
        const response = await fetch("/api/now-playing", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to fetch station data");
        }

        const data: NowPlaying = await response.json();

        if (active) {
          setNowPlaying(data);
          setMetadataError(false);
        }
      } catch (error) {
        console.error(error);
        if (active) {
          setNowPlaying(null);
          setMetadataError(true);
        }
      }
    };


    void fetchNowPlaying();

    const interval = setInterval(() => {
      void fetchNowPlaying();
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const artist = nowPlaying?.isOnline
    ? nowPlaying.artist
    : "KUPR";

  const isLongArtist = artist.length > 25;

  useEffect(() => {
    if (nowPlaying?.isOnline) {
      document.title =
        `KUPR 133.7 | ${nowPlaying.artist} — ${nowPlaying.title}`;
    } else {
      document.title = "KUPR 133.7";
    }
  }, [nowPlaying]);

  useEffect(() => {
    if (!isPlaying || !keepAwake) return;

    if (!("wakeLock" in navigator)) {
      console.warn("Wake Lock is not supported");
      return;
    }

    let wakeLock: WakeLockSentinel | null = null;
    let requesting = false;
    let cancelled = false;

    const acquireWakeLock = async () => {
      if (
        cancelled ||
        requesting ||
        wakeLock ||
        document.visibilityState !== "visible"
      ) {
        return;
      }

      requesting = true;

      try {
        const lock = await navigator.wakeLock.request("screen");

        if (cancelled || document.visibilityState !== "visible") {
          await lock.release();
          return;
        }

        wakeLock = lock;
        console.log("Wake Lock acquired");

        lock.addEventListener("release", () => {
          if (wakeLock === lock) {
            wakeLock = null;
          }
          console.log("Wake Lock released");
        });
      } catch (error) {
        console.warn("Wake Lock failed:", error);
      } finally {
        requesting = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void acquireWakeLock();
      } else {
        const lock = wakeLock;
        wakeLock = null;
        void lock?.release();
      }
    };

    void acquireWakeLock();

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      cancelled = true;

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      void wakeLock?.release();
    };
  }, [isPlaying, keepAwake]);

  useEffect(() => {
    const element = artistRef.current;

    if (!element || isLongArtist) return;

    const fitText = () => {
      // Сбрасываем размер до исходного
      element.style.fontSize = "";

      const availableWidth = element.clientWidth;
      const textWidth = element.scrollWidth;

      if (textWidth > availableWidth && availableWidth > 0) {
        const originalSize = parseFloat(
          getComputedStyle(element).fontSize
        );

        const ratio = availableWidth / textWidth;

        element.style.fontSize =
          `${Math.max(28, Math.floor(originalSize * ratio * 0.98))}px`;
      }
    };

    fitText();

    const observer = new ResizeObserver(fitText);
    observer.observe(element.parentElement!);

    return () => observer.disconnect();
  }, [artist, isLongArtist]);

  return (
    <main className="station">
      <header className="station__header">
        <div className="station__identity">
          <span className="station__name">KUPR</span>
          <span className="station__frequency">STREAM 01</span>
        </div>

        <div className="station__status">
          <span className="station__status-dot" />
          {metadataError
            ? "STATUS UNKNOWN"
            : !nowPlaying
              ? "CONNECTING..."
              : nowPlaying.isOnline
                ? "TRANSMISSION ACTIVE"
                : "STATION OFFLINE"}
        </div>
        <button
          type="button"
          className="station__fullscreen"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
        </button>
      </header>

      <section className="station__content">
        <div className="station__broadcast">
          <p className="station__eyebrow">NOW TRANSMITTING</p>

          <h1
            ref={artistRef}
            className={`station__artist ${!isLongArtist ? "station__artist--single" : ""
              }`}
            title={artist}
            style={isLongArtist ? {
              fontSize: "clamp(30px, 3vw, 52px)",
              lineHeight: 1.05,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
              overflow: "hidden",
              overflowWrap: "anywhere",
            } : undefined}
          >
            {artist}
          </h1>
          <p className="station__track">
            {nowPlaying?.isOnline
              ? nowPlaying.title
              : "OFF AIR"}
          </p>

          <RadioPlayer
            onAnalyserReady={setAnalyser}
            onPlaybackChange={setIsPlaying}
          />
          <label className="station__awake">
            <input
              type="checkbox"
              checked={keepAwake}
              onChange={(event) => setKeepAwake(event.target.checked)}
            />
            KEEP DISPLAY ON
          </label>
        </div>

        <div className="station__visualizer" >
          <Oscilloscope analyser={analyser} />
        </div>
      </section>

      <footer className="station__footer">
        <span>KOTIK UNDERGROUND PIRATE RADIO</span>

        <div>
          <span>{nowPlaying?.bitrate ?? "—"} KBPS</span>
          <span>STEREO</span>
          <span>{nowPlaying?.listeners ?? "—"} LISTENERS</span>
        </div>
      </footer>
    </main>
  );
}