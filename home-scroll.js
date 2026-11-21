(function () {
  const navigationEntry = performance.getEntriesByType('navigation')[0];
  if (!navigationEntry || navigationEntry.type !== 'reload' || window.location.hash) return;

  const previousRestoration = history.scrollRestoration;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function resetScrollPosition() {
    const root = document.documentElement;
    const previousBehavior = root.style.getPropertyValue('scroll-behavior');
    const previousPriority = root.style.getPropertyPriority('scroll-behavior');
    root.style.setProperty('scroll-behavior', 'auto', 'important');
    root.getBoundingClientRect();
    window.scrollTo(0, 0);
    if (previousBehavior) root.style.setProperty('scroll-behavior', previousBehavior, previousPriority);
    else root.style.removeProperty('scroll-behavior');
  }

  window.addEventListener('pageshow', function () {
    resetScrollPosition();
    requestAnimationFrame(function () {
      resetScrollPosition();
      if ('scrollRestoration' in history) history.scrollRestoration = previousRestoration;
    });
  }, { once: true });
})();
