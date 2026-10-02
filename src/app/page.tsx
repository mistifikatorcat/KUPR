"use client";

import { useState } from "react";

import { RadioPlayer } from "@/components/RadioPlayer";
import { tracks } from "@/data/tracks";

export default function Home() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const currentTrack = tracks[currentTrackIndex];

  const handleNextTrack = () => {
    setCurrentTrackIndex((index) => (index + 1) % tracks.length);
  };

  return (
    <main className="station">
      <header className="station__header">
        <div className="station__identity">
          <span className="station__name">KUPR</span>
          <span className="station__frequency">STREAM 01</span>
        </div>

        <div className="station__status">
          <span className="station__status-dot" />
          TRANSMISSION ACTIVE
        </div>
      </header>

      <section className="station__content">
        <div className="station__broadcast">
          <p className="station__eyebrow">NOW TRANSMITTING</p>

          <h1 className="station__artist">
            {currentTrack.artist}
          </h1>

          <p className="station__track">
            {currentTrack.title}
          </p>

          <RadioPlayer
            currentTrack={currentTrack}
            onNextTrack={handleNextTrack}
          />
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
          <span>192 KBPS</span>
          <span>STEREO</span>
          <span>4 LISTENERS</span>
        </div>
      </footer>
    </main>
  );
}