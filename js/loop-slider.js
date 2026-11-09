/**
 * 自動で流れ続ける無限横スライダー(TOP)
 */
(() => {
  const track = document.querySelector('.js-loop-track');
  if (!track) return;

  const SPEED = 40; // px/秒

  // 元の1セットを複製して切れ目なくループさせる
  const originals = Array.from(track.children);
  if (!originals.length) return;
  originals.forEach((el) => {
    const clone = el.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animation = null;
  let previousWidth = 0;
  let resizeFrame = null;

  const start = () => {
    if (reducedMotion.matches) {
      animation?.cancel();
      animation = null;
      previousWidth = 0;
      return;
    }
    // 複製した先頭要素の位置 = 1セット分の幅(gap込み)
    const setWidth = track.children[originals.length].offsetLeft - originals[0].offsetLeft;
    if (setWidth === 0 || setWidth === previousWidth) return;

    // リサイズ時も同じ周期内の位置を保ち、古いアニメーションを残さない。
    const oldDuration = (previousWidth / SPEED) * 1000;
    const progress = animation && oldDuration ? (Number(animation.currentTime) % oldDuration) / oldDuration : 0;
    animation?.cancel();
    const duration = (setWidth / SPEED) * 1000;
    animation = track.animate(
      [
        { transform: 'translateX(0)' },
        { transform: `translateX(-${setWidth}px)` },
      ],
      {
        duration,
        iterations: Infinity,
      }
    );
    animation.currentTime = progress * duration;
    previousWidth = setWidth;
  };

  const resize = () => {
    if (resizeFrame !== null) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      start();
    });
  };
  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(track);
  reducedMotion.addEventListener('change', start);

  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start);
  }
})();
