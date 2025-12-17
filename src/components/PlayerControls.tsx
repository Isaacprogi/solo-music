import { Play, Pause, Volume2, VolumeX, Repeat } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isRepeating: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onRepeatToggle: () => void;
}

export default function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isRepeating,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onRepeatToggle,
}: PlayerControlsProps) {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full mt-4 max-w-xl rounded-[2rem] bg-black/40 border border-white/10 p-8 shadow-2xl backdrop-blur-sm">
      <div className="group relative mb-8">
        <div className="flex justify-between mb-2 px-1">
          <span className="text-xs font-medium tracking-wider text-white/50 tabular-nums">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs font-medium tracking-wider text-white/50 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute h-full bg-white transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={(e) => onSeek((Number(e.target.value) / 100) * duration)}
            className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Repeat Toggle (Left) */}
        <div className="flex items-center gap-4">
          <button
            onClick={onRepeatToggle}
            className={`transition-all duration-200 ${
              isRepeating
                ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Repeat size={20} />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onPlayPause}
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} className="ml-1" fill="currentColor" />
            )}
          </button>
        </div>

        <div className="group flex items-center transition-all duration-300 ease-in-out">
          <button
            onClick={onMuteToggle}
            className="text-white/60 hover:text-white transition-colors p-2"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>

          <div className="relative h-1 w-0 opacity-0 group-hover:w-24 group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-out overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute h-full bg-white"
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
