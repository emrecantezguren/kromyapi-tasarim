/* Krom Yapı · Son Tasarım — ana sayfadaki kaydırılabilir duyuru listesi. Süzgeç, lightbox, video: /assets/cekirdek.js */
(function () {
  'use strict';
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };

  /* Sahadan: kaydırılabilir duyuru listesi — sona gelince alttaki "kaydırın" ipucu kaybolur */
  $$('[data-kaydir-liste]').forEach(function (liste) {
    var ipucu = $('[data-kaydir-ipucu]', liste.parentNode);
    if (!ipucu) return;
    var guncelle = function () { ipucu.classList.toggle('opacity-0', liste.scrollTop + liste.clientHeight >= liste.scrollHeight - 8); };
    liste.addEventListener('scroll', guncelle, { passive: true });
    guncelle();
  });
})();
