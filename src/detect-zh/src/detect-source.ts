"use strict";

import type { LangDetectionResult } from "../types/detect";

/**
 * Start of auto-generated lines
 * Do not touch strings that surrounded by {}
 */
const zhUnicodes = "[{ZH_REGEXP}]";
const jaUnicodes = "[{JA_REGEXP}\u3040-\u309F\u30A0-\u30FF]";
/**
 * End of auto-generated lines
 */

const zhRegExp = new RegExp(zhUnicodes, "gimu");
const jaRegExp = new RegExp(jaUnicodes, "gimu");

export class detectChineseStatic {
    static hasChineseCharacters(text: string): boolean {
        return zhRegExp.test(text);
    }

    static hasJapaneseCharacters(text: string): boolean {
        return jaRegExp.test(text);
    }

    static isChineseSentence(text: string): boolean {
        return this.hasChineseCharacters(text) && !this.hasJapaneseCharacters(text);
    }

    static isJapaneseSentence(text: string): boolean {
        return this.hasJapaneseCharacters(text);
    }

    static getChineseCharacters(text: string): string[] {
        return text.split("").filter((e) => zhRegExp.test(e));
    }

    static getJapaneseCharacters(text: string): string[] {
        return text.split("").filter((e) => jaRegExp.test(e));
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

        const jaMatch = text.split("").filter((e) => jaRegExp.test(e));
        result.japaneseStrings = jaMatch;
        if (jaMatch.length) {
            for (const str of jaMatch) {
                text = text.replace(str, "");
            }
        }
        const zhMatch = text.split("").filter((e) => zhRegExp.test(e));
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
