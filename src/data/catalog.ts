import { Category, HeroSlide, MenuItem } from '../types/menu';

export const RESTAURANT_INFO = {
  brand: 'Пелемешка',
  city: 'г. Кандалакша',
  street: 'ул. Советская, д. 5',
  fullAddress: 'г. Кандалакша, ул. Советская, д. 5',
  phoneDisplay: '8 (911) 063-47-85',
  phoneHref: 'tel:+79110634785',
  hours: 'Ежедневно, 10:00 – 20:00',
  freeDeliveryThreshold: 1500,
  deliveryFee: 200,
  pickupDiscountRate: 0.1,
} as const;

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-pelmeni',
    categoryId: 'pelmeni',
    kicker: 'Фирменная кухня · Отварные и жареные',
    title: 'Пельмени ручной лепки: говяжьи, куриные, рыбные и свинина-говядина',
    description:
      'Подаём классическими отварными со сливочным маслом или жареными до золотистой корочки. Соус заказывается отдельно.',
    ctaLabel: 'Выбрать пельмени',
    image: '/src/assets/images/hero_pelmeni_1795535551714.jpg',
  },
  {
    id: 'slide-combo',
    categoryId: 'combo',
    kicker: 'Выгодные наборы · Всё включено',
    title: 'Комбо-наборы: бургер, пельмени или шаурма с картофелем и соусом',
    description:
      'Готовые сытные наборы с картофелем фри, соусом и ягодным морсом — заказывать в комбо всегда выгоднее.',
    ctaLabel: 'Выбрать комбо',
    image: '/src/assets/images/combo_burger_fries_1795551962733.jpg',
  },
  {
    id: 'slide-burgers',
    categoryId: 'burgers',
    kicker: 'Гриль-бар · Гамбургеры, чизбургеры и чикенбургеры',
    title: 'Бургеры S, XL и двойные XXL на бриоши',
    description:
      'Классические гамбургеры, чизбургеры и хрустящие чикенбургеры в размерах S, XL и двойные XXL с двумя котлетами.',
    ctaLabel: 'Смотреть бургеры',
    image: '/src/assets/images/hero_burgers_1795535552843.jpg',
  },
  {
    id: 'slide-hotdogs',
    categoryId: 'hotdogs',
    kicker: 'Стрит-фуд · Классические и французский',
    title: 'Хот-доги S, M, XXL и хрустящий французский хот-дог',
    description:
      'Тёплая булочка, сочная колбаска, кетчуп, горчица и хрустящий лук — выбирайте классический размер или французский в багете.',
    ctaLabel: 'Перейти к хот-догам',
    image: '/src/assets/images/hotdog_realistic_classic_1795550587562.jpg',
  },
  {
    id: 'slide-shawarma',
    categoryId: 'shawarma',
    kicker: 'Сочный лаваш · Курица и свинина',
    title: 'Шаурма в трёх размерах: S, M и большая XXL',
    description:
      'Поджаренный хрустящий лаваш, нежное куриное бедро или свиная вырезка, свежие овощи и фирменный белый соус внутри.',
    ctaLabel: 'Выбрать шаурму',
    image: '/src/assets/images/dish_shawarma_1795544757353.jpg',
  },
  {
    id: 'slide-kupaty',
    categoryId: 'kupaty',
    kicker: 'Во фритюре · 5 видов мяса',
    title: 'Купаты: курица, кролик, свинина, олень и баран',
    description:
      'Сочные домашние колбаски, обжаренные во фритюре до румяной золотистой корочки с маринованным луком. Соус заказывается отдельно.',
    ctaLabel: 'Смотреть купаты',
    image: '/src/assets/images/kupaty_fried_1795550588215.jpg',
  },
  {
    id: 'slide-fries',
    categoryId: 'fries',
    kicker: 'Хрустящий гарнир · Во фритюре',
    title: 'Картофель фри, по-деревенски и сладкий батат',
    description:
      'Золотистые дольки, классический фри и нежный батат с морской солью и травами. Соус заказывается отдельно.',
    ctaLabel: 'Выбрать картофель',
    image: '/src/assets/images/potato_wedges_real_1795550588708.jpg',
  },
  {
    id: 'slide-snacks',
    categoryId: 'snacks',
    kicker: 'Для компании · С пылу с жару',
    title: 'Кольца кальмара, луковые кольца, сырные палочки и ассорти',
    description:
      'Хрустящие закуски по отдельности или в удобных наборах из двух и трёх позиций. Соус заказывается отдельно.',
    ctaLabel: 'Открыть закуски',
    image: '/src/assets/images/snacks_calamari_rings_1795550589851.jpg',
  },
  {
    id: 'slide-chicken',
    categoryId: 'chicken',
    kicker: 'Золотистый хруст · Филе и крылышки',
    title: 'Хрустящие куриные стрипсы, крылышки и бокс для двоих',
    description:
      'Сочное куриное мясо в ароматной панировке со специями. Идеально сочетается с сырным или барбекю соусом.',
    ctaLabel: 'Выбрать курицу',
    image: '/src/assets/images/dish_chicken_nuggets_1795535557919.jpg',
  },
  {
    id: 'slide-sauces',
    categoryId: 'sauces',
    kicker: 'Идеальное дополнение · 6 позиций',
    title: 'Фирменные соусы и фермерская сметана',
    description:
      'Сметана 20%, сырный чеддер, чесночный с укропом, кетчуп, барбекю с дымком и сладкий чили к любимым блюдам.',
    ctaLabel: 'Выбрать соус',
    image: '/src/assets/images/sauces_set_1795550589170.jpg',
  },
  {
    id: 'slide-drinks',
    categoryId: 'drinks',
    kicker: 'Северные ягоды · Собственное производство',
    title: 'Домашние морсы из клюквы и брусники',
    description:
      'Насыщенные охлаждённые ягодные морсы из отборных северных ягод — идеальное дополнение к горячим блюдам.',
    ctaLabel: 'Выбрать морс',
    image: '/src/assets/images/hero_morse_1795544758226.jpg',
  },
  {
    id: 'slide-milkshakes',
    categoryId: 'milkshakes',
    kicker: 'На натуральном пломбире · 400 мл',
    title: 'Густые молочные коктейли: ваниль, шоколад и ягоды',
    description:
      'Сливочные коктейли на основе настоящего фермерского пломбира и молока со взбитыми сливками.',
    ctaLabel: 'Выбрать коктейль',
    image: '/src/assets/images/dish_milkshake_1795544757645.jpg',
  },
  {
    id: 'slide-icecream',
    categoryId: 'icecream',
    kicker: '10 авторских вкусов · Сорбеты и пломбир',
    title: 'Мороженое: фисташка, солёная карамель, манго и ягоды',
    description:
      'Десять насыщенных вкусов — от классического ванильного пломбира и бельгийского шоколада до сорбета «Манго-Маракуйя».',
    ctaLabel: 'Выбрать мороженое',
    image: '/src/assets/images/icecream_pistachio_caramel_1795545053880.jpg',
  },
  {
    id: 'slide-desserts',
    categoryId: 'desserts',
    kicker: 'К чаю и коктейлю · Свежая выпечка',
    title: 'Десерты: маффины, чизкейки и вафельные корзинки с ягодами',
    description:
      'Порционные чизкейки, воздушные шоколадные и ягодные маффины и хрустящие вафельные корзинки со сливочным кремом.',
    ctaLabel: 'Открыть десерты',
    image: '/src/assets/images/dessert_waffle_basket_1795550592057.jpg',
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'combo',
    name: 'Комбо',
    emoji: '🎁',
    subtitle: 'Выгодные наборы с картофелем, соусом и морсом',
    image: '/src/assets/images/combo_burger_fries_1795551962733.jpg',
  },
  {
    id: 'pelmeni',
    name: 'Пельмени',
    emoji: '🥟',
    subtitle: 'Рыбные, куриные, говяжьи, св-гов · отварные и жареные',
    image: '/src/assets/images/hero_pelmeni_1795535551714.jpg',
  },
  {
    id: 'burgers',
    name: 'Бургеры',
    emoji: '🍔',
    subtitle: 'Гамбургеры, чизбургеры и чикенбургеры S / XL / XXL',
    image: '/src/assets/images/hero_burgers_1795535552843.jpg',
  },
  {
    id: 'hotdogs',
    name: 'Хот-доги',
    emoji: '🌭',
    subtitle: 'Размеры S, M, XXL и французский хот-дог',
    image: '/src/assets/images/hotdog_realistic_classic_1795550587562.jpg',
  },
  {
    id: 'shawarma',
    name: 'Шаурма',
    emoji: '🌯',
    subtitle: 'Куриная и свиная · 3 размера (S, M, XXL)',
    image: '/src/assets/images/dish_shawarma_1795544757353.jpg',
  },
  {
    id: 'kupaty',
    name: 'Купаты',
    emoji: '🥩',
    subtitle: 'Во фритюре: курица, кролик, свинина, олень, баран',
    image: '/src/assets/images/kupaty_fried_1795550588215.jpg',
  },
  {
    id: 'fries',
    name: 'Картофель',
    emoji: '🍟',
    subtitle: 'Фри, по-деревенски и батат',
    image: '/src/assets/images/potato_wedges_real_1795550588708.jpg',
  },
  {
    id: 'snacks',
    name: 'Закуски',
    emoji: '🧀',
    subtitle: 'Луковые кольца, кальмар, моцарелла и ассорти',
    image: '/src/assets/images/snacks_calamari_rings_1795550589851.jpg',
  },
  {
    id: 'chicken',
    name: 'Курица',
    emoji: '🍗',
    subtitle: 'Хрустящие стрипсы и крылышки',
    image: '/src/assets/images/dish_chicken_nuggets_1795535557919.jpg',
  },
  {
    id: 'sauces',
    name: 'Соусы',
    emoji: '🥣',
    subtitle: 'Фирменные соусы и сметана к блюдам',
    image: '/src/assets/images/sauces_set_1795550589170.jpg',
  },
  {
    id: 'drinks',
    name: 'Морсы',
    emoji: '🥤',
    subtitle: 'Клюквенный и брусничный',
    image: '/src/assets/images/hero_morse_1795544758226.jpg',
  },
  {
    id: 'milkshakes',
    name: 'Молочные коктейли',
    emoji: '🥛',
    subtitle: 'Ванильный, шоколадный и ягодный',
    image: '/src/assets/images/dish_milkshake_1795544757645.jpg',
  },
  {
    id: 'icecream',
    name: 'Мороженое',
    emoji: '🍨',
    subtitle: '10 авторских вкусов и сорбеты',
    image: '/src/assets/images/dish_icecream_1795544758619.jpg',
  },
  {
    id: 'desserts',
    name: 'Десерты',
    emoji: '🧁',
    subtitle: 'Маффины, чизкейки и вафельные корзинки',
    image: '/src/assets/images/dessert_waffle_basket_1795550592057.jpg',
  },
];

export const MENU_ITEMS: MenuItem[] = [
  // 0. Комбо-наборы (6 готовых комбо)
  {
    id: 'combo-hamburger-classic',
    categoryId: 'combo',
    name: 'Комбо «Гамбургер + фри + соус»',
    description:
      'Сочный гамбургер XL, порция хрустящего картофеля фри и сырный соус Чеддер в одном наборе.',
    weight: '520 г',
    price: 590,
    image: '/src/assets/images/combo_burger_fries_1795551962733.jpg',
    tag: 'Выгодно',
  },
  {
    id: 'combo-cheeseburger-morse',
    categoryId: 'combo',
    name: 'Комбо «Чизбургер + фри + морс»',
    description:
      'Большой чизбургер XL с расплавленным чеддером, картофель фри, томатный кетчуп и клюквенный морс 0.5 л.',
    weight: '540 г + 0.5 л',
    price: 740,
    image: '/src/assets/images/combo_burger_fries_1795551962733.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'combo-pelmeni-lunch',
    categoryId: 'combo',
    name: 'Комбо «Обед с пельменями»',
    description:
      'Отварные пельмени свинина-говядина, ароматный картофель по-деревенски, фермерская сметана 20% и брусничный морс 0.5 л.',
    weight: '580 г + 0.5 л',
    price: 760,
    image: '/src/assets/images/combo_pelmeni_morse_1795551980424.jpg',
    tag: 'Фирменный',
  },
  {
    id: 'combo-shawarma-snacks',
    categoryId: 'combo',
    name: 'Комбо «Шаурма + закуски + соус»',
    description:
      'Куриная шаурма размера M, хрустящие луковые кольца, сырные палочки моцарелла и чесночный соус с укропом.',
    weight: '660 г',
    price: 780,
    image: '/src/assets/images/combo_shawarma_snacks_1795551963320.jpg',
    tag: 'Сытный сет',
  },
  {
    id: 'combo-hotdog-drive',
    categoryId: 'combo',
    name: 'Комбо «Хот-дог + фри + морс»',
    description:
      'Классический хот-дог M с подкопчённой колбаской, порция картофеля фри, кетчуп и ягодный морс 0.5 л.',
    weight: '465 г + 0.5 л',
    price: 610,
    image: '/src/assets/images/combo_hotdog_fries_1795552004861.jpg',
  },
  {
    id: 'combo-chicken-kupaty',
    categoryId: 'combo',
    name: 'Комбо «Стрипсы + купаты + фри + соус»',
    description:
      'Хрустящие куриные стрипсы, купаты из свинины во фритюре, картофель фри и соус Барбекю с дымком.',
    weight: '740 г',
    price: 850,
    image: '/src/assets/images/dish_chicken_nuggets_1795535557919.jpg',
    tag: 'Для двоих',
  },

  // 1. Пельмени (рыбные, куриные, говяжьи, св-гов — отварные; куриные, говяжьи, св-гов — жареные)
  {
    id: 'pelmeni-beef-pork',
    categoryId: 'pelmeni',
    name: 'Пельмени свинина-говядина (отварные)',
    description:
      'Классическая ручная лепка: сочный фарш из свинины и говядины, сливочное масло и укроп. Соус заказывается отдельно.',
    weight: '320 г',
    price: 380,
    image: '/src/assets/images/hero_pelmeni_1795535551714.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'pelmeni-beef',
    categoryId: 'pelmeni',
    name: 'Пельмени говяжьи (отварные)',
    description:
      'Насыщенная начинка из отборной говядины со специями и репчатым луком, подаются со сливочным маслом. Соус заказывается отдельно.',
    weight: '320 г',
    price: 410,
    image: '/src/assets/images/hero_pelmeni_1795535551714.jpg',
  },
  {
    id: 'pelmeni-chicken',
    categoryId: 'pelmeni',
    name: 'Пельмени куриные (отварные)',
    description:
      'Нежные домашние пельмени из куриного филе в тонком тесте со свежей зеленью. Соус заказывается отдельно.',
    weight: '320 г',
    price: 350,
    image: '/src/assets/images/dish_pelmeni_broth_1795535555516.jpg',
  },
  {
    id: 'pelmeni-fish',
    categoryId: 'pelmeni',
    name: 'Пельмени рыбные (отварные)',
    description:
      'Фирменные северные пельмени из нежного рыбного филе с укропом и сливочным маслом. Соус заказывается отдельно.',
    weight: '320 г',
    price: 430,
    image: '/src/assets/images/dish_pelmeni_fish_1795544759087.jpg',
    tag: 'Северный рецепт',
  },
  {
    id: 'pelmeni-fried-beef-pork',
    categoryId: 'pelmeni',
    name: 'Жареные пельмени свинина-говядина',
    description:
      'Поджаренные до аппетитной хрустящей корочки с пряными травами. Соус заказывается отдельно.',
    weight: '300 г',
    price: 410,
    image: '/src/assets/images/dish_pelmeni_fried_1795535555383.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'pelmeni-fried-beef',
    categoryId: 'pelmeni',
    name: 'Жареные пельмени говяжьи',
    description:
      'Хрустящие золотистые пельмени с рубленой говядиной и чёрным перцем. Соус заказывается отдельно.',
    weight: '300 г',
    price: 440,
    image: '/src/assets/images/dish_pelmeni_fried_1795535555383.jpg',
  },
  {
    id: 'pelmeni-fried-chicken',
    categoryId: 'pelmeni',
    name: 'Жареные пельмени куриные',
    description:
      'Румяные куриные пельмени с хрустящей корочкой и свежим укропом. Соус заказывается отдельно.',
    weight: '300 г',
    price: 380,
    image: '/src/assets/images/dish_pelmeni_fried_1795535555383.jpg',
  },

  // 2. Бургеры (гамбургер, чизбургер, чикенбургер — S, XL, XXL)
  {
    id: 'burger-hamburger-small',
    categoryId: 'burgers',
    name: 'Гамбургер S',
    description:
      'Маленький классический бургер: говяжья котлета, маринованный огурчик, хрустящий салат, лук и томатный соус внутри.',
    weight: '190 г',
    price: 260,
    image: '/src/assets/images/hero_burgers_1795535552843.jpg',
  },
  {
    id: 'burger-hamburger-large',
    categoryId: 'burgers',
    name: 'Гамбургер XL',
    description:
      'Большой гамбургер с крупной рубленой котлетой из мраморной говядины, свежими томатами, салатом ромэн и заправкой барбекю.',
    weight: '290 г',
    price: 390,
    image: '/src/assets/images/hero_burgers_1795535552843.jpg',
  },
  {
    id: 'burger-hamburger-double',
    categoryId: 'burgers',
    name: 'Двойной гамбургер XXL',
    description:
      'Большой гамбургер с двумя сочными говяжьими котлетами на гриле, свежими овощами и двойной порцией соуса внутри.',
    weight: '390 г',
    price: 510,
    image: '/src/assets/images/hero_burgers_1795535552843.jpg',
    tag: '2 котлеты · XXL',
  },
  {
    id: 'burger-cheeseburger-small',
    categoryId: 'burgers',
    name: 'Чизбургер S',
    description:
      'Маленький чизбургер: нежная говяжья котлета, расплавленный сыр чеддер, маринованный огурчик и горчичная заправка.',
    weight: '205 г',
    price: 290,
    image: '/src/assets/images/hero_burgers_1795535552843.jpg',
  },
  {
    id: 'burger-cheeseburger-large',
    categoryId: 'burgers',
    name: 'Чизбургер XL',
    description:
      'Большой чизбургер с сочной говяжьей котлетой, тягучим сыром чеддер, свежими томатами и салатом.',
    weight: '310 г',
    price: 430,
    image: '/src/assets/images/hero_burgers_1795535552843.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'burger-cheeseburger-double',
    categoryId: 'burgers',
    name: 'Двойной чизбургер XXL',
    description:
      'Большой чизбургер с двумя рублеными говяжьими котлетами, двойным слоем расплавленного чеддера и дымным соусом.',
    weight: '420 г',
    price: 560,
    image: '/src/assets/images/hero_burgers_1795535552843.jpg',
    tag: '2 котлеты · XXL',
  },
  {
    id: 'burger-chicken-small',
    categoryId: 'burgers',
    name: 'Чикенбургер S',
    description:
      'Маленький бургер с хрустящей куриной котлетой в золотистой панировке, свежим салатом коул-слоу и сливочным соусом.',
    weight: '200 г',
    price: 270,
    image: '/src/assets/images/dish_burger_chicken_1795535556023.jpg',
  },
  {
    id: 'burger-chicken-large',
    categoryId: 'burgers',
    name: 'Чикенбургер XL',
    description:
      'Большой бургер с сочной куриной котлетой в хрустящей панировке, расплавленным сыром чеддер и свежим салатом.',
    weight: '310 г',
    price: 410,
    image: '/src/assets/images/dish_burger_chicken_1795535556023.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'burger-chicken-double',
    categoryId: 'burgers',
    name: 'Двойной чикенбургер XXL',
    description:
      'Большой чикенбургер с двумя хрустящими куриными котлетами в панировке, двойным чеддером и пикантной заправкой.',
    weight: '420 г',
    price: 530,
    image: '/src/assets/images/dish_burger_chicken_1795535556023.jpg',
    tag: '2 котлеты · XXL',
  },

  // 3. Хот-доги (реалистичные фото + французский хот-дог)
  {
    id: 'hotdog-small',
    categoryId: 'hotdogs',
    name: 'Хот-дог S',
    description:
      'Маленький классический хот-дог: мягкая поджаренная булочка, сочная сосиска, горчица, кетчуп и хрустящий лук.',
    weight: '165 г',
    price: 210,
    image: '/src/assets/images/hotdog_realistic_classic_1795550587562.jpg',
  },
  {
    id: 'hotdog-medium',
    categoryId: 'hotdogs',
    name: 'Хот-дог M',
    description:
      'Средний хот-дог: тёплая булочка, сочная подкопчённая колбаска, горчица, кетчуп, маринованный огурчик и лук-фри.',
    weight: '235 г',
    price: 290,
    image: '/src/assets/images/hotdog_realistic_classic_1795550587562.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'hotdog-large',
    categoryId: 'hotdogs',
    name: 'Хот-дог XXL',
    description:
      'Большой хот-дог XXL с крупной копчёной колбаской, тягучим чеддером, горчицей, кетчупом и жареным луком.',
    weight: '320 г',
    price: 380,
    image: '/src/assets/images/hotdog_realistic_classic_1795550587562.jpg',
    tag: 'Размер XXL',
  },
  {
    id: 'hotdog-french',
    categoryId: 'hotdogs',
    name: 'Французский хот-дог',
    description:
      'Хрустящая поджаренная булка-багет, сочная сосиска внутри, пикантная горчица, кетчуп и чесночная заправка.',
    weight: '210 г',
    price: 280,
    image: '/src/assets/images/hotdog_french_1795550588560.jpg',
    tag: 'Хит',
  },

  // 4. Шаурма (куриная и свиная — 3 размера на выбор)
  {
    id: 'shawarma-chicken',
    categoryId: 'shawarma',
    name: 'Шаурма куриная',
    description:
      'Нежное куриное бедро, свежие огурцы, томаты, пекинская капуста и чесночный соус в хрустящем лаваше. Доступна в трёх размерах: S, M и XXL.',
    weight: '280–500 г',
    price: 270,
    image: '/src/assets/images/dish_shawarma_1795544757353.jpg',
    tag: '3 размера · Хит',
    sizes: [
      {
        id: 'shawarma-chicken-small',
        label: 'Маленькая (S)',
        shortLabel: 'S',
        weight: '280 г',
        price: 270,
      },
      {
        id: 'shawarma-chicken-medium',
        label: 'Средняя (M)',
        shortLabel: 'M',
        weight: '380 г',
        price: 340,
      },
      {
        id: 'shawarma-chicken-large',
        label: 'Большая (XXL)',
        shortLabel: 'XXL',
        weight: '500 г',
        price: 430,
      },
    ],
  },
  {
    id: 'shawarma-pork',
    categoryId: 'shawarma',
    name: 'Шаурма свиная',
    description:
      'Сочная обжаренная свинина в специях, свежие томаты, огурцы, красный лук и авторский соус в лаваше. Доступна в трёх размерах: S, M и XXL.',
    weight: '280–520 г',
    price: 290,
    image: '/src/assets/images/dish_shawarma_1795544757353.jpg',
    tag: '3 размера',
    sizes: [
      {
        id: 'shawarma-pork-small',
        label: 'Маленькая (S)',
        shortLabel: 'S',
        weight: '280 г',
        price: 290,
      },
      {
        id: 'shawarma-pork-medium',
        label: 'Средняя (M)',
        shortLabel: 'M',
        weight: '390 г',
        price: 370,
      },
      {
        id: 'shawarma-pork-large',
        label: 'Большая (XXL)',
        shortLabel: 'XXL',
        weight: '520 г',
        price: 460,
      },
    ],
  },

  // 5. Купаты (во фритюре, а не на гриле; соус отдельно)
  {
    id: 'kupaty-chicken',
    categoryId: 'kupaty',
    name: 'Купаты куриные во фритюре',
    description:
      'Нежные сочные купаты из куриного мяса с чесноком и травами, обжаренные во фритюре с маринованным луком. Соус заказывается отдельно.',
    weight: '260 г',
    price: 370,
    image: '/src/assets/images/kupaty_fried_1795550588215.jpg',
  },
  {
    id: 'kupaty-rabbit',
    categoryId: 'kupaty',
    name: 'Купаты из кролика во фритюре',
    description:
      'Деликатесные нежные колбаски из филе кролика со сливочными специями, приготовленные во фритюре до румяной корочки. Соус заказывается отдельно.',
    weight: '250 г',
    price: 490,
    image: '/src/assets/images/kupaty_fried_1795550588215.jpg',
    tag: 'Деликатес',
  },
  {
    id: 'kupaty-pork',
    categoryId: 'kupaty',
    name: 'Купаты из свинины во фритюре',
    description:
      'Классические сочные свиные купаты с чёрным перцем и кориандром, обжаренные во фритюре до золотистой корочки. Соус заказывается отдельно.',
    weight: '270 г',
    price: 410,
    image: '/src/assets/images/kupaty_fried_1795550588215.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'kupaty-venison',
    categoryId: 'kupaty',
    name: 'Купаты из оленины во фритюре',
    description:
      'Ароматные северные купаты из отборной оленины с можжевельником и травами, обжаренные во фритюре. Соус заказывается отдельно.',
    weight: '260 г',
    price: 580,
    image: '/src/assets/images/kupaty_fried_1795550588215.jpg',
    tag: 'Северный хит',
  },
  {
    id: 'kupaty-lamb',
    categoryId: 'kupaty',
    name: 'Купаты из баранины во фритюре',
    description:
      'Пряные сочные купаты из молодой баранины с зирой и кинзой, приготовленные во фритюре с красным луком. Соус заказывается отдельно.',
    weight: '260 г',
    price: 520,
    image: '/src/assets/images/kupaty_fried_1795550588215.jpg',
  },

  // 6. Картофель (фри, XXL, по-деревенски, батат; без позиции с сырным соусом)
  {
    id: 'fries-classic',
    categoryId: 'fries',
    name: 'Картофель фри',
    description:
      'Хрустящие золотистые ломтики картофеля с морской солью и свежей зеленью. Соус заказывается отдельно.',
    weight: '180 г',
    price: 220,
    image: '/src/assets/images/hero_fries_1795535553881.jpg',
  },
  {
    id: 'fries-large-share',
    categoryId: 'fries',
    name: 'Картофель фри XXL',
    description:
      'Большая порция хрустящего картофеля фри на компанию со специями и зеленью. Соус заказывается отдельно.',
    weight: '340 г',
    price: 360,
    image: '/src/assets/images/hero_fries_1795535553881.jpg',
    tag: 'Размер XXL',
  },
  {
    id: 'fries-country',
    categoryId: 'fries',
    name: 'Картофель по-деревенски',
    description:
      'Ароматные хрустящие дольки картофеля с розмарином, чесночными специями и морской солью. Соус заказывается отдельно.',
    weight: '210 г',
    price: 250,
    image: '/src/assets/images/potato_wedges_real_1795550588708.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'fries-sweet-potato',
    categoryId: 'fries',
    name: 'Батат фри',
    description:
      'Хрустящие ломтики сладкого картофеля (батат) с морской солью и пряными травами. Соус заказывается отдельно.',
    weight: '180 г',
    price: 290,
    image: '/src/assets/images/sweet_potato_fries_1795550588397.jpg',
    tag: 'Новинка',
  },

  // 7. Закуски (отдельные + ассорти из двух и трёх)
  {
    id: 'snacks-onion-rings',
    categoryId: 'snacks',
    name: 'Луковые кольца',
    description:
      'Хрустящие золотистые кольца репчатого лука в воздушном кляре со специями. Соус заказывается отдельно.',
    weight: '160 г',
    price: 230,
    image: '/src/assets/images/snacks_calamari_rings_1795550589851.jpg',
  },
  {
    id: 'snacks-calamari-rings',
    categoryId: 'snacks',
    name: 'Кольца кальмара',
    description:
      'Нежные кольца кальмара в золотистой хрустящей панировке с долькой свежего лимона. Соус заказывается отдельно.',
    weight: '160 г',
    price: 310,
    image: '/src/assets/images/snacks_calamari_rings_1795550589851.jpg',
    tag: 'Хит',
  },
  {
    id: 'snacks-cheese-sticks',
    categoryId: 'snacks',
    name: 'Сырные палочки Моцарелла (7 шт.)',
    description:
      'Тянущаяся горячая моцарелла в хрустящей панировке панко. Соус заказывается отдельно.',
    weight: '190 г',
    price: 320,
    image: '/src/assets/images/hero_snacks_1795535554761.jpg',
  },
  {
    id: 'snacks-trio-assorted',
    categoryId: 'snacks',
    name: 'Ассорти из трёх: кальмар, сырные палочки и луковые кольца',
    description:
      'Большой сет для компании: кольца кальмара, тянущиеся сырные палочки моцарелла и хрустящие луковые кольца. Соус заказывается отдельно.',
    weight: '390 г',
    price: 590,
    image: '/src/assets/images/hero_snacks_1795535554761.jpg',
    tag: 'Трио · XXL',
  },
  {
    id: 'snacks-duo-rings',
    categoryId: 'snacks',
    name: 'Ассорти колец: луковые и кальмара',
    description:
      'Дуэт хрустящих закусок: золотистые луковые кольца и нежные кольца кальмара в панировке. Соус заказывается отдельно.',
    weight: '260 г',
    price: 430,
    image: '/src/assets/images/snacks_calamari_rings_1795550589851.jpg',
    tag: 'Дуэт',
  },
  {
    id: 'snacks-mozzarella-rings',
    categoryId: 'snacks',
    name: 'Ассорти: сырные палочки + луковые кольца',
    description:
      'Тянущаяся моцарелла в золотистой панировке и хрустящие луковые кольца. Соус заказывается отдельно.',
    weight: '280 г',
    price: 440,
    image: '/src/assets/images/hero_snacks_1795535554761.jpg',
    tag: 'Дуэт',
  },
  {
    id: 'snacks-sticks-calamari',
    categoryId: 'snacks',
    name: 'Ассорти: сырные палочки + кольца кальмара',
    description:
      'Хрустящие сырные палочки моцарелла в паре с кольцами кальмара в золотистом кляре. Соус заказывается отдельно.',
    weight: '280 г',
    price: 490,
    image: '/src/assets/images/snacks_calamari_rings_1795550589851.jpg',
    tag: 'Дуэт',
  },

  // 8. Курица (соус отдельно)
  {
    id: 'chicken-crispy-strips',
    categoryId: 'chicken',
    name: 'Хрустящие куриные стрипсы',
    description:
      'Нежное куриное филе в специях и золотистой панировке. Соус заказывается отдельно.',
    weight: '240 г',
    price: 370,
    image: '/src/assets/images/dish_chicken_nuggets_1795535557919.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'chicken-spicy-wings',
    categoryId: 'chicken',
    name: 'Острые куриные крылышки в панировке',
    description:
      'Сочные крылышки в пряном хрустящем кляре с копчёной паприкой. Соус заказывается отдельно.',
    weight: '280 г',
    price: 390,
    image: '/src/assets/images/dish_chicken_nuggets_1795535557919.jpg',
  },
  {
    id: 'chicken-box',
    categoryId: 'chicken',
    name: 'Куриный бокс для двоих',
    description:
      'Большая порция хрустящих стрипсов и золотистый картофель фри. Соус заказывается отдельно.',
    weight: '460 г',
    price: 620,
    image: '/src/assets/images/dish_chicken_nuggets_1795535557919.jpg',
  },

  // 9. Соусы (фирменные соусы и сметана)
  {
    id: 'sauce-sour-cream',
    categoryId: 'sauces',
    name: 'Сметана фермерская 20%',
    description:
      'Густая натуральная фермерская сметана — классическое дополнение к горячим отварным и жареным пельменям.',
    weight: '50 г',
    price: 55,
    image: '/src/assets/images/hero_pelmeni_1795535551714.jpg',
    tag: 'К пельменям',
  },
  {
    id: 'sauce-cheese',
    categoryId: 'sauces',
    name: 'Сырный соус Чеддер',
    description:
      'Густой сливочный соус с насыщенным вкусом выдержанного сыра чеддер. Идеален к картофелю, стрипсам и закускам.',
    weight: '50 г',
    price: 60,
    image: '/src/assets/images/sauces_set_1795550589170.jpg',
    tag: 'Популярный',
  },
  {
    id: 'sauce-garlic',
    categoryId: 'sauces',
    name: 'Чесночный соус с укропом',
    description:
      'Нежный сливочный соус с ароматным чесноком, свежим укропом и чёрным перцем — отлично подходит к закускам и купатам.',
    weight: '50 г',
    price: 60,
    image: '/src/assets/images/sauces_set_1795550589170.jpg',
  },
  {
    id: 'sauce-ketchup',
    categoryId: 'sauces',
    name: 'Томатный соус (Кетчуп)',
    description:
      'Классический густой томатный кетчуп из спелых томатов со щепоткой пряных специй.',
    weight: '50 г',
    price: 55,
    image: '/src/assets/images/sauces_set_1795550589170.jpg',
  },
  {
    id: 'sauce-bbq',
    categoryId: 'sauces',
    name: 'Соус Барбекю с дымком',
    description:
      'Насыщенный пряно-дымный соус на томатной основе с нотками карамели — отлично подходит к купатам и курице.',
    weight: '50 г',
    price: 65,
    image: '/src/assets/images/sauces_set_1795550589170.jpg',
  },
  {
    id: 'sauce-sweet-chili',
    categoryId: 'sauces',
    name: 'Соус Сладкий чили',
    description:
      'Глянцевый кисло-сладкий соус с мягкой пикантной остринкой красного перца — идеален к кольцам кальмара и стрипсам.',
    weight: '50 г',
    price: 65,
    image: '/src/assets/images/sauces_set_1795550589170.jpg',
  },

  // 10. Морсы
  {
    id: 'drink-cranberry-morse',
    categoryId: 'drinks',
    name: 'Северный клюквенный морс',
    description:
      'Насыщенный домашний морс из спелой северной клюквы с лёгкой кислинкой, подаётся охлаждённым.',
    weight: '0.5 л',
    price: 180,
    image: '/src/assets/images/hero_morse_1795544758226.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'drink-lingonberry-morse',
    categoryId: 'drinks',
    name: 'Брусничный домашний морс',
    description:
      'Ароматный ягодный морс из дикой брусники, сваренный по домашнему рецепту с минимальным добавлением сахара.',
    weight: '0.5 л',
    price: 190,
    image: '/src/assets/images/hero_morse_1795544758226.jpg',
  },
  {
    id: 'drink-morse-1l',
    categoryId: 'drinks',
    name: 'Большая бутылка ягодного морса',
    description:
      'Семейная бутылка охлаждённого клюквенного или брусничного морса из северных ягод.',
    weight: '1.0 л',
    price: 320,
    image: '/src/assets/images/hero_morse_1795544758226.jpg',
  },

  // 11. Молочные коктейли
  {
    id: 'milkshake-vanilla',
    categoryId: 'milkshakes',
    name: 'Ванильный молочный коктейль',
    description:
      'Густой сливочный коктейль на основе натурального пломбира, молока и мадагаскарской ванили со взбитыми сливками.',
    weight: '400 мл',
    price: 270,
    image: '/src/assets/images/dish_milkshake_1795544757645.jpg',
    tag: 'Классика',
  },
  {
    id: 'milkshake-chocolate',
    categoryId: 'milkshakes',
    name: 'Шоколадный молочный коктейль',
    description:
      'Насыщенный коктейль из шоколадного мороженого, охлаждённого молока, тёмного какао и шоколадной стружки.',
    weight: '400 мл',
    price: 290,
    image: '/src/assets/images/dish_milkshake_1795544757645.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'milkshake-berry',
    categoryId: 'milkshakes',
    name: 'Ягодный молочный коктейль',
    description:
      'Нежный молочный коктейль со сливочным пломбиром и пюре из спелой малины и лесной черники.',
    weight: '400 мл',
    price: 300,
    image: '/src/assets/images/dish_milkshake_1795544757645.jpg',
  },

  // 12. Мороженое (10 вкусов)
  {
    id: 'icecream-vanilla',
    categoryId: 'icecream',
    name: 'Сливочный пломбир с ванилью',
    description:
      'Классические шарики нежного натурального пломбира из фермерских сливок с мадагаскарской ванилью.',
    weight: '150 г',
    price: 210,
    image: '/src/assets/images/dish_icecream_1795544758619.jpg',
  },
  {
    id: 'icecream-chocolate',
    categoryId: 'icecream',
    name: 'Бельгийское шоколадное мороженое',
    description:
      'Бархатное мороженое на тёмном бельгийском шоколаде с шоколадной крошкой и сливочным послевкусием.',
    weight: '150 г',
    price: 230,
    image: '/src/assets/images/dish_icecream_1795544758619.jpg',
  },
  {
    id: 'icecream-strawberry',
    categoryId: 'icecream',
    name: 'Клубничное со сливками',
    description:
      'Сливочное мороженое с протёртой спелой клубникой и кусочками свежих ягод.',
    weight: '150 г',
    price: 230,
    image: '/src/assets/images/icecream_strawberry_berry_1795545054759.jpg',
    tag: 'Хит',
  },
  {
    id: 'icecream-blueberry',
    categoryId: 'icecream',
    name: 'Северная черника и йогурт',
    description:
      'Освежающее ягодное мороженое с дикой черникой и нежным греческим йогуртом.',
    weight: '150 г',
    price: 240,
    image: '/src/assets/images/icecream_strawberry_berry_1795545054759.jpg',
  },
  {
    id: 'icecream-pistachio',
    categoryId: 'icecream',
    name: 'Фисташковое с дроблёным орехом',
    description:
      'Кремовое мороженое из жареной сицилийской фисташки с посыпкой из хрустящих орехов.',
    weight: '150 г',
    price: 260,
    image: '/src/assets/images/icecream_pistachio_caramel_1795545053880.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'icecream-salted-caramel',
    categoryId: 'icecream',
    name: 'Солёная карамель с пеканом',
    description:
      'Сливочное мороженое с тягучей солёной карамелью и обжаренным орехом пекан.',
    weight: '150 г',
    price: 260,
    image: '/src/assets/images/icecream_pistachio_caramel_1795545053880.jpg',
  },
  {
    id: 'icecream-mango',
    categoryId: 'icecream',
    name: 'Сорбет «Манго-Маракуйя»',
    description:
      'Яркий тропический фруктовый сорбет с натуральной мякотью манго и лёгкой кислинкой маракуйи.',
    weight: '150 г',
    price: 240,
    image: '/src/assets/images/icecream_mango_chocolate_1795545055229.jpg',
  },
  {
    id: 'icecream-mint-choc',
    categoryId: 'icecream',
    name: 'Мятное с шоколадной крошкой',
    description:
      'Освежающий сливочно-мятный вкус со стружкой тёмного шоколада и листиком свежей мяты.',
    weight: '150 г',
    price: 240,
    image: '/src/assets/images/icecream_mango_chocolate_1795545055229.jpg',
  },
  {
    id: 'icecream-creme-brulee',
    categoryId: 'icecream',
    name: 'Крем-брюле с карамелью',
    description:
      'Нежное карамельно-сливочное мороженое с тонким вкусом классического французского десерта.',
    weight: '150 г',
    price: 220,
    image: '/src/assets/images/icecream_pistachio_caramel_1795545053880.jpg',
  },
  {
    id: 'icecream-trio-berries',
    categoryId: 'icecream',
    name: 'Трио мороженого XXL с ягодами',
    description:
      'Большой десерт из трёх шариков: ванильный пломбир, бельгийский шоколад и ягодный сорбет со свежими ягодами.',
    weight: '240 г',
    price: 340,
    image: '/src/assets/images/dish_icecream_1795544758619.jpg',
    tag: 'Десерт дня',
  },

  // 13. Десерты (маффины, чизкейки порционные, вафельные корзинки с ягодами)
  {
    id: 'dessert-muffin-chocolate',
    categoryId: 'desserts',
    name: 'Шоколадный маффин с кусочками шоколада',
    description:
      'Пышный домашний маффин на тёмном какао с тающими кусочками бельгийского шоколада внутри.',
    weight: '115 г',
    price: 180,
    image: '/src/assets/images/dessert_cheesecake_muffin_1795550589087.jpg',
  },
  {
    id: 'dessert-muffin-berry',
    categoryId: 'desserts',
    name: 'Ванильный маффин с ягодами',
    description:
      'Нежный бисквитный маффин с сочной малиной и черникой, слегка присыпанный сахарной пудрой.',
    weight: '115 г',
    price: 180,
    image: '/src/assets/images/dessert_cheesecake_muffin_1795550589087.jpg',
  },
  {
    id: 'dessert-cheesecake-ny',
    categoryId: 'desserts',
    name: 'Чизкейк «Нью-Йорк» порционный',
    description:
      'Классический сливочный чизкейк из творожного сыра на рассыпчатом песочном корже со свежей ягодой.',
    weight: '130 г',
    price: 270,
    image: '/src/assets/images/dessert_cheesecake_muffin_1795550589087.jpg',
    tag: 'Хит продаж',
  },
  {
    id: 'dessert-cheesecake-berry',
    categoryId: 'desserts',
    name: 'Чизкейк ягодный порционный',
    description:
      'Нежный порционный чизкейк с ягодным конфитюром из малины и голубики на хрустящей основе.',
    weight: '135 г',
    price: 290,
    image: '/src/assets/images/dessert_cheesecake_muffin_1795550589087.jpg',
  },
  {
    id: 'dessert-waffle-basket',
    categoryId: 'desserts',
    name: 'Корзинка (вафля с ягодами)',
    description:
      'Хрустящая золотистая вафельная корзинка, наполненная нежным сливочным кремом, свежей малиной, черникой и клубникой.',
    weight: '140 г',
    price: 250,
    image: '/src/assets/images/dessert_waffle_basket_1795550592057.jpg',
    tag: 'Выбор шефа',
  },
];
