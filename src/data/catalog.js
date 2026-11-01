// Yeni foto-kataloq. Qiyməti olan məhsul səbətə düşür; price: null olanlar WhatsApp ilə sifariş olunur.
// supabase/01_catalog.sql işlədildikdən sonra eyni şəkilli baza sətirləri bu siyahını avtomatik əvəz edir.
export const localCatalog = [
  {
    "id": "aliza-tund-cehrayi-kol-qizilgul-buketi-kraft-kagizda",
    "name": {
      "az": "Tünd Çəhrayı Kol Qızılgül Buketi",
      "en": "Deep Pink Spray Rose Bouquet",
      "ru": "Букет тёмно-розовых кустовых роз"
    },
    "desc": {
      "az": "Kraft kağızda, çəhrayı lentli sıx kol qızılgül buketi.",
      "en": "A dense spray rose bouquet in kraft paper with a pink ribbon.",
      "ru": "Пышный букет кустовых роз в крафте с розовой лентой."
    },
    "price": null,
    "oldPrice": null,
    "category": "roses",
    "color": "pink",
    "img": "/assets/products/tund-cehrayi-kol-qizilgul-buketi-kraft-kagizda.webp",
    "featured": false,
    "active": true,
    "order": 1
  },
  {
    "id": "aliza-boyuk-cehrayi-ag-qizilgul-buketi",
    "name": {
      "az": "Böyük Çəhrayı-Ağ Qızılgül Buketi",
      "en": "Grand Pink & White Rose Bouquet",
      "ru": "Большой бело-розовый букет роз"
    },
    "desc": {
      "az": "Çəhrayının müxtəlif tonlarında və ağ qızılgüllərdən hazırlanmış həcmli buket.",
      "en": "A generous bouquet of white roses and shades of pink.",
      "ru": "Объёмный букет из белых роз и роз разных оттенков розового."
    },
    "price": null,
    "oldPrice": null,
    "category": "roses",
    "color": "pink",
    "img": "/assets/products/boyuk-cehrayi-ag-qizilgul-buketi.webp",
    "featured": true,
    "active": true,
    "order": 2
  },
  {
    "id": "aliza-ag-qizilgul-evkalipt-buketi",
    "name": {
      "az": "Ağ Qızılgül və Evkalipt Buketi",
      "en": "White Rose & Eucalyptus Bouquet",
      "ru": "Букет белых роз с эвкалиптом"
    },
    "desc": {
      "az": "Şəffaf bükülüdə, evkalipt yarpaqları ilə zərif ağ qızılgüllər.",
      "en": "Elegant white roses with eucalyptus in sheer wrapping.",
      "ru": "Нежные белые розы с эвкалиптом в прозрачной упаковке."
    },
    "price": null,
    "oldPrice": null,
    "category": "roses",
    "color": "white",
    "img": "/assets/products/ag-qizilgul-evkalipt-buketi.webp",
    "featured": false,
    "active": true,
    "order": 3
  },
  {
    "id": "aliza-cehrayi-gul-hasir-sebet-kompozisiyasi",
    "name": {
      "az": "Çəhrayı Hörmə Səbət Kompozisiyası",
      "en": "Pink Woven Basket Arrangement",
      "ru": "Композиция в розовой плетёной корзине"
    },
    "desc": {
      "az": "Çəhrayı hörmə səbətdə, lentlərlə tamamlanmış çəhrayı gül kompozisiyası.",
      "en": "Pink blooms in a pink woven basket, finished with ribbons.",
      "ru": "Розовые цветы в розовой плетёной корзине с лентами."
    },
    "price": null,
    "oldPrice": null,
    "category": "baskets",
    "color": "pink",
    "img": "/assets/products/cehrayi-gul-hasir-sebet-kompozisiyasi.webp",
    "featured": false,
    "active": true,
    "order": 4
  },
  {
    "id": "aliza-neheng-cehrayi-ag-hortenziya-buketi",
    "name": {
      "az": "Nəhəng Çəhrayı-Ağ Hortenziya Buketi",
      "en": "Grand Pink & White Hydrangea Bouquet",
      "ru": "Огромный букет гортензий"
    },
    "desc": {
      "az": "Çəhrayı və ağ hortenziyaların əsas olduğu, lentlə bəzədilmiş nəhəng buket.",
      "en": "An oversized bouquet led by pink and white hydrangeas, trimmed with ribbon.",
      "ru": "Огромный букет с розовыми и белыми гортензиями, украшенный лентой."
    },
    "price": null,
    "oldPrice": null,
    "category": "exclusive",
    "color": "pink",
    "img": "/assets/products/neheng-cehrayi-ag-hortenziya-buketi.webp",
    "featured": false,
    "active": true,
    "order": 5
  },
  {
    "id": "aliza-ag-kol-qizilgul-boyuk-buket",
    "name": {
      "az": "Böyük Ağ Kol Qızılgül Buketi",
      "en": "Grand White Spray Rose Bouquet",
      "ru": "Большой букет белых кустовых роз"
    },
    "desc": {
      "az": "Yalnız ağ kol qızılgüllərdən yığılmış, kürə formalı böyük buket.",
      "en": "A large, globe-shaped bouquet made entirely of white spray roses.",
      "ru": "Большой шарообразный букет только из белых кустовых роз."
    },
    "price": null,
    "oldPrice": null,
    "category": "roses",
    "color": "white",
    "img": "/assets/products/ag-kol-qizilgul-boyuk-buket.webp",
    "featured": true,
    "active": true,
    "order": 6
  },
  {
    "id": "aliza-narinci-zanbaq-qizilgul-qarisiq-buket",
    "name": {
      "az": "Narıncı Zanbaqlı Qarışıq Buket",
      "en": "Orange Lily Mixed Bouquet",
      "ru": "Смешанный букет с оранжевыми лилиями"
    },
    "desc": {
      "az": "Narıncı zanbaq və qızılgüllərin bənövşəyi çiçəklərlə canlı birləşməsi.",
      "en": "Orange lilies and roses in a vivid mix with purple blooms.",
      "ru": "Оранжевые лилии и розы в яркой комбинации с фиолетовыми цветами."
    },
    "price": null,
    "oldPrice": null,
    "category": "bouquets",
    "color": "orange",
    "img": "/assets/products/narinci-zanbaq-qizilgul-qarisiq-buket.webp",
    "featured": false,
    "active": true,
    "order": 7
  },
  {
    "id": "aliza-cehrayi-kol-qizilgul-buketi",
    "name": {
      "az": "Çəhrayı Kol Qızılgül Buketi",
      "en": "Pink Spray Rose Bouquet",
      "ru": "Букет розовых кустовых роз"
    },
    "desc": {
      "az": "Çəhrayı bükülüdə, eyni rəngli lentlə kol qızılgül buketi.",
      "en": "Spray roses in pink wrapping with a matching ribbon.",
      "ru": "Кустовые розы в розовой упаковке с лентой в тон."
    },
    "price": null,
    "oldPrice": null,
    "category": "roses",
    "color": "pink",
    "img": "/assets/products/cehrayi-kol-qizilgul-buketi.webp",
    "featured": false,
    "active": true,
    "order": 8
  },
  {
    "id": "aliza-benovseyi-qablasdirmada-qarisiq-qizilgul-buketi",
    "name": {
      "az": "Bənövşəyi Qablaşdırmada Qarışıq Buket",
      "en": "Mixed Bouquet in Violet Wrap",
      "ru": "Смешанный букет в фиолетовой упаковке"
    },
    "desc": {
      "az": "Şaftalı rəngli qızılgüllər və gipsofila ilə çoxqatlı bənövşəyi bükülüdə buket.",
      "en": "Peach roses and gypsophila in layered violet wrapping.",
      "ru": "Персиковые розы и гипсофила в многослойной фиолетовой упаковке."
    },
    "price": null,
    "oldPrice": null,
    "category": "bouquets",
    "color": "purple",
    "img": "/assets/products/benovseyi-qablasdirmada-qarisiq-qizilgul-buketi.webp",
    "featured": true,
    "active": true,
    "order": 9
  },
  {
    "id": "aliza-gunebaxan-ag-qirmizi-qarisiq-buket",
    "name": {
      "az": "Günəbaxanlı Qarışıq Buket",
      "en": "Sunflower Mixed Bouquet",
      "ru": "Смешанный букет с подсолнухами"
    },
    "desc": {
      "az": "Günəbaxanların ağ və qırmızı çiçəklərlə canlı birləşməsi.",
      "en": "Sunflowers paired with white and red blooms.",
      "ru": "Подсолнухи в сочетании с белыми и красными цветами."
    },
    "price": null,
    "oldPrice": null,
    "category": "bouquets",
    "color": "yellow",
    "img": "/assets/products/gunebaxan-ag-qirmizi-qarisiq-buket.webp",
    "featured": false,
    "active": true,
    "order": 10
  },
  {
    "id": "aliza-gunebaxan-buketi-qezet-qablasdirma",
    "name": {
      "az": "Qəzet Bükülüdə Günəbaxan Buketi",
      "en": "Sunflower Bouquet in Newsprint",
      "ru": "Букет подсолнухов в газетной упаковке"
    },
    "desc": {
      "az": "Qəzet naxışlı kağızda, sadə və günəşli günəbaxan buketi.",
      "en": "A simple, sunny sunflower bouquet in newsprint-style paper.",
      "ru": "Простой солнечный букет подсолнухов в бумаге с газетным принтом."
    },
    "price": null,
    "oldPrice": null,
    "category": "bouquets",
    "color": "yellow",
    "img": "/assets/products/gunebaxan-buketi-qezet-qablasdirma.webp",
    "featured": false,
    "active": true,
    "order": 11
  },
  {
    "id": "aliza-urek-formali-ag-cehrayi-gul-kompozisiyasi",
    "name": {
      "az": "Ürək Formalı Gül Kompozisiyası",
      "en": "Heart-Shaped Flower Arrangement",
      "ru": "Композиция в форме сердца"
    },
    "desc": {
      "az": "Ağ və çəhrayı çiçəklərdən ürək formasında hazırlanmış xüsusi kompozisiya.",
      "en": "A special heart-shaped arrangement in white and pink blooms.",
      "ru": "Особая композиция в форме сердца из белых и розовых цветов."
    },
    "price": null,
    "oldPrice": null,
    "category": "exclusive",
    "color": "white",
    "img": "/assets/products/urek-formali-ag-cehrayi-gul-kompozisiyasi.webp",
    "featured": false,
    "active": true,
    "order": 12
  },
  {
    "id": "aliza-yasil-hortenziya-cehrayi-qizilgul-eksklyuziv-buket",
    "name": {
      "az": "Yaşıl Hortenziya və Çəhrayı Qızılgül Buketi",
      "en": "Green Hydrangea & Pink Rose Bouquet",
      "ru": "Букет зелёных гортензий и розовых роз"
    },
    "desc": {
      "az": "Yaşıl hortenziyalar üzərində çəhrayı qızılgüllər olan nəhəng eksklyuziv buket.",
      "en": "An oversized bouquet of pink roses set over green hydrangeas.",
      "ru": "Огромный букет: розовые розы на фоне зелёных гортензий."
    },
    "price": null,
    "oldPrice": null,
    "category": "exclusive",
    "color": "pink",
    "img": "/assets/products/yasil-hortenziya-cehrayi-qizilgul-eksklyuziv-buket.webp",
    "featured": true,
    "active": true,
    "order": 13
  },
  {
    "id": "aliza-kalla-buketleri-leopard-qablasdirma",
    "name": {
      "az": "Leopard Bükülüdə Kalla Buketləri",
      "en": "Calla Lily Bouquets in Leopard Wrap",
      "ru": "Букеты калл в леопардовой упаковке"
    },
    "desc": {
      "az": "Sarı, çəhrayı və tünd kallalardan leopard naxışlı bükülüdə buketlər.",
      "en": "Yellow, pink and dark calla lilies in leopard-print wrapping.",
      "ru": "Жёлтые, розовые и тёмные каллы в леопардовой упаковке."
    },
    "price": null,
    "oldPrice": null,
    "category": "exclusive",
    "color": "all",
    "img": "/assets/products/kalla-buketleri-leopard-qablasdirma.webp",
    "featured": false,
    "active": true,
    "order": 14
  },
  {
    "id": "aliza-cehrayi-hortenziya-qizilgul-buketi",
    "name": {
      "az": "Çəhrayı Hortenziya və Qızılgül Buketi",
      "en": "Pink Hydrangea & Rose Bouquet",
      "ru": "Букет розовых гортензий и роз"
    },
    "desc": {
      "az": "Çəhrayı hortenziya və qızılgüllərdən yumşaq tonlu həcmli buket.",
      "en": "A soft, voluminous bouquet of pink hydrangeas and roses.",
      "ru": "Нежный объёмный букет из розовых гортензий и роз."
    },
    "price": null,
    "oldPrice": null,
    "category": "bouquets",
    "color": "pink",
    "img": "/assets/products/cehrayi-hortenziya-qizilgul-buketi.webp",
    "featured": false,
    "active": true,
    "order": 15
  },
  {
    "id": "aliza-ayicikli-qarisiq-gul-sebeti",
    "name": {
      "az": "Ayıcıqlı Hörmə Gül Səbəti",
      "en": "Woven Flower Basket with Teddy Bear",
      "ru": "Цветочная корзина с плюшевым мишкой"
    },
    "desc": {
      "az": "Böyük boz ayıcıq və qarışıq güllərlə dolu hörmə səbət.",
      "en": "A woven basket of mixed flowers with a large grey teddy bear.",
      "ru": "Плетёная корзина со смешанными цветами и большим серым мишкой."
    },
    "price": null,
    "oldPrice": null,
    "category": "baskets",
    "color": "all",
    "img": "/assets/products/ayicikli-qarisiq-gul-sebeti.webp",
    "featured": true,
    "active": true,
    "order": 16
  },
  {
    "id": "aliza-boyuk-qirmizi-qizilgul-evkalipt-buketi",
    "name": {
      "az": "Böyük Qırmızı Qızılgül Buketi",
      "en": "Grand Red Rose Bouquet",
      "ru": "Большой букет красных роз"
    },
    "desc": {
      "az": "Ağ bükülüdə, evkalipt ilə tamamlanmış böyük qırmızı qızılgül buketi.",
      "en": "A large red rose bouquet with eucalyptus in white wrapping.",
      "ru": "Большой букет красных роз с эвкалиптом в белой упаковке."
    },
    "price": null,
    "oldPrice": null,
    "category": "roses",
    "color": "red",
    "img": "/assets/products/boyuk-qirmizi-qizilgul-evkalipt-buketi.webp",
    "featured": true,
    "active": true,
    "order": 17
  },
  {
    "id": "aliza-qirmizi-qizilgul-evkalipt-qara-qutuda",
    "name": {
      "az": "Qara Qutuda Qırmızı Qızılgüllər",
      "en": "Red Roses in a Black Box",
      "ru": "Красные розы в чёрной коробке"
    },
    "desc": {
      "az": "Qara dairəvi qutuda evkaliptlə qırmızı qızılgül kompozisiyası.",
      "en": "Red roses and eucalyptus arranged in a round black box.",
      "ru": "Красные розы с эвкалиптом в круглой чёрной коробке."
    },
    "price": null,
    "oldPrice": null,
    "category": "boxes",
    "color": "red",
    "img": "/assets/products/qirmizi-qizilgul-evkalipt-qara-qutuda.webp",
    "featured": false,
    "active": true,
    "order": 18
  },
  {
    "id": "aliza-qirmizi-qutuda-qirmizi-gul-kompozisiyasi",
    "name": {
      "az": "Qırmızı Qutuda Qırmızı Kompozisiya",
      "en": "All-Red Box Arrangement",
      "ru": "Красная композиция в красной коробке"
    },
    "desc": {
      "az": "Uzun lentləri olan qırmızı dairəvi qutuda tamamilə qırmızı kompozisiya.",
      "en": "An entirely red arrangement in a round red box with long ribbons.",
      "ru": "Полностью красная композиция в круглой красной коробке с длинными лентами."
    },
    "price": null,
    "oldPrice": null,
    "category": "boxes",
    "color": "red",
    "img": "/assets/products/qirmizi-qutuda-qirmizi-gul-kompozisiyasi.webp",
    "featured": true,
    "active": true,
    "order": 19
  },
  {
    "id": "aliza-sari-mavi-gul-mirvari-sebet-kompozisiyasi",
    "name": {
      "az": "Mirvari Bəzəkli Sarı-Mavi Səbət",
      "en": "Yellow & Blue Pearl-Trim Basket",
      "ru": "Жёлто-голубая корзина с жемчугом"
    },
    "desc": {
      "az": "Mirvari sapları ilə bəzədilmiş səbətdə sarı və mavi çiçəklər.",
      "en": "Yellow and blue blooms in a basket draped with pearl strands.",
      "ru": "Жёлтые и голубые цветы в корзине, украшенной нитями жемчуга."
    },
    "price": null,
    "oldPrice": null,
    "category": "baskets",
    "color": "yellow",
    "img": "/assets/products/sari-mavi-gul-mirvari-sebet-kompozisiyasi.webp",
    "featured": false,
    "active": true,
    "order": 20
  },
  {
    "id": "aliza-ag-anturium-mirvari-eksklyuziv-kompozisiya",
    "name": {
      "az": "Ağ Anturium və Mirvari Kompozisiyası",
      "en": "White Anthurium & Pearl Arrangement",
      "ru": "Композиция с белым антуриумом и жемчугом"
    },
    "desc": {
      "az": "Ağ çiçəklər, anturium və mirvari sapları ilə heykəlvari eksklyuziv kompozisiya.",
      "en": "A sculptural arrangement of white blooms, anthurium and pearl strands.",
      "ru": "Скульптурная композиция из белых цветов, антуриума и нитей жемчуга."
    },
    "price": null,
    "oldPrice": null,
    "category": "exclusive",
    "color": "white",
    "img": "/assets/products/ag-anturium-mirvari-eksklyuziv-kompozisiya.webp",
    "featured": true,
    "active": true,
    "order": 21
  },
  {
    "id": "aliza-pastel-cehrayi-hasir-sebet-kompozisiyasi",
    "name": {
      "az": "Pastel Çəhrayı Hörmə Səbət",
      "en": "Pastel Pink Woven Basket",
      "ru": "Пастельная розовая плетёная корзина"
    },
    "desc": {
      "az": "Ağ hörmə səbətdə pastel çəhrayı güllər və evkalipt.",
      "en": "Pastel pink blooms and eucalyptus in a white woven basket.",
      "ru": "Пастельно-розовые цветы и эвкалипт в белой плетёной корзине."
    },
    "price": null,
    "oldPrice": null,
    "category": "baskets",
    "color": "pink",
    "img": "/assets/products/pastel-cehrayi-hasir-sebet-kompozisiyasi.webp",
    "featured": false,
    "active": true,
    "order": 22
  },
  {
    "id": "aliza-balqabaqda-gunebaxan-payiz-kompozisiyasi",
    "name": {
      "az": "Balqabaqda Payız Kompozisiyası",
      "en": "Autumn Arrangement in a Pumpkin",
      "ru": "Осенняя композиция в тыкве"
    },
    "desc": {
      "az": "Balqabağın içində günəbaxan və payız tonlu çiçəklərdən kompozisiya.",
      "en": "Sunflowers and autumn-toned blooms arranged inside a pumpkin.",
      "ru": "Подсолнухи и цветы осенних оттенков в тыкве."
    },
    "price": null,
    "oldPrice": null,
    "category": "exclusive",
    "color": "orange",
    "img": "/assets/products/balqabaqda-gunebaxan-payiz-kompozisiyasi.webp",
    "featured": false,
    "active": true,
    "order": 23
  },
  {
    "id": "aliza-payiz-tonlu-pudra-qizilgul-boyuk-buket",
    "name": {
      "az": "Payız Tonlu Pudra Qızılgül Buketi",
      "en": "Autumn-Toned Powder Rose Bouquet",
      "ru": "Осенний букет с пудровыми розами"
    },
    "desc": {
      "az": "Pudra rəngli qızılgüllər və narıncı payız budaqları ilə böyük buket.",
      "en": "A large bouquet of powder-toned roses with orange autumn branches.",
      "ru": "Большой букет пудровых роз с оранжевыми осенними ветками."
    },
    "price": null,
    "oldPrice": null,
    "category": "exclusive",
    "color": "orange",
    "img": "/assets/products/payiz-tonlu-pudra-qizilgul-boyuk-buket.webp",
    "featured": false,
    "active": true,
    "order": 24
  },
  {
    "id": "aliza-krem-saftali-qizilgul-buketi",
    "name": {
      "az": "Krem-Şaftalı Qızılgül Buketi",
      "en": "Cream & Peach Rose Bouquet",
      "ru": "Кремово-персиковый букет роз"
    },
    "desc": {
      "az": "Şəffaf bükülüdə krem və şaftalı tonlu qızılgüllər.",
      "en": "Cream and peach-toned roses in sheer wrapping.",
      "ru": "Кремовые и персиковые розы в прозрачной упаковке."
    },
    "price": null,
    "oldPrice": null,
    "category": "bouquets",
    "color": "orange",
    "img": "/assets/products/krem-saftali-qizilgul-buketi.webp",
    "featured": false,
    "active": true,
    "order": 25
  },
  {
    "id": "aliza-narinci-terrakota-payiz-buketi",
    "name": {
      "az": "Terrakota Payız Buketi",
      "en": "Terracotta Autumn Bouquet",
      "ru": "Терракотовый осенний букет"
    },
    "desc": {
      "az": "Narıncı və terrakota tonlarında çiçəklər və payız yarpaqları ilə buket.",
      "en": "Orange and terracotta blooms with autumn leaves.",
      "ru": "Цветы оранжевых и терракотовых оттенков с осенней листвой."
    },
    "price": null,
    "oldPrice": null,
    "category": "bouquets",
    "color": "orange",
    "img": "/assets/products/narinci-terrakota-payiz-buketi.webp",
    "featured": false,
    "active": true,
    "order": 26
  },
  {
    "id": "aliza-hundur-payiz-hortenziya-anturium-kompozisiyasi",
    "name": {
      "az": "Hündür Payız Kompozisiyası",
      "en": "Tall Autumn Arrangement",
      "ru": "Высокая осенняя композиция"
    },
    "desc": {
      "az": "Yaşıl hortenziya, anturium və payız budaqları ilə hündür kompozisiya.",
      "en": "A tall arrangement of green hydrangeas, anthurium and autumn branches.",
      "ru": "Высокая композиция с зелёными гортензиями, антуриумом и осенними ветками."
    },
    "price": null,
    "oldPrice": null,
    "category": "exclusive",
    "color": "orange",
    "img": "/assets/products/hundur-payiz-hortenziya-anturium-kompozisiyasi.webp",
    "featured": false,
    "active": true,
    "order": 27
  },
  {
    "id": "aliza-balqabaq-narinci-gul-payiz-kompozisiyasi",
    "name": {
      "az": "Narıncı Balqabaq Kompozisiyası",
      "en": "Orange Pumpkin Arrangement",
      "ru": "Оранжевая композиция в тыкве"
    },
    "desc": {
      "az": "Balqabaq üzərində narıncı və tünd çəhrayı çiçəklərlə payız kompozisiyası.",
      "en": "An autumn arrangement of orange and deep pink blooms in a pumpkin.",
      "ru": "Осенняя композиция в тыкве с оранжевыми и тёмно-розовыми цветами."
    },
    "price": null,
    "oldPrice": null,
    "category": "exclusive",
    "color": "orange",
    "img": "/assets/products/balqabaq-narinci-gul-payiz-kompozisiyasi.webp",
    "featured": false,
    "active": true,
    "order": 28
  },
  {
    "id": "aliza-benovseyi-xrizantema-buketi",
    "name": {
      "az": "Bənövşəyi Xrizantema Buketi",
      "en": "Purple Chrysanthemum Bouquet",
      "ru": "Букет фиолетовых хризантем"
    },
    "desc": {
      "az": "Yasəmən rəngli bükülüdə, bənövşəyi tonlarda xrizantemalar.",
      "en": "Purple-toned chrysanthemums in lilac wrapping.",
      "ru": "Хризантемы фиолетовых оттенков в сиреневой упаковке."
    },
    "price": null,
    "oldPrice": null,
    "category": "bouquets",
    "color": "purple",
    "img": "/assets/products/benovseyi-xrizantema-buketi.webp",
    "featured": false,
    "active": true,
    "order": 29
  },
  {
    "id": "aliza-qara-qablasdirmada-qirmizi-qizilgul-buketi",
    "name": {
      "az": "Qara Bükülüdə Qırmızı Qızılgüllər",
      "en": "Red Roses in Black Wrap",
      "ru": "Красные розы в чёрной упаковке"
    },
    "desc": {
      "az": "Qara bükülüdə, qırmızı lentli klassik qırmızı qızılgül buketi.",
      "en": "A classic red rose bouquet in black wrapping with a red ribbon.",
      "ru": "Классический букет красных роз в чёрной упаковке с красной лентой."
    },
    "price": null,
    "oldPrice": null,
    "category": "roses",
    "color": "red",
    "img": "/assets/products/qara-qablasdirmada-qirmizi-qizilgul-buketi.webp",
    "featured": false,
    "active": true,
    "order": 30
  },
  {
    "id": "aliza-cehrayi-marcan-gul-buketi",
    "name": {
      "az": "Mərcan Çəhrayı Qarışıq Buket",
      "en": "Coral & Pink Mixed Bouquet",
      "ru": "Коралловый смешанный букет"
    },
    "desc": {
      "az": "Ağ bükülüdə mərcan və çəhrayı tonlarda qarışıq çiçəklər.",
      "en": "Coral and pink mixed blooms in white wrapping.",
      "ru": "Смешанные цветы кораллового и розового оттенков в белой упаковке."
    },
    "price": null,
    "oldPrice": null,
    "category": "bouquets",
    "color": "pink",
    "img": "/assets/products/cehrayi-marcan-gul-buketi.webp",
    "featured": true,
    "active": true,
    "order": 31
  },
  {
    "id": "aliza-ag-qutuda-rengareng-qarisiq-gul-kompozisiyasi",
    "name": {
      "az": "Ağ Qutuda Rəngarəng Kompozisiya",
      "en": "Colourful Arrangement in a White Box",
      "ru": "Яркая композиция в белой коробке"
    },
    "desc": {
      "az": "Bənövşəyi lentli ağ dairəvi qutuda rəngarəng qarışıq çiçəklər.",
      "en": "Colourful mixed blooms in a round white box with a purple ribbon.",
      "ru": "Яркие смешанные цветы в круглой белой коробке с фиолетовой лентой."
    },
    "price": null,
    "oldPrice": null,
    "category": "boxes",
    "color": "purple",
    "img": "/assets/products/ag-qutuda-rengareng-qarisiq-gul-kompozisiyasi.webp",
    "featured": false,
    "active": true,
    "order": 32
  }
];

// Bazada kateqoriyası boş qalan köhnə məhsullar üçün (şəkil adına görə)
export const legacyCategoryByImage = {
  product_red_roses_51: 'roses',
  product_red_roses_11: 'roses',
  product_pastel_basket: 'baskets',
  product_mixed_bouquet: 'bouquets',
  product_pink_box: 'boxes',
  sarigul: 'bouquets',
  hesbs: 'bouquets',
};
