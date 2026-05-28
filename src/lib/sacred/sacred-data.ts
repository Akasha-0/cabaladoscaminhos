// @ts-nocheck
// eslint-disable

export function getData() {
  return {
    name: "Sacred",
    description: "Sacred data for the Cabala dos Caminhos application",
    version: "1.0.0",
    domains: [
      {
        id: "texts",
        name: "Sacred Texts",
        description: "Ancient wisdom from sacred traditions",
        elements: ["wisdom", "revelation"],
        archetype: "The Scribe",
        symbols: ["📜", "✡️", "📖"],
        color: "#D4AF37"
      },
      {
        id: "ritual",
        name: "Sacred Rituals",
        description: "Ceremonies and practices for spiritual connection",
        elements: ["fire", "water"],
        archetype: "The Priest",
        symbols: ["🕯️", "⚱️", "🔮"],
        color: "#8B4513"
      },
      {
        id: "prayer",
        name: "Sacred Prayer",
        description: "Communion with the divine through prayer",
        elements: ["air", "spirit"],
        archetype: "The Devotee",
        symbols: ["🙏", "✝️", "☪️"],
        color: "#4169E1"
      },
      {
        id: "meditation",
        name: "Sacred Meditation",
        description: "Contemplative practices for inner peace",
        elements: ["ether", "silence"],
        archetype: "The Monk",
        symbols: ["🧘", "☯️", "🕉️"],
        color: "#9370DB"
      }
    ]
  };
}
