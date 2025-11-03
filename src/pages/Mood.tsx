import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smile, Heart, Zap, Cloud, Frown, Flame, Ghost, Music, Star, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { discoverMovies, searchKeyword, searchPerson, getPersonCredits } from '@/lib/tmdb';
import { toast } from 'sonner';

// Stop words to filter out from mood input
const STOP_WORDS = new Set([
  "i", "me", "my", "myself", "feel", "am", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "but", "and", "or", "a", "an", "the", "in", "on",
  "at", "for", "to", "so", "very", "today", "really", "just", "feeling", "like", "want", "need"
]);

// Mood synonyms for better detection
const MOOD_SYNONYMS: Record<string, string[]> = {
  happy: ['happy', 'joyful', 'excited', 'delighted', 'cheerful', 'upbeat', 'elated', 'thrilled'],
  sad: ['sad', 'hopeless', 'depressed', 'down', 'miserable', 'melancholic', 'heartbroken', 'despairing', 'cry'],
  angry: ['angry', 'furious', 'enraged', 'frustrated', 'mad', 'irritated', 'outraged', 'resentful'],
  fearful: ['scared', 'afraid', 'anxious', 'terrified', 'nervous', 'paranoid', 'uneasy', 'horrified', 'scary', 'fear'],
  romantic: ['romantic', 'in love', 'affectionate', 'passionate', 'lovestruck', 'flirty', 'sentimental', 'love'],
  motivated: ['motivated', 'inspired', 'determined', 'ambitious', 'empowered', 'driven', 'energetic'],
  relaxed: ['relaxed', 'calm', 'peaceful', 'chill', 'serene', 'mellow', 'laid-back', 'tranquil'],
  adventurous: ['adventurous', 'exploratory', 'daring', 'bold', 'thrill-seeking', 'wandering', 'adventure', 'explore'],
  nostalgic: ['nostalgic', 'reminiscent', 'wistful', 'longing', 'retro', 'throwback'],
  surprised: ['surprised', 'shocked', 'astonished', 'amazed', 'bewildered', 'stunned'],
  disgusted: ['disgusted', 'repulsed', 'grossed out', 'appalled', 'nauseated'],
};

// Expanded mood to genre mapping (comma-separated genre IDs)
const MOOD_TO_GENRES: Record<string, string> = {
  happy: '35,12,10751,10402',
  sad: '18,36,10752,99',
  angry: '28,53,80,37',
  fearful: '27,9648,878,14',
  romantic: '10749,18,35',
  motivated: '99,18,12,28',
  relaxed: '10751,16,99,10402',
  adventurous: '12,878,14,37',
  nostalgic: '36,10751,35,16',
  surprised: '9648,53,878',
  disgusted: '27,80,99',
};

// Mood-specific parameters for better recommendations
const MOOD_PARAMS: Record<string, Record<string, string>> = {
  happy: { 'sort_by': 'popularity.desc', 'vote_average.gte': '7.5' },
  sad: { 'sort_by': 'vote_average.desc', 'primary_release_date.gte': getPastDate(20 * 365) },
  angry: { 'sort_by': 'popularity.desc' },
  fearful: { 'sort_by': 'vote_average.desc', 'primary_release_date.gte': getPastDate(5 * 365) },
  romantic: { 'sort_by': 'vote_average.desc' },
  motivated: { 'sort_by': 'vote_average.desc', 'vote_count.gte': '500' },
  relaxed: { 'sort_by': 'vote_average.desc' },
  adventurous: { 'sort_by': 'popularity.desc', 'primary_release_date.gte': getPastDate(15 * 365) },
  nostalgic: { 'sort_by': 'vote_average.desc', 'primary_release_date.lte': '2000-01-01' },
  surprised: { 'sort_by': 'vote_average.desc' },
  disgusted: { 'sort_by': 'vote_average.desc' },
};

// Helper to get past date
function getPastDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// Detect mood from user input
function detectMood(userInput: string): string | null {
  const input = userInput.toLowerCase();
  for (const [baseMood, synonyms] of Object.entries(MOOD_SYNONYMS)) {
    for (const synonym of synonyms) {
      if (input.includes(synonym)) {
        return baseMood;
      }
    }
  }
  return null;
}

// Get random synonym for variety
function getSynonymForKeyword(mood: string): string {
  const synonyms = MOOD_SYNONYMS[mood] || [mood];
  return synonyms[Math.floor(Math.random() * synonyms.length)];
}

// Shuffle array for variety
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const moodPresets = [
  { mood: 'happy', label: 'Feel Happy', icon: Smile, color: 'from-yellow-400 to-orange-400' },
  { mood: 'romantic', label: 'Feel Romantic', icon: Heart, color: 'from-pink-400 to-red-400' },
  { mood: 'adventurous', label: 'Feel Adventurous', icon: Zap, color: 'from-blue-400 to-purple-400' },
  { mood: 'sad', label: 'Feel Sad', icon: Frown, color: 'from-gray-400 to-blue-400' },
  { mood: 'angry', label: 'Feel Angry', icon: Flame, color: 'from-orange-400 to-red-400' },
  { mood: 'fearful', label: 'Feel Fearful', icon: Ghost, color: 'from-purple-400 to-gray-400' },
  { mood: 'motivated', label: 'Feel Motivated', icon: Star, color: 'from-green-400 to-blue-400' },
  { mood: 'relaxed', label: 'Feel Relaxed', icon: Cloud, color: 'from-cyan-400 to-blue-400' },
  { mood: 'nostalgic', label: 'Feel Nostalgic', icon: Music, color: 'from-amber-400 to-orange-400' },
  { mood: 'surprised', label: 'Feel Surprised', icon: Sparkles, color: 'from-violet-400 to-pink-400' },
];

const Mood = () => {
  const [moodInput, setMoodInput] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleMoodSearch = async (mood: string, moodLabel: string) => {
    setSelectedMood(moodLabel);
    setLoading(true);
    
    try {
      const genres = MOOD_TO_GENRES[mood] || '18,10749';
      
      // Get keyword ID for enhanced matching
      const keywordTerm = getSynonymForKeyword(mood);
      let keywordId: number | null = null;
      
      try {
        const keywordData = await searchKeyword(keywordTerm);
        if (keywordData.results && keywordData.results.length > 0) {
          keywordId = keywordData.results[0].id;
        }
      } catch (e) {
        // Fallback to search with mood if keyword search fails
        try {
          const keywordData = await searchKeyword(mood);
          if (keywordData.results && keywordData.results.length > 0) {
            keywordId = keywordData.results[0].id;
          }
        } catch (err) {
          console.log('Keyword search unavailable, using genres only');
        }
      }

      // Build params
      const params: Record<string, string> = {
        'vote_count.gte': '100',
        'with_genres': genres,
      };

      // Apply mood-specific parameters
      if (MOOD_PARAMS[mood]) {
        Object.assign(params, MOOD_PARAMS[mood]);
      }

      // Add keyword if found
      if (keywordId) {
        params['with_keywords'] = keywordId.toString();
      }

      const data = await discoverMovies(params);
      let movieResults = data.results || [];
      
      // Shuffle for variety
      movieResults = shuffleArray(movieResults);
      
      setMovies(movieResults);
      toast.success(`Found ${movieResults.length} movies for ${moodLabel} mood!`);
    } catch (error) {
      console.error('Failed to load movies:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomMood = async (page = 1) => {
    if (!moodInput.trim()) {
      toast.error('Please describe your mood');
      return;
    }
    
    setLoading(true);
    setCurrentPage(page);
    
    try {
      // Extract meaningful words from mood input
      const words = moodInput
        .toLowerCase()
        .split(/[\s,]+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));

      if (words.length === 0) {
        toast.error('Please use more descriptive words');
        setLoading(false);
        return;
      }

      const keywordMap = new Map<string, number>();
      let actorId: number | null = null;
      let actorName: string | null = null;

      // Search for keywords and actors
      for (const word of words) {
        try {
          // Try keyword search first
          const kwData = await searchKeyword(word);
          if (kwData.results?.length) {
            keywordMap.set(word, kwData.results[0].id);
            continue;
          }

          // Try person search
          const personData = await searchPerson(word);
          if (personData.results?.length) {
            actorId = personData.results[0].id;
            actorName = personData.results[0].name;
          }
        } catch (err) {
          console.error(`Error searching for ${word}:`, err);
        }
      }

      if (keywordMap.size === 0 && !actorId) {
        toast.error('No matches found for your mood or actors');
        setMovies([]);
        setLoading(false);
        return;
      }

      const contentMap = new Map<string, any>();
      let maxPages = 1;

      // Fetch movies and TV shows for each keyword
      for (const [word, keywordId] of keywordMap) {
        try {
          // Fetch movies
          const movieParams: Record<string, string> = {
            'with_keywords': keywordId.toString(),
            'sort_by': 'popularity.desc',
            'page': page.toString(),
          };
          const movieData = await discoverMovies(movieParams);
          maxPages = Math.max(maxPages, Math.min(movieData.total_pages || 1, 1000));
          
          for (const item of (movieData.results || []).slice(0, 10)) {
            const id = `movie-${item.id}`;
            if (!contentMap.has(id)) {
              contentMap.set(id, { 
                ...item, 
                media_type: 'movie', 
                matchCount: 1, 
                matchedWords: new Set([word]) 
              });
            } else {
              const existing = contentMap.get(id);
              existing.matchCount++;
              existing.matchedWords.add(word);
            }
          }

          // Fetch TV shows
          const tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=c9155694f84e14b22ad2119ee91077cc&with_keywords=${keywordId}&sort_by=popularity.desc&page=${page}&language=en-US`;
          const tvRes = await fetch(tvUrl);
          const tvData = await tvRes.json();
          maxPages = Math.max(maxPages, Math.min(tvData.total_pages || 1, 1000));
          
          for (const item of (tvData.results || []).slice(0, 10)) {
            const id = `tv-${item.id}`;
            if (!contentMap.has(id)) {
              contentMap.set(id, { 
                ...item, 
                media_type: 'tv', 
                matchCount: 1, 
                matchedWords: new Set([word]) 
              });
            } else {
              const existing = contentMap.get(id);
              existing.matchCount++;
              existing.matchedWords.add(word);
            }
          }
        } catch (err) {
          console.error(`Error fetching content for keyword ${word}:`, err);
        }
      }

      // Fetch actor's credits if found
      if (actorId && actorName) {
        try {
          const creditsData = await getPersonCredits(actorId);
          for (const item of (creditsData.cast || []).slice(0, 10)) {
            const id = `${item.media_type}-${item.id}`;
            if (!contentMap.has(id)) {
              contentMap.set(id, { 
                ...item, 
                media_type: item.media_type, 
                matchCount: 1, 
                matchedWords: new Set([actorName]) 
              });
            } else {
              const existing = contentMap.get(id);
              existing.matchCount++;
              existing.matchedWords.add(actorName);
            }
          }
        } catch (err) {
          console.error(`Error fetching credits for actor ${actorName}:`, err);
        }
      }

      // Sort by match count (highest first)
      const finalList = Array.from(contentMap.values());
      finalList.sort((a, b) => b.matchCount - a.matchCount);

      setMovies(finalList.slice(0, 20));
      setTotalPages(maxPages);
      setSelectedMood(moodInput);
      
      if (finalList.length > 0) {
        toast.success(`Found ${finalList.length} matches for "${moodInput}"!`);
      } else {
        toast.error('No matches found for your mood');
      }
    } catch (error) {
      console.error('Failed to load movies:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">How are you feeling?</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Tell us your mood and we'll recommend the perfect movies for you
            </p>

            {/* Custom Mood Input */}
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="text"
                placeholder="I feel sad today..."
                value={moodInput}
                onChange={(e) => setMoodInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomMood(1)}
                className="flex-1"
              />
              <Button onClick={() => handleCustomMood(1)} className="gap-2">
                <Smile className="h-4 w-4" />
                Find Movies
              </Button>
            </div>
          </div>

          {/* Mood Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-12">
            {moodPresets.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedMood === preset.label;
              
              return (
                <button
                  key={preset.mood}
                  onClick={() => handleMoodSearch(preset.mood, preset.label)}
                  className={`
                    relative p-4 rounded-xl transition-all duration-300 overflow-hidden group
                    backdrop-blur-sm border-2
                    ${isSelected 
                      ? 'border-accent shadow-lg shadow-accent/20 scale-105' 
                      : 'border-border/40 hover:border-accent/50 hover:scale-105 hover:shadow-md hover:shadow-accent/10'
                    }
                  `}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${preset.color} transition-all duration-300 ${isSelected ? 'opacity-25' : 'opacity-10 group-hover:opacity-20'}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg bg-background/60 backdrop-blur-sm transition-all duration-300 ${isSelected ? 'shadow-sm' : 'group-hover:shadow-sm'}`}>
                      <Icon className={`h-5 w-5 transition-all duration-300 ${isSelected ? 'text-accent' : 'text-foreground/80 group-hover:text-accent'}`} />
                    </div>
                    <span className={`font-semibold text-xs text-center transition-all duration-300 ${isSelected ? 'text-accent' : 'text-foreground group-hover:text-accent'}`}>
                      {preset.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Results */}
          {selectedMood && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Best Matches for "{selectedMood}"
                </h2>
                {totalPages > 1 && !loading && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentPage > 1) handleCustomMood(currentPage - 1);
                      }}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentPage < totalPages) handleCustomMood(currentPage + 1);
                      }}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : movies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No movies found for this mood</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movies.map((movie: any) => (
                    <MovieCard 
                      key={`${movie.media_type}-${movie.id}`} 
                      movie={movie} 
                      type={movie.media_type || 'movie'} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Mood;
