/* Original lightweight interactions inspired by the reviewed motion references. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const cards = [...document.querySelectorAll('.project-card')];
  const allowed = () => !reduced.matches && root.dataset.motion !== 'off';
  const halo = document.createElement('div');
  halo.className = 'cursor-halo';
  halo.setAttribute('aria-hidden', 'true');
  const pointerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  pointerSvg.setAttribute('viewBox', '0 0 26 34');
  const pointerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pointerPath.setAttribute('d', 'M3 2v23l6-6 5 11 4-2-5-11h9L3 2Z');
  pointerSvg.append(pointerPath);
  halo.append(pointerSvg);
  document.body.append(halo);
  let cursorFrame = 0;
  function hideHalo() {
    cancelAnimationFrame(cursorFrame);
    cursorFrame = 0;
    halo.dataset.active = 'false';
    delete root.dataset.customCursor;
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') { hideHalo(); return; }
    if (!allowed() || !finePointer.matches) return;
    if (event.target.closest('input,textarea,[contenteditable="true"]')) { hideHalo(); return; }
    cancelAnimationFrame(cursorFrame);
    cursorFrame = requestAnimationFrame(() => {
      cursorFrame = 0;
      if (!allowed() || !finePointer.matches) return;
      halo.style.transform = `translate3d(${event.clientX - 3}px,${event.clientY - 2}px,0)`;
      halo.dataset.active = 'true';
      root.dataset.customCursor = 'on';
      halo.dataset.interactive = String(Boolean(event.target.closest('a, button')));
    });
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hideHalo);
  document.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') hideHalo(); }, { passive: true });
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

  function synchronize() {
    if (!allowed() || !finePointer.matches) hideHalo();
    if (allowed()) return;
    cards.forEach(clearCard);
  }
  reduced.addEventListener('change', synchronize);
  finePointer.addEventListener('change', () => { cards.forEach(clearCard); synchronize(); });
  new MutationObserver(synchronize).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
})();
