export interface ChapterMappingItem {
  folder: string;
  id: string;
  index: number;
  title: string;
  defaultVietTitle: string;
}

export declare const CHAPTER_MAPPING: ChapterMappingItem[];
export declare function naturalSort(a: string, b: string): number;
export declare function syncGallery(): Promise<any>;
