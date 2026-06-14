import { Head } from "@/components/Head";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListTours } from "@/lib/api-client-react";
import { Clock, Users, MapPin, Check } from "lucide-react";
import { motion } from "framer-motion";

export function Tours() {
  const { data: tours, isLoading } = useListTours();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Head title="Experiences | RometouringbyCart" />
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-16 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-serif text-foreground mb-6"
          >
            Curated Experiences
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto font-light"
          >
            Choose from our carefully designed itineraries or let us craft a custom journey just for you. All tours include hotel pickup in central Rome.
          </motion.p>
        </div>
      </section>

      {/* Tours List */}
      <section className="py-20 flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-16">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[500px] bg-card animate-pulse rounded-none" />
              ))}
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-24"
            >
              {tours?.map((tour, index) => (
                <motion.div 
                  key={tour.id} 
                  variants={fadeIn}
                  className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 lg:gap-16 items-stretch`}
                >
                  <div className="w-full lg:w-1/2 aspect-[4/3] lg:aspect-auto overflow-hidden relative">
                    <img 
                      src={tour.imageUrl || `/images/tour-${tour.slug.split('-').slice(0,2).join('-')}.png`} 
                      alt={tour.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
                  </div>
                  
                  <div className="w-full lg:w-1/2 flex flex-col justify-center py-6">
                    <div className="flex items-center gap-3 text-sm font-serif uppercase tracking-widest text-primary mb-4">
                      <span>{tour.category}</span>
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      <span>From €{tour.startingPrice}</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">
                      {tour.name}
                    </h2>
                    
                    <p className="text-foreground/80 text-lg leading-relaxed mb-8">
                      {tour.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8 text-foreground/70">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <span>{tour.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <span>Up to {tour.maxGuests || 6} guests</span>
                      </div>
                    </div>

                    {tour.highlights && tour.highlights.length > 0 && (
                      <div className="mb-10">
                        <h3 className="font-serif text-lg mb-4">Highlights</h3>
                        <ul className="space-y-2">
                          {tour.highlights.map((highlight, i) => (
                            <li key={i} className="flex items-start gap-3 text-foreground/80">
                              <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-auto pt-6 border-t border-border">
                      <Link href={`/book?tour=${tour.slug}`}>
                        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-widest px-10 py-6 rounded-none">
                          Book This Tour
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="bg-primary text-primary-foreground py-16 text-center px-4">
        <h3 className="text-2xl md:text-3xl font-serif mb-4">Not finding exactly what you want?</h3>
        <p className="mb-8 font-light max-w-xl mx-auto opacity-90">
          We offer fully customized itineraries based on your interests. Let us know what you want to see.
        </p>
        <Link href="/book?tour=custom-private-tour">
          <Button variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary font-serif uppercase tracking-widest rounded-none">
            Request Custom Tour
          </Button>
        </Link>
      </section>

      <Footer />
    </div>
  );
}
