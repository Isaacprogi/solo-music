import React, { useRef, useEffect, useState } from 'react';
import { Music } from 'lucide-react';

interface MusicDisplayProps {
  fileName: string;
}

const MusicDisplay: React.FC<MusicDisplayProps> = ({ fileName }) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      setShouldAnimate(textWidth > containerWidth);
    }
  }, [fileName]);

  return (
    <div className="flex items-center mt-4 gap-3 justify-center text-purple-300 w-full overflow-hidden">
      <Music size={20} className="flex-shrink-0" />
      <div ref={containerRef} className="relative overflow-hidden w-full max-w-md">
        <div className={`inline-block whitespace-nowrap ${shouldAnimate ? 'animate-marquee' : ''}`}>
          <span ref={textRef} className="text-lg font-semibold drop-shadow-lg px-4">
            {fileName}
          </span>
        </div>
        {shouldAnimate && (
          <>
            <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute top-0 right-0 w-6 h-full bg-gradient-to-l from-background to-transparent z-10" />
          </>
        )}
      </div>
    </div>
  );
};

export default MusicDisplay;