/** キャリアパス図の拡大表示。通常画像と元ファイルは変更しない。 */
(() => {
  const image = document.querySelector('.p-career__img img');
  const dialog = document.querySelector('.p-career-zoom');
  if (!image || !dialog || typeof dialog.showModal !== 'function') return;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'p-career__zoom-trigger';
  trigger.setAttribute('aria-label', 'キャリアパス図を拡大表示');
  trigger.setAttribute('aria-haspopup', 'dialog');
  image.before(trigger);
  trigger.appendChild(image);

  const enlarged = image.cloneNode(true);
  enlarged.removeAttribute('id');
  enlarged.removeAttribute('loading');
  dialog.querySelector('.p-career-zoom__viewport').appendChild(enlarged);

  trigger.addEventListener('click', () => {
    dialog.showModal();
    dialog.querySelector('.p-career-zoom__close').focus({ preventScroll: true });
  });
  dialog.querySelector('.p-career-zoom__close').addEventListener('click', () => dialog.close());
  // Escapeとフォーカス制御には標準dialogのモーダル動作を利用する。
  dialog.addEventListener('close', () => trigger.focus({ preventScroll: true }));
})();
