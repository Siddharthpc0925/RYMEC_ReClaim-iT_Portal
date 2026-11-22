import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { RoundGlassAuth } from './components/auth/RoundGlassAuth';
import { AboutCollege } from './components/public/AboutCollege';
import { CampusMapSvg } from './components/campus/CampusMapSvg';

import { Home } from './pages/Home';
import { ReportLost } from './pages/ReportLost';
import { ReportFound } from './pages/ReportFound';
import { ItemDetail } from './pages/ItemDetail';
import { MyItems } from './pages/MyItems';
import { Handover } from './pages/Handover';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminPosters } from './pages/AdminPosters';
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

  const [pathname, searchStr] = currentPath.split('?');
  const searchParams = new URLSearchParams(searchStr || '');

  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') {
      setAuthOpen(true);
    }
  }, [pathname]);

  let pageContent: React.ReactNode = null;

  if (pathname === '/' || pathname === '/browse') {
    pageContent = <Home navigate={navigate} />;
  } else if (pathname === '/report-lost') {
    pageContent = <ReportLost navigate={navigate} />;
  } else if (pathname === '/report-found') {
    pageContent = <ReportFound navigate={navigate} />;
  } else if (pathname === '/report') {
    const t = searchParams.get('type');
    if (t === 'FOUND') {
      pageContent = <ReportFound navigate={navigate} />;
    } else {
      pageContent = <ReportLost navigate={navigate} />;
    }
  } else if (pathname.startsWith('/items/')) {
    const id = pathname.replace('/items/', '');
    pageContent = <ItemDetail itemId={id} navigate={navigate} />;
  } else if (pathname === '/my-items' || pathname === '/dashboard') {
    if (!user) {
      pageContent = (
        <div className="page-wrap text-center py-16">
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to view your items</h2>
          <p className="text-slate-400 mb-6">Manage your reports, view pending claims, and verify handovers.</p>
          <button className="button button-primary" onClick={() => setAuthOpen(true)}>
            Sign in / Register
          </button>
        </div>
      );
    } else {
      pageContent = <MyItems navigate={navigate} />;
    }
  } else if (pathname === '/handover') {
    pageContent = <Handover navigate={navigate} />;
  } else if (pathname === '/hotspots') {
    pageContent = <Home navigate={navigate} />;
  } else if (pathname === '/about') {
    pageContent = <AboutCollege />;
  } else if (pathname === '/certificate') {
    pageContent = <Certificate navigate={navigate} />;
  } else if (pathname === '/admin') {
    pageContent = <AdminDashboard navigate={navigate} />;
  } else if (pathname === '/admin/posters') {
    pageContent = <AdminPosters navigate={navigate} />;
  } else {
    pageContent = <NotFound navigate={navigate} />;
  }

  return (
    <div className="app-shell">
      {/* ── Reference 250px Sticky Sidebar Navigation ── */}
      <Sidebar
        currentPath={pathname}
        navigate={navigate}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* ── Main Scrollable Content Area ── */}
      <main className="main-content" id="main-content">
        {pageContent}

        {/* ── Institutional Footer ── */}
        <Footer navigate={navigate} />
      </main>

      {/* ── Modal for RYMEC Mail ID Auth & OTP ── */}
      <RoundGlassAuth
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
};

export default App;
