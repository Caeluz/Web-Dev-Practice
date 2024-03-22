let bubbleSortArray = [];

// Function to generate random array for bubble sort
function generateBubbleSortArray() {
  bubbleSortArray = [];
  for (let i = 0; i < 50; i++) {
    bubbleSortArray.push(Math.floor(Math.random() * 100) + 1);
  }
}

// Function to render bars for bubble sort
function renderBubbleSortBars() {
  const container = document.getElementById("bubble-sort-container");
  container.innerHTML = "";
  renderBars(container, bubbleSortArray);
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

// Bubble sort algorithm
async function bubbleSort() {
  const startTime = performance.now(); // Start time
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
        await sleep(50); // Add a delay for visualization
      }
    }
  }

  const endTime = performance.now(); // End time
  const sortingTime = endTime - startTime; // Sorting time in milliseconds
  const sortingTimeInSeconds = sortingTime / 1000; // Convert milliseconds to seconds
  const bubbleSortTimeElement = document.getElementById("bubbleSortTime");
  bubbleSortTimeElement.textContent = `(Sorting time: ${sortingTimeInSeconds.toFixed(
    2
  )} ms)`;
}

// Function to swap elements
// async function bubbleSortswap(idx1, idx2) {
//   await sleep(50);
//   let temp = bubbleSortArray[idx1];
//   bubbleSortArray[idx1] = bubbleSortArray[idx2];
//   bubbleSortArray[idx2] = temp;
//   // renderBars("bubble-sort-container");
//   renderBubbleSortBars();
// }

// Function for delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { generateBubbleSortArray, renderBubbleSortBars, bubbleSort };
