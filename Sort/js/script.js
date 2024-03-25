import {
  generateBubbleSortArray,
  renderBubbleSortBars,
  bubbleSort,
} from "./sorters/bubbleSort.js";
import {
  generateInsertionSortArray,
  renderInsertionSortBars,
  insertionSort,
} from "./sorters/insertionSort.js";
import {
  generateQuickSortArray,
  renderQuickSortBars,
  quickSort,
  quickSortSettings,
} from "./sorters/quickSort.js";
import {
  generateMergeSortArray,
  renderMergeSortBars,
  mergeSort,
} from "./sorters/mergeSort.js";

// Function to start bubble sort
async function startBubbleSort() {
  await bubbleSort();
}

// Function to start insertion sort
async function startInsertionSort() {
  await insertionSort();
}

// Function to start quick sort
async function startQuickSort() {
  await quickSort(0, quickSortSettings.arrayLength - 1);
}

// Function to start merge sort
async function startMergeSort() {
  await mergeSort();
}

// async function start

// Function to reset array
function resetArray(containerId) {
  switch (containerId) {
    case "bubble-sort-container":
      generateBubbleSortArray();
      renderBubbleSortBars();
      break;
    case "insertion-sort-container":
      generateInsertionSortArray();
      renderInsertionSortBars();
      break;
    case "quick-sort-container":
      generateQuickSortArray();
      renderQuickSortBars();
      break;
    case "merge-sort-container":
      generateMergeSortArray();
      renderMergeSortBars();
    default:
      break;
  }
}

// Generate initial arrays
generateBubbleSortArray();
generateInsertionSortArray();
generateQuickSortArray();
generateMergeSortArray();

// Render initial bars
window.onload = function () {
  renderBubbleSortBars();
  renderInsertionSortBars();
  renderQuickSortBars();
  renderMergeSortBars();
};

// Getting reference to the button
const sortingButtons = [
  { id: "startBubbleSortButton", action: startBubbleSort },
  { id: "startInsertionSortButton", action: startInsertionSort },
  { id: "startQuickSortButton", action: startQuickSort },
  { id: "startMergeSortButton", action: startMergeSort },
  {
    id: "resetBubbleSortButton",
    action: () => resetArray("bubble-sort-container"),
  },
  {
    id: "resetInsertionSortButton",
    action: () => resetArray("insertion-sort-container"),
  },
  {
    id: "resetQuickSortButton",
    action: () => resetArray("quick-sort-container"),
  },
  {
    id: "resetMergeSortButton",
    action: () => resetArray("merge-sort-container"),
  },
];

sortingButtons.forEach((button) => {
  const buttonElement = document.getElementById(button.id);
  if (buttonElement) {
    buttonElement.addEventListener("click", button.action);
  }
});

const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;

darkModeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
});

// Function to set dark mode as default
function setDarkModeDefault() {
  const prefersDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const body = document.body;

  if (prefersDarkMode) {
    body.classList.add("dark-mode");
  }
}

// Call the function to set dark mode as default
setDarkModeDefault();
