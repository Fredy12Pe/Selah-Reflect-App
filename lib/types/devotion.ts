export interface ReflectionSection {
  passage: string;
  questions: string[];
}

export interface Devotion {
  id?: string;
  date: string;
  bibleText: string;
  reflectionSections: ReflectionSection[];
}

export interface DevotionInput extends Omit<Devotion, 'id'> {
  date: string;
}

export interface Hymn {
  title: string;
  lyrics: string[];
  author?: string;
  year?: number;
}

export interface Meta {
  lastUpdated: string;
  totalDevotions: number;
  currentHymn: Hymn;
}

export interface DevotionData {
  meta: Meta;
  devotions: {
    [date: string]: Devotion;
  };
} 