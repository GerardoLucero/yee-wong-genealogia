/* Acto 6: La investigacion. Tablero de detective: papeles vuelan y se apilan, sellos golpean, hilos rojos se dibujan. */
window.Santuario.register(6, function (ctx) {
  var gsap = ctx.gsap, ST = ctx.ScrollTrigger, sec = ctx.section;
  if (ctx.reduced || !gsap || !ST) return;
  var NS = 'http://www.w3.org/2000/svg';
  var q = function (s, r) { return Array.prototype.slice.call((r || sec).querySelectorAll(s)); };
  var table = sec.querySelector('[data-a6-table]');

  /* Texto por palabras (por caracter en chino) */
  function splitWords(el) {
    var out = [];
    q('[data-lang]', el).forEach(function (sp) {
      var txt = sp.textContent;
      var zh = sp.getAttribute('data-lang') === 'zh';
      var parts = zh ? txt.split('') : txt.split(/\s+/).filter(Boolean);
      sp.setAttribute('aria-label', txt);
      sp.textContent = '';
      parts.forEach(function (p, i) {
        var w = document.createElement('span');
        w.className = 'a6-w'; w.setAttribute('aria-hidden', 'true'); w.textContent = p;
        sp.appendChild(w);
        if (!zh && i < parts.length - 1) sp.appendChild(document.createTextNode(' '));
        out.push(w);
      });
    });
    return out;
  }
  function wordsIn(sel, vars, st) {
    var el = sec.querySelector(sel); if (!el) return;
    var ws = splitWords(el);
    gsap.fromTo(ws, { opacity: 0, y: 26, rotation: function () { return gsap.utils.random(-6, 6); } },
      Object.assign({ opacity: 1, y: 0, rotation: 0, ease: 'power3.out', stagger: 0.04 }, vars,
        { scrollTrigger: st(el) }));
  }
  wordsIn('.a6-title', { duration: 0.9 }, function (el) { return { trigger: el, start: 'top 85%', once: true }; });
  wordsIn('.a6-lede', { duration: 0.7, stagger: 0.025 }, function (el) { return { trigger: el, start: 'top 88%', once: true }; });
  wordsIn('.a6-credo p', { duration: 1, stagger: 0.12 }, function (el) { return { trigger: el, start: 'top 85%', once: true }; });

  q('[data-a6-block]').forEach(function (el) {
    var ws = splitWords(el);
    gsap.fromTo(ws, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* Mapa: escena fija a pantalla completa, secuencia por etapas */
  var scene = sec.querySelector('[data-a6-map]');
  if (scene) {
    scene.classList.add('a6-live');
    var byS = function (sel, s) { return q(sel + '[data-a6-s="' + s + '"]', scene); };
    var allNodes = q('[data-a6-node]', scene), allDraw = q('[data-a6-route], [data-a6-reveal]', scene);
    gsap.set(allNodes, { opacity: 0, transformOrigin: '50% 50%' });
    gsap.set(allDraw, { strokeDasharray: 100, strokeDashoffset: 100 });
    var beats = q('[data-a6-beat]', scene);
    gsap.set(beats, { opacity: 0, y: 10 });
    gsap.to(q('.a6-halo--pulse', scene), { attr: { r: 40 }, opacity: 0.05, duration: 1.4, repeat: -1, ease: 'sine.out' });
    gsap.to(q('.a6-halo--blink', scene), { opacity: 0.08, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to(q('.a6-node--q .a6-dot-n', scene), { opacity: 0.35, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    var tl = gsap.timeline({ defaults: { ease: 'none' },
      scrollTrigger: { trigger: scene, start: 'top top', end: '+=280%', pin: true, scrub: 0.8, anticipatePin: 1 } });
    for (var s = 1; s <= 7; s++) {
      var t = (s - 1) * 1.2;
      if (s > 1) tl.to(beats[s - 2], { opacity: 0, y: -10, duration: 0.25 }, t - 0.05);
      tl.to(byS('[data-a6-node]', s), { opacity: 1, scale: 1, duration: 0.35, stagger: 0.1 }, t);
      var dr = byS('[data-a6-route]', s).concat(byS('[data-a6-reveal]', s));
      if (dr.length) tl.to(dr, { strokeDashoffset: 0, duration: 0.7, stagger: 0.15 }, t + 0.3);
      tl.to(beats[s - 1], { opacity: 1, y: 0, duration: 0.3 }, t + 0.1);
    }
    tl.to({}, { duration: 0.6 });
  }

  /* Papeles: aparecen en su lugar al llegar a ellos (sin pilas ni hilos: nada se encima) */
  q('[data-a6-case]').forEach(function (card) {
    gsap.set(card, { opacity: 0, y: 22 });
    ST.create({ trigger: card, start: 'top 92%', once: true, onEnter: function () { gsap.to(card, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }); } });
  });
});
