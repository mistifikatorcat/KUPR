"use client"

import { useEffect, useRef, useState } from "react";

type OscilloscopeProps = {
    analyser: AnalyserNode | null;
};




export function Oscilloscope({ analyser }: OscilloscopeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [level, setLevel] = useState(0);

    useEffect(() => {
        if (!analyser || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        analyser.fftSize = 1024;
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        let animationId = 0;

        let lastLevelUpdate = 0;
        let smoothedLevel = 0;

        const draw = () => {
            analyser.getByteTimeDomainData(dataArray);
            const now = performance.now();

            if (now - lastLevelUpdate >= 60) {
                let sumSquares = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const sample = (dataArray[i] - 128) / 128;
                    sumSquares += sample * sample;
                }

                const rms = Math.sqrt(sumSquares / bufferLength);

                const rawLevel = Math.min(99, rms * 200);

                smoothedLevel += (rawLevel - smoothedLevel) * 0.4;

                setLevel(Math.round(smoothedLevel));
                lastLevelUpdate = now;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#d6ff43"

            const visibleSamples = 512;
            let startIndex = 0;

            for (let i = 1; i < bufferLength - visibleSamples; i++) {
                if (dataArray[i - 1] < 128 && dataArray[i] >= 128) {
                    startIndex = i;
                    break;
                }
            }

            const sliceWidth = canvas.width / (visibleSamples - 1);

            for (let i = 0; i < visibleSamples; i++) {
                const value = dataArray[startIndex + i] / 128;
                const y = (value * canvas.height) / 2;
                const x = i * sliceWidth;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            animationId = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            cancelAnimationFrame(animationId);
        }

    }, [analyser]);

    const getLevelColor = (level: number): string => {
        if (level <= 30) return "#87d95b";
        if (level <= 55) return "#f5d547";
        if (level <= 70) return "#ff922b";
        return "#ff4545";
    };


    return (
        <div className="scope">
            <div className="scope__header">
                <span>OSC / CH 01</span>
                <span className="scope__level"
                    style={{ color: getLevelColor(level) }}>
                    LVL {String(level).padStart(2, "0")}
                </span>
            </div>

            <div className="scope__screen">
                <canvas
                    ref={canvasRef}
                    width={1000}
                    height={180}
                    className="scope__canvas"
                />
            </div>

            <div className="scope__vu">
                {Array.from({ length: 20 }, (_, index) => {
                    const threshold = Math.ceil(((index + 1) * 99) / 20);
                    const isActive = level >= threshold;

                    return (
                        <div
                            key={index}
                            className={`scope__led ${isActive ? "scope__led--active" : ""
                                }`}
                            style={{
                                color: isActive
                                    ? getLevelColor(threshold)
                                    : "#343a34",
                            }}
                        >
                            <div className="scope__led-bar" />
                            <div className="scope__led-bar" />
                        </div>
                    );

                })}
            </div>
            <div className="scope__footer">
                <span>TIME DOMAIN</span>
                <span>LIVE AUDIO</span>
            </div>
        </div>
    );
}