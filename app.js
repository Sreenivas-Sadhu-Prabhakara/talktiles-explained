/* ============================================================
   talktiles explained — animation + a live taste of the app.
   No network, no inline handlers (CSP: default-src 'self').
   Everything degrades gracefully with reduced motion / no speech.
   ============================================================ */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- speech (speechSynthesis is on-device only; safe under the CSP) ---- */
  function canSpeak() {
    return typeof window.speechSynthesis !== 'undefined' &&
           typeof window.SpeechSynthesisUtterance !== 'undefined';
  }
  function speak(text) {
    if (!canSpeak()) return false;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 0.98;
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---- live speaking tiles (scene 02) ---- */
  var caption = document.getElementById('tileCaption');
  var tiles = document.querySelectorAll('.xtile');
  Array.prototype.forEach.call(tiles, function (tile) {
    tile.addEventListener('click', function () {
      var phrase = tile.getAttribute('data-say') || '';
      // visual feedback regardless of whether a voice exists
      Array.prototype.forEach.call(tiles, function (t) { t.classList.remove('speaking'); });
      tile.classList.add('speaking');
      if (caption) {
        caption.hidden = false;
        caption.textContent = '“' + phrase + '”';
      }
      speak(phrase);
      window.setTimeout(function () { tile.classList.remove('speaking'); },
        reduceMotion ? 600 : 1600);
    });
  });

  /* ---- scroll reveal: mark figures/headings, observe them ---- */
  var revealables = document.querySelectorAll('.scene__figure, .scene h2, .scene__body, .feat__card');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    // no animation: everything stays visible (default CSS already visible)
  } else {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
  }

  /* ---- sentence strip replay (scene 03) ---- */
  var strip = document.querySelector('.strip');
  if (strip && !reduceMotion && 'IntersectionObserver' in window) {
    var stripIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          strip.classList.remove('play');
          // force reflow so the animation restarts on each entry
          void strip.offsetWidth;
          strip.classList.add('play');
        }
      });
    }, { threshold: 0.5 });
    stripIO.observe(strip);
  }

  /* ---- hero demo: give the tile a spoken line on first user gesture ---- */
  // (Autoplay speech is blocked by browsers; we only speak on explicit taps.)
})();
