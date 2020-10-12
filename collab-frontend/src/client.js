const endPoint = "http://localhost:3000/api/v1/"
const main = document.getElementsByTagName("main")

document.addEventListener('DOMContentLoaded', () => {
    buildPage()
  })

function buildPage() {
  clear()

  if (localStorage.getItem('jwt_token') != undefined) {
    //Already logged in

    //Greet user, show their existing seeds
    userProfileFetch()

    //Build form to submit new seeds
    const seedsDiv = document.createElement("div")
    seedsDiv.setAttribute("id", "seeds")

    const seedHeader = document.createElement("p") 
    seedHeader.setAttribute("class", "heavy")
    seedHeader.innerHTML = "Create a <span class='red'>visual seed</span> to drive the big screen." 
    seedsDiv.appendChild(seedHeader)

    //Build alert DIV
    const alertsDiv = document.createElement("div")
    alertsDiv.setAttribute("id", "alerts")  
    const alertsLabel = document.createElement("p") 
    alertsLabel.setAttribute("id", "alertsLabel")
    alertsLabel.textContent = "" 
    alertsDiv.appendChild(alertsLabel)   
    seedsDiv.appendChild(alertsDiv)

    //Build matrix
    createMatrix("0000000000000000",seedsDiv,20,48)
    
    /*
    //Build matrix 
    const unselectedCirc = "<svg class='unselected' height='48' width='48'><circle cx='25' cy='25' r='20' stroke='white' stroke-width='5' fill='#222' /></svg>"
    const selectedCirc = "<svg class='selected' height='48' width='48'><circle cx='25' cy='25' r='20' stroke='white' stroke-width='5' fill='white' /></svg>"

    const matrixTable = document.createElement("TABLE")
    matrixTable.setAttribute("id","matrixTable")

    const activeCells = [3,9,11,15,17,19,21,23,25,27,29,31,33,37,39,45]
    let tableCell = 0
    let matrixCell = 0
    for (let i = 0; i < 7; i++) {
      const row = document.createElement("TR")
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement("TD")
        if (activeCells.includes(tableCell)) {
          cell.setAttribute("class","unselected")
          cell.setAttribute("id",`cell_${matrixCell}`)
          cell.innerHTML = unselectedCirc
          matrixCell++
          //Add event listeners    
          cell.addEventListener("click", (e) => matrixManager(e))
        }
        row.appendChild(cell)
        tableCell++
      }
      matrixTable.appendChild(row)
    }
    seedsDiv.appendChild(matrixTable)
    */

    /*
    const matrixLabel = document.createElement("p") 
    matrixLabel.setAttribute("class","label")
    matrixLabel.textContent = "Matrix" 
    seedsDiv.appendChild(matrixLabel) 
    const matrix = document.createElement("INPUT")
    matrix.setAttribute("type", "text")
    matrix.setAttribute("class", "input")
    matrix.setAttribute("id", "matrixField")
    seedsDiv.appendChild(matrix)  
    */   

    const nameLabel = document.createElement("p") 
    nameLabel.setAttribute("class","label")
    nameLabel.textContent = "Seed Name" 
    seedsDiv.appendChild(nameLabel) 
    const name = document.createElement("INPUT")
    name.setAttribute("type", "text")
    name.setAttribute("class", "input")
    name.setAttribute("id", "nameField")
    seedsDiv.appendChild(name)       

    const seedSubmitButton = document.createElement("button")
    seedSubmitButton.setAttribute("id", "seedSubmitBtn")
    seedSubmitButton.setAttribute("class", "button")
    seedSubmitButton.textContent = "Submit"
    seedsDiv.appendChild(seedSubmitButton)   
    
    const lineBreak = document.createElement("br")
    seedsDiv.appendChild(lineBreak)
    seedsDiv.appendChild(lineBreak)

    const bar = document.createElement("img")
    bar.setAttribute("src","img/bar.png")
    seedsDiv.appendChild(bar)

    main[0].appendChild(seedsDiv)

    //Add event listeners    
    seedSubmitButton.addEventListener("click", (e) => seedFormHandler(e))
  }
  else {
    //Not logged in: need to login / create account
    const loginDiv = document.createElement("div")
    loginDiv.setAttribute("id", "login")
    const loginHeader = document.createElement("p")
    loginHeader.textContent = "Please login or "
    loginDiv.appendChild(loginHeader)  
    const createLink = document.createElement("a")
    createLink.setAttribute("id", "createLink")
    createLink.setAttribute("href", "#")
    createLink.text = "create an account."
    loginHeader.appendChild(createLink)
    const usernameLabel = document.createElement("p") 
    usernameLabel.textContent = "Username" 
    loginDiv.appendChild(usernameLabel) 
    const username = document.createElement("INPUT")
    username.setAttribute("type", "text")
    username.setAttribute("id", "usernameField")
    loginDiv.appendChild(username)
    const passwordLabel = document.createElement("p") 
    passwordLabel.textContent = "Password" 
    loginDiv.appendChild(passwordLabel) 
    const password = document.createElement("INPUT")
    password.setAttribute("type", "password")
    password.setAttribute("id", "passwordField")
    loginDiv.appendChild(password)
    main[0].appendChild(loginDiv)

    const loginButtonsDiv = document.createElement("div")
    loginButtonsDiv.setAttribute("id", "loginButtons")
    const loginButton = document.createElement("button")
    loginButton.setAttribute("id", "loginBtn")
    loginButton.textContent = "Login"
    loginButtonsDiv.appendChild(loginButton)
    main[0].appendChild(loginButtonsDiv)

    //Add event listeners
    createLink.addEventListener("click", (e) => loginFormHandler(e))
    loginButton.addEventListener("click", (e) => loginFormHandler(e))
  }

}

function loginFormHandler(e) {
  if (e.path[0].id == "logout") {
    localStorage.removeItem('jwt_token') //to logout, everything handled on the frontend
    console.log("Logging out")
    buildPage()
  }
  else if (e.path[0].id == "createLink") {
    //Swap to create an account form
    const loginDiv = document.getElementById("login")    

    const adminHeader = document.createElement("p")
    adminHeader.textContent = "Admin?" 

    const adminCheck = document.createElement("INPUT")
    adminCheck.setAttribute("type", "checkbox")
    adminCheck.setAttribute("id", "adminField")

    adminHeader.appendChild(adminCheck)
    loginDiv.appendChild(adminHeader)    

    const loginButton = document.getElementById("loginBtn")
    loginButton.textContent = "Create Account"

  }
  else {
    //Check input fields
    let errorMsg = ""
    const usernameInput = document.getElementById("usernameField").value
    const pwInput = document.getElementById("passwordField").value

    if ( (usernameInput.length < 4) || (pwInput.length < 6) ) {
      if (usernameInput.length < 4) {
        errorMsg += "Username must be at least 4 characters long."
      }
      if (pwInput.length < 6) {
        errorMsg += "Password must be at least 6 characters long."
      }
      const alertsLabel = document.getElementById("alertsLabel") 
      alertsLabel.textContent = errorMsg 
    }
    else {
      //Submit to backend
      if (e.path[0].textContent == "Login") {
        loginFetch(usernameInput, pwInput)
      }
      else {
        const adminInput = document.getElementById("adminField").checked
        createUserFetch(usernameInput, pwInput, adminInput)
      }
    }
    
  }
}

function matrixManager(e) {
  //console.log(e.path[2].getAttribute("id").split("_")[1])
  if (e.path[2].getAttribute("class") == "unselected") {
    e.path[2].innerHTML = circ(true,20,48) 
    e.path[2].setAttribute("class","selected")
  }
  else {
    e.path[2].innerHTML = circ(false,20,48)
    e.path[2].setAttribute("class","unselected")    
  }
}

function seedFormHandler(e) {
  let errorMsg = ""
  const nameInput = document.getElementById("nameField").value
  let matrixInput = ""

  if ( nameInput.length < 6 ) {
    errorMsg += "Name must be at least 6 characters long."
    const alertsLabel = document.getElementById("alertsLabel") 
    alertsLabel.textContent = errorMsg 
  }
  else {
    //Get seed definition from matrix
    const matrixTable = document.getElementById("matrixTable")
    for (let i = 0; i < matrixTable.rows.length; i++) {
      for (let j = 0; j < matrixTable.rows[i].cells.length; j++) {
        if (matrixTable.rows[i].cells[j].getAttribute("class") == "unselected") {
          matrixInput += "0"
        }
        else if (matrixTable.rows[i].cells[j].getAttribute("class") == "selected") {
          matrixInput += "1"
        }
      }
    }
    //Submit to backend
    //console.log("submitting")
    createSeedFetch(nameInput, matrixInput)
  }

}

function seedQueueHandler(e) {
  //Get checkboxes that are checked
  const seedQueueCheckboxes = document.getElementsByClassName("seed_id")

  for (let i = 0; i < seedQueueCheckboxes.length; i++) {
    if (seedQueueCheckboxes[i].checked == true) {
      playlistFetch(seedQueueCheckboxes[i].id)
    }
  }
}

function clear() {   
  const header = document.getElementById("header")
  header.innerHTML = ""
  main[0].innerHTML = ""
} 

function loginFetch(username, password) {
  const bodyData = {user: { username, password} }

  fetch(endPoint+"login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(bodyData)
  })
  .then(response => response.json())
  .then(json => {
    localStorage.setItem('jwt_token', json.jwt)
    renderToken()
    buildPage()
  })
}

function createUserFetch(username, password, admin) {
  const bodyData = {user: { username, password, admin} }

  fetch(endPoint+"users", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(bodyData)
  })
  .then(response => response.json())
  .then(json => {
    localStorage.setItem('jwt_token', json.jwt)
    //incorporate browser cookie as stretch goal - one in cookie, one in local storage - more secure
    renderToken()
    buildPage()
  })
}

function createSeedFetch(name, matrix) {
  const userInfo = document.getElementById("user")
  const user_id = userInfo.getAttribute("data-user-id")
  const bodyData = {seed: { name, matrix, user_id } }

  fetch(endPoint+"seeds", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
    },
    body: JSON.stringify(bodyData)
  })
  .then(response => response.json())
  .then(json => {
    buildPage()
  })
}

function playlistFetch(seed_id) {
  const bodyData = {playlist: { seed_id } }

  fetch(endPoint+"playlists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
    },
    body: JSON.stringify(bodyData)
  })
  .then(response => response.json())
  .then(json => {
    const alertsLabel = document.getElementById("alertsLabel") 
    alertsLabel.textContent = "Seed added to playlist" 

    //Clear checkboxes
    const seedQueueCheckboxes = document.getElementsByClassName("seed_id")

    for (let i = 0; i < seedQueueCheckboxes.length; i++) {
      seedQueueCheckboxes[i].checked = false
    }
  }) 
}

function userProfileFetch() {
  fetch(endPoint+"profile", {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
    }
  })
  .then(response => response.json())
  .then(json => {
    const headerDiv = document.getElementById("header")
    const userDiv = document.createElement("div")
    const seedsDiv = document.getElementById("seeds")

    const userData = json.user.data.attributes

    //Add user name
    const userHeader = document.createElement("p")
    userHeader.setAttribute("id", "user")
    userHeader.setAttribute("class", "header-light")
    userHeader.setAttribute("data-user-id", json.user.data.id)
    userHeader.innerHTML = `${userData.username} |&nbsp;`
    headerDiv.appendChild(userHeader) 
    
    //Add logout link
    const logout = document.createElement("a")
    logout.setAttribute("class", "header-light")
    logout.setAttribute("id", "logout")
    logout.setAttribute("href", "#")
    logout.innerHTML = "Logout"
    logout.addEventListener("click", (e) => loginFormHandler(e))
    headerDiv.appendChild(logout)   

    //Existing seeds header
    const seedExistingHeader = document.createElement("p") 
    seedExistingHeader.setAttribute("class", "heavy")
    seedExistingHeader.innerHTML = "<span class='red'>Choose</span> one of your visual seeds to send to the big screen." 
    seedsDiv.appendChild(seedExistingHeader)

    //Seeds DIVs
    for (let i = 0; i < userData.seeds.length; i++) {
      //console.log(`mod is: ${i%2}`)

      const seedRow = document.createElement("div")
      seedRow.setAttribute("class","row")

      const seedItem = document.createElement("div")
      seedItem.setAttribute("class","col-sm-4 seedItem")
      //seedItem.setAttribute("class","seedItem")
      const seedHeader = document.createElement("p")
      seedHeader.setAttribute("class","label")
      seedHeader.textContent = `${userData.seeds[i].name}`

      seedItem.appendChild(seedHeader)
      seedRow.appendChild(seedItem)
      seedsDiv.appendChild(seedRow)
    }

    /*
    for (let i = 0; i < userData.seeds.length; i++) {
      const seedItem = document.createElement("p")
      seedItem.textContent = `${userData.seeds[i].name} (${userData.seeds[i].matrix})`       
      const seedCheck = document.createElement("INPUT")
      seedCheck.setAttribute("type", "checkbox")
      seedCheck.setAttribute("class", "seed_id")
      seedCheck.setAttribute("id", userData.seeds[i].id)
      seedItem.appendChild(seedCheck)
      seedsDiv.appendChild(seedItem)
    }
    */

    const seedQueueButton = document.createElement("button")
    seedQueueButton.setAttribute("id", "seedQueueBtn")
    seedQueueButton.textContent = "Queue"
    seedsDiv.appendChild(seedQueueButton)    

    //Add event listener   
    seedQueueButton.addEventListener("click", (e) => seedQueueHandler(e))
  })
}

function nowPlayingFetch() {
  fetch(endPoint+"nowplaying", {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
    }
  })
  .then(response => response.json())
  .then(json => {
    if (!json.errors) {
      const alertsLabel = document.getElementById("alertsLabel") 
      const user = document.getElementById("user")
      const nowPlayingData = json.seed.data
      
      if (user.getAttribute("data-user-id") == nowPlayingData.relationships.user.data.id ) {
        alertsLabel.textContent = `Your seed named is: ${nowPlayingData.attributes.name} is now playing on the main screen.` 
      }
      else {
        alertsLabel.textContent = ``
      }
    } 
  })
}

function renderToken() {
    console.log(localStorage.getItem('jwt_token'))
}

function createMatrix(matrix,parentDiv,circRadius,heightWidth) {

    //Build matrix 
    //const unselectedCirc = `<svg class='unselected' height='${heightWidth}' width='${heightWidth}'><circle cx='25' cy='25' r='${circRadius}' stroke='white' stroke-width='5' fill='#222' /></svg>`
    //const selectedCirc = `<svg class='selected' height='${heightWidth}' width='${heightWidth}'><circle cx='25' cy='25' r='${circRadius}' stroke='white' stroke-width='5' fill='white' /></svg>`

    const matrixTable = document.createElement("TABLE")
    matrixTable.setAttribute("id","matrixTable")

    const activeCells = [3,9,11,15,17,19,21,23,25,27,29,31,33,37,39,45]
    let tableCell = 0
    let matrixCell = 0
    for (let i = 0; i < 7; i++) {
      const row = document.createElement("TR")
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement("TD")
        if (activeCells.includes(tableCell)) {
          cell.setAttribute("id",`cell_${matrixCell}`)
          if (matrix[tableCell] == "1") {
            cell.setAttribute("class","selected")
            cell.innerHTML = circ(true,circRadius,heightWidth)
          }
          else {
            cell.setAttribute("class","unselected")
            cell.innerHTML = circ(false,circRadius,heightWidth)            
          }
          matrixCell++
          //Add event listeners    
          cell.addEventListener("click", (e) => matrixManager(e))
        }
        row.appendChild(cell)
        tableCell++
      }
      matrixTable.appendChild(row)
    }
    parentDiv.appendChild(matrixTable)

}

function circ(selected,circRadius,heightWidth) {
  if (selected == true) {
    return `<svg class='selected' height='${heightWidth}' width='${heightWidth}'><circle cx='25' cy='25' r='${circRadius}' stroke='white' stroke-width='5' fill='white' /></svg>`
  }
  else {
    return `<svg class='unselected' height='${heightWidth}' width='${heightWidth}'><circle cx='25' cy='25' r='${circRadius}' stroke='white' stroke-width='5' fill='#222' /></svg>`
  }
 }

//Timed actions
let nowPlayingVar = setInterval(nowPlaying, 1000); //Interval to check which seed is playing

function nowPlaying() {
  if (localStorage.getItem('jwt_token') != undefined) {
    //If we're logged in
    nowPlayingFetch()  
  }
}


