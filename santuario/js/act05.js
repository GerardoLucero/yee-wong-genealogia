window.Santuario.register(5, function (ctx) {
  var gsap = ctx.gsap, ST = ctx.ScrollTrigger, sec = ctx.section;
  // Linea punteada dorada entre 榮高/榮貴 y el grupo "Yon" (se mide con offsets, no con transforms)
  (function () {
    var row = sec.querySelector('.a5g-row[data-gen="34"]');
    if (!row) { return; }
    var NS2 = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS2, 'svg');
    svg.setAttribute('class', 'a5g-link');
    svg.setAttribute('aria-hidden', 'true');
    var paths = [document.createElementNS(NS2, 'path'), document.createElementNS(NS2, 'path')];
    paths.forEach(function (pt) { svg.appendChild(pt); });
    row.insertBefore(svg, row.firstChild);
    var off = function (el) {
      var x = 0, y = 0, n = el;
      while (n && n !== row) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
    };
    function draw() {
      var chips = row.querySelectorAll('.a5g-chip--yon');
      var grp = row.querySelector('.a5g-grp');
      if (!grp || chips.length < 2) { return; }
      var g = off(grp);
      var stacked = window.getComputedStyle(row).gridTemplateColumns.split(' ').length < 3;
      for (var k = 0; k < 2; k++) {
        var c = off(chips[k]);
        var x1 = c.x + c.w, y1 = c.y + c.h / 2, x2 = g.x, y2 = g.y + Math.min(g.h / 2, 28 + k * 22);
        if (c.x > g.x) { x1 = c.x; x2 = g.x + g.w; }
        var mx = (x1 + x2) / 2;
        paths[k].setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2);
      }
    }
    draw();
    window.addEventListener('resize', draw);
    window.addEventListener('load', draw);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(draw); }
    row._a5draw = draw;
  })();

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


  // Escena "Donde se cruzan": los carriles se dibujan generacion por generacion
  (function () {
    var sc = sec.querySelector('.a5g-scroller');
    if (!sc) { return; }
    var stage = sc.querySelector('.a5g-stage');
    var grid = sc.querySelector('.a5g-grid');
    var rows = sc.querySelectorAll('.a5g-row');
    var cap = sc.querySelector('.a5g-caption');
    var pin = window.innerHeight >= 760 && window.innerWidth >= 600;
    sc.classList.add('a5g-js', pin ? 'a5g-pin' : 'a5g-flow');
    // Si el contenido no cabe en una pantalla, se pasa a flujo normal para no recortar nada
    if (pin && stage.scrollHeight > stage.clientHeight + 2) {
      pin = false;
      sc.classList.remove('a5g-pin');
      sc.classList.add('a5g-flow');
    }

    gsap.set(sc.querySelectorAll('.a5g-rail'), { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(sc.querySelectorAll('.a5g-title, .a5g-head, .a5g-legend'), { opacity: 0, y: 14 });
    var t = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    t.to(sc.querySelectorAll('.a5g-title, .a5g-head'), { opacity: 1, y: 0, duration: 0.06, stagger: 0.015, ease: 'power2.out' }, 0);
    t.to(sc.querySelectorAll('.a5g-rail'), { scaleY: 1, duration: 0.85 }, 0.06);
    var at = [0.08, 0.38, 0.66];
    rows.forEach(function (r, i) {
      var items = r.querySelectorAll('.a5g-gen, .a5g-chip');
      var ring = r.querySelector('.a5g-ring');
      var cross = r.querySelector('.a5g-cross-t');
      gsap.set(items, { opacity: 0, y: 18, scale: 0.9 });
      gsap.set(cross, { opacity: 0 });
      gsap.set(ring, { scale: 0 });
      t.to(items, { opacity: 1, y: 0, scale: 1, duration: 0.07, stagger: 0.012, ease: 'back.out(2)' }, at[i]);
      t.to(ring, { scale: 1, duration: 0.05, ease: 'back.out(3)' }, at[i] + 0.13);
      t.to(cross, { opacity: 1, duration: 0.05 }, at[i] + 0.14);
    });
    var lk = sc.querySelector('.a5g-link');
    var lt = sc.querySelector('.a5g-link-t');
    gsap.set([lk, lt], { opacity: 0 });
    t.to([lk, lt], { opacity: 1, duration: 0.06 }, 0.86);
    t.to(sc.querySelector('.a5g-legend'), { opacity: 1, y: 0, duration: 0.05, ease: 'power2.out' }, 0.9);
    t.to({}, { duration: 0.01 }, 0.99);

    var says = [], cur = -1;
    rows.forEach(function (r) { says.push(r.querySelector('.a5g-say').innerHTML); });
    var marks = [0.1, 0.4, 0.68];
    function setStage(p) {
      var k = -1;
      marks.forEach(function (m, i) { if (p >= m) { k = i; } });
      rows.forEach(function (r, i) {
        var ring = r.querySelector('.a5g-ring');
        ring.classList.toggle('a5g-pulse', i <= k && p >= marks[i] + 0.15);
      });
      if (k === cur) { return; }
      cur = k;
      if (k < 0) { cap.innerHTML = ''; return; }
      cap.innerHTML = says[k];
      gsap.fromTo(cap, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.8)', overwrite: true });
    }
    ST.addEventListener('refresh', function () { var r = rows[2]; if (r && r._a5draw) { r._a5draw(); } });
    ST.create(pin
      ? { trigger: sc, start: 'top top', end: 'bottom bottom', scrub: 0.6, animation: t, onUpdate: function (self) { setStage(self.progress); } }
      : { trigger: grid, start: 'top 75%', end: 'bottom 55%', scrub: 0.6, animation: t, onUpdate: function (self) { setStage(self.progress); } });
  })();
});
