declare module 'latex-to-omml' {
  interface ConvertOptions {
    displayMode?: boolean;
  }
  export function latexToOMML(latex: string, options?: ConvertOptions): Promise<string>;
}
