// TMDB API Configuration and helper functions
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const ENV_API_KEY = (import.meta as any).env?.VITE_TMDB_API_KEY as string | undefined;

// API key will be provided by user
export const getApiKey = () => {
  return localStorage.getItem('tmdb_api_key') || ENV_API_KEY || '';
};

export const setApiKey = (key: string) => {
  localStorage.setItem('tmdb_api_key', key);
};

// Image URL helpers
export const getImageUrl = (path: string | null, size: 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') => {
  if (!path) return 'https://via.placeholder.com/1280x720?text=No+Image';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

// API call helper
const fetchFromTMDB = async (endpoint: string, params: Record<string, string> = {}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('TMDB API key not set');
  }

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    ...params,
  });

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${queryParams}`);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
};

// Movie & TV Show interfaces
export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: 'movie' | 'tv';
}

export interface MovieDetails extends Movie {
  runtime?: number;
  genres: Array<{ id: number; name: string }>;
  status: string;
  tagline: string;
}

export interface Actor {
  id: number;
  name: string;
  profile_path: string | null;
  character?: string;
  known_for_department: string;
  popularity: number;
}

// API functions
export const getTopRated = async (type: 'movie' | 'tv' = 'movie', page: number = 1) => {
  return fetchFromTMDB(`/${type}/top_rated`, { page: page.toString() });
};

export const getPopular = async (type: 'movie' | 'tv' = 'movie', page: number = 1) => {
  return fetchFromTMDB(`/${type}/popular`, { page: page.toString() });
};

export const getTrending = async (type: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week') => {
  return fetchFromTMDB(`/trending/${type}/${timeWindow}`);
};

export const getNowPlaying = async () => {
  return fetchFromTMDB('/movie/now_playing');
};

export const getUpcoming = async () => {
  return fetchFromTMDB('/movie/upcoming');
};

export const searchMovies = async (query: string, page: number = 1) => {
  return fetchFromTMDB('/search/multi', { query, page: page.toString() });
};

export const getMovieDetails = async (id: number, type: 'movie' | 'tv' = 'movie') => {
  return fetchFromTMDB(`/${type}/${id}`);
};

export const getMovieCredits = async (id: number, type: 'movie' | 'tv' = 'movie') => {
  return fetchFromTMDB(`/${type}/${id}/credits`);
};

export const getSimilarMovies = async (id: number, type: 'movie' | 'tv' = 'movie') => {
  return fetchFromTMDB(`/${type}/${id}/similar`);
};

export const getPopularActors = async (page: number = 1) => {
  return fetchFromTMDB('/person/popular', { page: page.toString() });
};

export const getGenres = async (type: 'movie' | 'tv' = 'movie') => {
  return fetchFromTMDB(`/genre/${type}/list`);
};

export const discoverByGenre = async (genreId: number, type: 'movie' | 'tv' = 'movie') => {
  return fetchFromTMDB(`/discover/${type}`, { with_genres: genreId.toString() });
};

export const discoverMovies = async (params: Record<string, string>) => {
  return fetchFromTMDB('/discover/movie', params);
};

export const searchKeyword = async (query: string) => {
  return fetchFromTMDB('/search/keyword', { query });
};

export const searchPerson = async (query: string) => {
  return fetchFromTMDB('/search/person', { query });
};

export const getPersonCredits = async (personId: number) => {
  return fetchFromTMDB(`/person/${personId}/combined_credits`);
};

export const getActorDetails = async (id: number) => {
  return fetchFromTMDB(`/person/${id}`);
};

// Utility functions
export const truncateText = (text: string, maxLength: number = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, text.lastIndexOf(' ', maxLength)) + '...';
};

export const formatYear = (date: string | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).getFullYear().toString();
};

export const formatRating = (rating: number) => {
  return (rating * 10).toFixed(0);
};
