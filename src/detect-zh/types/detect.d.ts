export type LangType = "ZH" | "JA" | "";

export interface LangDetectionResult {
    lang: LangType;
    text: string;
    chineseStrings: string[];
    japaneseStrings: string[];
    otherStrings: string[];
}
