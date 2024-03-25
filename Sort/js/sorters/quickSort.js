import {
  // generateRandomArray,
  runWithTimer,
  sleep,
  renderBars,
} from "../utils.js";
let quickSortArray = [];
let quickSortLength = 0;

const quickSortSettings = {
  name: "quickSort",
  arrayLength: 50, // Default array length
  animationSpeed: 50, // Default animation speed in milliseconds
};

// Function to generate random array for quick sort
function generateQuickSortArray() {
  quickSortArray = [];
  for (let i = 0; i < quickSortSettings.arrayLength; i++) {
    // Use arrayLength from settings
    quickSortArray.push(Math.floor(Math.random() * 100) + 1);
  }
  quickSortLength = quickSortArray.length - 1;
}

// Function to render bars for quick sort
function renderQuickSortBars() {
  const container = document.getElementById("quick-sort-container");
  container.innerHTML = "";
  renderBars(container, quickSortArray);
}

// Quick sort algorithm
async function quickSort(left = 0, right = quickSortArray.length - 1) {
  const sortingTime = await runWithTimer(async () => {
    if (left < right) {
      const partitionIndex = await partition(left, right);
      await quickSort(left, partitionIndex - 1);
      await quickSort(partitionIndex + 1, right);
    }
  });

  const sortingTimeInSeconds = sortingTime / 1000; // Convert milliseconds to seconds
  const quickSortTimeElement = document.getElementById("quickSortTime");
  quickSortTimeElement.textContent = `(Sorting time: ${sortingTimeInSeconds.toFixed(
    2
  )} ms)`;
}

// Partition function for quick sort
async function partition(left, right) {
  let pivotValue = quickSortArray[right];
  let pivotIndex = left;
  for (let i = left; i < right; i++) {
    if (quickSortArray[i] < pivotValue) {
      await quickSortSwap(i, pivotIndex);
      pivotIndex++;
    }
  }
  await quickSortSwap(right, pivotIndex);
  return pivotIndex;
}

async function quickSortSwap(idx1, idx2) {
  await sleep(quickSortSettings.animationSpeed); // Use animationSpeed from settings
  let temp = quickSortArray[idx1];
  quickSortArray[idx1] = quickSortArray[idx2];
  quickSortArray[idx2] = temp;
  renderQuickSortBars();
  // console.log(quickSortArray);
}

export {
  quickSortSettings,
  generateQuickSortArray,
  renderQuickSortBars,
  quickSort,
};
