function beep() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx)
            return;
        const ctx = new Ctx();
        const tone = (f, at, dur) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.type = "sine"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, ctx.currentTime + at); g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur); o.start(ctx.currentTime + at); o.stop(ctx.currentTime + at + dur); };
        tone(880, 0, 0.18);
        tone(1180, 0.22, 0.28);
        setTimeout(() => { try {
            ctx.close();
        }
        catch (e) { } }, 700);
    }
    catch (e) { }
}
function playDisco() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx)
            return;
        const ctx = new Ctx();
        const now = ctx.currentTime;
        const master = ctx.createGain();
        master.gain.value = 0.15;
        master.connect(ctx.destination);
        const beat = 0.26;
        const kick = (t) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.18); };
        const note = (f, t, dur, type, vol) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || "triangle"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.4, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03); };
        const bass = [130.81, 130.81, 196.0, 164.81];
        for (let i = 0; i < 8; i++) {
            const t = now + i * beat;
            kick(t);
            note(bass[i % 4], t, beat * 0.9, "sawtooth", 0.26);
        }
        const arp = [523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25];
        for (let i = 0; i < 8; i++)
            note(arp[i], now + i * beat + beat * 0.5, beat * 0.5, "triangle", 0.36);
        note(523.25, now + 8 * beat, 0.5, "triangle", 0.4);
        note(659.25, now + 8 * beat, 0.5, "triangle", 0.32);
        note(783.99, now + 8 * beat, 0.55, "triangle", 0.32);
        setTimeout(() => { try {
            ctx.close();
        }
        catch (e) { } }, (8 * beat + 0.9) * 1000);
    }
    catch (e) { }
}
function playStartChime() {
    // curto, ascendente — energia de "vamos que vamos"
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx)
            return;
        const ctx = new Ctx();
        const now = ctx.currentTime;
        const master = ctx.createGain();
        master.gain.value = 0.18;
        master.connect(ctx.destination);
        const note = (f, t, dur, vol) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02); };
        const seq = [392.0, 493.88, 587.33, 783.99];
        seq.forEach((f, i) => note(f, now + i * 0.09, 0.16, 0.4));
        setTimeout(() => { try {
            ctx.close();
        }
        catch (e) { } }, 900);
    }
    catch (e) { }
}
function playFinishChime() {
    // acorde caloroso de resolução — sensação de "concluído com sucesso"
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx)
            return;
        const ctx = new Ctx();
        const now = ctx.currentTime;
        const master = ctx.createGain();
        master.gain.value = 0.16;
        master.connect(ctx.destination);
        const note = (f, t, dur, vol) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03); };
        [392.0, 493.88, 587.33].forEach((f) => note(f, now, 0.7, 0.3));
        note(783.99, now + 0.1, 0.75, 0.34);
        setTimeout(() => { try {
            ctx.close();
        }
        catch (e) { } }, 1000);
    }
    catch (e) { }
}
export { beep, playDisco, playStartChime, playFinishChime };
