import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
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
          resolve(null);
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
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
};

async function fix() {
  const file = join(process.cwd(), 'src/lib/timelines.ts');
  let content = readFileSync(file, 'utf-8');

  // Parse out the items dynamically from the text to get their ID and type, but wait...
  // A simpler way: we just import the TS file, but it's typescript so we can't easily require it in node without compiling.
  // We'll just regex parse the file.
  
  const blockRegex = /id: (\d+),\s+media_type: '([^']+)',[\s\S]*?poster_path: '([^']+)',/g;
  
  let match;
  const updates = [];

  while ((match = blockRegex.exec(content)) !== null) {
    const id = parseInt(match[1]);
    let type = match[2];
    const oldPath = match[3];

    if (type === 'anime') type = 'tv'; // tmdb uses tv

    // We only need to fix broken paths. Most broken paths are less than 15 chars, or don't look like TMDB paths.
    // Let's just fetch everything to be safe.
    let data;
    if (id === 1429) {
       // AoT uses seasons
       // In the TS file, chronOrder is 1, 2, 3, 4. So we can just map based on the old path.
       if (oldPath === '/a.jpg') data = await getTmdbSeasonData(1429, 1);
       else if (oldPath === '/b.jpg') data = await getTmdbSeasonData(1429, 2);
       else if (oldPath === '/c.jpg') data = await getTmdbSeasonData(1429, 3);
       else if (oldPath === '/d.jpg') data = await getTmdbSeasonData(1429, 4);
       else data = await getTmdbData(id, type);
    } else {
       data = await getTmdbData(id, type);
    }

    if (data && data.poster_path) {
       if (oldPath !== data.poster_path) {
         updates.push({ oldPath, newPath: data.poster_path });
       }
    }
  }

  // Update banners
  content = content.replace("bannerUrl: 'https://image.tmdb.org/t/p/w1280/t3v.jpg'", "bannerUrl: 'https://image.tmdb.org/t/p/w1280/ydf1CeiBLfdxiyNTpskM0802TKl.jpg'");
  content = content.replace("bannerUrl: 'https://image.tmdb.org/t/p/w1280/7.jpg'", "bannerUrl: 'https://image.tmdb.org/t/p/w1280/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg'");

  for (const { oldPath, newPath } of updates) {
    content = content.replace(`poster_path: '${oldPath}'`, `poster_path: '${newPath}'`);
  }

  writeFileSync(file, content);
  console.log(`Replaced ${updates.length} posters and 2 banners!`);
}

fix();
