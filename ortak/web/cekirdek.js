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

  /* Seçim kutuları: yerel <select> görünmez kalır (form, süzgeç ve değer onda); yerine tasarıma uygun düğme + açılır liste.
     Seçim yerel kutuya yazılıp 'input' + 'change' tetiklenir; koddan atanan değer (select.value = …) de düğmeye yansır.
     Açık liste <body>'ye taşınır ve ekrana sabitlenir: yapışkan çubukların, başlığın ya da alt çubuğun altında kalmaz,
     görünür alana sığacak yükseklikte açılır (yer yoksa yukarı). Görünüm: cekirdek.css + her sitenin site.css'i. */
  var YERLESIM = /^(?:[a-z0-9]+:)?-?(?:w-|min-w-|max-w-|m[trblxy]?-|flex-|shrink|grow|basis-|col-|row-|self-|order-)/;
  var degerTanim = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  var siraTanim = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
  var acikSecim = null;
  document.addEventListener('click', function (ev) {
    if (acikSecim && !acikSecim.kap.contains(ev.target) && !acikSecim.liste.contains(ev.target)) acikSecim.kapat();
  });
  ['scroll', 'resize'].forEach(function (olay) {
    window.addEventListener(olay, function () { if (acikSecim) acikSecim.yerlestir(); }, { passive: true });
  });
  var ustSinir = function () { var u = $('#ust-blok'); return u ? Math.max(0, u.getBoundingClientRect().bottom) : 0; };
  var altSinir = function () {
    var m = $('#mobil-cubuk');
    return window.innerHeight - (m && getComputedStyle(m).display !== 'none' ? m.offsetHeight : 0);
  };
  $$('select:not([multiple])').forEach(function (sec, sn) {
    var siniflar = sec.className.split(/\s+/).filter(Boolean);
    var etiket = sec.getAttribute('aria-label') ||
      (sec.labels && sec.labels[0] && sec.labels[0].firstElementChild ? sec.labels[0].firstElementChild.textContent.replace('*', '').trim() : '');
    var kap = document.createElement('div');
    kap.className = 'secim ' + siniflar.filter(function (c) { return YERLESIM.test(c); }).join(' ');
    var dugme = document.createElement('button');
    dugme.type = 'button';
    dugme.className = 'secim-dugme ' + siniflar.filter(function (c) { return !YERLESIM.test(c); }).join(' ');
    dugme.setAttribute('aria-haspopup', 'listbox');
    dugme.setAttribute('aria-expanded', 'false');
    dugme.innerHTML = '<span class="secim-metin"></span><span class="material-symbols-outlined secim-ok" aria-hidden="true">expand_more</span>';
    var liste = document.createElement('ul');
    liste.className = 'secim-liste';
    liste.id = 'secim-liste-' + sn;
    liste.setAttribute('role', 'listbox');
    liste.setAttribute('tabindex', '-1');
    if (etiket) liste.setAttribute('aria-label', etiket);
    liste.hidden = true;
    dugme.setAttribute('aria-controls', liste.id);
    sec.parentNode.insertBefore(kap, sec);
    kap.appendChild(dugme); kap.appendChild(sec);
    document.body.appendChild(liste);
    sec.classList.add('secim-yerel');
    sec.tabIndex = -1;
    sec.setAttribute('aria-hidden', 'true');
    var metin = $('.secim-metin', dugme), etkinNo = -1, aranan = '', aramaZaman;

    function guncelle() {
      var o = sec.options[siraTanim.get.call(sec)];
      var yazi = o ? o.textContent.trim() : '';
      metin.textContent = yazi;
      dugme.setAttribute('aria-label', (etiket ? etiket + ': ' : '') + yazi);
      kap.classList.toggle('secim-bos', !degerTanim.get.call(sec));
      dugme.disabled = sec.disabled;
    }
    Object.defineProperty(sec, 'value', { configurable: true,
      get: function () { return degerTanim.get.call(sec); }, set: function (v) { degerTanim.set.call(sec, v); guncelle(); } });
    Object.defineProperty(sec, 'selectedIndex', { configurable: true,
      get: function () { return siraTanim.get.call(sec); }, set: function (v) { siraTanim.set.call(sec, v); guncelle(); } });
    sec.addEventListener('change', guncelle);
    if (sec.form) sec.form.addEventListener('reset', function () { setTimeout(guncelle); });

    function ogeler() { return $$('[role="option"]', liste); }
    function ciz() {
      var secili = siraTanim.get.call(sec);
      liste.innerHTML = '';
      Array.prototype.forEach.call(sec.options, function (o, i) {
        var li = document.createElement('li');
        var m = o.textContent.trim().match(/^(.*?)\s*\((\d+)\)$/);   // "İzmir (50)" → ad + sayı rozeti
        li.id = liste.id + '-' + i;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', i === secili ? 'true' : 'false');
        if (o.disabled) li.setAttribute('aria-disabled', 'true');
        li.className = 'secim-oge' + (o.value === '' ? ' secim-tumu' : '');
        li.dataset.i = i;
        li.innerHTML = '<span class="secim-ad"></span>' + (m ? '<span class="secim-sayi"></span>' : '') +
          '<span class="material-symbols-outlined secim-tik" aria-hidden="true">check</span>';
        $('.secim-ad', li).textContent = m ? m[1] : o.textContent.trim();
        if (m) $('.secim-sayi', li).textContent = m[2];
        liste.appendChild(li);
      });
    }
    function etkin(i, kaydir) {
      var l = ogeler();
      if (!l.length) return;
      i = Math.max(0, Math.min(l.length - 1, i));
      if (l[etkinNo]) l[etkinNo].classList.remove('etkin');
      etkinNo = i;
      l[i].classList.add('etkin');
      liste.setAttribute('aria-activedescendant', l[i].id);
      if (kaydir === false) return;
      var ust = l[i].offsetTop, alt = ust + l[i].offsetHeight;   // yalnız listenin içini kaydır, sayfayı değil
      if (ust < liste.scrollTop) liste.scrollTop = ust;
      else if (alt > liste.scrollTop + liste.clientHeight) liste.scrollTop = alt - liste.clientHeight;
    }
    function yerlestir() {
      var d = dugme.getBoundingClientRect(), ust = ustSinir(), alt = altSinir(), bosluk = 6, kenar = 8;
      if (d.bottom < ust || d.top > alt) { kapat(false); return; }   // düğme ekrandan çıktıysa liste de kapanır
      liste.style.minWidth = d.width + 'px';
      liste.style.maxHeight = '';
      var dogal = liste.offsetHeight;
      var asagiAlan = alt - d.bottom - bosluk - kenar, yukariAlan = d.top - ust - bosluk - kenar;
      var yukari = asagiAlan < Math.min(dogal, 220) && yukariAlan > asagiAlan;
      var alan = Math.max(132, yukari ? yukariAlan : asagiAlan);
      if (dogal > alan) liste.style.maxHeight = alan + 'px';
      var y = liste.offsetHeight, w = liste.offsetWidth, vw = document.documentElement.clientWidth;
      var sol = d.left + w > vw - kenar ? Math.max(kenar, d.right - w) : d.left;
      liste.style.top = Math.round(yukari ? d.top - bosluk - y : d.bottom + bosluk) + 'px';
      liste.style.left = Math.round(sol) + 'px';
      liste.classList.toggle('yukari', yukari);
    }
    function ac() {
      if (acikSecim) acikSecim.kapat();
      ciz();
      liste.hidden = false;
      kap.classList.add('acik');
      dugme.setAttribute('aria-expanded', 'true');
      yerlestir();
      etkin(Math.max(0, siraTanim.get.call(sec)));
      liste.focus({ preventScroll: true });
      acikSecim = { kap: kap, liste: liste, kapat: kapat, yerlestir: yerlestir };
    }
    function kapat(odakla) {
      if (liste.hidden) return;
      liste.hidden = true;
      kap.classList.remove('acik');
      dugme.setAttribute('aria-expanded', 'false');
      if (acikSecim && acikSecim.kap === kap) acikSecim = null;
      if (odakla) dugme.focus();
    }
    function sec_(i) {
      var o = sec.options[i];
      if (!o || o.disabled) return;
      if (i !== siraTanim.get.call(sec)) {
        siraTanim.set.call(sec, i);
        guncelle();
        sec.dispatchEvent(new Event('input', { bubbles: true }));
        sec.dispatchEvent(new Event('change', { bubbles: true }));
      }
      kap.classList.remove('secim-hatali');
    }

    dugme.addEventListener('click', function () { if (liste.hidden) ac(); else kapat(true); });
    dugme.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); ac(); }
    });
    liste.addEventListener('mousemove', function (ev) {
      var li = ev.target.closest('[role="option"]');
      if (li && +li.dataset.i !== etkinNo) etkin(+li.dataset.i, false);
    });
    liste.addEventListener('click', function (ev) {
      var li = ev.target.closest('[role="option"]');
      if (!li || li.getAttribute('aria-disabled') === 'true') return;
      sec_(+li.dataset.i);
      kapat(true);
    });
    liste.addEventListener('keydown', function (ev) {
      var l = ogeler(), k = ev.key;
      if (k === 'ArrowDown') etkin(etkinNo + 1);
      else if (k === 'ArrowUp') etkin(etkinNo - 1);
      else if (k === 'Home' || k === 'PageUp') etkin(k === 'Home' ? 0 : etkinNo - 8);
      else if (k === 'End' || k === 'PageDown') etkin(k === 'End' ? l.length - 1 : etkinNo + 8);
      else if (k === 'Enter' || k === ' ') { sec_(etkinNo); kapat(true); }
      else if (k === 'Escape') kapat(true);
      else if (k === 'Tab') { kapat(true); return; }   // odak düğmeye döner, Tab oradan sıradaki öğeye geçer
      else if (k.length === 1 && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        // yazarak atla: "iz" → İzmir
        clearTimeout(aramaZaman);
        aranan += kucuk(k);
        aramaZaman = setTimeout(function () { aranan = ''; }, 700);
        for (var n = 1; n <= l.length; n++) {
          var j = (etkinNo + (aranan.length > 1 ? 0 : 1) + n - 1) % l.length;
          if (kucuk(l[j].textContent).indexOf(aranan) === 0) { etkin(j); break; }
        }
      } else return;
      ev.preventDefault();
    });
    sec.addEventListener('invalid', function () { kap.classList.add('secim-hatali'); });
    guncelle();
  });
})();
