import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Navbar = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('light', savedTheme === 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-accent hover:text-accent/80 transition-colors">
            Moodie
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            <li>
              <Link
                to="/?type=movie"
                className={`font-medium transition-colors ${
                  isActive('/') ? 'text-accent' : 'text-foreground hover:text-accent'
                }`}
              >
                Movies
              </Link>
            </li>
            <li>
              <Link
                to="/?type=tv"
                className={`font-medium transition-colors ${
                  isActive('/?type=tv') ? 'text-accent' : 'text-foreground hover:text-accent'
                }`}
              >
                Shows
              </Link>
            </li>
            <li>
              <Link
                to="/watchlist"
                className={`font-medium transition-colors ${
                  isActive('/watchlist') ? 'text-accent' : 'text-foreground hover:text-accent'
                }`}
              >
                Watchlist
              </Link>
            </li>
            <li>
              <Link
                to="/mood"
                className={`font-medium transition-colors ${
                  isActive('/mood') ? 'text-accent' : 'text-foreground hover:text-accent'
                }`}
              >
                Mood
              </Link>
            </li>
          </ul>

          {/* Search & Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pr-10 bg-input border-border focus:border-accent"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </Button>
            </form>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-accent hover:text-accent/80"
            >
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4">
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-input border-border"
              />
            </form>
            
            <ul className="space-y-2">
              <li>
                <Link
                  to="/?type=movie"
                  className="block py-2 text-foreground hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Movies
                </Link>
              </li>
              <li>
                <Link
                  to="/?type=tv"
                  className="block py-2 text-foreground hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shows
                </Link>
              </li>
              <li>
                <Link
                  to="/watchlist"
                  className="block py-2 text-foreground hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Watchlist
                </Link>
              </li>
              <li>
                <Link
                  to="/mood"
                  className="block py-2 text-foreground hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mood
                </Link>
              </li>
              <li className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="w-full justify-start gap-2"
                >
                  {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};
