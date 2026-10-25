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

  /* Papeles: salen de una pila sobre la mesa y vuelan a su lugar */
  var cards = q('[data-a6-case]');
  var pile = function (card) {
    var tr = table.getBoundingClientRect(), r = card.getBoundingClientRect();
    return { x: tr.left + tr.width / 2 - (r.left + r.width / 2), y: tr.top - 60 - r.top };
  };
  cards.forEach(function (card, i) {
    var paper = card.querySelector('.a6-paper');
    var pin = document.createElement('i'); pin.className = 'a6-pin'; pin.setAttribute('aria-hidden', 'true');
    card.appendChild(pin);
    var restRot = i % 2 ? 0.5 : -0.6;
    gsap.fromTo(paper,
      { x: function () { return pile(card).x; }, y: function () { return pile(card).y; },
        rotation: gsap.utils.random(-30, 30), opacity: 0, scale: 0.7 },
      { x: 0, y: 0, rotation: restRot, opacity: 1, scale: 1, ease: 'back.out(1.1)',
        scrollTrigger: { trigger: card, start: 'top 98%', end: 'top 55%', scrub: 0.7, invalidateOnRefresh: true } });
    gsap.fromTo(pin, { scale: 0 }, { scale: 1, ease: 'back.out(3)',
      scrollTrigger: { trigger: card, start: 'top 60%', end: 'top 52%', scrub: true } });
    gsap.to(pin, { scale: 1.18, duration: 1.4 + (i % 3) * 0.3, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    /* Sello: golpe, shake, destello dorado y chispas */
    var stamp = card.querySelector('[data-a6-stamp]');
    var confirmed = stamp.classList.contains('a6-stamp--confirmed');
    gsap.set(stamp, { opacity: 0, scale: 3.2, rotation: confirmed ? -28 : 20 });
    ST.create({
      trigger: card, start: 'top 55%', once: true,
      onEnter: function () {
        var tl = gsap.timeline();
        tl.to(stamp, { opacity: confirmed ? 1 : 0.6, scale: 1, rotation: confirmed ? -12 : 8, duration: 0.2, ease: 'power4.in' })
          .add(function () { burst(paper, confirmed); })
          .to(card, { x: 5, y: 3, rotation: 0.8, duration: 0.04 })
          .to(card, { x: -5, y: -3, rotation: -0.8, duration: 0.04 })
          .to(card, { x: 3, y: 2, duration: 0.04 })
          .to(card, { x: -2, y: -1, duration: 0.04 })
          .to(card, { x: 0, y: 0, rotation: 0, duration: 0.12, ease: 'power2.out' });
        if (confirmed) gsap.to(stamp, { scale: 1.06, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.6 });
        else gsap.to(stamp, { rotation: 5, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.6 });
      }
    });
  });

  function burst(paper, confirmed) {
    var f = document.createElement('div'); f.className = 'a6-flash'; f.setAttribute('aria-hidden', 'true');
    paper.appendChild(f);
    gsap.fromTo(f, { opacity: confirmed ? 0.95 : 0.35, scale: 0.2 },
      { opacity: 0, scale: confirmed ? 1.5 : 1, duration: 0.7, ease: 'power2.out', onComplete: function () { f.remove(); } });
    if (!confirmed) return;
    var cx = paper.clientWidth - 12 - 34, cy = 12 + 34;
    for (var k = 0; k < 10; k++) {
      var s = document.createElement('i'); s.className = 'a6-spark'; s.setAttribute('aria-hidden', 'true');
      s.style.left = cx + 'px'; s.style.top = cy + 'px'; paper.appendChild(s);
      var a = (k / 10) * Math.PI * 2 + gsap.utils.random(-0.2, 0.2), d = gsap.utils.random(50, 100);
      gsap.to(s, { x: Math.cos(a) * d, y: Math.sin(a) * d, opacity: 0, scale: 0.2, duration: 0.8, ease: 'power2.out',
        onComplete: (function (n) { return function () { n.remove(); }; })(s) });
    }
  }

  /* Hilos rojos entre pistas, dibujados con el scroll */
  var links = [
    ['a6-c-aldea', 'a6-c-distrito', 0], ['a6-c-distrito', 'a6-c-altar', 0], ['a6-c-aldea', 'a6-c-altar', 1],
    ['a6-c-barco', 'a6-c-anio', 0], ['a6-c-llegada', 'a6-c-barco', 1],
    ['a6-c-parentesco', 'a6-c-poema', 0], ['a6-c-poema', 'a6-c-manuel', 0], ['a6-c-parentesco', 'a6-c-manuel', 1],
    ['a6-c-otronombre', 'a6-c-barco', 1], ['a6-c-lapaz', 'a6-c-llegada', 0]
  ];
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'a6-threads'); svg.setAttribute('aria-hidden', 'true');
  table.insertBefore(svg, table.firstChild);
  var threadST = [];

  function pinPos(id) {
    var el = document.getElementById(id);
    return { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop, el: el };
  }
  function buildThreads() {
    threadST.forEach(function (t) { t.kill(); }); threadST = [];
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var narrow = table.clientWidth < 720;
    links.forEach(function (l, i) {
      var a = pinPos(l[0]), b = pinPos(l[1]);
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      var sag = 40 + Math.abs(b.y - a.y) * 0.08;
      var bow = narrow ? (i % 2 ? 1 : -1) * Math.min(table.clientWidth / 2 - 4, 30 + Math.abs(b.y - a.y) * 0.12) : 0;
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', 'M' + a.x + ',' + a.y + ' Q' + (mx + bow) + ',' + (my + sag) + ' ' + b.x + ',' + b.y);
      p.setAttribute('class', 'a6-thread' + (l[2] ? ' a6-thread--gold' : ''));
      svg.appendChild(p);
      var len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      var later = a.y > b.y ? a.el : b.el;
      threadST.push(gsap.to(p, { strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: later, start: 'top 62%', end: 'top 22%', scrub: 0.6 } }).scrollTrigger);
    });
  }
  buildThreads();
  var tmr;
  window.addEventListener('resize', function () { clearTimeout(tmr); tmr = setTimeout(function () { buildThreads(); ST.refresh(); }, 250); });


});
