import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import { MovieGrid } from '@/features/movies';
import MediaCard from '@/components/MediaCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getBrandById } from '@/lib/brands';
import { discoverMovies, discoverTVShows } from '@/lib/tmdb';
import type { Movie, TVShow } from '@/lib/tmdb';
import { useMedia } from '@/features/shared';
import { useBrandMovies, useBrandTVShows } from '@/hooks/use-media';
import { ArrowLeft, Film, Tv, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BrandPage = () => {
  const { id } = useParams<{ id: string }>();
  const brand = id ? getBrandById(id) : undefined;
  const { openMovieModal, openTVModal } = useMedia();

  const [moviePage, setMoviePage] = useState(1);
  const [tvPage, setTvPage] = useState(1);
  const [extraMovies, setExtraMovies] = useState<Movie[]>([]);
  const [extraTVShows, setExtraTVShows] = useState<TVShow[]>([]);
  const [isLoadingMoreMovies, setIsLoadingMoreMovies] = useState(false);
  const [isLoadingMoreTV, setIsLoadingMoreTV] = useState(false);

  const initialFilters = useMemo(() => {
    if (!brand) return {};
    return brand.type === 'provider'
      ? { watchProviderId: brand.tmdbId, page: 1 }
      : { companyId: brand.tmdbId, page: 1 };
  }, [brand]);

  // Use React Query for initial page 1 (cached!)
  const { data: initialMovieData, isLoading: isLoadingMovies } = useBrandMovies(
    brand?.id || '',
    initialFilters,
    !!brand
  );
  const { data: initialTVData, isLoading: isLoadingTV } = useBrandTVShows(
    brand?.id || '',
    initialFilters,
    !!brand
  );

  // Reset extra pages when brand changes
  useEffect(() => {
    setMoviePage(1);
    setTvPage(1);
    setExtraMovies([]);
    setExtraTVShows([]);
  }, [brand?.id]);

  const movies = useMemo(() => {
    const p1 = initialMovieData?.results?.filter((m) => m.poster_path) || [];
    return [...p1, ...extraMovies];
  }, [initialMovieData, extraMovies]);

  const tvShows = useMemo(() => {
    const p1 = initialTVData?.results?.filter((s) => s.poster_path) || [];
    return [...p1, ...extraTVShows];
  }, [initialTVData, extraTVShows]);

  const movieTotalPages = initialMovieData?.total_pages ?? 1;
  const tvTotalPages = initialTVData?.total_pages ?? 1;

  const buildFiltersForPage = (page: number) => {
    if (!brand) return {};
    return brand.type === 'provider'
      ? { watchProviderId: brand.tmdbId, page }
      : { companyId: brand.tmdbId, page };
  };

  const loadMoreMovies = async () => {
    const next = moviePage + 1;
    setIsLoadingMoreMovies(true);
    const res = await discoverMovies(buildFiltersForPage(next));
    setExtraMovies((prev) => [...prev, ...(res.results?.filter((m) => m.poster_path) || [])]);
    setMoviePage(next);
    setIsLoadingMoreMovies(false);
  };

  const loadMoreTV = async () => {
    const next = tvPage + 1;
    setIsLoadingMoreTV(true);
    const res = await discoverTVShows(buildFiltersForPage(next));
    setExtraTVShows((prev) => [...prev, ...(res.results?.filter((s) => s.poster_path) || [])]);
    setTvPage(next);
    setIsLoadingMoreTV(false);
  };

  if (!brand) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-24">
          <p className="text-muted-foreground text-lg">Brand not found.</p>
          <Link to="/brands" className="text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Brands
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo
        title={`${brand.name} Movies & TV Shows | SoudFlex`}
        description={brand.description}
        canonicalPath={`/brand/${brand.id}`}
      />

      {/* ── Hero Header ── */}
      <div
        className="relative pt-24 pb-10 px-5 md:px-16 overflow-hidden"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${brand.color}22 0%, transparent 70%)` }}
      >
        {/* Back link */}
        <Link
          to="/brands"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> All Brands
        </Link>

        {/* Brand logo + description */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div
            className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex-shrink-0"
            style={{ boxShadow: `0 0 48px ${brand.color}44` }}
          >
            <img src={brand.logo} alt={brand.name} className="h-20 w-52 object-cover" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{brand.name}</h1>
            <p className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
              {brand.description}
            </p>
          </div>
        </div>

        {/* Glow accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(to right, transparent, ${brand.color}88, transparent)` }}
        />
      </div>

      <main className="px-5 md:px-16 pb-20 mt-8 space-y-12">
        {/* ── Movies Section ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Film className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Movies</h2>
          </div>

          {isLoadingMovies ? (
            <div className="flex justify-center py-16"><LoadingSpinner /></div>
          ) : movies.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8">No movies found for this brand.</p>
          ) : (
            <>
              <MovieGrid movies={movies} onMovieClick={openMovieModal} />
              {moviePage < movieTotalPages && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={loadMoreMovies}
                    disabled={isLoadingMoreMovies}
                    className="gap-2"
                  >
                    {isLoadingMoreMovies ? (
                      <>Loading…</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> Load More Movies</>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── TV Shows Section ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Tv className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">TV Shows</h2>
          </div>

          {isLoadingTV ? (
            <div className="flex justify-center py-16"><LoadingSpinner /></div>
          ) : tvShows.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8">No TV shows found for this brand.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {tvShows.map((show) => (
                  <MediaCard key={show.id} item={show} onClick={() => openTVModal(show)} />
                ))}
              </div>
              {tvPage < tvTotalPages && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={loadMoreTV}
                    disabled={isLoadingMoreTV}
                    className="gap-2"
                  >
                    {isLoadingMoreTV ? (
                      <>Loading…</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> Load More TV Shows</>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </Layout>
  );
};

export default BrandPage;
