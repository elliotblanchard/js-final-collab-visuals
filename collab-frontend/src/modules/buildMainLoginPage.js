function buildMainLoginPage() {
  const body = document.getElementsByTagName('BODY');

  const loginDiv = document.createElement('div');
  loginDiv.setAttribute('id', 'login');
  loginDiv.setAttribute('class', 'center');
  const loginHeader = document.createElement('p');
  loginHeader.setAttribute('class', 'heavy');
  loginHeader.innerHTML = "<span class='red'>Collab Visuals:</span><br>creating together.";
  loginDiv.appendChild(loginHeader);

  // Build alert DIV
  const alertsDiv = document.createElement('div');
  alertsDiv.setAttribute('id', 'alerts');
  const alertsLabel = document.createElement('p');
  alertsLabel.setAttribute('id', 'alertsLabel');
  alertsLabel.textContent = '';
  alertsDiv.appendChild(alertsLabel);
  loginDiv.appendChild(alertsDiv);

  const usernameLabel = document.createElement('p');
  usernameLabel.setAttribute('class', 'label');
  usernameLabel.textContent = 'Username';
  loginDiv.appendChild(usernameLabel);
  const username = document.createElement('INPUT');
  username.setAttribute('type', 'text');
  username.setAttribute('id', 'usernameField');
  username.setAttribute('class', 'input');
  loginDiv.appendChild(username);
  const passwordLabel = document.createElement('p');
  passwordLabel.setAttribute('class', 'label');
  passwordLabel.textContent = 'Password';
  loginDiv.appendChild(passwordLabel);
  const password = document.createElement('INPUT');
  password.setAttribute('class', 'input');
  password.setAttribute('type', 'password');
  password.setAttribute('id', 'passwordField');
  loginDiv.appendChild(password);
  const loginButton = document.createElement('button');
  loginButton.setAttribute('class', 'button');
  loginButton.setAttribute('type', 'submit');
  loginButton.setAttribute('id', 'loginBtn');
  loginButton.textContent = 'Login';
  loginDiv.appendChild(loginButton);
  body[0].appendChild(loginDiv);

  return loginButton;
}

export default buildMainLoginPage;
