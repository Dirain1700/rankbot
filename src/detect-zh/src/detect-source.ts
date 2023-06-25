"use strict";

import type { LangDetectionResult } from "../types/detect";

export class detectChineseStatic {
    /**
     * Start of auto-generated lines
     * Do not touch strings that surrounded by []
     */
    static readonly chineseUnicode: string = "[CHINESE_REGXEP]";
    static readonly japaneseUnicode: string = "[JAPANESE_REGEXP]";
    /**
     * End of auto-generated lines
     */

    static readonly hiraganaUnicode: string = "[\u3040-\u309F]";
    static readonly katakanaUnicode: string = "[\u30A0-\u30FF]";

    static readonly chineseRegExp: RegExp = new RegExp(this.chineseUnicode, "gimu");
    static readonly japaneseRegExp: RegExp = new RegExp(
        this.japaneseUnicode + "|" + this.hiraganaUnicode + "|" + this.katakanaUnicode,
        "gimu"
    );

    static hasChineseCharacters(text: string): boolean {
        return this.chineseRegExp.test(text);
    }

    static hasJapaneseCharacters(text: string): boolean {
        return this.japaneseRegExp.test(text);
    }

    static isChineseSentence(text: string): boolean {
        return this.hasChineseCharacters(text) && !this.hasJapaneseCharacters(text);
    }

    static isJapaneseSentence(text: string): boolean {
        return this.hasJapaneseCharacters(text) && !this.hasChineseCharacters(text);
    }

    static getChineseCharacters(text: string): string[] {
        return text.match(this.chineseRegExp) ?? [];
    }

    static getJapaneseCharacters(text: string): string[] {
        return text.match(this.japaneseRegExp) ?? [];
    }

    static match(text: string): LangDetectionResult {
        const result: LangDetectionResult = {
            lang: "JA",
            text,
            japaneseStrings: [],
            chineseStrings: [],
            otherStrings: [],
        };

        const jaMatch = this.getJapaneseCharacters(text);
        result.japaneseStrings = jaMatch;
        if (jaMatch.length) {
            for (const str of jaMatch) {
                text = text.replace(str, "");
            }
        }
        const zhMatch = this.getChineseCharacters(text);
        result.chineseStrings = zhMatch;
        if (zhMatch.length) {
            result.lang = "ZH";
            for (const str of zhMatch) {
                text = text.replace(str, "");
            }
        }
        result.otherStrings = text.split("");
        result.lang = jaMatch.length ? "JA" : zhMatch.length ? "ZH" : "";

        return result;
    }
}

export class detectChinese {
    /**
     * Start of auto-generated lines
     * Do not touch strings that surrounded by {}
     */
    readonly chineseUnicode: string = "[CHINESE_REGXEP]";
    readonly japaneseUnicode: string = "[JAPANESE_REGEXP]";
    /**
     * End of auto-generated lines
     */

    readonly hiraganaUnicode: string = "[\u3040-\u309F]";
    readonly katakanaUnicode: string = "[\u30A0-\u30FF]";

    readonly chineseRegExp: RegExp = new RegExp(this.chineseUnicode, "gimu");
    readonly japaneseRegExp: RegExp = new RegExp(this.japaneseUnicode + "|" + this.hiraganaUnicode + "|" + this.katakanaUnicode, "gimu");

    hasChineseCharacters: boolean;
    hasJapaneseCharacters: boolean;
    isChineseSentence: boolean;
    isJapaneseSentence: boolean;
    chineseCharacters: string[];
    japaneseCharacters: string[];
    result: LangDetectionResult;

    constructor(text: string) {
        const result: LangDetectionResult = {
            lang: "JA",
            text,
            japaneseStrings: [],
            chineseStrings: [],
            otherStrings: [],
        };

        const jaMatch = text.match(this.japaneseUnicode) ?? [];
        result.japaneseStrings = jaMatch;
        if (jaMatch.length) {
            for (const str of jaMatch) {
                text = text.replace(str, "");
            }
        }
        const zhMatch = text.match(this.chineseUnicode) ?? [];
        result.chineseStrings = zhMatch;
        if (zhMatch.length) {
            result.lang = "ZH";
            for (const str of zhMatch) {
                text = text.replace(str, "");
            }
        }
        result.otherStrings = text.split("");
        result.lang = jaMatch.length ? "JA" : zhMatch.length ? "ZH" : "";

        this.hasChineseCharacters = !!result.chineseStrings.length;
        this.hasJapaneseCharacters = !!result.japaneseStrings.length;
        this.isChineseSentence = result.lang === "ZH";
        this.isJapaneseSentence = result.lang === "JA";
        this.chineseCharacters = result.chineseStrings;
        this.japaneseCharacters = result.japaneseStrings;
        this.result = result;
    }
}
