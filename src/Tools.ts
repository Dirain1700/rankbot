"use strict";

import { inspect } from "node:util";

import { Tools as PSTools } from "@dirain/client";

export class Tools extends PSTools {
    static override toString(input: unknown, depth?: number): string {
        if (!input) {
            if (arguments.length === 0) return super.toString();
            if (input === null) return "null";
            if (input === undefined) return "undefined";
        }
        depth ??= 0;
        const inputType = typeof input;
        switch (typeof input) {
            case "undefined": {
                return "undefined";
            }
            case "string": {
                // eslint-disable-next-line quotes
                if (!input) return '""';
                else return input;
            }
            case "number":
            case "symbol":
            case "boolean": {
                return input.toString();
            }
            case "bigint": {
                return input.toString() + "n";
            }
            case "function": {
                let type = input.toString().split(" ")[0];
                if (!type || type.endsWith(")") || type.endsWith(",")) type = "function";
                const { name } = input;
                if (type === "function") return "[" + type + " " + (name || "anonymous") + "]";
                return "[" + type + " " + (name || "anonymous") + "]";
            }
            case "object": {
                if (input === null) return "null";
                if (input === undefined) return "undefined";
                if (Array.isArray(input)) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return "[" + input.map((e) => this.toString(e, depth! + 1)).join(", ") + "]";
                }
                return Tools.trim(inspect(input, { depth: depth ?? 1 }).replaceAll("\n", ""));
            }
            default:
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                throw new Error("Type " + (inputType as any as never) + " does not satisfy any types");
        }
    }
}
