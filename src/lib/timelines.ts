export type MediaType = 'movie' | 'tv' | 'anime';

export interface TimelineItem {
  id: number;                 // TMDB ID or MAL ID
  media_type: MediaType;
  title: string;
  year: number;
  poster_path: string;
  chronologicalOrder: number; // 1-indexed order in story chronology
  releaseOrder: number;       // 1-indexed order in release date
  phase: string;              // e.g. "Phase One", "Prequel Era", "Infinity Saga"
  note?: string;              // e.g. "Set in 1941 during WWII"
}

export interface TimelineFranchise {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  bannerUrl: string;
  accentColor: string;
  phases: string[];
  items: TimelineItem[];
}

export const FRANCHISE_TIMELINES: TimelineFranchise[] = [
  {
    id: 'mcu',
    name: 'Marvel Cinematic Universe',
    shortName: 'MCU',
    tagline: 'The complete Marvel timeline from Captain America to Multiverse Saga',
    description: 'Experience the entire Marvel Cinematic Universe in official in-universe chronological order or by release date.',
    bannerUrl: 'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    accentColor: '#EC1D24',
    phases: ['Phase One', 'Phase Two', 'Phase Three', 'Phase Four', 'Phase Five'],
    items: [
      {
        id: 1771,
        media_type: 'movie',
        title: 'Captain America: The First Avenger',
        year: 1941,
        poster_path: '/vSNxAJTlD0r02V9sPYpOjqDZXUK.jpg',
        chronologicalOrder: 1,
        releaseOrder: 5,
        phase: 'Phase One',
        note: 'Set during World War II (1941–1945). Origin of Steve Rogers and the Tesseract.'
      },
      {
        id: 299537,
        media_type: 'movie',
        title: 'Captain Marvel',
        year: 1995,
        poster_path: '/AtsgWhDnHTq68L0lLsUrCnM7TjG.jpg',
        chronologicalOrder: 2,
        releaseOrder: 21,
        phase: 'Phase Three',
        note: 'Set in 1995. Carol Danvers becomes Captain Marvel and meets Nick Fury.'
      },
      {
        id: 1726,
        media_type: 'movie',
        title: 'Iron Man',
        year: 2010,
        poster_path: '/78lPtwv72eTNqFW9COBYI0dWDJa.jpg',
        chronologicalOrder: 3,
        releaseOrder: 1,
        phase: 'Phase One',
        note: 'Set in 2010. Tony Stark creates the Mark I suit and becomes Iron Man.'
      },
      {
        id: 10138,
        media_type: 'movie',
        title: 'Iron Man 2',
        year: 2011,
        poster_path: '/6WBeq4fCfn7AN0o21W9qNcRF2l9.jpg',
        chronologicalOrder: 4,
        releaseOrder: 3,
        phase: 'Phase One',
        note: 'Set in 2011. Takes place during the same week as Thor and The Incredible Hulk.'
      },
      {
        id: 1724,
        media_type: 'movie',
        title: 'The Incredible Hulk',
        year: 2011,
        poster_path: '/gKzYx79y0AQTL4UAk1cBQJ3nvrm.jpg',
        chronologicalOrder: 5,
        releaseOrder: 2,
        phase: 'Phase One',
        note: 'Set in 2011. Bruce Banner battles Abomination in Harlem.'
      },
      {
        id: 10195,
        media_type: 'movie',
        title: 'Thor',
        year: 2011,
        poster_path: '/prSfAi1xGrhLQNxVSUFh61xQ4Qy.jpg',
        chronologicalOrder: 6,
        releaseOrder: 4,
        phase: 'Phase One',
        note: 'Set in 2011. Thor is banished to Earth and proves worthy of Mjolnir.'
      },
      {
        id: 24428,
        media_type: 'movie',
        title: 'The Avengers',
        year: 2012,
        poster_path: '/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
        chronologicalOrder: 7,
        releaseOrder: 6,
        phase: 'Phase One',
        note: 'Set in 2012. Earth’s Mightiest Heroes assemble for the Battle of New York.'
      },
      {
        id: 68721,
        media_type: 'movie',
        title: 'Iron Man 3',
        year: 2012,
        poster_path: '/qhPtAc1TKbMPqNvcdXSOn9Bn7hZ.jpg',
        chronologicalOrder: 8,
        releaseOrder: 7,
        phase: 'Phase Two',
        note: 'Set in December 2012. Tony Stark faces the Mandarin following the Avengers fallout.'
      },
      {
        id: 76338,
        media_type: 'movie',
        title: 'Thor: The Dark World',
        year: 2013,
        poster_path: '/wp6OxE4poJ4G7c0U2ZIXasTSMR7.jpg',
        chronologicalOrder: 9,
        releaseOrder: 8,
        phase: 'Phase Two',
        note: 'Set in 2013. Thor battles Malekith and the Dark Elves for the Aether.'
      },
      {
        id: 100402,
        media_type: 'movie',
        title: 'Captain America: The Winter Soldier',
        year: 2014,
        poster_path: '/tVFRpFw3xTedgPGqxW0AOI8Qhh0.jpg',
        chronologicalOrder: 10,
        releaseOrder: 9,
        phase: 'Phase Two',
        note: 'Set in 2014. Steve Rogers uncovers Hydra’s infiltration of S.H.I.E.L.D.'
      },
      {
        id: 118340,
        media_type: 'movie',
        title: 'Guardians of the Galaxy',
        year: 2014,
        poster_path: '/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg',
        chronologicalOrder: 11,
        releaseOrder: 10,
        phase: 'Phase Two',
        note: 'Set in 2014. Star-Lord, Gamora, Drax, Rocket, and Groot unite.'
      },
      {
        id: 283995,
        media_type: 'movie',
        title: 'Guardians of the Galaxy Vol. 2',
        year: 2014,
        poster_path: '/y4MBh0EjBlMuOzv9axM4qJlmhzz.jpg',
        chronologicalOrder: 12,
        releaseOrder: 15,
        phase: 'Phase Three',
        note: 'Set just months after Guardians Vol. 1 in late 2014.'
      },
      {
        id: 99861,
        media_type: 'movie',
        title: 'Avengers: Age of Ultron',
        year: 2015,
        poster_path: '/4ssDuvEDkSArWEdyBl2X5EHvYKU.jpg',
        chronologicalOrder: 13,
        releaseOrder: 11,
        phase: 'Phase Two',
        note: 'Set in 2015. Tony Stark accidentally creates Ultron, leading to Sokovia.'
      },
      {
        id: 102899,
        media_type: 'movie',
        title: 'Ant-Man',
        year: 2015,
        poster_path: '/rQRnQfUl3kfp78nCWq8Ks04vnq1.jpg',
        chronologicalOrder: 14,
        releaseOrder: 12,
        phase: 'Phase Two',
        note: 'Set in 2015. Scott Lang inherits the Ant-Man suit from Hank Pym.'
      },
      {
        id: 271110,
        media_type: 'movie',
        title: 'Captain America: Civil War',
        year: 2016,
        poster_path: '/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg',
        chronologicalOrder: 15,
        releaseOrder: 13,
        phase: 'Phase Three',
        note: 'Set in 2016. The Avengers split over the Sokovia Accords.'
      },
      {
        id: 497698,
        media_type: 'movie',
        title: 'Black Widow',
        year: 2016,
        poster_path: '/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg',
        chronologicalOrder: 16,
        releaseOrder: 24,
        phase: 'Phase Four',
        note: 'Set immediately after Civil War in 2016 while Natasha is on the run.'
      },
      {
        id: 284052,
        media_type: 'movie',
        title: 'Black Panther',
        year: 2016,
        poster_path: '/xf8PbyQcR5ucXErmZNzdKR0s8ya.jpg',
        chronologicalOrder: 17,
        releaseOrder: 18,
        phase: 'Phase Three',
        note: 'Set in 2016, one week after the events of Civil War.'
      },
      {
        id: 315635,
        media_type: 'movie',
        title: 'Spider-Man: Homecoming',
        year: 2016,
        poster_path: '/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg',
        chronologicalOrder: 18,
        releaseOrder: 16,
        phase: 'Phase Three',
        note: 'Set in fall 2016. Peter Parker balances high school and heroism.'
      },
      {
        id: 284053,
        media_type: 'movie',
        title: 'Doctor Strange',
        year: 2016,
        poster_path: '/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg',
        chronologicalOrder: 19,
        releaseOrder: 14,
        phase: 'Phase Three',
        note: 'Set from 2016 to 2017. Stephen Strange masters Kamar-Taj mystic arts.'
      },
      {
        id: 284054,
        media_type: 'movie',
        title: 'Thor: Ragnarok',
        year: 2017,
        poster_path: '/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
        chronologicalOrder: 20,
        releaseOrder: 17,
        phase: 'Phase Three',
        note: 'Set in 2017. Asgard is destroyed and Thor meets the Hulk on Sakaar.'
      },
      {
        id: 299536,
        media_type: 'movie',
        title: 'Avengers: Infinity War',
        year: 2018,
        poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
        chronologicalOrder: 21,
        releaseOrder: 19,
        phase: 'Phase Three',
        note: 'Set in spring 2018. Thanos collects all 6 Infinity Stones.'
      },
      {
        id: 299534,
        media_type: 'movie',
        title: 'Avengers: Endgame',
        year: 2023,
        poster_path: '/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg',
        chronologicalOrder: 22,
        releaseOrder: 22,
        phase: 'Phase Three',
        note: 'Set in 2023 following the 5-year Blip gap.'
      },
      {
        id: 84958,
        media_type: 'tv',
        title: 'Loki',
        year: 2023,
        poster_path: '/rX1wQMTKFqF0gvZyS0DDQqgnQPB.jpg',
        chronologicalOrder: 23,
        releaseOrder: 23,
        phase: 'Phase Four',
        note: 'Branches outside of time immediately following Endgame (2012 Loki escape).'
      },
      {
        id: 429617,
        media_type: 'movie',
        title: 'Spider-Man: Far From Home',
        year: 2024,
        poster_path: '/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg',
        chronologicalOrder: 24,
        releaseOrder: 23,
        phase: 'Phase Three',
        note: 'Set 8 months after Endgame in summer 2024.'
      },
      {
        id: 634649,
        media_type: 'movie',
        title: 'Spider-Man: No Way Home',
        year: 2024,
        poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
        chronologicalOrder: 25,
        releaseOrder: 27,
        phase: 'Phase Four',
        note: 'Set in late 2024 immediately following Far From Home’s unmasking.'
      },
      {
        id: 453395,
        media_type: 'movie',
        title: 'Doctor Strange in the Multiverse of Madness',
        year: 2025,
        poster_path: '/ddJcSKbcp4rKZTmuyWaMhuwcfMz.jpg',
        chronologicalOrder: 26,
        releaseOrder: 28,
        phase: 'Phase Four',
        note: 'Set in spring 2025 as Doctor Strange protects America Chavez.'
      },
      {
        id: 447365,
        media_type: 'movie',
        title: 'Guardians of the Galaxy Vol. 3',
        year: 2026,
        poster_path: '/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg',
        chronologicalOrder: 27,
        releaseOrder: 32,
        phase: 'Phase Five',
        note: 'Set in 2026. The Guardians embark on their final mission together.'
      },
      {
        id: 533535,
        media_type: 'movie',
        title: 'Deadpool & Wolverine',
        year: 2026,
        poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        chronologicalOrder: 28,
        releaseOrder: 34,
        phase: 'Phase Five',
        note: 'Set in 2026. Deadpool is recruited by the TVA and teams up with Wolverine.'
      }
    ]
  },

  {
    id: 'starwars',
    name: 'Star Wars Timeline',
    shortName: 'Star Wars',
    tagline: 'From the Fall of the Jedi to the Rise of Skywalker',
    description: 'Explore the complete Star Wars saga in narrative BBY/ABY chronological order.',
    bannerUrl: 'https://image.tmdb.org/t/p/w1280/yUiXA68FfQeA8cRBhd0Ao0jIRZt.jpg',
    accentColor: '#FFE81F',
    phases: ['Prequel Era', 'Reign of the Empire', 'Age of Rebellion', 'The New Republic', 'Sequel Era'],
    items: [
      {
        id: 1893,
        media_type: 'movie',
        title: 'Star Wars: Episode I - The Phantom Menace',
        year: 32,
        poster_path: '/xQzMnuiv81d0gfUIVstuleNutjA.jpg',
        chronologicalOrder: 1,
        releaseOrder: 4,
        phase: 'Prequel Era',
        note: '32 BBY. Qui-Gon Jinn and Obi-Wan Kenobi discover young Anakin Skywalker.'
      },
      {
        id: 1894,
        media_type: 'movie',
        title: 'Star Wars: Episode II - Attack of the Clones',
        year: 22,
        poster_path: '/oZNPzxqM2s5DyVWab09NTQScDQt.jpg',
        chronologicalOrder: 2,
        releaseOrder: 5,
        phase: 'Prequel Era',
        note: '22 BBY. The Clone Wars begin as Anakin and Padmé fall in love.'
      },
      {
        id: 31739,
        media_type: 'tv',
        title: 'Star Wars: The Clone Wars',
        year: 22,
        poster_path: '/roNaULLgqVA8SnLoOntOaPFvY8L.jpg',
        chronologicalOrder: 3,
        releaseOrder: 7,
        phase: 'Prequel Era',
        note: '22–19 BBY. Ahsoka Tano and Captain Rex fight across the galaxy.'
      },
      {
        id: 1895,
        media_type: 'movie',
        title: 'Star Wars: Episode III - Revenge of the Sith',
        year: 19,
        poster_path: '/xfSAoBEm9MNBjmlNcDYLvLSMlnq.jpg',
        chronologicalOrder: 4,
        releaseOrder: 6,
        phase: 'Prequel Era',
        note: '19 BBY. Order 66 is executed and Darth Vader rises.'
      },
      {
        id: 348350,
        media_type: 'movie',
        title: 'Solo: A Star Wars Story',
        year: 10,
        poster_path: '/4oD6VEccFkorEBTEDXtpLAaz0Rl.jpg',
        chronologicalOrder: 5,
        releaseOrder: 10,
        phase: 'Reign of the Empire',
        note: '10 BBY. Young Han Solo meets Chewbacca and Lando Calrissian.'
      },
      {
        id: 92830,
        media_type: 'tv',
        title: 'Obi-Wan Kenobi',
        year: 9,
        poster_path: '/qJRB789ceLryrLvOKrZqLKr2CGf.jpg',
        chronologicalOrder: 6,
        releaseOrder: 12,
        phase: 'Reign of the Empire',
        note: '9 BBY. Obi-Wan watches over young Luke Skywalker on Tatooine.'
      },
      {
        id: 83867,
        media_type: 'tv',
        title: 'Andor',
        year: 5,
        poster_path: '/khZqmwHQicTYoS7Flreb9EddFZC.jpg',
        chronologicalOrder: 7,
        releaseOrder: 13,
        phase: 'Age of Rebellion',
        note: '5–0 BBY. Cassian Andor joins the nascent Rebel Alliance.'
      },
      {
        id: 330459,
        media_type: 'movie',
        title: 'Rogue One: A Star Wars Story',
        year: 0,
        poster_path: '/i0yw1mFbB7sNGHCs7EXZPzFkdA1.jpg',
        chronologicalOrder: 8,
        releaseOrder: 8,
        phase: 'Age of Rebellion',
        note: '0 BBY. Jyn Erso and team steal the Death Star plans.'
      },
      {
        id: 11,
        media_type: 'movie',
        title: 'Star Wars: Episode IV - A New Hope',
        year: 0,
        poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
        chronologicalOrder: 9,
        releaseOrder: 1,
        phase: 'Age of Rebellion',
        note: '0 ABY (Battle of Yavin). Luke Skywalker destroys the Death Star.'
      },
      {
        id: 1891,
        media_type: 'movie',
        title: 'Star Wars: Episode V - The Empire Strikes Back',
        year: 3,
        poster_path: '/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg',
        chronologicalOrder: 10,
        releaseOrder: 2,
        phase: 'Age of Rebellion',
        note: '3 ABY. Darth Vader reveals his secret to Luke at Cloud City.'
      },
      {
        id: 1892,
        media_type: 'movie',
        title: 'Star Wars: Episode VI - Return of the Jedi',
        year: 4,
        poster_path: '/jQYlydvHm3kUix1f8prMucrplhm.jpg',
        chronologicalOrder: 11,
        releaseOrder: 3,
        phase: 'Age of Rebellion',
        note: '4 ABY. The Emperor is defeated and Anakin finds redemption.'
      },
      {
        id: 82856,
        media_type: 'tv',
        title: 'The Mandalorian',
        year: 9,
        poster_path: '/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
        chronologicalOrder: 12,
        releaseOrder: 11,
        phase: 'The New Republic',
        note: '9 ABY. Din Djarin protects Grogu in the outer rim.'
      },
      {
        id: 140607,
        media_type: 'movie',
        title: 'Star Wars: Episode VII - The Force Awakens',
        year: 34,
        poster_path: '/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg',
        chronologicalOrder: 13,
        releaseOrder: 9,
        phase: 'Sequel Era',
        note: '34 ABY. Rey, Finn, and Kylo Ren clash as Starkiller Base strikes.'
      },
      {
        id: 181808,
        media_type: 'movie',
        title: 'Star Wars: Episode VIII - The Last Jedi',
        year: 34,
        poster_path: '/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg',
        chronologicalOrder: 14,
        releaseOrder: 10,
        phase: 'Sequel Era',
        note: '34 ABY. Luke trains Rey on Ahch-To while the Resistance flees.'
      },
      {
        id: 181812,
        media_type: 'movie',
        title: 'Star Wars: Episode IX - The Rise of Skywalker',
        year: 35,
        poster_path: '/db32LaOibwEliAmSL2jjDF6oDdj.jpg',
        chronologicalOrder: 15,
        releaseOrder: 11,
        phase: 'Sequel Era',
        note: '35 ABY. The final showdown against Emperor Palpatine on Exegol.'
      }
    ]
  },

  {
    id: 'dc',
    name: 'DC Extended Universe',
    shortName: 'DCEU',
    tagline: 'The complete Justice League & DC universe timeline',
    description: 'Watch the DC Extended Universe from Wonder Woman through the Flash and Aquaman.',
    bannerUrl: 'https://image.tmdb.org/t/p/w1280/13Nz8EchKRdCgJcKdEoJAnpiVn2.jpg',
    accentColor: '#0476F1',
    phases: ['Origins', 'Justice League Era', 'Post-Snyderverse', 'Multiverse Reset'],
    items: [
      {
        id: 297762,
        media_type: 'movie',
        title: 'Wonder Woman',
        year: 1918,
        poster_path: '/v4ncgZjG2Zu8ZW5al1vIZTsSjqX.jpg',
        chronologicalOrder: 1,
        releaseOrder: 4,
        phase: 'Origins',
        note: 'Set in 1918 during World War I. Diana leaves Themyscira.'
      },
      {
        id: 464052,
        media_type: 'movie',
        title: 'Wonder Woman 1984',
        year: 1984,
        poster_path: '/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg',
        chronologicalOrder: 2,
        releaseOrder: 9,
        phase: 'Origins',
        note: 'Set in 1984. Diana confronts Maxwell Lord and Cheetah.'
      },
      {
        id: 49521,
        media_type: 'movie',
        title: 'Man of Steel',
        year: 2013,
        poster_path: '/8GFtkImmK0K1VaUChR0n9O61CFU.jpg',
        chronologicalOrder: 3,
        releaseOrder: 1,
        phase: 'Origins',
        note: 'Set in 2013. Clark Kent reveals himself to Earth to defeat General Zod.'
      },
      {
        id: 209112,
        media_type: 'movie',
        title: 'Batman v Superman: Dawn of Justice',
        year: 2015,
        poster_path: '/5UsK3grJvtQrtzEgqNlDljJW96w.jpg',
        chronologicalOrder: 4,
        releaseOrder: 2,
        phase: 'Justice League Era',
        note: 'Set 18 months after Man of Steel in late 2015.'
      },
      {
        id: 297761,
        media_type: 'movie',
        title: 'Suicide Squad',
        year: 2016,
        poster_path: '/sk3FZgh3sRrmr8vyhaitNobMcfh.jpg',
        chronologicalOrder: 5,
        releaseOrder: 3,
        phase: 'Justice League Era',
        note: 'Set in 2016 following the death of Superman.'
      },
      {
        id: 791373,
        media_type: 'movie',
        title: 'Zack Snyder’s Justice League',
        year: 2017,
        poster_path: '/tnAuB8q5vv7Ax9UAEje5Xi4BXik.jpg',
        chronologicalOrder: 6,
        releaseOrder: 10,
        phase: 'Justice League Era',
        note: 'Set in 2017. Batman and Wonder Woman assemble the League against Darkseid.'
      },
      {
        id: 297802,
        media_type: 'movie',
        title: 'Aquaman',
        year: 2018,
        poster_path: '/ufl63EFcc5XpByEV2Ecdw6WJZAI.jpg',
        chronologicalOrder: 7,
        releaseOrder: 6,
        phase: 'Post-Snyderverse',
        note: 'Set in 2018 after Justice League. Arthur Curry claims Atlantis.'
      },
      {
        id: 287947,
        media_type: 'movie',
        title: 'Shazam!',
        year: 2018,
        poster_path: '/xnopI5Xtky18MPhK40cZAGAOVeV.jpg',
        chronologicalOrder: 8,
        releaseOrder: 7,
        phase: 'Post-Snyderverse',
        note: 'Set at Christmas 2018. Billy Batson becomes Shazam.'
      },
      {
        id: 436969,
        media_type: 'movie',
        title: 'The Suicide Squad',
        year: 2021,
        poster_path: '/q61qEyssk2ku3okWICKArlAdhBn.jpg',
        chronologicalOrder: 9,
        releaseOrder: 11,
        phase: 'Post-Snyderverse',
        note: 'Set in 2021. Task Force X destroys Project Starfish on Corto Maltese.'
      },
      {
        id: 110492,
        media_type: 'tv',
        title: 'Peacemaker',
        year: 2022,
        poster_path: '/eYzbGcYnOUlvj2fa76pTgIXogd7.jpg',
        chronologicalOrder: 10,
        releaseOrder: 12,
        phase: 'Post-Snyderverse',
        note: 'Set in 2022 directly following the events of The Suicide Squad.'
      },
      {
        id: 298618,
        media_type: 'movie',
        title: 'The Flash',
        year: 2023,
        poster_path: '/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg',
        chronologicalOrder: 11,
        releaseOrder: 14,
        phase: 'Multiverse Reset',
        note: 'Set in 2023. Barry Allen alters time, resetting the DC multiverse.'
      }
    ]
  },

  {
    id: 'dragonball',
    name: 'Dragon Ball Saga',
    shortName: 'Dragon Ball',
    tagline: 'Goku’s complete journey from Emperor Pilaf to Super Hero',
    description: 'Follow Akira Toriyama’s Dragon Ball universe in story order.',
    bannerUrl: 'https://image.tmdb.org/t/p/w1280/ydf1CeiBLfdxiyNTpskM0802TKl.jpg',
    accentColor: '#FF6B00',
    phases: ['Original Series', 'Saiyan & Frieza Era', 'Cell & Buu Era', 'Super Era'],
    items: [
      {
        id: 12609,
        media_type: 'anime',
        title: 'Dragon Ball',
        year: 1986,
        poster_path: '/onCLyCOgszTIyyVs2XKYSkKPOPG.jpg',
        chronologicalOrder: 1,
        releaseOrder: 1,
        phase: 'Original Series',
        note: 'Goku’s childhood training with Master Roshi and Dragon Ball hunts.'
      },
      {
        id: 12971,
        media_type: 'anime',
        title: 'Dragon Ball Z',
        year: 1989,
        poster_path: '/oQ5CnVj3TRifXl2bIOri6H6rfNe.jpg',
        chronologicalOrder: 2,
        releaseOrder: 2,
        phase: 'Saiyan & Frieza Era',
        note: 'Saiyan Saga, Namek, Frieza, Androids, Cell, and Majin Buu.'
      },
      {
        id: 62715,
        media_type: 'anime',
        title: 'Dragon Ball Super',
        year: 2015,
        poster_path: '/qEUrbXJ2qt4Rg84Btlx4STOhgte.jpg',
        chronologicalOrder: 3,
        releaseOrder: 4,
        phase: 'Super Era',
        note: 'Set during the 10-year timeskip before DBZ’s end. Gods of Destruction & Tournament of Power.'
      },
      {
        id: 503314,
        media_type: 'movie',
        title: 'Dragon Ball Super: Broly',
        year: 2018,
        poster_path: '/uMEgkyiPznZP5AiMSWAk2jsj5gC.jpg',
        chronologicalOrder: 4,
        releaseOrder: 5,
        phase: 'Super Era',
        note: 'Set immediately after the Tournament of Power. Goku & Vegeta vs Broly.'
      },
      {
        id: 610150,
        media_type: 'movie',
        title: 'Dragon Ball Super: Super Hero',
        year: 2022,
        poster_path: '/pi0iZOEHeA3ih4p1IwAG4x2DZNH.jpg',
        chronologicalOrder: 5,
        releaseOrder: 6,
        phase: 'Super Era',
        note: 'Set after Broly. Gohan and Piccolo fight the reborn Red Ribbon Army.'
      }
    ]
  },

  {
    id: 'aot',
    name: 'Attack on Titan',
    shortName: 'AoT',
    tagline: 'Shingeki no Kyojin — Season 1 through The Final Season',
    description: 'Experience Eren Yeager’s complete journey from the fall of Wall Maria to the Rumbling.',
    bannerUrl: 'https://image.tmdb.org/t/p/w1280/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg',
    accentColor: '#A8201A',
    phases: ['Fall of Shiganshina', 'Scout Regiment Era', 'Marley Arc', 'The Rumbling'],
    items: [
      {
        id: 1429,
        media_type: 'anime',
        title: 'Attack on Titan — Season 1',
        year: 2013,
        poster_path: '/3Npd9yTdy76kHzoFpL0SOIxE6Uv.jpg',
        chronologicalOrder: 1,
        releaseOrder: 1,
        phase: 'Fall of Shiganshina',
        note: 'Wall Maria falls. Eren, Mikasa and Armin join the 104th Cadet Corps.'
      },
      {
        id: 1429,
        media_type: 'anime',
        title: 'Attack on Titan — Season 2',
        year: 2017,
        poster_path: '/2fhK0wbFixskgRyuq6YvaMn75et.jpg',
        chronologicalOrder: 2,
        releaseOrder: 2,
        phase: 'Scout Regiment Era',
        note: 'Clash of the Titans arc. Beast Titan appears and Wall Rose is breached.'
      },
      {
        id: 1429,
        media_type: 'anime',
        title: 'Attack on Titan — Season 3',
        year: 2018,
        poster_path: '/ynow2o9v0G341PLv1chCRDufCgc.jpg',
        chronologicalOrder: 3,
        releaseOrder: 3,
        phase: 'Scout Regiment Era',
        note: 'Uprising arc & Return to Shiganshina. The secrets of Grisha’s basement revealed.'
      },
      {
        id: 1429,
        media_type: 'anime',
        title: 'Attack on Titan — The Final Season',
        year: 2020,
        poster_path: '/sfbSjGlLHsvFQrMUSNR9RrwZgV1.jpg',
        chronologicalOrder: 4,
        releaseOrder: 4,
        phase: 'Marley Arc & The Rumbling',
        note: 'Marley war, Jaegerists, and the catastrophic global Rumbling.'
      }
    ]
  }
];

export const getTimelineById = (id: string): TimelineFranchise | undefined =>
  FRANCHISE_TIMELINES.find((f) => f.id === id);
