/* Krom Yapı · Site C — sektör dizininde imleci izleyen görsel. Süzgeç, lightbox, video: /ortak/web/cekirdek.js */
(function () {
  'use strict';
  var kutu = document.getElementById('dizin-gorsel');
  if (!kutu || !window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) return;
  var resim = kutu.querySelector('img'), x = 0, y = 0, hx = 0, hy = 0, calisiyor = false;
  function kare() {
    hx += (x - hx) * 0.18; hy += (y - hy) * 0.18;
    kutu.style.left = hx + 'px'; kutu.style.top = hy + 'px';
    if (calisiyor) requestAnimationFrame(kare);
  }
  document.querySelectorAll('[data-dizin-gorsel]').forEach(function (satir) {
    satir.addEventListener('mouseenter', function (ev) {
      resim.src = satir.dataset.dizinGorsel;
      x = hx = ev.clientX + 180; y = hy = ev.clientY;
      kutu.classList.add('acik');
      if (!calisiyor) { calisiyor = true; requestAnimationFrame(kare); }
    });
    satir.addEventListener('mousemove', function (ev) { x = ev.clientX + 180; y = ev.clientY; });
    satir.addEventListener('mouseleave', function () { kutu.classList.remove('acik'); calisiyor = false; });
  });
})();
