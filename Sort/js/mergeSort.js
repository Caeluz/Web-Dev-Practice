let mergeSortArray = [];
let sortingInProgress = true; // Flag variable to track sorting process

// Function to generate random array for merge sort
function generateMergeSortArray() {
  mergeSortArray = [];
  for (let i = 0; i < 50; i++) {
    mergeSortArray.push(Math.floor(Math.random() * 100) + 1);
  }
}

// Function to render bars for merge sort
function renderMergeSortBars() {
  const container = document.getElementById("merge-sort-container");
  container.innerHTML = "";
  renderBars(container, mergeSortArray);
}

// Function to render bars
function renderBars(container, array) {
  const maxValue = Math.max(...array);
  const scaleFactor = container.clientHeight / (maxValue * 1.05);
  const barWidth = container.clientWidth / array.length;
  array.forEach((value) => {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = `${value * scaleFactor}px`;
    bar.style.width = `${barWidth}px`;
    container.appendChild(bar);
  });
}

// Merge sort algorithm
async function mergeSort(left = 0, right = mergeSortArray.length - 1) {
  const startTime = performance.now();
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
  await sleep(50); // Adjust the delay time as needed

  const endTime = performance.now(); // End time
  const sortingTime = endTime - startTime; // Sorting time in milliseconds
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

// Function for delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { generateMergeSortArray, renderMergeSortBars, mergeSort };
