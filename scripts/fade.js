/* Smooth fade-in on page swap (Material navigation.instant) */
function triggerFade () {
  document.body.classList.add('fade-phase');
  /* remove after animation completes to allow replay */
  setTimeout(() => document.body.classList.remove('fade-phase'), 200);
}

/* Initial page load */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', triggerFade);
} else {
  triggerFade();
}

/* Re-apply on every instant navigation */
if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
  /* Material fires DOMContentLoaded on every swap, so above already handles,
     but we add a listener for robustness in future upgrades */
  document.addEventListener('DOMContentLoaded', triggerFade);
}
