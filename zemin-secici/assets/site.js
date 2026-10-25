/* Krom Yapı · Site B — katman kesiti. Zemin seçici: secici.js · kart süzgeci: /ortak/web/cekirdek.js */
(function () {
  'use strict';
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };

  /* Katman kesiti: katman ↔ liste eşlemesi, "katmanları ayır" düğmesi, sekmeler */
  function kesitKur(kok) {
    var vurgula = function (i) {
      $$('[data-i]', kok).forEach(function (el) { el.classList.toggle('aktif', el.dataset.i === i); });
    };
    $$('[data-i]', kok).forEach(function (el) {
      el.addEventListener('mouseenter', function () { vurgula(el.dataset.i); });
      el.addEventListener('focus', function () { vurgula(el.dataset.i); });
      el.addEventListener('click', function () { vurgula(el.dataset.i); });
    });
    kok.addEventListener('mouseleave', function () { vurgula(null); });
    var d = $('[data-kesit-ayir]', kok);
    if (d) d.addEventListener('click', function () {
      var acik = !kok.classList.contains('ayrik');
      kok.classList.toggle('ayrik', acik);
      d.setAttribute('aria-pressed', acik ? 'true' : 'false');
      $('[data-ayir-yazi]', d).textContent = acik ? 'Katmanları birleştir' : 'Katmanları ayır';
    });
    // görünür olunca bir kez ayrılıp birleşsin (katmanlı yapı fark edilsin)
    if ('IntersectionObserver' in window && kok.hasAttribute('data-kesit-canli')) {
      var g = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting) return;
        g.disconnect();
        kok.classList.add('ayrik');
        setTimeout(function () { if (!d || d.getAttribute('aria-pressed') !== 'true') kok.classList.remove('ayrik'); }, 1600);
      }, { threshold: .5 });
      g.observe(kok);
    }
  }
  $$('[data-kesit]').forEach(kesitKur);

  $$('[data-kesit-sekme]').forEach(function (b) {
    b.addEventListener('click', function () {
      var grup = b.closest('[data-kesit-grubu]');
      $$('[data-kesit-sekme]', grup).forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      $$('[data-kesit-panel]', grup).forEach(function (p) { p.classList.toggle('hidden', p.dataset.kesitPanel !== b.dataset.kesitSekme); });
    });
  });

})();
