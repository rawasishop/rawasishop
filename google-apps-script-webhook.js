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
  if (e && e.postData && e.postData.contents) {
    return e.postData.contents;
  }
  if (e && e.parameter && e.parameter.payload) {
    return e.parameter.payload;
  }
  return '';
}

function doPost(e) {
  try {
    var sheet = getOrdersSheet();
    var raw = parseRequestBody(e);
    if (!raw) {
      throw new Error('Empty body');
    }
    var data = JSON.parse(raw);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    sheet.appendRow([
      data.date || '',
      data.orderid || '',
      data.country || 'KSA',
      data.name || '',
      data.phone || '',
      data.product || '',
      data.sku || '',
      data.quantity || '',
      data['total price'] || data.totalPrice || '',
      data.currency || 'SAR',
      data.status || ''
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
        orderid: 'rawasi-TEST-SCRIPT',
        country: 'KSA',
        name: 'اختبار من Apps Script',
        phone: '966500000000',
        product: 'رواسي هيدرا',
        sku: 'RW-EL-001',
        quantity: '1',
        'total price': 199,
        currency: 'SAR',
        status: 'test'
      })
    }
  });
}
