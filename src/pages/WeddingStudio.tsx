import React, { useState } from 'react';
import { StudioHeader } from '../components/studio/StudioHeader';
import { ChapterSidebar } from '../components/studio/ChapterSidebar';
import { PreviewCanvas } from '../components/studio/PreviewCanvas';
import { TimelineBar } from '../components/studio/TimelineBar';
import { MediaLibrary } from '../components/studio/MediaLibrary';
import { InspectorPanel } from '../components/studio/InspectorPanel';
import { ProjectSettingsModal } from '../components/studio/ProjectSettingsModal';
import { usePlaybackController } from '../player/usePlaybackController';

interface WeddingStudioProps {
  onExportZip: () => void;
  onImportZip: () => void;
}

export const WeddingStudio: React.FC<WeddingStudioProps> = ({
  onExportZip,
  onImportZip,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Run the playback engine loop in studio preview mode
  usePlaybackController(false);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#151114] text-[#FFF4E4] overflow-hidden select-none">
      {/* Studio Top Navigation Bar */}
      <StudioHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportZip={onExportZip}
        onImportZip={onImportZip}
      />

      {/* Main Workspace 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: 7 Chapters Navigation */}
        <ChapterSidebar />

        {/* Center: Live 16:9 Preview Monitor + Timeline Scrubber + Media Library */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top: 16:9 Preview Canvas */}
          <PreviewCanvas />

          {/* Middle: Timeline Ruler and Playhead */}
          <TimelineBar />

          {/* Bottom: Photos Strip / Media Library */}
          <MediaLibrary />
        </div>

        {/* Right: Inspector for Chapter & Selected Photo Properties */}
        <InspectorPanel />
      </div>

      {/* Project Settings Modal */}
      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
