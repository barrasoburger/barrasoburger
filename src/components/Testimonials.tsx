import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      text: "The best burger I've ever had! The patty was perfectly cooked and the ingredients were so fresh. BarrasoBurger has become our family's favorite spot.",
      avatar: "https://c.animaapp.com/mfw94os5XM7vEN/img/ai_4.png"
    },
    {
      name: "Mike Rodriguez",
      text: "Amazing quality and flavor. You can really taste the difference when ingredients are sourced locally. The BBQ Bacon Burger is incredible!",
      avatar: "https://c.animaapp.com/mfw94os5XM7vEN/img/ai_4.png"
    },
    {
      name: "Emily Chen",
      text: "Not only are the burgers fantastic, but the service is outstanding. The staff clearly cares about what they do, and it shows in every meal.",
      avatar: "https://c.animaapp.com/mfw94os5XM7vEN/img/ai_4.png"
    },
    {
      name: "David Thompson",
      text: "I've been coming here for months and the quality never disappoints. The Classic BarrasoBurger is perfection on a bun!",
      avatar: "https://c.animaapp.com/mfw94os5XM7vEN/img/ai_4.png"
    },
    {
      name: "Lisa Martinez",
      text: "Finally, a burger place that gets it right! Fresh ingredients, perfect cooking, and a cozy atmosphere. Highly recommend!",
      avatar: "https://c.animaapp.com/mfw94os5XM7vEN/img/ai_4.png"
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-muted/30">
      <div className="container mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from the people who make BarrasoBurger special
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="bg-card text-card-foreground border border-border">
                    <CardContent className="p-8 text-center">
                      <div className="mb-6">
                        <img
                          src={testimonial.avatar}
                          alt={`${testimonial.name} testimonial`}
                          className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                          loading="lazy"
                        />
                        <h3 className="text-lg font-headline font-semibold text-foreground">
                          {testimonial.name}
                        </h3>
                      </div>
                      <blockquote className="text-lg text-muted-foreground leading-relaxed italic">
                        "{testimonial.text}"
                      </blockquote>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
