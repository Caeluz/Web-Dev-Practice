import { runWithTimer, sleep, renderBars } from "../utils.js";
let bubbleSortArray = [];

const bubbleSortSettings = {
  name: "bubbleSort",
  arrayLength: 50, // Default array length
  animationSpeed: 50, // Default animation speed in milliseconds
};

// Function to generate random array for bubble sort
function generateBubbleSortArray() {
  bubbleSortArray = [];
  for (let i = 0; i < bubbleSortSettings.arrayLength; i++) {
    bubbleSortArray.push(Math.floor(Math.random() * 100) + 1);
  }
  return bubbleSortArray;
}

// Function to render bars for bubble sort
function renderBubbleSortBars() {
  const container = document.getElementById("bubble-sort-container");
  container.innerHTML = "";
  renderBars(container, bubbleSortArray);
}

// Bubble sort algorithm
async function bubbleSort() {
  // const startTime = performance.now(); // Start time
  const sortingTime = await runWithTimer(async () => {
    const len = bubbleSortArray.length;

    for (let i = 0; i < len - 1; i++) {
      for (let j = 0; j < len - 1 - i; j++) {
        if (bubbleSortArray[j] > bubbleSortArray[j + 1]) {
          // Swap elements if they are in the wrong order
          [bubbleSortArray[j], bubbleSortArray[j + 1]] = [
            bubbleSortArray[j + 1],
            bubbleSortArray[j],
          ];
          renderBubbleSortBars(); // Update visualization after each swap
          await sleep(bubbleSortSettings.animationSpeed); // Add a delay for visualization
        }
      }
    }
  });

  const sortingTimeInSeconds = sortingTime / 1000; // Convert milliseconds to seconds
  const bubbleSortTimeElement = document.getElementById("bubbleSortTime");
  bubbleSortTimeElement.textContent = `(Sorting time: ${sortingTimeInSeconds.toFixed(
    2
  )} seconds)`;
}

export {
  bubbleSortSettings,
  generateBubbleSortArray,
  renderBubbleSortBars,
  bubbleSort,
};
