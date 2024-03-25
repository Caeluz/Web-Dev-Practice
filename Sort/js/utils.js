// export function generateRandomArray(length) {
//   const array = [];
//   for (let i = 0; i < length; i++) {
//     array.push(Math.floor(Math.random() * 100) + 1);
//   }
//   return array;
// }

// Function to render bars
export function renderBars(container, array) {
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

// Function for delay
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// For measuring sorting time
export async function runWithTimer(callback) {
  const startTime = performance.now(); // Start time
  await callback();
  const endTime = performance.now(); // End time
  return endTime - startTime; // Return sorting time in milliseconds
}
