(() => {
  'use strict';
  const data = window.PORTFOLIO;
  const paths = {
    github: 'M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.69.12 2.98.72.79 1.15 1.79 1.15 3.02 0 4.32-2.63 5.27-5.14 5.55.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z',
    twitter: 'M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-7.4L5.6 22H2.4l7.18-8.2L1.2 2h6.4l4.42 6.76L18.9 2Zm-1.1 18h1.73L6.65 3.88H4.8L17.8 20Z',
    linkedin: 'M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42ZM19 18.75h-2.95V14.1c0-1.1-.02-2.52-1.54-2.52-1.53 0-1.77 1.2-1.77 2.44v4.73H9.8V9.2h2.83v1.3h.04c.4-.75 1.36-1.54 2.79-1.54 2.98 0 3.54 1.96 3.54 4.51v5.28Z',
    cv: 'M5 2h9l5 5v15H5V2Zm2 2v16h10V8h-4V4H7Zm8 .8V6h1.2L15 4.8ZM9 11h6v2H9v-2Zm0 4h6v2H9v-2Z'
  };
  const labels = { github: 'GitHub', twitter: 'X / Twitter', linkedin: 'LinkedIn', cv: 'CV' };
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const safeUrl = value => {
    if (typeof value !== 'string') return null;
    try { const url = new URL(value, document.baseURI); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
  };
  function socialLinks(container) {
    Object.entries(labels).forEach(([key, label]) => {
      const url = safeUrl(data.socials[key]);
      const link = element(url ? 'a' : 'span', 'social-link');
      link.setAttribute('aria-label', url ? label : `${label} — link coming soon`);
      link.title = url ? label : `${label} — link coming soon`;
      if (url) { link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      else link.setAttribute('aria-disabled', 'true');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', paths[key]); svg.append(path);
      link.append(svg, element('span', 'social-label', url ? label : `${label} · soon`)); container.append(link);
    });
  }
  function projectImage(project) {
    const img = element('img'); img.src = project.image; img.alt = project.alt; img.width = 640; img.height = 360;
    return img;
  }
  data.projects.forEach(project => {
    const card = element('a', 'project-card'); card.href = `#${project.id}`;
    const preview = element('div', 'project-preview'); preview.append(projectImage(project), element('span', 'preview-caption', 'Illustrative preview'));
    const copy = element('div', 'card-copy'); copy.append(element('p', 'category', project.category), element('h3', '', project.title), element('p', '', project.short), element('span', 'read-case', 'Read the project'));
    card.append(preview, copy); document.getElementById('project-grid').append(card);
    const section = element('article', 'case-study'); section.id = project.id;
    const description = element('div'); description.append(element('p', 'category', project.status), element('h3', '', project.heading), element('p', '', project.description));
    [['My contribution', project.contribution], ['Evidence & limitations', project.evidence]].forEach(([label, text]) => { const p = element('p'); p.append(element('span', 'detail-label', label), document.createTextNode(text)); description.append(p); });
    const tags = element('div', 'tags'); project.tags.forEach(tag => tags.append(element('span', '', tag))); description.append(tags);
    const url = safeUrl(project.url); if (url) { const repo = element('a', 'repo-link', 'Explore the repository'); repo.href = url; repo.target = '_blank'; repo.rel = 'noopener noreferrer'; description.append(repo); }
    const figure = element('figure', 'project-figure'); const image = projectImage(project); image.loading = 'lazy'; figure.append(image, element('figcaption', '', 'Representative illustration · replace with an actual project screenshot or research figure.'));
    section.append(description, figure); document.getElementById('project-details').append(section);
  });
  socialLinks(document.getElementById('hero-socials')); socialLinks(document.getElementById('footer-socials'));
  const root = document.documentElement;
  const themeButton = document.getElementById('theme');
  const media = matchMedia('(prefers-color-scheme: dark)');
  function updateThemeLabel() { const dark = root.dataset.theme ? root.dataset.theme === 'dark' : media.matches; themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`); document.querySelector('meta[name="theme-color"]').content = dark ? '#14151a' : '#f6f7fa'; }
  themeButton.addEventListener('click', () => { const dark = root.dataset.theme ? root.dataset.theme === 'dark' : media.matches; root.dataset.theme = dark ? 'light' : 'dark'; try { localStorage.setItem('portfolio-theme', root.dataset.theme); } catch {} updateThemeLabel(); });
  media.addEventListener('change', updateThemeLabel); updateThemeLabel();
  const motionButton = document.getElementById('motion');
  const reducedMotionMedia = matchMedia('(prefers-reduced-motion: reduce)');
  function updateMotionLabel() {
    const systemPaused = reducedMotionMedia.matches;
    const paused = systemPaused || root.dataset.motion === 'off';
    motionButton.disabled = systemPaused;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.title = systemPaused ? 'Reduced motion (system)' : paused ? 'Resume background motion' : 'Pause background motion';
    motionButton.setAttribute('aria-label', motionButton.title);
    motionButton.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
  }
  reducedMotionMedia.addEventListener('change', updateMotionLabel);
  motionButton.addEventListener('click', () => { root.dataset.motion = root.dataset.motion === 'off' ? 'on' : 'off'; try { localStorage.setItem('portfolio-motion', root.dataset.motion); } catch {} updateMotionLabel(); }); updateMotionLabel();
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
