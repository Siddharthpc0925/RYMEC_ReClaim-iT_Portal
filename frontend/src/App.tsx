import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { LiquidBottomNav } from './components/layout/LiquidBottomNav';
import { Footer } from './components/layout/Footer';
import { FloatingParticles } from './components/3d/FloatingParticles';
import { LiquidBackground } from './components/layout/LiquidBackground';
import { RoundGlassAuth } from './components/auth/RoundGlassAuth';
import { AboutCollege } from './components/public/AboutCollege';
import { CampusMapSvg } from './components/campus/CampusMapSvg';

import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { Report } from './pages/Report';
import { ItemDetail } from './pages/ItemDetail';
import { Handover } from './pages/Handover';
import { Dashboard } from './pages/Dashboard';
import { NearLocation } from './pages/NearLocation';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminPosters } from './pages/AdminPosters';
import { Leaderboard } from './pages/Leaderboard';
import { Certificate } from './pages/Certificate';
import { NotFound } from './pages/NotFound';
import { api } from './lib/api';
import { Location } from './types';
import { MapPin, Navigation } from 'lucide-react';

export const App: React.FC = () => {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname + window.location.search || '/';
  });

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    api.getLocations().then((res) => {
      setLocations(res.locations || []);
    }).catch(console.error);
  }, []);

  // Parse path and query params
  const [pathname, searchStr] = currentPath.split('?');
  const searchParams = new URLSearchParams(searchStr || '');

  // Map path to active tab for Navbar highlighting
  let currentTab = 'home';
  if (pathname === '/report') currentTab = 'report';
  else if (pathname === '/browse' || pathname.startsWith('/items/')) currentTab = 'browse';
  else if (pathname === '/hotspots' || pathname.startsWith('/near/')) currentTab = 'hotspots';
  else if (pathname === '/handover') currentTab = 'handover';
  else if (pathname === '/about') currentTab = 'about';
  else if (pathname === '/dashboard') currentTab = 'dashboard';
  else if (pathname.startsWith('/admin')) currentTab = 'admin';

  const handleTabChange = (tab: string) => {
    if (tab === 'home') navigate('/');
    else if (tab === 'report') navigate('/report');
    else if (tab === 'browse') navigate('/browse');
    else if (tab === 'hotspots') navigate('/hotspots');
    else if (tab === 'handover') navigate('/handover');
    else if (tab === 'about') navigate('/about');
    else if (tab === 'dashboard') {
      if (!user) {
        setAuthOpen(true);
      } else {
        navigate('/dashboard');
      }
    } else if (tab === 'admin') {
      if (!user || user.role !== 'ADMIN') {
        setAuthOpen(true);
      } else {
        navigate('/admin');
      }
    } else {
      navigate('/' + tab);
    }
  };

  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') {
      setAuthOpen(true);
    }
  }, [pathname]);

  let pageContent: React.ReactNode = null;

  if (pathname === '/') {
    pageContent = <Home navigate={navigate} />;
  } else if (pathname === '/browse') {
    pageContent = <Browse navigate={navigate} initialSearch={searchParams.get('search') || ''} />;
  } else if (pathname === '/report') {
    pageContent = (
      <Report
        navigate={navigate}
        defaultType={(searchParams.get('type') as any) || 'LOST'}
        defaultLocationSlug={searchParams.get('locationSlug') || ''}
      />
    );
  } else if (pathname.startsWith('/items/')) {
    const id = pathname.replace('/items/', '');
    pageContent = <ItemDetail itemId={id} navigate={navigate} />;
  } else if (pathname.startsWith('/near/')) {
    const slug = pathname.replace('/near/', '');
    pageContent = <NearLocation slug={slug} navigate={navigate} />;
  } else if (pathname === '/handover') {
    pageContent = <Handover navigate={navigate} />;
  } else if (pathname === '/hotspots') {
    pageContent = (
      <div className="space-y-8 pb-16">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Interactive Campus Grid</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            RYMEC Campus Zones & Drop Desks
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Click on any campus building or security kiosk to see all recovered items held at that location.
          </p>
        </div>

        <CampusMapSvg
          locations={locations}
          onSelectLocation={(loc) => navigate(`/near/${loc.slug}`)}
          isHeatmap={true}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => navigate(`/near/${loc.slug}`)}
              className="ios-glass-card p-5 rounded-2xl cursor-pointer hover:border-sky-400/50 transition-all flex items-center justify-between group"
            >
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                  {loc.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Zone: {loc.parent_zone || 'Campus Core'}
                </p>
              </div>
              <Navigation className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          ))}
        </div>
      </div>
    );
  } else if (pathname === '/about') {
    pageContent = <AboutCollege />;
  } else if (pathname === '/dashboard') {
    pageContent = <Dashboard navigate={navigate} />;
  } else if (pathname === '/certificate') {
    pageContent = <Certificate navigate={navigate} />;
  } else if (pathname === '/admin') {
    pageContent = <AdminDashboard navigate={navigate} />;
  } else if (pathname === '/admin/posters') {
    pageContent = <AdminPosters navigate={navigate} />;
  } else if (pathname === '/login' || pathname === '/register') {
    pageContent = <Home navigate={navigate} />;
  } else {
    pageContent = <NotFound navigate={navigate} />;
  }

  return (
    <div className="relative min-h-screen flex flex-col font-sans selection:bg-brand-royal selection:text-white bg-navy-950 text-slate-100">
      {/* 3D Ambient Aurora Particles */}
      <FloatingParticles />

      {/* Liquid Glass Background */}
      <LiquidBackground />

      {/* Sticky Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full relative z-10 pb-24 lg:pb-12">
        {pathname === '/' ? (
          pageContent
        ) : (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
            {pageContent}
          </div>
        )}
      </main>

      {/* Liquid Glass Bottom Nav Bar (Mobile iOS Style) */}
      <LiquidBottomNav
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* Round Glass Login / Register Modal with 1-Click Quick Demo Access */}
      <RoundGlassAuth
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />

      {/* Comprehensive Institutional Footer */}
      <Footer navigate={navigate} />
    </div>
  );
};

export default App;