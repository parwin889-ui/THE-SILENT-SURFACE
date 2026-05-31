import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { siteConfig } from './config';
import Hero from './sections/Hero';
import Manifesto from './sections/Manifesto';
import Facilities from './sections/Facilities';
import Observation from './sections/Observation';
import Game from './sections/Game';
import Archives from './sections/Archives';
import Footer from './sections/Footer';
import FacilityDetail from './pages/FacilityDetail';

function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }, [hash]);

  return (
    <>
      <main>
        <Hero />
        <Manifesto />
        <Facilities />
        <Observation />
        <Game />
        <Archives />
      </main>
      <Footer />
    </>
  );
}

function App() {
  useEffect(() => {
    document.title = siteConfig.siteTitle || '6 Ascii Moon Frontend Template';
    document.documentElement.lang = siteConfig.language || '';

    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = siteConfig.siteDescription || '';
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/facility/:slug" element={<FacilityDetail />} />
    </Routes>
  );
}

export default App;
