const endPoint = "http://localhost:3000/api/v1/"
const main = document.getElementsByTagName("main")

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM is Loaded")
    buildPage()

    /*
    if (localStorage.getItem('jwt_token') != undefined) {
      //Already logged in
      userProfileFetch()
      //Should also reveal logout button
    }
    else {
      const userInfo = document.querySelector("#userInfo-container")
      userInfo.innerHTML = "<h1>Please sign up or login</h1>"
      //Should also reveal signup / signin form
    }
  
    const createForm = document.querySelector("#create-form")
    createForm.addEventListener("submit", (e) => createFormHandler(e))

    const loginForm = document.querySelector("#login-form")
    loginForm.addEventListener("submit", (e) => loginFormHandler(e))
 
    const logoutButton = document.querySelector("#logoutBtn")  
    logoutButton.addEventListener("click", (e) => logoutFormHandler(e))
    */
  })

function buildPage() {
  clearMain()

  if (localStorage.getItem('jwt_token') != undefined) {
    //Already logged in
    console.log("Logged in")

    //Greet user
    userProfileFetch()

    //Build form to submit new seeds

    //Add logout button
    const loginDiv = document.createElement("div")
    loginDiv.setAttribute("id", "login")
    const logoutButton = document.createElement("button")
    logoutButton.setAttribute("id", "logoutBtn")
    logoutButton.textContent = "Logout"
    loginDiv.appendChild(logoutButton)
    main[0].appendChild(loginDiv)

    //Add event listeners
    logoutButton.addEventListener("click", (e) => loginFormHandler(e))    
  }
  else {
    //Need to login / create account
    console.log("Not logged in")
    const loginDiv = document.createElement("div")
    loginDiv.setAttribute("id", "login")
    const loginHeader = document.createElement("p")
    loginHeader.textContent = "Please login or create an account"
    loginDiv.appendChild(loginHeader)  
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
    const loginButton = document.createElement("button")
    loginButton.setAttribute("id", "loginBtn")
    loginButton.textContent = "Login"
    loginDiv.appendChild(loginButton)
    const signupButton = document.createElement("button")
    signupButton.setAttribute("id", "signupBtn")
    signupButton.textContent = "Signup"
    loginDiv.appendChild(signupButton)
    main[0].appendChild(loginDiv)

    //Add event listeners
    loginButton.addEventListener("click", (e) => loginFormHandler(e))
    signupButton.addEventListener("click", (e) => loginFormHandler(e))
  }

}

function loginFormHandler(e) {
  if (e.path[0].id == "logoutBtn") {
    localStorage.removeItem('jwt_token') //to logout, everything handled on the frontend
    console.log("Logging out")
    buildPage()
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
      window.alert(errorMsg)
    }
    else {
      //Submit to backend
      if (e.path[0].id == "loginBtn") {
        loginFetch(usernameInput, pwInput)
      }
      else {

      }
    }
    
  }

  //Need to check that the fields are requred lengths / filled out
  console.log(e.path[0].id)
  //e.preventDefault()
  //const usernameInput = e.target.querySelector("#login-username").value
  //const pwInput = e.target.querySelector("#login-password").value
  //loginFetch(usernameInput, pwInput)
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
    //userProfileFetch()
  })
}

function createFetch(username, password, admin) {
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
    const userDiv = document.createElement("div")
    userDiv.setAttribute("id", "user")
    const userHeader = document.createElement("p")
    userHeader.textContent = `Welcome back ${json.user.data.attributes.username}`
    userDiv.appendChild(userHeader) 
    main[0].appendChild(userDiv)    
  })
}

/*
function createFormHandler(e) {
    e.preventDefault()
    const usernameInput = e.target.querySelector("#create-username").value
    const pwInput = e.target.querySelector("#create-password").value
    const adminInput = e.target.querySelector("#create-admin")
    //console.log(adminInput.checked)
    createFetch(usernameInput, pwInput, adminInput.checked)
}

function loginFormHandler(e) {
    //Need to check that the fields are requred lengths / filled out
    e.preventDefault()
    const usernameInput = e.target.querySelector("#login-username").value
    const pwInput = e.target.querySelector("#login-password").value
    loginFetch(usernameInput, pwInput)
}

function logoutFormHandler(e) {
  e.preventDefault()
  localStorage.removeItem('jwt_token') //to logout, everything handled on the frontend
  console.log("Logging out")
  const userInfo = document.querySelector("#userInfo-container")
  userInfo.innerHTML = "<h1>Please sign up or login</h1>"
  renderToken()
}

function createFetch(username, password, admin) {
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
  })
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
      //incorporate browser cookie as stretch goal - one in cookie, one in local storage - more secure
      renderToken()
      userProfileFetch()
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
    console.log(json)
    const userMarkup = `
      <h1>Welcome back ${json.user.data.attributes.username}</h1>
    `
    const userInfo = document.querySelector("#userInfo-container")
    userInfo.innerHTML = userMarkup
  })
}
*/

function renderToken() {
    console.log(localStorage.getItem('jwt_token'))
}


