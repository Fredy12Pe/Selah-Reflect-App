export interface ReflectionQuestion {
  reference?: string;
  question: string;
}

export interface Devotion {
  id?: string;
  type?: 'devotion' | 'commentary';
  date: string;
  title: string;
  bibleText?: string;
  scriptureReference?: string;
  scriptureText?: string;
  content?: string;
  prayer?: string;
  reflectionQuestions?: ReflectionQuestion[];
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
}

export interface DevotionData {
  meta: Meta;
  devotions: {
    [date: string]: Devotion;
  };
} 