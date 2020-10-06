const endPoint = "http://localhost:3000/api/v1/"
const main = document.getElementsByTagName("main")

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM is Loaded")
    buildPage()

  })

function buildPage() {
  clearMain()

  if (localStorage.getItem('jwt_token') != undefined) {
    //Already logged in
    console.log("Logged in")

    //Greet user, show their seeds
    userProfileFetch()

    //Add logout button
    const loginDiv = document.createElement("div")
    loginDiv.setAttribute("id", "login")
    const logoutButton = document.createElement("button")
    logoutButton.setAttribute("id", "logoutBtn")
    logoutButton.textContent = "Logout"
    loginDiv.appendChild(logoutButton)
    main[0].appendChild(loginDiv)

    //Build form to submit new seeds
    const seedsDiv = document.createElement("div")
    seedsDiv.setAttribute("id", "seeds")

    const seedHeader = document.createElement("h2") 
    seedHeader.textContent = "Create a new seed" 
    seedsDiv.appendChild(seedHeader)

    const nameLabel = document.createElement("p") 
    nameLabel.textContent = "Name" 
    seedsDiv.appendChild(nameLabel) 
    const name = document.createElement("INPUT")
    name.setAttribute("type", "text")
    name.setAttribute("id", "nameField")
    seedsDiv.appendChild(name)   
    
    const matrixLabel = document.createElement("p") 
    matrixLabel.textContent = "Matrix" 
    seedsDiv.appendChild(matrixLabel) 
    const matrix = document.createElement("INPUT")
    matrix.setAttribute("type", "text")
    matrix.setAttribute("id", "matrixField")
    seedsDiv.appendChild(matrix)     

    const seedSubmitButton = document.createElement("button")
    seedSubmitButton.setAttribute("id", "seedSubmitBtn")
    seedSubmitButton.textContent = "Submit"
    seedsDiv.appendChild(seedSubmitButton)    


    main[0].appendChild(seedsDiv)

    //Add event listeners
    logoutButton.addEventListener("click", (e) => loginFormHandler(e))    
    seedSubmitButton.addEventListener("click", (e) => seedFormHandler(e))

  }
  else {
    //Need to login / create account
    console.log("Not logged in")
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
  //console.log(e.path[0].id)
  if (e.path[0].id == "logoutBtn") {
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
    //e.path[0].textContent
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
      window.alert(errorMsg)
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

function seedFormHandler(e) {
  let errorMsg = ""
  const nameInput = document.getElementById("nameField").value
  const matrixInput = document.getElementById("matrixField").value

  if ( (nameInput.length < 6) || (matrixInput.length != 16) ) {
    if (nameInput.length < 6) {
      errorMsg += "Name must be at least 6 characters long."
    }
    if (matrixInput.length != 16) {
      errorMsg += "Martix must be exactly 16 length."
    }
    window.alert(errorMsg)
  }
  else {
    //Submit to backend
    console.log("submitting")
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

function clearMain() {   
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
    window.alert("Seed added to playlist")
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
    console.log(json.user.data.attributes.seeds[0].id)
    const userDiv = document.createElement("div")
    const seedsDiv = document.getElementById("seeds")

    const seedExistingHeader = document.createElement("h2") 
    seedExistingHeader.textContent = "Send seeds to the main screen" 
    seedsDiv.appendChild(seedExistingHeader)
    for (let i = 0; i < json.user.data.attributes.seeds.length; i++) {
      const seedItem = document.createElement("p")
      seedItem.textContent = `${json.user.data.attributes.seeds[i].name} (${json.user.data.attributes.seeds[i].matrix})`       
      const seedCheck = document.createElement("INPUT")
      seedCheck.setAttribute("type", "checkbox")
      seedCheck.setAttribute("class", "seed_id")
      seedCheck.setAttribute("id", json.user.data.attributes.seeds[i].id)
      seedItem.appendChild(seedCheck)
      seedsDiv.appendChild(seedItem)
    }

    const seedQueueButton = document.createElement("button")
    seedQueueButton.setAttribute("id", "seedQueueBtn")
    seedQueueButton.textContent = "Queue"
    seedsDiv.appendChild(seedQueueButton)    

    //Add event listener   
    seedQueueButton.addEventListener("click", (e) => seedQueueHandler(e))

    userDiv.setAttribute("id", "user")
    userDiv.setAttribute("data-user-id", json.user.data.id);
    const userHeader = document.createElement("h1")
    userHeader.textContent = `Welcome back ${json.user.data.attributes.username}`
    userDiv.appendChild(userHeader) 
    main[0].insertBefore(userDiv,seedsDiv)    
  })
}

function renderToken() {
    console.log(localStorage.getItem('jwt_token'))
}


