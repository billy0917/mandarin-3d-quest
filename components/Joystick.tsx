
import React, { useEffect, useRef, useState } from 'react';

const Joystick: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Config
  const maxRadius = 50; // Max distance the stick can move from center

  useEffect(() => {
    // Initialize global vector
    window.JOYSTICK_VECTOR = { x: 0, y: 0 };
    return () => {
      window.JOYSTICK_VECTOR = { x: 0, y: 0 };
    };
  }, []);

  const handleStart = (e: React.MouseEvent | React.TouchEvent, clientX: number, clientY: number) => {
    // Prevent the tap from bubbling up to the A-Frame scene (which would fire the gun/cursor)
    e.stopPropagation(); 
    
    setActive(true);
    updateStick(clientX, clientY);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent, clientX: number, clientY: number) => {
    e.stopPropagation();
    if (!active) return;
    updateStick(clientX, clientY);
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setActive(false);
    setPosition({ x: 0, y: 0 });
    window.JOYSTICK_VECTOR = { x: 0, y: 0 };
  };

  const updateStick = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Clamp to max radius
    if (distance > maxRadius) {
      const angle = Math.atan2(deltaY, deltaX);
      deltaX = Math.cos(angle) * maxRadius;
      deltaY = Math.sin(angle) * maxRadius;
    }

    setPosition({ x: deltaX, y: deltaY });

    // Normalize -1 to 1 and invert Y because screen Y is down, but 3D forward is usually "up" on a stick
    const normX = deltaX / maxRadius;
    const normY = -(deltaY / maxRadius); // Invert Y: Up on screen is negative Y, but we want positive "Forward" value

    window.JOYSTICK_VECTOR = { x: normX, y: normY };
  };

  // Mouse Handlers
  const onMouseDown = (e: React.MouseEvent) => handleStart(e, e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleMove(e, e.clientX, e.clientY);
  const onMouseUp = (e: React.MouseEvent) => handleEnd(e);
  const onMouseLeave = (e: React.MouseEvent) => { if(active) handleEnd(e); };

  // Touch Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e, e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e, e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchEnd = (e: React.TouchEvent) => handleEnd(e);

  return (
    <div 
      className="absolute bottom-8 left-8 w-32 h-32 z-50 select-none touch-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Base */}
      <div 
        ref={containerRef}
        className="w-full h-full rounded-full bg-gray-800/50 border-2 border-white/30 backdrop-blur-sm flex items-center justify-center"
      >
        {/* Stick */}
        <div 
          ref={stickRef}
          className="w-12 h-12 rounded-full bg-white/80 shadow-lg"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: active ? 'none' : 'transform 0.2s ease-out'
          }}
        />
      </div>
    </div>
  );
};

export default Joystick;
