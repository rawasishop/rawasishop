/**
 * Google Apps Script — Webhook لطلبات رواسي
 *
 * الجدول: https://docs.google.com/spreadsheets/d/1fK5x1DqQYpijlbmGPWqhlw6S7xUb-Drojwue3dfigFE/edit
 *
 * الإعداد (مرة واحدة):
 * 1. افتح الجدول → Extensions → Apps Script
 * 2. احذف الكود الافتراضي والصق هذا الملف بالكامل → Save
 * 3. شغّل الدالة setupHeaders مرة واحدة (Run) ووافق على الصلاحيات
 * 4. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. انسخ رابط ينتهي بـ /exec (ليس /dev) → ضعه في js/config.js → WEBHOOK_URL
 */

var SHEET_ID = '1fK5x1DqQYpijlbmGPWqhlw6S7xUb-Drojwue3dfigFE';

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
  return SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
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

function doPost(e) {
  try {
    var sheet = getOrdersSheet();
    var data = JSON.parse(e.postData.contents);

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
