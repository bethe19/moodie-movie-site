import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { MovieCarousel } from '@/components/MovieCarousel';
import { ActorCarousel } from '@/components/ActorCarousel';
import { getPopular, getTrending, getNowPlaying, getUpcoming, getPopularActors, getApiKey, setApiKey } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const Index = () => {
  const [searchParams] = useSearchParams();
  const type = (searchParams.get('type') as 'movie' | 'tv') || 'movie';

  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [popularActors, setPopularActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [apiKey, setApiKeyInput] = useState('');

  useEffect(() => {
    const savedKey = getApiKey();
    if (!savedKey) {
      setShowApiDialog(true);
    } else {
      loadMovies();
    }
  }, [type]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    setApiKey(apiKey);
    setShowApiDialog(false);
    toast.success('API key saved successfully!');
    loadMovies();
  };

  const loadMovies = async () => {
    setLoading(true);
    try {
      const [popular, trending, nowPlaying, upcoming, actors] = await Promise.all([
        getPopular(type),
        getTrending(type, 'week'),
        type === 'movie' ? getNowPlaying() : getPopular('tv'),
        type === 'movie' ? getUpcoming() : getTrending('tv', 'week'),
        getPopularActors(),
      ]);

      setPopularMovies(popular.results || []);
      setTrendingMovies(trending.results || []);
      setNowPlayingMovies(nowPlaying.results || []);
      setUpcomingMovies(upcoming.results || []);
      setPopularActors(actors.results || []);
    } catch (error) {
      console.error('Failed to load movies:', error);
      toast.error('Failed to load content. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="pt-16 flex-1">
        <Hero />

        <div className="space-y-4">
          <MovieCarousel
            title="Trending This Week"
            movies={trendingMovies}
            type={type}
            loading={loading}
          />

          <MovieCarousel
            title={type === 'movie' ? 'Now Playing' : 'Popular TV Shows'}
            movies={nowPlayingMovies}
            type={type}
            loading={loading}
          />

          <MovieCarousel
            title={type === 'movie' ? 'Popular Movies' : 'Top Rated TV Shows'}
            movies={popularMovies}
            type={type}
            loading={loading}
          />

          <ActorCarousel
            title="Popular Actors"
            actors={popularActors}
            loading={loading}
          />

          <MovieCarousel
            title={type === 'movie' ? 'Upcoming' : 'Trending TV Shows'}
            movies={upcomingMovies}
            type={type}
            loading={loading}
          />
        </div>
      </main>

      <Footer />

      {/* API Key Dialog */}
      <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-accent">Welcome to Moodie!</DialogTitle>
            <DialogDescription className="text-base pt-2">
              To get started, you'll need a TMDB API key. Get yours for free at{' '}
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline hover:text-accent/80"
              >
                themoviedb.org
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Enter your TMDB API key"
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full"
            />
            <Button onClick={handleSaveApiKey} className="w-full">
              Save & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
