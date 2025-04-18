export interface ReflectionQuestion {
  reference: string;
  question: string;
}

export interface Devotion {
  type: "devotion" | "commentary";
  title?: string;
  bibleText: string;
  content?: string;
  reflectionQuestions: ReflectionQuestion[];
}

export interface DevotionInput extends Devotion {
  date: string;
}

export interface Hymn {
  hymnTitle: string;
  author: string;
  composer: string;
  lyrics: string;
}

export interface Meta {
  hymns: {
    [month: string]: Hymn;
  };
}

export interface DevotionData {
  meta: Meta;
  devotions: {
    [date: string]: Devotion;
  };
} 