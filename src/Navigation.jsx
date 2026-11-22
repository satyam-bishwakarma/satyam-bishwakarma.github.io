import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

const PROJECT_LABELS = {
  'compositional-vision': 'Compositional vision',
  'image-infrastructure': 'Cloud infrastructure',
  'drm-yolo': 'DRM-YOLO',
  'water-quality': 'Water quality'
};
const ITEMS = [{ id: 'work', label: 'Projects' }, { id: 'about', label: 'About' }, { id: 'connect', label: 'Connect' }];

export default function Navigation({ projects }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState({ section: 'work', project: null });
  const [indicator, setIndicator] = useState(0);
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const linkRefs = useRef({});

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const headerHeight = document.querySelector('.site-header').getBoundingClientRect().height;
      const offset = headerHeight + 40;
      const section = ITEMS.findLast(item => document.getElementById(item.id).getBoundingClientRect().top <= offset)?.id || 'work';
      const project = section === 'work' ? projects.findLast(item => document.getElementById(item.id).getBoundingClientRect().top <= offset)?.id || null : null;
      setCurrent(previous => previous.section === section && previous.project === project ? previous : { section, project });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    update();
    const initialTarget = document.getElementById(location.hash.slice(1));
    if (initialTarget && location.hash) initialTarget.scrollIntoView();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, [projects]);

  useLayoutEffect(() => {
    const measure = () => {
      const link = linkRefs.current[current.section];
      if (link) setIndicator(link.offsetLeft + link.offsetWidth / 2);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [current.section]);

  useEffect(() => {
    if (!open) return undefined;
    const dismiss = event => { if (!navRef.current.contains(event.target)) setOpen(false); };
    const escape = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        toggleRef.current.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  function navigate(event) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    setOpen(false);
    const destination = document.getElementById(event.currentTarget.hash.slice(1));
    if (destination) {
      if (!destination.hasAttribute('tabindex')) destination.tabIndex = -1;
      destination.focus({ preventScroll: true });
    }
  }

  return (
    <nav ref={navRef} className="unified-nav" aria-label="Main navigation" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <div className="unified-nav__track">
        {ITEMS.map(item => (
          item.id === 'work' ? (
            <button key={item.id} ref={node => { toggleRef.current = node; linkRefs.current.work = node; }} type="button"
              className="unified-nav__link unified-nav__projects" aria-label="Projects"
              aria-current={current.section === 'work' ? 'location' : undefined}
              aria-expanded={open} aria-controls="project-menu" onClick={() => setOpen(value => !value)}>
              <span className="unified-nav__face">Projects</span><span className="unified-nav__face-alt" aria-hidden="true">Projects</span>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
            </button>
          ) : (
            <a key={item.id} ref={node => { linkRefs.current[item.id] = node; }} href={`#${item.id}`} className="unified-nav__link"
              aria-label={item.label} aria-current={current.section === item.id ? 'location' : undefined} onClick={navigate}>
              <span className="unified-nav__face">{item.label}</span><span className="unified-nav__face-alt" aria-hidden="true">{item.label}</span>
            </a>
          )
        ))}
        <span className="unified-nav__dot" aria-hidden="true" style={{ left: indicator }} />
      </div>
      {open && <div id="project-menu" className="unified-nav__menu" aria-label="Projects">
        <p className="unified-nav__caption">Research &amp; engineering</p>
        <a href="#work" onClick={navigate} aria-current={current.section === 'work' && !current.project ? 'location' : undefined} aria-label="Overview">Overview<span>All projects</span></a>
        {projects.map(project => <a key={project.id} href={`#${project.id}`} aria-label={`Read ${project.heading}`}
          aria-current={current.project === project.id ? 'location' : undefined} onClick={navigate}>
          {PROJECT_LABELS[project.id] || project.heading}<span>{project.category}</span>
        </a>)}
      </div>}
    </nav>
  );
}
