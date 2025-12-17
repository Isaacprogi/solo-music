import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationIdRef = useRef<number>(0);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !canvasRef.current) return;

    // Initialize Audio Logic
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;

    if (!sourceRef.current) {
      sourceRef.current = audioContext.createMediaElementSource(audioEl);
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContext.destination);
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyserRef.current!.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Create a modern gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, "purple");
        gradient.addColorStop(1, "white");

        ctx.fillStyle = gradient;

        const radius = 4;
        const y = canvas.height - barHeight;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth - 2, barHeight, [radius, radius, 0, 0]);
        } else {
          ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
        ctx.fill();

        x += barWidth;
      }
    };

    const handlePlay = () => {
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }
      draw();
    };

    const handlePause = () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };

    audioEl.addEventListener("play", handlePlay);
    audioEl.addEventListener("pause", handlePause);

    return () => {
      audioEl.removeEventListener("play", handlePlay);
      audioEl.removeEventListener("pause", handlePause);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [audioRef]);

  return (
    <div className=" bg-black/40 border backdrop-blur-sm border-white/10  shadow-lg rounded-full overflow-hidden">
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        style={{ display: "block" }}
      />
    </div>
  );
};

export default AudioVisualizer;
