// Watchlist management with localStorage
import { Movie } from './tmdb';

const WATCHLIST_KEY = 'moodie_watchlist';

export interface WatchlistItem extends Movie {
  addedAt: number;
}

export const getWatchlist = (): WatchlistItem[] => {
  try {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addToWatchlist = (movie: Movie): boolean => {
  try {
    const watchlist = getWatchlist();
    
    // Check if already in watchlist
    if (watchlist.some(item => item.id === movie.id)) {
      return false;
    }

    const item: WatchlistItem = {
      ...movie,
      addedAt: Date.now(),
    };

    watchlist.unshift(item);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    return true;
  } catch {
    return false;
  }
};

export const removeFromWatchlist = (id: number): boolean => {
  try {
    const watchlist = getWatchlist();
    const filtered = watchlist.filter(item => item.id !== id);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
};

export const isInWatchlist = (id: number): boolean => {
  const watchlist = getWatchlist();
  return watchlist.some(item => item.id === id);
};

export const clearWatchlist = () => {
  localStorage.removeItem(WATCHLIST_KEY);
};
