import https from 'https';

const API_KEY = '4b7dcff627b89010a3ff7cef7c314152';

const getTmdbData = (id, type) => {
  return new Promise((resolve, reject) => {
    https.get(`https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const getTmdbSeasonData = (id, season) => {
  return new Promise((resolve, reject) => {
    https.get(`https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${API_KEY}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

const items = [
  { id: 1893, type: 'movie', title: 'Ep I' },
  { id: 1894, type: 'movie', title: 'Ep II' },
  { id: 31739, type: 'tv', title: 'Clone Wars' },
  { id: 1895, type: 'movie', title: 'Ep III' },
  { id: 348350, type: 'movie', title: 'Solo' },
  { id: 92830, type: 'tv', title: 'Obi-Wan' },
  { id: 83867, type: 'tv', title: 'Andor' },
  { id: 330459, type: 'movie', title: 'Rogue One' },
  { id: 11, type: 'movie', title: 'Ep IV' },
  { id: 1891, type: 'movie', title: 'Ep V' },
  { id: 1892, type: 'movie', title: 'Ep VI' },
  { id: 82856, type: 'tv', title: 'Mando' },
  { id: 140607, type: 'movie', title: 'Ep VII' },
  { id: 181808, type: 'movie', title: 'Ep VIII' },
  { id: 181812, type: 'movie', title: 'Ep IX' },
  
  { id: 12609, type: 'tv', title: 'DB' },
  { id: 12971, type: 'tv', title: 'DBZ' },
  { id: 62715, type: 'tv', title: 'DBS' },
  { id: 503314, type: 'movie', title: 'DBS Broly' },
  { id: 610150, type: 'movie', title: 'DBS Super Hero' },
];

async function main() {
  for (const item of items) {
    try {
      const data = await getTmdbData(item.id, item.type);
      console.log(`Title: ${item.title} -> Poster: ${data.poster_path} | Backdrop: ${data.backdrop_path}`);
    } catch (err) {
      console.error(err);
    }
  }

  // AoT seasons
  for (let s = 1; s <= 4; s++) {
     const data = await getTmdbSeasonData(1429, s);
     console.log(`AoT Season ${s} -> Poster: ${data.poster_path}`);
  }
}

main();
