# Permanent Relic Progression

**Status: Proposed, not implemented.**

## Goal

Give players a permanent build to develop across runs. Relics change how an arsenal is played, with upgrades that persist after victory or defeat.

## Current progression

- Forge Shards and purchased ball and passive unlocks persist between runs.
- Unlocking content makes it available in run drafts; it does not permanently equip it or raise its rank.
- Best score and boss victories are saved.
- Run level, XP, drafted balls, and passive ranks reset for each new run.
- Permanent relic equipment and relic levels do not currently exist.

## Proposed progression loop

1. Unlock a relic using Forge Shards.
2. Equip one relic before starting a run.
3. Play and earn Forge Shards, including on defeat.
4. Spend shards in the Forge to permanently upgrade the relic.
5. Start another run with its improved effect, or switch freely to another owned relic between runs.

The initial target is three relics with three permanent levels each and one equipped slot. Give players one free starter relic so they can experience the system immediately. Use the existing Forge Shards currency.

Keep normal ball and passive drafts separate. The equipped relic establishes a build direction before the run, while temporary draft choices shape that particular attempt. Relic levels persist; run passive ranks still reset.

## Example relics

These are design examples, with effects and numbers subject to balance tuning. Each higher level replaces the previous level's limit rather than stacking with it.

### Conductor's Seal

Rewards opening with a ball that reaches multiple targets, then following with stronger hits.

| Level | Effect |
| --- | --- |
| 1 — Mark | The first ball fired each turn marks the first surviving block it directly damages. Later balls deal +1 direct damage to that marked block this turn. |
| 2 — Spread | The opening ball can mark up to three distinct surviving blocks it directly damages. |
| 3 — Conduct | The opening ball can mark every surviving block it directly damages. |

Marks expire at the end of the turn. The damage bonus remains +1 at every level. Drill is a natural opening choice because its penetration can reach several targets; later balls can exploit those marks.

### Bankshot Engine

Rewards planning wall rebounds before a direct hit.

| Level | Effect |
| --- | --- |
| 1 | Each wall bounce charges the next direct hit by +1 damage, capped at +1. |
| 2 | The charge cap increases to +2. |
| 3 | The charge cap increases to +3. |

The charge resets after a direct hit. Higher levels reward routes with multiple wall bounces. Banked Heat is a natural passive pairing; their combined strength needs balance review.

## Open design choices

- **Third relic:** Choose another distinct playstyle to complete the initial set.
- **Starter selection:** Decide which relic is free and whether players choose it.
- **Upgrade prices:** Set unlock and level costs against actual Forge Shard earnings and the cost of existing content unlocks.
- **Balance tuning:** Validate effect limits, progression pacing, and interactions with shields, ball abilities, and existing passives.

This proposal records a future feature only; it does not change gameplay or save data.
