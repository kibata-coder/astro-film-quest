import { Movie, getMovieRecommendations, getTrendingMovies } from './tmdb';
import { getUserSignals } from './watchHistory';

interface RecommendationResult {
  source: 'content-based' | 'collaborative' | 'trending';
  movie: Movie;
  weight: number;
}

export const getHybridRecommendations = async (): Promise<Movie[]> => {
  try {
    const history = await getUserSignals();
    const highInterestItems = history.filter(item => 
      item.media_type === 'movie' && (item.completed || item.progress > 0.8)
    ).slice(0, 3);

    let recommendations: RecommendationResult[] = [];
    const seenIds = new Set<number>();
    history.forEach(h => seenIds.add(h.id));

    if (highInterestItems.length > 0) {
      const promises = highInterestItems.map(async (item) => {
        const recs = await getMovieRecommendations(item.id);
        return recs.results?.slice(0, 5) || [];
      });
      const contentBasedResults = await Promise.all(promises);
      contentBasedResults.flat().forEach(movie => {
        if (!seenIds.has(movie.id)) {
          seenIds.add(movie.id);
          recommendations.push({ source: 'content-based', movie, weight: 0.9 });
        }
      });
    }

    if (recommendations.length < 10) {
      const trending = await getTrendingMovies();
      trending.results?.forEach(movie => {
        if (!seenIds.has(movie.id)) {
          seenIds.add(movie.id);
          recommendations.push({ source: 'trending', movie, weight: 0.5 });
        }
      });
    }

    recommendations.sort((a, b) => b.weight - a.weight);
    return recommendations.map(r => r.movie);
  } catch (error) {
    console.error("Hybrid Engine Failure:", error);
    const fallback = await getTrendingMovies();
    return fallback.results || [];
  }
};
