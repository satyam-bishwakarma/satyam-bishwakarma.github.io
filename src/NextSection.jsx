import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './next-section.css';

export default function NextSection({ projects }) {
  const [destination, setDestination] = useState(null);
  useEffect(() => {
    const stops = [
      { id: 'work', label: 'Project overview', shortLabel: 'Overview' },
      ...projects.map(project => ({ id: project.id, label: project.heading, shortLabel: project.navLabel || project.heading })),
      { id: 'about', label: 'About & background', shortLabel: 'About' },
      { id: 'connect', label: 'Contact & CV', shortLabel: 'Contact' }
    ];
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = document.querySelector('.site-header').getBoundingClientRect().height;
      const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
      const next = atEnd ? undefined : stops.find(stop => document.getElementById(stop.id).getBoundingClientRect().top > header + 40);
      setDestination(previous => previous?.id === next?.id ? previous : next || null);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    const headerElement = document.querySelector('.site-header');
    const headerObserver = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--header-height', `${headerElement.getBoundingClientRect().height}px`);
      schedule();
    });
    headerObserver.observe(headerElement);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
      headerObserver.disconnect();
    };
  }, [projects]);

  const host = document.getElementById('continue-navigation');
  if (!host) return null;
  return createPortal(<div className="continue-inner">{destination ? <a className="next-section" href={`#${destination.id}`} aria-label={`Next: ${destination.label}`} title={`Next: ${destination.label}`} onClick={event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(destination.id);
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
  }}>
    <span><span className="next-section__caption">Next</span><span className="next-section__label">{destination.shortLabel}</span><span className="next-section__compact">{destination.shortLabel}</span></span>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
  </a> : <span className="continue-complete">You’ve reached the end</span>}</div>, host);
}
