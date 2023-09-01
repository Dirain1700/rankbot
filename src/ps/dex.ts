"use strict";

import { Collection } from "@discordjs/collection";

import type { Species } from "../../types/dex";

export class Dex extends Collection<string, Species> {
    override get(name: string): Species | undefined {
        return super.get(Tools.toId(name));
    }

    override has(name: string): boolean {
        return super.has(Tools.toId(name));
    }

    override set(name: string, user: Species): this {
        super.set(Tools.toId(name), user);
        return this;
    }

    override delete(name: string): boolean {
        return super.delete(Tools.toId(name));
    }
}
