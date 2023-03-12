"use strict";

import { Tools as PSTools } from "@dirain/client";

export class Tools extends PSTools {
    static override toString(input: unknown, nest?: number): string {
        if (!input) {
            if (arguments.length === 0) return super.toString();
            if (input === null) return "null";
            if (input === undefined) return "undefined";
        }
        nest ??= 0;
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
                    return "[" + input.map(this.toString).join(", ") + "]";
                }
                if (nest > 0) {
                    if (input.constructor?.name && input.constructor.name !== "Object") {
                        return "[class " + input.constructor.name + "]";
                    } else if (Reflect.ownKeys(JSON).every((key) => key in input)) {
                        return "[object JSON]";
                    } else if (Reflect.ownKeys(Math).every((key) => key in input)) {
                        return "[object Math]";
                    } else if (Reflect.ownKeys(Atomics).every((key) => key in input)) {
                        return "[object Atomics]";
                    } else if (Reflect.ownKeys(Reflect).every((key) => key in input)) {
                        return "[object Reflect]";
                    } else if (Reflect.ownKeys(Intl).every((key) => key in input)) {
                        return "[object Intl]";
                    } else if (Reflect.ownKeys(WebAssembly).every((key) => key in input)) {
                        return "[object WebAssembly]";
                    } else if (nest > 2) {
                        return "[object Object]";
                    }
                }
                const props: [string, string][] = [];
                for (const [k, v] of Object.entries(input)) {
                    if (k.toString().startsWith(input.constructor.name || "constructor")) continue;
                    props.push([this.toString(k, nest + 1), this.toString(v, nest + 1)]);
                }
                const stringProps = props.map(([k, v]) => k + ": " + v).join(", ");
                if (input.constructor?.name && input.constructor.name !== "Object") {
                    if (stringProps.length) return "{ " + stringProps + " }";
                    else return input.constructor.name + " {}";
                } else if (stringProps.length) return "{ " + stringProps + " }";
                else return "{}";
            }
            default:
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                throw new Error("Type " + (inputType as any as never) + " does not satisfy any types");
        }
    }
}
