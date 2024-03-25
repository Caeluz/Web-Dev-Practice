import { runWithTimer, sleep, renderBars } from "../utils.js";
let insertionSortArray = [];

const insertionSortSettings = {
  name: "insertionSort",
  arrayLength: 50, // Default array length
  animationSpeed: 50, // Default animation speed in milliseconds
};

// Function to generate random array for insertion sort
function generateInsertionSortArray() {
  insertionSortArray = [];
  for (let i = 0; i < insertionSortSettings.arrayLength; i++) {
    insertionSortArray.push(Math.floor(Math.random() * 100) + 1);
  }
}

// Function to render bars for insertion sort
function renderInsertionSortBars() {
  const container = document.getElementById("insertion-sort-container");
  container.innerHTML = "";
  renderBars(container, insertionSortArray);
}

// Insertion sort algorithm
async function insertionSort() {
  const sortingTime = await runWithTimer(async () => {
    let len = insertionSortArray.length;
    for (let i = 1; i < len; i++) {
      let key = insertionSortArray[i];
      let j = i - 1;
      while (j >= 0 && insertionSortArray[j] > key) {
        insertionSortArray[j + 1] = insertionSortArray[j];
        j = j - 1;
        await sleep(insertionSortSettings.animationSpeed);
        renderInsertionSortBars();
      }
      insertionSortArray[j + 1] = key;
    }
  });

  const sortingTimeInSeconds = sortingTime / 1000; // Convert milliseconds to seconds
  const insertionSortTimeElement = document.getElementById("insertionSortTime");
  insertionSortTimeElement.textContent = `(Sorting time: ${sortingTimeInSeconds.toFixed(
    2
  )} ms)`;
}

export {
  insertionSortSettings,
  generateInsertionSortArray,
  renderInsertionSortBars,
  insertionSort,
};
