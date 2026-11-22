(() => {
  'use strict';
  const container = document.getElementById('project-navigation');
  const labels = ['Compositional vision', 'Cloud infrastructure', 'DRM-YOLO', 'Water quality'];
  const projects = window.PORTFOLIO.projects;
  const links = projects.map((project, index) => {
    const link = document.createElement('a');
    link.href = `#${project.id}`;
    link.textContent = labels[index] || project.heading;
    link.setAttribute('aria-label', `Read ${project.heading}`);
    container.append(link);
    return link;
  });
  const sections = projects.map(project => document.getElementById(project.id));
  const details = document.querySelector('.case-studies');
  let scheduled = false;
  function updateCurrent() {
    scheduled = false;
    const bounds = details.getBoundingClientRect();
    const withinDetails = bounds.top <= 32 && bounds.bottom > innerHeight * 0.5;
    container.dataset.visible = String(withinDetails);
    const offset = container.getBoundingClientRect().height + 50;
    const current = sections.findLast(section => section.getBoundingClientRect().top <= offset) || sections[0];
    links.forEach((link, index) => {
      if (withinDetails && sections[index] === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateCurrent);
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  const resizeObserver = new ResizeObserver(() => {
    document.documentElement.style.setProperty('--project-nav-height', `${container.getBoundingClientRect().height}px`);
    scheduleUpdate();
  });
  resizeObserver.observe(container);
  // Native anchors preserve deep links and browser history. Focus follows the destination.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const destination = sections.find(section => `#${section.id}` === link.getAttribute('href'));
    if (destination) destination.focus({ preventScroll: true });
  });
  updateCurrent();
})();
