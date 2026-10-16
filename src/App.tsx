import React, { useEffect } from 'react';
import { useWeddingStore } from './app/store';
import { ProjectHome } from './pages/ProjectHome';
import { StagePlayer } from './components/player/StagePlayer';

export const App: React.FC = () => {
  const viewMode = useWeddingStore((s) => s.viewMode);
  const setViewMode = useWeddingStore((s) => s.setViewMode);
  const initStore = useWeddingStore((s) => s.initStore);

  // Initialize store and sync hash routes
  useEffect(() => {
    void initStore();

    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === '#stage' || hash === '#player' || params.get('mode') === 'stage') {
        setViewMode('player');
      } else {
        setViewMode('home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [initStore, setViewMode]);

  // Keep hash synced with viewMode
  useEffect(() => {
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
