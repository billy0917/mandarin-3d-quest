
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

// Global AudioContext for sound effects
let globalAudioContext: AudioContext | null = null;
let audioUnlocked = false;

// Track current audio playback for immediate cancellation
let currentAudio: HTMLAudioElement | null = null;

// Detect if running on iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Get Azure Speech Config (create fresh each time to avoid queuing)
const getAzureSpeechConfig = () => {
  const subscriptionKey = import.meta.env.VITE_AZURE_SPEECH_KEY as string;
  const region = import.meta.env.VITE_AZURE_SPEECH_REGION as string;

  if (!subscriptionKey || !region) {
    console.error('Azure Speech credentials not found in environment variables');
    return null;
  }

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
  
  // High-quality Mandarin Chinese neural voice
  speechConfig.speechSynthesisVoiceName = 'zh-CN-XiaoxiaoNeural';
  
  return speechConfig;
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

    audioUnlocked = true;
    return true;
  } catch (e) {
    console.error('Failed to unlock audio:', e);
    return false;
  }
};

// Stop any currently playing audio
const stopCurrentAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

// Speak Chinese text using Azure TTS (creates new synthesizer each time to avoid queuing)
export const speakMandarin = async (text: string) => {
  if (!audioUnlocked) {
    await unlockAudio();
  }

  // Stop any currently playing audio immediately
  stopCurrentAudio();

  const speechConfig = getAzureSpeechConfig();
  
  if (!speechConfig) {
    console.error('Azure Speech config not available - check environment variables');
    return;
  }

  // Create a fresh synthesizer for each call to avoid queuing issues
  let audioConfig;
  if (isIOS()) {
    audioConfig = null; // Will return audio data for manual playback
  } else {
    audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
  }
  
  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

  // iOS Safari requires special handling
  if (isIOS()) {
    // For iOS: Get audio data and play via HTML5 Audio element
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          console.log('✓ Azure TTS completed:', text);
          
          // Convert audio data to blob and play immediately
          const audioData = result.audioData;
          const blob = new Blob([audioData], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          
          // Track current audio for cancellation
          currentAudio = audio;
          
          audio.play().then(() => {
            console.log('✓ iOS audio playback started');
          }).catch((err) => {
            console.error('✗ iOS audio playback failed:', err);
          });
          
          // Clean up after playback
          audio.onended = () => {
            URL.revokeObjectURL(url);
            if (currentAudio === audio) {
              currentAudio = null;
            }
          };
        } else {
          console.error('✗ Azure TTS failed:', result.errorDetails);
        }
        // Clean up synthesizer
        synthesizer.close();
      },
      (error) => {
        console.error('✗ Azure TTS error:', error);
        synthesizer.close();
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
        // Clean up synthesizer
        synthesizer.close();
      },
      (error) => {
        console.error('✗ Azure TTS error:', error);
        synthesizer.close();
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



