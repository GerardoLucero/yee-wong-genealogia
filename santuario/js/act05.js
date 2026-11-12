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

  // Arbol de la familia: los nodos aparecen al llegar a ellos (el contenido es visible sin JS)
  var nodes = sec.querySelectorAll('.a5t-node');
  gsap.set(nodes, { opacity: 0, y: 24 });
  nodes.forEach(function (n) {
    ST.create({ trigger: n, start: 'top 90%', once: true, onEnter: function () { gsap.to(n, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }); } });
  });
  sec.classList.add('a5-js');

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
