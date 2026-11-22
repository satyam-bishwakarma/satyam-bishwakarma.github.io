import { useEffect } from 'react';
import { gsap } from 'gsap';

// Progressive enhancement: content is readable before, during and without motion.
export default function RevealEffects() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const active = new Map();
    const allowed = () => !reduced.matches && root.dataset.motion !== 'off';
    const clear = target => gsap.set(target, { clearProps: 'transform,filter,opacity' });
    const stop = () => {
      if (allowed()) return;
      active.forEach((target, tween) => { tween.kill(); clear(target); });
      active.clear();
    };
    const settleDestination = () => {
      active.forEach((target, tween) => {
        if (!target.closest('.case-study:target')) return;
        tween.kill();
        clear(target);
        active.delete(tween);
      });
    };
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => {
        const target = entry.target;
        observer.unobserve(target);
        if (!allowed() || target.closest('.case-study:target')) return;
        const figure = target.matches('.project-figure, .research-visual, .project-preview');
        const order = [...target.parentElement.children].indexOf(target);
        const tween = gsap.fromTo(target,
          { y: figure ? 20 : 14, opacity: figure ? 0.7 : 0.85, filter: figure ? 'blur(2px)' : 'blur(0px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: figure ? 0.7 : 0.55,
            delay: Math.min(order * 0.06, 0.12), ease: 'power3.out',
            onComplete: () => { active.delete(tween); clear(target); } });
        active.set(tween, target);
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.intro-copy, .research-visual, .card-copy, .project-preview, .case-study>div, .project-figure, .about-intro>div, .about-foundations>div, .toolkit>div, .connect').forEach(target => observer.observe(target));
    reduced.addEventListener('change', stop);
    window.addEventListener('hashchange', settleDestination);
    const settingsObserver = new MutationObserver(stop);
    settingsObserver.observe(root, { attributes: true, attributeFilter: ['data-motion'] });
    return () => {
      observer.disconnect();
      settingsObserver.disconnect();
      reduced.removeEventListener('change', stop);
      window.removeEventListener('hashchange', settleDestination);
      active.forEach((target, tween) => { tween.kill(); clear(target); });
      active.clear();
    };
  }, []);
  return null;
}
