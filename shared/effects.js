/**
 * Familia Yee Wong · 余黄氏
 * Dynamic effects: scroll animations, smooth nav, card interactions
 */

(function () {
  'use strict';

  /* ── 1. Fade-in on scroll ─────────────────────────────── */
  const fadeEls = document.querySelectorAll(
    '.fact-table, .forever-quote, .callout, .gold, .confirmed, .warn, ' +
    '.card-block, .evidence-row, h2, .hero-stat, .branch-card, ' +
    'section > div, .page > div, .forever-section > *'
  );

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('yw-visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach((el) => {
    el.classList.add('yw-fade');
    io.observe(el);
  });

  /* ── 2. Active nav link on scroll ────────────────────── */
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.site-nav a:not(.brand)');

  if (sections.length > 0 && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.getAttribute('id');
            navLinks.forEach((l) => {
              l.classList.toggle('active', l.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }

  /* ── 3. Smooth scroll for anchor links ───────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 4. Back to top button ───────────────────────────── */
  const btn = document.createElement('button');
  btn.id = 'yw-top';
  btn.setAttribute('aria-label', 'Volver arriba');
  btn.innerHTML = '&#8679;';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('yw-top-visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── 5. Nav shrink on scroll ─────────────────────────── */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('yw-nav-small', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── 6. Table row highlight on hover ─────────────────── */
  document.querySelectorAll('.fact-table tr, tbody tr').forEach((row) => {
    row.addEventListener('mouseenter', () => row.classList.add('yw-row-hover'));
    row.addEventListener('mouseleave', () => row.classList.remove('yw-row-hover'));
  });

  /* ── 7. Card tilt on hover (subtle) ──────────────────── */
  document.querySelectorAll('.branch-card, .stat-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 6;
      const y = ((e.clientY - r.top) / r.height - 0.5) * -6;
      card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

})();
