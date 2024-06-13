"use strict";

import axios from "axios";

import type {
    IATTRIBUTES,
    IAnalyzeRequestBody,
    IAttractiveScore,
    IAxiosAnalyzeResponse,
    IAxiosSuggestResponse,
    ISuggestRequestBody,
} from "../../../types/perspective";

const DISCOVERY_URL = "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=";
const ATTRIBUTES: IATTRIBUTES = {
    SEVERE_TOXICITY: {},
    TOXICITY: {},
    IDENTITY_ATTACK: {},
    INSULT: {},
    PROFANITY: {},
    THREAT: {},
    // SEXUALLY_EXPLICIT: {},
    // FLIRTATION: {},
} as const;

export async function analyzeComment(comment: string): Promise<IAxiosAnalyzeResponse["data"]> {
    const analyzeRequestBody: IAnalyzeRequestBody = {
        requestedAttributes: ATTRIBUTES,
        comment: { text: comment },
        clientToken: Config.PerspectiveAPIKey,
    };

    return axios
        .post(`${DISCOVERY_URL}${Config.PerspectiveAPIKey}`, analyzeRequestBody, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response: IAxiosAnalyzeResponse) => response.data);
}

export function suggestScores(comment: string, scores: { [key in keyof IATTRIBUTES]: IAttractiveScore }): Promise<boolean> {
    return axios
        .post(
            `${DISCOVERY_URL}${Config.PerspectiveAPIKey}`,
            {
                attributeScores: scores,
                comment: { text: comment },
                clientToken: Config.PerspectiveAPIKey,
            } as ISuggestRequestBody,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )
        .then((res: IAxiosSuggestResponse) => {
            if (res.status === 200) return true;
            else return false;
        })
        .catch(() => false);
}
