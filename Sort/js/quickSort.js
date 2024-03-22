let quickSortArray = [];
let quickSortLength = 0;

// Function to generate random array for quick sort
function generateQuickSortArray() {
  quickSortArray = [];
  for (let i = 0; i < 50; i++) {
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

// Quick sort algorithm
async function quickSort(left = 0, right = quickSortArray.length - 1) {
  const startTime = performance.now(); // Start time

  if (left < right) {
    const partitionIndex = await partition(left, right);
    await quickSort(left, partitionIndex - 1);
    await quickSort(partitionIndex + 1, right);
  }

  const endTime = performance.now(); // End time
  const sortingTime = endTime - startTime; // Sorting time in milliseconds
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
  await sleep(50);
  let temp = quickSortArray[idx1];
  quickSortArray[idx1] = quickSortArray[idx2];
  quickSortArray[idx2] = temp;
  renderQuickSortBars();
  // console.log(quickSortArray);
}

// Function for delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { generateQuickSortArray, renderQuickSortBars, quickSort };
