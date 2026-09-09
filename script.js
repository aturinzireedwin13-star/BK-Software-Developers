gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const nav = document.querySelector('.nav');
const menu = document.querySelector('.menu');
const year = document.getElementById('year');
const form = document.getElementById('projectForm');
const status = document.getElementById('formStatus');

year.textContent = new Date().getFullYear();

menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}));

if (!reduced) {
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro
    .from('.header', { y: -35, opacity: 0, duration: .9 })
    .from('.hero-kicker', { y: 25, opacity: 0, duration: .7 }, '-=.35')
    .from('.hero-title', { y: 100, opacity: 0, duration: 1.35, ease: 'power4.out' }, '-=.35')
    .from('.hero-description', { y: 35, opacity: 0, duration: .8 }, '-=.65')
    .from('.circle-link', { scale: 0, opacity: 0, duration: .8, ease: 'back.out(1.7)' }, '-=.5')
    .from('.hero-scroll', { opacity: 0, duration: .7 }, '-=.3');

  gsap.to('.orb-one', { x: -180, y: 120, scale: 1.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 } });
  gsap.to('.hero-title', { y: 140, opacity: .18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });

  gsap.utils.toArray('.section-label,.services-head,.apps-head,.service,.project,.customers-head,.customer-feature,.customer-card,.process-layout .step,.statement-copy,.contact-grid,.schoolpro-feature').forEach(el => {
    gsap.from(el, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
  });

  gsap.from('.service', { x: -70, opacity: 0, duration: 1, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.service-list', start: 'top 78%', once: true } });
  gsap.from('.app-card', { y: 80, opacity: 0, rotateX: 8, duration: 1, stagger: .14, ease: 'power3.out', scrollTrigger: { trigger: '.app-grid', start: 'top 80%', once: true } });
  gsap.utils.toArray('.project-image,.customer-image-wrap').forEach(image => {
    gsap.fromTo(image, { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: image, start: 'top 90%', end: 'bottom 15%', scrub: 1 } });
  });
  gsap.from('.step', { x: 60, opacity: 0, duration: .9, stagger: .15, scrollTrigger: { trigger: '.steps', start: 'top 78%', once: true } });
  gsap.from('.statement-title', { y: 100, opacity: 0, scale: .94, duration: 1.3, ease: 'power4.out', scrollTrigger: { trigger: '.statement', start: 'top 70%', once: true } });
  gsap.from('.project-form label', { x: 40, opacity: 0, duration: .7, stagger: .12, scrollTrigger: { trigger: '.project-form', start: 'top 80%', once: true } });

  document.querySelectorAll('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - (r.left + r.width / 2)) * .18, y: (e.clientY - (r.top + r.height / 2)) * .18, duration: .35 }); });
    b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.5)' }));
  });

  document.querySelectorAll('.app-card,.customer-card,.project').forEach(card => {
    card.addEventListener('mouseenter', () => gsap.to(card, { y: -7, duration: .35, ease: 'power2.out' }));
    card.addEventListener('mouseleave', () => gsap.to(card, { y: 0, duration: .5, ease: 'power3.out' }));
  });

  gsap.from('.whatsapp-float', { y: 45, opacity: 0, scale: .88, duration: 1, delay: 1.1, ease: 'back.out(1.6)' });

  const cursor = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  window.addEventListener('mousemove', e => { gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: .35 }); gsap.set(dot, { x: e.clientX, y: e.clientY }); });
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 1.7, duration: .25 }));
    el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, duration: .25 }));
  });
}

// School Pro screenshot lightbox — click any slide (moving or not) to view it full-size
(() => {
  const lightbox = document.getElementById('schoolproLightbox');
  if (!lightbox) return;

  const imgEl = document.getElementById('schoolproLightboxImg');
  const titleEl = document.getElementById('schoolproLightboxTitle');
  const descEl = document.getElementById('schoolproLightboxDesc');
  const countEl = document.getElementById('schoolproLightboxCount');
  const closeEls = lightbox.querySelectorAll('[data-schoolpro-close]');
  const prevBtn = lightbox.querySelector('.schoolpro-lightbox-prev');
  const nextBtn = lightbox.querySelector('.schoolpro-lightbox-next');
  const track = document.querySelector('.schoolpro-track');
  const allBtns = Array.from(document.querySelectorAll('.schoolpro-slide-btn'));

  // Build a de-duplicated slide list keyed by data-slide (marquee duplicates the set for the loop)
  const slides = [];
  allBtns.forEach(btn => {
    const idx = Number(btn.dataset.slide);
    if (!slides[idx]) {
      const img = btn.querySelector('img');
      slides[idx] = {
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        title: btn.querySelector('.schoolpro-caption strong')?.textContent || '',
        desc: btn.querySelector('.schoolpro-caption span')?.textContent || ''
      };
    }
  });

  let current = 0;
  let lastFocused = null;

  function render() {
    const s = slides[current];
    if (!s) return;
    imgEl.src = s.src;
    imgEl.alt = s.alt;
    titleEl.textContent = s.title;
    descEl.textContent = s.desc;
    countEl.textContent = `${current + 1} / ${slides.length}`;
  }

  function openLightbox(index) {
    current = index;
    render();
    lastFocused = document.activeElement;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (track) track.style.animationPlayState = 'paused';
    (lightbox.querySelector('.schoolpro-lightbox-close'))?.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (track) track.style.animationPlayState = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function next() { current = (current + 1) % slides.length; render(); }
  function prev() { current = (current - 1 + slides.length) % slides.length; render(); }

  allBtns.forEach(btn => {
    btn.addEventListener('click', () => openLightbox(Number(btn.dataset.slide)));
  });
  closeEls.forEach(el => el.addEventListener('click', closeLightbox));
  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
})();

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent('New BK Software Developers Project Enquiry');
  const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\nProject:\n${data.get('message')}`);
  window.location.href = `mailto:YOUR_EMAIL@example.com?subject=${subject}&body=${body}`;
  status.textContent = 'Set YOUR_EMAIL@example.com in script.js to your real business email.';
});
