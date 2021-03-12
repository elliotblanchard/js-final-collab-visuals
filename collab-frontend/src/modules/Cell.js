/* eslint-disable no-underscore-dangle */
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

export default Cell;
