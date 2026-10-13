/* Главная MASTERSHINA: шапка и меню, баннер, подбор шин и дисков,
   витрина с фильтрами, бренды, FAQ, шоурумы и ленивая карта */
(function () {
  var D = MS.data, fmt = MS.fmt;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function plural(n, one, few, many) {
    var a = n % 10, b = n % 100;
    return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? few : many;
  }
  function visible(p) { return !p.hidden; }

  /* Картинки, которых не видно на первом экране (слайды 2–4, меню), лежат в data-src
     и грузятся по требованию — так первый экран на медленном интернете открывается быстрее */
  function loadDeferred(scope) {
    $$('img[data-src]', scope).forEach(function (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); });
  }

  /* ---------- шапка, мега-меню, мобильное меню, поиск на телефоне ---------- */
  var header = $('.header');
  addEventListener('scroll', function () { header.classList.toggle('scrolled', scrollY > 40); }, { passive: true });

  var mega = $('.mega-wrap'), megaBtn = $('.catalog-btn');
  function megaOpen(on) { mega.classList.toggle('open', on); megaBtn.setAttribute('aria-expanded', String(on)); $('.mega').setAttribute('aria-hidden', String(!on)); }
  megaBtn.addEventListener('click', function (e) { e.stopPropagation(); megaOpen(!mega.classList.contains('open')); });
  ['mouseenter', 'focus', 'touchstart'].forEach(function (ev) { megaBtn.addEventListener(ev, function () { loadDeferred(mega); }, { once: true, passive: true }); });
  $$('.mega a').forEach(function (a) { a.addEventListener('click', function () { megaOpen(false); }); });

  var mnav = $('.mnav');
  function menu(on) { if (on) loadDeferred(mnav); mnav.classList.toggle('open', on); mnav.setAttribute('aria-hidden', String(!on)); document.documentElement.classList.toggle('ms-lock', on); }
  $('.burger').addEventListener('click', function () { menu(true); });
  $('.mnav-x').addEventListener('click', function () { menu(false); });
  mnav.addEventListener('click', function (e) { if (e.target === mnav || e.target.closest('nav a') || e.target.closest('.btn')) menu(false); });

  var sInput = $('.search input'), drop = $('.search-drop');
  $('.hi-search').addEventListener('click', function (e) {
    e.stopPropagation();
    var on = !header.classList.contains('search-open');
    header.classList.toggle('search-open', on);
    if (on) setTimeout(function () { sInput.focus(); }, 30); else drop.hidden = true;
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.mega-wrap')) megaOpen(false);
    if (!e.target.closest('.search') && !e.target.closest('.hi-search')) { drop.hidden = true; header.classList.remove('search-open'); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    megaOpen(false); menu(false); drop.hidden = true; header.classList.remove('search-open');
  });

  /* ---------- баннер ----------
     Время показа слайда задаёт CSS-анимация полоски в активной точке:
     закончилась — следующий слайд. Наведение мышью и уход блока с экрана
     ставят её на паузу, поэтому отдельный таймер не нужен. */
  var banner = $('.banner'), bs = $$('.bslide'), bd = $$('.bn-dots button'), bi = 0;
  function theme(s) { return s.classList.contains('b-light') ? 'light' : s.classList.contains('b-red') ? 'red' : 'dark'; }
  function bgo(n) {
    bi = (n + bs.length) % bs.length;
    bs.forEach(function (s, i) { s.classList.toggle('is-active', i === bi); s.setAttribute('aria-hidden', String(i !== bi)); });
    bd.forEach(function (d, i) { d.classList.toggle('is-active', i === bi); });
    banner.setAttribute('data-theme', theme(bs[bi]));
  }
  bd.forEach(function (d, i) {
    d.addEventListener('click', function () { bgo(i); });
    d.querySelector('i').addEventListener('animationend', function () { if (!MS.reduced && d.classList.contains('is-active')) bgo(bi + 1); });
  });
  $('[data-bprev]').addEventListener('click', function () { bgo(bi - 1); });
  $('[data-bnext]').addEventListener('click', function () { bgo(bi + 1); });
  var sx = null, sy = 0;
  banner.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  banner.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) bgo(bi + (dx < 0 ? 1 : -1));
  }, { passive: true });
  bgo(0);
  // остальные слайды догружаем сразу после прелоадера — до смены слайда есть 6 секунд
  MS.onReady(function () { loadDeferred(banner); });
  [$('[data-bprev]'), $('[data-bnext]')].concat(bd).forEach(function (b) { b.addEventListener('pointerdown', function () { loadDeferred(banner); }, { once: true }); });

  /* ---------- подбор шин и дисков (как в демо CANDY) ---------- */
  // какие товары подходят какой технике — id из data.js
  var VEHICLES = { dump: [1, 3, 10, 14], tractor: [2, 5, 12, 13], light: [4, 5, 6], loader: [7, 8], backhoe: [9, 11], wheel: [10] };
  var picker = $('#picker'), form = $('.picker-form', picker), mode = 'params', ptab = 'tires';
  var submitBtn = form.querySelector('[type=submit]');
  function uniq(a) { return a.filter(function (v, i) { return v && a.indexOf(v) === i; }); }
  function opts(sel, vals, any) { sel.innerHTML = '<option value="">' + any + '</option>' + vals.map(function (v) { return '<option>' + v + '</option>'; }).join(''); }
  function pickCat() { return ptab === 'rims' ? 'rims' : form.elements.cat.value; }
  function fillParams() {
    var ps = D.products.filter(function (p) { return visible(p) && p.cat === pickCat(); });
    opts(form.elements.diam, uniq(ps.map(function (p) { return p.diam; })), 'Любой');
    opts(form.elements.axle, uniq(ps.map(function (p) { return p.axle; })), 'Любое');
    opts(form.elements.brand, uniq(ps.map(function (p) { return p.brand; })), 'Любой');
    count();
  }
  function matches() {
    if (mode === 'vehicle' && ptab === 'tires') {
      var ids = VEHICLES[form.elements.vehicle.value] || [];
      return D.products.filter(function (p) { return ids.indexOf(p.id) > -1; });
    }
    var f = form.elements;
    return D.products.filter(function (p) {
      return visible(p) && p.cat === pickCat() && (!f.diam.value || p.diam === f.diam.value) &&
        (!f.axle.value || p.axle === f.axle.value) && (!f.brand.value || p.brand === f.brand.value);
    });
  }
  function count() { $('[data-found]', picker).textContent = matches().length; }
  function setVeh(v) {
    form.elements.vehicle.value = v;
    $$('.veh-icons button', picker).forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-veh') === v); });
    count();
  }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'cat') fillParams();
    else if (e.target.name === 'vehicle') setVeh(e.target.value);
    else count();
  });
  $$('.veh-icons button', picker).forEach(function (b) { b.addEventListener('click', function () { setVeh(b.getAttribute('data-veh')); }); });

  var sw = $('.switch', picker);
  function setMode(m) {
    mode = m; sw.setAttribute('aria-checked', String(m === 'vehicle'));
    $$('.pm-lbl', picker).forEach(function (l) { l.classList.toggle('is-on', l.getAttribute('data-mode') === m); });
    $('.pf-params', picker).hidden = m === 'vehicle';
    $('.pf-vehicle', picker).hidden = m !== 'vehicle';
    count();
  }
  sw.addEventListener('click', function () { setMode(mode === 'params' ? 'vehicle' : 'params'); });
  $$('.pm-lbl', picker).forEach(function (l) { l.addEventListener('click', function () { setMode(l.getAttribute('data-mode')); }); });

  // вкладки «Подбор шин / Подбор дисков»: у дисков нет типа и режима «по технике»
  $$('.picker-tabs button', picker).forEach(function (b) {
    b.addEventListener('click', function () {
      ptab = b.getAttribute('data-pt');
      $$('.picker-tabs button', picker).forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', String(x === b)); });
      $('.picker-mode', picker).style.display = ptab === 'rims' ? 'none' : '';
      form.elements.cat.closest('.field').style.display = ptab === 'rims' ? 'none' : '';
      if (ptab === 'rims') setMode('params');
      submitBtn.firstChild.nodeValue = ptab === 'rims' ? 'Найти диски ' : 'Найти шины ';
      fillParams();
    });
  });

  $$('.picker-quick [data-q]', picker).forEach(function (b) {
    b.addEventListener('click', function () {
      var size = b.getAttribute('data-q');
      setFilter({ ids: D.products.filter(function (p) { return p.size === size; }).map(function (p) { return p.id; }), note: 'размер ' + size });
      goCatalog();
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var note = mode === 'vehicle' && ptab === 'tires' ? f.vehicle.selectedOptions[0].text :
      [ptab === 'rims' ? 'Диски' : f.cat.selectedOptions[0].text, f.diam.value, f.axle.value, f.brand.value].filter(Boolean).join(' · ');
    setFilter({ ids: matches().map(function (p) { return p.id; }), note: note });
    goCatalog();
  });
  fillParams();

  /* ---------- витрина ---------- */
  var state = { cat: 'all', ids: null, brand: null, note: '' };
  var grid = $('[data-grid]'), note = $('.filter-note');
  var favs = {};
  try { favs = JSON.parse(localStorage.getItem('ms_favs')) || {}; } catch (e) { favs = {}; }

  function buyBox(p) {
    var q = MS.cart()[p.id];
    if (q) {
      return '<div class="stepper"><button type="button" data-step="-1" aria-label="Меньше"><svg class="i"><use href="#i-minus"/></svg></button>' +
        '<output>' + q + ' шт<small>' + fmt(p.price * q) + '</small></output>' +
        '<button type="button" data-step="1" aria-label="Больше"><svg class="i"><use href="#i-plus"/></svg></button></div>';
    }
    return '<button type="button" class="buy-btn" data-add="' + p.id + '"><svg class="i"><use href="#i-cart"/></svg>В корзину</button>';
  }
  function card(p, i) {
    var tag = p.tag ? '<span class="ptag ' + (p.tag === 'Новинка' ? 't-new' : p.tag === 'Скидка' ? 't-sale' : '') + '">' + p.tag + '</span>' : '';
    return '<article class="pcard" data-card data-id="' + p.id + '" data-reveal data-delay="' + Math.min(i, 4) * 70 + '">' +
      '<div class="pcard-media pc-' + p.cat + '">' + tag +
        '<button type="button" class="fav' + (favs[p.id] ? ' on' : '') + '" data-fav="' + p.id + '" aria-label="В избранное" aria-pressed="' + !!favs[p.id] + '"><svg class="i"><use href="#i-heart"/></svg></button>' +
        '<img src="' + MS.img(p) + '" alt="' + p.name + ' ' + p.size + '" width="300" height="300" loading="lazy" decoding="async"></div>' +
      '<div class="pcard-body">' +
        '<div class="p-row"><span class="p-brand">' + p.brand + '</span><span class="p-rate"><svg class="i"><use href="#i-star"/></svg>' + p.rating.toFixed(1).replace('.', ',') + ' <small>' + p.reviews + ' отз.</small></span></div>' +
        '<h3 class="p-title">' + p.name + '</h3>' +
        '<span class="p-size">' + p.size + (p.diam ? ' · ' + p.axle : '') + '</span>' +
        '<span class="p-stock">В наличии ' + p.stock + ' шт</span>' +
        '<div class="p-price"><b>' + fmt(p.price) + '</b>' + (p.old ? '<s>' + fmt(p.old) + '</s>' : '') + '</div>' +
        '<div class="buy" data-buybox="' + p.id + '">' + buyBox(p) + '</div>' +
      '</div></article>';
  }
  function list() {
    return D.products.filter(function (p) {
      return visible(p) && (state.cat === 'all' || p.cat === state.cat) && (!state.ids || state.ids.indexOf(p.id) > -1) &&
        (!state.brand || p.brand.toLowerCase() === state.brand.toLowerCase());
    }).sort(function (a, b) { return ((b.tag === 'Хит') - (a.tag === 'Хит')) || b.reviews - a.reviews; });
  }
  function renderGrid() {
    var l = list();
    grid.innerHTML = l.map(card).join('') ||
      '<div class="grid-empty"><b>Ничего не нашлось</b>Оставьте заявку — подберём под вашу технику и привезём под заказ.<br><button type="button" class="btn btn-red" data-callback="Подбор товара">Оставить заявку</button></div>';
    grid.scrollLeft = 0;
    $$('.chips button').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-tab') === state.cat && !state.ids && !state.brand); });
    note.hidden = !state.note;
    note.innerHTML = state.note ? 'Показано: <b>' + state.note + '</b> · ' + l.length + ' шт. <button type="button" data-reset>Показать всё</button>' : '';
    MS.render(); MS.onReady(function () { MS.reveal(grid); }); carUI();
  }
  function setFilter(o) {
    state.cat = o.cat || 'all'; state.ids = o.ids || null; state.brand = o.brand || null; state.note = o.note || '';
    renderGrid();
  }
  function goCatalog() { $('#catalog').scrollIntoView({ behavior: MS.reduced ? 'auto' : 'smooth' }); }

  note.addEventListener('click', function (e) { if (e.target.closest('[data-reset]')) setFilter({}); });
  $$('.chips button').forEach(function (b) { b.addEventListener('click', function () { setFilter({ cat: b.getAttribute('data-tab') }); }); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-filter]'); if (!a) return;
    setFilter({ cat: a.getAttribute('data-filter') });
  });

  // кнопки «В корзину» ↔ счётчик при любом изменении корзины
  document.addEventListener('ms:cart', function () {
    $$('[data-buybox]').forEach(function (box) { box.innerHTML = buyBox(MS.byId(box.getAttribute('data-buybox'))); });
  });
  grid.addEventListener('click', function (e) {
    var st = e.target.closest('[data-step]');
    if (st) { MS.add(st.closest('[data-buybox]').getAttribute('data-buybox'), +st.getAttribute('data-step')); return; }
    var f = e.target.closest('[data-fav]');
    if (f) {
      var fid = f.getAttribute('data-fav');
      if (favs[fid]) delete favs[fid]; else { favs[fid] = 1; burst(f, 10); }
      f.classList.toggle('on', !!favs[fid]); f.setAttribute('aria-pressed', String(!!favs[fid]));
      try { localStorage.setItem('ms_favs', JSON.stringify(favs)); } catch (er) {}
      favCount();
    }
  });
  function favCount() {
    var n = Object.keys(favs).length, el = $('[data-fav-count]');
    el.textContent = n; el.classList.toggle('is-empty', !n);
  }
  $('.hi-fav').addEventListener('click', function () {
    var ids = Object.keys(favs).map(Number);
    if (!ids.length) { MS.toast('<b>В избранном пока пусто</b><span>Нажмите ♥ на карточке товара</span>'); return; }
    setFilter({ ids: ids, note: 'избранное' }); goCatalog();
  });

  // стрелки и полоса прокрутки карусели
  var prev = $('.car-prev'), next = $('.car-next'), bar = $('.car-bar'), barI = $('.car-bar i');
  function carUI() {
    var max = grid.scrollWidth - grid.clientWidth;
    prev.disabled = grid.scrollLeft < 10;
    next.disabled = grid.scrollLeft >= max - 10;
    var ratio = grid.clientWidth / grid.scrollWidth;
    bar.style.visibility = ratio >= .99 ? 'hidden' : '';
    var w = bar.clientWidth * ratio;
    barI.style.width = w + 'px';
    barI.style.transform = 'translateX(' + (max > 0 ? grid.scrollLeft / max * (bar.clientWidth - w) : 0) + 'px)';
  }
  grid.addEventListener('scroll', carUI, { passive: true });
  addEventListener('resize', carUI);
  prev.addEventListener('click', function () { grid.scrollBy({ left: -grid.clientWidth * .8, behavior: 'smooth' }); });
  next.addEventListener('click', function () { grid.scrollBy({ left: grid.clientWidth * .8, behavior: 'smooth' }); });

  /* ---------- конфетти ---------- */
  var COLORS = ['#e31e24', '#111114', '#ff5f64', '#8b8b96', '#a3121a', '#ffffff'];
  function burst(el, n) {
    if (MS.reduced || !el || !document.body.animate) return;
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var i = 0; i < (n || 18); i++) {
      var c = document.createElement('i'); c.className = 'confetti';
      c.style.left = cx + 'px'; c.style.top = cy + 'px'; c.style.background = COLORS[i % COLORS.length];
      if (i % COLORS.length === 5) c.style.boxShadow = '0 0 0 1px #e31e24';
      document.body.appendChild(c);
      var ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 90;
      var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 40;
      c.animate([
        { transform: 'translate(-50%,-50%) rotate(0deg) scale(1)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + (dy + 80) + 'px) rotate(' + (Math.random() * 720 - 360) + 'deg) scale(.6)', opacity: 0 }
      ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = (function (x) { return function () { x.remove(); }; })(c);
    }
  }
  document.addEventListener('ms:added', function (e) {
    var b = e.detail.button;
    burst(b.isConnected ? b : $('[data-buybox="' + e.detail.product.id + '"]'));
  });

  /* ---------- живой поиск ---------- */
  function norm(s) { return s.toLowerCase().replace(/[\s.,\-\/]/g, ''); }
  sInput.addEventListener('input', function () {
    var q = norm(sInput.value);
    if (!q) { drop.hidden = true; return; }
    var res = D.products.filter(function (p) { return visible(p) && norm(p.name + p.size + p.brand + p.axle).indexOf(q) > -1; }).slice(0, 6);
    drop.hidden = false;
    drop.innerHTML = res.length ? res.map(function (p) {
      return '<div class="sd-item" data-goto="' + p.id + '"><img src="' + MS.img(p) + '" alt=""><div><b>' + p.name + '</b><small>' + p.size + '</small></div><span class="sd-price">' + fmt(p.price) + '</span>' +
        '<button type="button" class="sd-add" data-add="' + p.id + '" aria-label="В корзину"><svg class="i"><use href="#i-cart"/></svg></button></div>';
    }).join('') : '<div class="sd-empty">Ничего не нашли по запросу «' + sInput.value.replace(/[<>&"]/g, '') + '»</div>';
  });
  drop.addEventListener('click', function (e) {
    if (e.target.closest('[data-add]')) return;
    var it = e.target.closest('[data-goto]'); if (!it) return;
    var id = +it.getAttribute('data-goto');
    setFilter({});
    drop.hidden = true; sInput.value = ''; header.classList.remove('search-open');
    var c = grid.querySelector('[data-id="' + id + '"]');
    goCatalog();
    setTimeout(function () {
      grid.scrollTo({ left: c.offsetLeft - grid.offsetLeft - 10, behavior: 'smooth' });
      if (c.animate) c.animate([{ boxShadow: '0 0 0 0 rgba(227,30,36,.9)' }, { boxShadow: '0 0 0 14px rgba(227,30,36,0)' }], { duration: 900, iterations: 2 });
    }, 600);
  });

  /* ---------- категории и бренды ---------- */
  $$('[data-cat-count]').forEach(function (el) {
    var c = el.getAttribute('data-cat-count');
    var n = D.products.filter(function (p) { return visible(p) && p.cat === c; }).length;
    el.textContent = n + ' ' + (c === 'parts' ? plural(n, 'товар', 'товара', 'товаров') : plural(n, 'модель', 'модели', 'моделей')) + ' в наличии';
  });
  $$('[data-brand]').forEach(function (b) {
    b.addEventListener('click', function () {
      var brand = b.getAttribute('data-brand');
      var has = D.products.some(function (p) { return visible(p) && p.brand.toLowerCase() === brand.toLowerCase(); });
      if (has) { setFilter({ brand: brand, note: brand }); goCatalog(); }
      else MS.openCallback('Подбор: ' + brand, 'Интересует продукция ' + brand + '. Подскажите наличие и цены.');
    });
  });

  /* ---------- FAQ: плавное раскрытие, открыт один вопрос ---------- */
  var faqs = $$('.faq details');
  function faqClose(d) {
    var a = $('.faq-a', d);
    if (!d.open || d.classList.contains('is-closing')) return;
    d.classList.add('is-closing');
    a.animate([{ height: a.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' })
      .onfinish = function () { d.open = false; d.classList.remove('is-closing'); };
  }
  faqs.forEach(function (d) {
    $('summary', d).addEventListener('click', function (e) {
      if (MS.reduced || !document.body.animate) return;
      e.preventDefault();
      if (d.open) { faqClose(d); return; }
      faqs.forEach(function (x) { if (x !== d) faqClose(x); });
      d.open = true;
      var a = $('.faq-a', d);
      a.animate([{ height: '0px', opacity: 0 }, { height: a.offsetHeight + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  });

  /* ---------- шоурумы: статус «открыто / закрыто» по времени Ташкента ---------- */
  var DAYS = ['', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
  function tashkentNow() {
    var n = new Date(), t = new Date(n.getTime() + n.getTimezoneOffset() * 60000 + 5 * 3600000);
    return { day: t.getDay() || 7, h: t.getHours() + t.getMinutes() / 60 };
  }
  function hh(x) { return (x < 10 ? '0' : '') + x + ':00'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function status(s) {
    var t = tashkentNow(), work = function (d) { return d >= s.days[0] && d <= s.days[1]; };
    if (work(t.day) && t.h >= s.open && t.h < s.close) return { open: true, text: 'Открыто до ' + hh(s.close) };
    if (work(t.day) && t.h < s.open) return { open: false, text: 'Закрыто · откроется сегодня в ' + hh(s.open) };
    for (var i = 1; i <= 7; i++) {
      var d = (t.day + i - 1) % 7 + 1;
      if (work(d)) return { open: false, text: 'Закрыто · откроется ' + (i === 1 ? 'завтра' : 'в ' + DAYS[d]) + ' в ' + hh(s.open) };
    }
    return { open: false, text: 'Закрыто' };
  }
  function routeUrl(s) {
    return s.ll ? 'https://yandex.uz/maps/?rtext=~' + s.ll[1] + ',' + s.ll[0] + '&rtt=auto' : 'https://yandex.uz/maps/?text=' + encodeURIComponent(s.address);
  }
  function renderShops() {
    $('[data-shops]').innerHTML = D.company.showrooms.map(function (s, i) {
      var st = status(s);
      return '<div class="shop' + (s.main ? ' is-main' : '') + '" data-reveal data-delay="' + i * 80 + '"><svg class="i"><use href="#i-pin"/></svg><div>' +
        '<div class="shop-top"><b>' + s.title + '</b><span class="shop-st' + (st.open ? '' : ' closed') + '">' + st.text + '</span></div>' +
        '<span class="shop-addr">' + s.address + '</span>' +
        '<div class="shop-foot"><span>' + cap(DAYS[s.days[0]]) + '–' + cap(DAYS[s.days[1]]) + ' ' + hh(s.open) + '–' + hh(s.close) + '</span>' +
        '<a class="shop-route" href="' + routeUrl(s) + '" target="_blank" rel="noopener"><svg class="i"><use href="#i-route"/></svg>Маршрут</a></div></div></div>';
    }).join('');
    var main = D.company.showrooms[0], st = status(main), on = $('[data-open-now]');
    on.className = 'open-now' + (st.open ? '' : ' closed');
    on.innerHTML = '<i></i>' + (st.open ? 'Сейчас открыто · до ' + hh(main.close) : st.text.replace('Закрыто', 'Сейчас закрыто').replace('откроется', 'откроемся'));
  }
  renderShops();

  /* ---------- карта: грузим только при приближении к блоку ----------
     Яндекс-карта весит больше мегабайта. На медленном соединении (2G, режим
     экономии трафика) не грузим её сами — только по кнопке. */
  var map = $('[data-map]'), mapBtn = $('.map-load', map);
  function loadMap() {
    if (map.querySelector('iframe')) return;
    mapBtn.textContent = 'Загружаем карту…';
    var f = document.createElement('iframe');
    f.title = 'Карта: шоурум MASTERSHINA, ул. Узумзор, 37';
    f.src = map.getAttribute('data-src');
    f.setAttribute('allowfullscreen', '');
    f.onload = function () { f.classList.add('loaded'); map.classList.add('has-map'); };
    map.appendChild(f);
  }
  mapBtn.addEventListener('click', loadMap);
  var conn = navigator.connection || {};
  var slowNet = conn.saveData || /(^|-)2g/.test(conn.effectiveType || '');
  if (slowNet) mapBtn.textContent = 'Показать карту (≈1 МБ)';
  else if ('IntersectionObserver' in window) {
    var mio = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { MS.onReady(loadMap); mio.disconnect(); }
    }, { rootMargin: '300px 0px' });
    mio.observe(map);
  } else loadMap();

  /* ---------- мелочи ---------- */
  var years = $('[data-years]');
  if (years) years.setAttribute('data-count', new Date().getFullYear() - D.company.since);
  $('[data-year]').textContent = new Date().getFullYear();

  favCount(); renderGrid();
  MS.onReady(function () { MS.reveal(); carUI(); });
})();
