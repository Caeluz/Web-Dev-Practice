import { BALL_DEFINITIONS } from "./data.mjs";

export const MIN_AIM_ANGLE = -Math.PI + 0.16;
export const MAX_AIM_ANGLE = -0.16;

export function clampAimAngle(angle) {
  return Math.max(MIN_AIM_ANGLE, Math.min(MAX_AIM_ANGLE, angle));
}

export function circleRectCollision(ball, rect) {
  const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.height));
  let dx = ball.x - closestX;
  let dy = ball.y - closestY;
  const distanceSquared = dx * dx + dy * dy;
  if (distanceSquared > ball.radius * ball.radius) return null;

  let distance = Math.sqrt(distanceSquared);
  if (distance < 0.0001) {
    const left = Math.abs(ball.x - rect.x);
    const right = Math.abs(rect.x + rect.width - ball.x);
    const top = Math.abs(ball.y - rect.y);
    const bottom = Math.abs(rect.y + rect.height - ball.y);
    const minimum = Math.min(left, right, top, bottom);
    if (minimum === left) {
      dx = -1;
      dy = 0;
    } else if (minimum === right) {
      dx = 1;
      dy = 0;
    } else if (minimum === top) {
      dx = 0;
      dy = -1;
    } else {
      dx = 0;
      dy = 1;
    }
    distance = 0;
  } else {
    dx /= distance;
    dy /= distance;
  }

  return { nx: dx, ny: dy, overlap: ball.radius - distance };
}

export function reflectedVelocity(vx, vy, normal) {
  const dot = vx * normal.nx + vy * normal.ny;
  return {
    vx: vx - 2 * dot * normal.nx,
    vy: vy - 2 * dot * normal.ny,
  };
}

export function getHorizontalLaserTargets(blocks, origin) {
  const originCenterRow =
    origin.row + Math.floor((origin.heightCells ?? 1) / 2);
  return blocks.filter((block) => {
    if (!block.alive || block === origin) return false;
    const blockBottom = block.row + (block.heightCells ?? 1);
    return block.row <= originCenterRow && originCenterRow < blockBottom;
  });
}

export function getPulseTargets(blocks, origin, pulse, getRect) {
  return blocks.filter((block) => {
    if (!block.alive || block === origin) return false;
    return Boolean(circleRectCollision(pulse, getRect(block)));
  });
}

export function resolveImpact(ball, passiveRanks = {}) {
  const definition = BALL_DEFINITIONS[ball.typeId];
  if (!definition) throw new Error(`Unknown ball type: ${ball.typeId}`);

  let damage = definition.damage;
  if (ball.hits === 0) damage += passiveRanks.tempered ?? 0;
  if (ball.bankedCharge > 0) {
    damage += ball.bankedCharge;
    ball.bankedCharge = 0;
  }
  if (ball.isFinal) damage += passiveRanks.overcharged ?? 0;

  ball.hits += 1;
  const emberBurst =
    definition.ability === "ember_burst" && !ball.emberTriggered;
  if (emberBurst) ball.emberTriggered = true;

  const stormChain =
    definition.ability === "storm_chain" &&
    ball.hits % definition.chainEvery === 0;
  const penetrates =
    definition.ability === "drill" && ball.penetrationsRemaining > 0;
  if (penetrates) ball.penetrationsRemaining -= 1;

  const lineBurst =
    definition.ability === "horizontal_laser" && !ball.lineTriggered;
  if (lineBurst) ball.lineTriggered = true;

  const pulseBurst =
    definition.ability === "ball_pulse" && (ball.pulseCharges ?? 0) > 0;

  return {
    damage,
    emberBurst,
    stormChain,
    lineBurst,
    pulseBurst,
    penetrates,
  };
}

export function hasFlightEnded(ball, exitY, maxSeconds) {
  return ball.y - ball.radius > exitY || ball.elapsed >= maxSeconds;
}
