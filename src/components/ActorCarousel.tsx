import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Actor {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
}

interface ActorCarouselProps {
  title: string;
  actors: Actor[];
  loading?: boolean;
}

export const ActorCarousel = ({ title, actors, loading }: ActorCarouselProps) => {
  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">{title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!actors || actors.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {actors.map((actor) => (
              <CarouselItem key={actor.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                <Link to={`/actor/${actor.id}`}>
                  <div className="group cursor-pointer">
                    <div className="aspect-[2/3] overflow-hidden rounded-lg bg-muted mb-2 border border-border/40">
                      <img
                        src={getImageUrl(actor.profile_path, 'w500')}
                        alt={actor.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-semibold text-sm truncate group-hover:text-accent transition-colors">
                      {actor.name}
                    </h3>
                    {actor.known_for_department && (
                      <p className="text-xs text-muted-foreground truncate">
                        {actor.known_for_department}
                      </p>
                    )}
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>
      </div>
    </section>
  );
};
