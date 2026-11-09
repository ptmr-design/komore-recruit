/**
 * 社員カードの手動ループ。前後に1セットずつ複製し、同じ見た目の位置へ補正する。
 */
(() => {
  const section = document.querySelector('.p-member');
  const slider = section?.querySelector('.p-member__slider');
  const track = section?.querySelector('.js-member-track');
  const prev = section?.querySelector('.js-member-prev');
  const next = section?.querySelector('.js-member-next');
  if (!slider || !track || !prev || !next) return;
  const originals = Array.from(track.children);
  const count = originals.length;
  if (count < 2) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const duplicate = original => {
    const clone = original.cloneNode(true);
    clone.dataset.memberClone = 'true';
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    clone.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(el => {
      el.setAttribute('tabindex', '-1');
    });
    // マウスで複製リンクを押しても、aria-hidden内へフォーカスを移さない。
    // clickの既定動作は止めず、社員詳細への遷移を維持する。
    clone.addEventListener('mousedown', event => event.preventDefault());
    return clone;
  };
  const before = document.createDocumentFragment();
  const after = document.createDocumentFragment();
  originals.forEach(card => { before.appendChild(duplicate(card)); after.appendChild(duplicate(card)); });
  track.prepend(before);
  track.append(after);

  let step = 0;
  let base = 0;
  let cycle = 0;
  let frame = null;
  let resizeFrame = null;
  let settleTimer = null;
  let dragging = false;
  let width = 0;
  const queue = [];
  const mod = (value, size) => ((value % size) + size) % size;
  const measure = () => {
    const first = track.children[0].getBoundingClientRect().left;
    step = track.children[1].getBoundingClientRect().left - first;
    base = originals[0].getBoundingClientRect().left - first;
    cycle = step * count;
    width = slider.clientWidth;
    prev.disabled = next.disabled = step <= 0;
  };
  const normalize = () => {
    if (!cycle) return;
    const relative = slider.scrollLeft - base;
    // 許容差内の丸めは行わず、セット幅だけを加減して見た目を保つ。
    if (relative < -0.5) slider.scrollLeft += cycle;
    else if (relative >= cycle - 0.5) slider.scrollLeft -= cycle;
  };
  const clearSettle = () => { clearTimeout(settleTimer); settleTimer = null; };
  const settle = () => {
    clearSettle();
    if (frame !== null || dragging) return;
    slider.classList.add('is-moving');
    normalize();
    slider.classList.remove('is-moving');
  };
  const scheduleSettle = () => {
    clearSettle();
    settleTimer = setTimeout(settle, 160);
  };
  const interrupt = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    queue.length = 0;
    clearSettle();
    slider.classList.remove('is-moving');
  };

  const run = () => {
    if (frame !== null || !queue.length || !step) return;
    clearSettle();
    slider.classList.add('is-moving');
    normalize();
    const direction = queue.shift();
    const from = slider.scrollLeft;
    const index = Math.round((from - base) / step);
    const target = base + (index + direction) * step;
    const complete = () => {
      frame = null;
      slider.scrollLeft = target;
      normalize();
      if (queue.length) run();
      else slider.classList.remove('is-moving');
    };
    if (reduced.matches) { complete(); return; }
    let started = null;
    const tick = time => {
      if (started === null) started = time;
      const progress = Math.min(1, (time - started) / 420);
      const ease = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      slider.scrollLeft = from + (target - from) * ease;
      if (progress < 1) frame = requestAnimationFrame(tick);
      else complete();
    };
    frame = requestAnimationFrame(tick);
  };
  const move = direction => {
    queue.push(direction);
    run();
  };
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  slider.addEventListener('scroll', () => {
    if (frame === null) scheduleSettle();
  }, { passive: true });
  slider.addEventListener('scrollend', settle);
  slider.addEventListener('pointerdown', () => { dragging = true; interrupt(); }, { passive: true });
  const release = () => { if (dragging) { dragging = false; scheduleSettle(); } };
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('pointercancel', release, { passive: true });
  slider.addEventListener('wheel', () => { interrupt(); scheduleSettle(); }, { passive: true });
  slider.addEventListener('keydown', interrupt);
  // 通常はTab順から除外。万一複製へフォーカスされた場合も原本へ戻す。
  track.addEventListener('focusin', event => {
    const card = event.target.closest('[data-member-clone]');
    if (!card) return;
    const link = event.target.closest('a');
    const original = originals.find(el => el.querySelector('a')?.getAttribute('href') === link?.getAttribute('href'));
    if (original) {
      interrupt();
      slider.classList.add('is-moving');
      slider.scrollLeft = base + originals.indexOf(original) * step;
      original.querySelector('a').focus({ preventScroll: true });
      slider.classList.remove('is-moving');
    }
  });
  const resize = () => {
    if (resizeFrame !== null) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      if (slider.clientWidth === width) return;
      const index = step ? mod(Math.round((slider.scrollLeft - base) / step), count) : 0;
      interrupt();
      slider.classList.add('is-moving');
      measure();
      slider.scrollLeft = base + index * step;
      slider.classList.remove('is-moving');
    });
  };
  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(slider);
  reduced.addEventListener('change', () => { interrupt(); settle(); });

  slider.classList.add('is-moving');
  measure();
  slider.scrollLeft = base;
  slider.classList.remove('is-moving');
})();
