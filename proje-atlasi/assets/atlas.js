/* Krom Yapı · Proje Atlası — Leaflet haritası + süzgeçler.
   [data-atlas="ozet"] ana sayfa bölümü, [data-atlas="tam"] /projeler/ sayfası. Veri: window.KROM (veri.js) */
(function () {
  'use strict';
  var K = window.KROM, kok = document.querySelector('[data-atlas]');
  if (!K || !kok || !window.L) return;
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var mod = kok.dataset.atlas, koyu = kok.dataset.tema === 'koyu';
  var TR = [[35.9, 25.9], [42.1, 44.6]];
  var kucukHarf = function (s) { return (s || '').toLocaleLowerCase('tr'); };

  var harita = L.map($('[data-harita]', kok), {
    scrollWheelZoom: false, minZoom: 4, maxZoom: 12, zoomSnap: 0.25, attributionControl: true
  });
  // Esri gri altlık: anahtarsız, sade; koyu bölümde koyu gri sürümü
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_' + (koyu ? 'Dark' : 'Light') +
    '_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Altlık &copy; Esri', maxZoom: 16
  }).addTo(harita);
  harita.fitBounds(TR, { padding: [16, 16] });
  harita.on('click', function () { harita.scrollWheelZoom.enable(); });
  var katman = L.layerGroup().addTo(harita);

  var durum = { sektor: '', grup: '', sehir: '', ara: '' };
  if (mod === 'tam') {
    var q = new URLSearchParams(location.search);
    ['sektor', 'grup', 'sehir', 'ara'].forEach(function (k) { if (q.get(k)) durum[k] = q.get(k); });
  }

  function uyar(p, sehirDahil) {
    if (durum.sektor && p.se.indexOf(durum.sektor) < 0) return false;
    if (durum.grup && p.g.indexOf(+durum.grup) < 0) return false;
    if (durum.ara && kucukHarf(p.b + ' ' + p.c + ' ' + p.i).indexOf(kucukHarf(durum.ara)) < 0) return false;
    if (sehirDahil && durum.sehir && p.c !== durum.sehir) return false;
    return true;
  }

  function pin(n, secili, ilce) {
    var b = Math.round(24 + Math.sqrt(n) * 6);
    return L.divIcon({
      className: '', iconSize: [b, b], iconAnchor: [b / 2, b / 2],
      html: '<div class="atlas-pin' + (secili ? ' secili' : '') + (ilce ? ' ilce' : '') + '" style="width:' + b + 'px;height:' + b + 'px">' + n + '</div>'
    });
  }

  function sehirSec(ad, uc) {
    durum.sehir = durum.sehir === ad ? '' : ad;
    if (uc !== false) {
      if (durum.sehir && K.sehir[durum.sehir]) {
        var ilceVar = Object.keys(K.ilce).some(function (k) { return k.indexOf(durum.sehir + '|') === 0; });
        harita.flyTo(K.sehir[durum.sehir], ilceVar ? 9 : 8, { duration: .8 });
      } else harita.flyToBounds(TR, { duration: .8 });
    }
    ciz();
  }

  function ciz() {
    var yakin = harita.getZoom() >= 8;
    var liste = K.projeler.filter(function (p) { return uyar(p, false); });
    var sayim = {}, ilceSayim = {};
    liste.forEach(function (p) {
      if (!p.c || !K.sehir[p.c]) return;
      sayim[p.c] = (sayim[p.c] || 0) + 1;
      var anahtar = p.i && K.ilce[p.c + '|' + p.i] ? p.c + '|' + p.i : p.c + '|';
      ilceSayim[anahtar] = (ilceSayim[anahtar] || 0) + 1;
    });
    katman.clearLayers();
    if (yakin) {
      Object.keys(ilceSayim).forEach(function (k) {
        var p = k.split('|'), yer = p[1] ? K.ilce[k] : K.sehir[p[0]];
        L.marker(yer, { icon: pin(ilceSayim[k], durum.sehir === p[0], !!p[1]) })
          .bindTooltip((p[1] ? p[1] + ' · ' : '') + p[0] + ' — ' + ilceSayim[k] + ' proje', { className: 'atlas-ipucu', direction: 'top', offset: [0, -14] })
          .on('click', function () { if (durum.sehir !== p[0]) sehirSec(p[0], false); })
          .addTo(katman);
      });
    } else {
      Object.keys(sayim).forEach(function (s) {
        L.marker(K.sehir[s], { icon: pin(sayim[s], durum.sehir === s) })
          .bindTooltip(s + ' — ' + sayim[s] + ' proje', { className: 'atlas-ipucu', direction: 'top', offset: [0, -14] })
          .on('click', function () { sehirSec(s); })
          .addTo(katman);
      });
    }
    // şehir listesi
    var enCok = Math.max.apply(null, Object.keys(sayim).map(function (k) { return sayim[k]; }).concat([1]));
    $$('.sehir-satir', kok).forEach(function (r) {
      var n = sayim[r.dataset.sehir] || 0;
      r.classList.toggle('secili', r.dataset.sehir === durum.sehir);
      r.classList.toggle('opacity-40', n === 0);
      $('[data-sayi]', r).textContent = n;
      $('.sehir-cubuk > span', r).style.width = (n / enCok * 100) + '%';
    });
    var yurtdisi = liste.filter(function (p) { return p.c && !K.sehir[p.c]; }).length;
    $$('[data-yurtdisi]').forEach(function (y) { y.textContent = yurtdisi; });
    if (mod === 'ozet') secimPaneli(liste); else kartlar();
  }

  function secimPaneli(liste) {
    var panel = $('[data-atlas-secim]', kok); if (!panel) return;
    var secili = liste.filter(function (p) { return !durum.sehir || p.c === durum.sehir; });
    var baslik = durum.sehir ? durum.sehir + ' · ' + secili.length + ' proje' : 'Son eklenen projeler';
    $('[data-secim-baslik]', kok).textContent = baslik;
    var tum = $('[data-secim-tumu]', kok);
    var q = new URLSearchParams();
    if (durum.sehir) q.set('sehir', durum.sehir);
    if (durum.sektor) q.set('sektor', durum.sektor);
    tum.href = '/kromyapi-tasarim/proje-atlasi/projeler/' + (q.toString() ? '?' + q.toString() : '') + '#liste';
    panel.innerHTML = secili.slice(0, 4).map(function (p) {
      return '<a href="' + p.u + '" class="kart group flex gap-4 items-center border border-white/10 hover:border-primary-container bg-white/[0.03] p-3 transition-colors">' +
        '<span class="kart-gorsel block w-20 h-16 shrink-0 overflow-hidden bg-zinc-800">' + (p.k ? '<img src="' + p.k + '" alt="" loading="lazy" class="w-full h-full object-cover">' : '') + '</span>' +
        '<span class="min-w-0"><span class="block text-[10px] font-bold uppercase tracking-[0.18em] text-primary-fixed-dim mb-1">' + (p.t || '') + (p.c ? ' · ' + p.c : '') + '</span>' +
        '<span class="block text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-primary-fixed-dim transition-colors">' + p.b + '</span></span></a>';
    }).join('') || '<p class="text-sm text-white/50">Bu süzgeçle eşleşen proje yok.</p>';
  }

  function kartlar() {
    var n = 0;
    $$('.proje-karti').forEach(function (k) {
      var p = K.indeks[k.dataset.s], ok = p && uyar(p, true);
      k.classList.toggle('gizli-kart', !ok);
      if (ok) n++;
    });
    $$('[data-sonuc]').forEach(function (s) { s.textContent = n; });
    var bos = $('[data-bos]'); if (bos) bos.classList.toggle('hidden', n > 0);
    // form alanlarını durumla eşitle
    $$('[data-filtre]').forEach(function (el) { if (el.value !== durum[el.dataset.filtre]) el.value = durum[el.dataset.filtre]; });
    var q = new URLSearchParams();
    Object.keys(durum).forEach(function (k) { if (durum[k]) q.set(k, durum[k]); });
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q.toString() : '') + location.hash);
  }

  K.indeks = {};
  K.projeler.forEach(function (p) { K.indeks[p.s] = p; });

  $$('[data-atlas-sektor]').forEach(function (b) {
    b.setAttribute('aria-pressed', b.dataset.atlasSektor === durum.sektor ? 'true' : 'false');
    b.addEventListener('click', function () {
      durum.sektor = b.dataset.atlasSektor;
      $$('[data-atlas-sektor]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      ciz();
    });
  });
  $$('.sehir-satir', kok).forEach(function (r) { r.addEventListener('click', function () { sehirSec(r.dataset.sehir); }); });
  $$('[data-filtre]').forEach(function (el) {
    el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', function () {
      if (el.dataset.filtre === 'sehir') { sehirSec(el.value); return; }
      durum[el.dataset.filtre] = el.value; ciz();
    });
  });
  $$('[data-sifirla]').forEach(function (b) {
    b.addEventListener('click', function () {
      durum = { sektor: '', grup: '', sehir: '', ara: '' };
      $$('[data-atlas-sektor]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.atlasSektor === '' ? 'true' : 'false'); });
      harita.flyToBounds(TR, { duration: .8 }); ciz();
    });
  });
  harita.on('zoomend', ciz);
  if (durum.sehir && K.sehir[durum.sehir]) harita.setView(K.sehir[durum.sehir], 9);
  ciz();
})();
