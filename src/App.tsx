import React, { useEffect, useRef } from 'react';
import { useWeddingStore } from './app/store';
import { ProjectHome } from './pages/ProjectHome';
import { StagePlayer } from './components/player/StagePlayer';

function readViewModeFromUrl(): 'home' | 'player' {
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  return hash === '#stage' || hash === '#player' || params.get('mode') === 'stage'
    ? 'player'
    : 'home';
}

export const App: React.FC = () => {
  const routeInitialized = useRef(false);
  const viewMode = useWeddingStore((s) => s.viewMode);
  const setViewMode = useWeddingStore((s) => s.setViewMode);
  const initStore = useWeddingStore((s) => s.initStore);

  // Initialize store and sync hash routes
  useEffect(() => {
    void initStore();

    const handleHash = () => {
      setViewMode(readViewModeFromUrl());
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [initStore, setViewMode]);

  // Keep hash synced with viewMode
  useEffect(() => {
    // Apply the initial URL before writing the store's default home route.
    if (!routeInitialized.current) {
      if (viewMode !== readViewModeFromUrl()) return;
      routeInitialized.current = true;
    }
    if (viewMode === 'player' && window.location.hash !== '#stage') {
      window.location.hash = '#stage';
    } else if (viewMode === 'home' && window.location.hash !== '#home') {
      window.location.hash = '#home';
    }
  }, [viewMode]);

  return (
    <div className="w-full min-h-screen bg-[#FFF9F2] text-[#40322F]">
      {/* Main View Mode Switcher */}
      {viewMode === 'home' && <ProjectHome />}
      {viewMode === 'player' && <StagePlayer />}
    </div>
  );
};

export default App;
