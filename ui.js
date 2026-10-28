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

  function boot() {
    syncTips();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
