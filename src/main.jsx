import React from 'react';
import { createRoot } from 'react-dom/client';
import Navigation from './Navigation.jsx';
import RevealEffects from './RevealEffects.jsx';
import './navigation.css';

function mountNavigation() {
  const mount = document.getElementById('unified-navigation');
  if (mount && window.PORTFOLIO) createRoot(mount).render(<><Navigation projects={window.PORTFOLIO.projects} /><RevealEffects /></>);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountNavigation, { once: true });
else mountNavigation();
