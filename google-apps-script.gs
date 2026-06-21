/**
 * RawasiShop — حفظ الطلبات + تنبيه تيليغرام
 * الصق في Apps Script المربوط بجدول Google Sheets
 *
 * مهم: نفّذ مرة واحدة authorizeAll() من المحرر ووافق على الأذونات
 * ثم: Déployer → Nouvelle version → Accès: Tout le monde
 */

var SHEET_NAME = 'Feuille 1';
var TAAGER_PRODUCT_ID = '18267';
var TAAGER_SKU = 'SA04050100IPLMWD00';
var TELEGRAM_BOT_TOKEN = '8837133403:AAGlevfjW1Xka3B8fb8HQYMd4cqqT2myjjQ';
var TELEGRAM_CHAT_ID = '6242287291';

function doPost(e) {
  var d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ result: 'error', step: 'parse', error: String(err) });
  }

  var sheetOk = false;
  var telegramOk = false;

  try {
    appendOrderRow_(d);
    sheetOk = true;
  } catch (err) {
    return jsonOut_({ result: 'error', step: 'sheet', error: String(err) });
  }

  try {
    telegramOk = sendTelegram_(buildAlertText_(d));
  } catch (err) {
    telegramOk = false;
  }

  return jsonOut_({ result: 'success', sheet: sheetOk, telegram: telegramOk });
}

function doGet(e) {
  if (e && e.parameter && e.parameter.test === 'telegram') {
    var result = sendTelegramResult_('✅ RawasiShop: التنبيهات تعمل.');
    if (result.ok) return textOut_('تم الإرسال ✅ — راجع تيليغرام');
    return textOut_(
      'فشل تيليغرام ❌\n' +
      'السبب: ' + result.hint + '\n' +
      '1) افتح @rawasishop_orders_bot واضغط Start\n' +
      '2) Apps Script → اختر authorizeAll → Run → وافق على الأذونات\n' +
      '3) Déployer → Nouvelle version'
    );
  }
  if (e && e.parameter && e.parameter.test === 'order') {
    var sample = {
      name: 'تجربة',
      phone: '0512345678',
      city: 'الرياض',
      address: 'حي النخيل',
      qty: 'قطعة واحدة',
      qtyUnits: 1,
      totalNum: 395,
      product: 'جهاز IPL',
      productSku: TAAGER_SKU,
      taagerId: TAAGER_PRODUCT_ID,
      source: 'test'
    };
    try {
      appendOrderRow_(sample);
      var tg = sendTelegram_(buildAlertText_(sample));
      return textOut_('صف في الجدول ✅ · تيليغرام: ' + (tg ? '✅' : '❌'));
    } catch (err) {
      return textOut_('خطأ: ' + String(err));
    }
  }
  return textOut_('RawasiShop webhook يعمل ✅');
}

/** شغّل هذه الدالة مرة واحدة من المحرر (Run) ووافق على كل الأذونات */
function authorizeAll() {
  var ss = getSpreadsheet_();
  Logger.log('جدول: ' + ss.getName());
  appendOrderRow_({
    name: 'اختبار يدوي',
    phone: '0512345678',
    city: 'الرياض',
    address: 'اختبار',
    qtyUnits: 1,
    totalNum: 395,
    product: 'جهاز IPL',
    productSku: TAAGER_SKU,
    taagerId: TAAGER_PRODUCT_ID,
    source: 'authorizeAll'
  });
  sendTelegram_('✅ RawasiShop: الأذونات جاهزة.');
}

function getSpreadsheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('افتح السكربت من داخل الجدول: Extensions → Apps Script');
  return ss;
}

function appendOrderRow_(d) {
  var sheet = getSpreadsheet_().getSheetByName(SHEET_NAME);
  if (!sheet) sheet = getSpreadsheet_().getSheets()[0];

  var qty = d.qtyUnits || d.qty || 1;
  var total = d.totalNum || d.sellPrice || d.total || '';

  sheet.appendRow([
    new Date(),
    d.source || 'rawasishop',
    adSourceLabel_(d),
    'KSA',
    d.name || '',
    "'" + (d.phone || ''),
    d.city || '',
    d.address || '',
    d.product || 'جهاز IPL',
    d.productSku || TAAGER_SKU,
    qty,
    total,
    'SAR',
    d.payment || 'cod',
    d.utm_campaign || ''
  ]);
}

function buildAlertText_(d) {
  var sku = d.productSku || TAAGER_SKU;
  var tid = d.taagerId || TAAGER_PRODUCT_ID;
  var total = d.total || d.totalNum || d.sellPrice || '';
  var payment = d.payment === 'cod' ? 'الدفع عند الاستلام' : (d.payment || 'الدفع عند الاستلام');
  return (
    '📦 طلب جديد — RawasiShop\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '🧴 ' + (d.product || '') + '\n' +
    '👤 ' + (d.name || '') + '\n' +
    '📞 ' + (d.phone || '') + '\n' +
    '🏙️ ' + (d.city || '') + '\n' +
    '📍 ' + (d.address || '') + '\n' +
    '🔢 ' + (d.qty || qtyLabel_(d)) + '\n' +
    '💰 ' + total + ' ر.س\n' +
    '💳 ' + payment + '\n' +
    '🆔 SKU: ' + sku + '\n' +
    '🔢 المنتج: ' + (d.taagerId || tid) + '\n' +
    '📣 مصدر الإعلان: ' + adSourceLabel_(d) + '\n' +
    (d.utm_campaign ? '🎯 الحملة: ' + d.utm_campaign + '\n' : '') +
    '🏪 المورد: ' + supplierLabel_(d) + '\n' +
    (d.supplierUrl ? '🔗 ' + d.supplierUrl + '\n' : '') +
    '🌍 السعودية'
  );
}

function adSourceLabel_(d) {
  if (d.adSourceLabel) return d.adSourceLabel;
  var map = {
    facebook: 'فيسبوك / إنستغرام',
    tiktok: 'تيك توك',
    snapchat: 'سناب شات',
    google: 'جوجل',
    direct: 'مباشر',
    referral: 'رابط خارجي'
  };
  var key = String(d.adSource || '').toLowerCase();
  return map[key] || d.adSource || 'غير معروف';
}

function supplierLabel_(d) {
  var p = String(d.platform || '').toLowerCase();
  if (p === 'ksadrop') return 'KSA Drop';
  return d.platform || 'taager';
}

function qtyLabel_(d) {
  return (d.qtyUnits || 1) + ' قطعة';
}

function sendTelegram_(text) {
  return sendTelegramResult_(text).ok;
}

function sendTelegramResult_(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { ok: false, hint: 'Token أو Chat ID ناقص' };
  }
  try {
    var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
    var res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text
      }),
      muteHttpExceptions: true
    });
    var code = res.getResponseCode();
    if (code === 200) return { ok: true, hint: '' };
    var body = res.getContentText();
    var hint = 'HTTP ' + code;
    if (code === 403) hint = 'ما بديتيش محادثة مع البوت — افتح @rawasishop_orders_bot واضغط Start';
    else if (code === 401) hint = 'Token البوت غلط';
    else if (code === 400) hint = 'Chat ID غلط — راجع TELEGRAM_CHAT_ID';
    else if (body) hint += ' — ' + body;
    return { ok: false, hint: hint };
  } catch (err) {
    return { ok: false, hint: 'ما عندكش أذونات UrlFetch — شغّل authorizeAll من المحرر: ' + String(err) };
  }
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function textOut_(msg) {
  return ContentService.createTextOutput(msg);
}
