import { Head } from "@/components/Head";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useListTours, useSubscribeNewsletter } from "@/lib/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, MapPin, Euro, ArrowRight, Instagram, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const newsletterSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to receive our newsletter",
  }),
});

export function Home() {
  const { data: tours, isLoading } = useListTours();
  const subscribeNewsletter = useSubscribeNewsletter();
  const { toast } = useToast();

  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const newsletterForm = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { name: "", email: "", consent: false },
  });

  const onContactSubmit = (data: z.infer<typeof contactSchema>) => {
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    contactForm.reset();
  };

  const onNewsletterSubmit = (data: z.infer<typeof newsletterSchema>) => {
    subscribeNewsletter.mutate(
      { data: { name: data.name, email: data.email, consent: data.consent } },
      {
        onSuccess: () => {
          toast({
            title: "Subscribed!",
            description: "Thank you for joining our newsletter.",
          });
          newsletterForm.reset();
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Could not subscribe at this time. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Head />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src="/images/hero.png" 
            alt="Roman street warm afternoon light" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 drop-shadow-lg"
          >
            Discover Rome <br />
            <span className="italic text-accent">by Cart</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl font-light mb-10 max-w-2xl mx-auto drop-shadow-md"
          >
            Private electric cart tours through the timeless beauty of Rome.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/book">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-widest text-sm px-8 py-6 rounded-none">
                Book Your Tour
              </Button>
            </Link>
            <Link href="/tours">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-black font-serif uppercase tracking-widest text-sm px-8 py-6 rounded-none backdrop-blur-sm">
                View Experiences
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-sm font-serif uppercase tracking-widest text-primary mb-4">Our Philosophy</h2>
              <h3 className="text-4xl md:text-5xl font-serif text-foreground mb-6 leading-tight">
                Experience Rome at a different pace.
              </h3>
              <p className="text-foreground/80 text-lg mb-6 leading-relaxed">
                Forget the crowded buses and exhausting walking tours. We believe Rome should be savored comfortably, personally, and intimately. 
              </p>
              <p className="text-foreground/80 text-lg mb-8 leading-relaxed">
                Our private electric carts navigate the narrow cobblestone streets where larger vehicles cannot go, bringing you closer to the hidden gems and iconic monuments of the Eternal City. Perfect for couples, families, small groups, and seniors.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-foreground/80">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>100% eco-friendly electric carts</span>
                </li>
                <li className="flex items-center gap-3 text-foreground/80">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>Access to restricted historic zones</span>
                </li>
                <li className="flex items-center gap-3 text-foreground/80">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>Hotel pickup and drop-off</span>
                </li>
                <li className="flex items-center gap-3 text-foreground/80">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>Local, English-speaking drivers</span>
                </li>
              </ul>
              <Link href="/about">
                <Button variant="link" className="text-primary hover:text-primary/80 font-serif uppercase tracking-widest p-0 h-auto flex items-center gap-2">
                  Read our story <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/3]"
            >
              <img 
                src="/images/about.png" 
                alt="Electric cart driver in Rome" 
                className="w-full h-full object-cover shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-accent/20 -z-10" />
              <div className="absolute -top-6 -right-6 w-48 h-48 border border-primary/20 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tours Showcase */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-serif uppercase tracking-widest text-primary mb-4">Curated Itineraries</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Our Experiences</h3>
            <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
              From the iconic monuments to the hidden corners, choose the perfect way to discover Rome.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
            >
              {tours?.map((tour) => (
                <motion.div key={tour.id} variants={fadeIn} className="group relative bg-card overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="aspect-[3/2] overflow-hidden relative">
                    <img 
                      src={tour.imageUrl || `/images/tour-${tour.slug.split('-').slice(0,2).join('-')}.png`} 
                      alt={tour.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1 font-serif text-primary text-sm font-semibold tracking-wider">
                      From €{tour.startingPrice}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-2xl font-serif text-foreground group-hover:text-primary transition-colors">{tour.name}</h4>
                    </div>
                    <p className="text-foreground/70 mb-6 line-clamp-2">
                      {tour.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-8 border-t border-border pt-6">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{tour.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Up to {tour.maxGuests || 6} guests</span>
                      </div>
                    </div>
                    <Link href={`/book?tour=${tour.slug}`}>
                      <Button className="w-full bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-serif uppercase tracking-widest rounded-none transition-colors duration-300 py-6">
                        Book Experience
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <div className="mt-16 text-center">
            <Link href="/tours">
              <Button variant="link" className="text-primary hover:text-primary/80 font-serif uppercase tracking-widest text-lg flex items-center gap-2 mx-auto">
                View all details <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Booking CTA Section */}
      <section className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">Ready to explore Rome?</h2>
          <p className="text-xl text-secondary-foreground/80 mb-10 max-w-2xl mx-auto font-light">
            Book your private cart tour today and discover the city in unmatched comfort and style.
          </p>
          <Link href="/book">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-serif uppercase tracking-widest px-10 py-7 rounded-none text-base">
              Reserve Your Date
            </Button>
          </Link>
        </div>
      </section>

      {/* Newsletter & Contact */}
      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Newsletter */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-background p-10 md:p-12 border border-border shadow-sm"
            >
              <h3 className="text-3xl font-serif text-foreground mb-4">Join our community</h3>
              <p className="text-foreground/70 mb-8">
                Subscribe for travel inspiration, Roman secrets, and exclusive offers straight to your inbox.
              </p>
              
              <Form {...newsletterForm}>
                <form onSubmit={newsletterForm.handleSubmit(onNewsletterSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={newsletterForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Your name" className="bg-transparent border-b-2 border-x-0 border-t-0 border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={newsletterForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Email address" type="email" className="bg-transparent border-b-2 border-x-0 border-t-0 border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={newsletterForm.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1 border-primary text-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal text-foreground/70 cursor-pointer">
                            I consent to receive emails and agree to the privacy policy.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={subscribeNewsletter.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-widest rounded-none py-6">
                    {subscribeNewsletter.isPending ? "Subscribing..." : "Subscribe"}
                  </Button>
                </form>
              </Form>
            </motion.div>

            {/* Contact Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-sm font-serif uppercase tracking-widest text-primary mb-4">Get in touch</h2>
              <h3 className="text-4xl font-serif text-foreground mb-8">We'd love to hear from you</h3>
              
              <div className="space-y-8">
                <a href="https://wa.me/390000000000" className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-card border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors rounded-full shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg text-foreground mb-1">WhatsApp Us</h4>
                    <p className="text-foreground/70 group-hover:text-primary transition-colors">+39 000 000 0000</p>
                  </div>
                </a>
                
                <a href="mailto:hello@rometouringbycart.com" className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-card border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors rounded-full shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg text-foreground mb-1">Email Us</h4>
                    <p className="text-foreground/70 group-hover:text-primary transition-colors">hello@rometouringbycart.com</p>
                  </div>
                </a>
                
                <a href="https://instagram.com" className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-card border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors rounded-full shrink-0">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg text-foreground mb-1">Follow Us</h4>
                    <p className="text-foreground/70 group-hover:text-primary transition-colors">@rometouringbycart</p>
                  </div>
                </a>
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
