/* Acto IV: Mexico. Pin + scrub: tinta a atardecer, parallax multicapa, particulas, texto por palabras, censo revelado. */
window.Santuario.register(4, function (ctx) {
  var gsap = ctx.gsap, ScrollTrigger = ctx.ScrollTrigger, sec = ctx.section;
  if (!gsap || !ScrollTrigger || !sec || ctx.reduced) return; // estatico: todo visible

  var q = function (s) { return sec.querySelector(s); };
  var qa = function (s) { return sec.querySelectorAll(s); };
  var keys = ['intro', 'wed', 'census', 'bros', 'hijos', 'end'];
  var panels = {};
  for (var k = 0; k < keys.length; k++) {
    panels[keys[k]] = q('.a4-p-' + keys[k]);
    if (!panels[keys[k]]) return;
  }

  sec.classList.add('a4-js');
  gsap.registerPlugin(ScrollTrigger);

  // Texto por palabras
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
  keys.forEach(function (key) {
    words[key] = [];
    panels[key].querySelectorAll('.a4-title,.a4-lead,.a4-card-t,.a4-year,.a4-maria-full,.a4-birth').forEach(function (el) {
      words[key] = words[key].concat(splitWords(el));
    });
  });

  // Particulas: polvo dorado y brasas rojas
  var layer = document.createElement('div');
  layer.className = 'a4-particles'; layer.setAttribute('aria-hidden', 'true');
  q('.a4-stage').insertBefore(layer, q('.a4-content'));
  for (var i = 0; i < 40; i++) {
    var m = document.createElement('i'); m.className = 'a4-mote' + (i % 6 === 0 ? ' a4-red' : '');
    m.style.left = (Math.random() * 100) + '%'; m.style.top = (30 + Math.random() * 70) + '%';
    var sz = 2 + Math.random() * 4; m.style.width = m.style.height = sz + 'px';
    layer.appendChild(m);
    gsap.fromTo(m, { y: 0, x: 0, opacity: 0 }, {
      y: -(120 + Math.random() * 260), x: (Math.random() - 0.5) * 160, opacity: 0.4 + Math.random() * 0.6,
      duration: 4 + Math.random() * 5, delay: Math.random() * 5, ease: 'sine.inOut', repeat: -1, yoyo: true
    });
  }

  var T = 11; // duracion total de la linea de tiempo
  var tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: sec, start: 'top top', end: '+=580%', scrub: 1, pin: q('.a4-stage'), anticipatePin: 1, invalidateOnRefresh: true }
  });

  var show = function (el, at) {
    tl.set(el, { visibility: 'visible' }, at)
      .fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, at);
  };
  var hide = function (el, at) {
    tl.to(el, { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }, at)
      .set(el, { visibility: 'hidden' }, at + 0.4);
  };
  var wordsIn = function (key, at, each) {
    gsap.set(words[key], { opacity: 0, y: 18, rotateX: -60 });
    tl.to(words[key], { opacity: 1, y: 0, rotateX: 0, stagger: each, duration: 0.3, ease: 'power2.out' }, at);
  };

  // Fondo: tinta fria a atardecer
  gsap.set(q('.a4-dusk'), { opacity: 0 });
  tl.to(q('.a4-dusk'), { opacity: 0.9, duration: 1.2 }, 0)
    .fromTo(q('.a4-sun'), { y: 80, opacity: 0.2 }, { y: 0, opacity: 0.95, duration: 2 }, 0)
    .to(q('.a4-sun'), { y: 70, duration: 3 }, T - 3.5);

  // Parallax multicapa
  tl.fromTo(q('.a4-l-far'), { x: 0 }, { x: -60, duration: T }, 0)
    .fromTo(q('.a4-l-mid'), { x: 0 }, { x: -140, duration: T }, 0)
    .fromTo(q('.a4-l-palm'), { x: 0, y: 0 }, { x: -240, y: 10, duration: T }, 0)
    .fromTo(q('.a4-l-cloud'), { x: 0 }, { x: 200, duration: T }, 0)
    .fromTo(q('.a4-l-bird'), { x: -120, y: 40 }, { x: 700, y: -60, duration: T }, 0)
    .fromTo(q('.a4-rays'), { rotation: -6, opacity: 0.5, transformOrigin: '860px 330px' }, { rotation: 8, opacity: 1, duration: T }, 0)
    .fromTo(layer, { y: 0 }, { y: -160, duration: T }, 0);

  // Movimiento continuo
  qa('.a4-wave').forEach(function (w, j) {
    gsap.to(w, { x: j % 2 ? 100 : -100, duration: 4 + j, ease: 'sine.inOut', repeat: -1, yoyo: true });
  });
  gsap.to(qa('.a4-cactus'), { rotation: 1.5, transformOrigin: '50% 100%', duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true });
  gsap.to(qa('.a4-palm'), { rotation: 2, transformOrigin: '50% 100%', duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 0.7 });
  gsap.to(q('.a4-chop'), { rotation: -1, duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true });

  // 1. intro
  wordsIn('intro', 0.05, 0.03);
  tl.fromTo(q('.a4-chop'), { scale: 0, rotation: -40 }, { scale: 1, rotation: -4, duration: 0.5, ease: 'back.out(2)' }, 0);
  hide(panels.intro, 1.8);

  // 2. 1921
  show(panels.wed, 2.2);
  wordsIn('wed', 2.4, 0.03);
  tl.from(q('.a4-p-wed .a4-card'), { rotateY: 50, x: 60, duration: 0.5, transformPerspective: 800 }, 2.3);
  hide(panels.wed, 3.8);

  // 3. censo: se revela linea por linea (momento memorable)
  show(panels.census, 4.2);
  tl.from(q('.a4-doc-paper'), { scaleY: 0.85, transformOrigin: 'top center', duration: 0.5 }, 4.2);
  var lines = qa('.a4-line');
  gsap.set(lines, { clipPath: 'inset(0 100% 0 0)', opacity: 0.2 });
  tl.to(lines, { clipPath: 'inset(0 0% 0 0)', opacity: 1, stagger: 0.25, duration: 0.5, ease: 'power1.inOut' }, 4.6);
  hide(panels.census, 6.0);

  // 4. los hermanos se dispersan
  show(panels.bros, 6.4);
  wordsIn('bros', 6.6, 0.025);
  hide(panels.bros, 8.0);

  // 5. hijos y Maria de Lourdes
  show(panels.hijos, 8.4);
  wordsIn('hijos', 8.6, 0.03);
  tl.from(q('.a4-p-hijos .a4-card'), { rotateY: -50, x: -60, duration: 0.5, transformPerspective: 800 }, 8.5);
  hide(panels.hijos, 9.9);

  // 6. muerte y nacimiento (linea tenue)
  show(panels.end, 10.3);
  wordsIn('end', 10.5, 0.03);
  tl.to({}, { duration: 0.6 }, T);

  ScrollTrigger.addEventListener('refreshInit', function () { gsap.set(lines, { clearProps: 'clipPath' }); });
});
