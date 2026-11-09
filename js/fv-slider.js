/**
 * ファーストビューのクロスフェードスライダー
 */
(() => {
  const slider = document.querySelector('.js-fv-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('img');
  if (slides.length < 2) return;

  const INTERVAL = 6000;
  let current = 0;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer = null;
  const updatePlayback = () => {
    clearInterval(timer);
    timer = null;
    if (reduced.matches) return;
    timer = setInterval(() => {
      slides[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
    }, INTERVAL);
  };
  reduced.addEventListener('change', updatePlayback);
  updatePlayback();
})();
