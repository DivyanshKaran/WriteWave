declare module 'bad-words' {
  export default class Filter {
    constructor(options?: {
      list?: string[];
      exclude?: string[];
      splitRegex?: RegExp;
      placeHolder?: string;
      regex?: RegExp;
      replaceRegex?: RegExp;
    });
    
    isProfane(text: string): boolean;
    clean(text: string): string;
    addWords(...words: string[]): void;
    removeWords(...words: string[]): void;
  }
}
