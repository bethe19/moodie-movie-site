import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MovieCard } from '@/components/MovieCard';
import { getImageUrl } from '@/lib/tmdb';
import { Loader2, Cake, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ActorDetails {
  id: number;
  name: string;
  profile_path: string | null;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
  popularity: number;
}

interface Credit {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  character?: string;
  overview: string;
  genre_ids: number[];
}

const ActorDetail = () => {
  const { id } = useParams();
  const [actor, setActor] = useState<ActorDetails | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadActorDetails();
    }
  }, [id]);

  const loadActorDetails = async () => {
    setLoading(true);
    try {
      const apiKey = 'c9155694f84e14b22ad2119ee91077cc';
      
      const [detailsRes, creditsRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/person/${id}?api_key=${apiKey}&language=en-US`),
        fetch(`https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${apiKey}&language=en-US`)
      ]);

      const detailsData = await detailsRes.json();
      const creditsData = await creditsRes.json();

      setActor(detailsData);
      
      // Sort by popularity and get top 20
      const sortedCredits = (creditsData.cast || [])
        .sort((a: any, b: any) => b.vote_average - a.vote_average)
        .slice(0, 20);
      
      setCredits(sortedCredits);
    } catch (error) {
      console.error('Failed to load actor details:', error);
      toast.error('Failed to load actor details');
    } finally {
      setLoading(false);
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

  if (!actor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col justify-center items-center min-h-[80vh]">
          <h1 className="text-3xl font-bold mb-4">Actor Not Found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Image */}
            <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
              <img
                src={getImageUrl(actor.profile_path, 'w500')}
                alt={actor.name}
                className="w-full rounded-xl shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {actor.name}
                </h1>
                <p className="text-lg text-accent font-semibold">{actor.known_for_department}</p>
              </div>

              {/* Meta Info */}
              <div className="space-y-3 text-sm">
                {actor.birthday && (
                  <div className="flex items-center gap-2">
                    <Cake className="h-4 w-4 text-accent" />
                    <span>
                      {new Date(actor.birthday).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {actor.place_of_birth && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span>{actor.place_of_birth}</span>
                  </div>
                )}
              </div>

              {/* Biography */}
              {actor.biography && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Biography</h2>
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                    {actor.biography}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Known For Section */}
      {credits.length > 0 && (
        <section className="py-12 bg-background/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Known For</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {credits.map((credit) => (
                <MovieCard
                  key={`${credit.media_type}-${credit.id}`}
                  movie={credit}
                  type={credit.media_type}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ActorDetail;
