// your code here, it may be worth it to ensure this file only runs AFTER the dom has loaded.
const caloriesUrl = 'http://localhost:3000/api/v1/calorie_entries'
let totalCalorieCount = 0
let currentItem = {}

document.addEventListener('DOMContentLoaded', () => {
    fetchCalorieEntries()
    getNewCalorieForm().addEventListener('submit', recordNewCalorie)
    getEditCalorieForm().addEventListener('submit', editCalorieItem)
    getBMRCalculator().addEventListener('submit', calculateBMR)
})

fetchCalorieEntries = () => {
    fetch(caloriesUrl)
    .then(response => response.json())
    .then(caloriesData => {
        console.log(caloriesData)
        caloriesData.forEach(calorieItem => {
          displayCalorieItem(calorieItem)
        })
    })
}

displayCalorieItem = (calorieItem) => {
    updateProgressBar(parseFloat(calorieItem.calorie))

    const calorieLi = document.createElement('li')
    calorieLi.classList.add('calories-list-item')
    calorieLi.dataset.calorieId = calorieItem.id

    const calorieDiv = document.createElement('div')
    calorieDiv.classList.add('uk-grid')

    const calorieNumDiv = document.createElement('div')
    calorieNumDiv.classList.add('uk-width-1-6')

    const strongNum = document.createElement('strong')
    strongNum.innerText = calorieItem.calorie
    const span = document.createElement('span')
    span.innerText = 'kcal'

    const noteDiv = document.createElement('div')
    noteDiv.classList.add('uk-width-4-5')

    const noteEm = document.createElement('em')
    noteEm.classList.add('uk-text-meta')
    noteEm.innerText = calorieItem.note

    const calorieMenu = document.createElement('div')
    calorieMenu.classList.add('list-item-menu')

    const editA = document.createElement('a')
    editA.classList.add('edit-button')
    editA.setAttribute('uk-icon', 'icon: pencil')
    editA.setAttribute('uk-toggle', 'target: #edit-form-container')
    editA.addEventListener('click', () => setCurrentItem(calorieItem))
    const deleteA = document.createElement('a')
    deleteA.classList.add('delete-button')
    deleteA.setAttribute('uk-icon', 'icon: trash')
    deleteA.addEventListener('click', () => deleteItem(calorieItem))
    calorieMenu.append(editA, deleteA)
    noteDiv.append(noteEm)
    calorieNumDiv.append(strongNum, span)
    calorieDiv.append(calorieNumDiv, noteDiv)
    calorieLi.append(calorieDiv, calorieMenu)
    getCaloriesList().insertBefore(calorieLi, getCaloriesList().childNodes[0])
}

recordNewCalorie = (event) => {
  event.preventDefault()
  // Deliverables require pessimistic rendering, which means I make make fetch call to the server first
  // calorie items have a calorie attribute and a note attribute
  const calories = parseFloat(document.getElementById('new-calorie-input').value)
  const note = document.getElementById('new-note-input').value.trim()

  fetch(caloriesUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ api_v1_calorie_entry: {calorie: calories, note: note} })
  })
  .then(response => response.json())
  .then(result => displayCalorieItem(result))

  getNewCalorieForm().reset()
}

updateProgressBar = (calorieCount) => {
  totalCalorieCount+=calorieCount
  getProgressBar().value = totalCalorieCount
}

deleteItem = (calorieItem) => {
  fetch(`${caloriesUrl}/${calorieItem.id}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
    removeItemFromDOM(result)
  })
}

removeItemFromDOM = (calorieItem) => {
  const li = document.querySelector(`[data-calorie-id='${calorieItem.id}']`)
  li.remove()
}

setCurrentItem = (calorieItem) => {
  currentItem = calorieItem
  // Once I have the current item set, I can pre-populate the edit form
  getEditCalorieInput().value = parseFloat(currentItem.calorie)
  getEditNoteInput().value = currentItem.note
}

editCalorieItem = () => {
  event.preventDefault()
  // grab the values from the edit form, and make a fetch call to patch the database (using the id stored in currentItem)
  const calories = parseFloat(getEditCalorieInput().value)
  const note = getEditNoteInput().value.trim()

  const itemId = currentItem.id
  // now I have all of the info I need to make a patch request
  fetch(`${caloriesUrl}/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({api_v1_calorie_entry: { calorie: calories, note: note }})
  })
  .then(response => response.json())
  .then(result => updateDOM(result))
}

updateDOM = (updatedItem) => {
  console.log(updatedItem)
  const li = document.querySelector(`[data-calorie-id='${updatedItem.id}']`)
  const calorieTextDiv = li.children[0]
  const calorieText = calorieTextDiv.children[0].firstElementChild
  const noteText = calorieTextDiv.children[1].firstElementChild
  calorieText.innerText = updatedItem.calorie
  noteText.innerText = updatedItem.note
}

calculateBMR = () => {
  event.preventDefault()
  console.log('calculating BMR...')

  const weight = parseFloat(document.getElementById('weight-input').value)
  const height = parseFloat(document.getElementById('height-input').value)
  const age = parseFloat(document.getElementById('age-input').value)

  const lowerRange = 655 + (4.35 * weight) + (4.7 * height) - (4.7 * age)
  const upperRange = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age)

  const lowerRangeSpan = document.getElementById('lower-bmr-range')
  lowerRangeSpan.innerText = lowerRange
  const upperRangeSpan = document.getElementById('higher-bmr-range')
  upperRangeSpan.innerText = upperRange

  const average = (lowerRange + upperRange)/2
  getProgressBar().setAttribute('max', `${average}`)
}

// ***** functions to return DOM nodes *****

getCaloriesList = () => {
  return document.getElementById('calories-list')
}

getNewCalorieForm = () => {
  return document.getElementById('new-calorie-form')
}

getProgressBar = () => {
  return document.querySelector('progress')
}

getEditCalorieForm = () => {
  return document.getElementById('edit-calorie-form')
}

getEditCalorieInput= () => {
  return document.getElementById('edit-calorie-input')
}

getEditNoteInput = () => {
  return document.getElementById('edit-note-input')
}

getBMRCalculator = () => {
  return document.getElementById('bmr-calculator')
}