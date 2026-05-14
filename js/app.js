/**
 * app.js — Main JavaScript for Dan Elfassi / Mahane Israel consulting proposal site
 * Vanilla JS, no dependencies. Premium scroll effects and UI interactions.
 */

'use strict';

/* ============================================================
   1. SCROLL REVEAL — IntersectionObserver
   ============================================================ */

function initScrollReveal() {
  const revealEls = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay ? parseInt(el.dataset.delay, 10) * 100 : 0;
          setTimeout(() => el.classList.add('active'), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* ============================================================
   2. COUNTER ANIMATION — easeOutExpo, requestAnimationFrame
   ============================================================ */

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.target) || 0;
  const suffix = el.dataset.suffix || '';
  const duration = 1800; // ms
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(easeOutExpo(progress) * target);
    el.textContent = value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString() + suffix;
  }

  requestAnimationFrame(step);
}

function initCounters() {
  const counterEls = document.querySelectorAll('.counter');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counterEls.forEach((el) => observer.observe(el));
}

/* ============================================================
   3. SMOOTH SCROLL — nav links
   ============================================================ */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu if open
      const nav = document.querySelector('.nav-menu');
      if (nav) nav.classList.remove('open');
    });
  });
}

/* ============================================================
   4. NAVBAR — scrolled class, active link, hamburger
   ============================================================ */

function initNavbar() {
  const navbar = document.querySelector('nav, .navbar, header');
  const navLinks = document.querySelectorAll('nav a[href^="#"], .navbar a[href^="#"]');
  const hamburger = document.querySelector('.hamburger, .menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  // Scrolled class
  function onScroll() {
    if (!navbar) return;
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    // Active link based on scroll position
    let current = '';
    document.querySelectorAll('section[id]').forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) current = section.id;
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      hamburger.classList.toggle('open');
    });
  }
}

/* ============================================================
   5. SCROLL PROGRESS BAR
   ============================================================ */

function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener(
    'scroll',
    () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    },
    { passive: true }
  );
}

/* ============================================================
   6. PARALLAX — data-speed attribute (default 0.3)
   ============================================================ */

function initParallax() {
  const parallaxEls = document.querySelectorAll('.parallax');
  if (!parallaxEls.length) return;

  window.addEventListener(
    'scroll',
    () => {
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0.3;
        const offset = window.scrollY * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    },
    { passive: true }
  );
}

/* ============================================================
   7. VALIDATION WIDGETS
   ============================================================ */

function getValidationKey(page, section) {
  return `dan-elfassi-${page}-${section}`;
}

function updateNavCounter() {
  const counter = document.getElementById('nav-validation-counter');
  if (!counter) return;
  const total = document.querySelectorAll('.valid-btn').length;
  const validated = document.querySelectorAll('.valid-btn.validated').length;
  counter.textContent = `${validated}/${total}`;
}

function initValidationWidgets() {
  const page = document.body.dataset.page || 'default';

  // Restore state from localStorage
  document.querySelectorAll('.valid-btn').forEach((btn) => {
    const section = btn.dataset.section || btn.closest('[data-section]')?.dataset.section || btn.id;
    const key = getValidationKey(page, section);
    if (localStorage.getItem(key) === 'validated') {
      btn.classList.add('validated');
      btn.textContent = btn.dataset.labelDone || '✓ Validé';
    }

    btn.addEventListener('click', () => {
      const isValidated = btn.classList.toggle('validated');
      if (isValidated) {
        localStorage.setItem(key, 'validated');
        btn.textContent = btn.dataset.labelDone || '✓ Validé';
      } else {
        localStorage.removeItem(key);
        btn.textContent = btn.dataset.labelDefault || 'Valider';
      }
      updateNavCounter();
    });
  });

  // Comment toggle
  document.querySelectorAll('.comment-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section || btn.closest('[data-section]')?.dataset.section;
      const textarea = document.querySelector(
        `.comment-area[data-section="${section}"]`
      );
      if (textarea) textarea.classList.toggle('visible');
    });
  });

  updateNavCounter();
}

/* ============================================================
   8. TOOLTIPS
   ============================================================ */

function initTooltips() {
  document.querySelectorAll('.tooltip').forEach((el) => {
    const tip = el.querySelector('.tooltip-text');
    if (!tip) return;

    el.addEventListener('mouseenter', () => tip.classList.add('visible'));
    el.addEventListener('mouseleave', () => tip.classList.remove('visible'));
  });
}

/* ============================================================
   9. ACCORDION
   ============================================================ */

function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach((header) => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      if (!content || !content.classList.contains('accordion-content')) return;

      const isOpen = content.classList.contains('open');

      // Close all siblings first (single-open accordion)
      const parentAccordion = header.closest('.accordion');
      if (parentAccordion) {
        parentAccordion.querySelectorAll('.accordion-content.open').forEach((c) => {
          c.classList.remove('open');
          c.style.maxHeight = null;
          c.previousElementSibling?.classList.remove('open');
        });
      }

      if (!isOpen) {
        content.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        header.classList.add('open');
      }
    });
  });
}

/* ============================================================
   10. TABS
   ============================================================ */

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      const tabGroup = btn.closest('.tabs-wrapper, .tabs');
      if (!tabGroup) return;

      // Deactivate all buttons and contents in this group
      tabGroup.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      tabGroup.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));

      // Activate selected
      btn.classList.add('active');
      const content = tabGroup.querySelector(`.tab-content[data-tab="${tabId}"]`);
      if (content) content.classList.add('active');
    });
  });
}

/* ============================================================
   11. WHATSAPP FAB
   ============================================================ */

function sendWhatsApp(phone, message) {
  const tel = phone || document.getElementById('whatsapp-fab')?.dataset.phone || '33763662002';
  const msg = encodeURIComponent(message || 'Bonjour, je souhaite en savoir plus sur votre proposition.');
  window.open(`https://wa.me/${tel}?text=${msg}`, '_blank');
}

// Expose globally so inline onclick="" can call it
window.sendWhatsApp = sendWhatsApp;

function initWhatsAppFab() {
  const fab = document.getElementById('whatsapp-fab');
  if (!fab) return;
  fab.addEventListener('click', () => sendWhatsApp(fab.dataset.phone, fab.dataset.message));
}

/* ============================================================
   12. TYPEWRITER EFFECT
   ============================================================ */

function typewrite(el) {
  const text = el.dataset.text || el.textContent;
  const speed = parseInt(el.dataset.speed, 10) || 60;
  el.textContent = '';
  el.setAttribute('aria-label', text);

  let i = 0;
  function tick() {
    if (i < text.length) {
      el.textContent += text.charAt(i++);
      setTimeout(tick, speed);
    }
  }
  tick();
}

function initTypewriters() {
  const els = document.querySelectorAll('.typewriter');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typewrite(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  els.forEach((el) => observer.observe(el));
}

/* ============================================================
   13. ORG CHART INTERACTIVITY
   ============================================================ */

function initOrgChart() {
  document.querySelectorAll('.org-node').forEach((node) => {
    node.addEventListener('click', () => {
      const details = node.querySelector('.org-node-details');
      if (details) {
        details.classList.toggle('expanded');
      }
      node.classList.toggle('active');

      // Collapse sibling nodes (optional UX)
      const siblings = node.parentElement?.querySelectorAll('.org-node');
      siblings?.forEach((sibling) => {
        if (sibling !== node) {
          sibling.classList.remove('active');
          sibling.querySelector('.org-node-details')?.classList.remove('expanded');
        }
      });
    });
  });
}

/* ============================================================
   INIT — DOMContentLoaded
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCounters();
  initSmoothScroll();
  initNavbar();
  initScrollProgress();
  initParallax();
  initValidationWidgets();
  initTooltips();
  initAccordion();
  initTabs();
  initWhatsAppFab();
  initTypewriters();
  initOrgChart();
});
