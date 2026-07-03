/**
 * RawasiShop — مراقبة صفحة مبرد الأطفال + webhook قبل/أثناء حملة فيسبوك
 */
const PAGE = 'https://www.rawasishop.com/p/baby/';
const WEBHOOK =
  'https://script.google.com/macros/s/AKfycbwbAiejjtqfwj0HqzGtMEwQEo7yG7lxl9skMjIlSnz6hFdlhYCZ1ZUNQ3VTQFtZgLc/exec';
const CACHE_TAG = '20260703babyfix';

const now = new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' });

async function checkPage() {
  const [res, cssRes] = await Promise.all([
    fetch(PAGE, { redirect: 'follow' }),
    fetch(PAGE.replace(/\/$/, '/') + 'baby.css?v=' + CACHE_TAG, { redirect: 'follow' }).catch(() => null),
  ]);
  const html = await res.text();
  const css = cssRes && cssRes.ok ? await cssRes.text() : '';
  const checks = {
    status: res.status,
    orderForm: html.includes('id="orderForm"'),
    orderSubmit: html.includes('id="orderSubmit"'),
    cache: html.includes(CACHE_TAG),
    config: html.includes('ksadrop-baby-config'),
    pixel: html.includes('facebook-pixel'),
    exclusiveOffer: html.includes('عرض حصري'),
    heroMother: html.includes('black-hijab'),
    noBrokenStickySubmit: !html.includes('type="submit" form="orderForm"'),
    stickyScrollOnly: html.includes('href="#order"') && html.includes('stickyScrollBtn'),
    mobileStickyHidden: css.includes('.sticky-cta') && css.includes('display: none !important'),
  };
  const ok =
    res.status === 200 &&
    checks.orderForm &&
    checks.orderSubmit &&
    checks.cache &&
    checks.config &&
    checks.noBrokenStickySubmit &&
    checks.stickyScrollOnly &&
    checks.mobileStickyHidden;
  return { ok, checks };
}

async function checkWebhook() {
  const res = await fetch(WEBHOOK, { redirect: 'follow' });
  const text = await res.text();
  return { ok: res.status === 200 && text.includes('webhook'), snippet: text.slice(0, 80) };
}

async function testOrderPing() {
  if (!process.argv.includes('--ping')) {
    return { ok: true, skipped: true };
  }
  const payload = {
    name: 'اختبار مراقبة RawasiShop',
    phone: '0500000000',
    city: 'منطقة الرياض',
    address: 'اختبار تلقائي — تجاهل',
    qty: 'قطعة واحدة',
    qtyUnits: 1,
    total: '99 ريال',
    totalNum: 99,
    unitPrice: 99,
    sellPrice: 99,
    product: 'مبرد أظافر الأطفال الكهربائي الآمن',
    productSku: 'KSA-075',
    taagerId: 'baby-nail-clippers',
    country: 'SA',
    platform: 'ksadrop',
    source: 'rawasishop-baby',
    adSource: 'monitor',
    adSourceLabel: 'مراقبة تلقائية',
    transaction_id: 'MONITOR-' + Date.now(),
    date: new Date().toISOString(),
    test: true,
  };
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  return { ok: res.status === 200, status: res.status, body: text.slice(0, 120) };
}

try {
  const [page, webhook, ping] = await Promise.all([checkPage(), checkWebhook(), testOrderPing()]);
  const allOk = page.ok && webhook.ok && ping.ok;
  console.log(
    JSON.stringify(
      {
        time: now,
        product: 'baby-nail-trimmer',
        pageUrl: PAGE,
        status: allOk ? 'OK' : 'ALERT',
        page,
        webhook,
        orderPing: ping,
        note: allOk
          ? 'جاهز لحملة فيسبوك — راقب Telegram'
          : 'مشكلة تقنية — أصلح قبل زيادة الميزانية',
      },
      null,
      2
    )
  );
  process.exit(allOk ? 0 : 1);
} catch (err) {
  console.log(JSON.stringify({ time: now, status: 'ERROR', error: err.message }, null, 2));
  process.exit(1);
}
