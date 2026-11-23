import { useEffect } from 'react';
import { gsap } from 'gsap';

// A short magnetic corridor at project boundaries, not full-page scroll locking.
export default function ProjectTransitions() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(pointer: fine)');
    const sections = [...document.querySelectorAll('.case-study')];
    let pull = null;
    let direction = 0;
    let boundary = null;
    let effort = 0;
    let lastInput = 0;
    const enabled = () => fine.matches && !reduced.matches && root.dataset.motion !== 'off';
    const cancel = () => {
      pull?.kill();
      pull = null;
      boundary = null;
      effort = 0;
      delete root.dataset.projectPull;
    };
    const wheel = event => {
      if (!enabled() || event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.target.closest('input, textarea, select, [contenteditable="true"], .unified-nav')) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (!delta || Math.abs(delta) > 300) { cancel(); return; }
      const sign = Math.sign(delta);
      if (pull) {
        if (sign !== direction) { cancel(); return; }
        event.preventDefault();
        return;
      }
      const now = performance.now();
      const latched = boundary && direction === sign && now - lastInput <= 200;
      const next = latched ? boundary : sections.slice(1).find(section => {
        const top = section.getBoundingClientRect().top;
        return top >= innerHeight * (sign > 0 ? 0.48 : 0.32) && top <= innerHeight * (sign > 0 ? 0.68 : 0.52);
      });
      if (!next) { boundary = null; effort = 0; return; }
      if (boundary !== next || sign !== direction || now - lastInput > 200) effort = 0;
      boundary = next;
      direction = sign;
      lastInput = now;
      effort += Math.abs(delta);
      event.preventDefault();
      if (effort < 120) {
        window.scrollBy({ top: delta * 0.38, behavior: 'instant' });
        return;
      }
      const top = scrollY + next.getBoundingClientRect().top;
      const header = document.querySelector('.site-header').getBoundingClientRect().height;
      const target = sign > 0 ? top - header - 24 : top - innerHeight + 32;
      const position = { y: scrollY };
      root.dataset.projectPull = 'active';
      pull = gsap.to(position, {
        y: Math.max(0, target), duration: 0.65, ease: 'power2.inOut',
        onUpdate: () => window.scrollTo({ top: position.y, behavior: 'instant' }),
        onComplete: cancel
      });
    };
    const settingsChanged = () => { if (!enabled()) cancel(); };
    const settings = new MutationObserver(settingsChanged);
    settings.observe(root, { attributes: true, attributeFilter: ['data-motion'] });
    window.addEventListener('wheel', wheel, { passive: false });
    ['pointerdown', 'touchstart', 'keydown', 'hashchange', 'resize', 'blur'].forEach(type => window.addEventListener(type, cancel, { passive: true }));
    reduced.addEventListener('change', settingsChanged);
    fine.addEventListener('change', settingsChanged);
    return () => {
      cancel();
      settings.disconnect();
      window.removeEventListener('wheel', wheel);
      ['pointerdown', 'touchstart', 'keydown', 'hashchange', 'resize', 'blur'].forEach(type => window.removeEventListener(type, cancel));
      reduced.removeEventListener('change', settingsChanged);
      fine.removeEventListener('change', settingsChanged);
    };
  }, []);
  return null;
}
