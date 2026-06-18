/* =========================================================
   RawasiShop × KSA Drop — مبرد أظافر كهربائي للأطفال
   المورد: https://ksadrop.com/products/baby-nail-clippers
   ========================================================= */
window.RAWASI_TAAGER = {
  platform: 'ksadrop',
  productId: 'baby-nail-clippers',
  productSku: 'KSA-075',
  productName: 'مبرد أظافر الأطفال الكهربائي الآمن',
  supplierUrl: 'https://ksadrop.com/products/baby-nail-clippers',
  pageSource: 'rawasishop-baby',
  country: 'SA',
  currency: 'SAR',
  wholesale: 48,
  minSell: 79,
  bundles: {
    1: { title: 'قطعة واحدة', price: 99, units: 1 },
    2: { title: 'قطعتان', price: 179, units: 2 }
  },
  sellerWhatsapp: '212633405061',
  sheetWebhook: 'https://script.google.com/macros/s/AKfycbwbAiejjtqfwj0HqzGtMEwQEo7yG7lxl9skMjIlSnz6hFdlhYCZ1ZUNQ3VTQFtZgLc/exec',
  openWhatsAppOnOrder: false,
  orderNotify: 'telegram',
  fbPixelId: '1007677050990489',
  snapPixelId: '0ae4a60f-bad3-4443-9ce3-7a9aa9be9f73',
  compareAt: 199,

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

  buildSellerWhatsApp: function (order) {
    var unitPrice = order.unitPrice || order.sellPrice || order.totalNum || 0;
    var msg =
      '📦 *طلب جديد — RawasiShop*\n' +
      '━━━━━━━━━━━━━━━━\n' +
      '🏪 المورد: KSA Drop\n' +
      '🔗 ' + this.supplierUrl + '\n' +
      '🆔 SKU: ' + this.productSku + '\n' +
      '🔢 المنتج: ' + this.productId + '\n' +
      '🧴 ' + this.productName + '\n' +
      '👤 الاسم: ' + order.name + '\n' +
      '📞 الهاتف: ' + this.normalizeSaPhone(order.phone) + '\n' +
      '🏛️ المحافظة: ' + order.city + '\n' +
      '📍 العنوان: ' + order.address + '\n' +
      '🔢 الكمية: ' + (order.qtyUnits || 1) + '\n' +
      '💰 سعر البيع: ' + unitPrice + ' ر.س\n' +
      '💵 إجمالي الطلب: ' + (order.total || '') + '\n' +
      '🌍 السعودية · الدفع عند الاستلام';
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
      '🏛️ المحافظة: ' + order.city + '\n' +
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
    var blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
    var sent = false;
    try {
      if (navigator.sendBeacon) sent = navigator.sendBeacon(url, blob);
    } catch (e) {}
    try {
      fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payload,
        keepalive: true
      });
      sent = true;
    } catch (e) {}
    return sent;
  },

  notifyAfterOrder: function (order) {
    this.sendOrder(order);
    if (this.openWhatsAppOnOrder) this.openWhatsApp(order);
  }
};
