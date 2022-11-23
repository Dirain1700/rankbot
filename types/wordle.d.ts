export interface StoredWordleDataType {
    answer: string;
    pl: [string, WordlePlayer][];
    endedPl: string[];
    correctedPl: [string, EndedPlData][];
    eliminatedPl: [string, EndedPlData][];
}

export type GuessType = [string, "T" | "F" | "P"][];

export interface WordlePlayer {
    html: string;
    round: number; // 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export interface EndedPlData extends WordlePlayer {
    name: string;
}
