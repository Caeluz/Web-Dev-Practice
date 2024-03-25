import {
  bubbleSortSettings,
  generateBubbleSortArray,
  renderBubbleSortBars,
} from "./sorters/bubbleSort.js";

import {
  insertionSortSettings,
  generateInsertionSortArray,
  renderInsertionSortBars,
} from "./sorters/insertionSort.js";

import {
  mergeSortSettings,
  generateMergeSortArray,
  renderMergeSortBars,
} from "./sorters/mergeSort.js";

import {
  generateQuickSortArray,
  quickSortSettings,
  renderQuickSortBars,
} from "./sorters/quickSort.js";

// Function to handle modal and settings for any sort
function handleSortSettings(sortSettings, generateSortArray, renderSortBars) {
  // Get the modal element for sort settings
  const sortSettingsModal = document.getElementById(
    `${sortSettings.name}SettingsModal`
  );

  // Get the button that opens the modal for sort settings
  const sortSettingButton = document.getElementById(
    `${sortSettings.name}SettingsButton`
  );

  // Get the button that applies sort settings
  const applySortSettingsButton = document.getElementById(
    `apply${sortSettings.name}SettingsButton`
  );

  // document.addEventListener("keydown", function (event) {
  //   if (event.keyCode === 13) {
  //     applySortSettingsButton.click();
  //     sortSettingsModal.style.display = "none";
  //   }
  // });

  const closeModalButtons = document.getElementsByClassName("close");

  // When the user clicks on the close button, close the modal
  for (let i = 0; i < closeModalButtons.length; i++) {
    // console.log(closeModalButtons[i]);
    // When the user clicks on a close button, close the modal
    closeModalButtons[i].onclick = function () {
      // Get the data attribute that specifies which modal to close
      const modalId = this.getAttribute("data-modal-id");
      // Get the modal element
      const modal = document.getElementById(modalId);
      // Close the modal
      modal.style.display = "none";
    };
  }

  let currentSortSettings;
  let currentGenerateSortArray;
  let currentRenderSortBars;
  let currentSortSettingsModal;

  console.log(sortSettingsModal);

  // When the user clicks on the Sort Settings button, open the modal
  sortSettingButton.addEventListener("click", function () {
    currentSortSettings = sortSettings;
    currentGenerateSortArray = generateSortArray;
    currentRenderSortBars = renderSortBars;
    sortSettingsModal.style.display = "block";
    currentSortSettingsModal = sortSettingsModal; // Set the current modal here
  });

  // When the user clicks on <span> (x) or outside the modal, close it
  window.addEventListener("click", function (event) {
    if (event.target == currentSortSettingsModal) {
      // Check the current modal here
      currentSortSettingsModal.style.display = "none";
    }
  });

  // When the user clicks on the Apply Settings button, apply the changes
  applySortSettingsButton.onclick = function () {
    // Get the values from input fields and apply them to sort settings
    const arrayLength = parseInt(
      document.getElementById(`${currentSortSettings.name}ArrayLength`).value
    );
    const animationSpeed = parseInt(
      document.getElementById(`${currentSortSettings.name}AnimationSpeed`).value
    );
    // Apply the settings to sort
    applySortSettings(currentSortSettings, arrayLength, animationSpeed);
    // Close the modal
    sortSettingsModal.style.display = "none";
    console.log("apply" + currentSortSettings.name + "SettingsButton");
  };

  // Function to apply sort settings
  function applySortSettings(sortSettings, arrayLength, animationSpeed) {
    // Apply the settings to sort
    sortSettings.arrayLength = arrayLength;
    sortSettings.animationSpeed = animationSpeed;
    currentGenerateSortArray();
    currentRenderSortBars();
  }

  console.log(sortSettings);
}

handleSortSettings(
  bubbleSortSettings,
  generateBubbleSortArray,
  renderBubbleSortBars
);

handleSortSettings(
  insertionSortSettings,
  generateInsertionSortArray,
  renderInsertionSortBars
);

handleSortSettings(
  quickSortSettings,
  generateQuickSortArray,
  renderQuickSortBars
);

handleSortSettings(
  mergeSortSettings,
  generateMergeSortArray,
  renderMergeSortBars
);
