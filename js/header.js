/**
 * TOPページ:ファーストビュー通過でヘッダーを白背景に切り替える
 */
(() => {
  const header = document.querySelector('.l-header--top');
  const fv = document.querySelector('.p-fv');
  if (!header || !fv) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    },
    // FV下端がヘッダー高さまで来たら切り替え
    { rootMargin: '-80px 0px 0px 0px', threshold: 0 }
  );

  observer.observe(fv);
})();
