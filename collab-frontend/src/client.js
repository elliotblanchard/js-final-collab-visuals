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
    createMatrix("0000000000000000",seedsDiv,20,48,true,25,5) 

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
    loginHeader.setAttribute("class","heavy")
    loginHeader.innerHTML = "Please login<br>or "
    loginDiv.appendChild(loginHeader)  
    const createLink = document.createElement("a")
    createLink.setAttribute("id", "createLink")
    createLink.setAttribute("href", "#")
    createLink.innerHTML = "<span class='red'>create an account.</span>"
    loginHeader.appendChild(createLink)

    //Build alert DIV
    const alertsDiv = document.createElement("div")
    alertsDiv.setAttribute("id", "alerts")  
    const alertsLabel = document.createElement("p") 
    alertsLabel.setAttribute("id", "alertsLabel")
    alertsLabel.textContent = "" 
    alertsDiv.appendChild(alertsLabel)   
    loginDiv.appendChild(alertsDiv)

    const usernameLabel = document.createElement("p") 
    usernameLabel.setAttribute("class","label")
    usernameLabel.textContent = "Username" 
    loginDiv.appendChild(usernameLabel) 
    const username = document.createElement("INPUT")
    username.setAttribute("type", "text")
    username.setAttribute("id", "usernameField")
    username.setAttribute("class","input")
    loginDiv.appendChild(username)
    const passwordLabel = document.createElement("p") 
    passwordLabel.setAttribute("class","label")
    passwordLabel.textContent = "Password" 
    loginDiv.appendChild(passwordLabel) 
    const password = document.createElement("INPUT")
    password.setAttribute("class", "input")
    password.setAttribute("type", "password")
    password.setAttribute("id", "passwordField")
    loginDiv.appendChild(password)
    const loginButton = document.createElement("button")
    loginButton.setAttribute("class", "button")
    loginButton.setAttribute("type", "submit")
    loginButton.setAttribute("id", "loginBtn")
    loginButton.textContent = "Login"
    loginDiv.appendChild(loginButton)
    main[0].appendChild(loginDiv)

    //Add event listeners
    createLink.addEventListener("click", (e) => loginFormHandler(e))
    loginButton.addEventListener("click", (e) => loginFormHandler(e))
  }

}

function loginFormHandler(e) {
  //console.log(e.srcElement.className)
  if (e.srcElement.id == "logout") {
    localStorage.removeItem('jwt_token') //to logout, everything handled on the frontend
    buildPage()
  }
  else if (e.srcElement.className == "red") {
    //Swap to create an account form
    const loginDiv = document.getElementById("login")  
    
    const loginButton = document.getElementById("loginBtn")
    loginButton.setAttribute("class","button")    

    if (loginButton.textContent != "Create") {
      const adminHeader = document.createElement("p")
      adminHeader.setAttribute("class","label")
      adminHeader.textContent = "Admin?" 

      const adminCheck = document.createElement("INPUT")
      adminCheck.setAttribute("type", "checkbox")
      adminCheck.setAttribute("class", "check")
      adminCheck.setAttribute("id", "adminField")

      adminHeader.appendChild(adminCheck)
      loginDiv.appendChild(adminHeader)  
    }  

    loginButton.textContent = "Create"

  }
  else {
    //Check input fields
    let errorMsg = ""
    const usernameInput = document.getElementById("usernameField").value
    const pwInput = document.getElementById("passwordField").value

    if ( (usernameInput.length < 4) || (pwInput.length < 6) ) {
      if (usernameInput.length < 4) {
        errorMsg += "Username must be at least <span class='orange'>4 characters</span> long.<br>"
      }
      if (pwInput.length < 6) {
        errorMsg += "Password must be at least <span class='orange'>6 characters</span> long."
      }
      const alertsLabel = document.getElementById("alertsLabel") 
      //alertsLabel.setAttribute("class","alert")
      alertsLabel.innerHTML = errorMsg 
    }
    else {
      //Submit to backend
      if (e.srcElement.textContent == "Login") {
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
  //console.log(e.path[2].getAttribute("class").split(" "))
  if (e.path[2].getAttribute("class").split(" ")[0] == "unselected") {
    e.path[2].innerHTML = circ(true,20,48,25,5) 
    e.path[2].setAttribute("class",`selected ${e.path[2].getAttribute("class").split(" ")[1]}`)
  }
  else {
    e.path[2].innerHTML = circ(false,20,48,25,5)
    e.path[2].setAttribute("class",`unselected ${e.path[2].getAttribute("class").split(" ")[1]}`)    
  }
}

function seedFormHandler(e) {
  let errorMsg = ""
  const nameInput = document.getElementById("nameField").value
  let matrixInput = ""

  if ( nameInput.length < 6 ) {
    errorMsg += "Name must be at least <span class='orange'>6 characters</span> long."
    const alertsLabel = document.getElementById("alertsLabel") 
    alertsLabel.innerHTML = errorMsg 
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
  playlistFetch(e.path[0].getAttribute("id"),e.path[0].textContent)
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
    //renderToken()
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
    //renderToken()
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

function playlistFetch(seed_id,name) {
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
    alertsLabel.innerHTML = `Seed <span class='orange'>${name}</span> added to playlist` 
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
    if (json.message == "Please log in") {
      localStorage.removeItem('jwt_token') //to logout, everything handled on the frontend
      buildPage()
    }
    else {
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
      if (userData.seeds.length >0) {
        const seedExistingHeader = document.createElement("p") 
        seedExistingHeader.setAttribute("class", "heavy")
        seedExistingHeader.innerHTML = "<span class='red'>Choose</span> one of your visual seeds to send to the big screen." 
        seedsDiv.appendChild(seedExistingHeader)
      }

      //Seeds DIVs

      //First set up the rows
      for (let i = 0; i < Math.ceil(userData.seeds.length / 2); i++) {
        const seedRow = document.createElement("div")
        seedRow.setAttribute("class","row")
        seedRow.setAttribute("id",`row_${i}`)
        seedsDiv.appendChild(seedRow)
      }

      //Then set up the seeds themselves
      for (let i = 0; i < userData.seeds.length; i++) {

        const currentRow = document.getElementById(`row_${Math.floor(i/2)}`)
        const seedItem = document.createElement("div")
        seedItem.setAttribute("class","col-sm-5 seedItem")
        //seedItem.setAttribute("id", userData.seeds[i].id)
        
        //Top spacer
        const seedTop = document.createElement("p")
        seedTop.setAttribute("class","label")
        seedTop.innerHTML = " "
        seedItem.appendChild(seedTop)

        //Seed matrix
        createMatrix(userData.seeds[i].matrix,seedItem,4,20,false,5,2)

        //Seed name / button
        const seedSubmitButton = document.createElement("button")
        seedSubmitButton.setAttribute("id", userData.seeds[i].id)
        seedSubmitButton.setAttribute("class", "buttonPanel")
        seedSubmitButton.textContent = userData.seeds[i].name
        seedSubmitButton.addEventListener("click", (e) => seedQueueHandler(e))
        seedItem.appendChild(seedSubmitButton) 

        currentRow.appendChild(seedItem)
      }
    }

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
        alertsLabel.innerHTML = `Your seed named <span class='orange'>${nowPlayingData.attributes.name}</span> is now playing on the main screen.` 
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

function createMatrix(matrix,parentDiv,circRadius,heightWidth,interactive,center,thickness) {

    //Build matrix 
    //const unselectedCirc = `<svg class='unselected' height='${heightWidth}' width='${heightWidth}'><circle cx='25' cy='25' r='${circRadius}' stroke='white' stroke-width='5' fill='#222' /></svg>`
    //const selectedCirc = `<svg class='selected' height='${heightWidth}' width='${heightWidth}'><circle cx='25' cy='25' r='${circRadius}' stroke='white' stroke-width='5' fill='white' /></svg>`

    /*
    const seed1 = document.createElement("DIV")
    seed1.setAttribute("class","item1")
    seed1.innerHTML = circ(false,circRadius,heightWidth,center,thickness) 
    matrixTable.appendChild(seed1)   

    const seed2 = document.createElement("DIV")
    seed2.setAttribute("class","item2")
    seed2.innerHTML = circ(false,circRadius,heightWidth,center,thickness) 
    matrixTable.appendChild(seed2)
    
    const seed3 = document.createElement("DIV")
    seed3.setAttribute("class","item3")
    seed3.innerHTML = circ(false,circRadius,heightWidth,center,thickness) 
    matrixTable.appendChild(seed3)  
    
    const seed4 = document.createElement("DIV")
    seed4.setAttribute("class","item4")
    seed4.innerHTML = circ(false,circRadius,heightWidth,center,thickness) 
    matrixTable.appendChild(seed4)   

    const seed5 = document.createElement("DIV")
    seed5.setAttribute("class","item5")
    seed5.innerHTML = circ(false,circRadius,heightWidth,center,thickness) 
    matrixTable.appendChild(seed5)
    
    const seed6 = document.createElement("DIV")
    seed6.setAttribute("class","item6")
    seed6.innerHTML = circ(false,circRadius,heightWidth,center,thickness) 
    matrixTable.appendChild(seed6)  
    
    const seed7 = document.createElement("DIV")
    seed7.setAttribute("class","item7")
    seed7.innerHTML = circ(false,circRadius,heightWidth,center,thickness) 
    matrixTable.appendChild(seed7)  
    
    const seed8 = document.createElement("DIV")
    seed8.setAttribute("class","item8")
    seed8.innerHTML = circ(false,circRadius,heightWidth,center,thickness) 
    matrixTable.appendChild(seed8)   

    const seed9 = document.createElement("DIV")
    seed9.setAttribute("class","item9")
    seed9.innerHTML = circ(false,circRadius,heightWidth,center,thickness) 
    matrixTable.appendChild(seed9)
    
    const seed10 = document.createElement("DIV")
    seed10.setAttribute("class","item10")
    seed10.innerHTML = circ(false,circRadius,heightWidth,center,thickness) 
    matrixTable.appendChild(seed10)  */
    
    const matrixTable = document.createElement("DIV")
    matrixTable.setAttribute("id","matrixTable")
    matrixTable.setAttribute("class","grid-container")

    for (let j = 0; j < 16; j++) {
      const cell = document.createElement("DIV")
      cell.setAttribute("id",`cell_${j}`)
      if (matrix[j] == "1") {
        cell.setAttribute("class",`selected item${j}`)
        cell.innerHTML = circ(true,circRadius,heightWidth,center,thickness)
      }
      else {
        cell.setAttribute("class",`unselected item${j}`)
        cell.innerHTML = circ(false,circRadius,heightWidth,center,thickness)            
      }
      if (interactive == true) {
        //Add event listeners    
        cell.addEventListener("click", (e) => matrixManager(e))
      }
      matrixTable.appendChild(cell)
    }   

    parentDiv.appendChild(matrixTable)
    /*
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
          if (matrix[matrixCell] == "1") {
            cell.setAttribute("class","selected")
            cell.innerHTML = circ(true,circRadius,heightWidth,center,thickness)
          }
          else {
            cell.setAttribute("class","unselected")
            cell.innerHTML = circ(false,circRadius,heightWidth,center,thickness)            
          }
          matrixCell++
          if (interactive == true) {
            //Add event listeners    
            cell.addEventListener("click", (e) => matrixManager(e))
          }
        }
        row.appendChild(cell)
        tableCell++
      }
      matrixTable.appendChild(row)
    }
    parentDiv.appendChild(matrixTable)
    */

}

function circ(selected,circRadius,heightWidth,center,thickness) {
  if (selected == true) {
    return `<svg class='selected' height='${heightWidth}' width='${heightWidth}'><circle cx='${center}' cy='${center}' r='${circRadius}' stroke='white' stroke-width='${thickness}' fill='white' /></svg>`
  }
  else {
    return `<svg class='unselected' height='${heightWidth}' width='${heightWidth}'><circle cx='${center}' cy='${center}' r='${circRadius}' stroke='white' stroke-width='${thickness}' fill='#222' /></svg>`
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


