"use strict";
const input = document.getElementById("typing-input");
if (!(input instanceof HTMLInputElement)) {
    throw new Error("Could not find the typing input");
}
const wordDisplay = document.querySelector("#word-display");
if (!wordDisplay) {
    throw new Error("Could not find the word display");
}
const START_DELAY = 500;
// Wait for the page to finish loading before accepting keyboard input.
setTimeout(() => {
    input.disabled = false;
    input.focus();
    console.log("Ready - start typing");
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
const sentence = getRandomizeSentence(WORDS, 20);
const targetText = sentence.join(" ");
const targetCharacters = Array.from(targetText);
wordDisplay.replaceChildren(...targetCharacters.map((character) => {
    const span = document.createElement("span");
    span.textContent = character;
    return span;
}));
const characterElements = wordDisplay.querySelectorAll("span");
input.addEventListener("input", () => {
    const typedText = input.value;
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
    if (targetText.startsWith(typedText)) {
        console.log("Correct so far");
    }
    else {
        console.log("Mistake");
    }
    if (typedText === targetText) {
        console.log("Completed!");
    }
});
//# sourceMappingURL=script.js.map