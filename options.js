let page = document.getElementById("buttonDiv")
let selectedClassName = "current"
const presetButtonColors = ["rgba(107,167,58,0.07)", "rgba(227,128,120,0.3)", "rgba(249,187,45,0.29)", "rgba(70,136,241,0.2)"]

// Reacts to a button click by marking the selected button and saving
// the selection
function handleButtonClick(event) {
  // Remove styling from the previously selected color
  let current = event.target.parentElement.querySelector(
    `.${selectedClassName}`
  )
  if (current && current !== event.target) {
    current.classList.remove(selectedClassName)
  }

  // Mark the button as selected
  let color = event.target.dataset.color
  event.target.classList.add(selectedClassName)
  // chrome.storage.sync.set({ color })
}

// Add a button to the page for each supplied color
function constructOptions(buttonColors) {
  chrome.storage.sync.get("color", (data) => {
    let currentColor = data.color
    // For each color we were provided…
    for (let buttonColor of buttonColors) {
      // …create a button with that color…
      let button = document.createElement("button")
      button.dataset.color = buttonColor
      button.style.backgroundColor = buttonColor

      // …mark the currently selected color…
      if (buttonColor === currentColor) {
        button.classList.add(selectedClassName)
      }

      // …and register a listener for when that button is clicked
      button.addEventListener("click", handleButtonClick)
      page.appendChild(button)
    }
  })
}

// Initialize the page by constructing the color options
constructOptions(presetButtonColors)
