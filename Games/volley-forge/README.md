# Volley Forge

Volley-Forge is a framework-free Canvas roguelite. Aim each equipped ball individually, exhaust the arsenal, and shatter every formation before it descends across the danger line.

## Run locally

ES modules require a local web server rather than opening `index.html` directly. From the repository root:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/Games/volley-forge/`.

## Controls

- Before each run or restart, choose one owned starting ball and select **Begin Run**. Purchased legendary balls are eligible too. Your last confirmed choice is remembered across sessions.
- In the starter picker, use Tab to navigate, arrow keys to change the selected ball, and Enter or Space to activate a button. Cancel or Escape returns without changing your run or saved selection.
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
