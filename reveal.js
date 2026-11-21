(function () {
  const selector = '.section-heading, .listing-card, .developer-card, .step-card, .trust-inner > span, .page-intro > *, .page-card, .orders-empty, .order-row, .footer-main';
  let observer;

  function reveal(elements) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    elements.forEach((element, index) => {
      if (element.classList.contains('reveal')) return;
      element.classList.add('reveal');
      element.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
      if (reducedMotion || !('IntersectionObserver' in window)) {
        element.classList.add('is-visible');
      } else {
        observer.observe(element);
      }
    });
  }

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  }

  window.refreshReveal = function (root) {
    if (!root) return;
    const elements = [];
    if (root.matches && root.matches(selector)) elements.push(root);
    if (root.querySelectorAll) elements.push(...root.querySelectorAll(selector));
    reveal(elements);
  };

  document.addEventListener('DOMContentLoaded', () => window.refreshReveal(document));
}());
