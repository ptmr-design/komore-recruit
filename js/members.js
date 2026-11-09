/**
 * スタッフ詳細:「その他のメンバー」をランダムに3名表示する
 */
(() => {
  const list = document.querySelector('.js-others');
  if (!list) return;

  const members = [
    {
      slug: 'nishimura',
      name: '西村 優',
      role: '住宅設計',
      year: '2017年入社',
      img: 'staff01.webp',
      msg: ['「この間取りで良かった」', '暮らし始めてから届く喜び'],
    },
    {
      slug: 'hashimoto',
      name: '橋本 拓也',
      role: '住宅営業',
      year: '2019年入社',
      img: 'staff02.webp',
      msg: ['住まいへの期待も、不安も', '最初に受け止める仕事です'],
    },
    {
      slug: 'aoki',
      name: '青木 美月',
      role: 'リノベーションプランナー',
      year: '2021年入社',
      img: 'staff03.webp',
      msg: ['今ある住まいの可能性を', '対話の中から見つけていく'],
    },
    {
      slug: 'takahashi',
      name: '高橋 智',
      role: 'インテリアデザイナー',
      year: '2018年入社',
      img: 'staff04.webp',
      msg: ['家具と素材の組み合わせで', '暮らしの景色が変わる'],
    },
    {
      slug: 'takada',
      name: '高田 凛',
      role: '施工管理',
      year: '2020年入社',
      img: 'staff05.webp',
      msg: ['図面の想いを、現場で形に', '段取りと対話が支える品質'],
    },
    {
      slug: 'tachibana',
      name: '橘 光',
      role: '設計チームリーダー',
      year: '2015年入社',
      img: 'staff06.webp',
      msg: ['一人ひとりの発想を活かす', '対話から育つ設計チーム'],
    },
  ];

  // 現在表示中のメンバーを除外
  const currentSlug = location.pathname.replace(/\/index\.html$/, '/').split('/').filter(Boolean).pop();
  const others = members.filter((m) => m.slug !== currentSlug);

  // シャッフルして3名選出
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const picked = others.slice(0, 3);

  list.innerHTML = picked
    .map(
      (m) => `
    <li>
      <article class="c-card-staff">
        <a href="../${m.slug}/">
          <figure class="c-card-staff__img">
            <img src="../../assets/img/staff/${m.img}" alt="${m.name}" />
            <p class="c-card-staff__msg">
              <span>${m.msg[0]}</span>
              <span>${m.msg[1]}</span>
            </p>
          </figure>
          <p class="c-card-staff__meta">
            <span>${m.role}</span><span>${m.year}</span>
          </p>
          <p class="c-card-staff__name">${m.name}</p>
        </a>
      </article>
    </li>`
    )
    .join('');
})();
