/* Acto 7: El altar. Humo, luciernagas, titulos, hilo hacia el fundido final. */
window.Santuario.register(7, function (ctx) {
  var gsap = ctx.gsap, ST = ctx.ScrollTrigger, sec = ctx.section;
  var canvas = sec.querySelector('.a7-canvas');
  var stage = sec.querySelector('.a7-stage');
  var tip = sec.querySelector('#a7-tip');
  var c2d = canvas.getContext('2d');
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var smoke = [], flies = [], sparks = [], burst = 0, visible = false, running = false, smokeRate = 1, tipX = 0, tipY = 0;
  var MAX_SMOKE = 36, MAX_FLIES = 14;

  function resize() {
    var r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    var t = tip.getBoundingClientRect();
    tipX = t.left - r.left; tipY = t.top - r.top;
  }
  function spawnSmoke() {
    smoke.push({ x: tipX, y: tipY, age: 0, life: 380 + Math.random() * 120, ph: Math.random() * 6.28, amp: 6 + Math.random() * 8, r: 3 + Math.random() * 3 });
  }
  function spawnSpark(x, y, big) {
    var a = big ? Math.random() * 6.28 : -1.57 + (Math.random() - 0.5) * 1.2, v = big ? 1 + Math.random() * 3.5 : 0.4 + Math.random() * 1.1;
    sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: big ? 90 : 60 + Math.random() * 40, r: 0.8 + Math.random() * 1.4 });
  }
  function candleSparks() {
    var cs2 = sec.querySelectorAll('.a7-flame'), r0 = stage.getBoundingClientRect();
    for (var q = 0; q < cs2.length; q++) { var b = cs2[q].getBoundingClientRect(); spawnSpark(b.left - r0.left + b.width / 2, b.top - r0.top, false); }
  }
  function spawnFly() {
    flies.push({ x: Math.random() * W, y: H * (0.35 + Math.random() * 0.6), ph: Math.random() * 6.28, sp: 0.2 + Math.random() * 0.4, r: 1 + Math.random() * 1.2 });
  }
  var cs = getComputedStyle(sec);
  function col(name, fb) { var v = cs.getPropertyValue(name).trim(); return v || fb; }
  var paper = col('--paper', '#efe4cd'), gold = col('--gold-bright', '#e6c36a');

  var frame = 0;
  function draw() {
    if (!running) return;
    frame++;
    c2d.clearRect(0, 0, W, H);
    if (frame % Math.max(2, Math.round(5 / smokeRate)) === 0 && smoke.length < MAX_SMOKE) spawnSmoke();
    if (frame % 6 === 0 && sparks.length < 70) candleSparks();
    if (burst > 0 && sparks.length < 160) { for (var b2 = 0; b2 < 4; b2++) spawnSpark(W / 2, H * 0.36 + 40, true); }
    for (var s2 = sparks.length - 1; s2 >= 0; s2--) {
      var sp = sparks[s2]; sp.age++;
      if (sp.age > sp.life) { sparks.splice(s2, 1); continue; }
      sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.015; sp.vx *= 0.99;
      c2d.globalAlpha = 1 - sp.age / sp.life; c2d.fillStyle = sp.age % 2 ? gold : paper;
      c2d.shadowColor = gold; c2d.shadowBlur = 8;
      c2d.beginPath(); c2d.arc(sp.x, sp.y, sp.r, 0, 6.28); c2d.fill();
    }
    c2d.shadowBlur = 0;
    var rise = H * 0.0012;
    for (var i = smoke.length - 1; i >= 0; i--) {
      var p = smoke[i];
      p.age++;
      if (p.age > p.life) { smoke.splice(i, 1); continue; }
      var k = p.age / p.life;
      var x = p.x + Math.sin(p.age * 0.02 + p.ph) * p.amp * (0.3 + k);
      var y = p.y - p.age * (rise * 1.2 + 0.35);
      c2d.globalAlpha = (1 - k) * 0.22;
      c2d.fillStyle = paper;
      c2d.beginPath(); c2d.arc(x, y, p.r + k * 10, 0, 6.28); c2d.fill();
    }
    for (var j = 0; j < flies.length; j++) {
      var f = flies[j];
      f.ph += 0.02;
      f.x += Math.sin(f.ph * 1.3) * f.sp;
      f.y += Math.cos(f.ph) * f.sp * 0.6 - 0.05;
      if (f.y < 0) f.y = H; if (f.x < 0) f.x = W; if (f.x > W) f.x = 0;
      c2d.globalAlpha = 0.25 + 0.65 * Math.abs(Math.sin(f.ph * 1.7));
      c2d.fillStyle = gold;
      c2d.beginPath(); c2d.arc(f.x, f.y, f.r, 0, 6.28); c2d.fill();
    }
    c2d.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  function start() { if (!running && !ctx.reduced) { running = true; requestAnimationFrame(draw); } }
  function stop() { running = false; }

  resize();
  window.addEventListener('resize', function () { resize(); ST.refresh(); });
  if (ctx.reduced) {
    // estatico: sin particulas ni pin; todo legible en flujo
    return;
  }
  for (var n = 0; n < MAX_FLIES; n++) spawnFly();

  ST.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: function (s) { visible = s.isActive; visible ? start() : stop(); } });

  // modo vivo
  sec.classList.add('a7-live');
  resize();
  var P1 = sec.querySelector('.a7-p1'), P2 = sec.querySelector('.a7-p2'), P3 = sec.querySelector('.a7-p3');
  var credits = sec.querySelector('.a7-credits');
  var thread = sec.querySelector('.a7-thread-path');
  var fade = sec.querySelector('.a7-fade');
  var last = sec.querySelector('.a7-last');
  var altar = sec.querySelector('.a7-altar');
  var glow = sec.querySelector('.a7-glow');

  gsap.set([P1, P2, P3], { opacity: 0, y: 14 });
  gsap.set(altar, { opacity: 0 });
  var credH = function () { return credits.offsetHeight + stage.offsetHeight; };

  var tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: sec.querySelector('.a7-track'), start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true }
  });
  // duraciones relativas (total 100)
  tl.to(altar, { opacity: 1, duration: 8 }, 0)
    .to(P1, { opacity: 1, y: 0, duration: 6 }, 4)
    .to(P1, { opacity: 0, y: -10, duration: 5 }, 17)
    .to(P2, { opacity: 1, y: 0, duration: 6 }, 22)
    .to(P2, { opacity: 0, y: -10, duration: 5 }, 33)
    .to(P3, { opacity: 1, y: 0, duration: 6 }, 38)
    .to(P3, { opacity: 0, y: -10, duration: 5 }, 50)
    .fromTo(credits, { y: 0 }, { y: function () { return -credH(); }, duration: 28 }, 52)
    .to(altar, { opacity: 0.0, duration: 8 }, 80)
    .to(fade, { opacity: 1, duration: 8 }, 80)
    .to(thread, { strokeDashoffset: 0, duration: 10 }, 84)
    .to(last, { opacity: 1, scale: 1.12, duration: 6 }, 93)
    .to({ v: 0 }, { v: 1, duration: 7, onUpdate: function () { burst = this.progress() > 0.02 && this.progress() < 0.98 ? 1 : 0; } }, 93)
    .to(sec.querySelectorAll('.a7-lantern'), { y: -120, opacity: 0, duration: 10 }, 82)
    .to({ v: 1 }, { v: 2.5, duration: 20, onUpdate: function () { smokeRate = 1 + 1.5 * this.progress(); } }, 70);

  ST.addEventListener('refreshInit', resize);
});
