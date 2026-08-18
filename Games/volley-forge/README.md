# Volley-Forge

Volley-Forge is a framework-free Canvas roguelite. Aim each equipped ball individually, exhaust the arsenal, and shatter every formation before it descends across the danger line.

## Run locally

ES modules require a local web server rather than opening `index.html` directly. From the repository root:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/Games/Volley-Forge/`.

## Controls

- Pointer: select a ready ball, then drag and release on the play field.
- Keyboard: `1`–`4` selects a ball, arrow keys adjust aim, Space fires, and `P` pauses.
- Touch: tap an arsenal slot, drag across the play field, and release to fire.

## Tests

```powershell
npm run test:volley-forge
```

The suite covers turn exhaustion, encounter descent, danger-line defeat, drafts, arsenal replacement, every ball ability, physics helpers, forge rewards, and save-data recovery.
