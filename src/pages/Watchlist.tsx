import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MovieCard } from '@/components/MovieCard';
import { getWatchlist, WatchlistItem } from '@/lib/watchlist';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    loadWatchlist();
    
    // Listen for watchlist changes
    const handleStorage = () => loadWatchlist();
    window.addEventListener('storage', handleStorage);
    
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loadWatchlist = () => {
    setWatchlist(getWatchlist());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">My Watchlist</h1>
            {watchlist.length > 0 && (
              <p className="text-muted-foreground">
                {watchlist.length} {watchlist.length === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>

          {watchlist.length === 0 ? (
            <div className="text-center py-20">
              <div className="mb-4 text-6xl">🎬</div>
              <h2 className="text-2xl font-semibold mb-2">Your watchlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add movies and TV shows to your watchlist to watch them later
              </p>
              <Button asChild>
                <a href="/">Discover Movies</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {watchlist.map((item) => (
                <MovieCard
                  key={item.id}
                  movie={item}
                  type={item.media_type || 'movie'}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Watchlist;
