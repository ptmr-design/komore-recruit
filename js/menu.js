/**
 * 全画面メニューの開閉
 */
(() => {
  const toggle = document.querySelector('.js-menu-toggle');
  const nav = document.querySelector('.js-global-nav');
  const header = document.querySelector('.js-header');

  if (!toggle || !nav) return;

  let previousFocus = null;
  let previousOverflow = '';
  const background = new Map();
  const focusables = () => [toggle, ...nav.querySelectorAll('a[href], button, [tabindex]')]
    .filter((el) => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);

  // 閉じるボタンとナビ以外の枝を操作対象から外す。元のinert状態は復元する。
  const disableBackground = (parent) => {
    Array.from(parent.children).forEach((el) => {
      if (el === toggle || el === nav) return;
      if (el.contains(toggle) || el.contains(nav)) {
        disableBackground(el);
      } else {
        background.set(el, el.inert);
        el.inert = true;
      }
    });
  };

  const open = () => {
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    nav.classList.add('is-open');
    header?.classList.add('is-menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'メニューを閉じる');
    document.body.style.overflow = 'hidden';
    disableBackground(document.body);
    (focusables().find((el) => el !== toggle) || toggle).focus();
  };

  const close = () => {
    nav.classList.remove('is-open');
    header?.classList.remove('is-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'メニューを開く');
    document.body.style.overflow = previousOverflow;
    background.forEach((inert, el) => { el.inert = inert; });
    background.clear();
    if (previousFocus?.isConnected) previousFocus.focus();
    else toggle.focus();
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      close();
    } else {
      open();
    }
  });

  // ESCキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (!nav.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      const items = focusables();
      const index = items.indexOf(document.activeElement);
      const next = e.shiftKey
        ? (index <= 0 ? items.length - 1 : index - 1)
        : (index + 1) % items.length;
      e.preventDefault();
      items[next].focus();
    }
  });

  document.addEventListener('focusin', (event) => {
    if (nav.classList.contains('is-open') && event.target !== toggle && !nav.contains(event.target)) {
      (focusables().find((el) => el !== toggle) || toggle).focus();
    }
  });

  // メニュー内リンククリックで閉じる(ページ内アンカー対策)
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });
})();
