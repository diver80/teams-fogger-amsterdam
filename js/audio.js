/**
 * Audio System for Amsterdam Fogger (Web Audio API procedural sound synthesis)
 * Zero external audio files required - 100% reliable offline & instant loading!
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.musicPlaying = false;
        this.musicInterval = null;
        this.musicStep = 0;
        this.masterVolume = 0.35;
    }

    init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopMusic();
        } else {
            this.startMusic();
        }
        return this.muted;
    }

    playHop() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);

        gain.gain.setValueAtTime(this.masterVolume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playBikeBell() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Realistic Dutch dual-ping bicycle bell: "Ting-Ting!"
        const now = this.ctx.currentTime;
        this._singleBellPing(now, 2100);
        this._singleBellPing(now + 0.09, 2450);
    }

    _singleBellPing(time, freq) {
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        // Harmonic overtone for metallic brass resonance
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 1.52, time);

        gain.gain.setValueAtTime(this.masterVolume * 0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc2.start(time);
        osc.stop(time + 0.25);
        osc2.stop(time + 0.25);
    }

    playTramBell() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Heavy GVB Tram Bell: "Clang-Clang!"
        const now = this.ctx.currentTime;
        [0, 0.15, 0.3].forEach((offset, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + offset;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1020 - idx * 40, t);

            gain.gain.setValueAtTime(this.masterVolume * 0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.3);
        });
    }

    playCrash() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Noise buffer for crash crunch
        const bufferSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass filter for clattering metal
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(250, now + 0.3);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(this.masterVolume * 0.6, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        // Low frequency thud
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

        oscGain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);

        noise.start(now);
        osc.start(now);
        noise.stop(now + 0.35);
        osc.stop(now + 0.35);
    }

    playGoal() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + i * 0.08;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(this.masterVolume * 0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.28);
        });
    }

    playCollect() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [659.25, 987.77, 1318.51]; // E5, B5, E6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + i * 0.06;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(this.masterVolume * 0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.2);
        });
    }

    playLevelUp() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const melody = [
            { f: 440.00, d: 0.1 },  // A4
            { f: 554.37, d: 0.1 },  // C#5
            { f: 659.25, d: 0.1 },  // E5
            { f: 880.00, d: 0.25 }  // A5
        ];

        let offset = 0;
        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + offset;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, t);

            gain.gain.setValueAtTime(this.masterVolume * 0.45, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + note.d + 0.05);
            offset += note.d * 0.9;
        });
    }

    playGameOver() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [440, 415.3, 392, 349.2, 311.1]; // Descending chromatic
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + i * 0.14;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(this.masterVolume * 0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.22);
        });
    }

    // Upbeat 8-bit Amsterdam chiptune groove
    startMusic() {
        if (this.musicPlaying || this.muted) return;
        this.init();
        if (!this.ctx) return;

        this.musicPlaying = true;
        this.musicStep = 0;

        // Catchy baseline and upbeat arpeggios (C major / A minor upbeat cadence)
        const bassLine = [
            261.63, 261.63, 329.63, 392.00, // C, C, E, G
            220.00, 220.00, 261.63, 329.63, // A, A, C, E
            174.61, 174.61, 220.00, 261.63, // F, F, A, C
            196.00, 246.94, 293.66, 392.00  // G, B, D, G
        ];

        const leadNotes = [
            523.25, 0, 659.25, 523.25, 783.99, 659.25, 523.25, 0,
            440.00, 0, 523.25, 440.00, 659.25, 523.25, 440.00, 0,
            349.23, 0, 440.00, 349.23, 523.25, 440.00, 349.23, 0,
            392.00, 493.88, 587.33, 493.88, 783.99, 0, 392.00, 0
        ];

        const stepDuration = 140; // ms per 16th note

        this.musicInterval = setInterval(() => {
            if (!this.musicPlaying || this.muted || !this.ctx) return;

            const now = this.ctx.currentTime;
            const bassNote = bassLine[Math.floor(this.musicStep / 2) % bassLine.length];
            const leadNote = leadNotes[this.musicStep % leadNotes.length];

            // Bass note on eighth-note steps
            if (this.musicStep % 2 === 0) {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bOsc.type = 'triangle';
                bOsc.frequency.setValueAtTime(bassNote / 2, now);
                bGain.gain.setValueAtTime(this.masterVolume * 0.22, now);
                bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

                bOsc.connect(bGain);
                bGain.connect(this.ctx.destination);
                bOsc.start(now);
                bOsc.stop(now + 0.18);
            }

            // Lead melody note
            if (leadNote > 0) {
                const lOsc = this.ctx.createOscillator();
                const lGain = this.ctx.createGain();
                lOsc.type = 'square';
                lOsc.frequency.setValueAtTime(leadNote, now);
                lGain.gain.setValueAtTime(this.masterVolume * 0.08, now);
                lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

                lOsc.connect(lGain);
                lGain.connect(this.ctx.destination);
                lOsc.start(now);
                lOsc.stop(now + 0.12);
            }

            // High hat tick on every beat
            if (this.musicStep % 4 === 2) {
                const hatOsc = this.ctx.createOscillator();
                const hatGain = this.ctx.createGain();
                hatOsc.type = 'triangle';
                hatOsc.frequency.setValueAtTime(6000, now);
                hatGain.gain.setValueAtTime(this.masterVolume * 0.04, now);
                hatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
                hatOsc.connect(hatGain);
                hatGain.connect(this.ctx.destination);
                hatOsc.start(now);
                hatOsc.stop(now + 0.05);
            }

            this.musicStep = (this.musicStep + 1) % 64;
        }, stepDuration);
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    playTequilaFanfare() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Iconic "Tequila" saxophone riff (The Champs, 1958)
        // Key of F: F4, F4, Ab4, F4, Eb4, F4
        const now = this.ctx.currentTime;
        const notes = [
            { f: 349.23, t: 0.00, d: 0.12 }, // F4
            { f: 349.23, t: 0.14, d: 0.12 }, // F4
            { f: 415.30, t: 0.28, d: 0.16 }, // Ab4
            { f: 349.23, t: 0.46, d: 0.14 }, // F4
            { f: 311.13, t: 0.62, d: 0.14 }, // Eb4
            { f: 349.23, t: 0.78, d: 0.28 }  // F4
        ];

        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            const t = now + n.t;

            // Saxophone-like brass harmonics
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(n.f, t);

            osc2.type = 'square';
            osc2.frequency.setValueAtTime(n.f, t);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, t);

            gain.gain.setValueAtTime(this.masterVolume * 0.48, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

            osc.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc2.start(t);
            osc.stop(t + n.d + 0.05);
            osc2.stop(t + n.d + 0.05);
        });

        // The iconic "TEQUILA!" vocal shout right after the saxophone riff!
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setTimeout(() => {
                if (this.muted) return;
                try {
                    window.speechSynthesis.cancel();
                    const shout = new SpeechSynthesisUtterance('Tequila!');
                    shout.rate = 1.05;
                    shout.pitch = 0.75;
                    shout.volume = Math.min(1.0, this.masterVolume * 2);
                    window.speechSynthesis.speak(shout);
                } catch (e) {
                    // Fallback gracefully if speech synthesis is blocked
                }
            }, 1050);
        }
    }
}

window.soundEngine = new SoundEngine();
