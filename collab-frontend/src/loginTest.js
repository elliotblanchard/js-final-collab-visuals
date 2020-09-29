document.addEventListener('DOMContentLoaded', () => {
    // fetch and load syllabi
    console.log("DOM is Loaded");
    //getSyllabi()
  
    // event listner and handler for create syllabus form
    //const createSyllabusForm = document.querySelector("#create-syllabus-form")
    //createSyllabusForm.addEventListener("submit", (e) => createFormHandler(e))
  
    const loginForm = document.querySelector("#login-form")
    loginForm.addEventListener("submit", (e) => loginFormHandler(e))
  })

function loginFormHandler(e) {
    e.preventDefault()
    const usernameInput = e.target.querySelector("#login-username").value
    const pwInput = e.target.querySelector("#login-password").value
    loginFetch(usernameInput, pwInput)
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
      renderUserProfile()
    })
}

function renderUserProfile() {
    console.log(localStorage.getItem('jwt_token'));
  }