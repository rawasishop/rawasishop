/* RawasiShop — مصدر الزيارة (فيسبوك / تيك توك / سناب / مباشر) */
(function () {
  'use strict';

  var LABELS = {
    facebook: 'فيسبوك / إنستغرام',
    tiktok: 'تيك توك',
    snapchat: 'سناب شات',
    google: 'جوجل',
    direct: 'مباشر',
    referral: 'رابط خارجي'
  };

  function norm(s) {
    return String(s || '').toLowerCase().trim();
  }

  function labelFor(source) {
    var key = norm(source);
    return LABELS[key] || source || LABELS.direct;
  }

  function fromParams(params) {
    var utm = norm(params.get('utm_source'));
    if (utm.indexOf('facebook') !== -1 || utm === 'fb' || utm === 'ig' || utm === 'instagram') {
      return 'facebook';
    }
    if (utm.indexOf('tiktok') !== -1 || utm === 'tt') return 'tiktok';
    if (utm.indexOf('snap') !== -1) return 'snapchat';
    if (utm) return utm;
    if (params.get('fbclid')) return 'facebook';
    if (params.get('ttclid')) return 'tiktok';
    if (params.get('ScCid') || params.get('sccid')) return 'snapchat';
    return '';
  }

  function fromReferrer(ref) {
    ref = norm(ref);
    if (!ref) return 'direct';
    if (ref.indexOf('facebook.com') !== -1 || ref.indexOf('instagram.com') !== -1) return 'facebook';
    if (ref.indexOf('tiktok.com') !== -1) return 'tiktok';
    if (ref.indexOf('snapchat.com') !== -1) return 'snapchat';
    if (ref.indexOf('google.') !== -1) return 'google';
    return 'referral';
  }

  function capture() {
    try {
      var params = new URLSearchParams(window.location.search);
      var adSource = fromParams(params) || fromReferrer(document.referrer);
      var data = {
        adSource: adSource,
        adSourceLabel: labelFor(adSource),
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || ''
      };
      sessionStorage.setItem('rawasi_traffic', JSON.stringify(data));
      return data;
    } catch (e) {
      return { adSource: 'direct', adSourceLabel: LABELS.direct, utm_source: '', utm_medium: '', utm_campaign: '' };
    }
  }

  function get() {
    try {
      var raw = sessionStorage.getItem('rawasi_traffic');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return capture();
  }

  window.RAWASI_TRAFFIC = { capture: capture, get: get };
  capture();
})();
