import { useEffect } from 'react';
import { gsap } from 'gsap';

// Native scrolling first; settle only near a measured, fully-read project boundary.
export default function ProjectTransitions() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(pointer: fine)');
    const sections = [...document.querySelectorAll('.case-study')];
    let pull = null;
    let timer = 0;
    let direction = 0;
    const enabled = () => fine.matches && !reduced.matches && root.dataset.motion !== 'off';
    const cancel = () => {
      clearTimeout(timer);
      pull?.kill();
      pull = null;
      delete root.dataset.projectPull;
    };
    const settle = () => {
      if (!enabled()) return;
      const y = scrollY;
      const header = document.querySelector('.site-header').getBoundingClientRect().height;
      const reach = Math.min(160, innerHeight * 0.2);
      let destination = null;
      for (let index = 1; index < sections.length; index++) {
        const previous = sections[index - 1];
        const next = sections[index];
        const contentBottom = Math.max(...[...previous.children].map(child => child.getBoundingClientRect().bottom + y));
        const readEnd = Math.max(0, contentBottom - innerHeight + 32);
        const nextStart = Math.max(0, next.getBoundingClientRect().top + y - header - 24);
        if (direction > 0 && y >= readEnd && nextStart > y && nextStart - y <= reach && y >= (readEnd + nextStart) / 2) destination = nextStart;
        if (direction < 0 && y > readEnd && y - readEnd <= reach && y <= nextStart) destination = readEnd;
        if (destination !== null) break;
      }
      if (destination === null || Math.abs(destination - y) < 3) return;
      const position = { y };
      root.dataset.projectPull = 'active';
      pull = gsap.to(position, {
        y: destination, duration: 0.35 + Math.abs(destination - y) / 600, ease: 'power2.out',
        onUpdate: () => window.scrollTo({ top: position.y, behavior: 'instant' }),
        onComplete: cancel
      });
    };
    const wheel = event => {
      cancel();
      if (!enabled() || event.ctrlKey || event.shiftKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.target.closest('input,textarea,select,[contenteditable="true"],.unified-nav')) return;
      direction = Math.sign(event.deltaY);
      timer = setTimeout(settle, 160);
    };
    const settingsChanged = () => { if (!enabled()) cancel(); };
    const settings = new MutationObserver(settingsChanged);
    settings.observe(root, { attributes: true, attributeFilter: ['data-motion'] });
    window.addEventListener('wheel', wheel, { passive: true });
    const interrupts = ['pointerdown', 'touchstart', 'keydown', 'hashchange', 'resize', 'blur'];
    interrupts.forEach(type => window.addEventListener(type, cancel, { passive: true }));
    reduced.addEventListener('change', settingsChanged);
    fine.addEventListener('change', settingsChanged);
    return () => {
      cancel();
      settings.disconnect();
      window.removeEventListener('wheel', wheel);
      interrupts.forEach(type => window.removeEventListener(type, cancel));
      reduced.removeEventListener('change', settingsChanged);
      fine.removeEventListener('change', settingsChanged);
    };
  }, []);
  return null;
}
