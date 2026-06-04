# ربط طلبات رواسي بـ Google Sheets

## جدولك الحالي (الذي تفتحه)
https://docs.google.com/spreadsheets/d/1mFLx9XEPJjSVxCo41c929jtqwpluV9TADqFRLlnc7Lw/edit

معرّف الجدول: `1mFLx9XEPJjSVxCo41c929jtqwpluV9TADqFRLlnc7Lw`

> إذا كان الجدول فارغاً والطلبات لا تظهر: السكربت كان يكتب في **جدول قديم**. يجب لصق الكود الجديد وإعادة النشر.

## الأعمدة (الصف 1)

| date | orderid | country | name | phone | product | sku | quantity | total price | currency | status |

## الإعداد (من نفس الجدول)

1. افتح الرابط أعلاه.
2. **Extensions** → **Apps Script** (من هذا الملف، ليس مشروعاً منفصلاً).
3. الصق **`google-apps-script-webhook.js`** من المشروع → **Save**.
4. اختر **`setupHeaders`** → **Run** → اسمح بالصلاحيات → يجب أن يظهر صف العناوين في الجدول.
5. **Deploy** → **Manage deployments** → **Edit** (قلم) → **New version** → **Deploy**  
   أو **New deployment** → Web app → **Anyone**.
6. انسخ **URL de l'application Web** (زر Copier) → `js/config.js` → `WEBHOOK_URL`.

الرابط العامل (الإصدار 2):

```
https://script.google.com/macros/s/AKfycbxgfnUDUdH4jZVUdgKIM5-t23MtbPVdTK8A399aeoZVWVoyw7AkpQSLY_TjCiVzE-I/exec
```

## اختبار

1. افتح رابط `/exec` → **`Rawasi webhook OK`**
2. `git push` لتحديث الموقع إن غيّرت `config.js`
3. طلب تجريبي من rawasishop.com → صف جديد في **نفس** الجدول

## لماذا لا يظهر شيء؟

| السبب | الحل |
|--------|-----|
| جدول مختلف عن السكربت | لصق السكربت من **Extensions** داخل جدولك الحالي |
| لم تُنشر نسخة جديدة بعد تغيير الكود | Deploy → New version |
| الموقع لم يُحدَّث | `git push` بعد تغيير `WEBHOOK_URL` |
| صلاحيات السكربت | أول Run لـ `setupHeaders` ووافق على الوصول للجدول |
