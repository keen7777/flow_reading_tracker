export interface WordEntry {
  original: string; //new adding 
  normalized: string; // used to be word
  count: number;
  firstAddedAt: number; // time stamp for later sorting
  lastSeenAt: number;
  sentence?: string;
  definition?: string; // future usage
  isSaved: boolean;     // 永久
}
