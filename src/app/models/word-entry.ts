export interface WordEntry {
  word: string;
  count: number;
  firstAddedAt: number; // time stamp for later sorting
  lastSeenAt: number;
  sentence?: string;
  definition?: string; // future usage
}
