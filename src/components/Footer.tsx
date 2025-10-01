import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-headline font-bold text-white mb-4">
              BarrasoBurger
            </h3>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Handmade burgers with flavor that lasts. We're committed to serving you 
              the finest quality burgers made with fresh, locally sourced ingredients.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-headline font-semibold text-white mb-4">
              Quick Links
            </h4>
            <nav className="space-y-2">
              <button
                onClick={() => scrollToSection('hero')}
                className="block text-gray-300 hover:text-white transition-colors text-left"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('menu')}
                className="block text-gray-300 hover:text-white transition-colors text-left"
              >
                Menu
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="block text-gray-300 hover:text-white transition-colors text-left"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block text-gray-300 hover:text-white transition-colors text-left"
              >
                Contact
              </button>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-headline font-semibold text-white mb-4">
              Contact Info
            </h4>
            <div className="space-y-2 text-gray-300">
              <p>123 Burger Street</p>
              <p>Downtown District</p>
              <p>City, State 12345</p>
              <a 
                href="tel:+1234567890" 
                className="block text-gray-300 hover:text-white transition-colors"
              >
                (123) 456-7890
              </a>
              <a 
                href="mailto:hello@barrasoburger.com" 
                className="block text-gray-300 hover:text-white transition-colors"
              >
                hello@barrasoburger.com
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 BarrasoBurger. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
