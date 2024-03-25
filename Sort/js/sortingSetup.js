const sortingAlgorithms = [
  {
    name: "Bubble Sort",
    id: "bubbleSort",
    defaultArrayLength: 50,
    defaultAnimationSpeed: 50,
  },
  {
    name: "Insertion Sort",
    id: "insertionSort",
    defaultArrayLength: 50,
    defaultAnimationSpeed: 50,
  },
  // Add more sorting algorithms here
];

sortingAlgorithms.forEach((algorithm) => {
  const container = document.createElement("div");
  container.className = "container";

  const h2 = document.createElement("h2");
  h2.textContent = algorithm.name;
  container.appendChild(h2);

  const timeSpan = document.createElement("span");
  timeSpan.id = `${algorithm.id}Time`;
  timeSpan.textContent = "(Sorting time: -- ms)";
  container.appendChild(timeSpan);

  const sortContainer = document.createElement("div");
  sortContainer.id = `${algorithm.id}-container`;
  sortContainer.className = "sort-container";
  container.appendChild(sortContainer);

  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "buttons-container";
  container.appendChild(buttonsContainer);

  const startButton = document.createElement("button");
  startButton.id = `start${algorithm.id}Button`;
  startButton.textContent = `Start ${algorithm.name}`;
  buttonsContainer.appendChild(startButton);

  const resetButton = document.createElement("button");
  resetButton.id = `reset${algorithm.id}Button`;
  resetButton.textContent = "Reset Array";
  buttonsContainer.appendChild(resetButton);

  const settingsButton = document.createElement("button");
  settingsButton.id = `${algorithm.id}SettingsButton`;
  settingsButton.textContent = "*";
  buttonsContainer.appendChild(settingsButton);

  // Create the modal for the settings
  // ...

  document.body.appendChild(container);
});
