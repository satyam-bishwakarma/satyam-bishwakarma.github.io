/* Original lightweight interactions inspired by the reviewed motion references. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const cards = [...document.querySelectorAll('.project-card')];
  const activeAnimations = new Set();
  const allowed = () => !reduced.matches && root.dataset.motion !== 'off';
  const halo = document.createElement('div');
  halo.className = 'cursor-halo';
  halo.setAttribute('aria-hidden', 'true');
  document.body.append(halo);
  let cursorFrame = 0;
  function hideHalo() {
    cancelAnimationFrame(cursorFrame);
    cursorFrame = 0;
    halo.dataset.active = 'false';
  }
  document.addEventListener('pointermove', event => {
    if (!allowed() || !finePointer.matches || event.pointerType === 'touch') return;
    cancelAnimationFrame(cursorFrame);
    cursorFrame = requestAnimationFrame(() => {
      cursorFrame = 0;
      if (!allowed() || !finePointer.matches) return;
      halo.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      halo.dataset.active = 'true';
      halo.dataset.interactive = String(Boolean(event.target.closest('a, button')));
    });
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hideHalo);
  window.addEventListener('blur', hideHalo);
  const clearCard = card => {
    ['--spot-x', '--spot-y', '--tilt-x', '--tilt-y'].forEach(key => card.style.removeProperty(key));
  };

  cards.forEach(card => {
    let frame = 0;
    const reset = () => { cancelAnimationFrame(frame); frame = 0; clearCard(card); };
    card.addEventListener('pointermove', event => {
      if (!allowed() || !finePointer.matches || event.pointerType === 'touch') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!allowed()) return;
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty('--spot-x', `${x}px`);
        card.style.setProperty('--spot-y', `${y}px`);
        card.style.setProperty('--tilt-x', `${(0.5 - y / rect.height) * 2}deg`);
        card.style.setProperty('--tilt-y', `${(x / rect.width - 0.5) * 2}deg`);
      });
    }, { passive: true });
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointercancel', reset);
    card.addEventListener('blur', reset);
  });

  // Content stays visible if observers, animations or this script are unavailable.
  if ('IntersectionObserver' in window && Element.prototype.animate) {
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
        observer.unobserve(entry.target);
        if (!allowed()) return;
        const animation = entry.target.animate([
          { opacity: 0.65, translate: '0 12px' },
          { opacity: 1, translate: '0 0' }
        ], { duration: 580, delay: Math.min(index * 55, 165), easing: 'cubic-bezier(.22,1,.36,1)' });
        activeAnimations.add(animation);
        animation.onfinish = animation.oncancel = () => activeAnimations.delete(animation);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.intro-copy, .research-visual, .project-card, .case-study, .about, .connect').forEach(node => observer.observe(node));
  }

  function synchronize() {
    if (!allowed() || !finePointer.matches) hideHalo();
    if (allowed()) return;
    cards.forEach(clearCard);
    activeAnimations.forEach(animation => animation.cancel());
  }
  reduced.addEventListener('change', synchronize);
  finePointer.addEventListener('change', () => { cards.forEach(clearCard); synchronize(); });
  new MutationObserver(synchronize).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
})();
