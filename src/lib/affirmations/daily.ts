const affirmations = [
  "Você é digno de amor e respeito, exatamente como é.",
  "Cada dia traz novas oportunidades para crescer e brilhar.",
  "Sua presença faz diferença na vida daqueles ao seu redor.",
  "Você tem a força necessária para superar qualquer desafio.",
  "Seus pensamentos criativos têm o poder de transformar o mundo.",
  "A jornada é parte importante do destino.",
  "Você merece paz, felicidade e realizações.",
  "Suas ações diárias constroem o futuro que você deseja.",
  "Você é capaz de alcançar seus objetivos mais elevados.",
  "A gratidão transforma o que temos em suficiente.",
  "Você possui sabedoria única para compartilhar.",
  "Cada respiração é uma nova chance de recomeçar.",
  "Você irradia luz e esperança para os outros.",
  "Sua determinação é inspiradora e poderosa.",
  "O universo conspira a seu favor quando você acredita.",
  "Você é suficiente, você é capaz, você é amado.",
  "Grandes conquistas começam com o primeiro passo.",
  "Você carrega em si a força de mil Sóis.",
  "Seu coração sabe o caminho, confie nele.",
  "Hoje é um presente, aproveite cada momento.",
  "Você nasceu para fazer diferença neste mundo.",
  "A coragem não é ausência do medo, mas ação apesar dele.",
  "Você ilumina a escuridão com sua presença.",
  "Cada obstáculo é uma oportunidade disfarçada.",
  "Você tem o poder de criar a vida que deseja.",
  "A energia que você emite retorna para você triplicada.",
  "Você é merecedor de todas as bênçãos que virão.",
  "Seus sonhos são válidos e alcançáveis.",
  "A paz começa dentro de você.",
  "Você é uma expressão única e perfeita da vida.",
  "O sucesso vem para quem persiste com coração verdadeiro.",
];

export function getDailyAffirmation(): string {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % affirmations.length;
  return affirmations[index];
}
