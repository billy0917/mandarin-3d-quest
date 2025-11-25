
// Global AudioContext singleton for better mobile compatibility
let globalAudioContext: AudioContext | null = null;
let audioUnlocked = false;

// Initialize and unlock audio context (must be called from user interaction)
export const unlockAudio = async (): Promise<boolean> => {
  if (audioUnlocked) return true;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return false;

  try {
    if (!globalAudioContext) {
      globalAudioContext = new AudioContextClass();
    }

    // Resume context if suspended (required on mobile)
    if (globalAudioContext.state === 'suspended') {
      await globalAudioContext.resume();
    }

    // Play a silent sound to unlock audio on iOS/mobile
    const oscillator = globalAudioContext.createOscillator();
    const gainNode = globalAudioContext.createGain();
    gainNode.gain.value = 0.001; // Nearly silent
    oscillator.connect(gainNode);
    gainNode.connect(globalAudioContext.destination);
    oscillator.start(0);
    oscillator.stop(globalAudioContext.currentTime + 0.1);

    audioUnlocked = true;
    return true;
  } catch (e) {
    console.error('Failed to unlock audio:', e);
    return false;
  }
};

export const speakMandarin = async (text: string) => {
  // Ensure audio is unlocked
  if (!audioUnlocked) {
    await unlockAudio();
  }

  // Use Google Translate TTS API for natural, accurate Mandarin pronunciation
  // This is much better than the robotic default browser synthesis
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=zh-CN&q=${encodeURIComponent(text)}`;
  
  const audio = new Audio(url);
  audio.play().catch(e => console.error("Audio play failed", e));
};

export const playCorrectSound = async () => {
  // Ensure audio is unlocked
  if (!audioUnlocked) {
    await unlockAudio();
  }

  if (!globalAudioContext) return;

  const oscillator = globalAudioContext.createOscillator();
  const gainNode = globalAudioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(globalAudioContext.destination);

  // A nice high pitched "Ding" (Sine wave)
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, globalAudioContext.currentTime); // A5
  oscillator.frequency.exponentialRampToValueAtTime(1760, globalAudioContext.currentTime + 0.1); // Slide up slightly

  // Envelope for the sound (fade out)
  gainNode.gain.setValueAtTime(0.5, globalAudioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, globalAudioContext.currentTime + 0.5);

  oscillator.start();
  oscillator.stop(globalAudioContext.currentTime + 0.5);
};

