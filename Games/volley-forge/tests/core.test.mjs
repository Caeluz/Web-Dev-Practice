import test from "node:test";
import assert from "node:assert/strict";

import {
  BALL_DEFINITIONS,
  CONTENT_UNLOCKS,
  ENCOUNTERS,
  PASSIVE_DEFINITIONS,
  STARTER_UNLOCKS,
} from "../src/data.mjs";
import {
  allBallsSpent,
  applyDraftChoice,
  calculateForgeReward,
  createDraft,
  createDevTestBlocks,
  createDevTestRunState,
  createEncounterBlocks,
  createRunState,
  createSeededRandom,
  createSlagBlock,
  DEV_TEST_PRESETS,
  descendBlocks,
  grantXp,
  hasCrossedDangerLine,
  markBallSpent,
  refreshArsenal,
  replaceBall,
  xpToNext,
} from "../src/core.mjs";
import {
  circleRectCollision,
  clampAimAngle,
  getHorizontalLaserTargets,
  hasFlightEnded,
  reflectedVelocity,
  resolveImpact,
} from "../src/combat.mjs";
import {
  SAVE_KEY,
  createDefaultMeta,
  loadMeta,
  purchaseUnlock,
  saveMeta,
  sanitizeMeta,
} from "../src/storage.mjs";

test("XP overflow creates sequential draft choices", () => {
  const run = createRunState(1);
  assert.equal(xpToNext(1), 6);
  assert.equal(grantXp(run, 20), 2);
  assert.equal(run.level, 3);
  assert.equal(run.pendingDrafts, 2);
  assert.equal(run.xp, 4);
});

test("drafts are unique and only contain unlocked eligible cards", () => {
  const run = createRunState(2);
  run.passives.tempered = PASSIVE_DEFINITIONS.tempered.maxRank;
  const unlocked = [
    "ball.iron",
    "ball.ember",
    "ball.hammer",
    "passive.tempered",
    "passive.banked",
    "passive.surveyor",
  ];
  const draft = createDraft(run, unlocked, createSeededRandom(10), 3);
  assert.equal(draft.length, 3);
  assert.equal(new Set(draft.map((choice) => `${choice.kind}.${choice.id}`)).size, 3);
  assert.ok(draft.every((choice) => choice.id !== "iron" && choice.id !== "tempered"));
});

test("passives stop at rank three", () => {
  const run = createRunState(3);
  const choice = { kind: "passive", id: "banked" };
  assert.equal(applyDraftChoice(run, choice).applied, true);
  assert.equal(applyDraftChoice(run, choice).applied, true);
  assert.equal(applyDraftChoice(run, choice).applied, true);
  assert.deepEqual(applyDraftChoice(run, choice), { applied: false, reason: "max_rank" });
  assert.equal(run.passives.banked, 3);
});

test("ball cards fill four slots and then require explicit replacement", () => {
  const run = createRunState(4);
  for (const id of ["ember", "hammer", "drill"]) {
    assert.equal(applyDraftChoice(run, { kind: "ball", id }).applied, true);
  }
  assert.equal(run.arsenal.length, 4);
  assert.equal(applyDraftChoice(run, { kind: "ball", id: "storm" }).requiresReplacement, true);
  assert.equal(replaceBall(run, 1, "storm"), true);
  assert.deepEqual(run.arsenal.map((ball) => ball.typeId), ["iron", "storm", "hammer", "drill"]);
});

test("a turn exhausts each ball once and refreshes exactly once", () => {
  const run = createRunState(5);
  applyDraftChoice(run, { kind: "ball", id: "ember" });
  const [first, second] = run.arsenal;
  assert.equal(markBallSpent(run, first.instanceId), true);
  assert.equal(markBallSpent(run, first.instanceId), false);
  assert.equal(allBallsSpent(run), false);
  assert.equal(markBallSpent(run, second.instanceId), true);
  assert.equal(allBallsSpent(run), true);
  refreshArsenal(run);
  assert.equal(run.turn, 2);
  assert.ok(run.arsenal.every((ball) => !ball.spent));
});

test("authored encounters include special blocks and the multi-cell boss", () => {
  assert.equal(ENCOUNTERS.length, 7);
  const shieldEncounter = createEncounterBlocks(2);
  assert.ok(shieldEncounter.some((block) => block.kind === "shielded" && block.shield === 1));
  const volatileEncounter = createEncounterBlocks(3);
  assert.ok(volatileEncounter.some((block) => block.kind === "volatile"));
  const boss = createEncounterBlocks(6).find((block) => block.kind === "boss");
  assert.deepEqual({ width: boss.widthCells, height: boss.heightCells, hp: boss.hp }, { width: 4, height: 2, hp: 42 });
});

test("Dev Lab presets are deterministic and unknown presets fall back to a row", () => {
  assert.deepEqual(Object.keys(DEV_TEST_PRESETS), ["single", "row", "shields", "volatile", "mixed", "boss"]);

  const single = createDevTestBlocks("single");
  assert.deepEqual({ count: single.length, hp: single[0].hp, kind: single[0].kind }, { count: 1, hp: 10, kind: "normal" });

  const row = createDevTestBlocks("row");
  assert.equal(row.length, 8);
  assert.ok(row.every((block) => block.hp === 3 && block.kind === "normal"));

  const shields = createDevTestBlocks("shields");
  assert.equal(shields.length, 8);
  assert.ok(shields.every((block) => block.shield === 1 && block.kind === "shielded"));

  const volatile = createDevTestBlocks("volatile");
  assert.equal(volatile.length, 4);
  assert.ok(volatile.every((block) => block.kind === "volatile" && block.hp === 2));

  const mixed = createDevTestBlocks("mixed");
  assert.deepEqual(new Set(mixed.map((block) => block.kind)), new Set(["normal", "shielded", "volatile"]));

  const boss = createDevTestBlocks("boss");
  assert.deepEqual({ count: boss.length, width: boss[0].widthCells, height: boss[0].heightCells, hp: boss[0].hp }, {
    count: 1,
    width: 4,
    height: 2,
    hp: 42,
  });

  assert.deepEqual(createDevTestBlocks("unknown").map((block) => block.kind), row.map((block) => block.kind));
});

test("Dev test state accepts locked balls without changing normal run state", () => {
  const normalRun = createRunState(20);
  assert.equal("devTest" in normalRun, false);

  const devRun = createDevTestRunState("linebreaker", { tempered: 9, surveyor: 2, unknown: 3 });
  assert.equal(devRun.devTest, true);
  assert.deepEqual(devRun.arsenal.map((ball) => ball.typeId), ["linebreaker"]);
  assert.deepEqual(devRun.passives, { tempered: 3, surveyor: 2 });
});

test("descent triggers the danger line and boss slag uses an open column", () => {
  const blocks = [{ id: "test", alive: true, row: 9, visualRow: 9, column: 0, widthCells: 1, heightCells: 1 }];
  assert.equal(hasCrossedDangerLine(blocks, 10), false);
  descendBlocks(blocks);
  assert.equal(hasCrossedDangerLine(blocks, 10), true);

  const slag = createSlagBlock([{ ...blocks[0], row: 0, column: 0 }], 4, () => 0);
  assert.equal(slag.kind, "slag");
  assert.equal(slag.column, 1);
  assert.equal(slag.hp, 2);
});

test("aiming and collision helpers constrain and reflect shots", () => {
  assert.ok(clampAimAngle(0) < 0);
  assert.ok(clampAimAngle(-Math.PI * 2) > -Math.PI);
  const collision = circleRectCollision(
    { x: 8, y: 20, radius: 10 },
    { x: 15, y: 10, width: 20, height: 20 },
  );
  assert.ok(collision);
  assert.ok(collision.nx < 0);
  const reflected = reflectedVelocity(100, 0, collision);
  assert.ok(reflected.vx < 0);
});

test("Linebreaker is a Forge unlock and not a starter ball", () => {
  assert.deepEqual(
    {
      damage: BALL_DEFINITIONS.linebreaker.damage,
      speed: BALL_DEFINITIONS.linebreaker.speed,
      radius: BALL_DEFINITIONS.linebreaker.radius,
      ability: BALL_DEFINITIONS.linebreaker.ability,
    },
    { damage: 1, speed: 600, radius: 10, ability: "horizontal_laser" },
  );
  assert.equal(STARTER_UNLOCKS.includes("ball.linebreaker"), false);
  assert.deepEqual(CONTENT_UNLOCKS.find((unlock) => unlock.id === "ball.linebreaker"), {
    id: "ball.linebreaker",
    kind: "ball",
    contentId: "linebreaker",
    price: 36,
  });
});

test("Linebreaker targets every living block crossing its impact row once", () => {
  const origin = { id: "origin", alive: true, row: 2, heightCells: 1 };
  const targets = getHorizontalLaserTargets([
    origin,
    { id: "same-row", alive: true, row: 2, heightCells: 1 },
    { id: "gap-row", alive: true, row: 2, heightCells: 1, column: 6 },
    { id: "dead-row", alive: false, row: 2, heightCells: 1 },
    { id: "multi-row", alive: true, row: 1, heightCells: 3 },
    { id: "other-row", alive: true, row: 4, heightCells: 1 },
  ], origin);
  assert.deepEqual(targets.map((block) => block.id), ["same-row", "gap-row", "multi-row"]);
});

test("all six ball abilities and passive damage modifiers resolve correctly", () => {
  const iron = {
    typeId: "iron", hits: 0, bankedCharge: 2, isFinal: true,
    emberTriggered: false, penetrationsRemaining: 0,
  };
  assert.equal(resolveImpact(iron, { tempered: 1, overcharged: 3 }).damage, 7);
  assert.equal(iron.bankedCharge, 0);

  const ember = {
    typeId: "ember", hits: 0, bankedCharge: 0, isFinal: false,
    emberTriggered: false, penetrationsRemaining: 0,
  };
  assert.equal(resolveImpact(ember).emberBurst, true);
  assert.equal(resolveImpact(ember).emberBurst, false);

  const hammer = {
    typeId: "hammer", hits: 0, bankedCharge: 0, isFinal: false,
    emberTriggered: false, penetrationsRemaining: 0,
  };
  assert.equal(resolveImpact(hammer).damage, BALL_DEFINITIONS.hammer.damage);

  const drill = {
    typeId: "drill", hits: 0, bankedCharge: 0, isFinal: false,
    emberTriggered: false, penetrationsRemaining: 2,
  };
  assert.equal(resolveImpact(drill).penetrates, true);
  assert.equal(resolveImpact(drill).penetrates, true);
  assert.equal(resolveImpact(drill).penetrates, false);

  const storm = {
    typeId: "storm", hits: 0, bankedCharge: 0, isFinal: false,
    emberTriggered: false, penetrationsRemaining: 0,
  };
  assert.equal(resolveImpact(storm).stormChain, false);
  assert.equal(resolveImpact(storm).stormChain, false);
  assert.equal(resolveImpact(storm).stormChain, true);

  const linebreaker = {
    typeId: "linebreaker", hits: 0, bankedCharge: 0, isFinal: false,
    emberTriggered: false, lineTriggered: false, penetrationsRemaining: 0,
  };
  assert.equal(resolveImpact(linebreaker).lineBurst, true);
  assert.equal(resolveImpact(linebreaker).lineBurst, false);
});

test("flight ends at the bottom or safety timeout", () => {
  assert.equal(hasFlightEnded({ y: 970, radius: 10, elapsed: 1 }, 950, 12), true);
  assert.equal(hasFlightEnded({ y: 500, radius: 10, elapsed: 12 }, 950, 12), true);
  assert.equal(hasFlightEnded({ y: 500, radius: 10, elapsed: 3 }, 950, 12), false);
});

test("meta storage sanitizes corruption and persists unlock-only progress", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.deepEqual(sanitizeMeta({ version: 999, forgeShards: 999 }), createDefaultMeta());

  const meta = createDefaultMeta();
  meta.forgeShards = 50;
  assert.equal(purchaseUnlock(meta, "ball.drill").purchased, true);
  assert.equal(meta.forgeShards, 22);
  meta.forgeShards = 36;
  assert.equal(purchaseUnlock(meta, "ball.linebreaker").purchased, true);
  assert.equal(meta.forgeShards, 0);
  assert.equal(saveMeta(meta, storage), true);
  assert.equal(values.has(SAVE_KEY), true);
  const loaded = loadMeta(storage);
  assert.ok(loaded.unlockedIds.includes("ball.drill"));
  assert.ok(loaded.unlockedIds.includes("ball.linebreaker"));
  assert.equal(loaded.forgeShards, 0);

  const freshRun = createRunState(9);
  assert.deepEqual(freshRun.arsenal.map((ball) => ball.typeId), ["iron"]);
  assert.deepEqual(freshRun.passives, {});
});

test("forge rewards account for progress, score, and victory without changing run power", () => {
  const run = createRunState(10);
  run.encountersCleared = 4;
  run.score = 2500;
  assert.equal(calculateForgeReward(run, false), 10);
  assert.equal(calculateForgeReward(run, true), 25);
});
