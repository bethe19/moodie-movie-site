import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, Star } from 'lucide-react';
import { Movie, getImageUrl, formatYear, formatRating } from '@/lib/tmdb';
import { addToWatchlist, isInWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MovieCardProps {
  movie: Movie;
  type?: 'movie' | 'tv';
}

export const MovieCard = ({ movie, type = 'movie' }: MovieCardProps) => {
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist(movie.id));
  const [imageLoaded, setImageLoaded] = useState(false);

  const title = movie.title || movie.name || 'Untitled';
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = formatYear(releaseDate);
  const rating = formatRating(movie.vote_average);
  const posterUrl = getImageUrl(movie.poster_path);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWatchlist) {
      removeFromWatchlist(movie.id);
      setInWatchlist(false);
      toast.success('Removed from watchlist');
    } else {
      const added = addToWatchlist({ ...movie, media_type: type });
      if (added) {
        setInWatchlist(true);
        toast.success('Added to watchlist ✅');
      } else {
        toast.error('Already in watchlist');
      }
    }
  };

  return (
    <Link
      to={`/movie/${movie.id}?type=${type}`}
      className="group block relative rounded-xl overflow-hidden bg-card transition-all duration-300 hover:scale-105 hover:shadow-gold"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20 animate-pulse" />
        )}
        <img
          src={posterUrl}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Watchlist button */}
        <Button
          variant={inWatchlist ? "default" : "secondary"}
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
          onClick={handleWatchlistToggle}
        >
          {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>

        {/* Rating badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs font-semibold">{(movie.vote_average / 10 * 10).toFixed(1)}/10</span>
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">{year}</p>
      </div>
    </Link>
  );
};
