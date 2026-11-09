/** detailsの標準操作を保ち、高さと回答の透明度だけをアニメーションする。 */
(() => {
  if (!Element.prototype.animate) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finishers = [];

  document.querySelectorAll('.c-accordion').forEach((details) => {
    const summary = details.querySelector('summary');
    const answer = details.querySelector('.c-accordion__a');
    if (!summary || !answer) return;
    let desiredOpen = details.open;
    let heightAnimation = null;
    let fadeAnimation = null;

    const cancel = () => {
      if (heightAnimation) {
        heightAnimation.onfinish = null;
        heightAnimation.cancel();
      }
      fadeAnimation?.cancel();
      heightAnimation = fadeAnimation = null;
    };
    const finish = () => {
      details.open = desiredOpen;
      details.classList.remove('is-animating', 'is-closing');
      cancel();
    };
    finishers.push(finish);

    summary.addEventListener('click', (event) => {
      event.preventDefault(); // Enter・Spaceによる標準のclickも同じ経路で処理する。
      const start = details.getBoundingClientRect().height;
      const opacity = details.open ? getComputedStyle(answer).opacity : '0';
      desiredOpen = !desiredOpen;
      cancel();
      if (reduced.matches) {
        finish();
        return;
      }

      details.open = true; // 閉じる間も回答をレイアウトに残す。
      const styles = getComputedStyle(details);
      const end = desiredOpen
        ? details.getBoundingClientRect().height
        : summary.getBoundingClientRect().height
          + parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
      details.classList.add('is-animating');
      details.classList.toggle('is-closing', !desiredOpen);
      const timing = { duration: 270, easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)', fill: 'both' };
      heightAnimation = details.animate([{ height: `${start}px` }, { height: `${end}px` }], timing);
      fadeAnimation = answer.animate([{ opacity }, { opacity: desiredOpen ? 1 : 0 }], timing);
      heightAnimation.onfinish = finish;
    });

    details.addEventListener('toggle', () => {
      if (!heightAnimation) desiredOpen = details.open;
    });
  });

  // サイズや動きを抑える設定が変わったら、途中の固定高を残さず確定する。
  window.addEventListener('resize', () => finishers.forEach((finish) => finish()));
  reduced.addEventListener('change', () => finishers.forEach((finish) => finish()));
})();
