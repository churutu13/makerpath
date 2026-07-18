let audioContext: AudioContext | null = null;

export type JarvisSound = "boot" | "wake" | "success" | "error" | "listening";

const soundProfiles: Record<JarvisSound, { from: number; to: number; duration: number; volume: number }> = {
  boot: { from: 330, to: 520, duration: .32, volume: .035 },
  wake: { from: 520, to: 760, duration: .2, volume: .05 },
  listening: { from: 690, to: 610, duration: .14, volume: .032 },
  success: { from: 580, to: 820, duration: .18, volume: .038 },
  error: { from: 290, to: 190, duration: .22, volume: .035 },
};

export function playJarvisSound(type: JarvisSound, enabled = true, masterVolume = 1) {
  if (!enabled || masterVolume <= 0 || typeof window === "undefined") return;
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  audioContext ??= new Context();
  void audioContext.resume().catch(() => undefined);
  const profile = soundProfiles[type];
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(profile.from, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(profile.to, audioContext.currentTime + profile.duration * .8);
  gain.gain.setValueAtTime(.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(profile.volume * Math.min(1, masterVolume), audioContext.currentTime + .025);
  gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + profile.duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + profile.duration + .01);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
