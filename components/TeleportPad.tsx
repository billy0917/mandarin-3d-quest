
import React, { useState } from 'react';
import { Vector3 } from '../types';

interface TeleportPadProps {
  position: Vector3;
  onTeleport: (newPos: Vector3) => void;
}

const TeleportPad: React.FC<TeleportPadProps> = ({ position, onTeleport }) => {
  const [hovered, setHovered] = useState(false);

  const posStr = `${position.x} ${0.05} ${position.z}`;

  return (
    <a-entity position={posStr}>
       {/* Visual Cylinder */}
      <a-cylinder
        radius="0.5"
        height="0.1"
        color={hovered ? "#FACC15" : "#3B82F6"} // Yellow on hover, Blue default
        opacity="0.8"
        className="clickable"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onTeleport(position)}
      ></a-cylinder>
      
      {/* Icon or Text indicating move */}
      <a-ring 
        radius-inner="0.3" 
        radius-outer="0.35" 
        color="#FFFFFF" 
        rotation="-90 0 0" 
        position="0 0.06 0"
      ></a-ring>
      
      {/* Footprint-like visual logic (simplified as two small ovals) */}
      <a-circle radius="0.1" position="-0.15 0.06 0" rotation="-90 0 0" color="white"></a-circle>
      <a-circle radius="0.1" position="0.15 0.06 0" rotation="-90 0 0" color="white"></a-circle>

      <a-animation 
        attribute="position" 
        to={`0 0.1 0`} 
        direction="alternate" 
        dur="2000" 
        repeat="indefinite"
      ></a-animation>
    </a-entity>
  );
};

export default TeleportPad;
