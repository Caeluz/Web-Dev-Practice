import {
  BALL_DEFINITIONS,
  BLOCK_TYPES,
  ENCOUNTERS,
  PASSIVE_DEFINITIONS,
  STARTER_UNLOCKS,
} from "./data.mjs";

export const PHASES = Object.freeze({
  AIMING: "AIMING",
  BALL_IN_FLIGHT: "BALL_IN_FLIGHT",
  TURN_RESOLUTION: "TURN_RESOLUTION",
  CARD_DRAFT: "CARD_DRAFT",
  ENCOUNTER_CLEAR: "ENCOUNTER_CLEAR",
  RUN_OVER: "RUN_OVER",
});

export function createSeededRandom(seed = Date.now()) {
  let value = Math.abs(Math.trunc(seed)) || 1;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function xpToNext(level) {
  return 6 + 4 * Math.max(0, level - 1);
}

export function createRunState(seed = Date.now()) {
  return {
    phase: PHASES.AIMING,
    seed,
    encounterIndex: 0,
    encountersCleared: 0,
    turn: 1,
    level: 1,
    xp: 0,
    pendingDrafts: 0,
    arsenal: [{ instanceId: 1, typeId: "iron", spent: false }],
    nextBallInstanceId: 2,
    passives: {},
    score: 0,
    damageDealt: 0,
    blocksDestroyed: 0,
  };
}

export function createDevTestRunState(ballId = "iron", passiveRanks = {}) {
  const selectedBallId = BALL_DEFINITIONS[ballId] ? ballId : "iron";
  const run = createRunState(1);
  run.devTest = true;
  run.arsenal = [{ instanceId: 1, typeId: selectedBallId, spent: false }];
  run.nextBallInstanceId = 2;
  run.passives = Object.fromEntries(
    Object.entries(passiveRanks)
      .filter(([id, rank]) => PASSIVE_DEFINITIONS[id] && Number(rank) > 0)
      .map(([id, rank]) => [
        id,
        Math.min(PASSIVE_DEFINITIONS[id].maxRank, Math.trunc(Number(rank))),
      ])
      .filter(([, rank]) => rank > 0),
  );
  return run;
}

export function grantXp(run, amount) {
  run.xp += Math.max(0, amount);
  let levelsGained = 0;
  while (run.xp >= xpToNext(run.level)) {
    run.xp -= xpToNext(run.level);
    run.level += 1;
    run.pendingDrafts += 1;
    levelsGained += 1;
  }
  return levelsGained;
}

export function refreshArsenal(run) {
  for (const ball of run.arsenal) ball.spent = false;
  run.turn += 1;
}

export function allBallsSpent(run) {
  return run.arsenal.every((ball) => ball.spent);
}

export function unspentBallCount(run) {
  return run.arsenal.filter((ball) => !ball.spent).length;
}

export function markBallSpent(run, instanceId) {
  const ball = run.arsenal.find((entry) => entry.instanceId === instanceId);
  if (!ball || ball.spent) return false;
  ball.spent = true;
  return true;
}

export function buildDraftPool(run, unlockedIds) {
  const unlocked = new Set(unlockedIds);
  const equipped = new Set(run.arsenal.map((ball) => ball.typeId));
  const pool = [];

  for (const definition of Object.values(BALL_DEFINITIONS)) {
    if (unlocked.has(`ball.${definition.id}`) && !equipped.has(definition.id)) {
      pool.push({ kind: "ball", id: definition.id, definition });
    }
  }

  for (const definition of Object.values(PASSIVE_DEFINITIONS)) {
    const rank = run.passives[definition.id] ?? 0;
    if (unlocked.has(`passive.${definition.id}`) && rank < definition.maxRank) {
      pool.push({ kind: "passive", id: definition.id, definition, rank });
    }
  }

  return pool;
}

export function createDraft(run, unlockedIds, random = Math.random, count = 3) {
  const pool = [...buildDraftPool(run, unlockedIds)];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export function applyDraftChoice(run, choice) {
  if (choice.kind === "passive") {
    const definition = PASSIVE_DEFINITIONS[choice.id];
    if (!definition) return { applied: false, reason: "unknown" };
    const currentRank = run.passives[choice.id] ?? 0;
    if (currentRank >= definition.maxRank)
      return { applied: false, reason: "max_rank" };
    run.passives[choice.id] = currentRank + 1;
    return { applied: true, requiresReplacement: false };
  }

  if (choice.kind === "ball" && BALL_DEFINITIONS[choice.id]) {
    if (run.arsenal.some((ball) => ball.typeId === choice.id)) {
      return { applied: false, reason: "already_equipped" };
    }
    if (run.arsenal.length >= 4) {
      return { applied: false, requiresReplacement: true };
    }
    run.arsenal.push({
      instanceId: run.nextBallInstanceId,
      typeId: choice.id,
      spent: false,
    });
    run.nextBallInstanceId += 1;
    return { applied: true, requiresReplacement: false };
  }

  return { applied: false, reason: "unknown" };
}

export function replaceBall(run, slotIndex, typeId) {
  if (
    !BALL_DEFINITIONS[typeId] ||
    slotIndex < 0 ||
    slotIndex >= run.arsenal.length
  )
    return false;
  if (
    run.arsenal.some(
      (ball, index) => index !== slotIndex && ball.typeId === typeId,
    )
  )
    return false;
  run.arsenal[slotIndex] = {
    instanceId: run.nextBallInstanceId,
    typeId,
    spent: false,
  };
  run.nextBallInstanceId += 1;
  return true;
}

function parseCell(cell, row, column, encounterId, nextId) {
  if (cell === ".") return null;
  if (cell === "W") {
    return {
      id: `${encounterId}-${nextId}`,
      kind: "boss",
      row,
      visualRow: row,
      column,
      widthCells: 4,
      heightCells: 2,
      hp: 42,
      maxHp: 42,
      shield: 0,
      alive: true,
    };
  }

  const kind = cell === "S" ? "shielded" : cell === "V" ? "volatile" : "normal";
  const hp = cell === "S" || cell === "V" ? 2 : Number(cell);
  return {
    id: `${encounterId}-${nextId}`,
    kind,
    row,
    visualRow: row,
    column,
    widthCells: 1,
    heightCells: 1,
    hp,
    maxHp: hp,
    shield: cell === "S" ? 1 : 0,
    alive: true,
  };
}

const row = (...cells) => cells;

export const DEV_TEST_PRESETS = Object.freeze({
  single: {
    name: "Single Block",
    grid: [row(".", ".", ".", "10", ".", ".", ".", ".")],
  },
  row: {
    name: "Horizontal Row",
    grid: [row("3", "3", "3", "3", "3", "3", "3", "3")],
  },
  maze: {
    name: "Serpentine Maze",
    grid: [
      row("10", "10", "10", "10", "10", "10", "10", "10"),
      row(".", ".", ".", ".", ".", ".", ".", "10"),
      row(".", "10", "10", "10", "10", "10", "10", "10"),
      row(".", ".", ".", ".", ".", ".", ".", "."),
      row("10", "10", "10", "10", "10", "10", "10", "."),
      row(".", ".", ".", ".", ".", ".", ".", "."),
    ],
  },
  shields: {
    name: "Shield Line",
    grid: [row("S", "S", "S", "S", "S", "S", "S", "S")],
  },
  volatile: {
    name: "Volatile Row",
    grid: [row(".", ".", "V", "V", "V", "V", ".", ".")],
  },
  mixed: {
    name: "Mixed Formation",
    grid: [row("1", "S", "V", "1", "S", "V", "1", "S")],
  },
  boss: {
    name: "Boss",
    grid: [row(".", ".", "W", ".", ".", ".", ".", ".")],
  },
});

function createBlocksFromGrid(grid, encounterId) {
  const blocks = [];
  let nextId = 1;
  grid.forEach((cells, rowIndex) => {
    cells.forEach((cell, columnIndex) => {
      const block = parseCell(cell, rowIndex, columnIndex, encounterId, nextId);
      if (block) {
        blocks.push(block);
        nextId += 1;
      }
    });
  });
  return blocks;
}

export function createEncounterBlocks(encounterIndex) {
  const encounter = ENCOUNTERS[encounterIndex];
  if (!encounter) return [];
  return createBlocksFromGrid(encounter.grid, encounter.id);
}

export function createDevTestBlocks(presetId) {
  const resolvedPresetId = DEV_TEST_PRESETS[presetId] ? presetId : "row";
  return createBlocksFromGrid(
    DEV_TEST_PRESETS[resolvedPresetId].grid,
    `dev-${resolvedPresetId}`,
  );
}

export function descendBlocks(blocks, rows = 1) {
  for (const block of blocks) {
    if (block.alive) block.row += rows;
  }
}

export function hasCrossedDangerLine(blocks, dangerRow = 9) {
  return blocks.some(
    (block) => block.alive && block.row + block.heightCells > dangerRow,
  );
}

export function createSlagBlock(blocks, turn, random = Math.random) {
  const occupiedColumns = new Set(
    blocks
      .filter((block) => block.alive && block.row < 1)
      .flatMap((block) =>
        Array.from(
          { length: block.widthCells },
          (_, index) => block.column + index,
        ),
      ),
  );
  const openColumns = Array.from({ length: 8 }, (_, index) => index).filter(
    (column) => !occupiedColumns.has(column),
  );
  if (openColumns.length === 0) return null;
  const column = openColumns[Math.floor(random() * openColumns.length)];
  const hp = 1 + Math.floor(turn / 3);
  return {
    id: `slag-${turn}-${column}-${blocks.length}`,
    kind: "slag",
    row: 0,
    visualRow: -0.7,
    column,
    widthCells: 1,
    heightCells: 1,
    hp,
    maxHp: hp,
    shield: 0,
    alive: true,
  };
}

export function blockXp(block) {
  return BLOCK_TYPES[block.kind]?.xp ?? 1;
}

export function calculateForgeReward(run, victory) {
  return Math.max(
    1,
    run.encountersCleared * 2 +
      Math.floor(run.score / 1200) +
      (victory ? 15 : 0),
  );
}

export function defaultUnlockedIds() {
  return [...STARTER_UNLOCKS];
}
