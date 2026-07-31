{
// Set this to true to load the word bank from GitHub at runtime.
const USE_GITHUB_WORD_BANK = true;
const GITHUB_WORD_BANK_URL = "https://darkermango.github.io/5-Letter-words/words.txt";

const LOCAL_ANSWERS = [
    "apple", "beach", "brave", "bread", "candy", "chair", "charm", "chase", "clean", "clear",
    "cloud", "crown", "dream", "drink", "earth", "enjoy", "every", "field", "flame", "flour",
    "found", "fresh", "front", "fruit", "grace", "grain", "green", "heart", "house", "human",
    "jolly", "judge", "light", "magic", "match", "maybe", "ocean", "party", "peace", "pearl",
    "plant", "power", "proud", "quick", "quiet", "radio", "ready", "river", "rough", "round",
    "scale", "shine", "smile", "sound", "space", "spark", "start", "stone", "storm", "story",
    "sugar", "sunny", "sweet", "table", "taste", "thank", "theme", "thing", "tiger", "today",
    "touch", "tower", "trace", "train", "treat", "trust", "truth", "under", "union", "vivid",
    "voice", "watch", "water", "whale", "whole", "world", "write", "young", "throw", "trial",
    "arise", ""
];

let answers = [...LOCAL_ANSWERS];
let validGuesses = new Set([
    ...LOCAL_ANSWERS,
    "about", "after", "again", "being", "below", "could", "great", "known", "large", "learn",
    "never", "other", "right", "their", "there", "these", "three", "where", "which", "while",
    "woman", "words", "would", "hello", "books", "tests"
]);

type LetterState = "correct" | "present" | "absent";
type Theme = "light" | "dark";

type Stats = {
    played: number;
    wins: number;
    streak: number;
};

const board = document.querySelector<HTMLDivElement>("#board");
const keyboard = document.querySelector<HTMLDivElement>("#keyboard");
const statusElement = document.querySelector<HTMLParagraphElement>("#status");
const toast = document.querySelector<HTMLDivElement>("#toast");
const statsModal = document.querySelector<HTMLDialogElement>("#stats-modal");
const helpModal = document.querySelector<HTMLDialogElement>("#help-modal");
const themeButton = document.querySelector<HTMLButtonElement>("#theme-button");
const nextPuzzleButton = document.querySelector<HTMLButtonElement>("#next-puzzle");

if (!board || !keyboard || !statusElement || !toast || !statsModal || !helpModal || !themeButton || !nextPuzzleButton) {
    throw new Error("Could not find the Wordly game elements.");
}

const STATS_STORAGE_KEY = "wordly-stats";
const THEME_STORAGE_KEY = "wordly-theme";
const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

const loadGithubWordBank = async (): Promise<void> => {
    if (!USE_GITHUB_WORD_BANK) {
        return;
    }

    try {
        const response = await fetch(GITHUB_WORD_BANK_URL);

        if (!response.ok) {
            throw new Error(`GitHub word bank request failed: ${response.status}`);
        }

        const githubWords = (await response.text())
            .split(/\r?\n/)
            .map((word) => word.trim().toLowerCase())
            .filter((word) => /^[a-z]{5}$/.test(word));

        if (githubWords.length === 0) {
            throw new Error("GitHub word bank did not contain five-letter words.");
        }

        answers = githubWords;
        validGuesses = new Set(githubWords);
    } catch (error) {
        console.warn("Using the local word bank because the GitHub list could not be loaded.", error);
    }
};

let targetWord = "";
let guesses: string[] = [];
let currentGuess = "";
let gameOver = false;
let letterStates = new Map<string, LetterState>();
let revealedRows = new Set<number>();
let theme: Theme = localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
let stats: Stats = {
    played: 0,
    wins: 0,
    streak: 0
};

const loadStats = (): void => {
    try {
        const savedStats = localStorage.getItem(STATS_STORAGE_KEY);

        if (savedStats) {
            stats = {
                ...stats,
                ...(JSON.parse(savedStats) as Partial<Stats>)
            };
        }
    } catch {
        // Use fresh stats when local storage is unavailable or invalid.
    }
};

const saveStats = (): void => {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
};

const applyTheme = (): void => {
    document.documentElement.dataset.theme = theme;
    themeButton.textContent = theme === "dark" ? "☀" : "☾";
    themeButton.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
};

const toggleTheme = (): void => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme();
};

const showToast = (message: string): void => {
    toast.textContent = message;
    toast.classList.add("show");

    window.setTimeout(() => {
        toast.classList.remove("show");
    }, 1700);
};

const evaluateGuess = (guess: string): LetterState[] => {
    const result = Array<LetterState>(WORD_LENGTH).fill("absent");
    const remainingLetters = targetWord.split("");

    // Green letters are removed first so duplicate letters are scored correctly.
    for (let index = 0; index < WORD_LENGTH; index++) {
        if (guess[index] === targetWord[index]) {
            result[index] = "correct";
            remainingLetters[index] = "";
        }
    }

    for (let index = 0; index < WORD_LENGTH; index++) {
        if (result[index] === "correct") {
            continue;
        }

        const matchingIndex = remainingLetters.indexOf(guess[index] ?? "");

        if (matchingIndex !== -1) {
            result[index] = "present";
            remainingLetters[matchingIndex] = "";
        }
    }

    return result;
};

const renderBoard = (): void => {
    board.replaceChildren();

    for (let row = 0; row < MAX_GUESSES; row++) {
        const guess = guesses[row] ?? (row === guesses.length ? currentGuess : "");
        const result = guesses[row] ? evaluateGuess(guess) : [];

        for (let column = 0; column < WORD_LENGTH; column++) {
            const tile = document.createElement("div");
            const letter = guess[column] ?? "";
            const state = result[column];

            tile.className = "tile";
            tile.textContent = letter;

            if (letter) {
                tile.classList.add("filled");
            }

            if (state) {
                tile.classList.add(state);

                if (!revealedRows.has(row)) {
                    tile.classList.add("reveal");
                    tile.style.animationDelay = `${column * 90}ms`;
                }
            }

            board.append(tile);
        }

        if (guesses[row] && !revealedRows.has(row)) {
            revealedRows.add(row);
        }
    }
};

const createKeyboardButton = (label: string, action: string): HTMLButtonElement => {
    const button = document.createElement("button");

    button.className = "key";
    button.type = "button";
    button.textContent = label;
    button.dataset.action = action;

    if (action !== "letter") {
        button.classList.add("wide");
    }

    const state = letterStates.get(label.toLowerCase());

    if (state) {
        button.classList.add(state);
    }

    button.addEventListener("click", () => {
        handleKey(action === "letter" ? label.toLowerCase() : action);
    });

    return button;
};

const renderKeyboard = (): void => {
    keyboard.replaceChildren();

    KEYBOARD_ROWS.forEach((row, rowIndex) => {
        const keyboardRow = document.createElement("div");

        keyboardRow.className = "key-row";

        if (rowIndex === KEYBOARD_ROWS.length - 1) {
            keyboardRow.append(createKeyboardButton("ENTER", "submit"));
        }

        for (const letter of row) {
            keyboardRow.append(createKeyboardButton(letter, "letter"));
        }

        if (rowIndex === KEYBOARD_ROWS.length - 1) {
            keyboardRow.append(createKeyboardButton("⌫", "delete"));
        }

        keyboard.append(keyboardRow);
    });
};

const updateKeyboardState = (guess: string): void => {
    evaluateGuess(guess).forEach((state, index) => {
        const letter = guess[index];

        if (!letter) {
            return;
        }

        const previousState = letterStates.get(letter);
        const shouldUpdate = previousState !== "correct"
            && !(previousState === "present" && state === "absent");

        if (shouldUpdate) {
            letterStates.set(letter, state);
        }
    });
};

const finishGame = (won: boolean): void => {
    gameOver = true;
    stats.played += 1;

    if (won) {
        stats.wins += 1;
        stats.streak += 1;
        statusElement.textContent = "You found it — lovely work.";
        showToast("Brilliant!");
    } else {
        stats.streak = 0;
        statusElement.textContent = `The word was ${targetWord.toUpperCase()}.`;
        showToast(targetWord.toUpperCase());
    }

    nextPuzzleButton.hidden = false;
    saveStats();
};

const submitGuess = (): void => {
    if (currentGuess.length < WORD_LENGTH) {
        showToast("Need five letters");
        return;
    }

    if (!validGuesses.has(currentGuess)) {
        showToast("Not in the word list");
        return;
    }

    guesses.push(currentGuess);
    updateKeyboardState(currentGuess);
    currentGuess = "";

    renderBoard();
    renderKeyboard();

    if (guesses.at(-1) === targetWord) {
        finishGame(true);
    } else if (guesses.length === MAX_GUESSES) {
        finishGame(false);
    } else {
        statusElement.textContent = `${MAX_GUESSES - guesses.length} guesses left · keep going`;
    }
};

const handleKey = (key: string): void => {
    if (gameOver) {
        return;
    }

    if (key === "delete") {
        currentGuess = currentGuess.slice(0, -1);
        renderBoard();
    } else if (key === "submit") {
        submitGuess();
    } else if (/^[a-z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        currentGuess += key;
        renderBoard();
    }
};

const updateStatsDisplay = (): void => {
    document.querySelector("#played")!.textContent = `${stats.played}`;
    document.querySelector("#wins")!.textContent = `${stats.wins}`;
    document.querySelector("#streak")!.textContent = `${stats.streak}`;
    document.querySelector("#stats-message")!.textContent = stats.played
        ? "Ready for another round?"
        : "Your first puzzle is waiting.";
};

const startGame = (): void => {
    targetWord = answers[Math.floor(Math.random() * answers.length)] ?? "apple";
    guesses = [];
    currentGuess = "";
    gameOver = false;
    letterStates = new Map();
    revealedRows = new Set();
    statusElement.textContent = "Find the hidden word.";
    nextPuzzleButton.hidden = true;

    renderBoard();
    renderKeyboard();
};

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleKey("submit");
    } else if (event.key === "Backspace") {
        handleKey("delete");
    } else {
        handleKey(event.key.toLowerCase());
    }
});

document.querySelector("#help-button")?.addEventListener("click", () => {
    helpModal.showModal();
});

document.querySelector("#stats-button")?.addEventListener("click", () => {
    updateStatsDisplay();
    statsModal.showModal();
});

themeButton.addEventListener("click", toggleTheme);

document.querySelector("#new-game")?.addEventListener("click", () => {
    statsModal.close();
    startGame();
});

nextPuzzleButton.addEventListener("click", startGame);

document.querySelectorAll<HTMLButtonElement>("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
        document.getElementById(button.dataset.close ?? "")?.closest("dialog")?.close();
    });
});

applyTheme();
loadStats();
updateStatsDisplay();

if (USE_GITHUB_WORD_BANK) {
    statusElement.textContent = "Loading word bank...";
    loadGithubWordBank().then(startGame);
} else {
    startGame();
}
}
