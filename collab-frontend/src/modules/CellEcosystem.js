/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */
import * as THREE from '../build/three.module.js';
import Cell from './Cell.js';

// Define overall class for the cells matrix
class CellEcosystem {
  constructor(gridDimension, cellDimension, cellDepth, cellLife, scene) {
    this._gridDimension = gridDimension;
    this._cellDimension = cellDimension;
    this._cellDepth = cellDepth;
    this._cellLife = cellLife;
    this._scene = scene;
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
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(
          this._cellDepth,
          this._cellDepth,
          this._cellDepth,
          32,
        ),
        this._cellsMatrix[i].material,
      );
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
      if ((this._cellsMatrix[this.minMax(i - (this._gridDimension - 1))]._lum > this._lumCutoff)
        && !this._edges.rightRow.includes(i)) {
        this._cellsMatrix[i]._neighbors += 1;
      }
      // West (i+1)
      if ((this._cellsMatrix[this.minMax(i + 1)]._lum > this._lumCutoff)
        && !this._edges.rightRow.includes(i)) {
        this._cellsMatrix[i]._neighbors += 1;
      }
      // South West (i+(dimension+1))
      if ((this._cellsMatrix[this.minMax(i + (this._gridDimension + 1))]._lum > this._lumCutoff)
      && !this._edges.rightRow.includes(i)) {
        this._cellsMatrix[i].neighbors += 1;
      }
      // South (i+dimension)
      if (this._cellsMatrix[this.minMax(i + this._gridDimension)]._lum > this._lumCutoff) {
        this._cellsMatrix[i]._neighbors += 1;
      }
      // South East (i+(dimension-1))
      if ((this._cellsMatrix[this.minMax(i + (this._gridDimension - 1))]._lum > this._lumCutoff)
      && !this._edges.leftRow.includes(i)) {
        this._cellsMatrix[i]._neighbors += 1;
      }
      // East (i-1)
      if ((this._cellsMatrix[this.minMax(i - 1)]._lum > this._lumCutoff)
      && !this._edges.leftRow.includes(i)) {
        this._cellsMatrix[i]._neighbors += 1;
      }
      // North East (i-(dimension+1))
      if ((this._cellsMatrix[this.minMax(i - (this.gridDimension + 1))]._lum > this._lumCutoff)
      && !this._edges.leftRow.includes(i)) {
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

  get scene() {
    return this._scene;
  }

  set scene(newScene) {
    this._scene = newScene;
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

export default CellEcosystem;
