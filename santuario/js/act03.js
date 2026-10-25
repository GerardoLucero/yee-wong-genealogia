(function () {
  'use strict';

  window.Santuario.register(3, function (ctx) {
    var gsap = ctx.gsap, ScrollTrigger = ctx.ScrollTrigger, root = ctx.section;
    var q = function (s) { return root.querySelector(s); };
    var qa = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

    var r1 = q('#a3-route-1'), r2 = q('#a3-route-2');
    var ship = q('.a3-ship');
    if (!r1 || !r2 || !ship) return;

    var L1 = r1.getTotalLength(), L2 = r2.getTotalLength(), LT = L1 + L2;
    var ORB_Y = 150;

    // Posicion y rumbo del barco a lo largo de las dos rutas
    function placeShip(p) {
      var d = p * LT;
      var path = d <= L1 ? r1 : r2;
      var local = d <= L1 ? d : d - L1;
      var a = path.getPointAtLength(Math.max(0, local - 1));
      var b = path.getPointAtLength(Math.min(path.getTotalLength(), local + 1));
      var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      // el casco no se voltea: solo se inclina suavemente
      var tilt = Math.max(-18, Math.min(18, ang * 0.35));
      ship.setAttribute('transform', 'translate(' + b.x.toFixed(1) + ' ' + b.y.toFixed(1) + ') rotate(' + tilt.toFixed(1) + ')');
    }

    function drawRoute(p) {
      var d = p * LT;
      r1.style.strokeDashoffset = L1 - Math.min(d, L1);
      // el tramo 2 es discontinuo: se revela con mascara de longitud via dasharray compuesto
      var shown2 = Math.max(0, d - L1);
      r2.style.strokeDasharray = shown2 <= 0 ? '0 ' + L2 : buildDash(shown2);
    }

    // tramo 2: patron 10/8 recortado hasta "shown" unidades
    function buildDash(shown) {
      var out = [], pos = 0, on = true;
      while (pos < shown) {
        var seg = on ? 10 : 8;
        var len = Math.min(seg, shown - pos);
        out.push(len);
        pos += len; on = !on;
      }
      if (out.length % 2 === 1) out.push(L2);
      else out.push(0, L2);
      return out.join(' ');
    }

    r1.style.strokeDasharray = L1;
    root.classList.add('a3-js');

    var cards = qa('.a3-card');
    var N = cards.length;
    var dayLayer = q('.a3-sky-day'), nightLayer = q('.a3-sky-night');
    var orb = q('.a3-orb'), sun = q('.a3-sun'), moon = q('.a3-moon');
    var stars = qa('.a3-stars circle');
    var waves = [q('.a3-wave-1'), q('.a3-wave-2'), q('.a3-wave-3')];
    var points = { hk: q('.a3-pt-hk'), sf: q('.a3-pt-sf'), bcs: q('.a3-pt-bcs') };

    // Estado estatico (reduced motion): ruta completa, barco al final, dia
    if (ctx.reduced) {
      root.classList.remove('a3-js');
      r1.style.strokeDashoffset = 0;
      r2.style.strokeDasharray = '10 8';
      placeShip(1);
      return;
    }

    // texto por palabras (solo texto, conserva el idioma activo del motor)
    function splitWords(el) {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      var nodes = [], n;
      while ((n = walker.nextNode())) { if (n.nodeValue.trim()) nodes.push(n); }
      nodes.forEach(function (t) {
        var frag = document.createDocumentFragment();
        var cjk = /[\u3000-\u9fff]/.test(t.nodeValue);
        var parts = cjk ? t.nodeValue.split('') : t.nodeValue.split(/(\s+)/);
        parts.forEach(function (w) {
          if (!w) return;
          if (!cjk && /^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          var sp = document.createElement('span');
          sp.className = 'a3-w'; sp.textContent = w;
          frag.appendChild(sp);
        });
        t.parentNode.replaceChild(frag, t);
      });
    }
    qa('.a3-lede, .a3-card-text').forEach(splitWords);

    var dusk = q('.a3-sky-dusk');
    var ridges = [q('.a3-ridge-1'), q('.a3-ridge-2')];
    var clouds = qa('.a3-cloud');
    var lanterns = qa('.a3-lantern');
    var stage = q('.a3-stage');

    // particulas doradas (max 36): ascienden y titilan en bucle
    var sparkBox = q('.a3-sparks');
    for (var i = 0; i < 36; i++) {
      var sp = document.createElement('span');
      sp.className = 'a3-spark';
      sparkBox.appendChild(sp);
      (function (el, k) {
        var x = Math.random() * 100, size = 2 + Math.random() * 4;
        gsap.set(el, { left: x + '%', top: (40 + Math.random() * 55) + '%', width: size, height: size });
        gsap.to(el, {
          y: -(60 + Math.random() * 140), x: (Math.random() - 0.5) * 60,
          opacity: 0.9, duration: 2.5 + Math.random() * 3, delay: Math.random() * 4,
          repeat: -1, ease: 'sine.inOut', yoyo: true, repeatRefresh: false
        });
      })(sp, i);
    }

    // olas y nubes en movimiento continuo, independiente del scroll
    waves.forEach(function (w, k) {
      gsap.to(w, { x: (k % 2 ? 1 : -1) * (30 + k * 14), duration: 5 + k * 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
    clouds.forEach(function (c, k) {
      gsap.to(c, { x: (k % 2 ? -1 : 1) * 70, duration: 18 + k * 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
    qa('.a3-seamarks path').forEach(function (m, k) {
      gsap.to(m, { x: 18, opacity: 0.15, duration: 2.6 + k * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
    gsap.to(qa('.a3-pt-dot'), { scale: 1.35, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.3, transformOrigin: '50% 50%' });

    gsap.set(nightLayer, { opacity: 0 });
    gsap.set(cards, { opacity: 0, y: 24 });
    drawRoute(0);
    placeShip(0);

    function orbAt(p) {
      // arco de izquierda a derecha sobre el mar
      var x = 120 + p * 760;
      var y = ORB_Y - Math.sin(Math.PI * p) * 100 + p * 30;
      orb.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
    }
    orbAt(0);

    var state = { p: 0, active: -1 };

    function setActive(i) {
      if (i === state.active) return;
      state.active = i;
      cards.forEach(function (c, k) {
        gsap.to(c, { opacity: k === i ? 1 : 0, y: k === i ? 0 : 24, duration: 0.45, overwrite: 'auto' });
        if (k === i) {
          gsap.fromTo(c.querySelectorAll('.a3-w'), { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.035, ease: 'power2.out', overwrite: 'auto' });
          gsap.fromTo(c, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power3.out', clearProps: 'clipPath' });
        }
      });
    }

    // Todo el viaje dura el scroll del pin. Los cuatro primeros quintos recorren el mar.
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: q('.a3-pin'),
        start: 'top top',
        end: '+=320%',
        pin: q('.a3-stage'),
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
        onUpdate: function (self) { setActive(Math.min(N - 1, Math.floor(self.progress * N * 0.9999))); }
      }
    });

    // progreso del viaje (0..1) y cielo dia a noche
    tl.to(state, {
      p: 1, ease: 'none', duration: 1,
      onUpdate: function () {
        var p = state.p;
        drawRoute(p);
        placeShip(p);
        orbAt(p);
      }
    }, 0);

    // dia -> noche: la noche cae a mitad del cruce (momento memorable)
    tl.to(nightLayer, { opacity: 1, ease: 'power1.inOut', duration: 0.5 }, 0.25);
    tl.to(sun, { opacity: 0, ease: 'none', duration: 0.3 }, 0.3);
    tl.to(moon, { opacity: 1, ease: 'none', duration: 0.3 }, 0.4);
    tl.to(stars, { opacity: 0.9, stagger: 0.02, ease: 'none', duration: 0.2 }, 0.45);
    // amanece el final: cielo vuelve a clarear al llegar a la peninsula
    tl.to(nightLayer, { opacity: 0.25, ease: 'power1.inOut', duration: 0.2 }, 0.8);
    tl.to(stars, { opacity: 0, ease: 'none', duration: 0.15 }, 0.82);
    tl.to(moon, { opacity: 0, ease: 'none', duration: 0.15 }, 0.82);
    tl.to(sun, { opacity: 1, ease: 'none', duration: 0.15 }, 0.85);

    // atardecer rojo sobre el horizonte entre dia y noche, y de nuevo al amanecer
    tl.to(dusk, { opacity: 0.85, ease: 'sine.inOut', duration: 0.2 }, 0.1);
    tl.to(dusk, { opacity: 0.15, ease: 'sine.inOut', duration: 0.25 }, 0.35);
    tl.to(dusk, { opacity: 0.7, ease: 'sine.inOut', duration: 0.15 }, 0.8);

    // parallax multicapa: montanas, nubes, faroles y mapa a distinta velocidad
    tl.to(ridges[0], { x: -60, ease: 'none', duration: 1 }, 0);
    tl.to(ridges[1], { x: -25, ease: 'none', duration: 1 }, 0);
    tl.to(clouds, { xPercent: -40, ease: 'none', duration: 1 }, 0);
    tl.to(q('.a3-lanterns'), { y: 30, ease: 'none', duration: 1 }, 0);
    tl.to(q('.a3-map'), { scale: 1.06, transformOrigin: '50% 50%', ease: 'none', duration: 1 }, 0);

    // olas con parallax: cada capa a distinta velocidad
    tl.to(waves[0], { xPercent: -8, ease: 'none', duration: 1 }, 0);
    tl.to(waves[1], { xPercent: 6, ease: 'none', duration: 1 }, 0);
    tl.to(waves[2], { xPercent: -4, ease: 'none', duration: 1 }, 0);

    // balanceo suave del barco independiente del scroll
    gsap.to(q('.a3-ship-bob'), { y: -3, rotation: 3, transformOrigin: '50% 100%', duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    // marcadores: pulso en los hitos que se alcanzan
    function pulse(el) {
      var ring = el.querySelector('.a3-pt-ring');
      if (!ring) return;
      gsap.fromTo(ring, { scale: 1, opacity: 0.9 }, { scale: 2.2, opacity: 0, duration: 1.2, ease: 'power2.out' });
    }
    var reached = { hk: false, sf: false, bcs: false };
    ScrollTrigger.create({
      trigger: q('.a3-pin'),
      start: 'top top',
      end: '+=320%',
      onUpdate: function (self) {
        var d = self.progress * LT;
        if (!reached.hk && self.progress > 0.01) { reached.hk = true; pulse(points.hk); }
        if (!reached.sf && d >= L1) { reached.sf = true; pulse(points.sf); }
        if (!reached.bcs && self.progress > 0.99) { reached.bcs = true; pulse(points.bcs); }
        if (self.progress < 0.005) { reached.hk = reached.sf = reached.bcs = false; }
      }
    });

    // entrada de la cabecera: titulo emerge como tinta, lede palabra por palabra
    gsap.from(q('.a3-kicker'), { opacity: 0, letterSpacing: '0.8em', duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: q('.a3-intro'), start: 'top 75%' } });
    gsap.from(q('.a3-title'), { opacity: 0, filter: 'blur(14px)', clipPath: 'inset(0 100% 0 0)', duration: 1.4, ease: 'power3.out',
      clearProps: 'filter,clipPath', scrollTrigger: { trigger: q('.a3-intro'), start: 'top 75%' } });
    gsap.from(qa('.a3-lede .a3-w'), { opacity: 0, y: 14, stagger: 0.04, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: q('.a3-lede'), start: 'top 85%' } });
    gsap.from(q('.a3-context'), { opacity: 0, y: 24, duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: q('.a3-context'), start: 'top 90%' } });

    // el hilo rojo-oro de la linea de tiempo se dibuja con el scroll
    gsap.fromTo(q('.a3-tl'), { '--a3-fill': 0 }, { '--a3-fill': 1, ease: 'none',
      scrollTrigger: { trigger: q('.a3-tl'), start: 'top 70%', end: 'bottom 70%', scrub: 0.6 } });

    // linea de tiempo: los items aparecen al entrar
    qa('.a3-tl-item').forEach(function (el) {
      gsap.from(el, {
        opacity: 0, x: -30, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  });
})();
