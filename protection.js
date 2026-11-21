(function () {
  let notice;
  let noticeTimer;

  function showProtectionNotice() {
    if (!notice) {
      notice = document.createElement('div');
      notice.className = 'protection-notice';
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      document.body.append(notice);
    }

    notice.textContent = 'Demo sayt kodi va brauzer ma’lumotlarini to‘liq yashirib bo‘lmaydi. Maxfiy ma’lumot kiritmang.';
    notice.classList.add('show');
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => notice.classList.remove('show'), 4500);
  }

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (event.key !== 'F12' && !(event.ctrlKey && key === 'u')) return;
    event.preventDefault();
    showProtectionNotice();
  }, true);

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    showProtectionNotice();
  }, true);
}());
