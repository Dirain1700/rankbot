import type { AxiosResponse } from "axios";

/*
import type { GaxiosResponse, GaxiosError } from "gaxios";

declare module "googleapis-common" {
    export interface Endpoint {
        comments: {
            analyze: (
                params: { key: string; resource: IAnalyzeRequestBody },
                callback: (err: null | GaxiosError, response: IGAxiosAnalyzeResponse) => void
            ) => Promise<unknown>;
        };
    }
}

export interface IGAxiosAnalyzeResponse extends GaxiosResponse {
    data: IAnalyzeResponseData;
}

export interface IGAxiosSuggestResponse extends GaxiosResponse {
    data: ISuggestResponseData;
}
*/

export interface IAxiosAnalyzeResponse extends AxiosResponse {
    data: IAnalyzeResponseData;
}

export interface IAxiosSuggestResponse extends AxiosResponse {
    data: ISuggestResponseData;
}

export interface IAnalyzeResponseData {
    attributeScores: {
        [key in keyof IATTRIBUTES]: IAttractiveScore;
    };
    languages: string[];
    detectedLanguages: string[];
}

export interface ISuggestResponseData {
    clientToken: string;
}

export interface IAttractiveScore {
    spanScores: {
        begin: number;
        end: number;
        score: IAttractiveScore;
    }[];
    summaryScore: IAttractiveScore;
}

export interface IAttractiveSummaryScore {
    value: number;
    type: "PROBABILITY";
}

export interface IAnalyzeRequestBody {
    languages?: string[];
    requestedAttributes: IATTRIBUTES;
    comment: { text: string };
    clientToken: string;
}

export interface ISuggestRequestBody {
    languages?: string[];
    attributeScores: {
        [key in keyof IATTRIBUTES]: IAttractiveScore;
    };
    comment: { text: string };
    clientToken: string;
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface IATTRIBUTES {
    SEVERE_TOXICITY: {};
    TOXICITY: {};
    IDENTITY_ATTACK: {};
    INSULT: {};
    PROFANITY: {};
    THREAT: {};
    SEXUALLY_EXPLICIT?: {};
    FLIRTATION?: {};
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export {};
