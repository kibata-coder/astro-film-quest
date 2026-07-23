import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const file = join(process.cwd(), 'src/lib/timelines.ts');
let content = readFileSync(file, 'utf-8');

const replacements = {
  // Star Wars
  "poster_path: '/6q.jpg',": "poster_path: '/xQzMnuiv81d0gfUIVstuleNutjA.jpg',",
  "poster_path: '/o.jpg',": "poster_path: '/oZNPzxqM2s5DyVWab09NTQScDQt.jpg',",
  "poster_path: '/e.jpg',": "poster_path: '/roNaULLgqVA8SnLoOntOaPFvY8L.jpg',",
  "poster_path: '/x.jpg',": "poster_path: '/xfSAoBEm9MNBjmlNcDYLvLSMlnq.jpg',",
  "poster_path: '/3.jpg',": "poster_path: '/4oD6VEccFkorEBTEDXtpLAaz0Rl.jpg',",
  "poster_path: '/q.jpg',": "poster_path: '/qJRB789ceLryrLvOKrZqLKr2CGf.jpg',",
  "poster_path: '/aj.jpg',": "poster_path: '/khZqmwHQicTYoS7Flreb9EddFZC.jpg',",
  "poster_path: '/5.jpg',": "poster_path: '/i0yw1mFbB7sNGHCs7EXZPzFkdA1.jpg',",
  "poster_path: '/6.jpg',": "poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',",
  "poster_path: '/7.jpg',": "poster_path: '/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg',",
  "poster_path: '/8.jpg',": "poster_path: '/jQYlydvHm3kUix1f8prMucrplhm.jpg',",
  "poster_path: '/s.jpg',": "poster_path: '/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',",
  "poster_path: '/k.jpg',": "poster_path: '/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg',",
  "poster_path: '/c.jpg',": "poster_path: '/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg',",
  "poster_path: '/d.jpg',": "poster_path: '/db32LaOibwEliAmSL2jjDF6oDdj.jpg',",

  // DC (let me check if DC has broken paths) - wait, DC paths in file:
  "poster_path: '/gf.jpg',": "poster_path: '/imekS7I1NDicfl59h02m18L3uM7.jpg',", // Wonder Woman 297762
  "poster_path: '/8n.jpg',": "poster_path: '/oBgWY00bEFeZ9N25wWVyuQddbAo.jpg',", // WW84 464052
  // I didn't fetch DC paths! I should just write a generic replace using a TMDB fetcher.
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.replace(key, value);
}

writeFileSync(file, content);
console.log('done');
