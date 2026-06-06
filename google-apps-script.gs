/**
 * RawasiShop — حفظ الطلبات + تنبيه تيليغرام تلقائي
 * لا حاجة لـ Make.
 *
 * النشر (مرة واحدة):
 * 1) افتح الجدول → Extensions → Apps Script
 * 2) الصق هذا الكود → حفظ
 * 3) Deploy → Manage deployments → Edit → New version → Deploy
 */

var SHEET_NAME = 'Feuille 1';
var TAAGER_PRODUCT_ID = '18267';
var TAAGER_SKU = 'SA04050100IPLMWD00';
var TAAGER_PRODUCT_URL = 'https://taager.com/sa/products/18267';

// بوت تيليغرام — RawasiShop Orders
var TELEGRAM_BOT_TOKEN = '8837133403:AAGlevfjW1Xka3B8fb8HQYMd4cqqT2myjjQ';
var TELEGRAM_CHAT_ID = '6242287291';

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var alertText = buildAlertText_(d);
    appendOrderRow_(d);
    sendTelegram_(alertText);
    return jsonOut_({ result: 'success' });
  } catch (err) {
    return jsonOut_({ result: 'error', error: String(err) });
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.test === 'telegram') {
    var ok = sendTelegram_('✅ RawasiShop: التنبيهات تعمل. كل طلب جديد سيصلك هنا.');
    return ContentService.createTextOutput(ok ? 'تم الإرسال ✅' : 'فشل الإرسال ❌');
  }
  return ContentService.createTextOutput('RawasiShop webhook يعمل ✅');
}

function appendOrderRow_(d) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0];

  var qty = d.qtyUnits || d.qty || 1;
  var total = d.totalNum || d.sellPrice || d.total || '';

  sheet.appendRow([
    new Date(),
    d.source || 'rawasishop',
    'KSA',
    d.name || '',
    "'" + (d.phone || ''),
    d.product || 'جهاز IPL',
    d.productSku || TAAGER_SKU,
    qty,
    total,
    'SAR'
  ]);
}

function buildAlertText_(d) {
  var sku = d.productSku || TAAGER_SKU;
  var tid = d.taagerId || TAAGER_PRODUCT_ID;
  var total = d.total || d.totalNum || d.sellPrice || '';
  return (
    '📦 طلب جديد — RawasiShop\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '👤 ' + (d.name || '') + '\n' +
    '📞 ' + (d.phone || '') + '\n' +
    '🏙️ ' + (d.city || '') + '\n' +
    '📍 ' + (d.address || '') + '\n' +
    '🔢 ' + (d.qty || qtyLabel_(d)) + '\n' +
    '💰 ' + total + ' ر.س\n' +
    '🆔 ' + sku + '\n' +
    '🔢 رقم المنتج #' + tid
  );
}

function qtyLabel_(d) {
  var n = d.qtyUnits || 1;
  return n + ' قطعة';
}

function sendTelegram_(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
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
    return res.getResponseCode() === 200;
  } catch (err) {
    return false;
  }
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
