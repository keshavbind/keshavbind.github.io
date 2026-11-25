// Site interactions. Each feature is its own function and runs inside safeInit(),
// so a problem in one feature can never stop the others from working.
(function () {
  'use strict';

  const EMAIL = 'keshavbind12345678@gmail.com';
  const ROLES = ['Android Developer', 'AI Application Developer'];
  const THEME_COLORS = { dark: '#0a0f24', light: '#f6f7fc' };

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const hasIntersectionObserver = 'IntersectionObserver' in window;
  const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const prefersReducedMotion = () => !!(motionQuery && motionQuery.matches);

  // Listens to a media query, including older browsers that only support addListener.
  function onQueryChange(query, handler) {
    if (!query) return;
    if (query.addEventListener) query.addEventListener('change', handler);
    else if (query.addListener) query.addListener(handler);
  }

  // Turns <i data-lucide="..."> placeholders into SVG icons (safe to call repeatedly).
  function refreshIcons() {
    try {
      if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    } catch (err) {
      console.warn('Icons could not be refreshed:', err);
    }
  }

  function safeInit(name, fn) {
    try { fn(); } catch (err) { console.error('Could not start "' + name + '":', err); }
  }

  // Runs fn at most once per animation frame while scrolling.
  function onScrollThrottled(fn) {
    let waiting = false;
    window.addEventListener('scroll', () => {
      if (waiting) return;
      waiting = true;
      window.requestAnimationFrame(() => { fn(); waiting = false; });
    }, { passive: true });
    fn();
  }

  const scrollTop = () => window.pageYOffset || document.documentElement.scrollTop || 0;

  /* ---------- Light/dark theme ---------- */
  // The saved theme is applied in index.html <head> before first paint; this wires the button.
  function initTheme() {
    const root = document.documentElement;
    const btn = qs('#themeBtn');
    if (!btn) return;
    const metaColor = qs('meta[name="theme-color"]');
    const current = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

    function apply(theme) {
      root.dataset.theme = theme;
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      if (metaColor) metaColor.setAttribute('content', THEME_COLORS[theme]);
    }

    apply(current());
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('theme', next); } catch (err) { /* storage blocked: theme just won't be remembered */ }
    });
  }

  /* ---------- Mobile navigation ---------- */
  function initMenu() {
    const menu = qs('#menu');
    const btn = qs('#menuBtn');
    if (!menu || !btn) return;
    const desktopQuery = window.matchMedia ? window.matchMedia('(min-width: 768px)') : null;
    const isOpen = () => menu.classList.contains('open');

    function setOpen(open) {
      if (open === isOpen()) return;
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', open ? 'x' : 'menu');
      icon.setAttribute('aria-hidden', 'true');
      btn.textContent = '';
      btn.appendChild(icon);
      refreshIcons();
    }

    btn.addEventListener('click', () => setOpen(!isOpen()));
    qsa('a', menu).forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen()) { setOpen(false); btn.focus(); }
    });
    document.addEventListener('click', e => {
      if (isOpen() && !menu.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });
    // Reset the mobile menu when the window grows to the desktop layout.
    onQueryChange(desktopQuery, () => { if (desktopQuery.matches) setOpen(false); });
  }

  /* ---------- Active navigation link ---------- */
  function initActiveLink() {
    const links = qsa('#menu a[href^="#"]');
    const sections = qsa('main section[id]');
    if (!links.length || !sections.length) return;

    function setActive(id) {
      links.forEach(a => {
        const on = a.hash === '#' + id;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }

    if (hasIntersectionObserver) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) setActive(en.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(s => io.observe(s));
    } else {
      // Fallback for browsers without IntersectionObserver: pick the last section above the middle of the screen.
      onScrollThrottled(() => {
        const line = scrollTop() + window.innerHeight * 0.45;
        let id = '';
        sections.forEach(s => { if (s.offsetTop <= line) id = s.id; });
        setActive(id);
      });
    }
  }

  /* ---------- Typing animation ---------- */
  function initTyping() {
    const el = qs('#typed');
    if (!el || !el.parentNode) return;
    const staticText = el.textContent; // full title written in the HTML (shown when motion is reduced)
    let timer = null;
    let readerText = null;

    function start() {
      if (timer !== null) return;
      // Screen readers get the full title once; the animated text is hidden from them.
      if (!readerText) {
        readerText = document.createElement('span');
        readerText.textContent = staticText;
        Object.assign(readerText.style, {
          position: 'absolute', width: '1px', height: '1px', overflow: 'hidden',
          clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap'
        });
        el.parentNode.insertBefore(readerText, el);
      }
      el.setAttribute('aria-hidden', 'true');

      let role = 0, chars = 0, deleting = false;
      (function tick() {
        const word = ROLES[role];
        el.textContent = word.slice(0, chars);
        let delay = deleting ? 40 : 85;
        if (!deleting && chars === word.length) { deleting = true; delay = 1600; }
        else if (deleting && chars === 0) { deleting = false; role = (role + 1) % ROLES.length; delay = 400; }
        chars += deleting ? -1 : 1;
        timer = setTimeout(tick, delay);
      })();
    }

    function stop() {
      clearTimeout(timer);
      timer = null;
      if (readerText && readerText.parentNode) readerText.parentNode.removeChild(readerText);
      readerText = null;
      el.removeAttribute('aria-hidden');
      el.textContent = staticText;
    }

    if (!prefersReducedMotion()) start();
    onQueryChange(motionQuery, () => (prefersReducedMotion() ? stop() : start()));
  }

  /* ---------- Project filters ---------- */
  function initFilters() {
    const buttons = qsa('.filters .chip');

    function render(filter) {
      if (typeof window.renderProjects !== 'function') {
        console.warn('renderProjects() is missing. Check that js/projects.js loads before js/script.js.');
        return;
      }
      window.renderProjects(filter);
      refreshIcons(); // makes sure icons on the new cards (including GitHub) are drawn
    }

    buttons.forEach(btn => btn.addEventListener('click', () => {
      buttons.forEach(b => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      render(btn.dataset.filter || 'all');
    }));

    render('all');
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const items = qsa('.reveal');
    if (!items.length) return;
    const showAll = () => items.forEach(item => item.classList.add('in'));

    // No IntersectionObserver or reduced motion: show everything immediately.
    if (!hasIntersectionObserver || prefersReducedMotion()) { showAll(); return; }

    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); observer.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(item => io.observe(item));

    // If the visitor turns on reduced motion while the page is open, reveal everything.
    onQueryChange(motionQuery, () => {
      if (prefersReducedMotion()) { io.disconnect(); showAll(); }
    });
  }

  /* ---------- Back to top ---------- */
  function initToTop() {
    const btn = qs('#toTop');
    if (!btn) return;
    onScrollThrottled(() => btn.classList.toggle('show', scrollTop() > 500));
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Contact form (mailto, no backend) ---------- */
  function initContactForm() {
    const form = qs('#contactForm');
    if (!form) return;
    const note = qs('#formNote');

    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const get = key => String(data.get(key) || '').trim();
      const body = ['Name: ' + get('name'), 'Email: ' + get('email'), '', get('message')].join('\r\n');
      window.location.href = 'mailto:' + EMAIL
        + '?subject=' + encodeURIComponent(get('subject'))
        + '&body=' + encodeURIComponent(body);
      if (note) note.textContent = 'Your email app should open now. If it does not, write to ' + EMAIL + ' directly.';
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    const year = qs('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  function init() {
    safeInit('theme', initTheme);
    safeInit('menu', initMenu);
    safeInit('active link', initActiveLink);
    safeInit('typing', initTyping);
    safeInit('filters', initFilters);
    safeInit('reveal', initReveal);
    safeInit('back to top', initToTop);
    safeInit('contact form', initContactForm);
    safeInit('year', initYear);
    refreshIcons();
    window.addEventListener('load', refreshIcons); // second pass in case the icon script finished late
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();