// Safeguard against read-only window.fetch getter in sandboxed iframe environments
(function ensureFetchWritable() {
  try {
    if (typeof window !== 'undefined') {
      let _fetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : window.fetch;
      const defineGS = (target: any, prop: string, enumerable = true) => {
        try {
          Object.defineProperty(target, prop, {
            get: () => _fetch,
            set: (fn: any) => { _fetch = fn; },
            configurable: true,
            enumerable,
          });
        } catch {}
      };

      defineGS(window, 'fetch', true);

      let curr: any = window;
      while (curr) {
        try {
          const desc = Object.getOwnPropertyDescriptor(curr, 'fetch');
          if (desc) {
            defineGS(curr, 'fetch', desc.enumerable !== false);
          }
        } catch {}
        curr = Object.getPrototypeOf(curr);
      }

      if ((window as any).Window && (window as any).Window.prototype) {
        defineGS((window as any).Window.prototype, 'fetch', true);
      }
    }
  } catch {}
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="Sistem Don Isko 711">
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

