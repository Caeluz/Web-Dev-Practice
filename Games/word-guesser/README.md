# Word Guesser

A mobile-friendly five-letter word guessing game built with HTML, CSS, and TypeScript.

## Features

- Six guesses per puzzle
- Physical and on-screen keyboard support
- Green, yellow, and grey letter feedback
- Light and dark mode
- Local game statistics
- Optional external word bank

## Word list

The game can load its five-letter word list from the following project:

<https://github.com/darkermango/5-Letter-words>

The source project identifies the word list as MIT licensed. The full license text is available in the source repository:

<https://github.com/darkermango/5-Letter-words/blob/main/LICENSE>

The GitHub word bank can be enabled in `script.ts`:

```ts
const USE_GITHUB_WORD_BANK = true;
```

When disabled, the game uses its local fallback word list.
