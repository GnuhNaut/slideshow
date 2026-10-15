import Dexie, { Table } from 'dexie';
import { WeddingProject } from '../types/project';

export interface StoredMedia {
  id: string;
  projectId: string;
  dataUrl?: string;
  blob?: Blob;
  mimeType: string;
  filename: string;
  originalWidth: number;
  originalHeight: number;
  thumbnail?: string;
  createdAt: number;
}

export interface StoredAudio {
  id: string;
  projectId: string;
  blob?: Blob;
  dataUrl?: string;
  name: string;
  mimeType: string;
  duration: number;
  createdAt: number;
}

export class WeddingFilmDatabase extends Dexie {
  projects!: Table<WeddingProject, string>;
  media!: Table<StoredMedia, string>;
  audio!: Table<StoredAudio, string>;

  constructor() {
    super('WeddingFilmStoryDB');
    this.version(1).stores({
      projects: 'id, updatedAt',
      media: 'id, projectId, createdAt',
      audio: 'id, projectId, createdAt',
    });
  }
}

export const db = new WeddingFilmDatabase();
