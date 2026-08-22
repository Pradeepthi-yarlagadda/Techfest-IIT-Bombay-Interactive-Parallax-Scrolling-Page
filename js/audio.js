/**
 * ==========================================================================
 * TECHFEST 2026 // ACTIVITY-3: PROCEDURAL WEB AUDIO ENGINE
 * Zero-dependency browser Web Audio synthesis for sci-fi parallax odyssey
 * ==========================================================================
 */

class CyberAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.ambientOsc = null;
    this.ambientGain = null;
    this.ambientFilter = null;
    this.analyser = null;
    this.dataArray = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      // Analyser for real-time visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.startAmbientDrone();
      this.isInitialized = true;
      this.isMuted = false;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked by browser policy:", e);
    }
  }

  startAmbientDrone() {
    if (!this.ctx) return;

    // Multi-oscillator ambient soundscape
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientOsc.type = 'sawtooth';
    this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(27.5, this.ctx.currentTime); // A0 sub

    this.ambientFilter = this.ctx.createBiquadFilter();
    this.ambientFilter.type = 'lowpass';
    this.ambientFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
    this.ambientFilter.Q.setValueAtTime(4, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    this.ambientOsc.connect(this.ambientFilter);
    subOsc.connect(this.ambientFilter);
    this.ambientFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    this.ambientOsc.start();
    subOsc.start();
  }

  /**
   * Modulate ambient synthesizer pitch & filter frequency based on altitude / scroll progress
   * @param {number} progress Normalized progress [0, 1]
   */
  updateAltitudeModulation(progress) {
    if (!this.ctx || !this.ambientFilter || this.isMuted) return;

    const baseFreq = 120 + progress * 800;
    const oscPitch = 55 + progress * 45;

    const now = this.ctx.currentTime;
    this.ambientFilter.frequency.setTargetAtTime(baseFreq, now, 0.1);
    if (this.ambientOsc) {
      this.ambientOsc.frequency.setTargetAtTime(oscPitch, now, 0.1);
    }
  }

  toggleAudio() {
    if (!this.isInitialized) {
      this.init();
      return true;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime, 0.05);
    }
    return !this.isMuted;
  }

  playHover() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.06);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playClick() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playWarp() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // White Noise Burst with Bandpass Filter Sweep
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.2);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.4);
  }

  playAscent() {
    if (this.isMuted || !this.ctx) return;
    const notes = [440, 554.37, 659.25, 880]; // A major chord arpeggio
    notes.forEach((freq, index) => {
      const now = this.ctx.currentTime + index * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  playExplode() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }
}

window.cyberAudio = new CyberAudioEngine();
