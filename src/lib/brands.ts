// Central registry of all brands studios, streaming services, and major franchises.
// TMDB IDs verified: watch_provider_id for streamers, company_id for studios/franchises.

export type BrandType = 'provider' | 'company';

export interface Brand {
  id: string;           // URL-safe slug
  name: string;
  tmdbId: number;       // TMDB watch_provider_id OR company_id
  type: BrandType;
  color: string;        // brand accent color (for glow / background)
  logo: string;         // inline SVG data URI or absolute CDN URL
  description: string;
}

// ─── Inline SVG logos (no external dependency, zero CORS issues) ─────────────

const LOGOS: Record<string, string> = {
  marvel: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%23EC1D24'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='88' fill='white' letter-spacing='-2'>MARVEL</text></svg>`,
  disney: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%23113CCF'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Georgia,serif' font-weight='bold' font-size='68' fill='white'>Disney+</text></svg>`,
  netflix: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%23141414'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial,Helvetica' font-weight='900' font-size='72' fill='%23E50914' letter-spacing='-1'>NETFLIX</text></svg>`,
  prime: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%23232F3E'/><text x='50%25' y='42%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial,Helvetica' font-weight='700' font-size='48' fill='white'>prime</text><text x='50%25' y='73%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial,Helvetica' font-weight='400' font-size='32' fill='%2300A8E1'>video</text></svg>`,
  dc: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%230476F1'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='100' fill='white' letter-spacing='4'>DC</text></svg>`,
  appletv: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%23000000'/><text x='50%25' y='42%25' dominant-baseline='middle' text-anchor='middle' font-family='-apple-system,Helvetica' font-weight='300' font-size='36' fill='white'>Apple</text><text x='50%25' y='73%25' dominant-baseline='middle' text-anchor='middle' font-family='-apple-system,Helvetica' font-weight='600' font-size='40' fill='white'>TV+</text></svg>`,
  hulu: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%231CE783'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='80' fill='%231A1A1A' letter-spacing='1'>hulu</text></svg>`,
  pixar: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%230066CC'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='76' fill='white' letter-spacing='2'>PIXAR</text></svg>`,
  hbo: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%23222222'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='76' fill='white' letter-spacing='6'>HBO</text></svg>`,
  sony: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%23003087'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial,Helvetica' font-weight='700' font-size='72' fill='white' letter-spacing='1'>SONY</text></svg>`,
  universal: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%23000B54'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Georgia,serif' font-weight='bold' font-size='50' fill='white' letter-spacing='1'>UNIVERSAL</text></svg>`,
  paramount: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%230066CC'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Georgia,serif' font-weight='bold' font-size='50' fill='white' letter-spacing='1'>PARAMOUNT</text></svg>`,
  a24: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%23FFFFFF'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='90' fill='%23000000' letter-spacing='2'>A24</text></svg>`,
  starwars: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 150'><rect width='400' height='150' rx='8' fill='%23000000'/><text x='50%25' y='42%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='36' fill='%23FFE81F' letter-spacing='2'>STAR WARS</text><text x='50%25' y='75%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial,Helvetica' font-weight='400' font-size='22' fill='%23FFE81F' letter-spacing='3'>A LUCASFILM STORY</text></svg>`,
};

// ─── Brand list ordered: most-known first ──────────────────────────────────

export const ALL_BRANDS: Brand[] = [
  {
    id: 'marvel',
    name: 'Marvel Studios',
    tmdbId: 420,        // TMDB company ID for Marvel Studios
    type: 'company',
    color: '#EC1D24',
    logo: LOGOS.marvel,
    description: 'The Marvel Cinematic Universe blockbusters from Iron Man to the Avengers and beyond.',
  },
  {
    id: 'dc',
    name: 'DC',
    tmdbId: 9993,       // DC Entertainment
    type: 'company',
    color: '#0476F1',
    logo: LOGOS.dc,
    description: 'Batman, Superman, Wonder Woman and the full DC Extended Universe.',
  },
  {
    id: 'netflix',
    name: 'Netflix',
    tmdbId: 8,          // TMDB watch_provider_id
    type: 'provider',
    color: '#E50914',
    logo: LOGOS.netflix,
    description: 'Netflix Originals award-winning series, films, documentaries and more.',
  },
  {
    id: 'prime',
    name: 'Prime Video',
    tmdbId: 9,          // Amazon Prime Video
    type: 'provider',
    color: '#00A8E1',
    logo: LOGOS.prime,
    description: 'Amazon Prime Video The Boys, The Rings of Power, and thousands more.',
  },
  {
    id: 'disney',
    name: 'Disney+',
    tmdbId: 337,        // Disney+
    type: 'provider',
    color: '#113CCF',
    logo: LOGOS.disney,
    description: 'Disney, Pixar, Marvel, Star Wars and National Geographic all in one place.',
  },
  {
    id: 'hbo',
    name: 'HBO / Max',
    tmdbId: 1024,       // Max (formerly HBO Max)
    type: 'provider',
    color: '#7B2FBE',
    logo: LOGOS.hbo,
    description: 'Game of Thrones, House of the Dragon, Succession, The Wire and more HBO classics.',
  },
  {
    id: 'appletv',
    name: 'Apple TV+',
    tmdbId: 350,        // Apple TV+
    type: 'provider',
    color: '#555555',
    logo: LOGOS.appletv,
    description: 'Ted Lasso, Severance, The Morning Show and Apple Originals.',
  },
  {
    id: 'hulu',
    name: 'Hulu',
    tmdbId: 15,         // Hulu
    type: 'provider',
    color: '#1CE783',
    logo: LOGOS.hulu,
    description: 'The Handmaid\'s Tale, Only Murders in the Building and Hulu Originals.',
  },
  {
    id: 'pixar',
    name: 'Pixar',
    tmdbId: 3,          // Pixar Animation Studios
    type: 'company',
    color: '#0066CC',
    logo: LOGOS.pixar,
    description: 'Toy Story, Coco, Inside Out, Soul and every Pixar masterpiece.',
  },
  {
    id: 'starwars',
    name: 'Star Wars',
    tmdbId: 1,          // Lucasfilm
    type: 'company',
    color: '#FFE81F',
    logo: LOGOS.starwars,
    description: 'A galaxy far, far away every Star Wars film and series.',
  },
  {
    id: 'universal',
    name: 'Universal',
    tmdbId: 33,         // Universal Pictures
    type: 'company',
    color: '#000B54',
    logo: LOGOS.universal,
    description: 'Jurassic Park, Fast & Furious, Despicable Me and Universal classics.',
  },
  {
    id: 'sony',
    name: 'Sony Pictures',
    tmdbId: 5,          // Columbia Pictures / Sony
    type: 'company',
    color: '#003087',
    logo: LOGOS.sony,
    description: 'Spider-Man, Ghostbusters, Venom and Sony Pictures films.',
  },
  {
    id: 'paramount',
    name: 'Paramount',
    tmdbId: 4,          // Paramount Pictures
    type: 'company',
    color: '#0066CC',
    logo: LOGOS.paramount,
    description: 'Top Gun, Mission Impossible, Transformers and Paramount classics.',
  },
  {
    id: 'a24',
    name: 'A24',
    tmdbId: 41077,      // A24
    type: 'company',
    color: '#000000',
    logo: LOGOS.a24,
    description: 'Everything Everywhere, Midsommar, Hereditary prestige indie cinema.',
  },
];

// The brands that appear in the homepage rail (most recognizable first)
export const RAIL_BRANDS = ALL_BRANDS.slice(0, 6);

export const getBrandById = (id: string): Brand | undefined =>
  ALL_BRANDS.find((b) => b.id === id);
