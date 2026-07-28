"use strict";
const input = document.getElementById("typing-input");
if (!(input instanceof HTMLInputElement)) {
    throw new Error("Could not find the typing input");
}
const wordDisplay = document.querySelector("#word-display");
if (!wordDisplay) {
    throw new Error("Could not find the word display");
}
const timerDisplay = document.querySelector("#timer-display");
const scoreDisplay = document.querySelector("#score-display");
const timerProgress = document.querySelector("#timer-progress");
const statusDisplay = document.querySelector("#status-display");
if (!timerDisplay || !scoreDisplay || !timerProgress || !statusDisplay) {
    throw new Error("Could not find the game status elements");
}
const START_DELAY = 500;
const TOTAL_TIME = 15;
const WORD_POINTS = 1;
const SENTENCE_BONUS = 10;
let timeRemaining = TOTAL_TIME;
let score = 0;
let timerId;
let gameStarted = false;
let gameOver = false;
let targetText = "";
let targetCharacters = [];
let characterElements = wordDisplay.querySelectorAll("span");
let sentenceWords = [];
let awardedWordCount = 0;
const updateScoreDisplay = () => {
    scoreDisplay.textContent = `Score: ${score}`;
};
const updateTimerDisplay = () => {
    const percentage = (timeRemaining / TOTAL_TIME) * 100;
    timerDisplay.textContent = `Time: ${timeRemaining}s`;
    timerProgress.style.width = `${percentage}%`;
    timerProgress.classList.toggle("warning", percentage <= 50 && percentage > 25);
    timerProgress.classList.toggle("danger", percentage <= 25);
};
const endGame = () => {
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
const startTimer = () => {
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
const renderSentence = () => {
    sentenceWords = getRandomizeSentence(WORDS, 20);
    targetText = sentenceWords.join(" ");
    targetCharacters = Array.from(targetText);
    awardedWordCount = 0;
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
            score += WORD_POINTS;
            awardedWordCount = index + 1;
        }
        else {
            break;
        }
    }
    updateScoreDisplay();
};
updateTimerDisplay();
updateScoreDisplay();
renderSentence();
input.addEventListener("input", () => {
    if (gameOver) {
        return;
    }
    startTimer();
    const typedText = input.value;
    updateCharacterDisplay(typedText);
    awardCompletedWords(typedText);
    if (targetText.startsWith(typedText)) {
        console.log("Correct so far");
    }
    else {
        console.log("Mistake");
    }
    if (typedText === targetText) {
        score += SENTENCE_BONUS;
        updateScoreDisplay();
        statusDisplay.textContent = `Sentence complete! +${SENTENCE_BONUS}`;
        input.value = "";
        renderSentence();
    }
});
//# sourceMappingURL=script.js.map