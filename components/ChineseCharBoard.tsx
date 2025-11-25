
import React, { useMemo } from 'react';

interface ChineseCharBoardProps {
  char: string;
  pinyin: string;
  position?: string;
}

const ChineseCharBoard: React.FC<ChineseCharBoardProps> = ({ char, pinyin, position = "0 0 0" }) => {
  // Generate a data URL for the Chinese character using a Canvas
  // This avoids A-Frame MSDF font limitation for CJK characters
  const textureSrc = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 512, 512);
      
      // Border
      ctx.strokeStyle = '#1E3A8A';
      ctx.lineWidth = 20;
      ctx.strokeRect(10, 10, 492, 492);

      // Chinese Char
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 250px "Noto Sans SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 256, 220);

      // Pinyin
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 80px sans-serif';
      ctx.fillText(pinyin, 256, 400);
    }
    
    return canvas.toDataURL('image/png');
  }, [char, pinyin]);

  return (
    <a-entity position={position}>
      <a-image 
        src={textureSrc} 
        width="3" 
        height="3"
        side="double"
      ></a-image>
    </a-entity>
  );
};

export default ChineseCharBoard;
