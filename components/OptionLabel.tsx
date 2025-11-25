
import React, { useMemo } from 'react';

interface OptionLabelProps {
  text: string;
  position?: string;
}

const OptionLabel: React.FC<OptionLabelProps> = ({ text, position = "0 0 0" }) => {
  const textureSrc = useMemo(() => {
    const canvas = document.createElement('canvas');
    // Width/Height ratio 2:1 for short text
    canvas.width = 512;
    canvas.height = 256; 
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Clear background (transparent)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Text Configuration
      // Use a broad font stack to ensure special characters (tones) render on mobile
      ctx.font = 'bold 100px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Black outline for better visibility against backgrounds
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

      // White text fill
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    
    return canvas.toDataURL('image/png');
  }, [text]);

  return (
    <a-image 
      src={textureSrc} 
      position={position}
      width="2" 
      height="1"
      transparent="true"
      alpha-test="0.5"
      side="double"
    ></a-image>
  );
};

export default OptionLabel;
