/* Acto 2: La aldea */
window.Santuario.register(2, function (ctx) {
  var gsap = ctx.gsap, sec = ctx.section;
  var q = function (s) { return sec.querySelector(s); };
  var qa = function (s) { return sec.querySelectorAll(s); };
  if (ctx.reduced) return;

  var lines = qa('.a2-line-in'), names = qa('.a2-name'), cap = q('.a2-name-cap'),
      lead = q('.a2-village-lead'), cands = qa('.a2-cand'), seal = q('.a2-seal'), close = q('.a2-close'),
      evoc = q('.a2-evoc');

  /* Polvo de luz dorada (decorativo) */
  var dust = q('.a2-dust');
  for (var d = 0; d < (window.innerWidth < 600 ? 14 : 26); d++) {
    var m = document.createElement('i'); m.className = 'a2-mote';
    m.style.left = (Math.random() * 100) + '%';
    m.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    m.style.animationDuration = (9 + Math.random() * 12) + 's';
    m.style.animationDelay = (-Math.random() * 18) + 's';
    dust.appendChild(m);
  }

  /* Split manual por palabras */
  var words = [];
  lines.forEach(function (ln) {
    var perLine = [];
    ln.querySelectorAll('[data-lang]').forEach(function (el) {
      var t = el.textContent.trim(); el.textContent = '';
      t.split(/\s+/).forEach(function (w, i, a) {
        var sp = document.createElement('span'); sp.className = 'a2-w'; sp.textContent = w; el.appendChild(sp);
        if (i < a.length - 1) el.appendChild(document.createTextNode(' '));
        perLine.push(sp);
      });
    });
    words.push(perLine);
  });
  var brush = q('.a2-brush path'), sun = q('.a2-sun');
  gsap.set(brush, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(sun, { yPercent: 90, scale: .7 });

  /* Estado inicial (el contenido es visible sin JS) */
  words.forEach(function (w) { gsap.set(w, { yPercent: 120, opacity: 0, rotation: 4 }); });
  gsap.set(names, { opacity: 0, filter: 'blur(14px)', scale: 1.15 });
  gsap.set([cap, lead, evoc], { opacity: 0, y: 12 });
  gsap.set(close, { opacity: 0, y: 12 });
  gsap.set(cands, { opacity: 0, y: 18 });
  gsap.set(seal, { opacity: 0, scale: 1.9, rotation: -22 });
  gsap.set(qa('.a2-fog'), { xPercent: 0 });

  var tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: sec, start: 'top top', end: '+=560%', scrub: 1, pin: q('.a2-stage'), anticipatePin: 1 }
  });

  /* Camara de dron: las capas cercanas suben y crecen mas que las lejanas */
  tl.fromTo(q('.a2-l1'), { yPercent: 8, scale: 1 }, { yPercent: 0, scale: 1.04, duration: 18 }, 0)
    .fromTo(q('.a2-l2'), { yPercent: 14, scale: 1 }, { yPercent: 0, scale: 1.08, duration: 18 }, 0)
    .fromTo(q('.a2-l3'), { yPercent: 24, scale: 1 }, { yPercent: 0, scale: 1.14, duration: 18 }, 0)
    .fromTo(q('.a2-l4'), { yPercent: 40, scale: 1 }, { yPercent: 0, scale: 1.22, duration: 18 }, 0)
    .to(q('.a2-fog1'), { xPercent: -22, duration: 18 }, 0)
    .to(q('.a2-fog2'), { xPercent: 18, duration: 18 }, 0)
    .to(q('.a2-fog3'), { xPercent: -30, duration: 18 }, 0)
    .to(evoc, { opacity: .6, y: 0, duration: 1 }, 0.5);

  /* Texto que emerge por lineas (split manual) */
  words.forEach(function (w, i) {
    tl.to(w, { yPercent: 0, opacity: 1, rotation: 0, duration: .8, stagger: .12, ease: 'power3.out' }, 0.8 + i * 1.6);
  });
  tl.to(sun, { yPercent: -10, scale: 1.1, duration: 18 }, 0)
    .to(sun, { filter: 'brightness(1.25)', duration: 4 }, 9.5);

  /* Momento memorable: los nombres se condensan de la niebla como tinta */
  /* Las lineas de leyenda ceden el espacio a los nombres */
  tl.to(qa('.a2-line'), { opacity: 0, height: 0, duration: 1.2, ease: 'power1.in' }, 8.8);
  tl.to(names, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.8, stagger: 1.2, ease: 'power2.out' }, 9.5)
    .to(cap, { opacity: .75, y: 0, duration: 1 }, 11.8)
    .to(brush, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 11.1)
    /* La aldea queda por confirmar */
    .to(lead, { opacity: 1, y: 0, duration: 1 }, 12.9)
    .to(cands, { opacity: 1, y: 0, duration: 1, stagger: .5, ease: 'power2.out' }, 13.5)
    .to(seal, { opacity: 1, scale: 1, rotation: -8, duration: .6, ease: 'back.out(2)' }, 14.7)
    .to(close, { opacity: 1, y: 0, duration: 1.2 }, 15.5)
    .to({}, { duration: 1.4 });
});
