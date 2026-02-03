import { Movie, getMovieRecommendations, getTrendingMovies, getTVShowRecommendations } from './tmdb';
import { getUserSignals } from './watchHistory';

interface RecommendationResult {
  source: 'content-based' | 'collaborative' | 'trending';
  movie: Movie;
  weight: number;
}

export const getHybridRecommendations = async (): Promise<Movie[]> => {
  try {
    // 1. Fetch User Signals (OTT Strategy)
    const history = await getUserSignals();
    
    // 2. Identify "High Interest" Vectors (Watch Time > 80%)
    // We prioritize movies the user actually finished
    const highInterestItems = history.filter(item => 
      item.media_type === 'movie' && (item.completed || item.progress > 0.8)
    ).slice(0, 3); // Take top 3 most recent finished movies

    let recommendations: RecommendationResult[] = [];
    const seenIds = new Set<number>();
    
    // Add history items to "seen" so we don't recommend what they just watched
    history.forEach(h => seenIds.add(h.id));

    // 3. Content-Based Filtering (Cosine Similarity Proxy)
    if (highInterestItems.length > 0) {
      const promises = highInterestItems.map(async (item) => {
        // We use our smart "Collection + Similar" fetcher from tmdb.ts
        const recs = await getMovieRecommendations(item.id);
        return recs.results?.slice(0, 5) || [];
      });

      const contentBasedResults = await Promise.all(promises);
      
      contentBasedResults.flat().forEach(movie => {
        if (!seenIds.has(movie.id)) {
          seenIds.add(movie.id);
          recommendations.push({
            source: 'content-based',
            movie,
            weight: 0.9 // High weight
          });
        }
      });
    }

    // 4. Collaborative/Trending Fallback
    // If we don't have enough personalized recs, fill with trending
    if (recommendations.length < 10) {
      const trending = await getTrendingMovies();
      trending.results?.forEach(movie => {
        if (!seenIds.has(movie.id)) {
          seenIds.add(movie.id);
          recommendations.push({
            source: 'trending',
            movie,
            weight: 0.5 // Lower weight
          });
        }
      });
    }

    // 5. Ranking & Sorting
    recommendations.sort((a, b) => b.weight - a.weight);

    return recommendations.map(r => r.movie);

  } catch (error) {
    console.error("Hybrid Engine Failure:", error);
    const fallback = await getTrendingMovies();
    return fallback.results || [];
  }
};
