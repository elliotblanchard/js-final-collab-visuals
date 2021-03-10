/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */
import * as THREE from './build/three.module.js';
import { GUI } from './jsm/libs/dat.gui.module.js';
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';
import CellEcosystem from './modules/CellEcosystem.js';
import buildMainLoginPage from './modules/buildMainLoginPage.js';
import { playlistFetch } from './modules/mainSeedFetch.js';

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
    const playlistVar = setInterval(playlistFetch(endPoint), 10000); // Interval to fetch new seed

    init();
    animate();
  } else {
    // Not logged in: need to login / create account
    const loginButton = buildMainLoginPage();

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

function ageInt() {
  CellEcosystem.cellEcosystem.ageCells();
}

document.addEventListener('DOMContentLoaded', () => {
  buildPage();
});
