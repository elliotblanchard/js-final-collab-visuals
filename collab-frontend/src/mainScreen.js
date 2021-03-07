/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */
// Three.js lib import
import * as THREE from './build/three.module.js';
import { GUI } from './jsm/libs/dat.gui.module.js';
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';
import CellEcosystem from './modules/CellEcosystem.js';
import Seed from './modules/Seed.js';

// Three.js
let container;
let camera;
let scene;
let renderer;
let composer;
let pointLight;

const params = {
  exposure: 1,
  bloomStrength: 3,
  bloomThreshold: 0.25,
  bloomRadius: 0.1,
};

const endPoint = 'http://collabvisuals.ngrok.io/api/v1/';
//const endPoint = 'http://localhost:3000/api/v1/'

function clear() {
  const body = document.getElementsByTagName('BODY');
  body[0].innerHTML = '';
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(0, 800, 0);
  camera.up = new THREE.Vector3(-0.5, 0, -0.5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  scene = new THREE.Scene();

  // Dimension should be multiple of 4
  CellEcosystem.cellEcosystem = new CellEcosystem(48, 15, 2, 100, scene);

  // Lights
  scene.add(new THREE.AmbientLight(0x111111));

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.125);

  directionalLight.position.x = Math.random() - 0.5;
  directionalLight.position.y = Math.random() - 0.5;
  directionalLight.position.z = Math.random() - 0.5;
  directionalLight.position.normalize();

  scene.add(directionalLight);

  pointLight = new THREE.PointLight(0xffffff, 1);
  scene.add(pointLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85,
  );
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  const gui = new GUI();

  gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange((value) => {
    bloomPass.threshold = Number(value);
  });

  gui.add(params, 'bloomStrength', 0.0, 3.0).onChange((value) => {
    bloomPass.strength = Number(value);
  });

  gui.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange((value) => {
    bloomPass.radius = Number(value);
  });

  // stats = new Stats()
  // container.appendChild( stats.dom )

  window.addEventListener('resize', onWindowResize, false);
}

function render() {
  const timer = 0.0001 * Date.now();

  pointLight.position.x = Math.sin(timer * 7) * 300;
  pointLight.position.y = 100;
  pointLight.position.z = Math.cos(timer * 3) * 300;

  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);

  render();
  // stats.update()
  composer.render();
}

function buildPage() {
  clear();
  if (localStorage.getItem('jwt_token') !== null) {
    // Already logged in
    CellEcosystem.cellEcosystem;

    // These are keyboard commands for testing
    document.addEventListener('keydown', (event) => {
      if (event.code === 'KeyA') {
        CellEcosystem.cellEcosystem.ageCells();
      }
      if (event.code === 'KeyR') {
        CellEcosystem.cellEcosystem.randomColor(0.75);
      }
      if (event.code === 'KeyS') {
        CellEcosystem.cellEcosystem.applySeed();
      }
    });

    // Timed actions
    const ageVar = setInterval(ageInt, 42); // Interval to age cells - roughly 24 FPS
    const playlistVar = setInterval(playlistFetch, 10000); // Interval to fetch new seed

    // function bpmPulse() {
    // CellEcosystem.cellEcosystem.randomColor(0.75)
    // }

    init();
    animate();
  } else {
    // Not logged in: need to login / create account

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

    // Add event listeners
    loginButton.addEventListener('click', (e) => loginFormHandler(e));
  }
}

function loginFetch(username, password) {
  const bodyData = { user: { username, password } };

  fetch(`${endPoint}login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  })
    .then((response) => response.json())
    .then((json) => {
      if (json.user.data.attributes.admin) {
        localStorage.setItem('jwt_token', json.jwt);
      }
      buildPage();
    });
}

function nowplayingFetch(id) {
  const bodyData = { playlist: { id } };

  fetch(`${endPoint}nowplaying`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
    },
    body: JSON.stringify(bodyData),
  })
    .then((response) => response.json())
    .then(() => {

    });
}

function playlistFetch() {
  fetch(`${endPoint}playlists`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
    },
  })
    .then((response) => response.json())
    .then((json) => {
      // Put first seed info into cell ecosystem's current seed var
      const firstSeed = json.playlist.data[0].attributes.seed;

      const newSeed = new Seed(
        firstSeed.id,
        firstSeed.name,
        firstSeed.matrix,
        firstSeed.user_id,
      );
      CellEcosystem.cellEcosystem.setSeed(newSeed);

      // Set playlist.now_playing = seed_id (needs new route) (also destroys seed from playlist)
      nowplayingFetch(json.playlist.data[0].id);
    });
}

function loginFormHandler(e) {
  // Check input fields
  let errorMsg = '';
  const usernameInput = document.getElementById('usernameField').value;
  const pwInput = document.getElementById('passwordField').value;

  if ((usernameInput.length < 4) || (pwInput.length < 6)) {
    if (usernameInput.length < 4) {
      errorMsg += "Username must be at least <span class='orange'>4 characters</span> long.<br>";
    }
    if (pwInput.length < 6) {
      errorMsg += "Password must be at least <span class='orange'>6 characters</span> long.";
    }
    const alertsLabel = document.getElementById('alertsLabel');
    // alertsLabel.setAttribute("class","alert")
    alertsLabel.innerHTML = errorMsg;
  } else {
    // Submit to backend
    loginFetch(usernameInput, pwInput);
  }
}

// function addMesh(geometry, material, cellEcosystem) {
//  const mesh = new THREE.Mesh(geometry, material);
//
//  mesh.position.x = (objects.length % cellEcosystem.gridDimension) * (cellEcosystem.cellDimension * 1.1) - 280;
//  mesh.position.z = Math.floor(objects.length / cellEcosystem.gridDimension) * (cellEcosystem.cellDimension * 1.1) - 280;
//
//  objects.push(mesh);
//
//  scene.add(mesh);
// }

function ageInt() {
  CellEcosystem.cellEcosystem.ageCells();
}

document.addEventListener('DOMContentLoaded', () => {
  buildPage();
});
