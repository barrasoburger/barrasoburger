import { Button } from "@/components/ui/button";

export function Hero() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://c.animaapp.com/mfw94os5XM7vEN/img/ai_1.png')`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold text-white mb-6 leading-tight">
            BarrasoBurger — Handmade Burgers with Flavor that Lasts
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the perfect blend of fresh ingredients, handcrafted patties, and bold flavors that make every bite unforgettable.
          </p>
          <Button 
            onClick={scrollToContact}
            className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground text-lg px-8 py-6 rounded-lg transition-all duration-200"
          >
            Order Now
          </Button>
        </div>
      </div>
    </section>
  );
}
