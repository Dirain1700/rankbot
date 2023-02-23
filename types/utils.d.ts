/* eslint-disable @typescript-eslint/no-explicit-any */
export type Weaken<T, K extends keyof T> = {
    [P in keyof T]: P extends K ? any : T[P];
};

export type Dict<T> = Record<string, T>;

export type arrayOf<T extends Readonly<any[]>> = T[number];
/* eslint-enable */
