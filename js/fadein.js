/**
 * TOPページ:FVだけに初回のフェードアップを適用する。
 */
(() => {
  if (!('IntersectionObserver' in window)) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const sections = document.querySelectorAll([
    '.p-fv__slider', '.p-fv__catch', '.p-fv__copy', '.p-fv__news',
  ].join(','));
  if (!sections.length) return;

  const targets = [];
  const pending = new Map();
  const revealed = new Set();
  const reveal = (el) => {
    if (revealed.has(el)) return;
    revealed.add(el);
    const show = () => requestAnimationFrame(() => el.classList.add('is-visible'));
    const photo = el.matches('.p-fv__slider') ? el.querySelector('img.is-active') : null;
    if (photo && !photo.complete) {
      photo.addEventListener('load', show, { once: true });
      photo.addEventListener('error', show, { once: true });
    } else show();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          pending.get(entry.target)?.forEach(reveal);
          pending.delete(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px', threshold: 0 }
  );

  const prepare = (el, delay, image = false) => {
    el.style.setProperty('--fade-delay', `${delay}ms`);
    if (image) {
      el.style.setProperty('--fade-distance', '6px');
      el.style.setProperty('--fade-duration', '650ms');
      el.style.setProperty('--fade-easing', 'ease-out');
      el.classList.add('u-fadein--image');
    }
    el.classList.add('u-fadein', 'is-fadein-ready');
    targets.push(el);
    return el;
  };
  const observe = (trigger, parts) => {
    pending.set(trigger, parts);
    trigger.addEventListener('focusin', () => {
      parts.forEach(reveal);
      pending.delete(trigger);
      observer.unobserve(trigger);
    }, { once: true });
    observer.observe(trigger);
  };
  sections.forEach((el) => {
    const delay = 0;
    if (el.matches('.p-fv__slider')) {
      observe(el, [prepare(el, delay, true)]);
      return;
    }
    prepare(el, delay);
    if (el.matches('.p-fv__news')) {
      el.style.setProperty('--fade-distance', '6px');
      el.style.setProperty('--fade-duration', '650ms');
    }
    observe(el, [el]);
  });

  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    observer.disconnect();
    pending.clear();
    targets.forEach((el) => {
      revealed.add(el);
      el.classList.add('is-visible');
    });
  });
})();
