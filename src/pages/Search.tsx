import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MovieCard } from '@/components/MovieCard';
import { getImageUrl } from '@/lib/tmdb';
import { Loader2, Film, Tv, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SearchCategory = 'movie' | 'tv' | 'person';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = (searchParams.get('category') || 'movie') as SearchCategory;
  
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchCategory>(initialCategory);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, initialCategory);
    }
  }, []);

  const performSearch = async (searchQuery: string, searchCategory: SearchCategory) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const apiKey = 'c9155694f84e14b22ad2119ee91077cc';
      const endpoint = searchCategory === 'person' 
        ? `/search/person`
        : `/search/${searchCategory}`;
      
      const response = await fetch(
        `https://api.themoviedb.org/3${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&language=en-US`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout for live search
    const timeout = setTimeout(() => {
      if (value.trim()) {
        performSearch(value, category);
        setSearchParams({ q: value, category });
      } else {
        setResults([]);
      }
    }, 500);

    setTypingTimeout(timeout);
  };

  const handleCategoryChange = (newCategory: SearchCategory) => {
    setCategory(newCategory);
    if (query.trim()) {
      performSearch(query, newCategory);
      setSearchParams({ q: query, category: newCategory });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="max-w-4xl mx-auto mb-8 space-y-6">
            <h1 className="text-3xl font-bold">Search</h1>
            
            {/* Live Search Input */}
            <Input
              type="text"
              placeholder={`Search for ${category === 'person' ? 'actors' : category === 'tv' ? 'TV shows' : 'movies'}...`}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="h-12 text-lg"
            />

            {/* Category Tabs */}
            <Tabs value={category} onValueChange={(v) => handleCategoryChange(v as SearchCategory)}>
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                <TabsTrigger value="movie" className="gap-2">
                  <Film className="h-4 w-4" />
                  Movies
                </TabsTrigger>
                <TabsTrigger value="tv" className="gap-2">
                  <Tv className="h-4 w-4" />
                  TV Shows
                </TabsTrigger>
                <TabsTrigger value="person" className="gap-2">
                  <User className="h-4 w-4" />
                  Actors
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Results Count */}
            {query && !loading && (
              <p className="text-muted-foreground text-center">
                Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          )}

          {/* Empty State */}
          {!loading && query && results.length === 0 && (
            <div className="text-center py-20">
              <div className="mb-4 text-6xl">🔍</div>
              <h2 className="text-2xl font-semibold mb-2">No results found</h2>
              <p className="text-muted-foreground">
                Try searching with different keywords
              </p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && results.length > 0 && (
            <>
              {category === 'person' ? (
                // Actor Results
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.map((person: any) => (
                    <Link key={person.id} to={`/actor/${person.id}`}>
                      <div className="group cursor-pointer">
                        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-muted mb-2 border border-border/40">
                          <img
                            src={getImageUrl(person.profile_path, 'w500')}
                            alt={person.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="font-semibold text-sm truncate">{person.name}</h3>
                        {person.known_for_department && (
                          <p className="text-xs text-muted-foreground truncate">
                            {person.known_for_department}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                // Movie/TV Results
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.map((item: any) => (
                    <MovieCard
                      key={item.id}
                      movie={item}
                      type={category}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Initial State */}
          {!query && !loading && (
            <div className="text-center py-20">
              <div className="mb-4 text-6xl">🎬</div>
              <h2 className="text-2xl font-semibold mb-2">Start Searching</h2>
              <p className="text-muted-foreground">
                Enter a keyword to search for {category === 'person' ? 'actors' : category === 'tv' ? 'TV shows' : 'movies'}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
