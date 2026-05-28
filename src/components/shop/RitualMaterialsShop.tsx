"use client";

import { useState } from "react";
import {
  Gem,
  Leaf,
  Flame,
  Wind,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface RitualMaterial {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  featured?: boolean;
}

interface CartItem extends RitualMaterial {
  quantity: number;
}

const MATERIALS: RitualMaterial[] = [
  {
    id: "amethyst-cluster",
    name: "Ametista em Cluster",
    description: "Cluster de ametista para purificação energética e meditação profunda",
    price: 89.90,
    category: "Cristais",
    inStock: true,
    featured: true,
  },
  {
    id: "selenite-wand",
    name: "Varinha de Selenita",
    description: "Varinha de selenita para limpeza de campos áuricos e harmonização",
    price: 65.00,
    category: "Cristais",
    inStock: true,
  },
  {
    id: "obsidian-mirror",
    name: "Espelho de Obsidiana",
    description: "Espelho ritual de obsidiana para proteção e autoconhecimento",
    price: 120.00,
    category: "Cristais",
    inStock: true,
  },
  {
    id: "white-sage",
    name: "Salvia Branca",
    description: "Feixe de salvia branca para defumação e purificação de ambientes",
    price: 35.00,
    category: "Ervas",
    inStock: true,
    featured: true,
  },
  {
    id: "lavender-bundle",
    name: "Feixe de Lavanda",
    description: "Lavanda seca para banhos de ervas e aromaterapia espiritual",
    price: 25.00,
    category: "Ervas",
    inStock: true,
  },
  {
    id: "mugwort",
    name: "Artemísia",
    description: "Artemísia para sonhos lúcidos e rituais de divinação",
    price: 30.00,
    category: "Ervas",
    inStock: true,
  },
  {
    id: "black-candle",
    name: "Vela Negra",
    description: "Vela ritual negra para proteção e banimento",
    price: 15.00,
    category: "Velas",
    inStock: true,
  },
  {
    id: "white-candle",
    name: "Vela Branca",
    description: "Vela ritual branca para purificação e paz",
    price: 12.00,
    category: "Velas",
    inStock: true,
    featured: true,
  },
  {
    id: "seven-color-candle",
    name: "Vela das Cores",
    description: "Kit com 7 velas coloridas para trabalhos específicos",
    price: 55.00,
    category: "Velas",
    inStock: true,
  },
  {
    id: "frankincense-incense",
    name: "Incenso de Olibano",
    description: "Resina de olibano para elevação espiritual",
    price: 45.00,
    category: "Incensos",
    inStock: true,
  },
  {
    id: "sandalwood-incense",
    name: "Incenso de Sândalo",
    description: "Sândalo para proteção e meditação",
    price: 40.00,
    category: "Incensos",
    inStock: true,
  },
  {
    id: "copal-incense",
    name: "Incenso de Copal",
    description: "Copal para limpeza energética e conexão com ancestrais",
    price: 38.00,
    category: "Incensos",
    inStock: false,
  },
  {
    id: "pentacle-altar",
    name: "Pentáculo de Altar",
    description: "Pentáculo ritual em madeira para altar",
    price: 150.00,
    category: "Ferramentas",
    inStock: true,
    featured: true,
  },
  {
    id: "athame-knife",
    name: "Adaga Ritual",
    description: "Adaga ceremonial para direcionamento de energia",
    price: 180.00,
    category: "Ferramentas",
    inStock: true,
  },
  {
    id: "chalice",
    name: "Cálice Cerimonial",
    description: "Cálice para oferendas e喝了 sagradas",
    price: 95.00,
    category: "Ferramentas",
    inStock: true,
  },
  {
    id: "pendulum",
    name: "Pêndulo de Cristal",
    description: "Pêndulo para radiestesia e respostas intuitivas",
    price: 55.00,
    category: "Ferramentas",
    inStock: true,
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Cristais: <Gem className="w-4 h-4" />,
  Ervas: <Leaf className="w-4 h-4" />,
  Velas: <Flame className="w-4 h-4" />,
  Incensos: <Wind className="w-4 h-4" />,
  Ferramentas: <Sparkles className="w-4 h-4" />,
};

export default function RitualMaterialsShop() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["Todos", ...Array.from(new Set(MATERIALS.map((m) => m.category)))];

  const filteredMaterials = selectedCategory && selectedCategory !== "Todos"
    ? MATERIALS.filter((m) => m.category === selectedCategory)
    : MATERIALS;

  const addToCart = (material: RitualMaterial) => {
    if (!material.inStock) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === material.id);
      if (existing) {
        return prev.map((item) =>
          item.id === material.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...material, quantity: 1 }];
    });
  };

  const removeFromCart = (materialId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === materialId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === materialId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== materialId);
    });
  };

  const removeItemCompletely = (materialId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== materialId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <ShoppingBag className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-amber-100">
              Materiais Rituais
            </h1>
            <p className="text-amber-200/60 text-sm">
              Cristais, ervas, velas e ferramentas para suas práticas espirituais
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Category Filter */}
            <Card className="bg-stone-900/50 border-stone-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-200">
                    Filtrar por categoria
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category || (category === "Todos" && !selectedCategory) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category === "Todos" ? null : category)}
                      className={
                        selectedCategory === category || (category === "Todos" && !selectedCategory)
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "border-stone-600 text-stone-300 hover:bg-stone-800"
                      }
                    >
                      {category !== "Todos" && CATEGORY_ICONS[category]}
                      {category !== "Todos" && <span className="ml-1">{category}</span>}
                      {category === "Todos" && category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMaterials.map((material) => {
                const inCart = cart.find((item) => item.id === material.id);
                return (
                  <Card
                    key={material.id}
                    className={`bg-stone-900/50 border-stone-700/50 transition-all ${
                      !material.inStock ? "opacity-60" : "hover:border-amber-500/50"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-amber-500/20 rounded-lg">
                            {CATEGORY_ICONS[material.category]}
                          </div>
                          <Badge
                            variant="outline"
                            className="border-stone-600 text-stone-400 text-xs"
                          >
                            {material.category}
                          </Badge>
                        </div>
                        {material.featured && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                            Destaque
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg text-stone-100 mt-2">
                        {material.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-stone-400">
                        {material.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-amber-400">
                            R$ {material.price.toFixed(2)}
                          </span>
                          {!material.inStock && (
                            <span className="text-xs text-red-400">Esgotado</span>
                          )}
                        </div>
                        {material.inStock ? (
                          <div className="flex items-center gap-2">
                            {inCart && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 border-stone-600"
                                  onClick={() => removeFromCart(material.id)}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="text-stone-200 font-medium w-6 text-center">
                                  {inCart.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 border-stone-600"
                                  onClick={() => addToCart(material)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {!inCart && (
                              <Button
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                                onClick={() => addToCart(material)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            className="border-stone-600 text-stone-500"
                          >
                            Esgotado
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-stone-900/80 border-stone-700/50 sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-stone-100">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  Carrinho
                  {cartCount > 0 && (
                    <Badge className="ml-auto bg-amber-500 text-white">
                      {cartCount}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                    <p className="text-stone-500 text-sm">
                      Seu carrinho está vazio
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-2 bg-stone-800/50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-200 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-stone-400">
                              {item.quantity}x R$ {item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-stone-400 hover:text-red-400"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-xs text-stone-300 w-4 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-stone-400 hover:text-amber-400"
                              onClick={() => addToCart(item)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-stone-400 hover:text-red-400"
                              onClick={() => removeItemCompletely(item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="bg-stone-700" />
                    <div className="space-y-2">
                      <div className="flex justify-between text-stone-300">
                        <span>Subtotal</span>
                        <span className="font-semibold">
                          R$ {cartTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-amber-400">
                        <span className="text-sm">Total</span>
                        <span className="font-bold text-lg">
                          R$ {cartTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white mt-4">
                      Finalizar Compra
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
