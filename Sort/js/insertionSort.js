let insertionSortArray = [];

// Function to generate random array for insertion sort
function generateInsertionSortArray() {
  insertionSortArray = [];
  for (let i = 0; i < 50; i++) {
    insertionSortArray.push(Math.floor(Math.random() * 100) + 1);
  }
}

// Function to render bars for insertion sort
function renderInsertionSortBars() {
  const container = document.getElementById("insertion-sort-container");
  container.innerHTML = "";
  renderBars(container, insertionSortArray);
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

// Insertion sort algorithm
async function insertionSort() {
  const startTime = performance.now();
  let len = insertionSortArray.length;
  for (let i = 1; i < len; i++) {
    let key = insertionSortArray[i];
    let j = i - 1;
    while (j >= 0 && insertionSortArray[j] > key) {
      insertionSortArray[j + 1] = insertionSortArray[j];
      j = j - 1;
      await sleep(50);
      renderInsertionSortBars();
    }
    insertionSortArray[j + 1] = key;
  }

  const endTime = performance.now();
  const sortingTime = endTime - startTime;
  const sortingTimeInSeconds = sortingTime / 1000; // Convert milliseconds to seconds
  const insertionSortTimeElement = document.getElementById("insertionSortTime");
  insertionSortTimeElement.textContent = `(Sorting time: ${sortingTimeInSeconds.toFixed(
    2
  )} ms)`;
}

// Function for delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { generateInsertionSortArray, renderInsertionSortBars, insertionSort };
