"use strict";
const input = document.getElementById("typing-input");
if (!(input instanceof HTMLInputElement)) {
    throw new Error("Could not find the typing input");
}
const wordDisplay = document.querySelector("#word-display");
if (!wordDisplay) {
    throw new Error("Could not find the word display");
}
const typingArea = document.querySelector("#typing-area");
if (!typingArea) {
    throw new Error("Could not find the typing area");
}
const timerDisplay = document.querySelector("#timer-display");
const scoreDisplay = document.querySelector("#score-display");
const comboDisplay = document.querySelector("#combo-display");
const timerProgress = document.querySelector("#timer-progress");
const statusDisplay = document.querySelector("#status-display");
const gameOverOverlay = document.querySelector("#game-over-overlay");
const finalScoreDisplay = document.querySelector("#final-score");
const finalWordsDisplay = document.querySelector("#final-words");
const finalAccuracyDisplay = document.querySelector("#final-accuracy");
const finalComboDisplay = document.querySelector("#final-combo");
const restartButton = document.querySelector("#restart-button");
if (!scoreDisplay ||
    !comboDisplay ||
    !timerProgress ||
    !statusDisplay ||
    !gameOverOverlay ||
    !finalScoreDisplay ||
    !finalWordsDisplay ||
    !finalAccuracyDisplay ||
    !finalComboDisplay ||
    !restartButton) {
    throw new Error("Could not find the game status elements");
}
const START_DELAY = 500;
const TOTAL_TIME = 5;
const SENTENCE_LENGTH = 8;
const BASE_WORD_POINTS = 1;
const SENTENCE_BONUS = 10;
let timeRemaining = TOTAL_TIME;
let score = 0;
let timerAnimationId;
let gameStarted = false;
let gameOver = false;
let timerEndTime = 0;
let startupTimeoutId;
let targetText = "";
let targetCharacters = [];
let characterElements = wordDisplay.querySelectorAll("span");
let sentenceWords = [];
let awardedWordCount = 0;
let committedLength = 0;
let combo = 0;
let lastInputWasIncorrect = false;
let wordsCompletedThisRun = 0;
let typedCharacters = 0;
let correctCharacters = 0;
let highestCombo = 0;
const updateScoreDisplay = () => {
    scoreDisplay.textContent = `Score: ${score}`;
};
const updateComboDisplay = () => {
    comboDisplay.textContent = `Combo: ${combo}`;
};
const updateTimerDisplay = (percentage = (timeRemaining / TOTAL_TIME) * 100) => {
    if (timerDisplay) {
        timerDisplay.textContent = `Time: ${timeRemaining}s`;
    }
    timerProgress.style.width = `${percentage}%`;
    timerProgress.classList.toggle("warning", percentage <= 50 && percentage > 25);
    timerProgress.classList.toggle("danger", percentage <= 25);
};
const endGame = () => {
    gameOver = true;
    timeRemaining = 0;
    updateTimerDisplay();
    if (timerAnimationId !== undefined) {
        window.cancelAnimationFrame(timerAnimationId);
    }
    input.disabled = true;
    input.blur();
    statusDisplay.textContent = `Time's up! Final score: ${score}`;
    const accuracy = typedCharacters > 0
        ? Math.round((correctCharacters / typedCharacters) * 100)
        : 0;
    finalScoreDisplay.textContent = `Score: ${score}`;
    finalWordsDisplay.textContent = `${wordsCompletedThisRun}`;
    finalAccuracyDisplay.textContent = `${accuracy}%`;
    finalComboDisplay.textContent = `${highestCombo}`;
    gameOverOverlay.hidden = false;
    // restartButton.focus();
};
const startTimer = () => {
    if (gameStarted || gameOver) {
        return;
    }
    gameStarted = true;
    statusDisplay.textContent = "Typing...";
    timerEndTime = performance.now() + TOTAL_TIME * 1000;
    const animateTimer = (currentTime) => {
        const millisecondsRemaining = Math.max(0, timerEndTime - currentTime);
        const percentage = (millisecondsRemaining / (TOTAL_TIME * 1000)) * 100;
        timeRemaining = Math.ceil(millisecondsRemaining / 1000);
        updateTimerDisplay(percentage);
        if (millisecondsRemaining <= 0) {
            endGame();
            return;
        }
        timerAnimationId = window.requestAnimationFrame(animateTimer);
    };
    timerAnimationId = window.requestAnimationFrame(animateTimer);
};
const scheduleInputReady = () => {
    input.disabled = true;
    statusDisplay.textContent = "Get ready...";
    if (startupTimeoutId !== undefined) {
        window.clearTimeout(startupTimeoutId);
    }
    startupTimeoutId = window.setTimeout(() => {
        input.disabled = false;
        input.focus();
        statusDisplay.textContent = "Ready - start typing";
    }, START_DELAY);
};
const resetRun = () => {
    if (timerAnimationId !== undefined) {
        window.cancelAnimationFrame(timerAnimationId);
    }
    timeRemaining = TOTAL_TIME;
    score = 0;
    gameStarted = false;
    gameOver = false;
    timerEndTime = 0;
    awardedWordCount = 0;
    committedLength = 0;
    combo = 0;
    lastInputWasIncorrect = false;
    wordsCompletedThisRun = 0;
    typedCharacters = 0;
    correctCharacters = 0;
    highestCombo = 0;
    input.value = "";
    gameOverOverlay.hidden = true;
    updateTimerDisplay();
    updateScoreDisplay();
    updateComboDisplay();
    renderSentence();
    scheduleInputReady();
};
// Wait for the page to finish loading before accepting keyboard input.
scheduleInputReady();
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
const getRandomizeSentence = (words, length) => {
    if (words.length === 0) {
        throw new Error("The words array cannot be empty");
    }
    const sentence = [];
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        const randomWord = words[randomIndex];
        if (randomWord === undefined) {
            throw new Error("Could not select a random word");
        }
        sentence.push(randomWord);
    }
    return sentence;
};
const showRewardPopup = (text, isSentenceReward = false, anchorIndex) => {
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
    }
    else {
        popup.style.left = `${areaRect.width / 2 - popup.offsetWidth / 2}px`;
        popup.style.top = `${areaRect.height / 2 - popup.offsetHeight / 2}px`;
    }
    window.setTimeout(() => {
        popup.remove();
    }, 700);
};
const pulseCompletedWord = (wordIndex) => {
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
const renderSentence = () => {
    sentenceWords = getRandomizeSentence(WORDS, SENTENCE_LENGTH);
    targetText = sentenceWords.join(" ");
    targetCharacters = Array.from(targetText);
    awardedWordCount = 0;
    committedLength = 0;
    wordDisplay.replaceChildren(...targetCharacters.map((character) => {
        const span = document.createElement("span");
        span.textContent = character;
        return span;
    }));
    characterElements = wordDisplay.querySelectorAll("span");
    updateCharacterDisplay("");
};
const updateCharacterDisplay = (typedText) => {
    characterElements.forEach((character, index) => {
        character.className = "";
        if (index < typedText.length) {
            character.classList.add(typedText[index] === targetCharacters[index]
                ? "correct"
                : "incorrect");
        }
        else if (index === typedText.length) {
            character.classList.add("current");
        }
    });
};
const awardCompletedWords = (typedText) => {
    for (let index = awardedWordCount; index < sentenceWords.length; index++) {
        const wordEnd = sentenceWords
            .slice(0, index + 1)
            .join(" ")
            .length + (index < sentenceWords.length - 1 ? 1 : 0);
        const completedWord = typedText.slice(0, wordEnd) === targetText.slice(0, wordEnd);
        if (typedText.length >= wordEnd && completedWord) {
            combo += 1;
            wordsCompletedThisRun += 1;
            highestCombo = Math.max(highestCombo, combo);
            const points = BASE_WORD_POINTS + Math.floor(combo / 5);
            score += points;
            awardedWordCount = index + 1;
            committedLength = wordEnd;
            // Change this for the reward-popup location
            const wordAnchorIndex = wordEnd - 2 - (index < sentenceWords.length - 1 ? 1 : 0);
            showRewardPopup(`+${points}`, false, wordAnchorIndex);
            pulseCompletedWord(index);
        }
        else {
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
input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" &&
        input.selectionStart !== null &&
        input.selectionStart <= committedLength) {
        event.preventDefault();
        return;
    }
    if (event.key === " " && input.value.length === 0) {
        event.preventDefault();
        return;
    }
    if (event.key.length === 1) {
        const typedIndex = input.value.length;
        typedCharacters += 1;
        if (event.key === targetCharacters[typedIndex]) {
            correctCharacters += 1;
        }
    }
});
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
    }
    else {
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
restartButton.addEventListener("click", resetRun);
document.addEventListener("keydown", (event) => {
    if (!gameOver) {
        return;
    }
    if (event.key === "Enter" || event.key.toLowerCase() === "r") {
        event.preventDefault();
        resetRun();
    }
});
//# sourceMappingURL=script.js.map