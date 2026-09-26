# Volley Forge Ball Guide

Every ball occupies one arsenal slot and becomes spent after its shot resolves. Damage is the unmodified amount before passives, shields, or special effects.

Before each run, you can choose any owned ball as your single starter, including Forgeblade after purchasing it. The picker remembers your last confirmed choice. Other eligible balls can still appear in drafts; your currently equipped balls are excluded.

## Quick reference

| Ball | Role | Damage | Speed | Radius | Ability | Unlock | Ideal use |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| Iron Ball | Reliable ricochet | 1 | 610 | 10 | Standard shot | Starter | Predictable angles and long rebound paths |
| Ember Core | Area burst | 1 | 585 | 10 | First impact scorches adjacent blocks for 1 | Starter | Tight formations and volatile setups |
| Hammer Ball | Heavy hitter | 2 | 500 | 13 | High damage on every collision | Starter | Armored, shielded, and high-health blocks |
| Drill Ball | Formation breach | 1 | 630 | 9 | Penetrates its first 2 blocks | 28 Forge Shards | Dense rows and reaching protected blocks |
| Storm Orb | Chained damage | 1 | 600 | 10 | Every third hit arcs 1 damage to the nearest survivor | 40 Forge Shards | Long ricochets through spread formations |
| Linebreaker | Row clear | 1 | 600 | 10 | First damaging hit beams 1 damage across its row | 36 Forge Shards | Wide horizontal formations |
| Pulse Core | Repeated area damage | 1 | 590 | 10 | Damaging impacts emit a 104px, 1-damage pulse; 99 charges | 36 Forge Shards | Packed clusters and multi-hit routes |
| Forgeblade Core | Precision sweep | 2 | 820 | 9 | Phases to a target and slashes up to 5 nearby blocks | Defeat the Forge Warden, then 90 Forge Shards | Removing a dangerous cluster with exact control |

## Ball details

### Iron Ball

The baseline ball. Iron has no special trigger to manage, so its trajectory and passive bonuses are easy to predict. Use it to learn a formation or to exploit a strong banked route.

### Ember Core

Ember's first block collision triggers one adjacent burst. The burst deals 1 damage to blocks touching the impact block orthogonally. The burst itself does not trigger Shattering Force.

### Hammer Ball

Hammer trades speed for size and 2 base damage on every collision. It is particularly useful when a shield must be removed before later balls attack the same block.

### Drill Ball

Drill passes through its first two contacted blocks after damaging them. After both penetrations are used, it ricochets normally. Its small radius and fast travel reward narrow firing lanes.

### Storm Orb

Every third damaging impact arcs 1 damage to the nearest surviving block. Arc damage does not start another Shattering Force cascade.

### Linebreaker

Its first damaging collision fires a horizontal beam through other living blocks in that impact row. A shielded hit does not consume the beam trigger, so Linebreaker can still fire it after reaching an unshielded target.

### Pulse Core

Each damaging collision consumes one of 99 pulse charges and emits a 104px shockwave. Blocks touched by the wave take 1 damage once for that pulse. Shield-only contact does not consume a charge.

## Forgeblade Core

Forgeblade is a Legendary precision ball. Selecting it replaces the ricochet guide with an exact target reticle:

- Drag the pointer or a touch to place the reticle, then release to fire.
- With a keyboard, use all four arrow keys to move the reticle 24 canvas pixels and press Space to fire.
- On its first use in a run, the reticle begins at a fixed point directly above the cannon in the middle of the playable block field; it never searches for or snaps to a block.
- After you move it, Forgeblade remembers that target while switching balls, advancing turns or encounters, and resetting the Dev Lab board.
- The reticle stays inside the playable block field. It must reach at least one living block or the shot will not fire or become spent.

The preview shows the phased path, the 88px sword reach, and the exact targets numbered in priority order. Forgeblade passes through blocks and walls without colliding, dealing damage, bouncing, or activating abilities. At the destination it completes one clockwise 0.55-second sword rotation, striking the nearest five living blocks at most once each. The ball disappears only after the animation finishes.

The closest block is the primary target. It receives 2 base damage and is the only slash eligible for Tempered Edge, Overcharged Chamber, and Shattering Force. The other four possible targets receive exactly 2 damage from Forgeblade; their destruction cannot start Shattering Force. Shields absorb a slash in the normal way.

To unlock Forgeblade, defeat the Forge Warden at least once, then purchase it in the Forge for 90 Forge Shards. Once unlocked, it can appear as a normal ball draft and uses a normal arsenal slot and replacement choice.

## Passive interaction guide

| Passive | General behavior |
| --- | --- |
| Tempered Edge | Adds 1 damage per rank to the first block hit by each ball. |
| Banked Heat | A wall bounce charges the next direct block hit with 1 extra damage per rank. |
| Overcharged Chamber | Adds 1 damage per rank to direct hits by the final ready ball of a turn. |
| Shattering Force | A block destroyed by an eligible direct hit damages its orthogonal neighbors for 1 per rank. Secondary ability damage does not create repeated cascades. |
| Surveyor's Lens | Extends the normal ricochet preview by one predicted collision per rank. |

### Forgeblade compatibility

| Passive | Forgeblade interaction |
| --- | --- |
| Tempered Edge | Applies only to the nearest, primary sweep target. |
| Banked Heat | No interaction. Phased travel ignores walls and never bounces. |
| Overcharged Chamber | If Forgeblade is the final ball, applies only to the primary sweep target. |
| Shattering Force | Can trigger only when the primary target is destroyed. Other sweep targets cannot trigger it. |
| Surveyor's Lens | No interaction. Forgeblade always previews its exact path, reach, and affected targets. |
