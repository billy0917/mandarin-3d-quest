
import React, { useState, useRef, useEffect } from 'react';
import { QuizData, QuizOption } from '../types';
import ChineseCharBoard from './ChineseCharBoard';
import OptionLabel from './OptionLabel'; // New component
import { speakMandarin, playCorrectSound } from '../utils/sound';

interface QuizStationProps {
  data: QuizData;
  onCorrect: () => void;
}

const QuizStation: React.FC<QuizStationProps> = ({ data, onCorrect }) => {
  const [answered, setAnswered] = useState<boolean>(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const handleInteraction = (isCorrect: boolean, optionId: string) => {
    if (answered) return;
    
    setAnswered(true);
    setSelectedOptionId(optionId);
    
    if (isCorrect) {
      playCorrectSound();
      speakMandarin("正确"); // Say "Correct" in Chinese
      onCorrect();
    } else {
        speakMandarin("错误"); // Say "Wrong"
    }
  };

  const handleSpeakQuestion = () => {
    speakMandarin(data.chineseChar);
  };

  const getColor = (optionId: string, isCorrect: boolean) => {
    if (!answered) return "#FFFFFF"; // Default white
    if (optionId === selectedOptionId) {
      return isCorrect ? "#4ADE80" : "#EF4444"; // Green if correct, Red if wrong
    }
    return "#FFFFFF";
  };

  const posStr = `${data.position.x} ${data.position.y} ${data.position.z}`;

  // Helper to render the correct 3D shape based on configuration
  const renderShape = (option: QuizOption) => {
    const color = getColor(option.id, option.isCorrect);
    const clickHandler = () => handleInteraction(option.isCorrect, option.id);
    const commonProps = {
        color: color,
        className: "clickable",
        onClick: clickHandler
    };

    switch (data.shape) {
        case 'sphere':
            return <a-sphere radius="0.4" {...commonProps}></a-sphere>;
        case 'box':
            return <a-box width="0.6" height="0.6" depth="0.6" {...commonProps}></a-box>;
        case 'cone':
            return <a-cone radius-bottom="0.4" height="0.8" {...commonProps}></a-cone>;
        case 'cylinder':
            return <a-cylinder radius="0.3" height="0.8" {...commonProps}></a-cylinder>;
        case 'torus':
            return <a-torus radius="0.3" radius-tubular="0.08" {...commonProps}></a-torus>;
        default:
            return <a-box width="0.6" height="0.6" depth="0.6" {...commonProps}></a-box>;
    }
  };

  return (
    <a-entity position={posStr}>
      
      {/* Main Board Container - Floating high - Includes Pole so they rotate together */}
      <a-entity position="0 3.2 0" look-at="#camera">
        
        {/* White Backing Plate - prevents transparency bleed-through */}
        <a-plane position="0 0 -0.05" width="3" height="3" color="white"></a-plane>

        {/* Structural Pole - Moved further back (-0.3) */}
        <a-cylinder 
          position="0 -1.2 -0.3" 
          height="4" 
          radius="0.15" 
          color="#5D4037"
        ></a-cylinder>

        <ChineseCharBoard char={data.chineseChar} pinyin={data.pinyin} />
        
        {/* Audio Button */}
        {/* FIX: Move className and onClick to the a-circle geometry so raycaster can hit it */}
        <a-entity position="1.8 0 0">
             <a-circle 
                color="#FACC15" 
                radius="0.3"
                className="clickable"
                onClick={handleSpeakQuestion}
             ></a-circle>
             <a-image src="https://cdn-icons-png.flaticon.com/512/727/727269.png" width="0.4" height="0.4" position="0 0 0.01"></a-image>
             <a-text value="LISTEN" align="center" color="black" width="3" position="0 -0.5 0"></a-text>
        </a-entity>
      </a-entity>

      {/* Options Container - Forward and Lower */}
      <a-entity position="0 1.3 0.8" look-at="#camera">
          {/* Option 1 (Left) */}
          <a-entity position="-1.2 0 0">
            {renderShape(data.options[0])}
            <OptionLabel 
              text={data.options[0].label} 
              position="0 0.8 0"
            />
          </a-entity>

          {/* Option 2 (Right) */}
          <a-entity position="1.2 0 0">
            {renderShape(data.options[1])}
            <OptionLabel 
              text={data.options[1].label} 
              position="0 0.8 0"
            />
          </a-entity>
      </a-entity>

    </a-entity>
  );
};

export default QuizStation;
