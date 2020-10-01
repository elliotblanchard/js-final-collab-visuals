document.addEventListener('DOMContentLoaded', () => {
    // fetch and load syllabi
    console.log("DOM is Loaded");
    //getSyllabi()
  
    // event listner and handler for create syllabus form
    //const createSyllabusForm = document.querySelector("#create-syllabus-form")
    //createSyllabusForm.addEventListener("submit", (e) => createFormHandler(e))
    const createForm = document.querySelector("#create-form")
    createForm.addEventListener("submit", (e) => createFormHandler(e))

    const loginForm = document.querySelector("#login-form")
    loginForm.addEventListener("submit", (e) => loginFormHandler(e))

    const logoutForm = document.querySelector("#logout-form")
    logoutForm.addEventListener("submit", (e) => logoutFormHandler(e))    
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
  renderToken()
}

function createFetch(username, password, admin) {
  const bodyData = {user: { username, password, admin} }

  fetch("http://localhost:3000/api/v1/users", {
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
  
    fetch("http://localhost:3000/api/v1/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(bodyData)
    })
    .then(response => response.json())
    .then(json => {
      localStorage.setItem('jwt_token', json.jwt)
      //localStorage.removeItem('jwt_token') //to logout, all handled on the frontend
      //incorporate browser cookie as stretch goal - one in cookie, one in local storage - more secure
      renderToken()
      renderUserProfile()
    })
}


function renderToken() {
    console.log(localStorage.getItem('jwt_token'));
  }


function renderUserProfile() {
    fetch('http://localhost:3000/api/v1/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
      }
    })
    .then(response => response.json())
    .then(json => {
      //console.log(json)
      alert(`Welcome back ${json.user.data.attributes.username}`)
    })
}
