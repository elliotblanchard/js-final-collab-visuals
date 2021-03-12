/* eslint-disable no-underscore-dangle */
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

export default Seed;
