import { runWithTimer, sleep, renderBars } from "../utils.js";
let mergeSortArray = [];
let sortingInProgress = true; // Flag variable to track sorting process

const mergeSortSettings = {
  name: "mergeSort",
  arrayLength: 50, // Default array length
  animationSpeed: 50, // Default animation speed in milliseconds
};

// Function to generate random array for merge sort
function generateMergeSortArray() {
  mergeSortArray = [];
  for (let i = 0; i < mergeSortSettings.arrayLength; i++) {
    mergeSortArray.push(Math.floor(Math.random() * 100) + 1);
  }
}

// Function to render bars for merge sort
function renderMergeSortBars() {
  const container = document.getElementById("merge-sort-container");
  container.innerHTML = "";
  renderBars(container, mergeSortArray);
}

// Merge sort algorithm
async function mergeSort(left = 0, right = mergeSortArray.length - 1) {
  const sortingTime = await runWithTimer(async () => {
    if (right - left <= 0 || !sortingInProgress) {
      return;
    }

    // Split the array into two halves
    const middle = Math.floor((right + left) / 2);

    // Recursively sort each half
    await mergeSort(left, middle);
    await mergeSort(middle + 1, right);

    // Merge the sorted halves
    await merge(left, middle, right);

    // Render the bars after each merge
    renderMergeSortBars();
    // Add a delay to visualize the sorting process
    await sleep(mergeSortSettings.animationSpeed); // Adjust the delay time as needed
  });

  const sortingTimeInSeconds = sortingTime / 1000; // Convert milliseconds to seconds
  const bubbleSortTimeElement = document.getElementById("mergeSortTime");
  bubbleSortTimeElement.textContent = `(Sorting time: ${sortingTimeInSeconds.toFixed(
    2
  )} ms)`;
}

// Merge function to combine two sorted arrays
function merge(left, middle, right) {
  let mergedArray = [];
  let leftIndex = left;
  let rightIndex = middle + 1;

  // Compare elements from left and right arrays and merge them into a single sorted array
  while (leftIndex <= middle && rightIndex <= right) {
    if (mergeSortArray[leftIndex] < mergeSortArray[rightIndex]) {
      mergedArray.push(mergeSortArray[leftIndex]);
      leftIndex++;
    } else {
      mergedArray.push(mergeSortArray[rightIndex]);
      rightIndex++;
    }
  }

  // Add remaining elements from left array
  while (leftIndex <= middle) {
    mergedArray.push(mergeSortArray[leftIndex]);
    leftIndex++;
  }

  // Add remaining elements from right array
  while (rightIndex <= right) {
    mergedArray.push(mergeSortArray[rightIndex]);
    rightIndex++;
  }

  // Copy the sorted elements back into the original array
  for (let i = left; i <= right; i++) {
    mergeSortArray[i] = mergedArray[i - left];
  }
}

export {
  mergeSortSettings,
  generateMergeSortArray,
  renderMergeSortBars,
  mergeSort,
};
