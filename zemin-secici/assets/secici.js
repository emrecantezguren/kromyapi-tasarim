/* Krom Yapı · Zemin Seçici — alan + koşul → sistem önerisi ve o alandaki gerçek projeler.
   Veri: window.KROM_B (veri.js). Öneri sırası: alanın aday listesi + seçilen koşulların ürün metninde geçmesi. */
(function () {
  'use strict';
  var K = window.KROM_B, kok = document.querySelector('[data-secici]');
  if (!K || !kok) return;
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ikon = function (ad, sinif) { return '<span class="material-symbols-outlined ' + (sinif || '') + '" aria-hidden="true">' + ad + '</span>'; };
  var alanBul = function (id) { return K.alanlar.filter(function (a) { return a.id === id; })[0]; };

  var durum = { adim: 1, alan: null, kosul: [] };
  var q = new URLSearchParams(location.search);
  if (q.get('alan') && alanBul(q.get('alan'))) {
    durum.alan = q.get('alan');
    durum.kosul = (q.get('k') || '').split(',').filter(function (k) { return K.kosullar.some(function (x) { return x.id === k; }); });
    durum.adim = q.has('k') ? 3 : 2;
  }

  function puanla() {
    var alan = alanBul(durum.alan), n = alan.urunler.length;
    return alan.urunler.map(function (s, i) {
      var u = K.urunler[s], eslesen = durum.kosul.filter(function (k) {
        var kosul = K.kosullar.filter(function (x) { return x.id === k; })[0];
        return kosul.anahtar.some(function (a) { return u.m.indexOf(a) >= 0; });
      });
      // önce karşılanan koşul sayısı, eşitlikte alanın aday sırası
      return { s: s, u: u, puan: eslesen.length * n + (n - i), eslesen: eslesen };
    }).sort(function (a, b) { return b.puan - a.puan; });
  }

  function urunKart(o, sira) {
    var u = o.u, kosulSatir = durum.kosul.map(function (k) {
      var kosul = K.kosullar.filter(function (x) { return x.id === k; })[0], var_ = o.eslesen.indexOf(k) >= 0;
      return '<li class="flex items-start gap-2 text-sm ' + (var_ ? 'text-zinc-900' : 'text-zinc-400') + '">' +
        ikon(var_ ? 'check_circle' : 'remove', 'text-[18px] ' + (var_ ? 'text-primary-container ikon-dolu' : '')) +
        esc(kosul.ad) + (var_ ? '' : ' <span class="text-xs">(açıklamada geçmiyor)</span>') + '</li>';
    }).join('');
    var ozellik = u.oz.slice(0, 6).map(function (x) { return '<span class="border border-zinc-200 px-2.5 py-1 text-[11px] font-semibold text-zinc-700">' + esc(x) + '</span>'; }).join('');
    var alanlar = u.al.slice(0, 4).map(esc).join(' · ');
    if (sira === 0) {
      return '<article class="bg-white border border-zinc-200 border-t-4 border-t-primary-container grid grid-cols-1 md:grid-cols-5">' +
        '<a href="' + u.url + '" class="md:col-span-2 block aspect-[4/3] md:aspect-auto bg-zinc-100 overflow-hidden">' + (u.k ? '<img src="' + u.k + '" alt="" class="w-full h-full object-cover">' : '') + '</a>' +
        '<div class="md:col-span-3 p-6 md:p-8">' +
        '<div class="flex items-center gap-3 mb-3"><span class="text-primary-container font-black text-3xl leading-none">01</span><span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">En uygun sistem · ' + esc(u.grup) + '</span></div>' +
        '<h3 class="text-2xl font-bold tracking-tight mb-4"><a class="hover:text-primary" href="' + u.url + '">' + esc(u.ad) + '</a></h3>' +
        (kosulSatir ? '<ul class="space-y-1.5 mb-5">' + kosulSatir + '</ul>' : '') +
        (ozellik ? '<div class="flex flex-wrap gap-1.5 mb-5">' + ozellik + '</div>' : '') +
        (alanlar ? '<p class="text-sm text-secondary mb-6"><b class="text-zinc-900">Uygulama alanları:</b> ' + alanlar + '</p>' : '') +
        '<div class="flex flex-col sm:flex-row gap-3">' +
        '<a href="' + u.url + (u.kat ? '#katmanlar' : '') + '" class="inline-flex items-center justify-center gap-2 border border-zinc-900 px-5 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-colors">' + ikon(u.kat ? 'layers' : 'arrow_forward', 'text-[18px]') + (u.kat ? 'Katman yapısını gör' : 'Ürünü incele') + '</a>' +
        '<a href="' + teklifLink(u) + '" class="inline-flex items-center justify-center gap-2 bg-primary-container hover:bg-primary text-white px-5 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors">' + ikon('request_quote', 'text-[18px]') + 'Bu sistem için keşif iste</a>' +
        '</div></div></article>';
    }
    return '<a href="' + u.url + '" class="kart group flex items-center gap-4 bg-white border border-zinc-200 hover:border-primary-container p-3 sm:p-4 transition-colors">' +
      '<span class="text-zinc-300 font-black text-xl w-8 text-center shrink-0">' + ('0' + (sira + 1)).slice(-2) + '</span>' +
      '<span class="kart-gorsel w-20 h-16 shrink-0 bg-zinc-100 overflow-hidden">' + (u.k ? '<img src="' + u.k + '" alt="" loading="lazy" class="w-full h-full object-cover">' : '') + '</span>' +
      '<span class="min-w-0 flex-1"><span class="block text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">' + esc(u.grup) + '</span>' +
      '<span class="block font-semibold leading-snug group-hover:text-primary">' + esc(u.ad) + '</span>' +
      (durum.kosul.length ? '<span class="block text-xs text-zinc-500 mt-0.5">' + o.eslesen.length + '/' + durum.kosul.length + ' koşul</span>' : '') + '</span>' +
      ikon('chevron_right', 'text-zinc-400 group-hover:text-primary-container') + '</a>';
  }

  function teklifLink(u) {
    var alan = alanBul(durum.alan), p = new URLSearchParams();
    p.set('grup', u.g); p.set('sektor', alan.sektor); p.set('urun', u.slug);
    var kos = durum.kosul.map(function (k) { return K.kosullar.filter(function (x) { return x.id === k; })[0].ad; });
    p.set('mesaj', 'Alan: ' + alan.ad + (kos.length ? '. Koşullar: ' + kos.join(', ') : '') + '. Önerilen sistem: ' + u.ad + '.');
    return '/kromyapi-tasarim/zemin-secici/teklif-iste/?' + p.toString();
  }

  function sonuc() {
    var alan = alanBul(durum.alan), liste = puanla();
    var ust = liste.slice(0, 5), gruplar = {};
    ust.forEach(function (o) { gruplar[o.u.g] = 1; });
    var projeler = K.projeler.filter(function (p) { return p.se.indexOf(alan.sektor) >= 0 && p.g.some(function (g) { return gruplar[g]; }); });
    if (projeler.length < 3) projeler = projeler.concat(K.projeler.filter(function (p) { return p.se.indexOf(alan.sektor) >= 0 && projeler.indexOf(p) < 0; }));
    var proje = projeler.slice(0, 3).map(function (p) {
      return '<a href="' + p.u + '" class="kart group flex gap-3 items-center"><span class="kart-gorsel w-20 h-16 shrink-0 bg-zinc-800 overflow-hidden">' +
        (p.k ? '<img src="' + p.k + '" alt="" loading="lazy" class="w-full h-full object-cover">' : '') + '</span><span class="min-w-0">' +
        '<span class="block text-[10px] font-bold uppercase tracking-[0.16em] text-primary-fixed-dim">' + esc(p.t) + (p.c ? ' · ' + esc(p.c) : '') + '</span>' +
        '<span class="block text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-primary-fixed-dim">' + esc(p.b) + '</span></span></a>';
    }).join('');
    var kos = durum.kosul.map(function (k) { return K.kosullar.filter(function (x) { return x.id === k; })[0].ad; });
    $('[data-sonuc]', kok).innerHTML =
      '<div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">' +
      '<div><p class="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-container mb-2">Öneri</p>' +
      '<h2 class="text-[28px] md:text-[36px] leading-tight font-semibold uppercase">' + esc(alan.ad) + ' için sistemler</h2>' +
      '<p class="text-secondary mt-2">' + (kos.length ? 'Koşullar: ' + kos.map(esc).join(', ') : 'Koşul seçilmedi; alanın genel önerileri gösteriliyor.') + '</p></div>' +
      '<div class="flex gap-2 shrink-0"><button type="button" data-git="2" class="border border-zinc-300 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:border-zinc-900">Koşulları değiştir</button>' +
      '<button type="button" data-git="1" class="border border-zinc-300 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:border-zinc-900">Alanı değiştir</button></div></div>' +
      '<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">' +
      '<div class="lg:col-span-8 space-y-3">' + ust.map(urunKart).join('') +
      (liste.length > 5 ? '<details class="bg-white border border-zinc-200"><summary class="flex items-center justify-between px-4 py-3 text-[11px] font-bold uppercase tracking-widest">Bu alana uygun diğer sistemler (' + (liste.length - 5) + ')' + ikon('expand_more', 'ac-ok text-[20px]') + '</summary>' +
        '<ul class="px-4 pb-4 grid sm:grid-cols-2 gap-x-6 gap-y-2">' + liste.slice(5).map(function (o) { return '<li><a class="text-sm text-zinc-700 hover:text-primary-container" href="' + o.u.url + '">' + esc(o.u.ad) + '</a></li>'; }).join('') + '</ul></details>' : '') +
      '</div><aside class="lg:col-span-4 space-y-4">' +
      (alan.not ? '<div class="border-l-4 border-primary-container bg-white p-5 text-sm text-zinc-700 leading-relaxed">' + ikon('info', 'text-[20px] text-primary-container align-middle mr-1') + esc(alan.not) + '</div>' : '') +
      (proje ? '<div class="bg-zinc-900 p-5"><p class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-4">Bu alanda yaptığımız işler</p><div class="space-y-3">' + proje + '</div>' +
        '<a href="/kromyapi-tasarim/zemin-secici/projeler/?se=' + alan.sektor + '" class="mt-5 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-primary-fixed-dim hover:text-white">Tüm ' + esc(alan.sektorAd) + ' projeleri' + ikon('arrow_forward', 'text-[15px]') + '</a></div>' : '') +
      '<div class="border border-zinc-200 bg-white p-5"><p class="font-semibold mb-1">Emin değil misiniz?</p><p class="text-sm text-secondary mb-4">Keşif, nem analizi ve yüzey testi ücretsiz; doğru sistemi sahada birlikte belirleyelim.</p>' +
      '<a href="' + teklifLink(ust[0].u) + '" class="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-900 border-b-2 border-primary-container pb-1">Ücretsiz keşif iste' + ikon('arrow_forward', 'text-[15px]') + '</a></div>' +
      '</aside></div>';
    $$('[data-git]', kok).forEach(function (b) { b.addEventListener('click', function () { git(+b.dataset.git); }); });
  }

  function git(adim) {
    if (adim > 1 && !durum.alan) adim = 1;
    durum.adim = adim;
    $$('[data-adim]', kok).forEach(function (a) { a.classList.toggle('hidden', +a.dataset.adim !== adim); });
    $$('.adim-noktasi', kok).forEach(function (n) { var i = +n.dataset.n; n.dataset.durum = i < adim ? 'tamam' : (i === adim ? 'aktif' : ''); });
    $$('[data-alan]', kok).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.alan === durum.alan ? 'true' : 'false'); });
    $$('[data-kosul]', kok).forEach(function (b) { b.setAttribute('aria-pressed', durum.kosul.indexOf(b.dataset.kosul) >= 0 ? 'true' : 'false'); });
    var a = durum.alan && alanBul(durum.alan);
    $$('[data-secili-alan]', kok).forEach(function (s) { s.textContent = a ? a.ad : ''; });
    if (adim === 3) sonuc();
    var p = new URLSearchParams();
    if (durum.alan) p.set('alan', durum.alan);
    if (adim === 3) p.set('k', durum.kosul.join(','));
    history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p.toString() : ''));
    if (kok.getBoundingClientRect().top < 0) kok.scrollIntoView({ block: 'start' });
  }

  $$('[data-alan]', kok).forEach(function (b) {
    b.addEventListener('click', function () {
      if (durum.alan !== b.dataset.alan) durum.kosul = [];
      durum.alan = b.dataset.alan; git(2);
    });
  });
  $$('[data-kosul]', kok).forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.kosul, i = durum.kosul.indexOf(k);
      if (i >= 0) durum.kosul.splice(i, 1); else durum.kosul.push(k);
      b.setAttribute('aria-pressed', i >= 0 ? 'false' : 'true');
    });
  });
  $$('[data-git-adim]', kok).forEach(function (b) { b.addEventListener('click', function () { git(+b.dataset.gitAdim); }); });
  git(durum.adim);
})();
