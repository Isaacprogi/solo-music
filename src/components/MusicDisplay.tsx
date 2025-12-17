import React from 'react';
import { Music } from 'lucide-react';

interface MusicDisplayProps {
  fileName: string;
}

const MusicDisplay: React.FC<MusicDisplayProps> = ({ fileName }) => {
  return (
    <div className="flex items-center mt-4 gap-3 justify-center text-purple-300 w-full overflow-hidden">
      {/* Icon - remains static */}
      <Music size={20} className="flex-shrink-0" />

      {/* Animated Text Container */}
      <div className="relative flex overflow-hidden max-w-md">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-lg font-semibold drop-shadow-lg px-4">
            {fileName}
          </span>
          {/* Duplicate text to create a seamless loop */}
          <span className="text-lg font-semibold drop-shadow-lg px-4">
            {fileName}
          </span>
        </div>
      </div>

    
    </div>
  );
};

export default MusicDisplay;