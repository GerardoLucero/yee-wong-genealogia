/* Acto IV: Mexico. Pin + scrub: tinta a atardecer, dunas en parallax, linea de tiempo deslizante, censo revelado. */
window.Santuario.register(4, function (ctx) {
  var gsap = ctx.gsap, ScrollTrigger = ctx.ScrollTrigger, sec = ctx.section;
  if (!gsap || !ScrollTrigger || !sec || ctx.reduced) return; // estatico: todo visible

  var q = function (s) { return sec.querySelector(s); };
  var qa = function (s) { return sec.querySelectorAll(s); };
  var panels = { intro: q('.a4-p-intro'), tl: q('.a4-p-timeline'), census: q('.a4-p-census'), border: q('.a4-p-border') };
  var track = q('.a4-tl-track'), win = q('.a4-tl-window');
  if (!panels.intro || !panels.tl || !panels.census || !panels.border || !track || !win) return;

  sec.classList.add('a4-js');
  gsap.registerPlugin(ScrollTrigger);

  // Texto por palabras: cada nodo de texto dentro de los idiomas se parte en spans
  var splitWords = function (root) {
    var out = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) { if (n.nodeValue.trim()) nodes.push(n); }
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement('span'); w.className = 'a4-w'; w.textContent = part;
        frag.appendChild(w); out.push(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return out;
  };
  var words = {};
  ['intro', 'tl', 'census', 'border'].forEach(function (k) {
    words[k] = [];
    panels[k].querySelectorAll('.a4-title,.a4-lead,.a4-note,.a4-card-t,.a4-card-h,.a4-sub').forEach(function (el) {
      words[k] = words[k].concat(splitWords(el));
    });
  });

  // Particulas: polvo dorado y brasas rojas
  var layer = document.createElement('div');
  layer.className = 'a4-particles'; layer.setAttribute('aria-hidden', 'true');
  q('.a4-stage').insertBefore(layer, q('.a4-content'));
  var motes = [];
  for (var i = 0; i < 40; i++) {
    var m = document.createElement('i'); m.className = 'a4-mote' + (i % 6 === 0 ? ' a4-red' : '');
    m.style.left = (Math.random() * 100) + '%'; m.style.top = (30 + Math.random() * 70) + '%';
    var sz = 2 + Math.random() * 4; m.style.width = m.style.height = sz + 'px';
    layer.appendChild(m); motes.push(m);
  }
  motes.forEach(function (m, i) {
    gsap.fromTo(m, { y: 0, x: 0, opacity: 0 }, {
      y: -(120 + Math.random() * 260), x: (Math.random() - 0.5) * 160, opacity: 0.4 + Math.random() * 0.6,
      duration: 4 + Math.random() * 5, delay: Math.random() * 5, ease: 'sine.inOut', repeat: -1, yoyo: true
    });
  });

  var shift = function () { return -Math.max(0, track.scrollWidth - win.clientWidth); };

  var show = function (el, t, at) {
    tl.set(el, { visibility: 'visible' }, at)
      .fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: t, ease: 'power2.out' }, at);
  };
  var hide = function (el, t, at) {
    tl.to(el, { opacity: 0, y: -30, duration: t, ease: 'power2.in' }, at)
      .set(el, { visibility: 'hidden' }, at + t);
  };

  var tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: sec, start: 'top top', end: '+=600%', scrub: 1, pin: q('.a4-stage'), anticipatePin: 1, invalidateOnRefresh: true }
  });

  // Fondo: la tinta fria cede al atardecer (0 a 1.2)
  gsap.set(q('.a4-dusk'), { opacity: 0 });
  tl.to(q('.a4-dusk'), { opacity: 0.9, duration: 1.2 }, 0)
    .fromTo(q('.a4-sun'), { y: 80, opacity: 0.2 }, { y: 0, opacity: 0.95, duration: 2 }, 0)
    .to(q('.a4-sun'), { y: 70, duration: 3 }, 5);

  // Parallax de capas durante todo el recorrido (duracion total 8)
  tl.fromTo(q('.a4-l-far'), { x: 0 }, { x: -60, duration: 8 }, 0)
    .fromTo(q('.a4-l-mid'), { x: 0 }, { x: -140, duration: 8 }, 0)
    .fromTo(q('.a4-l-palm'), { x: 0, y: 0 }, { x: -240, y: 10, duration: 8 }, 0);

  // Mas capas: nubes, aves, rayos, particulas con parallax
  tl.fromTo(q('.a4-l-cloud'), { x: 0 }, { x: 200, duration: 8 }, 0)
    .fromTo(q('.a4-l-bird'), { x: -120, y: 40 }, { x: 700, y: -60, duration: 8 }, 0)
    .fromTo(q('.a4-rays'), { rotation: -6, opacity: 0.5, transformOrigin: '860px 330px' }, { rotation: 8, opacity: 1, duration: 8 }, 0)
    .fromTo(layer, { y: 0 }, { y: -160, duration: 8 }, 0);
  gsap.to(qa('.a4-cactus'), { rotation: 1.5, transformOrigin: '50% 100%', duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true });
  gsap.to(qa('.a4-palm'), { rotation: 2, transformOrigin: '50% 100%', duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 0.7 });
  gsap.to(q('.a4-sun'), { scale: 1.06, transformOrigin: '860px 330px', duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true });
  gsap.to(q('.a4-chop'), { rotation: -1, duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true });

  // Olas: bucle independiente del scroll
  qa('.a4-wave').forEach(function (w, i) {
    gsap.to(w, { x: i % 2 ? 100 : -100, duration: 4 + i, ease: 'sine.inOut', repeat: -1, yoyo: true });
  });

  // Panel 1 -> 2
  var wordsIn = function (k, at, each) {
    gsap.set(words[k], { opacity: 0, y: 18, rotateX: -60 });
    tl.to(words[k], { opacity: 1, y: 0, rotateX: 0, stagger: each, duration: 0.3, ease: 'power2.out' }, at);
  };
  wordsIn('intro', 0.05, 0.02);
  tl.fromTo(q('.a4-chop'), { scale: 0, rotation: -40 }, { scale: 1, rotation: -4, duration: 0.5, ease: 'back.out(2)' }, 0);
  hide(panels.intro, 0.4, 1.8);
  show(panels.tl, 0.4, 2.2);
  // Linea de tiempo se desliza de 1921 a 1977
  tl.fromTo(track, { x: 0 }, { x: shift, duration: 2.2, ease: 'none' }, 2.6);
  wordsIn('tl', 2.3, 0.01);
  tl.from(qa('.a4-card'), { opacity: 0, rotateY: 50, x: 60, stagger: 0.15, duration: 0.5, transformPerspective: 800 }, 2.3);
  tl.from(qa('.a4-stamp'), { scale: 2.2, opacity: 0, rotation: 10, stagger: 0.4, duration: 0.3, ease: 'power3.in' }, 3.6);
  hide(panels.tl, 0.4, 4.9);

  // Panel 3: el censo se revela linea por linea (momento memorable)
  show(panels.census, 0.4, 5.3);
  tl.from(q('.a4-doc-paper'), { scaleY: 0.85, transformOrigin: 'top center', duration: 0.5 }, 5.3);
  wordsIn('census', 5.3, 0.01);
  var lines = qa('.a4-line');
  gsap.set(lines, { clipPath: 'inset(0 100% 0 0)', opacity: 0.2 });
  tl.to(lines, { clipPath: 'inset(0 0% 0 0)', opacity: 1, stagger: 0.18, duration: 0.45, ease: 'power1.inOut' }, 5.7);
  hide(panels.census, 0.4, 7.0);

  // Panel 4: Nogales, cuatro figuras que cruzan
  show(panels.border, 0.4, 7.4);
  wordsIn('border', 7.4, 0.015);
  tl.from(qa('.a4-kid'), { x: -60, opacity: 0, stagger: 0.12, duration: 0.4 }, 7.5);
  tl.to(qa('.a4-kid'), { x: 40, stagger: 0.08, duration: 0.5 }, 7.8);
  tl.fromTo(q('.a4-p-border .a4-stamp-inline'), { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 }, 7.9);

  // Mantener la linea de tiempo en el ultimo estado hasta el fin
  tl.to({}, { duration: 0.3 }, 8);

  ScrollTrigger.addEventListener('refreshInit', function () { gsap.set(track, { x: 0 }); });
});
