/**
 * Familia Yee Wong · 余黄氏
 * Dynamic effects: scroll animations, smooth nav, card interactions
 */

(function () {
  'use strict';

  /* ── 1. Fade-in on scroll ─────────────────────────────────────
     ONLY elements below the fold get the fade treatment.
     Elements already visible on load appear instantly.
  ─────────────────────────────────────────────────────────────── */
  const FOLD = window.innerHeight;

  const fadeTargets = document.querySelectorAll(
    '.fact-table, .forever-quote, .callout, .gold, .confirmed, .warn, ' +
    '.branch-card, .stat-card, .nav-card, .acto-block, .pendiente-row'
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
    { threshold: 0.06 }
  );

  fadeTargets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top > FOLD) {
      // Below the fold: animate in when scrolled to
      el.classList.add('yw-fade');
      io.observe(el);
    } else {
      // Already visible: show immediately
      el.classList.add('yw-visible');
    }
  });

  /* ── 2. Smooth scroll for anchor links ───────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 3. Back to top button ───────────────────────────────── */
  const btn = document.createElement('button');
  btn.id = 'yw-top';
  btn.setAttribute('aria-label', 'Volver arriba');
  btn.textContent = '\u2191';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('yw-top-visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── 4. Nav shrink on scroll ─────────────────────────────── */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('yw-nav-small', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── 5. Table row highlight on hover ─────────────────────── */
  document.querySelectorAll('.fact-table tr').forEach((row) => {
    row.addEventListener('mouseenter', () => row.classList.add('yw-row-hover'));
    row.addEventListener('mouseleave', () => row.classList.remove('yw-row-hover'));
  });

  /* ── 6. Card lift on hover ───────────────────────────────── */
  document.querySelectorAll('.branch-card, .stat-card, .nav-card').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
      card.style.boxShadow = '0 8px 28px rgba(15,39,68,0.15)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });

})();
