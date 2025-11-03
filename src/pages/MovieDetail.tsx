import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MovieCarousel } from '@/components/MovieCarousel';
import { MovieCard } from '@/components/MovieCard';
import { 
  getMovieDetails, 
  getMovieCredits, 
  getSimilarMovies,
  getImageUrl, 
  getBackdropUrl,
  formatRating,
  Actor,
  MovieDetails as MovieDetailsType
} from '@/lib/tmdb';
import { addToWatchlist, isInWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { Loader2, Calendar, Clock, Star, Plus, Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const MovieDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv';
  
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [cast, setCast] = useState<Actor[]>([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [trailer, setTrailer] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadMovieDetails();
    }
  }, [id, type]);

  useEffect(() => {
    if (movie) {
      setInWatchlist(isInWatchlist(movie.id));
    }
  }, [movie]);

  const loadMovieDetails = async () => {
    setLoading(true);
    try {
      const [details, credits, similarMovies] = await Promise.all([
        getMovieDetails(Number(id), type),
        getMovieCredits(Number(id), type),
        getSimilarMovies(Number(id), type)
      ]);

      setMovie(details);
      setCast(credits.cast?.slice(0, 10) || []);
      setSimilar(similarMovies.results?.slice(0, 12) || []);

      // Try to get trailer
      try {
        const videosResponse = await fetch(
          `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${localStorage.getItem('tmdb_api_key')}`
        );
        const videosData = await videosResponse.json();
        const youtubeTrailer = videosData.results?.find(
          (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
        );
        if (youtubeTrailer) {
          setTrailer(`https://www.youtube.com/watch?v=${youtubeTrailer.key}`);
        }
      } catch (error) {
        console.error('Failed to load trailer:', error);
      }
    } catch (error) {
      console.error('Failed to load movie details:', error);
      toast.error('Failed to load details');
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
      const added = addToWatchlist({ ...movie, media_type: type });
      if (added) {
        setInWatchlist(true);
        toast.success('Added to watchlist ✅');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center min-h-[80vh]">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col justify-center items-center min-h-[80vh]">
          <h1 className="text-3xl font-bold mb-4">Movie Not Found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const title = movie.title || movie.name || 'Unknown';
  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : movie.first_air_date 
    ? new Date(movie.first_air_date).getFullYear() 
    : 'N/A';
  const rating = formatRating(movie.vote_average);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh]">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getBackdropUrl(movie.backdrop_path, 'original')})` }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 pt-24 pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
              <img
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={title}
                className="w-full rounded-xl shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {title}
                </h1>
                {movie.tagline && (
                  <p className="text-lg text-muted-foreground italic">"{movie.tagline}"</p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent" />
                  <span>{releaseYear}</span>
                </div>
                {movie.runtime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent fill-accent" />
                  <span className="font-semibold">{rating}%</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((genre) => (
                  <Badge key={genre.id} variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                    {genre.name}
                  </Badge>
                ))}
              </div>

              {/* Overview */}
              <div>
                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                <p className="text-foreground/90 leading-relaxed">{movie.overview}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {trailer && (
                  <a href={trailer} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="gap-2 shadow-gold">
                      <Play className="h-5 w-5" />
                      Watch Trailer
                    </Button>
                  </a>
                )}
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleWatchlistToggle}
                  className="gap-2"
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
        </div>
      </section>

      {/* Cast Section */}
      {cast.length > 0 && (
        <section className="py-12 bg-background/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {cast.map((actor) => (
                <Link key={actor.id} to={`/actor/${actor.id}`}>
                  <div className="group cursor-pointer">
                    <div className="aspect-[2/3] overflow-hidden rounded-lg bg-muted mb-2">
                      <img
                        src={getImageUrl(actor.profile_path, 'w500')}
                        alt={actor.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-sm truncate">{actor.name}</h3>
                    {actor.character && (
                      <p className="text-xs text-muted-foreground truncate">{actor.character}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Similar Movies */}
      {similar.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <MovieCarousel title="Similar" movies={similar} type={type} />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default MovieDetail;
