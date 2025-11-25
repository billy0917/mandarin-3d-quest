
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import QuizStation from './components/QuizStation';
import TeleportPad from './components/TeleportPad';
import Joystick from './components/Joystick'; // Import Joystick
import { Vector3, QuizData } from './types';
import { unlockAudio } from './utils/sound';
import './components/TouchMove'; // Register the joystick-controls component

// Define the quiz content based on user request
const QUIZ_DATA: QuizData[] = [
  // --- 原有的基礎 ---
  {
    id: 'station-01',
    question: 'Initials: Bo (Unaspirated)',
    chineseChar: '波', 
    pinyin: 'bō',
    shape: 'sphere',
    position: { x: 0, y: 0, z: -8 },
    options: [
      { id: 'opt-b', label: 'b', isCorrect: true },
      { id: 'opt-p', label: 'p', isCorrect: false },
    ]
  },
  {
    id: 'station-02',
    question: 'Tones: Ma (3rd Tone)',
    chineseChar: '馬',
    pinyin: 'mǎ',
    shape: 'box',
    position: { x: 8, y: 0, z: -8 },
    options: [
      { id: 'opt-ma3', label: 'mǎ', isCorrect: true },
      { id: 'opt-ma1', label: 'mā', isCorrect: false },
    ]
  },

  // --- 新增：聲母 Initials ---
  
  // 1. 唇音對比：P (送氣) vs B (不送氣)
  {
    id: 'station-03',
    question: 'Initials: Po (Aspirated)',
    chineseChar: '坡',
    pinyin: 'pō',
    shape: 'cone',
    position: { x: 16, y: 0, z: -8 },
    options: [
      { id: 'opt-p', label: 'p', isCorrect: true },
      { id: 'opt-b', label: 'b', isCorrect: false },
    ]
  },
  // 2. 唇齒音與舌根音：F vs H (常見方言混淆)
  {
    id: 'station-04',
    question: 'Initials: Fo',
    chineseChar: '佛',
    pinyin: 'fó',
    shape: 'cylinder',
    position: { x: 16, y: 0, z: -16 },
    options: [
      { id: 'opt-f', label: 'f', isCorrect: true },
      { id: 'opt-h', label: 'h', isCorrect: false },
    ]
  },
  // 3. 舌尖中音：T (送氣) vs D (不送氣)
  {
    id: 'station-05',
    question: 'Initials: Te',
    chineseChar: '特',
    pinyin: 'tè',
    shape: 'torus',
    position: { x: 8, y: 0, z: -16 },
    options: [
      { id: 'opt-t', label: 't', isCorrect: true },
      { id: 'opt-d', label: 'd', isCorrect: false },
    ]
  },
  // 4. 鼻音與邊音：N vs L (經典難點)
  {
    id: 'station-06',
    question: 'Initials: Ni (Nasal)',
    chineseChar: '你',
    pinyin: 'nǐ',
    shape: 'sphere',
    position: { x: 0, y: 0, z: -16 },
    options: [
      { id: 'opt-n', label: 'n', isCorrect: true },
      { id: 'opt-l', label: 'l', isCorrect: false },
    ]
  },
  
  // --- 新增：韻母 Finals & 複合韻母 ---

  // 5. 單韻母：E vs O
  {
    id: 'station-07',
    question: 'Finals: E sound',
    chineseChar: '餓',
    pinyin: 'è',
    shape: 'box',
    position: { x: -8, y: 0, z: -16 },
    options: [
      { id: 'opt-e', label: 'e', isCorrect: true },
      { id: 'opt-o', label: 'o', isCorrect: false },
    ]
  },
  // 6. 前後鼻音：an vs ang (山 vs 商)
  {
    id: 'station-08',
    question: 'Finals: Front Nasal (-an)',
    chineseChar: '山',
    pinyin: 'shān',
    shape: 'cone',
    position: { x: -8, y: 0, z: -24 },
    options: [
      { id: 'opt-an', label: 'an', isCorrect: true },
      { id: 'opt-ang', label: 'ang', isCorrect: false },
    ]
  },
  // 7. ü (魚) 的發音 - j/q/x 後省略兩點的規則
  {
    id: 'station-09',
    question: 'Finals: Ü sound (after Q)',
    chineseChar: '去',
    pinyin: 'qù',
    shape: 'cylinder',
    position: { x: 0, y: 0, z: -24 },
    options: [
      { id: 'opt-u', label: 'qù (ü sound)', isCorrect: true }, // pinyin寫作u，但讀ü
      { id: 'opt-oo', label: 'qù (u sound)', isCorrect: false },
    ]
  },

  // --- 新增：聲調 Tones ---

  // 8. 第一聲 (陰平) - High Flat
  {
    id: 'station-10',
    question: 'Tones: 1st Tone',
    chineseChar: '媽',
    pinyin: 'mā',
    shape: 'torus',
    position: { x: 8, y: 0, z: -24 },
    options: [
      { id: 'opt-1st', label: 'mā', isCorrect: true },
      { id: 'opt-4th', label: 'mà', isCorrect: false },
    ]
  },
  // 9. 第二聲 (陽平) - Rising
  {
    id: 'station-11',
    question: 'Tones: 2nd Tone',
    chineseChar: '魚',
    pinyin: 'yú',
    shape: 'sphere',
    position: { x: 16, y: 0, z: -24 },
    options: [
      { id: 'opt-2nd', label: 'yú', isCorrect: true },
      { id: 'opt-3rd', label: 'yǔ', isCorrect: false },
    ]
  },
  // 10. 第四聲 (去聲) - Falling
  {
    id: 'station-12',
    question: 'Tones: 4th Tone',
    chineseChar: '兔',
    pinyin: 'tù',
    shape: 'box',
    position: { x: 16, y: 0, z: -32 },
    options: [
      { id: 'opt-4th', label: 'tù', isCorrect: true },
      { id: 'opt-1st', label: 'tū', isCorrect: false },
    ]
  },

  // --- 新增：進階聲母 (Advanced Initials) ---

  // 11. 翹舌音 vs 平舌音：Zh vs Z
  {
    id: 'station-13',
    question: 'Initials: Zh (Retroflex)',
    chineseChar: '中',
    pinyin: 'zhōng',
    shape: 'cone',
    position: { x: 8, y: 0, z: -32 },
    options: [
      { id: 'opt-zh', label: 'zh', isCorrect: true },
      { id: 'opt-z', label: 'z', isCorrect: false },
    ]
  },
  // 12. 團音：Q (氣) vs Ch (吃)
  {
    id: 'station-14',
    question: 'Initials: Qi',
    chineseChar: '七',
    pinyin: 'qī',
    shape: 'cylinder',
    position: { x: 0, y: 0, z: -32 },
    options: [
      { id: 'opt-q', label: 'q', isCorrect: true },
      { id: 'opt-ch', label: 'ch', isCorrect: false },
    ]
  },
  // 13. 捲舌韻母：Er
  {
    id: 'station-15',
    question: 'Finals: Er (Retroflex)',
    chineseChar: '二',
    pinyin: 'èr',
    shape: 'torus',
    position: { x: -8, y: 0, z: -32 },
    options: [
      { id: 'opt-er', label: 'èr', isCorrect: true },
      { id: 'opt-e', label: 'è', isCorrect: false },
    ]
  }
];

// Teleport locations generation
const TELEPORT_PADS: Vector3[] = [];
for(let z = 0; z >= -35; z -= 5) { TELEPORT_PADS.push({ x: 0, y: 0, z: z }); }
for(let z = 0; z >= -35; z -= 8) { TELEPORT_PADS.push({ x: -8, y: 0, z: z }); }
for(let z = 0; z >= -35; z -= 8) { TELEPORT_PADS.push({ x: 8, y: 0, z: z }); }
for(let z = -8; z >= -35; z -= 8) { TELEPORT_PADS.push({ x: 16, y: 0, z: z }); }

// Distant Windmill Positions
const WINDMILL_POSITIONS: Vector3[] = [
    { x: -50, y: 0, z: -60 },
    { x: 50, y: 0, z: -60 },
    { x: -30, y: 0, z: -80 },
    { x: 30, y: 0, z: -80 },
    { x: 0, y: 0, z: -100 },
    { x: -60, y: 0, z: -40 },
    { x: 60, y: 0, z: -40 },
];

const Windmill: React.FC<{ position: Vector3, scale?: number }> = ({ position, scale = 2 }) => {
  const posStr = `${position.x} ${position.y} ${position.z}`;
  const scaleStr = `${scale} ${scale} ${scale}`;
  return (
    <a-entity position={posStr} scale={scaleStr}>
      <a-cylinder color="#78716c" height="15" radius-bottom="1" radius-top="0.4" position="0 7.5 0"></a-cylinder>
      <a-entity position="0 14 0.5" animation="property: rotation; to: 0 0 -360; loop: true; dur: 8000; easing: linear">
        <a-box color="#f5f5f4" width="1.2" height="12" depth="0.2" position="0 4 0"></a-box>
        <a-box color="#f5f5f4" width="1.2" height="12" depth="0.2" position="0 -4 0"></a-box>
        <a-box color="#f5f5f4" width="12" height="1.2" depth="0.2" position="4 0 0"></a-box>
        <a-box color="#f5f5f4" width="12" height="1.2" depth="0.2" position="-4 0 0"></a-box>
        <a-cylinder color="#44403c" radius="0.8" depth="0.4" rotation="90 0 0"></a-cylinder>
      </a-entity>
    </a-entity>
  );
};

// 3D Cloud Component
// Using clustered spheres with opacity to create soft-looking low-poly clouds
const Cloud: React.FC<{ position: Vector3, size?: number }> = ({ position, size = 1 }) => {
  const posStr = `${position.x} ${position.y} ${position.z}`;
  // Slow drifting animation
  const animTo = `${position.x + 2} ${position.y} ${position.z}`;
  
  return (
    <a-entity 
      position={posStr} 
      scale={`${size} ${size} ${size}`}
      animation={`property: position; to: ${animTo}; dir: alternate; dur: 20000; loop: true; easing: linear`}
    >
        <a-sphere position="0 0 0" radius="2" color="white" opacity="0.8" segments-width="8" segments-height="8"></a-sphere>
        <a-sphere position="1.5 0.5 0.5" radius="1.5" color="white" opacity="0.7" segments-width="8" segments-height="8"></a-sphere>
        <a-sphere position="-1.5 0.2 -0.5" radius="1.8" color="white" opacity="0.8" segments-width="8" segments-height="8"></a-sphere>
        <a-sphere position="0 1.2 0" radius="1.6" color="white" opacity="0.8" segments-width="8" segments-height="8"></a-sphere>
    </a-entity>
  );
};

// Generate some random cloud positions high up
const CLOUD_POSITIONS: Vector3[] = [];
for (let i = 0; i < 15; i++) {
    CLOUD_POSITIONS.push({
        x: (Math.random() * 100) - 50,
        y: 20 + Math.random() * 15,
        z: (Math.random() * 80) - 60
    });
}

const App: React.FC = () => {
  const [score, setScore] = useState(0);
  const [cameraPosition, setCameraPosition] = useState<Vector3>({ x: 0, y: 1.6, z: 0 });
  const [isReady, setIsReady] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);

  useEffect(() => {
    setIsReady(true);
    
    // Load SpeechSynthesis voices (some browsers need this)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Initial load
      window.speechSynthesis.getVoices();
      
      // Some browsers need the onvoiceschanged event
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  const handleStartGame = async () => {
    const success = await unlockAudio();
    setAudioReady(success);
    setShowAudioPrompt(false);
  };

  const handleTeleport = useCallback((targetPos: Vector3) => {
    setCameraPosition({ ...targetPos, y: 1.6 });
  }, []);

  const handleCorrectAnswer = useCallback(() => {
    setScore(prev => prev + 1);
  }, []);

  if (!isReady) return <div className="h-screen w-screen flex items-center justify-center bg-orange-700 text-white">Loading Sunset...</div>;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      
      {/* Audio Unlock Prompt (Mobile Fix) */}
      {showAudioPrompt && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-2xl shadow-2xl text-white text-center max-w-md mx-4">
            <h2 className="text-3xl font-bold mb-4">🎮 準備開始</h2>
            <p className="text-lg mb-6 opacity-90">
              點擊下方按鈕開始遊戲並啟用音效
            </p>
            <button
              onClick={handleStartGame}
              className="bg-white text-orange-600 font-bold text-xl px-8 py-4 rounded-xl hover:bg-orange-100 active:scale-95 transform transition-all shadow-lg pointer-events-auto"
            >
              開始遊戲 🚀
            </button>
          </div>
        </div>
      )}

      {/* 2D HUD Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 z-10 pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white shadow-lg">
            <h1 className="text-xl font-bold text-yellow-400">Mandarin 3D Quest</h1>
            <p className="text-sm opacity-80 mt-1">Left Stick: Move | Touch: Look</p>
            <p className="text-sm opacity-80">Tap objects to interact.</p>
            <div className="mt-2 text-2xl font-mono text-green-400">Score: {score} / {QUIZ_DATA.length}</div>
          </div>
        </div>
      </div>

      {/* Virtual Joystick */}
      <Joystick />

      {/* A-Frame Scene */}
      <a-scene
        embedded
        renderer="antialias: true; colorManagement: true;"
        loading-screen="dotsColor: white; backgroundColor: #c2410c"
      >
        <a-assets>
            <a-mixin id="teleport-hover" animation="property: scale; to: 1.2 1.2 1.2; dur: 200; startEvents: mouseenter" animation__leave="property: scale; to: 1 1 1; dur: 200; startEvents: mouseleave"></a-mixin>
        </a-assets>

        {/* 
            Environment: SUNSET VIBE
            - Fixed: Raised lightPosition.y to 0.5 to illuminate ground
            - Fixed: Brightened groundColors to avoid black rendering
        */}
        <a-entity environment="preset: forest; skyType: gradient; skyColor: #240d5e; horizonColor: #ff5e00; lighting: distant; lightPosition: -1 0.5 -1; groundTexture: noise; groundColor: #455e45; groundColor2: #5a7a5a; dressing: none; grid: none; playArea: 80"></a-entity>

        {/* Clouds */}
        {CLOUD_POSITIONS.map((pos, idx) => (
            <Cloud key={`cloud-${idx}`} position={pos} size={1.5 + Math.random()} />
        ))}

        {/* Distant Windmills */}
        {WINDMILL_POSITIONS.map((pos, idx) => (
          <Windmill key={`windmill-${idx}`} position={pos} />
        ))}

        {/* Player Rig */}
        <a-entity 
            id="rig" 
            position={`${cameraPosition.x} ${cameraPosition.y} ${cameraPosition.z}`}
            joystick-controls="speed: 0.15"
        >
          <a-camera 
            look-controls="reverseMouseDrag: true; reverseTouchDrag: true" 
            wasd-controls="acceleration: 100"
          >
             {/* Active Cursor (FPS Style) */}
             <a-entity
                cursor="fuse: false"
                raycaster="objects: .clickable; far: 20"
                position="0 0 -1"
                geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
                material="color: white; shader: flat; opacity: 0.8"
                animation__click="property: scale; startEvents: click; easing: easeInCubic; dur: 150; from: 0.1 0.1 0.1; to: 1 1 1"
                animation__fusing="property: scale; startEvents: fusing; easing: easeInCubic; dur: 1500; from: 1 1 1; to: 0.1 0.1 0.1"
                animation__mouseleave="property: scale; startEvents: mouseleave; easing: easeInCubic; dur: 500; to: 1 1 1"
             ></a-entity>
          </a-camera>
        </a-entity>

        {/* Quiz Stations */}
        {QUIZ_DATA.map((station) => (
          <QuizStation 
            key={station.id} 
            data={station} 
            onCorrect={handleCorrectAnswer} 
          />
        ))}

        {/* Teleport Pads */}
        {TELEPORT_PADS.map((pos, idx) => (
          <TeleportPad 
            key={`pad-${idx}`} 
            position={pos} 
            onTeleport={handleTeleport} 
          />
        ))}

      </a-scene>
    </div>
  );
};

export default App;
