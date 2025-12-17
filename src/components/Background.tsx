import { useEffect } from "react";

interface BackgroundProps {
  bgImage: string;
  loaded: boolean;
  setLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Background({
  bgImage,
  setLoaded,
  loaded,
}: BackgroundProps) {
  useEffect(() => {
    const img = new Image();

    img.src = bgImage;

    img.onload = () => {
      setLoaded(true);
    };

    img.onerror = () => {
      console.error("Failed to load background image");
    };
  }, [bgImage]);

  return (
    <div className="absolute inset-0">
      {!loaded && (
        <div className="absolute inset-0 bg-black/40 animate-pulse z-0" />
      )}

      <div
        className={`absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: loaded ? `url(${bgImage})` : "none",
        }}
      />
    </div>
  );
}
