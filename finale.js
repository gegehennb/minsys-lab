/* ==========================================================
   最小系统大师 · 结课页
   只做两件事：滚动到视口时把该块点亮，把几个数字数上去。
   动画本身都写在 style.css 里，这里只负责加 .in 这个开关。
   ========================================================== */
(function () {
  'use strict';

  var revs = [].slice.call(document.querySelectorAll('[data-rev]'));

  function showAll() {
    revs.forEach(function (e) { e.classList.add('in'); });
    countAll();
  }

  /* ---------------- 数字滚动 ---------------- */
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-count'), 10) || 0;
    var dur = 1150;
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counted = false;
  function countAll() {
    if (counted) return;
    counted = true;
    [].slice.call(document.querySelectorAll('[data-count]')).forEach(countUp);
  }

  if (!('IntersectionObserver' in window)) {
    showAll();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

  revs.forEach(function (e) { io.observe(e); });

  /* 数字块单独盯一下，露面到位才开始数 */
  var mBox = document.querySelector('.fn-metrics');
  if (mBox) {
    var io2 = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io2.disconnect();
      countAll();
    }, { threshold: 0.35 });
    io2.observe(mBox);
  } else {
    countAll();
  }

  /* 从实验台跳过来时，先把当前状态清零 —— 免得浏览器记住上一次的滚动位置 */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
})();
