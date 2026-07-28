const input = document.getElementById("typing-input");

if (!(input instanceof HTMLInputElement)) {
    throw new Error("Could not find the typing input");
}

const wordDisplay = document.querySelector<HTMLDivElement>("#word-display");

if (!wordDisplay) {
    throw new Error("Could not find the word display");
}

const typingArea = document.querySelector<HTMLElement>("#typing-area");

if (!typingArea) {
    throw new Error("Could not find the typing area");
}

const timerDisplay = document.querySelector<HTMLDivElement>("#timer-display");
const scoreDisplay = document.querySelector<HTMLDivElement>("#score-display");
const comboDisplay = document.querySelector<HTMLDivElement>("#combo-display");
const timerProgress = document.querySelector<HTMLDivElement>("#timer-progress");
const statusDisplay = document.querySelector<HTMLDivElement>("#status-display");

if (!scoreDisplay || !comboDisplay || !timerProgress || !statusDisplay) {
    throw new Error("Could not find the game status elements");
}

const START_DELAY = 500;
const TOTAL_TIME = 15;
const SENTENCE_LENGTH = 8;
const BASE_WORD_POINTS = 1;
const SENTENCE_BONUS = 10;

let timeRemaining = TOTAL_TIME;
let score = 0;
let timerId: number | undefined;
let gameStarted = false;
let gameOver = false;

let targetText = "";
let targetCharacters: string[] = [];
let characterElements: NodeListOf<HTMLSpanElement> = wordDisplay.querySelectorAll("span");
let sentenceWords: string[] = [];
let awardedWordCount = 0;
let combo = 0;
let lastInputWasIncorrect = false;

const updateScoreDisplay = (): void => {
    scoreDisplay.textContent = `Score: ${score}`;
};

const updateComboDisplay = (): void => {
    comboDisplay.textContent = `Combo: ${combo}`;
};

const updateTimerDisplay = (): void => {
    const percentage = (timeRemaining / TOTAL_TIME) * 100;

    if (timerDisplay) {
        timerDisplay.textContent = `Time: ${timeRemaining}s`;
    }
    timerProgress.style.width = `${percentage}%`;
    timerProgress.classList.toggle("warning", percentage <= 50 && percentage > 25);
    timerProgress.classList.toggle("danger", percentage <= 25);
};

const endGame = (): void => {
    gameOver = true;
    timeRemaining = 0;
    updateTimerDisplay();

    if (timerId !== undefined) {
        window.clearInterval(timerId);
    }

    input.disabled = true;
    input.blur();
    statusDisplay.textContent = `Time's up! Final score: ${score}`;
};

const startTimer = (): void => {
    if (gameStarted || gameOver) {
        return;
    }

    gameStarted = true;
    statusDisplay.textContent = "Typing...";
    timerId = window.setInterval(() => {
        timeRemaining -= 1;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
};

// Wait for the page to finish loading before accepting keyboard input.
setTimeout(() => {
    input.disabled = false;
    input.focus();
    statusDisplay.textContent = "Ready - start typing";
}, START_DELAY);


const WORDS = [
  "time", "people", "year", "way", "day", "man", "thing", "woman", "life", "child",
  "world", "school", "state", "family", "student", "group", "country", "problem", "hand", "part",
  "place", "case", "week", "company", "system", "program", "question", "work", "government", "number",
  "night", "point", "home", "water", "room", "mother", "area", "money", "story", "fact",
  "month", "lot", "right", "study", "book", "eye", "job", "word", "business", "issue",
  "side", "kind", "head", "house", "service", "friend", "father", "power", "hour", "game",
  "line", "end", "member", "law", "car", "city", "community", "name", "president", "team",
  "minute", "idea", "kid", "body", "information", "back", "parent", "face", "others", "level",
  "office", "door", "health", "person", "art", "war", "history", "party", "result", "change",
  "morning", "reason", "research", "girl", "guy", "moment", "air", "teacher", "force", "education",
  "foot", "boy", "age", "policy", "process", "music", "market", "sense", "nation", "plan",
  "college", "interest", "death", "experience", "effect", "use", "class", "control", "care", "field",
  "development", "role", "effort", "rate", "heart", "drug", "leader", "light", "voice", "wife",
  "police", "mind", "price", "report", "decision", "son", "view", "relationship", "town", "road",
  "drive", "arm", "difference", "value", "building", "action", "model", "season", "society", "tax",
  "director", "position", "player", "record", "paper", "space", "ground", "form", "event", "official",
  "matter", "center", "couple", "site", "project", "activity", "table", "court", "oil", "window",
  "phone", "computer", "food", "chair", "picture", "river", "tree", "flower", "bird", "cat",
  "dog", "apple", "orange", "banana", "bread", "coffee", "tea", "milk", "sugar", "salt",
  "pencil", "letter", "camera", "garden", "forest", "mountain", "ocean", "beach", "rain", "snow",
  "wind", "cloud", "storm", "summer", "winter", "spring", "autumn", "happy", "strong", "simple",
  "quick", "small", "large", "early", "late", "clean", "bright", "dark", "open", "close",
  "start", "finish", "learn", "write", "read", "think", "create", "build", "move", "walk",
  "run", "jump", "smile", "laugh", "listen", "watch"
];

const getRandomizeSentence = (words: string[], length: number): string[] => {
    if (words.length === 0) {
        throw new Error("The words array cannot be empty");
    }

    const sentence: string[] = [];
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        const randomWord = words[randomIndex];

        if (randomWord === undefined) {
            throw new Error("Could not select a random word");
        }

        sentence.push(randomWord);
    }

    return sentence
}

const showRewardPopup = (
    text: string,
    isSentenceReward = false,
    anchorIndex?: number
): void => {
    const popup = document.createElement("div");
    popup.className = isSentenceReward
        ? "reward-popup sentence-reward"
        : "reward-popup";
    popup.textContent = text;
    typingArea.append(popup);

    const anchor = anchorIndex === undefined
        ? undefined
        : characterElements[anchorIndex];
    const areaRect = typingArea.getBoundingClientRect();

    if (anchor) {
        const anchorRect = anchor.getBoundingClientRect();
        const rightLeft = anchorRect.right - areaRect.left + 10;
        const leftLeft = anchorRect.left - areaRect.left - popup.offsetWidth - 10;
        const fitsOnRight = rightLeft + popup.offsetWidth <= areaRect.width - 8;
        const left = fitsOnRight ? rightLeft : Math.max(8, leftLeft);
        const popupFitsAbove = anchorRect.top >= popup.offsetHeight + 12;
        const top = popupFitsAbove
            ? anchorRect.top - areaRect.top - popup.offsetHeight - 8
            : anchorRect.bottom - areaRect.top + 8;

        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
    } else {
        popup.style.left = `${areaRect.width / 2 - popup.offsetWidth / 2}px`;
        popup.style.top = `${areaRect.height / 2 - popup.offsetHeight / 2}px`;
    }

    window.setTimeout(() => {
        popup.remove();
    }, 700);
};

const pulseCompletedWord = (wordIndex: number): void => {
    const word = sentenceWords[wordIndex];


    if (!word) {
        return;
    }

    const wordStart = sentenceWords
        .slice(0, wordIndex)
        .join(" ")
        .length + (wordIndex > 0 ? 1 : 0);
    const wordEnd = wordStart + word.length;

    for (let index = wordStart; index < wordEnd; index++) {
        const character = characterElements[index];

        if (!character) {
            continue;
        }

        character.classList.remove("word-pulse");
        void character.offsetWidth;
        character.classList.add("word-pulse");
    }
};

const renderSentence = (): void => {
    sentenceWords = getRandomizeSentence(WORDS, SENTENCE_LENGTH);
    targetText = sentenceWords.join(" ");
    targetCharacters = Array.from(targetText);
    awardedWordCount = 0;

    wordDisplay.replaceChildren(
        ...targetCharacters.map((character) => {
            const span = document.createElement("span");
            span.textContent = character;
            return span;
        })
    );

    characterElements = wordDisplay.querySelectorAll("span");
    updateCharacterDisplay("");
};

const updateCharacterDisplay = (typedText: string): void => {
    characterElements.forEach((character, index) => {
        character.className = "";

        if (index < typedText.length) {
            character.classList.add(
                typedText[index] === targetCharacters[index]
                    ? "correct"
                    : "incorrect"
            );
        } else if (index === typedText.length) {
            character.classList.add("current");
        }
    });
};

const awardCompletedWords = (typedText: string): void => {
    for (let index = awardedWordCount; index < sentenceWords.length; index++) {
        const wordEnd = sentenceWords
            .slice(0, index + 1)
            .join(" ")
            .length + (index < sentenceWords.length - 1 ? 1 : 0);

        const completedWord = typedText.slice(0, wordEnd) === targetText.slice(0, wordEnd);

        if (typedText.length >= wordEnd && completedWord) {
            combo += 1;
            const points = BASE_WORD_POINTS + Math.floor(combo / 5);
            score += points;
            awardedWordCount = index + 1;
            // Change this for the reward-popup location
            const wordAnchorIndex = wordEnd - 2 - (index < sentenceWords.length - 1 ? 1 : 0);
            showRewardPopup(`+${points}`, false, wordAnchorIndex);
            pulseCompletedWord(index);
        } else {
            break;
        }
    }

    updateScoreDisplay();
    updateComboDisplay();
};

updateTimerDisplay();
updateScoreDisplay();
updateComboDisplay();
renderSentence();

input.addEventListener("input", () => {
    if (gameOver) {
        return;
    }

    startTimer();

    const typedText = input.value;
    updateCharacterDisplay(typedText);
    awardCompletedWords(typedText);

    const isCorrectPrefix = targetText.startsWith(typedText);

    if (isCorrectPrefix) {
        lastInputWasIncorrect = false;
        console.log("Correct so far");
    } else {
        if (!lastInputWasIncorrect) {
            combo = 0;
            updateComboDisplay();
        }
        lastInputWasIncorrect = true;
        console.log("Mistake");
    }

    if (typedText === targetText) {
        score += SENTENCE_BONUS;
        updateScoreDisplay();
        showRewardPopup(`+${SENTENCE_BONUS}`, true, targetText.length - 1);
        statusDisplay.textContent = `Sentence complete! +${SENTENCE_BONUS}`;
        input.value = "";
        renderSentence();
    }
});
