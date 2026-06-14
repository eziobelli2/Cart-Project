import { Head } from "@/components/Head";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function BookingConfirmation() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Head title="Booking Confirmed | RometouringbyCart" />
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center pt-32 pb-24 px-4">
        <div className="max-w-2xl w-full text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="w-12 h-12 text-primary" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-serif text-foreground mb-6"
          >
            Grazie! Your request is received.
          </motion.h1>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-card border border-border p-8 mb-10 text-left relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
            <h3 className="font-serif text-2xl text-primary mb-4">What happens next?</h3>
            <ol className="space-y-4 text-foreground/80">
              <li className="flex gap-3">
                <span className="font-serif font-bold text-accent">1.</span>
                <span>We are reviewing your request and checking availability for your requested date and time.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-serif font-bold text-accent">2.</span>
                <span>Within 24 hours, you will receive an email from us with a confirmation and a secure payment link.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-serif font-bold text-accent">3.</span>
                <span>Once payment is completed, your booking is fully secured and we'll send you the final details including pickup information.</span>
              </li>
            </ol>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link href="/">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-serif uppercase tracking-widest px-8 py-6 rounded-none">
                Return to Homepage
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
