/**
 * エントリーフォーム
 * - 月(1〜12)・日(1〜31)の選択肢を生成
 * - 送信時に入力エラーを表示し、最初の不備項目へフォーカス
 * - 送信で完了ページへ遷移(実送信は行わない)
 */
(() => {
  const form = document.querySelector('.js-entry-form');
  if (!form) return;

  // 月・日のセレクト生成
  const fill = (select, max) => {
    if (!select) return;
    for (let i = 1; i <= max; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      select.appendChild(option);
    }
  };
  fill(form.querySelector('#entry-month'), 12);
  fill(form.querySelector('#entry-day'), 31);

  // 必須項目・形式・実在する生年月日を確認する(外部送信は行わない)
  const submit = form.querySelector('.js-entry-submit');
  const requiredFields = Array.from(form.querySelectorAll('[required]'));
  const year = form.querySelector('#entry-year');
  const month = form.querySelector('#entry-month');
  const day = form.querySelector('#entry-day');
  const touched = new Set();
  const errors = new Map();
  const containerErrors = new Map();

  requiredFields.forEach((field, index) => {
    const container = field.closest('.c-form__field, .p-entry__agree');
    let error = containerErrors.get(container);
    if (!error) {
      error = document.createElement('p');
      error.id = `entry-error-${index}`;
      error.className = 'c-form__error';
      error.hidden = true;
      error.setAttribute('aria-live', 'polite');
      container.appendChild(error);
      containerErrors.set(container, error);
    }
    const describedBy = field.getAttribute('aria-describedby');
    field.setAttribute('aria-describedby', [describedBy, error.id].filter(Boolean).join(' '));
    errors.set(field, error);
  });

  const messageFor = (field) => {
    if (field.type === 'radio') {
      return form.querySelector(`[name="${field.name}"]:checked`) ? '' : '希望職種を選択してください。';
    }
    if (field.type === 'checkbox') return field.checked ? '' : '同意が必要です。';
    if (!field.value.trim()) return 'この項目を入力・選択してください。';
    if (field.type === 'email' && field.validity.typeMismatch) {
      return 'メールアドレスを正しい形式で入力してください。';
    }
    if (field === year && !/^[1-9]\d{3}$/.test(year.value)) {
      return '年は4桁の半角数字で入力してください。';
    }
    if ([year, month, day].includes(field) && year.value && month.value && day.value && /^[1-9]\d{3}$/.test(year.value)) {
      const y = Number(year.value);
      const m = Number(month.value);
      const d = Number(day.value);
      const birth = new Date(y, m - 1, d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) {
        return '実在する生年月日を選択してください。';
      }
      if (birth > today) return '生年月日は今日以前の日付を入力してください。';
    }
    return '';
  };

  const validate = () => {
    let ok = true;
    const messages = new Map();
    requiredFields.forEach((field) => {
      const message = messageFor(field);
      if (message) ok = false;
      const showError = touched.has(field) && Boolean(message);
      const error = errors.get(field);
      if (showError && !messages.has(error)) messages.set(error, message);
      if (showError) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    });
    containerErrors.forEach((error) => {
      const message = messages.get(error) || '';
      error.hidden = !message;
      error.textContent = message;
    });
    return ok;
  };

  form.addEventListener('input', validate);
  form.addEventListener('change', validate);
  form.addEventListener('focusout', (event) => {
    if (!requiredFields.includes(event.target)) return;
    touched.add(event.target);
    validate();
  });
  validate();

  // 送信で完了ページへ(個人情報をURLに載せないため既定送信は抑止)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    requiredFields.forEach((field) => touched.add(field));
    if (!validate()) {
      requiredFields.find((field) => messageFor(field)).focus();
      return;
    }
    window.location.href = form.getAttribute('action');
  });
  // 検証と既定送信の抑止を設定した後で操作可能にする。
  submit.disabled = false;
})();
