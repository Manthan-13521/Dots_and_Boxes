type SoundName = "line-hover" | "line-draw" | "box-capture" | "button-click" | "game-win" | "game-lose" | "game-start";

class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxVolume = 0.7;
  private musicVolume = 0.3;
  private masterVolume = 1;
  private muted = false;
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.ctx = new AudioContext();
    this.initialized = true;
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.3,
    rampDown = true,
  ) {
    if (this.muted || !this.ctx) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume * this.sfxVolume * this.masterVolume, ctx.currentTime);

    if (rampDown) {
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  private playSweep(from: number, to: number, duration: number, type: OscillatorType = "sine", volume = 0.3) {
    if (this.muted || !this.ctx) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(to, ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume * this.sfxVolume * this.masterVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  play(sound: SoundName) {
    if (this.muted) return;
    this.init();

    switch (sound) {
      case "line-hover":
        this.playTone(800, 0.03, "sine", 0.05);
        break;
      case "line-draw":
        this.playSweep(440, 660, 0.08, "triangle", 0.15);
        break;
      case "box-capture":
        this.playSweep(220, 440, 0.15, "sawtooth", 0.2);
        break;
      case "button-click":
        this.playTone(1000, 0.02, "square", 0.03);
        break;
      case "game-start":
        this.playTone(523, 0.1, "sine", 0.15);
        setTimeout(() => this.playTone(659, 0.1, "sine", 0.15), 100);
        setTimeout(() => this.playTone(784, 0.2, "sine", 0.15), 200);
        break;
      case "game-win":
        this.playTone(523, 0.15, "sine", 0.2);
        setTimeout(() => this.playTone(659, 0.15, "sine", 0.2), 150);
        setTimeout(() => this.playTone(784, 0.15, "sine", 0.2), 300);
        setTimeout(() => this.playTone(1047, 0.4, "sine", 0.2), 450);
        break;
      case "game-lose":
        this.playSweep(400, 200, 0.3, "sine", 0.15);
        break;
    }
  }

  setVolume(type: "sfx" | "music" | "master", value: number) {
    if (type === "sfx") this.sfxVolume = value;
    if (type === "music") this.musicVolume = value;
    if (type === "master") this.masterVolume = value;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted() {
    return this.muted;
  }
}

export const soundManager = new SoundManager();
