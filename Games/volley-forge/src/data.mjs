export const BALL_DEFINITIONS = Object.freeze({
  iron: {
    id: "iron",
    name: "Iron Ball",
    shortName: "Iron",
    description: "A reliable forged sphere with clean, predictable ricochets.",
    color: "#d9e1e8",
    glow: "#ffffff",
    speed: 610,
    radius: 10,
    damage: 1,
    ability: "standard",
  },
  ember: {
    id: "ember",
    name: "Ember Core",
    shortName: "Ember",
    description: "Its first block hit each shot scorches every adjacent block.",
    color: "#ff9a3c",
    glow: "#ff4d1c",
    speed: 585,
    radius: 10,
    damage: 1,
    burstDamage: 1,
    ability: "ember_burst",
  },
  hammer: {
    id: "hammer",
    name: "Hammer Ball",
    shortName: "Hammer",
    description:
      "A slower, heavier shot that deals 2 damage on every collision.",
    color: "#f5c26b",
    glow: "#d67c28",
    speed: 500,
    radius: 13,
    damage: 2,
    ability: "heavy",
  },
  drill: {
    id: "drill",
    name: "Drill Ball",
    shortName: "Drill",
    description:
      "Pierces its first two blocks before returning to normal ricochets.",
    color: "#73e6d1",
    glow: "#24aa9b",
    speed: 630,
    radius: 9,
    damage: 1,
    penetrations: 2,
    ability: "drill",
  },
  storm: {
    id: "storm",
    name: "Storm Orb",
    shortName: "Storm",
    description:
      "Every third block hit arcs damage into the nearest surviving block.",
    color: "#aaa6ff",
    glow: "#6a5cff",
    speed: 600,
    radius: 10,
    damage: 1,
    chainEvery: 3,
    chainDamage: 1,
    ability: "storm_chain",
  },
  linebreaker: {
    id: "linebreaker",
    name: "Linebreaker",
    shortName: "Linebreaker",
    description:
      "Its first damaging hit each shot fires a horizontal beam through the impact row.",
    color: "#7de7ff",
    glow: "#25bfff",
    speed: 600,
    radius: 10,
    damage: 1,
    beamDamage: 1,
    ability: "horizontal_laser",
  },
  pulse: {
    id: "pulse",
    name: "Pulse Core",
    shortName: "Pulse",
    description:
      "Releases expanding shockwaves from damaging impacts.",
    color: "#cf8cff",
    glow: "#9e4dff",
    speed: 590,
    radius: 10,
    damage: 1,
    pulseRadius: 104,
    pulseCharges: 99,
    pulseDamage: 1,
    ability: "ball_pulse",
  },
  forgeblade: {
    id: "forgeblade",
    name: "Forgeblade Core",
    shortName: "Forgeblade",
    description:
      "A Legendary core that phases to a chosen point, then sweeps a blade through nearby blocks.",
    rarity: "legendary",
    color: "#ffd36a",
    glow: "#ff793d",
    speed: 820,
    radius: 9,
    damage: 2,
    bladeRadius: 88,
    bladeMaxTargets: 5,
    swingDuration: 0.55,
    ability: "blade_sweep",
  },
});

export const PASSIVE_DEFINITIONS = Object.freeze({
  tempered: {
    id: "tempered",
    name: "Tempered Edge",
    description: "+1 damage per rank on the first block hit by each ball.",
    icon: "◆",
    maxRank: 3,
  },
  banked: {
    id: "banked",
    name: "Banked Heat",
    description:
      "A wall bounce empowers the next block hit by +1 damage per rank.",
    icon: "↗",
    maxRank: 3,
  },
  overcharged: {
    id: "overcharged",
    name: "Overcharged Chamber",
    description: "The final ball fired each turn gains +1 damage per rank.",
    icon: "✦",
    maxRank: 3,
  },
  shattering: {
    id: "shattering",
    name: "Shattering Force",
    description:
      "Destroyed blocks deal 1 damage per rank to orthogonal neighbors.",
    icon: "✣",
    maxRank: 3,
  },
  surveyor: {
    id: "surveyor",
    name: "Surveyor's Lens",
    description: "Predict one additional trajectory collision per rank.",
    icon: "⌁",
    maxRank: 3,
  },
});

export const CONTENT_UNLOCKS = Object.freeze([
  { id: "ball.drill", kind: "ball", contentId: "drill", price: 28 },
  {
    id: "passive.overcharged",
    kind: "passive",
    contentId: "overcharged",
    price: 22,
  },
  {
    id: "passive.shattering",
    kind: "passive",
    contentId: "shattering",
    price: 32,
  },
  { id: "ball.storm", kind: "ball", contentId: "storm", price: 40 },
  { id: "ball.linebreaker", kind: "ball", contentId: "linebreaker", price: 36 },
  { id: "ball.pulse", kind: "ball", contentId: "pulse", price: 36 },
  {
    id: "ball.forgeblade",
    kind: "ball",
    contentId: "forgeblade",
    price: 90,
    requiredBossVictories: 1,
  },
]);

export const STARTER_UNLOCKS = Object.freeze([
  "ball.iron",
  "ball.ember",
  "ball.hammer",
  "passive.tempered",
  "passive.banked",
  "passive.surveyor",
]);

const row = (...cells) => cells;

export const ENCOUNTERS = Object.freeze([
  {
    id: "first_heat",
    name: "First Heat",
    subtitle: "Learn the rhythm of the forge.",
    grid: [
      row(".", ".", "1", "1", "1", "1", ".", "."),
      row(".", "1", ".", "1", "1", ".", "1", "."),
    ],
  },
  {
    id: "iron_teeth",
    name: "Iron Teeth",
    subtitle: "Find an angle through the gaps.",
    grid: [
      row("1", ".", "2", ".", ".", "2", ".", "1"),
      row(".", "2", ".", "1", "1", ".", "2", "."),
      row(".", ".", "1", ".", ".", "1", ".", "."),
    ],
  },
  {
    id: "shield_line",
    name: "Shield Line",
    subtitle: "Break the shell before the core.",
    grid: [
      row(".", "S", ".", "2", "2", ".", "S", "."),
      row("1", ".", "2", ".", ".", "2", ".", "1"),
      row(".", "1", ".", "1", "1", ".", "1", "."),
    ],
  },
  {
    id: "powder_room",
    name: "Powder Room",
    subtitle: "Volatile blocks reward careful chains.",
    grid: [
      row(".", "2", "V", "2", "2", "V", "2", "."),
      row("1", "1", "2", "1", "1", "2", "1", "1"),
      row(".", ".", "1", ".", ".", "1", ".", "."),
    ],
  },
  {
    id: "crossfire",
    name: "Crossfire",
    subtitle: "Turn the walls into a weapon.",
    grid: [
      row("3", ".", "2", ".", ".", "2", ".", "3"),
      row(".", "S", ".", "V", "V", ".", "S", "."),
      row("2", ".", "2", ".", ".", "2", ".", "2"),
    ],
  },
  {
    id: "anvil_gate",
    name: "Anvil Gate",
    subtitle: "The Warden waits beyond this wall.",
    grid: [
      row("S", "3", "S", "3", "3", "S", "3", "S"),
      row("2", "V", "2", "V", "V", "2", "V", "2"),
      row(".", "2", ".", "2", "2", ".", "2", "."),
      row(".", ".", "1", ".", ".", "1", ".", "."),
    ],
  },
  {
    id: "forge_warden",
    name: "The Forge Warden",
    subtitle: "Crack the living anvil before it reaches the line.",
    boss: true,
    grid: [
      row(".", ".", "W", ".", ".", ".", ".", "."),
      row(".", "2", ".", ".", ".", ".", "2", "."),
    ],
  },
]);

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

export const BLOCK_TYPES = Object.freeze({
  normal: { color: "#56606d", edge: "#929ba5", xp: 1 },
  shielded: { color: "#586d7e", edge: "#9dd9f0", xp: 2 },
  volatile: { color: "#8d462b", edge: "#ff9a4c", xp: 2 },
  slag: { color: "#453e3a", edge: "#aa7450", xp: 1 },
  boss: { color: "#692f28", edge: "#ff7343", xp: 12 },
});

export function getContentName(unlock) {
  const definition =
    unlock.kind === "ball"
      ? BALL_DEFINITIONS[unlock.contentId]
      : PASSIVE_DEFINITIONS[unlock.contentId];
  return definition?.name ?? unlock.contentId;
}
