/* eslint-disable no-unused-vars */
window.RAWASI_CONFIG = {
  siteUrl: 'https://rawasishop.com',
  brand: 'رواسي',
  tagline: 'صيدلية الجمال الداخلي — للتجاعيد، الهالات، وجفاف البشرة',
  orderIdPrefix: 'nama',
  country: 'KSA',
  currency: 'SAR',
  whatsapp: '212633405061',
  GOOGLE_SHEET_ID: '1mFLx9XEPJjSVxCo41c929jtqwpluV9TADqFRLlnc7Lw',
  WEBHOOK_URL:
    'https://script.google.com/macros/s/AKfycbwiNflCm3Jj_5PmHeA4as3ACx2vsv3vJWOoCjS_aYRzqSjKGDvmlMBhekfAe6Zg/exec',

  products: {
    electrolytes: {
      id: 'electrolytes',
      sku: 'RW-EL-001',
      nameAr: 'رواسي هيدرا — أكياس الإلكتروليت وإرهاق الحر',
      shortAr: 'رواسي هيدرا',
      ingredients: 'Sodium + Potassium + Magnesium + Zinc + Vitamin C',
      format: 'أكياس مشروب',
      price: 199,
      oldPrice: 269,
      image: 'images/product-electrolytes.jpg',
      heroImage: 'images/hero-electrolytes.jpg',
      upsellId: 'pollution-shield',
      problemTitle: 'هل تعانين من إرهاق الحر والعطش؟',
      problems: [
        'دوخة أو تعب بعد الشمس أو العمل في الخارج',
        'عطش مستمر رغم شرب الماء',
        'إرهاق في الصيام أو بعد الرياضة'
      ],
      bundles: [
        { qty: 1, price: 199, label: 'علبة واحدة (30 يوم)', badge: '' },
        { qty: 2, price: 349, label: 'علبتان', badge: 'وفر 49 ر.س' },
        { qty: 3, price: 479, label: 'ثلاث علب', badge: 'الأكثر توفيراً' }
      ]
    },
    'pollution-shield': {
      id: 'pollution-shield',
      sku: 'RW-SH-002',
      nameAr: 'رواسي شيلد — جامي دفاع البشرة من الغبار والشمس',
      shortAr: 'رواسي شيلد',
      ingredients: 'Astaxanthin + Olive Leaf + Rosemary + Vitamin E',
      format: 'جامي يومي',
      price: 239,
      oldPrice: 309,
      image: 'images/product-pollution.jpg',
      upsellId: 'hair-scalp',
      problemTitle: 'هل بشرتك باهتة من الغبار والشمس؟',
      problems: [
        'بشرة باهتة في الصور والمرآة',
        'تأثير التكييف والغبار على الوجه',
        'تبحثين عن حماية داخلية وليست كريم فقط'
      ],
      bundles: [
        { qty: 1, price: 239, label: 'علبة واحدة (30 يوم)', badge: '' },
        { qty: 2, price: 429, label: 'علبتان', badge: 'وفر 49 ر.س' },
        { qty: 3, price: 579, label: 'ثلاث علب', badge: 'الأكثر توفيراً' }
      ]
    },
    'hair-scalp': {
      id: 'hair-scalp',
      sku: 'RW-HR-003',
      nameAr: 'رواسي فيبر — جامي الشعر والفروة',
      shortAr: 'رواسي فيبر',
      ingredients: 'Marine Collagen + Keratin + Biotin + Zinc + Silica',
      format: 'جامي يومي',
      price: 219,
      oldPrice: 289,
      image: 'images/product-hair-scalp.jpg',
      upsellId: null,
      problemTitle: 'هل شعرك ضعف من الجفاف والغبار؟',
      problems: [
        'تقصف وشعر خفيف بعد المكيف',
        'فروة جافة من الغبار والحر',
        'زيوت خارجية لا تعطي نتيجة كافية'
      ],
      bundles: [
        { qty: 1, price: 219, label: 'علبة واحدة (30 يوم)', badge: '' },
        { qty: 2, price: 399, label: 'علبتان', badge: 'وفر 39 ر.س' },
        { qty: 3, price: 549, label: 'ثلاث علب', badge: 'الأكثر توفيراً' }
      ]
    }
  },

  upsellOffers: {
    'pollution-shield': { label: 'أضف رواسي شيلد بخصم 35 ر.س', discount: 35 },
    'hair-scalp': { label: 'أضف رواسي فيبر بخصم 40 ر.س', discount: 40 }
  },

  trust: [
    'شحن سريع داخل السعودية',
    'دفع عند الاستلام',
    'تأكيد هاتفي قبل الشحن',
    'مكوّنات موضّحة بشفافية'
  ],

  faq: [
    {
      q: 'هل الدفع عند الاستلام متاح؟',
      a: 'نعم، تدفعين نقداً عند استلام الطرد في جميع مدن المملكة.'
    },
    {
      q: 'متى يصل الطلب؟',
      a: 'عادة 2–5 أيام عمل بعد تأكيد الطلب هاتفياً.'
    },
    {
      q: 'هل المنتجات أدوية؟',
      a: 'لا، مكملات غذائية. استشيري طبيبكِ عند الحمل أو الرضاعة.'
    },
    {
      q: 'لماذا تأكيد هاتفي؟',
      a: 'للتأكد من العنوان ورفع نسبة التسليم — أسلوب COD المعتاد في السعودية.'
    }
  ]
};
