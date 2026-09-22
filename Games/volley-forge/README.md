# Volley Forge

Volley-Forge is a framework-free Canvas roguelite. Aim each equipped ball individually, exhaust the arsenal, and shatter every formation before it descends across the danger line.

## Run locally

ES modules require a local web server rather than opening `index.html` directly. From the repository root:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/Games/volley-forge/`.

## Controls

- Pointer: select a ready ball, then drag and release on the play field.
- Keyboard: `1`–`4` selects a ball, arrow keys adjust aim, Space fires, `R` recalls an eligible shot, and `P` pauses.
- Touch: tap an arsenal slot, drag across the play field, and release to fire.
- Forgeblade: drag its reticle and release to phase to the target, or move the reticle with all four arrow keys and press Space.

See the [Ball Guide](BALLS.md) for every ball's stats, unlock, ideal use, and passive interactions.

## Tests

```powershell
npm run test:volley-forge
```

The suite covers turn exhaustion, encounter descent, danger-line defeat, drafts, arsenal replacement, every ball ability, physics helpers, forge rewards, and save-data recovery.
