/* ==========================================================
   全站公共：主题切换 · 顶栏图标提示
   主题存在 localStorage 的 minsys_theme（light / dark），
   刷新页面时由各页 <head> 里的内联脚本先套上，避免闪一下。
   ========================================================== */
(function () {
  var THEME_KEY = 'minsys_theme';
  var root = document.documentElement;

  function themeNow() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  /* 提示文案跟着当前主题变：亮主题下按钮是「切到暗」 */
  function syncTips() {
    var t = themeNow();
    document.querySelectorAll('[data-act="theme"]').forEach(function (b) {
      var tip = t === 'dark' ? '切换为亮色主题' : '切换为暗色主题';
      b.setAttribute('data-tip', tip);
      b.setAttribute('aria-label', tip);
    });
  }

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    syncTips();
    document.dispatchEvent(new CustomEvent('ui:theme', { detail: { theme: t } }));
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act="theme"]');
    if (!el) return;
    e.preventDefault();
    applyTheme(themeNow() === 'dark' ? 'light' : 'dark');
  });


  /* ---------- 清除全部记录 ----------
     只清 minsys_ 开头的键（做题记录、主题等），不动别的站点数据。
     清完重新载入，页面就是第一次打开的样子。 */
  function wipeAll() {
    try {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('minsys_') === 0) keys.push(k);
      }
      keys.forEach(function (k) { localStorage.removeItem(k); });
      sessionStorage.clear();
    } catch (e) {}
    location.reload();
  }

  var wipeArmed = 0;
  document.addEventListener('click', function (e) {
    var b = e.target.closest('#wipeBtn');
    if (!b) return;
    e.preventDefault();
    /* 两道确认，防手滑 */
    if (!wipeArmed) {
      wipeArmed = 1;
      b.classList.add('armed');
      b.setAttribute('data-tip', '再点一次就清除全部记录');
      b.setAttribute('aria-label', '再点一次就清除全部记录');
      setTimeout(function () {
        wipeArmed = 0;
        b.classList.remove('armed');
        b.setAttribute('data-tip', '清除全部记录，从头再练一遍');
        b.setAttribute('aria-label', '清除全部记录');
      }, 3200);
      return;
    }
    wipeArmed = 0;
    wipeAll();
  });

  function boot() {
    syncTips();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
