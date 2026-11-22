(() => {
  'use strict';
  const container = document.getElementById('project-navigation');
  const labels = ['Compositional vision', 'Cloud infrastructure', 'DRM-YOLO', 'Water quality'];
  const compactLabels = ['Vision', 'Cloud', 'DRM-YOLO', 'Water'];
  const projects = window.PORTFOLIO.projects;
  const links = projects.map((project, index) => {
    const link = document.createElement('a');
    link.href = `#${project.id}`;
    const fullLabel = document.createElement('span');
    fullLabel.className = 'project-label-full';
    fullLabel.textContent = labels[index] || project.heading;
    const compactLabel = document.createElement('span');
    compactLabel.className = 'project-label-compact';
    compactLabel.textContent = compactLabels[index] || project.heading;
    link.append(fullLabel, compactLabel);
    link.setAttribute('aria-label', `Read ${project.heading}`);
    container.append(link);
    return link;
  });
  const sections = projects.map(project => document.getElementById(project.id));
  const region = document.getElementById('work-region');
  const overview = document.getElementById('work');
  const overviewLink = container.querySelector('a[href="#work"]');
  const mainLinks = [...document.querySelectorAll('.site-header nav a')];
  const mainSections = mainLinks.map(link => link.getAttribute('href') === '#work' ? region : document.querySelector(link.getAttribute('href')));
  let scheduled = false;
  function updateCurrent() {
    scheduled = false;
    const bounds = region.getBoundingClientRect();
    const headerHeight = document.querySelector('.site-header').getBoundingClientRect().height;
    const withinWork = bounds.bottom > headerHeight + container.getBoundingClientRect().height;
    container.dataset.visible = String(withinWork);
    const offset = headerHeight + container.getBoundingClientRect().height + 50;
    const current = sections.findLast(section => section.getBoundingClientRect().top <= offset);
    if (withinWork && !current) overviewLink.setAttribute('aria-current', 'location');
    else overviewLink.removeAttribute('aria-current');
    links.forEach((link, index) => {
      if (withinWork && sections[index] === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const mainCurrent = mainSections.findLast(section => section.getBoundingClientRect().top <= headerHeight + 40);
    mainLinks.forEach((link, index) => {
      if (mainSections[index] === mainCurrent) link.setAttribute('aria-current', 'location');
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
  resizeObserver.observe(document.querySelector('.site-header'));
  // Native anchors preserve deep links and browser history. Focus follows the destination.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const destination = [overview, ...sections].find(section => `#${section.id}` === link.getAttribute('href'));
    if (destination) destination.focus({ preventScroll: true });
  });
  updateCurrent();
})();
