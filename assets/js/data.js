/* Данные каталога MASTERSHINA.
   Цены, остатки и рейтинги — демонстрационные. В рабочей версии подтягивать из 1С / API. */
window.MS_DATA = {
  company: {
    name: 'MASTERSHINA',
    since: 2010,
    phoneShort: '555 111 777',
    phoneShortHref: 'tel:555111777',
    phone: '+998 (99) 857-99-11',
    phoneHref: 'tel:+998998579911',
    email: 'info@mastershina.uz',
    telegram: 'https://t.me/AUTO777CENTERuz',
    instagram: 'https://instagram.com/auto777center.uz',
    facebook: 'https://facebook.com/auto777center.uz',
    // часы работы: дни недели (1 = Пн … 7 = Вс) и время по Ташкенту
    showrooms: [
      { title: 'Шоурум + склад', address: 'Ташкент, Сергелийский р-н, ул. Узумзор, 37', days: [1, 5], open: 9, close: 20, main: true, ll: [69.218037, 41.239976] },
      { title: 'Шоурум', address: 'Ташкент, Сергелийский р-н, ул. Янги Сергели, 44А', days: [1, 5], open: 9, close: 19 },
      { title: 'Шоурум', address: 'Ташкент, Сергелийский р-н, ул. Янги Сергели, 23', days: [1, 5], open: 9, close: 19 }
    ]
  },

  categories: [
    { id: 'truck',   title: 'Грузовые шины',        short: 'Грузовые' },
    { id: 'special', title: 'Шины для спецтехники', short: 'Спецтехника' },
    { id: 'rims',    title: 'Диски',                short: 'Диски' },
    { id: 'parts',   title: 'Запчасти и масла',     short: 'Запчасти' }
  ],

  products: [
    { id: 1,  cat: 'truck', brand: 'ROADONE', name: 'ROADONE GD800 Карьер', size: '9.00 R20', diam: 'R20', axle: 'Ведущая', img: 'gd800', price: 2950000, old: 3250000, stock: 48, rating: 4.9, reviews: 37, tag: 'Хит' },
    { id: 2,  cat: 'truck', brand: 'ROADONE', name: 'ROADONE RA85',         size: '9.00 R20', diam: 'R20', axle: 'Универсальная', img: 'ra85', price: 2750000, stock: 64, rating: 4.8, reviews: 29, tag: '' },
    { id: 3,  cat: 'truck', brand: 'ROADONE', name: 'ROADONE GD08',         size: '9.00 R20', diam: 'R20', axle: 'Ведущая', img: 'gd08', price: 2850000, stock: 31, rating: 4.9, reviews: 41, tag: 'Хит' },
    { id: 4,  cat: 'truck', brand: 'ROADONE', name: 'ROADONE RF02',         size: '8.25 R16LT', diam: 'R16', axle: 'Рулевая', img: 'rf02', price: 1650000, stock: 80, rating: 4.7, reviews: 18, tag: '' },
    { id: 5,  cat: 'truck', brand: 'ROADONE', name: 'ROADONE RF62/61',      size: '7.50 R16LT', diam: 'R16', axle: 'Рулевая', img: 'rf62', price: 1450000, old: 1590000, stock: 22, rating: 4.8, reviews: 12, tag: 'Скидка' },
    { id: 6,  cat: 'truck', brand: 'ROADONE', name: 'ROADONE GD08 LT',      size: '8.25 R16LT', diam: 'R16', axle: 'Ведущая', img: 'gd08', price: 1720000, stock: 40, rating: 4.8, reviews: 9, tag: 'Новинка' },

    { id: 7,  cat: 'special', brand: 'HENGTAR', name: 'HENGTAR H818 TTF',    size: '7.00-12', diam: 'R12', axle: 'Погрузчик', img: 'h818', price: 1250000, stock: 26, rating: 4.7, reviews: 14, tag: '' },
    { id: 8,  cat: 'special', brand: 'HENGTAR', name: 'HENGTAR HD101 Solid', size: '16.6-8', diam: 'R8', axle: 'Цельнолитая', img: 'hd101', price: 1900000, stock: 12, rating: 5.0, reviews: 7, tag: 'Хит' },
    { id: 9,  cat: 'special', brand: 'HENGTAR', name: 'HENGTAR R4-3 TL',     size: '10.5/80-18', diam: 'R18', axle: 'Экскаватор-погрузчик', img: 'r43', price: 2100000, stock: 18, rating: 4.8, reviews: 11, tag: '' },
    { id: 10, cat: 'special', brand: 'HENGTAR', name: 'HENGTAR E3/L3A TTF',  size: '16/70-20', diam: 'R20', axle: 'Фронтальный погрузчик', img: 'e3l3', price: 3400000, stock: 9, rating: 4.9, reviews: 6, tag: 'Новинка' },
    { id: 11, cat: 'special', brand: 'HENGTAR', name: 'HENGTAR R4-2 TL',     size: '19.5L-24', diam: 'R24', axle: 'Экскаватор-погрузчик', img: 'r42', price: 4600000, stock: 7, rating: 4.8, reviews: 5, tag: '' },

    { id: 12, cat: 'rims', brand: 'SULTAN', name: 'Диск SULTAN', size: '11.75 R22.5', diam: 'R22.5', axle: 'Бескамерный', img: 'sultan1175', price: 1850000, stock: 35, rating: 4.9, reviews: 16, tag: 'Хит' },
    { id: 13, cat: 'rims', brand: 'SULTAN', name: 'Диск SULTAN', size: '9.00 R22.5',  diam: 'R22.5', axle: 'Бескамерный', img: 'sultan900', price: 1550000, stock: 42, rating: 4.8, reviews: 10, tag: '' },
    { id: 14, cat: 'rims', brand: 'BEITER', name: 'Диск BEITER', size: '12.00 R20',   diam: 'R20', axle: 'Камерный', img: 'beiter1200', price: 1700000, stock: 20, rating: 4.7, reviews: 8, tag: '' },

    { id: 15, cat: 'parts', brand: 'Castrol', name: 'Масло Castrol Vecton Long Drain 10W-40', size: '20 л', diam: '', axle: 'Моторное масло', img: 'castrol', price: 1350000, stock: 60, rating: 4.9, reviews: 22, tag: '' },
    { id: 16, cat: 'parts', brand: 'ATLANT', name: 'Аккумулятор ATLANT 6СТ-190', size: '190 Ач', diam: '', axle: 'АКБ', img: 'atlant', price: 2400000, stock: 15, rating: 4.8, reviews: 13, tag: '' },
    { id: 17, cat: 'parts', brand: 'HOWO', name: 'Амортизатор кабины HOWO A7', size: 'WG1664440068', diam: '', axle: 'Подвеска кабины', img: 'amort', price: 420000, stock: 28, rating: 4.7, reviews: 9, tag: 'Новинка' }
  ],

  /* Платёжные методы для будущего эквайринга */
  payments: [
    { id: 'payme', title: 'Payme', note: 'Оплата картой через Payme' },
    { id: 'click', title: 'Click', note: 'Оплата через Click Up' },
    { id: 'uzum',  title: 'Uzum Bank', note: 'Оплата и рассрочка Uzum' },
    { id: 'card',  title: 'UzCard / HUMO / Visa', note: 'Банковская карта' },
    { id: 'cash',  title: 'При получении', note: 'Наличными или картой в шоуруме' }
  ]
};

/* Формат цены в сумах: 2950000 -> "2 950 000 сум" */
window.MS_fmt = function (n) {
  return Math.round(n).toLocaleString('ru-RU').replace(/[\s,]/g, ' ') + ' сум';
};
