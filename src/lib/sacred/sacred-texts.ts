// Sacred texts for Cabala dos Caminhos

export interface SacredText {
  id: string;
  title: string;
  source: string;
  passage: string;
  reflection: string;
}

export function getTexts(): SacredText[] {
  return [
    {
      id: "zohar-1",
      title: "O Zohar - Luz nas Trevas",
      source: "Zohar, Bereshit 1:15a",
      passage: "A luz primordial não brilhou até que as letras fossem combinadas pelo desejo do Criador.",
      reflection: "A criação começa com a junção das letras sagradas. Assim como um texto sagrado é construído letra por letra, nossa jornada espiritual se desenvolve através de escolhasseqüenciais que, juntas, formam nossa história."
    },
    {
      id: "sepher-yetsirah-1",
      title: "Sepher Yetzirah - O Livro da Criação",
      source: "Sepher Yetzirah 1:1",
      passage: "Com vinte e duas letras, Ele formou tudo e criou tudo o que foi feito e feito.",
      reflection: "As vinte e duas letras do alfabeto hebraico são a base de toda existência. Cada decisão que tomamos é como uma letra — uma marca no tecido da realidade que molda nosso destino."
    },
    {
      id: "ps-119-1",
      title: "Salmo 119 - As Letras",
      source: "Salmos 119:18",
      passage: "Abre os meus olhos para que eu contemple as coisas maravilhosas da Tua lei.",
      reflection: "A Torah é uma fonte inesgotável de revelação. Cada linha contém camadas de significado esperando serem descobertas pelo estudante dedicado."
    },
    {
      id: "pirkei-avot-1",
      title: "Pirkei Avot - Ética dos Pais",
      source: "Pirkei Avot 3:16",
      passage: "Se não estou para mim, quem está para mim? E se não agora, quando?",
      reflection: "A responsabilidde pessoal é o fundamento da vida espiritual. Cada caminho que trilhamos começa com uma escolha deliberada de agir."
    }
  ];
}