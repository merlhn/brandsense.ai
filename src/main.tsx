import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { Toaster } from './components/ui/sonner'

// 🔥 FORCE DARK MODE - Nuclear option to override ALL styles
const forceStyles = () => {
  // Method 1: Inject ultra-high-priority stylesheet
  const style = document.createElement('style');
  style.id = 'force-dark-mode-nuclear';
  style.textContent = `
    /* Ultra-high priority - overrides everything */
    html {
      background: #000000 !important;
      background-color: #000000 !important;
      color: #EDEDED !important;
    }
    body {
      background: #000000 !important;
      background-color: #000000 !important;
      color: #EDEDED !important;
      margin: 0 !important;
      padding: 0 !important;
      min-height: 100vh !important;
    }
    #root {
      background: #000000 !important;
      background-color: #000000 !important;
      color: #EDEDED !important;
      min-height: 100vh !important;
    }
    /* Override all white backgrounds */
    * {
      box-sizing: border-box;
    }
    div[style*="background: white"],
    div[style*="background:white"],
    div[style*="background-color: white"],
    div[style*="background-color:white"],
    div[style*="background: #fff"],
    div[style*="background-color: #fff"] {
      background: #000000 !important;
      background-color: #000000 !important;
    }
  `;
  
  // Insert at the END of head (highest priority)
  document.head.appendChild(style);
  
  // Method 2: Direct inline style manipulation
  const setDarkStyles = () => {
    document.documentElement.setAttribute('style', 'background-color: #000000 !important; color: #EDEDED !important;');
    document.body.setAttribute('style', 'background-color: #000000 !important; color: #EDEDED !important; margin: 0; padding: 0; min-height: 100vh;');
    
    const root = document.getElementById('root');
    if (root) {
      root.setAttribute('style', 'background-color: #000000 !important; color: #EDEDED !important; min-height: 100vh;');
    }
  };
  
  setDarkStyles();
  
  // Re-apply on DOM changes (in case something tries to override)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const target = mutation.target as HTMLElement;
        if (target === document.documentElement || target === document.body) {
          setDarkStyles();
        }
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
  observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
};

// Execute immediately
forceStyles();

// DEBUG: Check if CSS is loading
console.log('🔍 Checking CSS loading...');
console.log('HTML background:', window.getComputedStyle(document.documentElement).backgroundColor);
console.log('CSS variable --background:', window.getComputedStyle(document.documentElement).getPropertyValue('--background'));

// Wait for CSS to load, then re-check
setTimeout(() => {
  console.log('🔍 After 100ms:');
  console.log('HTML background:', window.getComputedStyle(document.documentElement).backgroundColor);
  console.log('Body background:', window.getComputedStyle(document.body).backgroundColor);
  console.log('CSS variable --background:', window.getComputedStyle(document.documentElement).getPropertyValue('--background'));
}, 100);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>,
)
