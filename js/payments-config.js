/* توافق مع checkout.js — يعتمد على إعدادات تاجر */
window.RAWASI_PAYMENTS = (function () {
  var T = window.RAWASI_TAAGER || {};
  return {
    currency: 'SAR',
    country: 'SA',
    codFee: 0,
    taager: {
      productId: T.productId,
      productSku: T.productSku,
      productName: T.productName,
      wholesale: T.wholesale,
      minSell: T.minSell
    },
    store: {
      whatsapp: T.sellerWhatsapp || '212633405061',
      sheetWebhook: T.sheetWebhook || '',
      fbPixelId: T.fbPixelId || ''
    }
  };
})();
