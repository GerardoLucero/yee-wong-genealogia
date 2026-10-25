/* Santuario Yee Wong: motor. API: window.Santuario */
(function () {
  'use strict';

  var LANGS = ['es', 'en', 'zh'];
  var LANG_LABEL = { es: 'ES', en: 'EN', zh: '中文' };
  var STORE_KEY = 'santuario.lang';
  var UI = {
    menu: { es: 'Actos', en: 'Acts', zh: '章节' },
    audio: { es: 'Sonido', en: 'Sound', zh: '声音' },
    hint: { es: 'desliza', en: 'scroll', zh: '下滑' },
    reduced: {
      es: 'Movimiento reducido: la historia se muestra sin animaciones.',
      en: 'Reduced motion: the story is shown without animation.',
      zh: '已减少动效：内容以静态方式呈现。'
    },
    progress: { es: 'Progreso de la historia', en: 'Story progress', zh: '故事进度' }
  };

  var registry = {};      // n -> fn
  var started = false;
  var reduced = false;
  var gsap = null;
  var ST = null;
  var state = { lang: 'es', audioOn: false };
  var audioBtn = null;

  function log(msg, err) {
    if (window.console) { (err ? console.error : console.warn)('[Santuario] ' + msg, err || ''); }
  }

  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    if (attrs) { Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); }); }
    if (html) { node.innerHTML = html; }
    return node;
  }

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function trilingual(map) {
    return LANGS.map(function (l) { return '<span data-lang="' + l + '">' + esc(map[l]) + '</span>'; }).join('');
  }

  function actSection(n) {
    return document.querySelector('.act[data-act="' + n + '"]');
  }

  /* ---------- idioma ---------- */
  function readStoredLang() {
    try { var v = localStorage.getItem(STORE_KEY); if (LANGS.indexOf(v) >= 0) { return v; } } catch (e) { /* sin storage */ }
    return null;
  }

  function guessLang() {
    var nav = (navigator.language || 'es').toLowerCase();
    if (nav.indexOf('zh') === 0) { return 'zh'; }
    // La historia es de una familia hispanohablante: espanol por defecto; ingles y chino se eligen en el selector.
    return 'es';
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) < 0) { return; }
    state.lang = lang;
    var root = document.documentElement;
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'zh' ? 'zh-Hans' : lang);
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* sin storage */ }
    var btns = document.querySelectorAll('.sn-lang button');
    Array.prototype.forEach.call(btns, function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-set-lang') === lang ? 'true' : 'false');
    });
    document.dispatchEvent(new CustomEvent('santuario:lang', { detail: { lang: lang } }));
    refreshSoon();
  }

  /* ---------- audio ---------- */
  function toggleAudio() {
    var on = state.audioOn;
    try {
      if (window.SantuarioAudio && typeof window.SantuarioAudio.toggle === 'function') {
        var r = window.SantuarioAudio.toggle();
        on = (typeof r === 'boolean') ? r : !state.audioOn;
      } else {
        on = false; // sin modulo de audio: se queda apagado
      }
    } catch (err) { log('audio fallo', err); on = false; }
    state.audioOn = on;
    if (audioBtn) {
      audioBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      audioBtn.classList.toggle('is-on', on);
    }
    return on;
  }

  // Aviso discreto "Mejor con sonido": nunca autoplay, solo un clic del usuario lo enciende.
  function buildSoundHint(parts) {
    var texts = {
      first: { es: 'Mejor con sonido', en: 'Best with sound', zh: '开启声音效果更佳' },
      last: { es: 'Con sonido, el final se siente distinto', en: 'With sound, the ending feels different', zh: '开启声音，结局更动人' }
    };
    var btn = el('button', { type: 'button', 'class': 'sn-soundhint' });
    btn.hidden = true;
    document.body.appendChild(btn);
    var hideTimer = null;

    function hide() {
      clearTimeout(hideTimer);
      btn.classList.remove('is-shown');
      setTimeout(function () { btn.hidden = true; }, reduced ? 0 : 500);
    }
    function show(kind) {
      if (state.audioOn || !window.SantuarioAudio) { return; }
      btn.innerHTML = trilingual(texts[kind]);
      btn.hidden = false;
      void btn.offsetWidth; // reflow para que la transicion corra
      btn.classList.add('is-shown');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, reduced ? 6000 : 7000);
    }
    btn.addEventListener('click', function () {
      if (!state.audioOn) { toggleAudio(); }
      hide();
    });

    setTimeout(function () { show('first'); }, 3500);

    var last = parts.acts[parts.acts.length - 1];
    if (ST && last && last.getAttribute('data-act') === '7') {
      var armed = true;
      ST.create({
        trigger: last,
        start: 'top 70%',
        end: 'bottom top',
        onEnter: function () { if (armed) { armed = false; show('last'); } },
        onLeaveBack: function () { armed = true; hide(); }
      });
    }
  }

  /* ---------- chrome ---------- */
  function buildChrome() {
    var acts = Array.prototype.slice.call(document.querySelectorAll('.act[data-act]'));
    var chrome = el('div', { 'class': 'sn-chrome' });

    // barra de progreso tipo rollo de pelicula
    var bar = el('div', { 'class': 'sn-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' });
    bar.setAttribute('aria-label', UI.progress[state.lang]);
    bar.innerHTML = '<div class="sn-progress__fill"></div><div class="sn-progress__perf"></div>';
    chrome.appendChild(bar);

    // menu de actos
    var nav = el('nav', { 'class': 'sn-acts', 'aria-label': 'Actos' });
    var list = el('ol', { 'class': 'sn-acts__list' });
    acts.forEach(function (s) {
      var n = s.getAttribute('data-act');
      var li = el('li');
      var a = el('a', { 'class': 'sn-acts__dot', href: '#' + (s.id || 'acto' + n), 'data-go': n });
      var titles = {
        es: s.getAttribute('data-title-es') || ('Acto ' + n),
        en: s.getAttribute('data-title-en') || ('Act ' + n),
        zh: s.getAttribute('data-title-zh') || n
      };
      a.innerHTML = '<span class="sn-acts__num">' + n + '</span><span class="sn-acts__title">' + trilingual(titles) + '</span>';
      li.appendChild(a);
      list.appendChild(li);
    });
    nav.appendChild(list);
    chrome.appendChild(nav);

    // controles: idioma + audio
    var tools = el('div', { 'class': 'sn-tools' });
    var lang = el('div', { 'class': 'sn-lang', role: 'group', 'aria-label': 'Idioma / Language / 语言' });
    LANGS.forEach(function (l) {
      var b = el('button', { type: 'button', 'data-set-lang': l, 'aria-pressed': 'false' }, LANG_LABEL[l]);
      lang.appendChild(b);
    });
    tools.appendChild(lang);
    var audio = el('button', { type: 'button', 'class': 'sn-audio', 'aria-pressed': 'false' },
      '<span class="sn-audio__icon" aria-hidden="true"></span>' + trilingual(UI.audio));
    tools.appendChild(audio);
    chrome.appendChild(tools);

    document.body.appendChild(chrome);

    // eventos
    nav.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-go]') : null;
      if (!a) { return; }
      e.preventDefault();
      goToAct(a.getAttribute('data-go'));
    });
    lang.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-set-lang]') : null;
      if (b) { setLang(b.getAttribute('data-set-lang')); }
    });
    audioBtn = audio;
    audio.addEventListener('click', toggleAudio);

    return { bar: bar, acts: acts, nav: nav };
  }

  function goToAct(n) {
    var s = actSection(n);
    if (!s) { return; }
    var top = s.getBoundingClientRect().top + window.pageYOffset;
    // con pin, el inicio del acto es el start del pin; la posicion de la seccion basta
    if (!reduced && window.history && history.replaceState) { try { history.replaceState(null, '', '#' + s.id); } catch (e) { /* noop */ } }
    window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
  }

  function wireProgress(parts) {
    var fill = parts.bar.querySelector('.sn-progress__fill');
    if (!ST || !gsap) {
      window.addEventListener('scroll', function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? window.pageYOffset / max : 0;
        fill.style.transform = 'scaleX(' + p + ')';
      }, { passive: true });
      return;
    }
    ST.create({
      trigger: document.documentElement,
      start: 0,
      end: 'max',
      onUpdate: function (self) {
        fill.style.transform = 'scaleX(' + self.progress + ')';
        parts.bar.setAttribute('aria-valuenow', String(Math.round(self.progress * 100)));
      }
    });
    // acto actual en el menu
    parts.acts.forEach(function (s) {
      var n = s.getAttribute('data-act');
      ST.create({
        trigger: s,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: function (self) {
          var dot = parts.nav.querySelector('[data-go="' + n + '"]');
          if (dot) {
            dot.classList.toggle('is-current', self.isActive);
            if (self.isActive) { dot.setAttribute('aria-current', 'true'); } else { dot.removeAttribute('aria-current'); }
          }
        }
      });
    });
  }

  function wireHint(first) {
    if (!first) { return; }
    var hint = el('div', { 'class': 'sn-hint', 'aria-hidden': 'true' },
      '<span class="sn-hint__text">' + trilingual(UI.hint) + '</span><span class="sn-hint__line"></span>');
    document.body.appendChild(hint);
    var gone = false;
    function hide() {
      if (gone) { return; }
      gone = true;
      hint.classList.add('is-gone');
      window.removeEventListener('scroll', onScroll);
    }
    function onScroll() { if (window.pageYOffset > 40) { hide(); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    setTimeout(hide, 12000);
  }

  function showReducedNotice() {
    var note = el('div', { 'class': 'sn-notice', role: 'status' }, trilingual(UI.reduced));
    var close = el('button', { type: 'button', 'class': 'sn-notice__close', 'aria-label': 'OK' }, 'OK');
    close.addEventListener('click', function () { if (note.parentNode) { note.parentNode.removeChild(note); } });
    note.appendChild(close);
    document.body.appendChild(note);
    setTimeout(function () { if (note.parentNode) { note.parentNode.removeChild(note); } }, 9000);
  }


  /* ---------- efectos globales: cortina, titulos de cine, cursor, 余 ---------- */
  var ACT_WORD = { es: 'Acto', en: 'Act', zh: '第' };

  function buildFx(parts) {
    if (reduced || !gsap || !ST) { return; }
    var fx = el('div', { 'class': 'sn-fx', 'aria-hidden': 'true' });
    fx.innerHTML =
      '<div class="sn-curtain sn-curtain--red"></div>' +
      '<div class="sn-curtain sn-curtain--gold"></div>' +
      '<div class="sn-cine"><div class="sn-cine__num"></div><div class="sn-cine__title"></div>' +
      '<div class="sn-cine__rule"></div></div>';
    document.body.appendChild(fx);
    var red = fx.querySelector('.sn-curtain--red');
    var gold = fx.querySelector('.sn-curtain--gold');
    var cine = fx.querySelector('.sn-cine');
    var numEl = fx.querySelector('.sn-cine__num');
    var titleEl = fx.querySelector('.sn-cine__title');
    var rule = fx.querySelector('.sn-cine__rule');

    var tl = null;
    var shown = null;
    var pending = null;
    var timer = null;

    function fill(section) {
      var n = section.getAttribute('data-act');
      var t = {
        es: section.getAttribute('data-title-es') || '',
        en: section.getAttribute('data-title-en') || '',
        zh: section.getAttribute('data-title-zh') || ''
      };
      numEl.innerHTML = trilingual({
        es: ACT_WORD.es + ' ' + n, en: ACT_WORD.en + ' ' + n, zh: ACT_WORD.zh + n + '章'
      });
      titleEl.innerHTML = trilingual(t);
    }

    function play(section, withCurtain) {
      if (tl) { tl.kill(); }
      fill(section);
      gsap.set([red, gold], { xPercent: -101, autoAlpha: 1 });
      gsap.set(cine, { autoAlpha: 0 });
      gsap.set([numEl, titleEl], { autoAlpha: 0, y: 24 });
      gsap.set(rule, { scaleX: 0 });
      tl = gsap.timeline({ onComplete: function () { gsap.set([red, gold, cine], { autoAlpha: 0 }); } });
      if (withCurtain) {
        tl.to(red, { xPercent: 0, duration: 0.45, ease: 'power3.in' }, 0)
          .to(gold, { xPercent: 0, duration: 0.45, ease: 'power3.in' }, 0.12);
      }
      var t0 = withCurtain ? 0.6 : 0;
      tl.set(cine, { autoAlpha: 1 }, t0)
        .to(numEl, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, t0)
        .to(titleEl, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, t0 + 0.15)
        .to(rule, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, t0 + 0.2)
        .to([numEl, titleEl, rule], { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, t0 + 1.7);
      if (withCurtain) {
        tl.to(red, { xPercent: 101, duration: 0.6, ease: 'power3.out' }, t0 + 1.3)
          .to(gold, { xPercent: 101, duration: 0.6, ease: 'power3.out' }, t0 + 1.2);
      } else {
        tl.to(cine, { autoAlpha: 0, duration: 0.3 }, t0 + 2.2);
      }
    }

    function schedule(section) {
      pending = section;
      clearTimeout(timer);
      timer = setTimeout(function () {
        var n = pending.getAttribute('data-act');
        if (n === shown) { return; }
        play(pending, shown !== null);
        shown = n;
      }, 260);
    }

    parts.acts.forEach(function (s) {
      ST.create({
        trigger: s,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: function (self) { if (self.isActive) { schedule(s); } }
      });
    });

    // brillo dorado del cursor (solo con puntero fino)
    if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var glow = el('div', { 'class': 'sn-glow', 'aria-hidden': 'true' });
      document.body.appendChild(glow);
      var gx = gsap.quickTo(glow, 'x', { duration: 0.35, ease: 'power3.out' });
      var gy = gsap.quickTo(glow, 'y', { duration: 0.35, ease: 'power3.out' });
      window.addEventListener('pointermove', function (e) {
        glow.classList.add('is-on');
        gx(e.clientX);
        gy(e.clientY);
      }, { passive: true });
      document.addEventListener('pointerleave', function () { glow.classList.remove('is-on'); });
    }
  }

  function buildSeal() {
    if (reduced) { return; }
    var seal = el('div', { 'class': 'sn-seal', 'aria-hidden': 'true' }, '<span class="sn-seal__han">余</span>');
    document.body.appendChild(seal);
  }

  /* ---------- actos ---------- */
  function initAct(n) {
    var fn = registry[n];
    var section = actSection(n);
    if (!fn) { return; }
    if (!section) { log('acto ' + n + ' registrado pero sin <section> en el HTML'); return; }
    try {
      fn({ gsap: gsap, ScrollTrigger: ST, section: section, reduced: reduced });
      section.classList.add('is-ready');
    } catch (err) {
      section.classList.add('is-broken');
      log('acto ' + n + ' fallo al iniciar; el resto sigue', err);
    }
  }

  function register(n, fn) {
    n = Number(n);
    if (typeof fn !== 'function') { log('register(' + n + ') sin funcion'); return; }
    registry[n] = fn;
    if (started) { initAct(n); refreshSoon(); }
  }

  var refreshTimer = null;
  function refreshSoon() {
    if (!ST) { return; }
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () { try { ST.refresh(); } catch (e) { /* noop */ } }, 120);
  }

  function watchAssets() {
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(refreshSoon); }
    window.addEventListener('load', refreshSoon);
    Array.prototype.forEach.call(document.images, function (img) {
      if (!img.complete) {
        img.addEventListener('load', refreshSoon, { once: true });
        img.addEventListener('error', refreshSoon, { once: true });
      }
    });
    window.addEventListener('orientationchange', refreshSoon);
  }

  function start() {
    if (started) { return; }
    started = true;
    var root = document.documentElement;

    var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    reduced = !!(mq && mq.matches);
    if (mq && mq.addEventListener) {
      mq.addEventListener('change', function () { window.location.reload(); });
    }
    root.classList.add('sn-js');
    if (reduced) { root.classList.add('sn-reduced'); }

    gsap = window.gsap || null;
    ST = window.ScrollTrigger || null;
    if (gsap && ST) {
      try { gsap.registerPlugin(ST); } catch (e) { log('registerPlugin fallo', e); }
    } else {
      log('GSAP/ScrollTrigger no cargaron: la pagina queda estatica');
      reduced = true; // sin libs, que cada acto muestre su version estatica
      root.classList.add('sn-reduced');
    }

    setLang(readStoredLang() || guessLang());
    var parts = buildChrome();
    setLang(state.lang); // marca botones ahora que existen
    if (reduced) { showReducedNotice(); }

    Object.keys(registry).map(Number).sort(function (a, b) { return a - b; }).forEach(initAct);

    wireProgress(parts);
    buildSoundHint(parts);
    buildFx(parts);
    buildSeal();
    wireHint(parts.acts[0]);
    watchAssets();
    refreshSoon();

    // ancla inicial (ej. /#acto4) tras montar pins
    if (location.hash) {
      setTimeout(function () {
        var t = document.querySelector(location.hash);
        if (t) { window.scrollTo(0, t.getBoundingClientRect().top + window.pageYOffset); }
      }, 400);
    }
  }

  window.Santuario = {
    register: register,
    goTo: goToAct,
    setLang: setLang,
    get lang() { return state.lang; },
    get reduced() { return reduced; },
    refresh: refreshSoon,
    version: '1.0.0'
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
