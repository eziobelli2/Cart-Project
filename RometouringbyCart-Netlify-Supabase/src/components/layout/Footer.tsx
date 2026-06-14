import { Link } from "wouter";
import { Instagram, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8 border-t border-secondary-foreground/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight mb-4 inline-block">
              RometouringbyCart
            </Link>
            <p className="text-secondary-foreground/70 mt-4 text-sm max-w-xs">
              Private electric cart tours through the timeless beauty of Rome. A premium local secret for those who want to experience the city deeply.
            </p>
          </div>
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-4 text-sm text-secondary-foreground/70">
              <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><Link href="/tours" className="hover:text-accent transition-colors">Experiences</Link></li>
              <li><Link href="/book" className="hover:text-accent transition-colors">Book a Tour</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-4 text-sm text-secondary-foreground/70">
              <li><Link href="/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-accent transition-colors">Cookie Policy</Link></li>
              <li><Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="/cancellation-policy" className="hover:text-accent transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4 text-sm text-secondary-foreground/70">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <a href="https://wa.me/390000000000" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">WhatsApp Us</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <a href="mailto:hello@rometouringbycart.com" className="hover:text-accent transition-colors">hello@rometouringbycart.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="h-4 w-4" />
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">@rometouringbycart</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/50">
          <p>&copy; {new Date().getFullYear()} RometouringbyCart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
