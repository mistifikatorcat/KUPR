"use client";

import { useState, useEffect } from "react";

import { RadioPlayer } from "@/components/RadioPlayer";

type NowPlaying = {
  artist: string;
  title: string;
  listeners: number;
  isOnline: boolean;
  bitrate: number | null;
};


export default function Home() {
  // const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // const currentTrack = tracks[currentTrackIndex];

  // const handleNextTrack = () => {
  //   setCurrentTrackIndex((index) => (index + 1) % tracks.length);
  // };

  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

  const [metadataError, setMetadataError] = useState(false);

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
      </header>

      <section className="station__content">
        <div className="station__broadcast">
          <p className="station__eyebrow">NOW TRANSMITTING</p>

          <h1 className="station__artist">
            {nowPlaying?.isOnline
              ? nowPlaying.artist
              : "KUPR"}
          </h1>

          <p className="station__track">
            {nowPlaying?.isOnline
              ? nowPlaying.title
              : "OFF AIR"}
          </p>

          <RadioPlayer />
        </div>

        <div className="station__visualizer" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, index) => (
            <span
              key={index}
              style={
                {
                  "--i": index,
                } as React.CSSProperties
              }
            />
          ))}
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