/* Acto 1: El umbral */
window.Santuario.register(1, function (ctx) {
  var gsap = ctx.gsap, ST = ctx.ScrollTrigger, sec = ctx.section;
  var q = function (s) { return sec.querySelector(s); };
  var qa = function (s) { return sec.querySelectorAll(s); };
  var strokes = sec.querySelectorAll('.a1-stroke');
  var title = q('.a1-title'), hint = q('.a1-hint'), glow = q('.a1-glow'),
      lamp = qa('.a1-lamp'), cord = qa('.a1-cord'), lans = qa('.a1-lan'), red = q('.a1-red'), rays = q('.a1-rays'), wash = q('.a1-wash'),
      char = q('.a1-char'), canvas = q('.a1-motes'), stage = q('.a1-stage');

  var lnAll = qa('.a1-ln');
  if (!ctx.reduced) sec.classList.add('a1-js');
  if (ctx.reduced) { if (canvas) canvas.style.display = 'none'; return; }

  /* Titulo por palabras */
  var words = [];
  title.querySelectorAll('[data-lang]').forEach(function (el) {
    var t = el.textContent.trim(); el.textContent = '';
    t.split(/\s+/).forEach(function (w, i, a) {
      var sp = document.createElement('span'); sp.className = 'a1-w'; sp.textContent = w; el.appendChild(sp);
      if (i < a.length - 1) el.appendChild(document.createTextNode(' '));
      words.push(sp);
    });
  });
  var wLang = words;

  /* Luciernagas lentas (max 40) */
  var cx = canvas.getContext('2d'), W = 0, H = 0, dots = [], raf = 0, visible = true;
  function size() {
    var r = canvas.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.round(r.width * d); H = canvas.height = Math.round(r.height * d);
  }
  size(); window.addEventListener('resize', size);
  var n = window.innerWidth < 600 ? 30 : 56;
  for (var i = 0; i < n; i++) {
    dots.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.8, p: Math.random() * 6.28, s: .00006 + Math.random() * .00014, a: Math.random() * 6.28 });
  }
  var gold = (getComputedStyle(document.documentElement).getPropertyValue('--gold') || '#c9a24a').trim();
  function draw(t) {
    raf = requestAnimationFrame(draw);
    if (!visible) return;
    cx.clearRect(0, 0, W, H);
    cx.fillStyle = gold;
    for (var i = 0; i < dots.length; i++) {
      var o = dots[i];
      o.a += .0004; o.x += Math.cos(o.a) * o.s * 16; o.y += Math.sin(o.a * 1.3) * o.s * 12;
      if (o.x < 0) o.x = 1; if (o.x > 1) o.x = 0; if (o.y < 0) o.y = 1; if (o.y > 1) o.y = 0;
      cx.globalAlpha = (.25 + .75 * Math.abs(Math.sin(t * .0007 + o.p))) * .8;
      cx.shadowColor = gold; cx.shadowBlur = 10 * (W / 1000 + 1);
      cx.beginPath(); cx.arc(o.x * W, o.y * H, o.r * (W / 700 + 1), 0, 6.28); cx.fill();
    }
  }
  raf = requestAnimationFrame(draw);
  ST.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: function (s) { visible = s.isActive; } });

  /* Estado inicial: oscuridad total */
  gsap.set(glow, { '--a1-r': '0%' });
  gsap.set(lamp, { opacity: 0, scale: .6 });
  gsap.set(cord, { opacity: 0 });
  gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(char, { opacity: .001, transformOrigin: '50% 50%' });
  gsap.set(title, { opacity: 1 });
  gsap.set(wLang, { opacity: 0, y: 40, rotationX: -70, filter: 'blur(8px)' });
  gsap.set([red, rays], { opacity: 0 });
  gsap.set(hint, { opacity: 0 });
  gsap.set(lnAll, { opacity: 0 });

  /* Intro automatico: el farol se enciende (sin scroll) */
  gsap.timeline({ delay: .4 })
    .to(cord, { opacity: .6, duration: 1.2, ease: 'power1.out', stagger: .25 })
    .to(lamp, { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out', stagger: .25 }, '-=.4')
    .to(red, { opacity: .55, duration: 3 }, '-=1.2')
    .to(rays, { opacity: .16, duration: 3 }, '<')
    .to(glow, { '--a1-r': '70%', duration: 2.6, ease: 'power2.out' }, '-=1.2')
    .to(hint, { opacity: .65, duration: 1.2 }, '-=.6');

  /* Momento memorable: el caracter se dibuja al ritmo del scroll, con pin */
  var tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: sec, start: 'top top', end: '+=520%', scrub: .8, pin: stage, anticipatePin: 1 }
  });
  tl.set(char, { opacity: 1 }, 0)
    .to(glow, { '--a1-r': '120%', duration: 1 }, 0)
    .to(hint, { opacity: 0, duration: .3 }, 0)
    .to(strokes, { strokeDashoffset: 0, duration: 1.2, stagger: 1.1, ease: 'power1.inOut' }, .3)
    .to(char, { scale: 1.12, duration: 3 }, 0.3)
    .to(rays, { opacity: .3, duration: 2 }, 1)
    .to(canvas, { scale: 1.25, duration: 8 }, 0)
    .to(wLang, { opacity: 1, y: 0, rotationX: 0, filter: 'blur(0px)', duration: 1, stagger: .35, ease: 'power3.out' }, '>-1')
    .to({}, { duration: 1 })
    /* Carta a Miguel: una linea a la vez, con silencio entre ellas */
    .to([title, hint], { opacity: 0, y: -20, duration: 1 })
    .to(char, { opacity: .18, scale: 1.4, duration: 1.2 }, '<')
    .to({}, { duration: .8 });
  lnAll.forEach(function (ln, i) {
    var last = i === lnAll.length - 1;
    tl.fromTo(ln, { opacity: 0, y: 16, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power2.out' });
    tl.to({}, { duration: last ? 1.8 : 1.4 });
    if (!last) tl.to(ln, { opacity: 0, filter: 'blur(8px)', duration: 1 }).to({}, { duration: 1.1 });
  });
  tl.to({}, { duration: .6 })
    /* Tinta que se extiende hacia la aldea */
    .set(wash, { opacity: 1 })
    .to(wash, { scale: 3.4, duration: 3, ease: 'power2.in' })
    .to([char, lnAll[lnAll.length - 1], title, lans, '.a1-motes', red, rays], { opacity: 0, duration: 1.5 }, '<1');

  window.addEventListener('pagehide', function () { cancelAnimationFrame(raf); });
});
