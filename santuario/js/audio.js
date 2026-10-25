/* Santuario: ambiente sonoro sintetizado (Web Audio API, sin archivos).
   Pad pentatonico estilo guzheng/ambient. Apagado por defecto; solo arranca
   tras un gesto del usuario (toggle/on llamados desde un clic). No rompe sin AudioContext. */
(function () {
  'use strict';

  var MASTER_GAIN = 0.16;      // volumen bajo
  var FADE_IN = 3.0;           // segundos
  var FADE_OUT = 1.6;
  // Pentatonica de re (D E F# A B) en dos octavas; base grave para el drone
  var SCALE = [146.83, 164.81, 185.0, 220.0, 246.94, 293.66, 329.63, 369.99, 440.0, 493.88];
  var DRONE = [73.42, 110.0];

  var Ctx = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, bus = null, droneNodes = [];
  var pluckTimer = null, stopTimer = null, playing = false;
  var listeners = [];

  function emit() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](playing); } catch (e) { /* un oyente roto no debe afectar al audio */ }
    }
  }

  // Reverb ligero: impulso de ruido con caida exponencial, generado en memoria
  function makeImpulse(c, seconds, decay) {
    var rate = c.sampleRate, len = Math.floor(rate * seconds);
    var buf = c.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  function build() {
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.6;

    var dry = ctx.createGain(); dry.gain.value = 0.7;
    var wet = ctx.createGain(); wet.gain.value = 0.55;
    var conv = ctx.createConvolver();
    conv.buffer = makeImpulse(ctx, 3.2, 2.6);

    bus = ctx.createGain();
    bus.connect(filter);
    filter.connect(dry); dry.connect(master);
    filter.connect(conv); conv.connect(wet); wet.connect(master);

    startDrone();
  }

  // Drone muy suave: dos senoidales con deriva lenta (LFO sobre ganancia)
  function startDrone() {
    droneNodes = [];
    DRONE.forEach(function (f, i) {
      var o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      o.detune.value = i ? 4 : -4;
      var g = ctx.createGain();
      g.gain.value = 0.22;
      var lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.03;
      var lg = ctx.createGain();
      lg.gain.value = 0.12;
      lfo.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(bus);
      o.start(); lfo.start();
      droneNodes.push(o, lfo);
    });
  }

  // Nota pulsada: ataque corto, caida larga (guzheng suave)
  function pluck(freq, when, vel) {
    var t = when || ctx.currentTime;
    var o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    var o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
    var g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(bus);
    o.start(t); o2.start(t);
    o.stop(t + 3.6); o2.stop(t + 3.6);
  }

  // Frases lentas: camina por la pentatonica con saltos pequenos, a veces un arpegio
  var idx = 3;
  function schedule() {
    if (!playing) return;
    var now = ctx.currentTime;
    if (Math.random() < 0.28) {
      var base = Math.floor(Math.random() * 5);
      for (var k = 0; k < 4; k++) pluck(SCALE[base + k], now + k * 0.28, 0.07);
    } else {
      idx = Math.max(0, Math.min(SCALE.length - 1, idx + Math.round((Math.random() - 0.5) * 4)));
      pluck(SCALE[idx], now, 0.09 + Math.random() * 0.04);
    }
    pluckTimer = setTimeout(schedule, 1800 + Math.random() * 3200);
  }

  function clearTimers() {
    if (pluckTimer) { clearTimeout(pluckTimer); pluckTimer = null; }
    if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
  }

  function on() {
    if (!Ctx || playing) return false;
    try {
      if (!ctx) build();
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      clearTimers();
      var t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(MASTER_GAIN, t + FADE_IN);
      playing = true;
      schedule();
      emit();
      return true;
    } catch (e) {
      playing = false;
      return false;
    }
  }

  function off() {
    if (!ctx || !playing) return false;
    playing = false;
    clearTimers();
    try {
      var t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + FADE_OUT);
      // Suspender el contexto tras el fade para no gastar CPU/bateria
      stopTimer = setTimeout(function () {
        if (!playing && ctx && ctx.suspend) { try { ctx.suspend(); } catch (e) { /* nada */ } }
      }, FADE_OUT * 1000 + 100);
    } catch (e) { /* nada */ }
    emit();
    return true;
  }

  function toggle() {
    if (playing) off(); else on();
    return playing;
  }

  window.SantuarioAudio = {
    on: on,
    off: off,
    toggle: toggle,
    isOn: function () { return playing; },
    supported: !!Ctx,
    // opcional: el boton del Motor puede suscribirse para reflejar el estado
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); }
  };
})();
