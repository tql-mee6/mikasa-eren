document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const progress = document.querySelector('.reading-progress');
const heroBackground = document.querySelector('.hero-bg');
const heroGhost = document.querySelector('.hero-ghost');
const portalSection = document.querySelector('.reveal-portal');
const portalFrame = document.querySelector('.portal-frame');
const portalCaption = document.querySelector('.portal-caption');
let ticking = false;

function updateScrollEffects() {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progress.style.width = `${Math.min(100, (window.scrollY / maxScroll) * 100)}%`;

  if (!reducedMotion.matches && window.scrollY < window.innerHeight) {
    const distance = window.scrollY;
    heroBackground.style.transform = `translateY(${distance * 0.18}px) scale(1.09)`;
    heroGhost.style.transform = `translateY(${distance * 0.1}px) rotate(-2deg)`;
  }
  if (portalSection && portalFrame && portalCaption) {
    if (reducedMotion.matches) {
      portalFrame.style.width = '100%';
      portalFrame.style.height = '100%';
      portalCaption.style.opacity = '1';
      portalCaption.style.transform = 'none';
    } else {
      const rect = portalSection.getBoundingClientRect();
      const scrollDistance = Math.max(1, portalSection.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollDistance));
      const startWidth = window.innerWidth <= 540 ? 76 : window.innerWidth <= 760 ? 72 : 56;
      const startHeight = window.innerWidth <= 540 ? 57 : window.innerWidth <= 760 ? 60 : 70;
      portalFrame.style.width = `${startWidth + (100 - startWidth) * progress}%`;
      portalFrame.style.height = `${startHeight + (100 - startHeight) * progress}%`;
      portalCaption.style.opacity = `${Math.min(1, Math.max(0, (progress - 0.54) / 0.35))}`;
      portalCaption.style.transform = `translateY(${24 * (1 - progress)}px)`;
    }
  }
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(updateScrollEffects);
}, { passive: true });
window.addEventListener('resize', updateScrollEffects);
reducedMotion.addEventListener('change', updateScrollEffects);
updateScrollEffects();

// Give in-page navigation a deliberate, eased transition while preserving native scrolling.
let navigationFrame = 0;
function stopNavigationAnimation() {
  if (navigationFrame) window.cancelAnimationFrame(navigationFrame);
  navigationFrame = 0;
  document.documentElement.style.removeProperty('scroll-behavior');
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const target = document.getElementById(link.getAttribute('href').slice(1));
  if (!target) return;
  event.preventDefault();
  stopNavigationAnimation();

  const destination = Math.max(0, Math.min(
    document.documentElement.scrollHeight - window.innerHeight,
    target.getBoundingClientRect().top + window.scrollY - 18
  ));
  if (reducedMotion.matches) {
    window.scrollTo(0, destination);
    return;
  }

  const start = window.scrollY;
  const distance = destination - start;
  const duration = Math.min(1200, Math.max(650, Math.abs(distance) * 0.42));
  const startTime = performance.now();
  document.documentElement.style.scrollBehavior = 'auto';

  function step(now) {
    const time = Math.min(1, (now - startTime) / duration);
    const eased = time < 0.5 ? 4 * time * time * time : 1 - Math.pow(-2 * time + 2, 3) / 2;
    window.scrollTo(0, start + distance * eased);
    if (time < 1) navigationFrame = window.requestAnimationFrame(step);
    else stopNavigationAnimation();
  }
  navigationFrame = window.requestAnimationFrame(step);
});

window.addEventListener('wheel', stopNavigationAnimation, { passive: true });
window.addEventListener('touchstart', stopNavigationAnimation, { passive: true });
window.addEventListener('keydown', (event) => {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) stopNavigationAnimation();
});

const storyFilm = document.getElementById('story-film');
const filmPlay = document.querySelector('.film-play');
if (storyFilm && filmPlay) {
  filmPlay.addEventListener('click', () => storyFilm.play());
  storyFilm.addEventListener('play', () => storyFilm.parentElement.classList.add('is-playing'));
  storyFilm.addEventListener('pause', () => storyFilm.parentElement.classList.remove('is-playing'));
  storyFilm.addEventListener('ended', () => storyFilm.parentElement.classList.remove('is-playing'));
}
