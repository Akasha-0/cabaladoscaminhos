// Olokun — Orixá das Águas Profundas, Riqueza e Mistérios do Oceano

export interface OlokunData {
  nome: string;
  elemento: string;
  dia: string;
  cores: string[];
  simbolos: string[];
  ofertas: string[];
  saude: string[];
  caracteristicas: string[];
  qualidade: string;
  vibração: string;
  planeta: string;
  pedra: string;
  planta: string;
  animal: string;
  frases: string[];
  ebós: string[];
  tabus: string[];
  historia: string;
  meditacao: string;
}

export function getData(): OlokunData {
  return {
    nome: "Olokun",
    elemento: "Água",
    dia: "Segunda-feira",
    cores: ["Azul Marinho", "Azul Escuro", "Prata", "Branco"],
    simbolos: ["Mar", "Jóias", "Conchas", " Âncoras", "Espelhos d'água"],
    ofertas: ["Água do mar", "Perfume de florais", "Maios", "Pão", "Frutos do mar", "Duas velas azuis"],
    saude: [
      "Doenças藏 internadas e profundas",
      "Problemas emocionais ocultos",
      "Dores articulares",
      "Questőes hormonais",
      "Problemas de fertilidade",
      "Desiquilibrios nervosos",
    ],
    caracteristicas: [
      "Poderoso",
      "Guardador de tesouros",
      "Profundo",
      "Misterioso",
      "Transformador",
      "Nutridor",
      "Curador das águas internas",
    ],
    qualidade: "Aquele que tudo vê nas profundezas",
    vibração: "Calma, poderosa, restauradora",
    planeta: "Netuno",
    pedra: "Água-marinha, Turquesa",
    planta: "Alga marinha, Jurema",
    animal: "Baleia, Cavalo-marinho",
    frases: [
      "Nas profundezas está a verdade.",
      "O mar guarda todos os segredos.",
      "Riqueza vem das águas.",
      "Quem mergulha, encontra.",
    ],
    ebós: [
      "1 porção de farinha de mandioca",
      "1 coco ralado",
      "2 velas azuis",
      "1 prato branco com água do mar",
      "Flores brancas",
      "1 espejo pequeño",
    ],
    tabus: [
      "Não comer frutos do mar em excesso",
      "Não mentir para as águas",
      "Não ignorar sinais de perigo",
      "Não guardar rancor profundo",
    ],
    historia:
      "Olokun é o orixá das profundezas marinhas, guardião de tesouros ocultos e das emoções mais profundas do ser humano. " +
      "É associado à riqueza, prosperidade, fertilidade e aos mistérios do inconsciente. " +
      "Dizem que Olokun habita as partes mais profundas do oceano, onde a luz do sol não chega. " +
      "É considerado tanto masculino quanto feminino em algumas tradições, e é frequentemente invoked " +
      "para cura de doenças profundas, problemas emocionais e para abrir caminhos de prosperidade. " +
      "Olokun é também o protetor dos navegadores e daqueles que buscam tesouros escondidos, " +
      "sejam eles materiais ou espirituais. Na tradiçāo iorubá, Olokun enviou seu filho Olokun-Meji " +
      "ao mundo para ensinar os seres humanos a arte da medicina e da cura.",
    meditacao:
      "Sente-se em silêncio. Imagine-se às margens de um oceano vasto e profundo. " +
      "Sinta a água limpando suas emoçōes mais profundas, levando embora tudo o que não serve mais. " +
      "Peça a Olokun que revele os tesouros ocultos em sua vida — aqueles que estão esperando " +
      "nas profundezas do seu ser para serem descobertos. Respira profundamente enquanto a água " +
      "sabecea seu corpo, trazendo cura, paz e abundância.",
  };
}
