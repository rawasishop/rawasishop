/**
 * Google Apps Script — Webhook لطلبات رواسي
 *
 * الجدول (افتحه ثم Extensions → Apps Script من نفس الملف):
 * https://docs.google.com/spreadsheets/d/1mFLx9XEPJjSVxCo41c929jtqwpluV9TADqFRLlnc7Lw/edit
 *
 * مهم: أنشئ السكربت من داخل هذا الجدول حتى تُكتب الطلبات فيه مباشرة.
 *
 * 1. الصق هذا الملف → Save
 * 2. شغّل setupHeaders مرة واحدة (Run)
 * 3. Deploy → Manage deployments → Edit → New version → Deploy
 *    (أو New deployment) — Who has access: Anyone
 * 4. انسخ URL /exec → js/config.js → WEBHOOK_URL
 */

var SHEET_ID = '1mFLx9XEPJjSVxCo41c929jtqwpluV9TADqFRLlnc7Lw';

var HEADERS = [
  'date',
  'orderid',
  'country',
  'name',
  'phone',
  'product',
  'sku',
  'quantity',
  'total price',
  'currency',
  'status'
];

function getOrdersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    ss = SpreadsheetApp.openById(SHEET_ID);
  }
  return ss.getSheets()[0];
}

/** شغّلها مرة من محرر Apps Script لإنشاء صف العناوين */
function setupHeaders() {
  var sheet = getOrdersSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }
  var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var empty = firstRow.every(function (cell) { return !cell; });
  if (empty) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function parseRequestBody(e) {
  if (!e) return '';

  // حقول النموذج (application/x-www-form-urlencoded)
  if (e.parameter && e.parameter.payload) {
    return String(e.parameter.payload);
  }

  if (!e.postData || !e.postData.contents) {
    return '';
  }

  var contents = String(e.postData.contents).trim();

  // المتصفح يرسل أحياناً: payload=%7B...%7D
  if (contents.indexOf('payload=') === 0) {
    return decodeURIComponent(contents.replace(/^payload=/, '').replace(/\+/g, ' '));
  }

  return contents;
}

function parseOrderJson(e) {
  var raw = parseRequestBody(e);
  if (!raw) {
    throw new Error('Empty body');
  }
  return JSON.parse(raw);
}

/** يدعم total price / totalPrice / total_price (لا نستخدم || لأن 0 قيمة صالحة) */
function pickField(data, keys) {
  if (!data) return '';
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      var val = data[key];
      if (val !== undefined && val !== null && val !== '') {
        return val;
      }
    }
  }
  return '';
}

function pickTotalPrice(data) {
  var v = pickField(data, ['total price', 'totalPrice', 'total_price', 'total']);
  if (v === '') return '';
  var n = Number(v);
  return isNaN(n) ? v : n;
}

function doPost(e) {
  try {
    var sheet = getOrdersSheet();
    var data = parseOrderJson(e);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    sheet.appendRow([
      pickField(data, ['date']) || '',
      pickField(data, ['orderid', 'orderId']) || '',
      pickField(data, ['country']) || 'KSA',
      pickField(data, ['name']) || '',
      pickField(data, ['phone']) || '',
      pickField(data, ['product']) || '',
      pickField(data, ['sku']) || '',
      pickField(data, ['quantity']) || '',
      pickTotalPrice(data),
      pickField(data, ['currency']) || 'SAR',
      pickField(data, ['status']) || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Rawasi webhook OK');
}

/** اختبار من محرر Apps Script: Run → تحقق من صف جديد في الجدول */
function testAppendRow() {
  doPost({
    postData: {
      contents: JSON.stringify({
        date: '04/06/2026',
        orderid: 'nama12345',
        country: 'KSA',
        name: 'اختبار من Apps Script',
        phone: '96650475233',
        product: 'رواسي هيدرا — أكياس الإلكتروليت وإرهاق الحر',
        sku: 'NMA482910',
        quantity: '1',
        'total price': 199,
        totalPrice: 199,
        currency: 'SAR'
      })
    }
  });
}
