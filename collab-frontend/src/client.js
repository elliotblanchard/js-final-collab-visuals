const endPoint = "http://localhost:3000/api/v1/"

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM is Loaded");
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
  })

function createFormHandler(e) {
    e.preventDefault()
    const usernameInput = e.target.querySelector("#create-username").value
    const pwInput = e.target.querySelector("#create-password").value
    const adminInput = e.target.querySelector("#create-admin")
    //console.log(adminInput.checked)
    createFetch(usernameInput, pwInput, adminInput.checked)
}

function loginFormHandler(e) {
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

function renderToken() {
    console.log(localStorage.getItem('jwt_token'));
}

