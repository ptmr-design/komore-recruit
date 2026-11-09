/**
 * スタッフ詳細:目次のスクロールスパイ
 * スクロール位置に応じて現在の話題をアクティブ表示する
 */
(() => {
  const toc = document.querySelector('.js-toc');
  if (!toc) return;

  const links = Array.from(toc.querySelectorAll('a[href^="#"]'));
  const sections = links
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter(Boolean);
  if (!sections.length) return;

  const activate = () => {
    // ビューポート上部1/3を基準に現在のセクションを判定
    const line = window.innerHeight / 3;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= line) {
        current = section;
      }
    });
    links.forEach((link) => {
      link.classList.toggle('is-active', link.hash === `#${current.id}`);
    });
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      activate();
      ticking = false;
    });
  });

  activate();
})();
