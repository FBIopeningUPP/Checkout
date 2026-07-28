const AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx;

const initAudio = () => {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
}

const playTone = (freq, type, duration, vol=0.2) => {
    try {
        initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
}

export const playCoin = () => {
    playTone(800, 'square', 0.1, 0.05);
    setTimeout(() => playTone(1200, 'square', 0.15, 0.05), 50);
}

export const playError = () => {
    playTone(150, 'sawtooth', 0.2, 0.1);
}

export const playPop = () => {
    playTone(600, 'sine', 0.05, 0.1);
}

export const playBell = () => {
    playTone(400, 'sine', 1.0, 0.2);
    setTimeout(() => playTone(600, 'sine', 1.0, 0.2), 50);
}