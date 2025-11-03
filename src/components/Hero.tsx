import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Check } from 'lucide-react';
import { Movie, getTrending, getBackdropUrl, truncateText, formatRating } from '@/lib/tmdb';
import { addToWatchlist, isInWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const Hero = () => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  const mediaType = window.location.pathname.includes('/shows') ? 'tv' : 'movie';

  useEffect(() => {
    loadRandomMovie();
    const interval = setInterval(loadRandomMovie, 8000); // Change every 8 seconds
    return () => clearInterval(interval);
  }, [mediaType]);

  useEffect(() => {
    if (movie) {
      setInWatchlist(isInWatchlist(movie.id));
    }
  }, [movie]);

  const loadRandomMovie = async () => {
    try {
      const data = await getTrending(mediaType, 'week');
      if (data.results && data.results.length > 0) {
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
        setMovie({ ...randomMovie, media_type: mediaType });
      }
    } catch (error) {
      console.error('Failed to load hero movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = () => {
    if (!movie) return;

    if (inWatchlist) {
      removeFromWatchlist(movie.id);
      setInWatchlist(false);
      toast.success('Removed from watchlist');
    } else {
      const added = addToWatchlist({ ...movie, media_type: movie.media_type || mediaType });
      if (added) {
        setInWatchlist(true);
        toast.success('Added to watchlist ✅');
      }
    }
  };

  if (loading || !movie) {
    return (
      <section className="relative h-[70vh] min-h-[500px] bg-muted animate-pulse" />
    );
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path, 'original');
  const rating = formatRating(movie.vote_average);

  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden group">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent transition-opacity duration-700" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent transition-opacity duration-700" />

      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-end pb-16 relative z-10">
        <div className="max-w-2xl space-y-6 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-block animate-fade-in">
            <span className="px-3 py-1 bg-accent/20 backdrop-blur-sm border border-accent rounded-full text-accent text-sm font-medium transition-all duration-300 hover:bg-accent/30">
              &gt; Trending {mediaType === 'tv' ? 'TV Shows' : 'Movies'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight transition-all duration-500">
            {movie.title || movie.name}
          </h1>

          {/* Rating & Year */}
          <div className="flex items-center gap-4 text-sm">
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-accent font-semibold">{rating}%</span>
                <span className="text-muted-foreground">Match</span>
              </div>
            )}
            {(movie.release_date || movie.first_air_date) && (
              <span className="text-muted-foreground">
                {new Date(movie.release_date || movie.first_air_date!).getFullYear()}
              </span>
            )}
          </div>

          {/* Overview */}
          <p className="text-lg text-foreground/90 leading-relaxed transition-all duration-500">
            {truncateText(movie.overview, 200)}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link to={`/movie/${movie.id}?type=${movie.media_type || mediaType}`}>
              <Button size="lg" className="gap-2 shadow-gold hover:scale-105 transition-transform duration-200">
                <Play className="h-5 w-5" />
                See More
              </Button>
            </Link>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleWatchlistToggle}
              className="gap-2 hover:scale-105 transition-transform duration-200"
            >
              {inWatchlist ? (
                <>
                  <Check className="h-5 w-5" />
                  In Watchlist
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add to Watchlist
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
