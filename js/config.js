/* eslint-disable no-unused-vars */
window.RAWASI_CONFIG = {
  brand: 'رواسي',
  orderIdPrefix: 'rawasi',
  country: 'KSA',
  currency: 'SAR',
  /* واتساب المغرب: 00212633405061 → 212633405061 */
  whatsapp: '212633405061',
  /* جدول الطلبات: https://docs.google.com/spreadsheets/d/1fK5x1DqQYpijlbmGPWqhlw6S7xUb-Drojwue3dfigFE/edit */
  GOOGLE_SHEET_ID: '1fK5x1DqQYpijlbmGPWqhlw6S7xUb-Drojwue3dfigFE',
  WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbyrfes6PlsGclbOvj0MVFITDhYX3zT4bA-lkS7KGs3_oQGUP3bAiMwgHFI7HvC5X61y/exec',

  products: {
    electrolytes: {
      id: 'electrolytes',
      sku: 'RW-EL-001',
      nameAr: 'رواسي هيدرا — أكياس الإلكتروليت وإرهاق الحر',
      shortAr: 'أكياس الإلكتروليت',
      ingredients: 'Sodium + Potassium + Magnesium + Zinc + Vitamin C',
      format: 'أكياس مشروب',
      price: 199,
      oldPrice: 269,
      image: 'images/product-electrolytes.jpg',
      upsellId: 'pollution-shield'
    },
    'pollution-shield': {
      id: 'pollution-shield',
      sku: 'RW-SH-002',
      nameAr: 'رواسي شيلد — جامي دفاع البشرة من الغبار والشمس',
      shortAr: 'جامي دفاع البشرة',
      ingredients: 'Astaxanthin + Olive Leaf + Rosemary Extract + Vitamin E',
      format: 'جامي يومي',
      price: 239,
      oldPrice: 309,
      image: 'images/product-pollution.jpg',
      upsellId: 'hair-scalp'
    },
    'hair-scalp': {
      id: 'hair-scalp',
      sku: 'RW-HR-003',
      nameAr: 'رواسي فيبر — جامي الشعر والفروة في الجفاف والغبار',
      shortAr: 'جامي الشعر والفروة',
      ingredients: 'Marine Collagen + Keratin + Biotin + Zinc + Silica',
      format: 'جامي يومي',
      price: 219,
      oldPrice: 289,
      image: 'images/product-hair-scalp.jpg',
      upsellId: null
    }
  },

  upsellOffers: {
    'pollution-shield': { label: 'أضف جامي دفاع البشرة بخصم 35 ر.س', discount: 35 },
    'hair-scalp': { label: 'أضف جامي الشعر والفروة بخصم 40 ر.س', discount: 40 }
  }
};
