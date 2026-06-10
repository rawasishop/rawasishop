/* =========================================================
   RawasiShop × Taager — إعدادات التسويق (السعودية)
   المسوق: المغرب · التوصيل: السعودية · الدفع: COD
   ========================================================= */
window.RAWASI_TAAGER = {
  platform: 'taager',
  productId: '18267',
  productSku: 'SA04050100IPLMWD00',
  productName: 'جهاز IPL أخضر بتقنية التبريد الثلجي الذكي + هدية مجانية',
  country: 'SA',
  currency: 'SAR',
  wholesale: 170,
  minSell: 200,
  bundles: {
    1: { title: 'قطعة واحدة', price: 395, units: 1 },
    2: { title: 'قطعتان', price: 690, units: 2 },
    3: { title: '3 قطع', price: 950, units: 3 }
  },
  sellerWhatsapp: '212633405061',
  sheetWebhook: 'https://script.google.com/macros/s/AKfycbz9p4LkSD7_7IvkiI5S5ilDwx7uhHqo5ByyULoAgNf44mOZ4_xVyVhqq84jaBoBEmQ/exec',
  /** false = الطلب يصلك عبر تيليغرام + Google Sheets فقط (بلا فتح واتساب للزبونة) */
  openWhatsAppOnOrder: false,
  orderNotify: 'telegram',
  fbPixelId: '1007677050990489',
  compareAt: 790,

  normalizeSaPhone: function (phone) {
    var d = String(phone || '').replace(/\D/g, '');
    if (d.indexOf('966') === 0) d = '0' + d.slice(3);
    if (d.length === 9 && d.charAt(0) === '5') d = '0' + d;
    return d;
  },

  isValidSaPhone: function (phone) {
    return /^05\d{8}$/.test(this.normalizeSaPhone(phone));
  },

  profitEstimate: function (sellPrice) {
    return Math.max(0, sellPrice - this.wholesale);
  },

  /* رسالة داخلية للمسوق — لا تُعرض للزبونة (تُستخدم في الجدول/تيليغرام) */
  /* رسالة داخلية للمسوق فقط — لا تظهر للزبونة */
  buildSellerWhatsApp: function (order) {
    var unitPrice = order.unitPrice || order.sellPrice || order.totalNum || 0;
    var msg =
      '📦 *طلب جديد — RawasiShop*\n' +
      '━━━━━━━━━━━━━━━━\n' +
      '🆔 SKU: ' + this.productSku + '\n' +
      '🔢 رقم المنتج: #' + this.productId + '\n' +
      '🧴 ' + this.productName + '\n' +
      '👤 الاسم: ' + order.name + '\n' +
      '📞 الهاتف: ' + this.normalizeSaPhone(order.phone) + '\n' +
      '🏙️ المدينة: ' + order.city + '\n' +
      '📍 العنوان: ' + order.address + '\n' +
      '🔢 الكمية: ' + (order.qtyUnits || 1) + '\n' +
      '💰 سعر البيع: ' + unitPrice + ' ر.س\n' +
      '💵 إجمالي الطلب: ' + (order.total || '') + '\n' +
      '🌍 السعودية · الدفع عند الاستلام';
    if (order.coupon) msg += '\n🎁 كوبون: ' + order.coupon;
    if (order.source) msg += '\n📄 المصدر: ' + order.source;
    return msg;
  },

  isMobileDevice: function () {
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  buildCustomerWhatsApp: function (order) {
    var total = order.total || order.totalNum || '';
    return (
      'السلام عليكم 🌸\n' +
      'أود تأكيد طلبي من رواسي شوب:\n\n' +
      '👤 الاسم: ' + order.name + '\n' +
      '📞 الجوال: ' + this.normalizeSaPhone(order.phone) + '\n' +
      '🏙️ المدينة: ' + order.city + '\n' +
      '📍 العنوان: ' + order.address + '\n' +
      '🧴 المنتج: ' + (order.product || this.productName) + '\n' +
      '🔢 الكمية: ' + (order.qty || order.qtyUnits || 1) + '\n' +
      '💰 المجموع: ' + total + ' ر.س\n' +
      '💵 الدفع عند الاستلام\n\n' +
      'شكراً لكم 💜'
    );
  },

  openWhatsApp: function (order) {
    var msg = this.buildCustomerWhatsApp(order);
    var phone = this.sellerWhatsapp;
    var text = encodeURIComponent(msg);
    if (this.isMobileDevice()) {
      window.location.href = 'https://api.whatsapp.com/send?phone=' + phone + '&text=' + text;
    } else {
      window.open('https://wa.me/' + phone + '?text=' + text, '_blank');
    }
  },

  sendOrder: function (order) {
    var url = this.sheetWebhook;
    if (!url) return false;
    var payload = JSON.stringify(order);
    var sent = false;
    try {
      if (navigator.sendBeacon) {
        sent = navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
      }
    } catch (e) {}
    if (!sent) {
      try {
        fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });
      } catch (e) {}
    }
    return true;
  },

  notifyAfterOrder: function (order) {
    this.sendOrder(order);
    if (this.openWhatsAppOnOrder) this.openWhatsApp(order);
  }
};
