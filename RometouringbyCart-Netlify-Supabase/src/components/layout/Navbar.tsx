import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed w-full z-50 bg-background/90 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3">
  <img
    src="/images/cartlogo_small.png"
    alt="RometouringbyCart"
    className="h-12 w-auto"
  />
  <span className="font-serif text-2xl font-bold tracking-tight text-primary">
    Rome touring by Cart
  </span>
</Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors text-sm uppercase tracking-wider">
              Home
            </Link>
            <Link href="/tours" className="text-foreground hover:text-primary transition-colors text-sm uppercase tracking-wider">
              Experiences
            </Link>
            <Link href="/book">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-widest text-xs px-6 py-5 rounded-none">
                Book a Tour
              </Button>
            </Link>
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="text-foreground hover:text-primary focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link href="/" onClick={toggleMenu} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
              Home
            </Link>
            <Link href="/tours" onClick={toggleMenu} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
              Experiences
            </Link>
            <div className="px-3 pt-2">
              <Link href="/book" onClick={toggleMenu}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-widest text-xs py-5 rounded-none">
                  Book a Tour
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
