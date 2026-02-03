import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import MovieGrid from '@/components/MovieGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useMedia } from '@/contexts/MediaContext';
import { 
  Movie, getActionMovies, getAdventureMovies, getComedyMovies, getDramaMovies, getHorrorMovies, 
  getSciFiMovies, getThrillerMovies, getFantasyMovies, getRomanceMovies, getCrimeMovies, getWesternMovies, getWarMovies 
} from '@/lib/tmdb';

const Genre = () => {
  const { id } = useParams<{ id: string }>();
  const { openMovieModal } = useMedia();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');

  const fetchGenreData = async (genreId: string) => {
    switch (genreId) {
      case 'action': setTitle('Action Movies'); return getActionMovies();
      case 'adventure': setTitle('Adventure Movies'); return getAdventureMovies();
      case 'comedy': setTitle('Comedy Movies'); return getComedyMovies();
      case 'drama': setTitle('Drama Movies'); return getDramaMovies();
      case 'horror': setTitle('Horror Movies'); return getHorrorMovies();
      case 'scifi': setTitle('Sci-Fi & Fantasy'); return getSciFiMovies();
      case 'fantasy': setTitle('Fantasy'); return getFantasyMovies();
      case 'thriller': setTitle('Thrillers'); return getThrillerMovies();
      case 'romance': setTitle('Romance'); return getRomanceMovies();
      case 'crime': setTitle('Crime Movies'); return getCrimeMovies();
      case 'western': setTitle('Westerns'); return getWesternMovies();
      case 'war': setTitle('War Movies'); return getWarMovies();
      default: setTitle('Movies'); return { results: [] };
    }
  };

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    window.scrollTo(0, 0);
    fetchGenreData(id).then((data) => setMovies(data.results || [])).finally(() => setIsLoading(false));
  }, [id]);

  return (
    <Layout>
      <main className="pt-24 px-5 md:px-16 pb-16 min-h-screen">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">Browse our collection of {title.toLowerCase()}.</p>
        </div>
        {isLoading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : movies.length > 0 ? 
          <div className="animate-fade-in"><MovieGrid movies={movies} onMovieClick={openMovieModal} /></div> : 
          <div className="text-center py-20 text-muted-foreground">No movies found.</div>
        }
      </main>
    </Layout>
  );
};
export default Genre;
