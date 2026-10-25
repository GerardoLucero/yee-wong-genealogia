window.Santuario.register(5, function (ctx) {
  var gsap = ctx.gsap, ST = ctx.ScrollTrigger, sec = ctx.section;
  if (ctx.reduced || !gsap || !ST) { return; }
  gsap.registerPlugin(ST);

  var scroller = sec.querySelector('.a5-scroller');
  var card = sec.querySelector('.a5-card');
  var draws = Array.prototype.slice.call(sec.querySelectorAll('[data-a5-draw]'));
  var node = function (id) { return sec.querySelector('.a5-node[data-node="' + id + '"]'); };
  var li = function (id) { return sec.querySelector('.a5-list li[data-node="' + id + '"]'); };

  sec.classList.add('a5-js');

  draws.forEach(function (p) {
    var len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
  });
  // La rama punteada se revela con una mascara; su dasharray propio se conserva.
  var blooms = sec.querySelectorAll('.a5-bloom');
  var labels = sec.querySelectorAll('.a5-label, .a5-stamp');
  var leaves = sec.querySelectorAll('.a5-leaf');
  gsap.set(blooms, { scale: 0, opacity: 0, rotation: -50, transformOrigin: '0px 0px' });
  gsap.set(sec.querySelectorAll('.a5-petal, .a5-pistil'), { scale: 0, transformOrigin: '50% 50%' });
  var NS = 'http://www.w3.org/2000/svg';
  sec.querySelectorAll('.a5-node').forEach(function (n) {
    var r = document.createElementNS(NS, 'circle');
    r.setAttribute('class', 'a5-ring'); r.setAttribute('r', '6');
    n.insertBefore(r, n.firstChild);
  });
  gsap.set(labels, { opacity: 0 });
  gsap.set(leaves, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });

  var tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  var d = function (i) { return draws[i]; };
  // Orden de draws en el HTML: 0 t1, 1 t2, 2 arturo, 3 miguel, 4 catalina, 5 federico, 6 mask manuel, 7 lourdes, 8-14 copa
  var draw = function (el, at, dur) { tl.to(el, { strokeDashoffset: 0, duration: dur }, at); };
  draw(d(0), 0, 0.5);
  draw(d(2), 0.19, 0.07);
  draw(d(3), 0.276, 0.07);
  draw(d(4), 0.35, 0.05);
  draw(d(5), 0.38, 0.07);
  draw(d(6), 0.465, 0.07);
  draw(d(1), 0.52, 0.1);
  draw(d(7), 0.58, 0.16);
  for (var i = 8; i < draws.length; i++) { draw(d(i), 0.74 + (i - 8) * 0.025, 0.12); }

  var open = function (id, at) {
    var n = node(id);
    if (!n) { return; }
    tl.to(n.querySelector('.a5-bloom'), { scale: 1, opacity: 1, rotation: 0, duration: 0.07, ease: 'back.out(2.2)' }, at);
    tl.to(n.querySelectorAll('.a5-petal, .a5-pistil'), { scale: 1, duration: 0.05, stagger: 0.008, ease: 'back.out(2.5)' }, at);
    var ring = n.querySelector('.a5-ring');
    tl.fromTo(ring, { attr: { r: 6 }, opacity: 0.9 }, { attr: { r: 34 }, opacity: 0, duration: 0.08, ease: 'power2.out', immediateRender: false }, at + 0.02);
    var l = n.querySelectorAll('.a5-label, .a5-stamp');
    if (l.length) { tl.to(l, { opacity: 1, duration: 0.04 }, at + 0.02); }
  };
  open('padres', 0.02);
  open('arturo', 0.26);
  open('miguel', 0.346);
  open('catalina', 0.40);
  open('federico', 0.45);
  open('manuel', 0.535);
  open('lourdes', 0.68);
  var rootLabel = sec.querySelector('.a5-label--root');
  if (rootLabel) { tl.to(rootLabel, { opacity: 1, duration: 0.04 }, 0.05); }
  tl.to(leaves, { scale: 1, opacity: 0.9, duration: 0.06, stagger: 0.012, ease: 'back.out(2)' }, 0.84);
  tl.to({}, { duration: 0.01 }, 0.99);

  var steps = [
    { id: 'padres', at: 0.04 }, { id: 'arturo', at: 0.28 }, { id: 'miguel', at: 0.36 },
    { id: 'catalina', at: 0.42 }, { id: 'federico', at: 0.47 }, { id: 'manuel', at: 0.55 },
    { id: 'lourdes', at: 0.70 }, { id: 'futuro', at: 0.9 }
  ];
  var current = null;

  function show(id) {
    if (id === current) { return; }
    current = id;
    sec.querySelectorAll('.a5-node').forEach(function (n) {
      n.classList.toggle('a5-on', n.getAttribute('data-node') === id);
    });
    var src = id && li(id);
    if (!src) { card.classList.remove('a5-card--on'); return; }
    card.innerHTML = src.innerHTML;
    card.classList.add('a5-card--on');
    gsap.fromTo(card, { y: 40, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'elastic.out(1, 0.6)', overwrite: true, clearProps: 'transform' });
  }

  // Petalos de ciruelo que caen (max 36), pausados fuera de pantalla
  var svg = sec.querySelector('.a5-svg');
  var fall = document.createElementNS(NS, 'g');
  fall.setAttribute('class', 'a5-fall');
  svg.appendChild(fall);
  gsap.set(fall, { opacity: 0 });
  var rand = gsap.utils.random;
  var fallTweens = [];
  for (var q = 0; q < 36; q++) {
    (function (q) {
      var e = document.createElementNS(NS, 'ellipse');
      e.setAttribute('class', 'a5-pet' + (q % 6 === 0 ? ' a5-pet--gold' : ''));
      e.setAttribute('rx', rand(2.5, 4.5)); e.setAttribute('ry', rand(1.4, 2.4));
      fall.appendChild(e);
      var x0 = rand(30, 370);
      gsap.set(e, { x: x0, y: rand(-20, 700), rotation: rand(0, 360) });
      var run = function () {
        var t = gsap.timeline({ onComplete: function () { gsap.set(e, { x: rand(30, 370), y: -20 }); run(); } });
        var dur = rand(6, 12);
        t.to(e, { y: '+=' + rand(500, 760), duration: dur, ease: 'none' }, 0)
         .to(e, { x: '+=' + rand(-70, 70), duration: dur / 3, ease: 'sine.inOut', yoyo: true, repeat: 2 }, 0)
         .to(e, { rotation: '+=' + rand(-300, 300), duration: dur, ease: 'none' }, 0);
        fallTweens.push(t);
      };
      run();
    })(q);
  }
  fallTweens.forEach(function (t) { t.pause(); });
  ST.create({
    trigger: sec, start: 'top bottom', end: 'bottom top',
    onToggle: function (self) { fallTweens.forEach(function (t) { self.isActive ? t.resume() : t.pause(); }); }
  });
  var fallOn = false;

  // Brisa suave en la copa y brillo vivo en las flores abiertas
  gsap.to(sec.querySelector('.a5-crown'), { rotation: 1.6, svgOrigin: '200 330', duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(sec.querySelectorAll('.a5-leaf'), { rotation: '+=14', duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 0.15, from: 'random' } });

  ST.create({
    trigger: scroller,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.6,
    animation: tl,
    onUpdate: function (self) {
      var p = self.progress, id = null;
      for (var k = 0; k < steps.length; k++) { if (p >= steps[k].at) { id = steps[k].id; } }
      show(id);
      var want = p > 0.08 && p < 0.98;
      if (want !== fallOn) { fallOn = want; gsap.to(fall, { opacity: want ? 1 : 0, duration: 0.8 }); }
    }
  });

  // Poema generacional: se ilumina caracter a caracter al entrar en pantalla
  var col = sec.querySelector('.a5-zb-col');
  if (col) {
    col.classList.add('a5-armed');
    var items = col.querySelectorAll('.a5-zb-cell, .a5-zb-dots');
    var lit = gsap.timeline({ paused: true });
    items.forEach(function (it, k) {
      lit.call(function () { it.classList.add('a5-lit'); }, null, k * 0.7);
      if (it.classList.contains('a5-zb-cell')) {
        lit.fromTo(it, { y: 24, scale: 0.85 }, { y: 0, scale: 1, duration: 0.7, ease: 'back.out(2)' }, k * 0.7);
      }
    });
    gsap.set(col.querySelectorAll('.a5-zb-dots'), { opacity: 0.2 });
    lit.to(col.querySelectorAll('.a5-zb-dots'), { opacity: 0.8, duration: 0.6, stagger: 1.4 }, 0.4);
    ST.create({
      trigger: col, start: 'top 85%', once: true,
      onEnter: function () { lit.play(); }
    });
  }
});
