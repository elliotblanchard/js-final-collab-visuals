/* eslint-disable import/extensions */
import CellEcosystem from './CellEcosystem.js';
import Seed from './Seed.js';

const endPoint = 'http://collabvisuals.ngrok.io/api/v1/';

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

      nowplayingFetch(json.playlist.data[0].id);
    });
}

export { nowplayingFetch, playlistFetch };
