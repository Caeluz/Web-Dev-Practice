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
const mainUpgradesButton = document.querySelector("#main-upgrades-button");
const focusModeToggle = document.querySelector("#focus-mode-toggle");
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
const upgradesButton = document.querySelector("#upgrades-button");
const upgradeOverlay = document.querySelector("#upgrade-overlay");
const upgradeTree = document.querySelector("#upgrade-tree");
const bankedPointsDisplay = document.querySelector("#banked-points");
const backToTypingButton = document.querySelector("#back-to-typing");
const resetProgressButton = document.querySelector("#reset-progress-button");
if (!mainUpgradesButton ||
    !focusModeToggle ||
    !scoreDisplay ||
    !comboDisplay ||
    !timerProgress ||
    !statusDisplay ||
    !gameOverOverlay ||
    !finalScoreDisplay ||
    !finalWordsDisplay ||
    !finalAccuracyDisplay ||
    !finalComboDisplay ||
    !restartButton ||
    !upgradesButton ||
    !upgradeOverlay ||
    !upgradeTree ||
    !bankedPointsDisplay ||
    !backToTypingButton ||
    !resetProgressButton) {
    throw new Error("Could not find the game status elements");
}
const START_DELAY = 500;
const TOTAL_TIME = 5;
const SENTENCE_LENGTH = 3;
const BASE_WORD_POINTS = 1;
const SENTENCE_BONUS = 10;
const UPGRADE_STORAGE_KEY = "incremental-typing-game-upgrades";
const FOCUS_MODE_STORAGE_KEY = "incremental-typing-game-focus-mode";
const UPGRADE_NODES = [
    { id: "combo-spark", group: "top", name: "Combo Spark", effect: "Combo tier every 4 words", cost: 25 },
    { id: "combo-guard", group: "top", name: "Combo Guard", effect: "First mistake keeps combo", cost: 75, requires: "combo-spark" },
    { id: "combo-surge", group: "top", name: "Combo Surge", effect: "+2 points per combo tier", cost: 150, requires: "combo-guard" },
    { id: "extra-breath", group: "right", name: "Extra Breath", effect: "+1 starting second", cost: 25 },
    { id: "time-reserve", group: "right", name: "Time Reserve", effect: "+1 starting second", cost: 75, requires: "extra-breath" },
    { id: "sentence-time", group: "right", name: "Sentence Time", effect: "+1 second per sentence", cost: 150, requires: "time-reserve" },
    { id: "word-value", group: "bottom", name: "Word Value", effect: "+1 base word point", cost: 25 },
    { id: "sentence-value", group: "bottom", name: "Sentence Value", effect: "+5 sentence points", cost: 75, requires: "word-value" },
    { id: "double-dip", group: "bottom", name: "Double Dip", effect: "+1 sentence point", cost: 150, requires: "sentence-value" },
    { id: "second-wind", group: "left", name: "Second Wind", effect: "+3 seconds at zero", cost: 75 },
    { id: "lucky-word", group: "left", name: "Lucky Word", effect: "10% chance to double", cost: 150, requires: "second-wind" },
    { id: "sentence-medium", group: "length", name: "Longer Sentences", effect: "3 → 5 words", cost: 25 },
    { id: "sentence-long", group: "length", name: "Full Sentences", effect: "5 → 8 words", cost: 75, requires: "sentence-medium" },
    { id: "sentence-marathon", group: "length", name: "Marathon Sentences", effect: "8 → 12 words", cost: 150, requires: "sentence-long" }
];
let timeRemaining = TOTAL_TIME;
let score = 0;
let timerAnimationId;
let gameStarted = false;
let gameOver = false;
let timerEndTime = 0;
let startupTimeoutId;
let totalTime = TOTAL_TIME;
let bankedPoints = 0;
let purchasedUpgrades = [];
let runBanked = false;
let mistakeShieldUsed = false;
let secondWindUsed = false;
let focusModeEnabled = false;
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
const hasUpgrade = (id) => purchasedUpgrades.includes(id);
const loadFocusMode = () => {
    focusModeEnabled = localStorage.getItem(FOCUS_MODE_STORAGE_KEY) === "true";
};
const updateFocusModeToggle = () => {
    focusModeToggle.textContent = `Focus mode: ${focusModeEnabled ? "On" : "Off"}`;
    focusModeToggle.setAttribute("aria-pressed", `${focusModeEnabled}`);
};
const toggleFocusMode = () => {
    focusModeEnabled = !focusModeEnabled;
    localStorage.setItem(FOCUS_MODE_STORAGE_KEY, `${focusModeEnabled}`);
    updateFocusModeToggle();
};
const loadUpgradeState = () => {
    try {
        const saved = localStorage.getItem(UPGRADE_STORAGE_KEY);
        if (!saved) {
            return;
        }
        const data = JSON.parse(saved);
        bankedPoints = typeof data.bankedPoints === "number" ? data.bankedPoints : 0;
        purchasedUpgrades = Array.isArray(data.purchased)
            ? data.purchased.filter((id) => UPGRADE_NODES.some((upgrade) => upgrade.id === id))
            : [];
    }
    catch {
        bankedPoints = 0;
        purchasedUpgrades = [];
    }
};
const saveUpgradeState = () => {
    const data = { bankedPoints, purchased: purchasedUpgrades };
    localStorage.setItem(UPGRADE_STORAGE_KEY, JSON.stringify(data));
};
const getStartingTime = () => {
    return TOTAL_TIME
        + (hasUpgrade("extra-breath") ? 1 : 0)
        + (hasUpgrade("time-reserve") ? 1 : 0);
};
const getComboThreshold = () => hasUpgrade("combo-spark") ? 4 : 5;
const getBaseWordPoints = () => BASE_WORD_POINTS + (hasUpgrade("word-value") ? 1 : 0);
const getSentenceBonus = () => SENTENCE_BONUS
    + (hasUpgrade("sentence-value") ? 5 : 0)
    + (hasUpgrade("double-dip") ? 1 : 0);
const getSentenceLength = () => SENTENCE_LENGTH
    + (hasUpgrade("sentence-medium") ? 2 : 0)
    + (hasUpgrade("sentence-long") ? 3 : 0)
    + (hasUpgrade("sentence-marathon") ? 4 : 0);
const updateBankedPointsDisplay = () => {
    bankedPointsDisplay.textContent = `${bankedPoints}`;
};
const isPurchased = (id) => purchasedUpgrades.includes(id);
const renderUpgradeTree = () => {
    upgradeTree.replaceChildren();
    const groups = ["top", "right", "bottom", "left", "length"];
    const groupTitles = {
        top: "Combo",
        right: "Time",
        bottom: "Score",
        left: "Utility",
        length: "Sentence length"
    };
    groups.forEach((group) => {
        const branch = document.createElement("div");
        branch.className = `upgrade-branch branch-${group}`;
        const title = document.createElement("h2");
        title.className = "upgrade-branch-title";
        title.textContent = groupTitles[group];
        branch.append(title);
        const nodes = document.createElement("div");
        nodes.className = "upgrade-branch-nodes";
        UPGRADE_NODES.filter((upgrade) => upgrade.group === group).forEach((upgrade) => {
            const node = document.createElement("button");
            const purchased = isPurchased(upgrade.id);
            const prerequisiteMet = !upgrade.requires || isPurchased(upgrade.requires);
            const canBuy = !purchased && prerequisiteMet && bankedPoints >= upgrade.cost;
            node.className = "upgrade-node";
            node.classList.add(purchased ? "purchased" : canBuy ? "available" : "locked");
            node.disabled = purchased || !prerequisiteMet || bankedPoints < upgrade.cost;
            node.type = "button";
            node.dataset.upgradeId = upgrade.id;
            node.innerHTML = `<strong>${upgrade.name}</strong><small>${upgrade.effect}</small><small>${purchased ? "Purchased" : `${upgrade.cost} points`}</small>`;
            node.addEventListener("click", () => purchaseUpgrade(upgrade.id));
            nodes.append(node);
        });
        branch.append(nodes);
        upgradeTree.append(branch);
    });
    updateBankedPointsDisplay();
};
const purchaseUpgrade = (id) => {
    const upgrade = UPGRADE_NODES.find((item) => item.id === id);
    if (!upgrade || isPurchased(id) || bankedPoints < upgrade.cost) {
        return;
    }
    if (upgrade.requires && !isPurchased(upgrade.requires)) {
        return;
    }
    bankedPoints -= upgrade.cost;
    purchasedUpgrades.push(id);
    saveUpgradeState();
    renderUpgradeTree();
};
const showUpgradeTree = () => {
    if (gameStarted && !gameOver) {
        statusDisplay.textContent = "Finish this run to open upgrades.";
        return;
    }
    input.disabled = true;
    input.blur();
    gameOverOverlay.hidden = true;
    upgradeOverlay.hidden = false;
    renderUpgradeTree();
    upgradeTree.querySelector(".available")?.focus();
};
const hideUpgradeTree = () => {
    upgradeOverlay.hidden = true;
    if (gameOver) {
        gameOverOverlay.hidden = false;
        upgradesButton.focus();
    }
    else {
        gameOverOverlay.hidden = true;
        scheduleInputReady();
    }
};
const resetProgress = () => {
    if (!window.confirm("Reset all banked points and purchased upgrades?")) {
        return;
    }
    bankedPoints = 0;
    purchasedUpgrades = [];
    saveUpgradeState();
    renderUpgradeTree();
};
loadUpgradeState();
loadFocusMode();
updateFocusModeToggle();
const updateScoreDisplay = () => {
    scoreDisplay.textContent = `Score: ${score}`;
};
const updateComboDisplay = () => {
    comboDisplay.textContent = `Combo: ${combo}`;
};
const updateTimerDisplay = (percentage = (timeRemaining / totalTime) * 100) => {
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
    if (!runBanked) {
        bankedPoints += score;
        runBanked = true;
        saveUpgradeState();
    }
    const accuracy = typedCharacters > 0
        ? Math.round((correctCharacters / typedCharacters) * 100)
        : 0;
    finalScoreDisplay.textContent = `Score: ${score}`;
    finalWordsDisplay.textContent = `${wordsCompletedThisRun}`;
    finalAccuracyDisplay.textContent = `${accuracy}%`;
    finalComboDisplay.textContent = `${highestCombo}`;
    if (focusModeEnabled) {
        resetRun();
        return;
    }
    upgradesButton.disabled = false;
    gameOverOverlay.hidden = false;
    // restartButton.focus();
};
const startTimer = () => {
    if (gameStarted || gameOver) {
        return;
    }
    gameStarted = true;
    statusDisplay.textContent = "Typing...";
    timerEndTime = performance.now() + totalTime * 1000;
    const animateTimer = (currentTime) => {
        const millisecondsRemaining = Math.max(0, timerEndTime - currentTime);
        const percentage = Math.min(100, (millisecondsRemaining / (totalTime * 1000)) * 100);
        timeRemaining = Math.ceil(millisecondsRemaining / 1000);
        updateTimerDisplay(percentage);
        if (millisecondsRemaining <= 0) {
            if (hasUpgrade("second-wind") && !secondWindUsed) {
                secondWindUsed = true;
                totalTime += 3;
                timeRemaining = 3;
                timerEndTime = currentTime + 3000;
                statusDisplay.textContent = "Second Wind! +3 seconds";
                timerAnimationId = window.requestAnimationFrame(animateTimer);
                return;
            }
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
    totalTime = getStartingTime();
    timeRemaining = totalTime;
    score = 0;
    gameStarted = false;
    gameOver = false;
    timerEndTime = 0;
    runBanked = false;
    awardedWordCount = 0;
    committedLength = 0;
    combo = 0;
    lastInputWasIncorrect = false;
    wordsCompletedThisRun = 0;
    typedCharacters = 0;
    correctCharacters = 0;
    highestCombo = 0;
    mistakeShieldUsed = false;
    secondWindUsed = false;
    input.value = "";
    gameOverOverlay.hidden = true;
    upgradeOverlay.hidden = true;
    upgradesButton.disabled = true;
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
    sentenceWords = getRandomizeSentence(WORDS, getSentenceLength());
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
            const comboTierPoints = hasUpgrade("combo-surge") ? 2 : 1;
            let points = getBaseWordPoints()
                + Math.floor(combo / getComboThreshold()) * comboTierPoints;
            if (hasUpgrade("lucky-word") && Math.random() < 0.1) {
                points *= 2;
            }
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
totalTime = getStartingTime();
timeRemaining = totalTime;
updateTimerDisplay();
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
            if (hasUpgrade("combo-guard") && !mistakeShieldUsed) {
                mistakeShieldUsed = true;
            }
            else {
                combo = 0;
            }
            updateComboDisplay();
        }
        lastInputWasIncorrect = true;
        console.log("Mistake");
    }
    if (typedText === targetText) {
        const sentenceBonus = getSentenceBonus();
        score += sentenceBonus;
        updateScoreDisplay();
        showRewardPopup(`+${sentenceBonus}`, true, targetText.length - 1);
        statusDisplay.textContent = `Sentence complete! +${sentenceBonus}`;
        if (hasUpgrade("sentence-time") && gameStarted) {
            totalTime += 1;
            timerEndTime += 1000;
        }
        input.value = "";
        renderSentence();
    }
});
restartButton.addEventListener("click", resetRun);
focusModeToggle.addEventListener("click", toggleFocusMode);
upgradesButton.addEventListener("click", showUpgradeTree);
backToTypingButton.addEventListener("click", hideUpgradeTree);
resetProgressButton.addEventListener("click", resetProgress);
mainUpgradesButton.addEventListener("click", showUpgradeTree);
document.addEventListener("keydown", (event) => {
    if (!upgradeOverlay.hidden) {
        if (event.key === "Escape") {
            event.preventDefault();
            hideUpgradeTree();
            return;
        }
        return;
    }
    if (!gameOver) {
        return;
    }
    if (event.key === "Enter" || event.key.toLowerCase() === "r") {
        event.preventDefault();
        resetRun();
    }
});
//# sourceMappingURL=script.js.map