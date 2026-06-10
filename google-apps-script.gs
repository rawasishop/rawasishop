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
    var ok = sendTelegram_('✅ RawasiShop: التنبيهات تعمل.');
    return textOut_(ok ? 'تم الإرسال ✅' : 'فشل تيليغرام ❌ — نفّذ authorizeAll من المحرر');
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
    d.payment || 'cod'
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
    '👤 ' + (d.name || '') + '\n' +
    '📞 ' + (d.phone || '') + '\n' +
    '🏙️ ' + (d.city || '') + '\n' +
    '📍 ' + (d.address || '') + '\n' +
    '🔢 ' + (d.qty || qtyLabel_(d)) + '\n' +
    '💰 ' + total + ' ر.س\n' +
    '💳 ' + payment + '\n' +
    '🆔 SKU: ' + sku + '\n' +
    '🔢 رقم المنتج #' + tid + '\n' +
    '🌍 السعودية'
  );
}

function qtyLabel_(d) {
  return (d.qtyUnits || 1) + ' قطعة';
}

function sendTelegram_(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
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
  return res.getResponseCode() === 200;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function textOut_(msg) {
  return ContentService.createTextOutput(msg);
}
