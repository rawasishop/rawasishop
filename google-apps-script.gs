/**
 * RawasiShop — استقبال الطلبات وحفظها في Google Sheets
 * انسخي هذا الكود كاملاً والصقيه في محرّر Apps Script ثم انشريه كـ Web App.
 *
 * طريقة الربط (الأسهل):
 * 1) أنشئي جدول Google Sheets جديد (أو ارفعي rawasi.xlsx وافتحيه كـ Google Sheets).
 * 2) من داخل الجدول: Extensions → Apps Script.
 * 3) امسحي أي كود موجود والصقي هذا الكود كاملاً، ثم احفظي (Ctrl+S).
 * 4) اضغطي Deploy → New deployment → النوع: Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    ثم Deploy وامنحي الأذونات.
 * 5) انسخي رابط الـ Web app المنتهي بـ /exec وأرسليه للمساعد لوضعه في الموقع.
 */

var SHEET_NAME = 'الطلبات';

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['التاريخ', 'الاسم', 'الهاتف', 'المدينة', 'العنوان', 'الكمية', 'المجموع', 'كوبون', 'المنتج', 'SKU', 'تاجر ID', 'سعر الوحدة', 'المصدر', 'الحالة']);
    }
    var d = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),
      d.name || '',
      "'" + (d.phone || ''),
      d.city || '',
      d.address || '',
      d.qty || '',
      d.total || '',
      d.coupon || '',
      d.product || 'جهاز IPL',
      d.productSku || '',
      d.taagerId || '',
      d.unitPrice || '',
      d.source || '',
      'جديد — أدخل في تاجر'
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('RawasiShop webhook يعمل ✅');
}
