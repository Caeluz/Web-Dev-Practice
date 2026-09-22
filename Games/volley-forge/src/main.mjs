import {
  BALL_DEFINITIONS,
  BLOCK_TYPES,
  CONTENT_UNLOCKS,
  DEV_TEST_PRESETS,
  ENCOUNTERS,
  PASSIVE_DEFINITIONS,
  getContentName,
} from "./data.mjs";
import {
  PHASES,
  allBallsSpent,
  applyDraftChoice,
  blockXp,
  calculateForgeReward,
  createDraft,
  createDevTestBlocks,
  createDevTestRunState,
  createEncounterBlocks,
  createRunState,
  createSeededRandom,
  createSlagBlock,
  descendBlocks,
  grantXp,
  hasCrossedDangerLine,
  markBallSpent,
  refreshArsenal,
  replaceBall,
  unspentBallCount,
  xpToNext,
} from "./core.mjs";
import {
  circleRectCollision,
  clampAimAngle,
  getHorizontalLaserTargets,
  getPulseTargets,
  hasFlightEnded,
  reflectedVelocity,
  resolveImpact,
} from "./combat.mjs";
import { loadMeta, purchaseUnlock, saveMeta } from "./storage.mjs";

const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");

const elements = {
  arsenal: document.querySelector("#arsenal"),
  blockLabel: document.querySelector("#block-label"),
  cardModal: document.querySelector("#card-modal"),
  cardOptions: document.querySelector("#card-options"),
  cardSubtitle: document.querySelector("#card-subtitle"),
  clearedLabel: document.querySelector("#cleared-label"),
  closeForge: document.querySelector("#close-forge"),
  closeHelp: document.querySelector("#close-help"),
  devBallSelect: document.querySelector("#dev-ball-select"),
  devClearPassives: document.querySelector("#dev-clear-passives"),
  devExit: document.querySelector("#dev-exit"),
  devLabButton: document.querySelector("#dev-lab-button"),
  devMaxPassives: document.querySelector("#dev-max-passives"),
  devModal: document.querySelector("#dev-modal"),
  devPassiveList: document.querySelector("#dev-passive-list"),
  devPresetSelect: document.querySelector("#dev-preset-select"),
  devResetTest: document.querySelector("#dev-reset-test"),
  devStartTest: document.querySelector("#dev-start-test"),
  encounterLabel: document.querySelector("#encounter-label"),
  encounterName: document.querySelector("#encounter-name"),
  forgeBalance: document.querySelector("#forge-balance"),
  forgeButton: document.querySelector("#forge-button"),
  forgeModal: document.querySelector("#forge-modal"),
  helpButton: document.querySelector("#help-button"),
  helpModal: document.querySelector("#help-modal"),
  levelLabel: document.querySelector("#level-label"),
  modalBackdrop: document.querySelector("#modal-backdrop"),
  muteButton: document.querySelector("#mute-button"),
  newRunButton: document.querySelector("#new-run-button"),
  passiveList: document.querySelector("#passive-list"),
  pauseButton: document.querySelector("#pause-button"),
  pausedPanel: document.querySelector("#paused-panel"),
  phaseLabel: document.querySelector("#phase-label"),
  replaceBack: document.querySelector("#replace-back"),
  replaceCopy: document.querySelector("#replace-copy"),
  replaceModal: document.querySelector("#replace-modal"),
  replaceOptions: document.querySelector("#replace-options"),
  resultEncounters: document.querySelector("#result-encounters"),
  resultScore: document.querySelector("#result-score"),
  resultShards: document.querySelector("#result-shards"),
  restartButton: document.querySelector("#restart-button"),
  resumeButton: document.querySelector("#resume-button"),
  runEyebrow: document.querySelector("#run-eyebrow"),
  runForgeButton: document.querySelector("#run-forge-button"),
  runMessage: document.querySelector("#run-message"),
  runModal: document.querySelector("#run-modal"),
  runTitle: document.querySelector("#run-title"),
  scoreLabel: document.querySelector("#score-label"),
  shardCount: document.querySelector("#shard-count"),
  shotCount: document.querySelector("#shot-count"),
  startButton: document.querySelector("#start-button"),
  startPanel: document.querySelector("#start-panel"),
  toast: document.querySelector("#toast"),
  turnLabel: document.querySelector("#turn-label"),
  unlockList: document.querySelector("#unlock-list"),
  xpFill: document.querySelector("#xp-fill"),
  xpLabel: document.querySelector("#xp-label"),
};

const WIDTH = 720;
const HEIGHT = 960;
const PLAY_LEFT = 32;
const PLAY_RIGHT = 688;
const PLAY_TOP = 104;
const GRID_TOP = 132;
const CELL_WIDTH = 82;
const CELL_HEIGHT = 66;
const DANGER_ROW = 10;
const DANGER_Y = GRID_TOP + DANGER_ROW * CELL_HEIGHT;
const CANNON_X = WIDTH / 2;
const CANNON_Y = 880;
const BALL_EXIT_Y = 950;
const FIXED_STEP = 1 / 120;
const MAX_FLIGHT_SECONDS = 12;
let meta = loadMeta();
let run = null;
let blocks = [];
let selectedSlotIndex = 0;
let currentBall = null;
let aimAngle = -Math.PI / 2;
let aimingWithPointer = false;
let paused = false;
let helpResumeOnClose = false;
let random = createSeededRandom(Date.now());
const visualRandom = Math.random;
let accumulator = 0;
let lastFrameTime = performance.now();
let particles = [];
let shake = 0;
let toastTimer = 0;
let pendingContinuation = null;
let currentDraft = [];
let pendingBallChoice = null;
let forgeReturn = "start";
let sessionId = 0;
let devTestConfig = null;

class ForgeAudio {
  constructor() {
    this.context = null;
  }

  ensure() {
    if (meta.settings.muted) return null;
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === "suspended") this.context.resume();
    return this.context;
  }

  tone(frequency, duration = 0.08, type = "sine", volume = 0.045, slide = 0) {
    const audio = this.ensure();
    if (!audio) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(30, frequency + slide),
      audio.currentTime + duration,
    );
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  }

  play(name) {
    if (name === "fire") this.tone(180, 0.13, "sawtooth", 0.05, 130);
    if (name === "wall") this.tone(420, 0.035, "triangle", 0.018, -80);
    if (name === "hit") this.tone(105, 0.055, "square", 0.025, -20);
    if (name === "break") {
      this.tone(150, 0.11, "sawtooth", 0.04, -95);
      window.setTimeout(() => this.tone(80, 0.09, "square", 0.02, -30), 24);
    }
    if (name === "level") {
      this.tone(330, 0.12, "sine", 0.04, 120);
      window.setTimeout(() => this.tone(490, 0.18, "sine", 0.04, 180), 90);
    }
    if (name === "danger") this.tone(75, 0.4, "sawtooth", 0.06, -20);
    if (name === "victory") {
      [262, 330, 392, 523].forEach((note, index) => {
        window.setTimeout(
          () => this.tone(note, 0.22, "triangle", 0.04, 80),
          index * 110,
        );
      });
    }
  }
}

const audio = new ForgeAudio();

function blockRect(block, useVisualRow = true) {
  const row = useVisualRow ? block.visualRow : block.row;
  return {
    x: PLAY_LEFT + block.column * CELL_WIDTH + 4,
    y: GRID_TOP + row * CELL_HEIGHT + 4,
    width: block.widthCells * CELL_WIDTH - 8,
    height: block.heightCells * CELL_HEIGHT - 8,
  };
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (WIDTH / rect.width),
    y: (event.clientY - rect.top) * (HEIGHT / rect.height),
  };
}

function setAimFromPoint(point) {
  const raw = Math.atan2(point.y - CANNON_Y, point.x - CANNON_X);
  aimAngle = clampAimAngle(raw);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(
    () => elements.toast.classList.remove("show"),
    1600,
  );
}

function hideAllModals() {
  for (const modal of [
    elements.cardModal,
    elements.replaceModal,
    elements.forgeModal,
    elements.runModal,
    elements.helpModal,
    elements.devModal,
  ])
    modal.hidden = true;
  elements.modalBackdrop.hidden = true;
}

function showModal(modal) {
  for (const candidate of [
    elements.cardModal,
    elements.replaceModal,
    elements.forgeModal,
    elements.runModal,
    elements.helpModal,
    elements.devModal,
  ])
    candidate.hidden = candidate !== modal;
  elements.modalBackdrop.hidden = false;
  modal.hidden = false;
}

function startRun() {
  sessionId += 1;
  const seed = Date.now();
  run = createRunState(seed);
  devTestConfig = null;
  random = createSeededRandom(seed);
  blocks = createEncounterBlocks(0);
  selectedSlotIndex = 0;
  currentBall = null;
  pendingContinuation = null;
  currentDraft = [];
  pendingBallChoice = null;
  particles = [];
  paused = false;
  aimAngle = -Math.PI / 2;
  elements.startPanel.hidden = true;
  elements.pausedPanel.hidden = true;
  elements.pauseButton.disabled = false;
  elements.pauseButton.textContent = "Ⅱ";
  hideAllModals();
  audio.ensure();
  updateInterface();
  showToast("First Heat — choose your angle");
}

function loadEncounter(index) {
  if (!run || !ENCOUNTERS[index]) return;
  run.encounterIndex = index;
  run.phase = PHASES.AIMING;
  blocks = createEncounterBlocks(index);
  currentBall = null;
  for (const ball of run.arsenal) ball.spent = false;
  selectedSlotIndex = Math.max(
    0,
    run.arsenal.findIndex((ball) => !ball.spent),
  );
  updateInterface();
  showToast(`${ENCOUNTERS[index].name} — ${ENCOUNTERS[index].subtitle}`);
}

function selectedBallSlot() {
  return run?.arsenal[selectedSlotIndex] ?? null;
}

function selectBall(index) {
  if (!run || run.phase !== PHASES.AIMING || paused) return;
  const slot = run.arsenal[index];
  if (!slot || slot.spent) return;
  selectedSlotIndex = index;
  updateInterface();
}

function fireSelectedBall() {
  if (!run || run.phase !== PHASES.AIMING || paused || currentBall) return;
  const slot = selectedBallSlot();
  if (!slot || slot.spent) return;
  const definition = BALL_DEFINITIONS[slot.typeId];
  const isFinal = unspentBallCount(run) === 1;
  currentBall = {
    slotInstanceId: slot.instanceId,
    typeId: slot.typeId,
    x: CANNON_X + Math.cos(aimAngle) * 38,
    y: CANNON_Y + Math.sin(aimAngle) * 38,
    vx: Math.cos(aimAngle) * definition.speed,
    vy: Math.sin(aimAngle) * definition.speed,
    radius: definition.radius,
    elapsed: 0,
    hits: 0,
    penetrationsRemaining: definition.penetrations ?? 0,
    emberTriggered: false,
    lineTriggered: false,
    pulseCharges: definition.pulseCharges ?? 0,
    bankedCharge: 0,
    isFinal,
    contactCooldowns: new Map(),
    trail: [],
  };
  run.phase = PHASES.BALL_IN_FLIGHT;
  audio.play("fire");
  spawnParticles(currentBall.x, currentBall.y, definition.color, 12, 1.8);
  updateInterface();
}

function reflectBall(ball, normal) {
  const reflected = reflectedVelocity(ball.vx, ball.vy, normal);
  ball.vx = reflected.vx;
  ball.vy = reflected.vy;
  ball.x += normal.nx * (normal.overlap + 0.8);
  ball.y += normal.ny * (normal.overlap + 0.8);
}

function areOrthogonalNeighbors(first, second) {
  const firstLeft = first.column;
  const firstRight = first.column + first.widthCells;
  const firstTop = first.row;
  const firstBottom = first.row + first.heightCells;
  const secondLeft = second.column;
  const secondRight = second.column + second.widthCells;
  const secondTop = second.row;
  const secondBottom = second.row + second.heightCells;
  const horizontalTouch =
    (firstRight === secondLeft || secondRight === firstLeft) &&
    Math.max(firstTop, secondTop) < Math.min(firstBottom, secondBottom);
  const verticalTouch =
    (firstBottom === secondTop || secondBottom === firstTop) &&
    Math.max(firstLeft, secondLeft) < Math.min(firstRight, secondRight);
  return horizontalTouch || verticalTouch;
}

function damageNeighbors(origin, amount, source) {
  const neighbors = blocks.filter(
    (block) =>
      block.alive && block !== origin && areOrthogonalNeighbors(origin, block),
  );
  for (const neighbor of neighbors)
    damageBlock(neighbor, amount, source, false);
}

function nearestBlock(origin) {
  const originRect = blockRect(origin, false);
  const originX = originRect.x + originRect.width / 2;
  const originY = originRect.y + originRect.height / 2;
  let nearest = null;
  let nearestDistance = Infinity;
  for (const block of blocks) {
    if (!block.alive || block === origin) continue;
    const rect = blockRect(block, false);
    const distance = Math.hypot(
      rect.x + rect.width / 2 - originX,
      rect.y + rect.height / 2 - originY,
    );
    if (distance < nearestDistance) {
      nearest = block;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function damageBlock(
  block,
  amount,
  source = "impact",
  triggerShatter = true,
  triggerBlockEffects = true,
) {
  if (!run || !block.alive || amount <= 0) return 0;
  const rect = blockRect(block);
  const impactX = rect.x + rect.width / 2;
  const impactY = rect.y + rect.height / 2;

  if (block.shield > 0) {
    block.shield -= 1;
    run.score += 15;
    spawnParticles(impactX, impactY, "#a7e7ff", 8, 1.2);
    audio.play("hit");
    return 0;
  }

  const dealt = Math.min(block.hp, amount);
  block.hp -= amount;
  run.damageDealt += dealt;
  run.score += dealt * 22;
  spawnParticles(
    impactX,
    impactY,
    BLOCK_TYPES[block.kind]?.edge ?? "#ff8a4c",
    5 + dealt * 2,
    1.1,
  );
  audio.play("hit");
  shake = Math.min(12, shake + 1.2 + dealt * 0.5);

  if (block.hp <= 0) {
    block.alive = false;
    run.blocksDestroyed += 1;
    run.score += block.kind === "boss" ? 2400 : 85;
    if (!run.devTest) grantXp(run, blockXp(block));
    audio.play("break");
    spawnParticles(
      impactX,
      impactY,
      BLOCK_TYPES[block.kind]?.edge ?? "#ff8a4c",
      block.kind === "boss" ? 42 : 18,
      2.8,
    );
    if (triggerBlockEffects && block.kind === "volatile")
      damageNeighbors(block, 1, "volatile");
    const shatteringRank = run.passives.shattering ?? 0;
    if (triggerBlockEffects && triggerShatter && shatteringRank > 0) {
      damageNeighbors(block, shatteringRank, "shattering");
    }
  }

  return dealt;
}

function handleBlockCollision(ball, block, collision) {
  const definition = BALL_DEFINITIONS[ball.typeId];
  const outcome = resolveImpact(ball, run.passives);
  const dealt = damageBlock(block, outcome.damage, "ball");
  ball.contactCooldowns.set(block.id, ball.elapsed + 0.075);

  if (outcome.lineBurst && dealt > 0) {
    const rect = blockRect(block);
    spawnHorizontalBeam(rect.y + rect.height / 2, definition.glow);
    for (const target of getHorizontalLaserTargets(blocks, block)) {
      damageBlock(target, definition.beamDamage, "linebreaker", false, false);
    }
  } else if (outcome.lineBurst) {
    ball.lineTriggered = false;
  }

  if (outcome.pulseBurst && dealt > 0) {
    ball.pulseCharges -= 1;
    spawnPulseRing(ball.x, ball.y, definition.glow, definition.pulseRadius);
    const pulse = { x: ball.x, y: ball.y, radius: definition.pulseRadius };
    for (const target of getPulseTargets(blocks, block, pulse, blockRect)) {
      damageBlock(target, definition.pulseDamage, "pulse", false, false);
    }
  }

  if (outcome.emberBurst) {
    damageNeighbors(block, definition.burstDamage, "ember");
  }
  if (outcome.stormChain) {
    const target = nearestBlock(block);
    if (target) {
      damageBlock(target, definition.chainDamage, "storm", false);
      const targetRect = blockRect(target);
      spawnArc(
        blockRect(block).x + blockRect(block).width / 2,
        blockRect(block).y + blockRect(block).height / 2,
        targetRect.x + targetRect.width / 2,
        targetRect.y + targetRect.height / 2,
      );
    }
  }

  if (outcome.penetrates) {
    ball.x += (ball.vx / definition.speed) * (ball.radius * 1.6);
    ball.y += (ball.vy / definition.speed) * (ball.radius * 1.6);
  } else {
    reflectBall(ball, collision);
  }
}

function updateBall(step) {
  if (!currentBall || !run || run.phase !== PHASES.BALL_IN_FLIGHT) return;
  const ball = currentBall;
  ball.elapsed += step;
  ball.x += ball.vx * step;
  ball.y += ball.vy * step;

  if (ball.x - ball.radius <= PLAY_LEFT) {
    ball.x = PLAY_LEFT + ball.radius;
    ball.vx = Math.abs(ball.vx);
    ball.bankedCharge = run.passives.banked ?? 0;
    audio.play("wall");
  } else if (ball.x + ball.radius >= PLAY_RIGHT) {
    ball.x = PLAY_RIGHT - ball.radius;
    ball.vx = -Math.abs(ball.vx);
    ball.bankedCharge = run.passives.banked ?? 0;
    audio.play("wall");
  }
  if (ball.y - ball.radius <= PLAY_TOP) {
    ball.y = PLAY_TOP + ball.radius;
    ball.vy = Math.abs(ball.vy);
    ball.bankedCharge = run.passives.banked ?? 0;
    audio.play("wall");
  }

  for (const block of blocks) {
    if (
      !block.alive ||
      (ball.contactCooldowns.get(block.id) ?? 0) > ball.elapsed
    )
      continue;
    const collision = circleRectCollision(ball, blockRect(block));
    if (collision) {
      handleBlockCollision(ball, block, collision);
      if (
        BALL_DEFINITIONS[ball.typeId].ability !== "drill" ||
        ball.penetrationsRemaining <= 0
      )
        break;
    }
  }

  if (
    ball.trail.length === 0 ||
    Math.hypot(ball.x - ball.trail[0].x, ball.y - ball.trail[0].y) > 8
  ) {
    ball.trail.unshift({ x: ball.x, y: ball.y, life: 1 });
    if (ball.trail.length > 18) ball.trail.pop();
  }

  if (!blocks.some((block) => block.alive)) {
    finishBall();
  } else if (hasFlightEnded(ball, BALL_EXIT_Y, MAX_FLIGHT_SECONDS)) {
    if (ball.elapsed >= MAX_FLIGHT_SECONDS)
      showToast("Shot recalled by the forge");
    finishBall();
  }
}

function finishBall() {
  if (!run || !currentBall) return;
  markBallSpent(run, currentBall.slotInstanceId);
  currentBall = null;

  if (run.devTest) {
    const boardCleared = !blocks.some((block) => block.alive);
    if (boardCleared) blocks = createDevTestBlocks(devTestConfig.presetId);
    for (const ball of run.arsenal) ball.spent = false;
    run.phase = PHASES.AIMING;
    selectedSlotIndex = 0;
    updateInterface();
    if (boardCleared) showToast("Dev board reset");
    return;
  }

  if (!blocks.some((block) => block.alive)) {
    completeEncounter();
  } else if (allBallsSpent(run)) {
    beginTurnResolution();
  } else {
    run.phase = PHASES.AIMING;
    selectedSlotIndex = run.arsenal.findIndex((ball) => !ball.spent);
    updateInterface();
  }
}

function beginTurnResolution() {
  if (!run) return;
  const activeSession = sessionId;
  run.phase = PHASES.TURN_RESOLUTION;
  descendBlocks(blocks);
  if (ENCOUNTERS[run.encounterIndex].boss) {
    const slag = createSlagBlock(blocks, run.turn, random);
    if (slag) blocks.push(slag);
  }
  shake = 9;
  audio.play("danger");
  updateInterface();

  window.setTimeout(() => {
    if (
      !run ||
      activeSession !== sessionId ||
      run.phase !== PHASES.TURN_RESOLUTION
    )
      return;
    for (const block of blocks) block.visualRow = block.row;
    if (hasCrossedDangerLine(blocks, DANGER_ROW)) {
      endRun(false);
      return;
    }
    processDraftsOr(() => {
      refreshArsenal(run);
      run.phase = PHASES.AIMING;
      selectedSlotIndex = 0;
      updateInterface();
    });
  }, 520);
}

function completeEncounter() {
  if (!run) return;
  run.phase = PHASES.ENCOUNTER_CLEAR;
  run.encountersCleared += 1;
  run.score += ENCOUNTERS[run.encounterIndex].boss ? 2500 : 600;
  const isFinal = run.encounterIndex === ENCOUNTERS.length - 1;
  updateInterface();
  showToast(isFinal ? "THE FORGE WARDEN FALLS" : "FORMATION SHATTERED");

  processDraftsOr(() => {
    const activeSession = sessionId;
    window.setTimeout(() => {
      if (!run || activeSession !== sessionId) return;
      if (isFinal) endRun(true);
      else loadEncounter(run.encounterIndex + 1);
    }, 850);
  });
}

function processDraftsOr(continuation) {
  if (!run) return;
  pendingContinuation = continuation;
  if (run.pendingDrafts > 0) showCardDraft();
  else {
    const next = pendingContinuation;
    pendingContinuation = null;
    next?.();
  }
}

function showCardDraft() {
  if (!run) return;
  currentDraft = createDraft(run, meta.unlockedIds, random, 3);
  if (currentDraft.length === 0) {
    run.pendingDrafts = 0;
    hideAllModals();
    const next = pendingContinuation;
    pendingContinuation = null;
    next?.();
    return;
  }

  run.phase = PHASES.CARD_DRAFT;
  elements.cardSubtitle.textContent =
    run.pendingDrafts > 1
      ? `${run.pendingDrafts} upgrade choices are waiting.`
      : "Shape this run with one of three cards.";
  elements.cardOptions.replaceChildren();
  currentDraft.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "upgrade-card";
    const isBall = choice.kind === "ball";
    const rank = isBall
      ? "NEW ARSENAL BALL"
      : `RANK ${(run.passives[choice.id] ?? 0) + 1} / ${choice.definition.maxRank}`;
    button.innerHTML = `
      <span class="card-kind">${isBall ? "Forged ball" : "Passive tempering"}</span>
      <i class="card-icon" aria-hidden="true">${isBall ? "●" : choice.definition.icon}</i>
      <h3>${choice.definition.name}</h3>
      <p>${choice.definition.description}</p>
      <span class="card-rank">${rank}</span>
    `;
    button.addEventListener("click", () => chooseDraftCard(choice));
    elements.cardOptions.append(button);
  });
  audio.play("level");
  showModal(elements.cardModal);
  updateInterface();
}

function chooseDraftCard(choice) {
  if (!run) return;
  const result = applyDraftChoice(run, choice);
  if (result.requiresReplacement) {
    pendingBallChoice = choice;
    showReplacementChoice(choice);
    return;
  }
  if (!result.applied) return;
  finishDraftChoice();
}

function showReplacementChoice(choice) {
  elements.replaceCopy.textContent = `Choose which equipped ball will be reforged into ${choice.definition.name}.`;
  elements.replaceOptions.replaceChildren();
  run.arsenal.forEach((slot, index) => {
    const definition = BALL_DEFINITIONS[slot.typeId];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "replace-choice";
    button.innerHTML = `<b>Slot ${index + 1}: ${definition.name}</b><span>Replace with ${choice.definition.name}</span>`;
    button.addEventListener("click", () => {
      if (replaceBall(run, index, choice.id)) finishDraftChoice();
    });
    elements.replaceOptions.append(button);
  });
  showModal(elements.replaceModal);
}

function finishDraftChoice() {
  pendingBallChoice = null;
  run.pendingDrafts = Math.max(0, run.pendingDrafts - 1);
  updateInterface();
  if (run.pendingDrafts > 0) showCardDraft();
  else {
    hideAllModals();
    const next = pendingContinuation;
    pendingContinuation = null;
    next?.();
  }
}

function endRun(victory) {
  if (!run) return;
  run.phase = PHASES.RUN_OVER;
  const reward = calculateForgeReward(run, victory);
  meta.forgeShards += reward;
  meta.bestScore = Math.max(meta.bestScore, run.score);
  if (victory) meta.bossVictories += 1;
  saveMeta(meta);
  elements.pauseButton.disabled = true;
  elements.pausedPanel.hidden = true;
  paused = false;
  updateInterface();
  if (victory) audio.play("victory");
  else audio.play("danger");

  elements.runEyebrow.textContent = victory
    ? "Foundry conquered"
    : "The line was breached";
  elements.runTitle.textContent = victory
    ? "The Forge Warden is broken."
    : "The forge claims this volley.";
  elements.runMessage.textContent = victory
    ? "Your discoveries return to the forge. Future runs still begin with one Iron Ball."
    : "Spend the shards you recovered, reshape the card pool, and try a sharper build.";
  elements.resultScore.textContent = run.score.toLocaleString();
  elements.resultEncounters.textContent = `${run.encountersCleared} / ${ENCOUNTERS.length}`;
  elements.resultShards.textContent = `◆ ${reward}`;
  window.setTimeout(() => showModal(elements.runModal), 420);
}

function renderArsenal() {
  elements.arsenal.replaceChildren();
  if (!run) {
    for (let index = 0; index < 4; index += 1) {
      const empty = document.createElement("div");
      empty.className = "empty-slot";
      empty.textContent = index === 0 ? "Iron Ball" : "Empty slot";
      elements.arsenal.append(empty);
    }
    return;
  }

  for (let index = 0; index < 4; index += 1) {
    const slot = run.arsenal[index];
    if (!slot) {
      const empty = document.createElement("div");
      empty.className = "empty-slot";
      empty.textContent = "Empty slot";
      elements.arsenal.append(empty);
      continue;
    }
    const definition = BALL_DEFINITIONS[slot.typeId];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `ball-slot${selectedSlotIndex === index ? " selected" : ""}`;
    button.style.setProperty("--ball-color", definition.color);
    button.disabled = slot.spent || run.phase !== PHASES.AIMING || paused;
    button.innerHTML = `
      <i class="ball-orb" aria-hidden="true"></i>
      <span><b>${definition.shortName}</b><small>${slot.spent ? "Spent" : "Ready"}</small></span>
      <span class="ball-key">${index + 1}</span>
    `;
    button.title = definition.description;
    button.addEventListener("click", () => selectBall(index));
    elements.arsenal.append(button);
  }
}

function renderPassives() {
  elements.passiveList.replaceChildren();
  if (!run || Object.keys(run.passives).length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No passive upgrades yet.";
    elements.passiveList.append(empty);
    return;
  }
  for (const [id, rank] of Object.entries(run.passives)) {
    const definition = PASSIVE_DEFINITIONS[id];
    const item = document.createElement("div");
    item.className = "passive-item";
    item.innerHTML = `<i>${definition.icon}</i><div><b>${definition.name}</b><span>Rank ${rank} / ${definition.maxRank}</span></div>`;
    elements.passiveList.append(item);
  }
}

function renderDevLabControls() {
  const selectedBallId =
    devTestConfig?.ballId ?? elements.devBallSelect.value ?? "iron";
  const selectedPresetId =
    devTestConfig?.presetId ?? elements.devPresetSelect.value ?? "row";

  elements.devBallSelect.replaceChildren();
  for (const definition of Object.values(BALL_DEFINITIONS)) {
    const option = document.createElement("option");
    option.value = definition.id;
    option.textContent = definition.name;
    elements.devBallSelect.append(option);
  }
  elements.devBallSelect.value = BALL_DEFINITIONS[selectedBallId]
    ? selectedBallId
    : "iron";

  elements.devPresetSelect.replaceChildren();
  for (const [id, preset] of Object.entries(DEV_TEST_PRESETS)) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = preset.name;
    elements.devPresetSelect.append(option);
  }
  elements.devPresetSelect.value = DEV_TEST_PRESETS[selectedPresetId]
    ? selectedPresetId
    : "row";

  elements.devPassiveList.replaceChildren();
  for (const definition of Object.values(PASSIVE_DEFINITIONS)) {
    const item = document.createElement("label");
    item.className = "dev-passive-control";
    const copy = document.createElement("span");
    copy.innerHTML = `<b>${definition.name}</b><small>${definition.description}</small>`;
    const select = document.createElement("select");
    select.dataset.passiveId = definition.id;
    select.setAttribute("aria-label", `${definition.name} rank`);
    for (let rank = 0; rank <= definition.maxRank; rank += 1) {
      const option = document.createElement("option");
      option.value = rank;
      option.textContent = rank === 0 ? "Off" : `Rank ${rank}`;
      select.append(option);
    }
    const selectedRank = devTestConfig?.passiveRanks?.[definition.id] ?? 0;
    select.value = String(
      Math.min(definition.maxRank, Math.max(0, selectedRank)),
    );
    item.append(copy, select);
    elements.devPassiveList.append(item);
  }
}

function setDevPassiveRanks(mode) {
  for (const select of elements.devPassiveList.querySelectorAll("select")) {
    select.value = mode === "max" ? String(select.options.length - 1) : "0";
  }
}

function readDevPassiveRanks() {
  const ranks = {};
  for (const select of elements.devPassiveList.querySelectorAll("select")) {
    const rank = Number(select.value);
    if (rank > 0) ranks[select.dataset.passiveId] = rank;
  }
  return ranks;
}

function startDevTest() {
  const ballId = BALL_DEFINITIONS[elements.devBallSelect.value]
    ? elements.devBallSelect.value
    : "iron";
  const presetId = DEV_TEST_PRESETS[elements.devPresetSelect.value]
    ? elements.devPresetSelect.value
    : "row";
  devTestConfig = {
    ballId,
    passiveRanks: readDevPassiveRanks(),
    presetId,
  };

  sessionId += 1;
  run = createDevTestRunState(ballId, devTestConfig.passiveRanks);
  random = createSeededRandom(1);
  blocks = createDevTestBlocks(presetId);
  selectedSlotIndex = 0;
  currentBall = null;
  pendingContinuation = null;
  currentDraft = [];
  pendingBallChoice = null;
  particles = [];
  paused = false;
  aimAngle = -Math.PI / 2;
  elements.startPanel.hidden = true;
  elements.pausedPanel.hidden = true;
  elements.pauseButton.disabled = false;
  elements.pauseButton.textContent = "Ⅱ";
  hideAllModals();
  audio.ensure();
  updateInterface();
  showToast(`${BALL_DEFINITIONS[ballId].name} test ready`);
}

function resetDevTest() {
  if (!run?.devTest || !devTestConfig) return;
  currentBall = null;
  blocks = createDevTestBlocks(devTestConfig.presetId);
  for (const ball of run.arsenal) ball.spent = false;
  run.phase = PHASES.AIMING;
  run.xp = 0;
  run.pendingDrafts = 0;
  paused = false;
  particles = [];
  hideAllModals();
  updateInterface();
  showToast("Dev board reset");
}

function exitDevLab() {
  if (run?.devTest) {
    sessionId += 1;
    run = null;
    blocks = [];
    currentBall = null;
    particles = [];
    elements.startPanel.hidden = false;
    elements.pausedPanel.hidden = true;
    elements.pauseButton.disabled = true;
  }
  devTestConfig = null;
  paused = false;
  hideAllModals();
  updateInterface();
}

function openDevLab() {
  if (run && !run.devTest) {
    showToast("Finish the current run before opening Dev Lab");
    return;
  }
  if (run?.phase === PHASES.BALL_IN_FLIGHT) return;
  renderDevLabControls();
  if (run?.devTest) paused = true;
  showModal(elements.devModal);
  updateInterface();
}

function updateInterface() {
  elements.shardCount.textContent = meta.forgeShards.toLocaleString();
  elements.muteButton.textContent = meta.settings.muted ? "×" : "♪";
  elements.muteButton.setAttribute(
    "aria-label",
    meta.settings.muted ? "Enable sound" : "Mute sound",
  );
  if (!run) {
    renderArsenal();
    elements.devLabButton.disabled = false;
    return;
  }

  const encounter = ENCOUNTERS[run.encounterIndex];
  const readyCount = unspentBallCount(run);
  elements.devLabButton.disabled =
    !run.devTest || Boolean(currentBall) || run.phase !== PHASES.AIMING;
  elements.encounterLabel.textContent = encounter.boss
    ? "BOSS — EMBER FOUNDRY"
    : `EMBER FOUNDRY · ${run.encounterIndex + 1} / ${ENCOUNTERS.length}`;
  elements.encounterName.textContent = encounter.name;
  if (run.devTest) {
    elements.encounterLabel.textContent = "DEV LAB";
    elements.encounterName.textContent =
      DEV_TEST_PRESETS[devTestConfig.presetId].name;
  }
  elements.phaseLabel.textContent = run.phase.replaceAll("_", " ");
  elements.turnLabel.textContent = `TURN ${run.turn}`;
  elements.levelLabel.textContent = run.level;
  elements.scoreLabel.textContent = run.score.toLocaleString();
  elements.blockLabel.textContent = blocks.filter(
    (block) => block.alive,
  ).length;
  elements.clearedLabel.textContent = run.devTest
    ? "SANDBOX"
    : `${run.encountersCleared} / ${ENCOUNTERS.length}`;
  elements.shotCount.textContent = `${readyCount} / ${run.arsenal.length}`;
  const threshold = xpToNext(run.level);
  elements.xpLabel.textContent = `${run.xp} / ${threshold}`;
  elements.xpFill.style.width = `${Math.min(100, (run.xp / threshold) * 100)}%`;
  renderArsenal();
  renderPassives();
}

function renderUnlockForge() {
  elements.forgeBalance.textContent = meta.forgeShards.toLocaleString();
  elements.unlockList.replaceChildren();
  for (const unlock of CONTENT_UNLOCKS) {
    const owned = meta.unlockedIds.includes(unlock.id);
    const canAfford = meta.forgeShards >= unlock.price;
    const definition =
      unlock.kind === "ball"
        ? BALL_DEFINITIONS[unlock.contentId]
        : PASSIVE_DEFINITIONS[unlock.contentId];
    const row = document.createElement("article");
    row.className = "unlock-item";
    row.innerHTML = `<div><h3>${getContentName(unlock)}</h3><p>${definition.description}</p></div>`;
    const button = document.createElement("button");
    button.type = "button";
    button.disabled = owned || !canAfford;
    button.textContent = owned ? "Unlocked" : `◆ ${unlock.price}`;
    button.addEventListener("click", () => {
      const result = purchaseUnlock(meta, unlock.id);
      if (result.purchased) {
        saveMeta(meta);
        audio.play("level");
        renderUnlockForge();
        updateInterface();
      }
    });
    row.append(button);
    elements.unlockList.append(row);
  }
}

function openForge(returnTarget) {
  forgeReturn = returnTarget;
  renderUnlockForge();
  showModal(elements.forgeModal);
}

function closeForge() {
  if (forgeReturn === "run" && run?.phase === PHASES.RUN_OVER)
    showModal(elements.runModal);
  else hideAllModals();
}

function togglePause(force) {
  if (!run || run.phase === PHASES.RUN_OVER || run.phase === PHASES.CARD_DRAFT)
    return;
  paused = typeof force === "boolean" ? force : !paused;
  elements.pausedPanel.hidden = !paused;
  elements.pauseButton.textContent = paused ? "▶" : "Ⅱ";
  elements.pauseButton.setAttribute(
    "aria-label",
    paused ? "Resume game" : "Pause game",
  );
  if (!paused) lastFrameTime = performance.now();
  updateInterface();
}

function openHelp() {
  helpResumeOnClose = Boolean(run && !paused && run.phase !== PHASES.RUN_OVER);
  if (helpResumeOnClose) paused = true;
  showModal(elements.helpModal);
}

function closeHelp() {
  hideAllModals();
  if (helpResumeOnClose) {
    paused = false;
    lastFrameTime = performance.now();
  }
  helpResumeOnClose = false;
  updateInterface();
}

function spawnParticles(x, y, color, count, force = 1) {
  for (let index = 0; index < count; index += 1) {
    const angle = visualRandom() * Math.PI * 2;
    const speed = (35 + visualRandom() * 120) * force;
    particles.push({
      kind: "spark",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.35 + visualRandom() * 0.45,
      maxLife: 0.8,
      color,
      size: 1.5 + visualRandom() * 2.5,
    });
  }
}

function spawnArc(x1, y1, x2, y2) {
  particles.push({
    kind: "arc",
    x1,
    y1,
    x2,
    y2,
    life: 0.18,
    maxLife: 0.18,
    color: "#b8afff",
  });
}

function spawnHorizontalBeam(y, color) {
  particles.push({
    kind: "beam",
    x1: PLAY_LEFT,
    x2: PLAY_RIGHT,
    y,
    life: 0.18,
    maxLife: 0.18,
    color,
  });
}

function spawnPulseRing(x, y, color, radius) {
  particles.push({
    kind: "pulse-ring",
    x,
    y,
    radius,
    life: 0.24,
    maxLife: 0.24,
    color,
  });
}

function updateEffects(delta) {
  for (const block of blocks) {
    block.visualRow += (block.row - block.visualRow) * Math.min(1, delta * 9);
  }
  for (const particle of particles) {
    particle.life -= delta;
    if (particle.kind === "spark") {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += 210 * delta;
    }
  }
  particles = particles.filter((particle) => particle.life > 0);
  if (currentBall) {
    for (const point of currentBall.trail) point.life -= delta * 2.2;
    currentBall.trail = currentBall.trail.filter((point) => point.life > 0);
  }
  shake = Math.max(0, shake - delta * 24);
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#17100e");
  gradient.addColorStop(0.62, "#100c0b");
  gradient.addColorStop(1, "#25120d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = "rgba(229, 113, 58, .055)";
  ctx.lineWidth = 1;
  for (let column = 0; column <= 8; column += 1) {
    const x = PLAY_LEFT + column * CELL_WIDTH;
    ctx.beginPath();
    ctx.moveTo(x, PLAY_TOP);
    ctx.lineTo(x, DANGER_Y);
    ctx.stroke();
  }
  for (let rowIndex = 0; rowIndex <= DANGER_ROW; rowIndex += 1) {
    const y = GRID_TOP + rowIndex * CELL_HEIGHT;
    ctx.beginPath();
    ctx.moveTo(PLAY_LEFT, y);
    ctx.lineTo(PLAY_RIGHT, y);
    ctx.stroke();
  }

  const sideGlow = ctx.createLinearGradient(0, 0, WIDTH, 0);
  sideGlow.addColorStop(0, "rgba(255,82,30,.17)");
  sideGlow.addColorStop(0.12, "transparent");
  sideGlow.addColorStop(0.88, "transparent");
  sideGlow.addColorStop(1, "rgba(255,82,30,.17)");
  ctx.fillStyle = sideGlow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.shadowColor = "rgba(255, 132, 76, .7)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "rgba(255, 157, 99, .42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PLAY_LEFT, PLAY_TOP);
  ctx.lineTo(PLAY_LEFT, DANGER_Y);
  ctx.moveTo(PLAY_RIGHT, PLAY_TOP);
  ctx.lineTo(PLAY_RIGHT, DANGER_Y);
  ctx.moveTo(PLAY_LEFT, PLAY_TOP);
  ctx.lineTo(PLAY_RIGHT, PLAY_TOP);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "#ff3f21";
  ctx.shadowBlur = 18;
  ctx.strokeStyle = "rgba(255,71,42,.9)";
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 9]);
  ctx.beginPath();
  ctx.moveTo(PLAY_LEFT, DANGER_Y);
  ctx.lineTo(PLAY_RIGHT, DANGER_Y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  ctx.fillStyle = "rgba(255,109,62,.76)";
  ctx.font = "700 10px Inter";
  ctx.textAlign = "left";
  ctx.fillText("DANGER LINE", PLAY_LEFT + 8, DANGER_Y - 10);
}

function drawBlock(block) {
  if (!block.alive) return;
  const rect = blockRect(block);
  const style = BLOCK_TYPES[block.kind] ?? BLOCK_TYPES.normal;
  const healthRatio = Math.max(0, block.hp / block.maxHp);

  ctx.save();
  ctx.shadowColor = style.edge;
  ctx.shadowBlur = block.kind === "boss" ? 18 : 7;
  const gradient = ctx.createLinearGradient(
    rect.x,
    rect.y,
    rect.x,
    rect.y + rect.height,
  );
  gradient.addColorStop(0, style.edge);
  gradient.addColorStop(0.08, style.color);
  gradient.addColorStop(1, "#221816");
  ctx.fillStyle = gradient;
  roundedRect(
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    block.kind === "boss" ? 12 : 7,
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = healthRatio < 0.45 ? "#ff6840" : style.edge;
  ctx.lineWidth = block.kind === "boss" ? 3 : 1.5;
  ctx.stroke();

  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(rect.x + 8, rect.y + rect.height * 0.72);
  ctx.lineTo(rect.x + rect.width * 0.35, rect.y + rect.height * 0.25);
  if (healthRatio < 0.72)
    ctx.lineTo(rect.x + rect.width * 0.62, rect.y + rect.height * 0.7);
  if (healthRatio < 0.4)
    ctx.lineTo(rect.x + rect.width - 8, rect.y + rect.height * 0.3);
  ctx.stroke();
  ctx.globalAlpha = 1;

  if (block.kind === "volatile") {
    ctx.strokeStyle = "#ffb052";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      12,
      0,
      Math.PI * 2,
    );
    ctx.moveTo(rect.x + rect.width / 2 - 12, rect.y + rect.height / 2);
    ctx.lineTo(rect.x + rect.width / 2 + 12, rect.y + rect.height / 2);
    ctx.stroke();
  }
  if (block.kind === "boss") {
    ctx.fillStyle = "rgba(255, 89, 42, .14)";
    ctx.fillRect(
      rect.x + 12,
      rect.y + rect.height - 20,
      (rect.width - 24) * healthRatio,
      7,
    );
    ctx.strokeStyle = "#ff8c52";
    ctx.strokeRect(rect.x + 12, rect.y + rect.height - 20, rect.width - 24, 7);
  }

  ctx.fillStyle = "#fff1df";
  ctx.font = block.kind === "boss" ? "700 30px Cinzel" : "800 20px Inter";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(block.hp, rect.x + rect.width / 2, rect.y + rect.height / 2);

  if (block.shield > 0) {
    ctx.strokeStyle = "#b8e9ff";
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    roundedRect(rect.x - 3, rect.y - 3, rect.width + 6, rect.height + 6, 9);
    ctx.stroke();
  }
  ctx.restore();
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function traceAimPath() {
  if (!run || run.phase !== PHASES.AIMING || paused) return;
  const surveyorRank = run.passives.surveyor ?? 0;
  const collisionLimit = 2 + surveyorRank;
  const definition = BALL_DEFINITIONS[selectedBallSlot()?.typeId ?? "iron"];
  let x = CANNON_X + Math.cos(aimAngle) * 40;
  let y = CANNON_Y + Math.sin(aimAngle) * 40;
  let vx = Math.cos(aimAngle);
  let vy = Math.sin(aimAngle);
  const points = [{ x, y }];
  let collisions = 0;
  let lastBlock = null;

  for (let step = 0; step < 420 && collisions < collisionLimit; step += 1) {
    x += vx * 5;
    y += vy * 5;
    if (
      x - definition.radius <= PLAY_LEFT ||
      x + definition.radius >= PLAY_RIGHT
    ) {
      vx *= -1;
      x = Math.max(
        PLAY_LEFT + definition.radius,
        Math.min(PLAY_RIGHT - definition.radius, x),
      );
      points.push({ x, y });
      collisions += 1;
      lastBlock = null;
    }
    if (y - definition.radius <= PLAY_TOP) {
      vy = Math.abs(vy);
      y = PLAY_TOP + definition.radius;
      points.push({ x, y });
      collisions += 1;
      lastBlock = null;
    }
    for (const block of blocks) {
      if (!block.alive || block.id === lastBlock) continue;
      const collision = circleRectCollision(
        { x, y, radius: definition.radius },
        blockRect(block),
      );
      if (!collision) continue;
      const dot = vx * collision.nx + vy * collision.ny;
      vx -= 2 * dot * collision.nx;
      vy -= 2 * dot * collision.ny;
      x += collision.nx * (collision.overlap + 3);
      y += collision.ny * (collision.overlap + 3);
      points.push({ x, y });
      collisions += 1;
      lastBlock = block.id;
      break;
    }
    if (y > DANGER_Y + 80) break;
    if (step % 18 === 0) points.push({ x, y, soft: true });
  }

  ctx.save();
  ctx.strokeStyle = definition.color;
  ctx.fillStyle = definition.color;
  ctx.globalAlpha = 0.54;
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 10]);
  ctx.beginPath();
  points.forEach((point, index) =>
    index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y),
  );
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawCannon() {
  const definition = BALL_DEFINITIONS[selectedBallSlot()?.typeId ?? "iron"];
  ctx.save();
  ctx.translate(CANNON_X, CANNON_Y);
  ctx.rotate(aimAngle + Math.PI / 2);
  ctx.fillStyle = "#4c3930";
  ctx.strokeStyle = "#b16945";
  ctx.lineWidth = 3;
  roundedRect(-18, -58, 36, 62, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1a1210";
  ctx.fillRect(-11, -55, 22, 42);
  ctx.restore();

  ctx.save();
  ctx.translate(CANNON_X, CANNON_Y);
  ctx.fillStyle = "#2d211c";
  ctx.strokeStyle = "#875039";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = definition.color;
  ctx.shadowColor = definition.glow;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBall(ball) {
  const definition = BALL_DEFINITIONS[ball.typeId];
  ctx.save();
  ball.trail.forEach((point) => {
    ctx.globalAlpha = Math.max(0, point.life) * 0.25;
    ctx.fillStyle = definition.color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, ball.radius * point.life, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.shadowColor = definition.glow;
  ctx.shadowBlur = 20;
  const gradient = ctx.createRadialGradient(
    ball.x - 3,
    ball.y - 4,
    1,
    ball.x,
    ball.y,
    ball.radius,
  );
  gradient.addColorStop(0, "#fff");
  gradient.addColorStop(0.26, definition.color);
  gradient.addColorStop(1, "#24120e");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawParticles() {
  for (const particle of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.strokeStyle = particle.color;
    ctx.fillStyle = particle.color;
    if (particle.kind === "spark") {
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    } else if (particle.kind === "beam") {
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 18;
      ctx.lineCap = "round";
      ctx.lineWidth = 8;
      ctx.globalAlpha *= 0.35;
      ctx.beginPath();
      ctx.moveTo(particle.x1, particle.y);
      ctx.lineTo(particle.x2, particle.y);
      ctx.stroke();
      ctx.globalAlpha *= 2.8;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(particle.x1, particle.y);
      ctx.lineTo(particle.x2, particle.y);
      ctx.stroke();
    } else if (particle.kind === "pulse-ring") {
      const progress = Math.min(
        1,
        (1 - particle.life / particle.maxLife) * 3,
      );
      const radius = particle.radius * progress;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 24;
      ctx.globalAlpha *= 0.16 * (1 - progress * 0.35);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha *= 4;
      ctx.lineWidth = 5 - progress * 2.5;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha *= 1.5;
      ctx.fillStyle = "#f2d8ff";
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 4 + 3 * (1 - progress), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.lineWidth = 3;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(particle.x1, particle.y1);
      const segments = 5;
      for (let index = 1; index < segments; index += 1) {
        const t = index / segments;
        ctx.lineTo(
          particle.x1 +
            (particle.x2 - particle.x1) * t +
            (visualRandom() - 0.5) * 14,
          particle.y1 +
            (particle.y2 - particle.y1) * t +
            (visualRandom() - 0.5) * 14,
        );
      }
      ctx.lineTo(particle.x2, particle.y2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function render() {
  ctx.save();
  if (shake > 0)
    ctx.translate(
      (visualRandom() - 0.5) * shake,
      (visualRandom() - 0.5) * shake,
    );
  drawBackground();
  if (run) {
    traceAimPath();
    for (const block of blocks) drawBlock(block);
    drawCannon();
    if (currentBall) drawBall(currentBall);
    drawParticles();
  } else {
    drawCannon();
  }
  ctx.restore();
}

function frame(timestamp) {
  const elapsed = Math.min(0.05, (timestamp - lastFrameTime) / 1000);
  lastFrameTime = timestamp;
  if (!paused) {
    accumulator += elapsed;
    while (accumulator >= FIXED_STEP) {
      updateBall(FIXED_STEP);
      accumulator -= FIXED_STEP;
    }
    updateEffects(elapsed);
  }
  render();
  requestAnimationFrame(frame);
}

canvas.addEventListener("pointerdown", (event) => {
  if (!run || run.phase !== PHASES.AIMING || paused) return;
  aimingWithPointer = true;
  canvas.setPointerCapture(event.pointerId);
  setAimFromPoint(getCanvasPoint(event));
});

canvas.addEventListener("pointermove", (event) => {
  if (!aimingWithPointer || !run || run.phase !== PHASES.AIMING || paused)
    return;
  setAimFromPoint(getCanvasPoint(event));
});

canvas.addEventListener("pointerup", (event) => {
  if (!aimingWithPointer) return;
  aimingWithPointer = false;
  if (!run || run.phase !== PHASES.AIMING || paused) return;
  setAimFromPoint(getCanvasPoint(event));
  fireSelectedBall();
});

window.addEventListener("keydown", (event) => {
  if (event.key >= "1" && event.key <= "4") selectBall(Number(event.key) - 1);
  if (!run) return;
  if (event.key === "p" || event.key === "P") togglePause();
  if (paused || run.phase !== PHASES.AIMING) return;
  if (event.key === "ArrowLeft") {
    aimAngle = clampAimAngle(aimAngle - 0.045);
    event.preventDefault();
  }
  if (event.key === "ArrowRight") {
    aimAngle = clampAimAngle(aimAngle + 0.045);
    event.preventDefault();
  }
  if (event.key === "ArrowUp") {
    aimAngle += (-Math.PI / 2 - aimAngle) * 0.18;
    event.preventDefault();
  }
  if (event.code === "Space") {
    event.preventDefault();
    fireSelectedBall();
  }
});

elements.startButton.addEventListener("click", startRun);
elements.newRunButton.addEventListener("click", startRun);
elements.forgeButton.addEventListener("click", () => openForge("start"));
elements.runForgeButton.addEventListener("click", () => openForge("run"));
elements.closeForge.addEventListener("click", closeForge);
elements.helpButton.addEventListener("click", openHelp);
elements.closeHelp.addEventListener("click", closeHelp);
elements.pauseButton.addEventListener("click", () => togglePause());
elements.resumeButton.addEventListener("click", () => togglePause(false));
elements.restartButton.addEventListener("click", startRun);
elements.devLabButton.addEventListener("click", openDevLab);
elements.devMaxPassives.addEventListener("click", () =>
  setDevPassiveRanks("max"),
);
elements.devClearPassives.addEventListener("click", () =>
  setDevPassiveRanks("clear"),
);
elements.devStartTest.addEventListener("click", startDevTest);
elements.devResetTest.addEventListener("click", resetDevTest);
elements.devExit.addEventListener("click", exitDevLab);
elements.replaceBack.addEventListener("click", () => {
  pendingBallChoice = null;
  showModal(elements.cardModal);
});
elements.muteButton.addEventListener("click", () => {
  meta.settings.muted = !meta.settings.muted;
  if (!run?.devTest) saveMeta(meta);
  updateInterface();
  if (!meta.settings.muted) audio.play("wall");
});

renderDevLabControls();
updateInterface();
requestAnimationFrame(frame);
