export function About() {
  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-6">
              Our Story
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                BarrasoBurger was born from a simple passion: creating the perfect burger experience. 
                What started as a family dream has grown into a beloved local destination where quality 
                meets flavor in every single bite.
              </p>
              <p>
                We believe in doing things the right way. Our patties are handmade daily from locally 
                sourced beef, our vegetables are fresh and crisp, and our buns are baked to perfection. 
                Every ingredient is carefully selected to ensure that each burger tells a story of 
                craftsmanship and care.
              </p>
              <p>
                More than just a restaurant, BarrasoBurger is a place where families gather, friends 
                reconnect, and memories are made over great food. We're proud to be part of this 
                community and committed to serving you the best burgers you've ever tasted.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-headline font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Fresh Ingredients</div>
              </div>
              <div>
                <div className="text-2xl font-headline font-bold text-primary">Local</div>
                <div className="text-sm text-muted-foreground">Sourced Beef</div>
              </div>
              <div>
                <div className="text-2xl font-headline font-bold text-primary">Family</div>
                <div className="text-sm text-muted-foreground">Owned & Operated</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://c.animaapp.com/mfw94os5XM7vEN/img/ai_3.png"
              alt="chef preparing burger"
              className="w-full h-auto rounded-lg shadow-lg"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
