"use strict";

import * as assert from "node:assert";

import { Tools } from "../../index";

import { createTestRoom, createTestUser } from "../test-tools";

import type { Room } from "../../index";

describe("Client", function () {
    describe("Tournament", function () {
        const mocha1 = createTestUser({ name: "mocha 1" });
        const mocha2 = createTestUser({ name: "mocha 2" });
        global.Users.set("mocha1", mocha1);
        global.Users.set("mocha2", mocha2);
        const mochaRoom: Room = createTestRoom({ users: [" mocha 1", " mocha 2"] });
        global.Rooms.set("mocha", mochaRoom);
        it("Should create tournament properly", function () {
            assert.ok(global.Users.get("mocha1"));
            assert.ok(global.Users.get("mocha2"));
            assert.strictEqual(mochaRoom.tour, null);
            assert.ok(global.Rooms.get("mocha"));
            assert.strictEqual(global.Rooms.get("mocha")?.userCollection?.size, 2);
            void client.parseMessage("|tournament|create|gen8randombattle|Single Elimination|128", mochaRoom);
            mochaRoom.update();
            assert.ok(mochaRoom.tour);
            // @ts-expect-error avoiding never
            assert.strictEqual(Tools.toId(mochaRoom.tour.format as string), "gen8randombattle");
            // @ts-expect-error avoiding never
            assert.strictEqual(mochaRoom.tour.playerCap, 128);
            // @ts-expect-error avoiding never
            assert.ok(mochaRoom.tour.isSingleElimination);
            // @ts-expect-error avoiding never
            assert.ok(!mochaRoom.tour.started);
        });
    });
});
