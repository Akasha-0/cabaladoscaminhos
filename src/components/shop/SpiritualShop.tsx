"use client";

import { useState } from "react";
import { ShoppingBag, Star, Zap, Heart, Crown, Sparkles, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  category: string;
  icon: React.ReactNode;
  featured?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

const PRODUCTS: Product[] = [
  {
    id: "cosmic-reading",
    name: "Leitura Cósmica Profunda",
    description: "Análise astrológica completa do seu mapa natal com orientações espirituais",
    price: 29.90,
    credits: 300,
    category: " Leituras",
    icon: <Star className="w-6 h-6" />,
    featured: true,
  },
  {
    id: "tarot-session",
    name: "Sessão de Tarô Ilimitada",
    description: "Tiragens ilimitadas de tarô com interpretações personalizadas",
    price: 19.90,
    credits: 200,
    category: "Tarô",
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: "manifestacao",
    name: "Kit de Manifestação",
    description: "Rituais, afirmações e técnicas de manifestação personalizadas",
    price: 49.90,
    credits: 500,
    category: "Rituais",
    icon: <Zap className="w-6 h-6" />,
    featured: true,
  },
  {
    id: "orixas",
    name: "Consulta aos Orixás",
    description: "Direcionamento espiritual através do sistema de Ifá",
    price: 39.90,
    credits: 400,
    category: "Ifá",
    icon: <Crown className="w-6 h-6" />,
  },
  {
    id: "numerologia",
    name: "Mapa Numerológico",
    description: "Análise completa da sua numerologia pessoal",
    price: 24.90,
    credits: 250,
    category: "Numerologia",
    icon: <Heart className="w-6 h-6" />,
  },
  {
    id: "meditacao",
    name: "Meditações Guiadas Premium",
    description: "Acesso a todas as meditações guiadas com frequências espirituais",
    price: 14.90,
    credits: 150,
    category: "Meditação",
    icon: <Sparkles className="w-6 h-6" />,
  },
];

export default function SpiritualShop() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(PRODUCTS.map((p) => p.category)));

  const filteredProducts = selectedCategory
    ? PRODUCTS.filter((p) => p.category === selectedCategory)
    : PRODUCTS;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  const removeItemCompletely = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCredits = cart.reduce((sum, item) => sum + item.credits * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Espaço Espiritual</h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full">
            <ShoppingBag className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">{cartCount}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            Todos
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-purple-500/50 transition-colors"
            >
              {product.featured && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1">
                  <p className="text-xs font-medium text-white text-center">Destaque</p>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    {product.icon}
                  </div>
                  <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                    {product.category}
                  </Badge>
                </div>
                <CardTitle className="text-white text-lg mt-2">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">R$ {product.price.toFixed(2)}</p>
                    <p className="text-sm text-purple-400">{product.credits} créditos</p>
                  </div>
                  <Button
                    onClick={() => addToCart(product)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-white font-medium">{cartCount} item(s) no carrinho</p>
                    <p className="text-purple-400">
                      Total: R$ {cartTotal.toFixed(2)} • {cartCredits} créditos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-1 px-2 py-1">
                        <span className="text-white text-sm">{item.quantity}x</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItemCompletely(item.id)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Finalizar Compra
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
