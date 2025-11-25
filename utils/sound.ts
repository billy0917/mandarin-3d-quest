
export const speakMandarin = (text: string) => {
  // Use Google Translate TTS API for natural, accurate Mandarin pronunciation
  // This is much better than the robotic default browser synthesis
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=zh-CN&q=${encodeURIComponent(text)}`;
  
  const audio = new Audio(url);
  audio.play().catch(e => console.error("Audio play failed", e));
};

export const playCorrectSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // A nice high pitched "Ding" (Sine wave)
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
  oscillator.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // Slide up slightly

  // Envelope for the sound (fade out)
  gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.5);
};
