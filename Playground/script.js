// script.js

// Initialize CodeMirror editor
const editor = new CodeMirror(document.getElementById("codeEditor"), {
  mode: "javascript",
  theme: "material-darker",
  lineNumbers: true,
  autoCloseTags: true,
  matchBrackets: true,
  extraKeys: { "Ctrl-Spac": "autocomplete" }, // Add this line
});


window.addEventListener("keydown", function (event) {
  // Check if Alt + Enter was pressed
  if (event.ctrlKey && event.key === "Enter") {
    runCode();
  }
});

function runCode() {
  // Get the code from the CodeMirror editor
  const code = editor.getValue();

  // Reference the console output element
  const consoleOutput = document.getElementById("consoleOutput");

  // Clear previous output
  consoleOutput.textContent = "";

  // Override console.log to display output in the consoleOutput element
  console.log = function (message) {
    consoleOutput.textContent += message + "\n";
  };

  // Execute the code
  try {
    eval(code);
  } catch (error) {
    console.log(error);
  }
}
