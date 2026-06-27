import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import MediaGrid from '@/components/MediaGrid';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePerson, usePersonCredits } from '@/hooks/use-media';
import { getImageUrl } from '@/lib/tmdb';
import type { PersonCredit, Movie, TVShow } from '@/lib/tmdb';
import { useMedia } from '@/features/shared';

const uniqueBy = <T,>(items: T[], key: (item: T) => string | number): T[] => {
  const seen = new Set<string | number>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const sortByRelease = (a: PersonCredit, b: PersonCredit) => {
  const da = a.release_date || a.first_air_date || '';
  const db = b.release_date || b.first_air_date || '';
  return db.localeCompare(da);
};

const toMovie = (c: PersonCredit): Movie => ({
  id: c.id,
  title: c.title || c.name || 'Untitled',
  overview: c.overview || '',
  poster_path: c.poster_path,
  backdrop_path: c.backdrop_path,
  release_date: c.release_date || '',
  vote_average: c.vote_average,
  vote_count: c.vote_count,
} as Movie);

const toShow = (c: PersonCredit): TVShow => ({
  id: c.id,
  name: c.name || c.title || 'Untitled',
  overview: c.overview || '',
  poster_path: c.poster_path,
  backdrop_path: c.backdrop_path,
  first_air_date: c.first_air_date || '',
  vote_average: c.vote_average,
  vote_count: c.vote_count,
} as TVShow);

const Person = () => {
  const { id } = useParams<{ id: string }>();
  const personId = id ? parseInt(id, 10) : null;
  const { openMovieModal, openTVModal } = useMedia();
  const [bioExpanded, setBioExpanded] = useState(false);

  const { data: person, isLoading: personLoading } = usePerson(personId);
  const { data: credits, isLoading: creditsLoading } = usePersonCredits(personId);

  const { movies, shows, directing, allKnownFor } = useMemo(() => {
    const cast = credits?.cast || [];
    const crew = credits?.crew || [];

    const movieCast = cast.filter((c) => c.media_type === 'movie' && c.poster_path);
    const tvCast = cast.filter((c) => c.media_type === 'tv' && c.poster_path);

    const directingCredits = crew.filter(
      (c) => c.job === 'Director' && c.poster_path
    );

    const movies = uniqueBy(movieCast, (c) => c.id).sort(sortByRelease);
    const shows = uniqueBy(tvCast, (c) => c.id).sort(sortByRelease);
    const directing = uniqueBy(directingCredits, (c) => c.id).sort(sortByRelease);

    const allKnownFor = uniqueBy(
      [...cast, ...crew].filter((c) => c.poster_path),
      (c) => `${c.media_type}-${c.id}`
    )
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 12);

    return { movies, shows, directing, allKnownFor };
  }, [credits]);

  if (personLoading || !personId) {
    return (
      <Layout>
        <div className="pt-24 pb-12"><LoadingSpinner /></div>
      </Layout>
    );
  }

  if (!person) {
    return (
      <Layout>
        <div className="container mx-auto pt-28 px-5 md:px-8 pb-12 text-center">
          <p className="text-muted-foreground">Person not found.</p>
          <Link to="/" className="text-primary underline">Go home</Link>
        </div>
      </Layout>
    );
  }

  const handleCreditClick = (c: PersonCredit) => {
    if (c.media_type === 'movie') openMovieModal(toMovie(c));
    else openTVModal(toShow(c));
  };

  const bio = person.biography || '';
  const shortBio = bio.length > 600 ? `${bio.slice(0, 600).trim()}…` : bio;

  return (
    <Layout>
      <main className="container mx-auto px-5 md:px-8 pt-28 pb-16">
        {/* Header */}
        <section className="flex flex-col md:flex-row gap-6 md:gap-10 mb-10">
          <div className="w-36 md:w-56 flex-shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted">
              {person.profile_path ? (
                <img
                  src={getImageUrl(person.profile_path, 'w500')}
                  alt={person.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                  No image
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{person.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {person.known_for_department && (
                <Badge variant="secondary">{person.known_for_department}</Badge>
              )}
              {person.birthday && (
                <Badge variant="outline">Born {person.birthday}</Badge>
              )}
              {person.place_of_birth && (
                <Badge variant="outline" className="max-w-full truncate">
                  {person.place_of_birth}
                </Badge>
              )}
            </div>

            {bio ? (
              <div className="text-sm md:text-base text-muted-foreground leading-relaxed">
                <p className="whitespace-pre-line">
                  {bioExpanded ? bio : shortBio}
                </p>
                {bio.length > 600 && (
                  <button
                    onClick={() => setBioExpanded((v) => !v)}
                    className="mt-2 text-primary text-sm font-medium hover:underline"
                  >
                    {bioExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No biography available.</p>
            )}
          </div>
        </section>

        {creditsLoading ? (
          <LoadingSpinner />
        ) : (
          <Tabs defaultValue="known" className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto">
              <TabsTrigger value="known">Known For</TabsTrigger>
              <TabsTrigger value="movies">Movies ({movies.length})</TabsTrigger>
              <TabsTrigger value="tv">TV Shows ({shows.length})</TabsTrigger>
              {directing.length > 0 && (
                <TabsTrigger value="directing">Directing ({directing.length})</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="known">
              {allKnownFor.length ? (
                <MediaGrid
                  items={allKnownFor.map((c) =>
                    c.media_type === 'movie' ? toMovie(c) : toShow(c)
                  )}
                  onItemClick={(item) => {
                    const credit = allKnownFor.find((c) => c.id === (item as { id: number }).id);
                    if (credit) handleCreditClick(credit);
                  }}
                />
              ) : (
                <p className="text-muted-foreground">No credits available.</p>
              )}
            </TabsContent>

            <TabsContent value="movies">
              {movies.length ? (
                <MediaGrid
                  items={movies.map(toMovie)}
                  onItemClick={(item) => {
                    const credit = movies.find((c) => c.id === (item as { id: number }).id);
                    if (credit) handleCreditClick(credit);
                  }}
                />
              ) : (
                <p className="text-muted-foreground">No movies found.</p>
              )}
            </TabsContent>

            <TabsContent value="tv">
              {shows.length ? (
                <MediaGrid
                  items={shows.map(toShow)}
                  onItemClick={(item) => {
                    const credit = shows.find((c) => c.id === (item as { id: number }).id);
                    if (credit) handleCreditClick(credit);
                  }}
                />
              ) : (
                <p className="text-muted-foreground">No TV shows found.</p>
              )}
            </TabsContent>

            {directing.length > 0 && (
              <TabsContent value="directing">
                <MediaGrid
                  items={directing.map((c) =>
                    c.media_type === 'movie' ? toMovie(c) : toShow(c)
                  )}
                  onItemClick={(item) => {
                    const credit = directing.find((c) => c.id === (item as { id: number }).id);
                    if (credit) handleCreditClick(credit);
                  }}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </main>
    </Layout>
  );
};

export default Person;
