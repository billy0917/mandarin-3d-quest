
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

// Global AudioContext for sound effects
let globalAudioContext: AudioContext | null = null;
let audioUnlocked = false;

// Azure Speech synthesizer (singleton)
let speechSynthesizer: SpeechSDK.SpeechSynthesizer | null = null;

// Detect if running on iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Initialize Azure Speech Synthesizer with Mandarin Chinese voice
const initAzureSpeech = () => {
  if (speechSynthesizer) return speechSynthesizer;

  const subscriptionKey = import.meta.env.VITE_AZURE_SPEECH_KEY as string;
  const region = import.meta.env.VITE_AZURE_SPEECH_REGION as string;

  if (!subscriptionKey || !region) {
    console.error('Azure Speech credentials not found in environment variables');
    return null;
  }

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
  
  // High-quality Mandarin Chinese neural voice
  // Available voices:
  // - zh-CN-XiaoxiaoNeural (female, mainland Chinese)
  // - zh-CN-YunxiNeural (male, mainland Chinese)
  // - zh-TW-HsiaoChenNeural (female, Taiwan Mandarin)
  // - zh-TW-YunJheNeural (male, Taiwan Mandarin)
  speechConfig.speechSynthesisVoiceName = 'zh-CN-XiaoxiaoNeural';
  
  // For iOS Safari compatibility, use null audio config
  // We'll handle audio playback manually
  let audioConfig;
  if (isIOS()) {
    audioConfig = null; // Will return audio data instead of playing
  } else {
    audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
  }
  
  speechSynthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
  
  return speechSynthesizer;
};

// Initialize and unlock audio context (must be called from user interaction)
export const unlockAudio = async (): Promise<boolean> => {
  if (audioUnlocked) return true;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return false;

  try {
    if (!globalAudioContext) {
      globalAudioContext = new AudioContextClass();
    }

    // Resume context if suspended (required on mobile browsers)
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

    // Initialize Azure Speech SDK
    initAzureSpeech();

    audioUnlocked = true;
    return true;
  } catch (e) {
    console.error('Failed to unlock audio:', e);
    return false;
  }
};

// Speak Chinese text using Azure TTS
export const speakMandarin = async (text: string) => {
  if (!audioUnlocked) {
    await unlockAudio();
  }

  const synthesizer = initAzureSpeech();
  
  if (!synthesizer) {
    console.error('Azure Speech Synthesizer not available - check environment variables');
    return;
  }

  // iOS Safari requires special handling
  if (isIOS()) {
    // For iOS: Get audio data and play via HTML5 Audio element
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          console.log('✓ Azure TTS completed:', text);
          
          // Convert audio data to blob and play
          const audioData = result.audioData;
          const blob = new Blob([audioData], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          
          audio.play().then(() => {
            console.log('✓ iOS audio playback started');
          }).catch((err) => {
            console.error('✗ iOS audio playback failed:', err);
          });
          
          // Clean up after playback
          audio.onended = () => {
            URL.revokeObjectURL(url);
          };
        } else {
          console.error('✗ Azure TTS failed:', result.errorDetails);
        }
      },
      (error) => {
        console.error('✗ Azure TTS error:', error);
      }
    );
  } else {
    // Non-iOS: Direct playback through Azure SDK
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          console.log('✓ Azure TTS completed:', text);
        } else {
          console.error('✗ Azure TTS failed:', result.errorDetails);
        }
      },
      (error) => {
        console.error('✗ Azure TTS error:', error);
      }
    );
  }
};

// Play success sound effect using Web Audio API
export const playCorrectSound = async () => {
  if (!audioUnlocked) {
    await unlockAudio();
  }

  if (!globalAudioContext) return;

  const oscillator = globalAudioContext.createOscillator();
  const gainNode = globalAudioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(globalAudioContext.destination);

  // High-pitched "ding" sound
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, globalAudioContext.currentTime); // A5
  oscillator.frequency.exponentialRampToValueAtTime(1760, globalAudioContext.currentTime + 0.1);

  // Fade out envelope
  gainNode.gain.setValueAtTime(0.5, globalAudioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, globalAudioContext.currentTime + 0.5);

  oscillator.start();
  oscillator.stop(globalAudioContext.currentTime + 0.5);
};



