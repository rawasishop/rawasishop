/**
 * RawasiShop — مراقبة حملة baby كل 15 دقيقة (سجل + تنبيه)
 * Usage: node scripts/watch-baby-campaign.mjs
 */
import { appendFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const PAGE = 'https://www.rawasishop.com/p/baby/';
const WEBHOOK =
  'https://script.google.com/macros/s/AKfycbwbAiejjtqfwj0HqzGtMEwQEo7yG7lxl9skMjIlSnz6hFdlhYCZ1ZUNQ3VTQFtZgLc/exec';
const LOG_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'logs');
const LOG_FILE = join(LOG_DIR, 'baby-campaign-watch.log');

mkdirSync(LOG_DIR, { recursive: true });

const now = new Date().toLocaleString('ar-SA', { timeZone: 'Africa/Casablanca' });

async function checkPage() {
  const bust = Date.now();
  const [htmlRes, cssRes] = await Promise.all([
    fetch(`${PAGE}?t=${bust}`, { redirect: 'follow', headers: { 'Cache-Control': 'no-cache' } }),
    fetch(`${PAGE}baby.css?v=20260705hero&t=${bust}`, { redirect: 'follow' }),
  ]);
  const html = await htmlRes.text();
  const css = cssRes.ok ? await cssRes.text() : '';
  const checks = {
    status: htmlRes.status,
    orderForm: html.includes('id="orderForm"'),
    orderSubmit: html.includes('id="orderSubmit"'),
    mainJs: html.includes('main.js?v=20260705watch'),
    mobileStickyHidden: css.includes('display: none !important'),
  };
  const ok =
    htmlRes.status === 200 &&
    checks.orderForm &&
    checks.orderSubmit &&
    checks.mainJs &&
    checks.mobileStickyHidden;
  return { ok, checks };
}

async function checkWebhook() {
  const res = await fetch(WEBHOOK, { redirect: 'follow' });
  const text = await res.text();
  return { ok: res.status === 200 && text.includes('webhook'), snippet: text.slice(0, 60) };
}

const [page, webhook] = await Promise.all([checkPage(), checkWebhook()]);
const allOk = page.ok && webhook.ok;

const report = {
  time: now,
  status: allOk ? 'OK' : 'ALERT',
  page,
  webhook,
  action: allOk
    ? 'الموقع والويبهوك يعملان — راقب Telegram'
    : '⚠️ مشكلة تقنية — أوقفي الحملة مؤقتاً حتى الإصلاح',
};

const line = JSON.stringify(report);
appendFileSync(LOG_FILE, line + '\n', 'utf8');
console.log(line);
process.exit(allOk ? 0 : 1);
