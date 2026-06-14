import { Head } from "@/components/Head";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useListTours, useCreateBooking } from "@/lib/api-client-react";
import { Link, useLocation, useSearch } from "wouter";
import { useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number is required"),
  tourSlug: z.string().min(1, "Please select a tour"),
  tourDate: z.date({
    required_error: "Please select a date",
  }),
  tourTime: z.string().min(1, "Please select a time"),
  guests: z.coerce.number().min(1, "At least 1 guest required").max(8, "Maximum 8 guests"),
  pickupLocation: z.string().optional(),
  notes: z.string().optional(),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy",
  }),
});

export function Book() {
  const [_, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const selectedTourSlug = searchParams.get("tour");

  const { data: tours, isLoading: toursLoading } = useListTours();
  const createBooking = useCreateBooking();

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      tourSlug: selectedTourSlug || "",
      tourTime: "10:00",
      guests: 2,
      pickupLocation: "",
      notes: "",
      privacyConsent: false,
    },
  });

  // Update default tour if it changes in URL
  useEffect(() => {
    if (selectedTourSlug) {
      form.setValue("tourSlug", selectedTourSlug);
    }
  }, [selectedTourSlug, form]);

  const onSubmit = (data: z.infer<typeof bookingSchema>) => {
    createBooking.mutate({
      data: {
        ...data,
        tourDate: format(data.tourDate, "yyyy-MM-dd"),
      }
    }, {
      onSuccess: () => {
        setLocation("/booking-confirmation");
      }
    });
  };

  const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Head title="Book a Tour | RometouringbyCart" />
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Book Your Experience</h1>
            <p className="text-foreground/70 text-lg">
              Fill out the form below to reserve your private cart tour in Rome. We will confirm your booking shortly.
            </p>
          </div>

          <div className="bg-card border border-border shadow-sm p-8 md:p-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="space-y-6">
                  <h3 className="font-serif text-2xl text-primary border-b border-border pb-2">Tour Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="tourSlug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs tracking-wider font-serif">Select Tour</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-none border-border focus:ring-primary h-12">
                                <SelectValue placeholder={toursLoading ? "Loading tours..." : "Select a tour"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-none border-border">
                              {tours?.map((tour) => (
                                <SelectItem key={tour.id} value={tour.slug} className="cursor-pointer">
                                  {tour.name} - from €{tour.startingPrice}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs tracking-wider font-serif">Number of Guests</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={8} className="rounded-none border-border focus-visible:ring-primary h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tourDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col pt-1">
                          <FormLabel className="uppercase text-xs tracking-wider font-serif mb-1">Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full h-12 rounded-none border-border justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-none border-border" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tourTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs tracking-wider font-serif">Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-none border-border focus:ring-primary h-12">
                                <SelectValue placeholder="Select a time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-none border-border">
                              {times.map((time) => (
                                <SelectItem key={time} value={time} className="cursor-pointer">
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <h3 className="font-serif text-2xl text-primary border-b border-border pb-2">Your Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="uppercase text-xs tracking-wider font-serif">Full Name</FormLabel>
                          <FormControl>
                            <Input className="rounded-none border-border focus-visible:ring-primary h-12" placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs tracking-wider font-serif">Email</FormLabel>
                          <FormControl>
                            <Input type="email" className="rounded-none border-border focus-visible:ring-primary h-12" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs tracking-wider font-serif">Phone / WhatsApp</FormLabel>
                          <FormControl>
                            <Input type="tel" className="rounded-none border-border focus-visible:ring-primary h-12" placeholder="+1 234 567 8900" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pickupLocation"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="uppercase text-xs tracking-wider font-serif">Pickup Location / Hotel (Optional)</FormLabel>
                          <FormControl>
                            <Input className="rounded-none border-border focus-visible:ring-primary h-12" placeholder="Hotel Hassler Roma" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="uppercase text-xs tracking-wider font-serif">Special Requests / Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="rounded-none border-border focus-visible:ring-primary min-h-[100px] resize-y" 
                              placeholder="Any dietary restrictions, mobility needs, or special interests?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <FormField
                    control={form.control}
                    name="privacyConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 bg-muted/30 border border-border">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5 border-primary text-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal text-foreground/80 cursor-pointer">
                            I agree to the <Link href="/privacy-policy" className="text-primary underline hover:text-primary/80">Privacy Policy</Link> and consent to my data being stored to process this booking.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={createBooking.isPending} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-widest text-lg h-16 rounded-none mt-8"
                >
                  {createBooking.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                    </span>
                  ) : (
                    "Submit Booking Request"
                  )}
                </Button>
                
                <p className="text-center text-sm text-foreground/50 mt-4">
                  No payment is required right now. We will review your request and send a secure payment link upon confirmation.
                </p>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
