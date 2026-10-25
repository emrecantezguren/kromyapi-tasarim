/* Krom Yapı · üç sitenin ortak etkileşimleri (kütüphanesiz): menüler, slider, sayaç, lightbox, video, akış süzgeci, kart süzgeci, form, çerez. */
(function () {
  'use strict';
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var depo = {
    al: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    koy: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* gizli pencere */ } }
  };

  /* Sunum sayfasındaki mini ön izleme (?onizleme): çerez, yüzen düğme ve alt çubuk gösterilmez */
  if (/[?&]onizleme\b/.test(location.search)) document.documentElement.classList.add('onizleme');

  /* Üst blok: aşağı kaydırınca iletişim şeridini gizle */
  var ust = $('#ust-blok');
  if (ust) {
    var son = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      var gizle = y > 120 && y > son;
      ust.classList.toggle('serit-gizli', gizle);
      document.documentElement.classList.toggle('serit-gizli', gizle);
      ust.classList.toggle('shadow-sm', y > 10);
      son = y;
    }, { passive: true });
  }

  /* Mega menü + kurumsal açılır menü */
  $$('[data-acilir]').forEach(function (kap) {
    var dugme = $('[data-acilir-dugme]', kap), menu = $('.mega-menu', kap), zaman;
    if (!dugme || !menu) return;
    function ac() { clearTimeout(zaman); menu.classList.add('mm-acik'); dugme.setAttribute('aria-expanded', 'true'); }
    function kapat() { zaman = setTimeout(function () { menu.classList.remove('mm-acik'); dugme.setAttribute('aria-expanded', 'false'); }, 120); }
    kap.addEventListener('mouseenter', ac);
    kap.addEventListener('mouseleave', kapat);
    kap.addEventListener('focusin', ac);
    kap.addEventListener('focusout', function (ev) { if (!kap.contains(ev.relatedTarget)) kapat(); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { menu.classList.remove('mm-acik'); dugme.setAttribute('aria-expanded', 'false'); } });
  });
  $$('.mm-kat').forEach(function (b) {
    var sec = function () {
      var kok = b.closest('.mega-menu');
      $$('.mm-kat', kok).forEach(function (x) {
        var a = x === b;
        x.classList.toggle('text-primary-container', a);
        x.classList.toggle('bg-white', a);
        x.classList.toggle('border-primary-container', a);
        x.classList.toggle('text-zinc-600', !a);
        x.classList.toggle('border-transparent', !a);
      });
      $$('.mm-panel', kok).forEach(function (p) { p.classList.toggle('aktif', p.dataset.kat === b.dataset.kat); });
    };
    b.addEventListener('mouseenter', sec);
    b.addEventListener('focus', sec);
  });

  /* Mobil menü */
  var mm = $('#mobil-menu'), perde = $('#mobil-perde');
  function mobil(ac) {
    if (!mm) return;
    mm.classList.toggle('acik', ac); perde.classList.toggle('acik', ac);
    document.documentElement.style.overflow = ac ? 'hidden' : '';
  }
  $$('[data-mobil-ac]').forEach(function (b) { b.addEventListener('click', function () { mobil(true); }); });
  $$('[data-mobil-kapat]').forEach(function (b) { b.addEventListener('click', function () { mobil(false); }); });

  /* Hero slider */
  var slaytlar = $$('.slayt');
  if (slaytlar.length > 1) {
    var i = 0, cubuklar = $$('.slayt-cubuk'), sure = 7000, zam;
    var git = function (n) {
      slaytlar[i].classList.remove('aktif'); if (cubuklar[i]) cubuklar[i].classList.remove('aktif');
      i = (n + slaytlar.length) % slaytlar.length;
      slaytlar[i].classList.add('aktif');
      if (cubuklar[i]) { void cubuklar[i].offsetWidth; cubuklar[i].classList.add('aktif'); }
      $$('[data-slayt-yazi]').forEach(function (y) { y.classList.toggle('hidden', +y.dataset.slaytYazi !== i); });
      clearTimeout(zam); zam = setTimeout(function () { git(i + 1); }, sure);
    };
    cubuklar.forEach(function (c, n) { c.parentElement.addEventListener('click', function () { git(n); }); });
    git(0);
  }

  /* Sayaçlar */
  var sayaclar = $$('[data-sayac]');
  if (sayaclar.length && 'IntersectionObserver' in window) {
    var gozcu = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (g) {
        if (!g.isIntersecting) return;
        var el = g.target, hedef = +el.dataset.sayac, bas = performance.now();
        gozcu.unobserve(el);
        (function adim(t) {
          var p = Math.min(1, (t - bas) / 1400), v = Math.round(hedef * (1 - Math.pow(1 - p, 3)));
          el.textContent = v.toLocaleString('tr-TR');
          if (p < 1) requestAnimationFrame(adim);
        })(bas);
      });
    }, { threshold: .4 });
    sayaclar.forEach(function (s) { gozcu.observe(s); });
  }

  /* Lightbox: [data-galeri] içindeki a[data-buyuk] */
  var kutu = $('#isik-kutu');
  if (kutu) {
    var liste = [], sira = 0, resim = $('img', kutu), alt = $('[data-isik-alt]', kutu), say = $('[data-isik-say]', kutu);
    var goster = function (n) {
      sira = (n + liste.length) % liste.length;
      resim.src = liste[sira].href; resim.alt = liste[sira].dataset.alt || '';
      alt.textContent = liste[sira].dataset.alt || ''; say.textContent = (sira + 1) + ' / ' + liste.length;
    };
    var kapat = function () { kutu.classList.remove('acik'); document.documentElement.style.overflow = ''; };
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest('a[data-buyuk]');
      if (!a) return;
      ev.preventDefault();
      liste = $$('a[data-buyuk]', a.closest('[data-galeri]') || document);
      goster(liste.indexOf(a));
      kutu.classList.add('acik'); document.documentElement.style.overflow = 'hidden';
    });
    $('[data-isik-kapat]', kutu).addEventListener('click', kapat);
    $('[data-isik-onceki]', kutu).addEventListener('click', function () { goster(sira - 1); });
    $('[data-isik-sonraki]', kutu).addEventListener('click', function () { goster(sira + 1); });
    kutu.addEventListener('click', function (ev) { if (ev.target === kutu) kapat(); });
    document.addEventListener('keydown', function (ev) {
      if (!kutu.classList.contains('acik')) return;
      if (ev.key === 'Escape') kapat();
      if (ev.key === 'ArrowLeft') goster(sira - 1);
      if (ev.key === 'ArrowRight') goster(sira + 1);
    });
  }

  /* Video penceresi */
  $$('[data-video]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = $('#video-pencere'); if (!p) return;
      $('[data-video-yer]', p).innerHTML = '<iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/' +
        b.dataset.video + '?autoplay=1&rel=0" title="Krom Yapı tanıtım videosu" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      p.classList.remove('hidden'); p.classList.add('flex');
    });
  });
  $$('[data-video-kapat]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = $('#video-pencere'); $('[data-video-yer]', p).innerHTML = ''; p.classList.add('hidden'); p.classList.remove('flex');
    });
  });

  /* Duyurular: tür süzgeci + daha fazla göster */
  var akis = $('[data-akis]');
  if (akis) {
    var adim = 12, gorunen = adim, tur = 'tumu';
    var ogeler = $$('.akis-oge', akis), daha = $('[data-daha]'), bos = $('[data-akis-bos]');
    var ciz = function () {
      var uygun = ogeler.filter(function (o) { return tur === 'tumu' || o.dataset.tur === tur; });
      ogeler.forEach(function (o) { o.classList.add('gizli-kart'); });
      uygun.slice(0, gorunen).forEach(function (o) { o.classList.remove('gizli-kart'); });
      if (daha) daha.classList.toggle('hidden', uygun.length <= gorunen);
      if (bos) bos.classList.toggle('hidden', uygun.length > 0);
      $$('[data-akis-sayi]').forEach(function (s) { s.textContent = uygun.length; });
    };
    $$('[data-tur-sec]').forEach(function (b) {
      b.addEventListener('click', function () {
        tur = b.dataset.turSec; gorunen = adim;
        $$('[data-tur-sec]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        ciz();
      });
    });
    if (daha) daha.addEventListener('click', function () { gorunen += adim; ciz(); });
    ciz();
  }

  /* Formlar: ön izlemede gönderim bağlı değil — sorgudan ön doldurma + onay mesajı */
  $$('form[data-form]').forEach(function (f) {
    var q = new URLSearchParams(location.search);
    q.forEach(function (v, k) { var el = f.elements[k]; if (el && !el.value) el.value = v; });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      $('[data-form-icerik]', f).classList.add('hidden');
      $('[data-form-tamam]', f).classList.remove('hidden');
      f.scrollIntoView({ block: 'center' });
    });
  });

  /* Yüzen iletişim düğmeleri: ilk ekranda ve footer görünürken çekilir (hero ve footer bağlantılarını örtmesin) */
  var yuzen = $('#yuzen'), altBilgi = $('footer');
  if (yuzen) {
    var footerGorunur = false;
    var yuzenGuncelle = function () { yuzen.classList.toggle('yuzen-gizli', footerGorunur || window.scrollY < window.innerHeight * 0.6); };
    if (altBilgi && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (g) { footerGorunur = g[0].isIntersecting; yuzenGuncelle(); }).observe(altBilgi);
    }
    window.addEventListener('scroll', yuzenGuncelle, { passive: true });
    yuzenGuncelle();
  }

  /* Çerez bildirimi */
  var cerez = $('#cerez');
  if (cerez && !depo.al('krom-cerez')) {
    setTimeout(function () { cerez.classList.add('goster'); }, 800);
    $('[data-cerez-tamam]', cerez).addEventListener('click', function () { depo.koy('krom-cerez', '1'); cerez.classList.remove('goster'); });
  }
  var kucuk = function (s) { return (s || '').toLocaleLowerCase('tr'); };

  /* Kart süzgeci: [data-suzgec] içindeki [data-oge] öğeleri; çipler [data-f][data-v], select/input [data-f] */
  $$('[data-suzgec]').forEach(function (kok) {
    var adim = +(kok.dataset.adim || 0), gorunen = adim, durum = {};
    var ogeler = $$('[data-oge]', kok);
    var q = new URLSearchParams(location.search);
    $$('[data-f]', kok).forEach(function (el) {
      var f = el.dataset.f;
      if (q.get(f) && kok.hasAttribute('data-url')) durum[f] = q.get(f);
      if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', (el.dataset.v || '') === (durum[f] || '') ? 'true' : 'false');
      else if (durum[f]) el.value = durum[f];
    });
    var uyar = function (o) {
      return Object.keys(durum).every(function (f) {
        var v = durum[f]; if (!v) return true;
        if (f === 'ara') return kucuk(o.dataset.ara).indexOf(kucuk(v)) >= 0;
        return (' ' + (o.dataset[f] || '') + ' ').indexOf(' ' + v + ' ') >= 0;
      });
    };
    var ciz = function () {
      var uygun = ogeler.filter(uyar);
      ogeler.forEach(function (o) { o.classList.add('gizli-kart'); });
      uygun.slice(0, adim ? gorunen : uygun.length).forEach(function (o) { o.classList.remove('gizli-kart'); });
      $$('[data-sayi]', kok).forEach(function (s) { s.textContent = uygun.length; });
      var bos = $('[data-bos]', kok); if (bos) bos.classList.toggle('hidden', uygun.length > 0);
      var daha = $('[data-daha]', kok); if (daha) daha.classList.toggle('hidden', !adim || uygun.length <= gorunen);
      var tum = $('[data-tumu-link]', kok);
      if (tum) {
        var p = new URLSearchParams(); Object.keys(durum).forEach(function (f) { if (durum[f]) p.set(f, durum[f]); });
        tum.href = tum.dataset.tumuLink + (p.toString() ? '?' + p.toString() : '');
      }
      if (kok.hasAttribute('data-url')) {
        var u = new URLSearchParams(); Object.keys(durum).forEach(function (f) { if (durum[f]) u.set(f, durum[f]); });
        history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u.toString() : '') + location.hash);
      }
    };
    $$('[data-f]', kok).forEach(function (el) {
      var f = el.dataset.f;
      if (el.tagName === 'BUTTON') {
        el.addEventListener('click', function () {
          durum[f] = el.dataset.v || ''; gorunen = adim;
          $$('[data-f="' + f + '"]', kok).forEach(function (x) { if (x.tagName === 'BUTTON') x.setAttribute('aria-pressed', x === el ? 'true' : 'false'); });
          ciz();
        });
      } else {
        el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', function () { durum[f] = el.value; gorunen = adim; ciz(); });
      }
    });
    var daha = $('[data-daha]', kok);
    if (daha) daha.addEventListener('click', function () { gorunen += adim; ciz(); });
    var sifir = $('[data-sifirla]', kok);
    if (sifir) sifir.addEventListener('click', function () {
      durum = {}; gorunen = adim;
      $$('[data-f]', kok).forEach(function (el) { if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', el.dataset.v ? 'false' : 'true'); else el.value = ''; });
      ciz();
    });
    ciz();
  });
})();
