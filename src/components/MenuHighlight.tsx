import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beef, Coffee, Utensils } from "lucide-react";

export function MenuHighlight() {
  const menuCategories = [
    {
      title: "Burgers",
      description: "Handcrafted patties with premium ingredients and bold flavors",
      icon: Beef,
      image: "https://c.animaapp.com/mfw94os5XM7vEN/img/ai_2.png"
    },
    {
      title: "Sides",
      description: "Crispy fries, onion rings, and fresh salads to complete your meal",
      icon: Utensils,
      image: "https://c.animaapp.com/mfw94os5XM7vEN/img/ai_2.png"
    },
    {
      title: "Drinks",
      description: "Refreshing beverages, milkshakes, and specialty coffee drinks",
      icon: Coffee,
      image: "https://c.animaapp.com/mfw94os5XM7vEN/img/ai_2.png"
    }
  ];

  const scrollToMenu = () => {
    const element = document.getElementById('menu');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-4">
            Our Menu Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully crafted selection of burgers, sides, and drinks made with the finest ingredients
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={index}
                className="group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg bg-card text-card-foreground border border-border"
                onClick={scrollToMenu}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-headline font-semibold text-foreground">
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {category.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
