/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */
// Three.js lib import
import * as THREE from './build/three.module.js';
import { GUI } from './jsm/libs/dat.gui.module.js';
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';

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

// Define overall class for the cells matrix
class Cell {
  constructor(material, hue, sat, lum, age, neighbors) {
    this._material = material;
    this._hue = hue;
    this._sat = sat;
    this._lum = lum;
    this._age = age;
    this._neighbors = neighbors;
  }

  get material() {
    return this._material;
  }

  get hue() {
    return this._hue;
  }

  get sat() {
    return this._sat;
  }

  get lum() {
    return this._lum;
  }

  get age() {
    return this._age;
  }

  get neighbors() {
    return this._neighbors;
  }

  set material(newMaterial) {
    this._material = newMaterial;
  }

  set hue(newHue) {
    this._hue = newHue;
  }

  set sat(newSat) {
    this._sat = newSat;
  }

  set lum(newLum) {
    this._lum = newLum;
  }

  set age(newAge) {
    this._age = newAge;
  }

  set neighbors(newNeighbors) {
    this._neighbors = newNeighbors;
  }
}

class Seed {
  constructor(id, name, matrix, userId) {
    this._id = id;
    this._name = name;
    this._matrix = matrix;
    this._userId = userId;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get matrix() {
    return this._matrix;
  }

  get user_id() {
    return this._user_id;
  }

  set id(newId) {
    this._id = newId;
  }

  set name(newName) {
    this._name = newName;
  }

  set matrix(newMatrix) {
    this._matrix = newMatrix;
  }

  set userId(newUserId) {
    this._userId = newUserId;
  }
}

// Define overall class for the cells matrix
class CellEcosystem {
  constructor(gridDimension, cellDimension, cellDepth, cellLife) {
    this._gridDimension = gridDimension;
    this._cellDimension = cellDimension;
    this._cellDepth = cellDepth;
    this._cellLife = cellLife;
    this._edges = {
      topRow: [], rightRow: [], bottomRow: [], leftRow: [],
    };
    this._cellsMatrix = Array(this.gridDimension ** 2);
    this._currentSeed;
    this._playingSeed;
    this.applyToggle = true;
    this._rowNumber = 0;
    this._lumCutoff = 0.5; // Minimum luminance to be counted as a neighbor

    // Init the matrix
    for (let i = 0; i < this._cellsMatrix.length; i += 1) {
      this._cellsMatrix[i] = new Cell(
        new THREE.MeshLambertMaterial({ color: 0x202020 }),
        0.0,
        0.0,
        0.0,
        0,
        0,
      );
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(this._cellDepth, this._cellDepth, this._cellDepth, 32), this._cellsMatrix[i].material);
      mesh.position.x = ((i) % this._gridDimension) * (this._cellDimension * 1.1) - 400;
      mesh.position.z = Math.floor((i) / this._gridDimension) * (this._cellDimension * 1.1) - 400;
      scene.add(mesh);
    }
    this._edges = this.setEdges(this._edges);
  }

  setEdges(edges) {
    // Defines the edges of the matrix
    for (let i = 0; i < (this._gridDimension ** 2); i += 1) {
      const j = i + 1;
      if (i < this._gridDimension) {
        edges.topRow.push(i);
      }
      if (i > ((this._gridDimension ** 2) - this._gridDimension)) {
        edges.bottomRow.push(i);
      }
      if (j % this._gridDimension === 0) {
        edges.rightRow.push(i);
      }
      if (i % this._gridDimension === 0) {
        edges.leftRow.push(i);
      }
    }
    return edges;
  }

  testEdges() {
    const allEdges = [
      ...this._edges.topRow,
      ...this._edges.rightRow,
      ...this._edges.bottomRow,
      ...this._edges.leftRow,
    ];
    for (let i = 0; i < (this._gridDimension ** 2); i += 1) {
      if (allEdges.includes(i)) {
        this._cellsMatrix[i].material.emissive.setHSL(0.0, 0.0, 1.0);
      } else {
        this._cellsMatrix[i].material.emissive.setHSL(0.0, 0.0, 0.0);
      }
    }
  }

  randomColor(probability) {
    // Sets a percentage of the cells to a random color.
    // Probability is the chance of the change being applied to a cell (0-1)
    for (let i = 0; i < this._cellsMatrix.length; i += 1) {
      if (Math.random() > probability) {
        this._cellsMatrix[i].hue = Math.random();
        this._cellsMatrix[i].sat = 0.0;
        this._cellsMatrix[i].lum = Math.random();
        this._cellsMatrix[i].age = 0;
        this._cellsMatrix[i].material.emissive.setHSL(
          this._cellsMatrix[i].hue,
          this._cellsMatrix[i].sat,
          this._cellsMatrix[i].lum,
        );
      }
    }
  }

  setSeed(seed) {
    this._currentSeed = seed;
  }

  applySeed() {
    if (this._currentSeed) {
      if (!this._playingSeed) {
        this._playingSeed = this._currentSeed;
      }
      // Applies ONE row
      for (let i = this._rowNumber; i < (this._rowNumber + this._gridDimension); i += 4) {
        // inner loop A: 4 part loop for each row
        let blockCount = 0;
        for (let j = 0; j < 4; j += 1) {
          // inner loop B: 4 part loop for each cell in a row
          for (let k = 0; k < 4; k += 1) {
            const currentIndex = (i + (j * this._gridDimension)) + k;
            if (this._applyToggle) {
              // Only apply HALF as often so the scanning is not too constant / hectic
              this._cellsMatrix[currentIndex].hue = Math.random();
              this._cellsMatrix[currentIndex].sat = 0.0;
              if (this._playingSeed.matrix[blockCount] === '1') {
                this._cellsMatrix[currentIndex].lum = this.randomRange(0.10, 1.0);
              } else {
                this._cellsMatrix[currentIndex].lum = 0.0;
              }
              this._cellsMatrix[currentIndex].age = 0;
              this._cellsMatrix[currentIndex].material.emissive.setHSL(
                this._cellsMatrix[currentIndex].hue,
                this._cellsMatrix[currentIndex].sat,
                this._cellsMatrix[currentIndex].lum,
              );
            }
            blockCount += 1;
          }
        }
      }
      this._rowNumber += (this._gridDimension * 4);
      if (this._rowNumber === this._cellsMatrix.length) {
        this._rowNumber = 0;
        if (this._applyToggle === true) {
          this._applyToggle = false;
        } else {
          this._applyToggle = true;
        }
        this._playingSeed = this._currentSeed;
      }
    }
  }

  minMax(val) {
    if (val < 0) {
      return 0;
    }
    if (val > (this._cellsMatrix.length - 1)) {
      return (this._cellsMatrix.length - 1);
    }

    return val;
  }

  randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  ageCells() {
    // Stamp row of seeds
    this.applySeed();

    // Updates cell ages for all active cells and dims their luminosity
    // Also checks for neighbors to evolve system
    // Find # neighbors who have lum over a certian cutoff, update neighbors field in cell
    // Grid counting starts at the BOTTOM and counts from LEFT to RIGHT

    for (let i = 0; i < this._cellsMatrix.length; i += 1) {
      this._cellsMatrix[i]._neighbors = 0;
      // North (i-dimension)
      if (this._cellsMatrix[this.minMax(i - this._gridDimension)]._lum > this._lumCutoff) {
        this._cellsMatrix[i]._neighbors += 1;
      }
      // North West (i-(dimension-1))
      if ((this._cellsMatrix[this.minMax(i - (this._gridDimension - 1))]._lum > this._lumCutoff) && !this._edges.rightRow.includes(i)) {
        this._cellsMatrix[i]._neighbors += 1;
      }
      // West (i+1)
      if ((this._cellsMatrix[this.minMax(i + 1)]._lum > this._lumCutoff) && !this._edges.rightRow.includes(i)) {
        this._cellsMatrix[i]._neighbors += 1;
      }
      // South West (i+(dimension+1))
      if ((this._cellsMatrix[this.minMax(i + (this._gridDimension + 1))]._lum > this._lumCutoff) && !this._edges.rightRow.includes(i)) {
        this._cellsMatrix[i].neighbors += 1;
      }
      // South (i+dimension)
      if (this._cellsMatrix[this.minMax(i + this._gridDimension)]._lum > this._lumCutoff) {
        this._cellsMatrix[i]._neighbors += 1;
      }
      // South East (i+(dimension-1))
      if ((this._cellsMatrix[this.minMax(i + (this._gridDimension - 1))]._lum > this._lumCutoff) && !this._edges.leftRow.includes(i)) {
        this._cellsMatrix[i]._neighbors += 1;
      }
      // East (i-1)
      if ((this._cellsMatrix[this.minMax(i - 1)]._lum > this._lumCutoff) && !this._edges.leftRow.includes(i)) {
        this._cellsMatrix[i]._neighbors += 1;
      }
      // North East (i-(dimension+1))
      if ((this._cellsMatrix[this.minMax(i - (this.gridDimension + 1))]._lum > this._lumCutoff) && !this._edges.leftRow.includes(i)) {
        this._cellsMatrix[i]._neighbors += 1;
      }
    }

    // Update cells based on # of neighbors, rules, age
    for (let i = 0; i < this._cellsMatrix.length; i += 1) {
      // Normal aging
      this._cellsMatrix[i].age += 1;
      if (this._cellsMatrix[i].lum > 0) {
        this._cellsMatrix[i].lum -= (1.0 / this._cellLife);
      }

      // Turn on/off according to neighbor count/rules
      if ((this._cellsMatrix[i].neighbors === 0)) {
        this._cellsMatrix[i].lum /= 2;
      } else if ((this._cellsMatrix[i].neighbors === 4) && (this._cellsMatrix[i].lum > 0.1)) {
        this._cellsMatrix[i].lum = this.randomRange(0.15, 0.65);
      } else if ((this._cellsMatrix[i].neighbors === 2) || (this._cellsMatrix[i].neighbors === 2)) {
        this._cellsMatrix[i].hue = this.randomRange(0.67, 0.88);
        this._cellsMatrix[i].sat = 1.0;
        this._cellsMatrix[i].lum = this.randomRange(0.15, 0.65);
        this._cellsMatrix[i].age = 0;
      }
      this._cellsMatrix[i].material.emissive.setHSL(
        this._cellsMatrix[i].hue,
        this._cellsMatrix[i].sat,
        this._cellsMatrix[i].lum,
      );
    }
  }

  get gridDimension() {
    return this._gridDimension;
  }

  set gridDimension(newGridDimension) {
    this._gridDimension = newGridDimension;
  }

  get cellDimension() {
    return this._cellDimension;
  }

  set cellDimension(newCellDimension) {
    this._cellDimension = newCellDimension;
  }

  get cellDepth() {
    return this._cellDepth;
  }

  set cellDepth(newCellDepth) {
    this._cellDepth = newCellDepth;
  }

  get cellLife() {
    return this._cellLife;
  }

  set cellLife(newCellLife) {
    this._cellLife = newCellLife;
  }

  get currentSeed() {
    return this._currentSeed;
  }

  set currentSeed(newCurrentSeed) {
    this._currentSeed = newCurrentSeed;
  }

  get playingSeed() {
    return this._playingSeed;
  }

  set playingSeed(newPlayingSeed) {
    this._playingSeed = newPlayingSeed;
  }

  get rowNumber() {
    return this._rowNumber;
  }

  set rowNumber(newRowNumber) {
    this._rowNumber = newRowNumber;
  }
}
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
  CellEcosystem.cellEcosystem = new CellEcosystem(48, 15, 2, 100);

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
