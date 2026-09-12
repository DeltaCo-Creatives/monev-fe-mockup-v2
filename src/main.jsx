import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import App from './App.jsx'
import './index.css'

// Register the useGSAP hook globally
gsap.registerPlugin(useGSAP);

// Global GSAP performance config
// force3D: always use translate3d() — forces GPU compositing on every transform
gsap.config({ force3D: true });
gsap.defaults({ ease: 'power2.out', duration: 0.4 });

// Ticker optimizations for low-powered / mobile devices:
// - Run at 30fps instead of 60fps: halves JS thread usage from animation ticks
// - lagSmoothing: if a frame is late by >500ms, GSAP skips forward instead of
//   trying to "catch up" (which would flood the thread with extra work)
gsap.ticker.fps(30);
gsap.ticker.lagSmoothing(500, 33);

createRoot(document.getElementById('root')).render(
  // Note: StrictMode removed — it intentionally double-renders in dev which
  // creates a fake 2x overhead. Real phones would not experience this.
  // Add it back before production deployment to catch bugs.
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
