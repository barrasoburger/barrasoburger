import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Menu() {
  const menuItems = [
    {
      name: "Classic BarrasoBurger",
      description: "Our signature beef patty with lettuce, tomato, onion, and special sauce",
      price: "$12.99",
      category: "Burgers"
    },
    {
      name: "BBQ Bacon Burger",
      description: "Smoky BBQ sauce, crispy bacon, cheddar cheese, and onion rings",
      price: "$15.99",
      category: "Burgers"
    },
    {
      name: "Mushroom Swiss",
      description: "Sautéed mushrooms, Swiss cheese, and garlic aioli",
      price: "$14.99",
      category: "Burgers"
    },
    {
      name: "Spicy Jalapeño",
      description: "Jalapeños, pepper jack cheese, chipotle mayo, and avocado",
      price: "$14.99",
      category: "Burgers"
    },
    {
      name: "Crispy Fries",
      description: "Golden hand-cut fries seasoned to perfection",
      price: "$4.99",
      category: "Sides"
    },
    {
      name: "Onion Rings",
      description: "Beer-battered onion rings with ranch dipping sauce",
      price: "$5.99",
      category: "Sides"
    },
    {
      name: "Classic Milkshake",
      description: "Vanilla, chocolate, or strawberry - made with real ice cream",
      price: "$5.99",
      category: "Drinks"
    },
    {
      name: "Fresh Lemonade",
      description: "House-made lemonade with fresh squeezed lemons",
      price: "$3.99",
      category: "Drinks"
    }
  ];

  const comboDeals = [
    {
      name: "Classic Combo",
      description: "Any burger + fries + drink",
      price: "$16.99",
      savings: "Save $3"
    },
    {
      name: "Deluxe Combo",
      description: "Premium burger + onion rings + milkshake",
      price: "$21.99",
      savings: "Save $4"
    }
  ];

  return (
    <section id="menu" className="py-24 bg-background">
      <div className="container mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-4">
            Our Menu
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every item on our menu is crafted with care using the finest ingredients
          </p>
        </div>

        {/* Combo Deals */}
        <div className="mb-16">
          <h3 className="text-2xl font-headline font-semibold text-foreground mb-8 text-center">
            Combo Deals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {comboDeals.map((combo, index) => (
              <Card key={index} className="bg-gradient-1 text-white border-0">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-headline font-semibold text-white">
                        {combo.name}
                      </CardTitle>
                      <CardDescription className="text-white/90 mt-2">
                        {combo.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{combo.price}</div>
                      <div className="text-sm text-tertiary font-medium">{combo.savings}</div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Regular Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <Card key={index} className="bg-card text-card-foreground border border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-headline font-semibold text-foreground">
                      {item.name}
                    </CardTitle>
                    <div className="text-sm text-tertiary font-medium mt-1">
                      {item.category}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-primary ml-4">
                    {item.price}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
