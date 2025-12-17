import { useRef, useState, useEffect } from "react";
import { get, set, del } from "idb-keyval";
import AudioVisualizer from "./components/AudioVisualizer";
import PlayerControls from "./components/PlayerControls";
import { Upload, Image as ImageIcon, RefreshCcw, Loader } from "lucide-react";
import BackgroundImage from "./assets/back.png";
import MusicDisplay from "./components/MusicDisplay";
import Background from "./components/Background";

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [bgImage, setBgImage] = useState<string>(BackgroundImage);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState(
    "Drop an audio file or click to upload"
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [audioLoading, setAudioLoading] = useState(true);
  const [backgroundLoaded, setBackgroundLoaded] = useState(true);

  const loading = imageLoading && audioLoading && backgroundLoaded === true;

  // Refs to clean up memory
  const currentAudioUrl = useRef<string | null>(null);
  const currentBgUrl = useRef<string | null>(null);

  // initial load of the data
  useEffect(() => {
    const loadImageData = async () => {
      try {
        setImageLoading(true);
        const savedBgBlob = await get("savedBgBlob");
        if (savedBgBlob) {
          const url = URL.createObjectURL(savedBgBlob);
          currentBgUrl.current = url;
          setBgImage(url);
        }
        setImageLoading(false);
      } catch (error: unknown) {
        setImageLoading(false);
        if (error instanceof Error) {
          console.log(error);
        }
      }
    };
    loadImageData();
  }, []);

  // initial load of the data
  useEffect(() => {
    const loadAudioData = async () => {
      setAudioLoading(true);
      try {
        const savedAudioBlob = await get("savedAudioBlob");
        const savedName = await get("savedFileName");
        if (savedAudioBlob) {
          const url = URL.createObjectURL(savedAudioBlob);
          currentAudioUrl.current = url;
          setAudioSrc(url);
          if (savedName) setFileName(savedName);
        }
        setAudioLoading(false);
      } catch (error: unknown) {
        setAudioLoading(false);
        if (error instanceof Error) {
          console.log(error);
        }
      }
    };
    loadAudioData();
  }, []);

  useEffect(() => {
    console.log(audioSrc);
  }, [audioSrc]);


  const saveCurrentTime = (time: number) => {
    localStorage.setItem("audioCurrentTime", time.toString());
  };

  const clearSavedTime = () => {
    localStorage.removeItem("audioCurrentTime");
  };

  const handleBgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
    
      if (currentBgUrl.current) URL.revokeObjectURL(currentBgUrl.current);

      const url = URL.createObjectURL(file);
      currentBgUrl.current = url;
      setBgImage(url);

   
      await set("savedBgBlob", file);
    }
  };

  
  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith("audio/")) return;

   
    if (currentAudioUrl.current) URL.revokeObjectURL(currentAudioUrl.current);

    const url = URL.createObjectURL(file);
    currentAudioUrl.current = url;

    setAudioSrc(url);
    setFileName(file.name);
    setIsPlaying(false);

   
    clearSavedTime();


    await set("savedAudioBlob", file);
    await set("savedFileName", file.name);
  };

  const resetAndUploadNew = async () => {
    setIsUploadModalOpen(true);
  };

  const performReset = async () => {
    if (currentAudioUrl.current) URL.revokeObjectURL(currentAudioUrl.current);

    await del("savedAudioBlob");
    await del("savedFileName");

    clearSavedTime();

    setFileName("Drop an audio file or click to upload");
    setAudioSrc(null);
    setCurrentTime(0);
    setIsPlaying(false);

    setIsUploadModalOpen(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      saveCurrentTime(audio.currentTime);
    };

    const setDur = () => setDuration(audio.duration || 0);

    const savedTime = localStorage.getItem("audioCurrentTime");
    if (savedTime && audio.readyState > 0) {
      const time = parseFloat(savedTime);
      if (!isNaN(time) && time < audio.duration) {
        audio.currentTime = time;
        setCurrentTime(time);
      }
    }

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setDur);
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", () => {
      if (!isRepeating) {
        setIsPlaying(false);
        setCurrentTime(0);
        clearSavedTime();
      }
    });

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setDur);
    };
  }, [audioSrc, isRepeating]);

  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.load();
      const savedTime = localStorage.getItem("audioCurrentTime");
      if (savedTime) {
        const time = parseFloat(savedTime);
        if (!isNaN(time)) {
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.currentTime = time;
            }
          }, 100);
        }
      }
    }
  }, [audioSrc]);

  const togglePlay = () =>
    isPlaying
      ? audioRef.current?.pause()
      : audioRef.current?.play().catch(() => {});

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      saveCurrentTime(time);
    }
  };

  const changeVolume = (vol: number) => {
    if (audioRef.current) audioRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? volume || 0.7 : 0;
    setIsMuted(!isMuted);
  };

  const handleReset = async () => {
    if (currentAudioUrl.current) URL.revokeObjectURL(currentAudioUrl.current);

    await del("savedAudioBlob");
    await del("savedFileName");

    clearSavedTime();
    setAudioSrc(null);
    setFileName("Drop an audio file or click to upload");
    setAudioSrc(null);
    setCurrentTime(0);
    setIsPlaying(false);
    currentAudioUrl.current = null;
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <Loader className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="relative bg-black min-h-screen w-full flex flex-col items-center justify-center text-white px-6 overflow-hidden">
      <Background
        loaded={backgroundLoaded}
        setLoaded={setBackgroundLoaded}
        bgImage={bgImage}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <div className="relative z-20 flex flex-col items-center w-full max-w-4xl">
        <audio
          key={audioSrc}
          ref={audioRef}
          src={audioSrc || undefined}
          preload="metadata"
          loop={isRepeating}
        />

        <div className="fixed flex items-center justify-between w-full top-0 p-4">
          {audioSrc && !loading && (
            <>
              <button
                onClick={resetAndUploadNew}
                className="bg-black/40 p-4 rounded-full hover:bg-black/60 transition"
              >
                <Upload size={18} />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="bg-black/40 p-4 rounded-full hover:bg-black/60 transition"
                >
                  <RefreshCcw size={18} />
                </button>
                <label className="bg-black/40 p-4 rounded-full hover:bg-black/60 cursor-pointer transition">
                  <ImageIcon size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgChange}
                    className="hidden"
                  />
                </label>
              </div>
            </>
          )}
        </div>

        {!audioSrc ? (
          <label
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="cursor-pointer mb-12 flex flex-col items-center justify-center w-full max-w-64 h-64 border-1 border-purple-500/50 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition-all"
          >
            <Upload className="w-16 h-16 text-purple-400 mb-4" />
             <p className="text-xl font-medium text-center">
                Drop an audio file here or click to upload
              </p>
            <input
              type="file"
              accept="audio/*"
              onChange={handleChange}
              className="hidden"
            />
          </label>
        ) : (
          <>
            <AudioVisualizer
              key={`visualizer-${audioSrc}`}
              audioRef={audioRef}
            />
            <PlayerControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              isRepeating={isRepeating}
              onPlayPause={togglePlay}
              onSeek={seek}
              onVolumeChange={changeVolume}
              onMuteToggle={toggleMute}
              onRepeatToggle={() => setIsRepeating(!isRepeating)}
            />
            <MusicDisplay fileName={fileName} />
          </>
        )}
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm">
          <div className="relative flex flex-col items-center jsutify-center backdrop-blur-lg rounded-3xl p-12  max-w-lg w-full mx-4">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 cursor-pointer flex items-center justify-center w-10 h-10 right-4 bg-black/40 p-4 rounded-full hover:bg-black/60 transition"
            >
              ×
            </button>

            <label
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) {
                  performReset().then(() =>
                    handleFile(e.dataTransfer.files[0])
                  );
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              className="cursor-pointer mb-12 flex flex-col items-center justify-center w-full max-w-64 h-64 border-1 border-purple-500/50 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition-all"
            >
              <Upload className="w-16 h-16 text-purple-400 mb-4" />
              <p className="text-xl font-medium text-center">
                Drop an audio file here or click to upload
              </p>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    performReset().then(() => handleFile(e.target.files![0]));
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
