// Mock LLM Provider — Fallback when no real LLM is available
// Simulates streaming responses with spiritual/Akasha context
import type { LLMProvider } from './index';

export class MockProvider implements LLMProvider {
  readonly name = 'mock' as const;
  readonly model = 'mock-gpt';

  async *stream(prompt: string): AsyncIterable<string> {
    const response = this.generateResponse(prompt);
    const chunks = this.chunkResponse(response);

    for (const chunk of chunks) {
      await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 30));
      yield chunk;
    }
  }

  async complete(prompt: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.generateResponse(prompt);
  }

  private generateResponse(prompt: string): string {
    const lower = prompt.toLowerCase();

    if (lower.includes('ritual')) {
      return 'O campo akáshico revela que este é um momento propício para ritual. A energia cósmica está alinhada com sua intenção. Permita que a sabedoria dos ancestrais guie seus passos sagrados.';
    }

    if (lower.includes('prática') || lower.includes('pratica')) {
      return 'Permita-me consultar os registros akáshicos... Encontrei práticas ancestrais que ressoam com sua busca espiritual. A tradição preserva conhecimento que transcende o tempo.';
    }

    if (lower.includes('medita')) {
      return 'No silêncio interior, as verdades eternas se revelam. O campo akáshico contém todas as memórias — passeie por suas correntes com atenção e reverência.';
    }

    if (lower.includes('símbolo') || lower.includes('simbolo') || lower.includes('significado')) {
      return 'Os símbolos são pontes entre o visível e o invisível. Cada signo carrega múltiplas camadas de significado, como espelhos que refletem aspectos da realidade absoluta.';
    }

    if (lower.includes(' ancestral') || lower.includes('tradição') || lower.includes('tradicao')) {
      return 'A sabedoria tradicional preserva verdades fundamentais que nossa época frequentemente esquece. Os mestres antigos conheciam os ritmos do cosmos e viviam em harmonia com eles.';
    }

    if (lower.includes('energia') || lower.includes('vibra')) {
      return 'A energia que você percebe é apenas uma manifestação da força primordial que permeia toda a existência. Aprenda a sentir suas correntes e fluir com ela, não contra ela.';
    }

    if (lower.includes('caminho') || lower.includes('jornada')) {
      return 'Todo caminho espiritual é único, traçado pelas linhas de sua própria história akáshica. Não há atalhos na jornada da alma, apenas diferentes portas para o mesmo despertar.';
    }

    if (lower.includes('sabedoria') || lower.includes('conhecimento')) {
      return 'O conhecimento verdadeiro não se acumula — ele se integra. A sabedoria flui quando abandonamos a ilusão de separação entre sujeito e objeto do saber.';
    }

    if (lower.includes('mente') || lower.includes('pensamento')) {
      return 'A mente é uma ferramenta poderosa, mas seu dono deve ser o espírito. Observe seus pensamentos como quem contempla as nuvens passando no céu da consciência.';
    }

    if (lower.includes('alma') || lower.includes('espírito') || lower.includes('espirito')) {
      return 'A alma carrega memórias que precedem este corpo. Ela conhece o caminho, mesmo quando a mente se perde. Confie em sua intuição — ela é a voz da eternidade em você.';
    }

    if (lower.includes('amor') || lower.includes('caridade') || lower.includes('compaix')) {
      return 'O amor é a força mais poderosa do universo. Ele transcende tempo, espaço e forma. Onde há amor genuíno, há conexão com o divino.';
    }

    if (lower.includes('karma') || lower.includes('destino') || lower.includes('sorte')) {
      return 'O karma não é castigo nem recompensa — é simplesmente a lei de causa e efeito que governa a existência. Cada ação plants sementes que florescerão no tempo adequado.';
    }

    if (lower.includes('proteção') || lower.includes('protecao') || lower.includes('guarda')) {
      return 'A verdadeira proteção vem do interior. Quando alinhamos nossa vontade com a vontade cósmica, nenhuma força negativa pode perturbar nossa paz. Fortaleça seu campo áurico com intenção pura.';
    }

    if (lower.includes('oração') || lower.includes('oracao') || lower.includes('rezar')) {
      return 'A oração é um fio de prata que conecta o Земля ao céu. Não importa a forma — o que importa é a sinceridade do coração que se dirige ao infinito.';
    }

    if (lower.includes('trabalho') || lower.includes('serviço') || lower.includes('servico')) {
      return 'O trabalho sagrado é aquele realizado com consciência e propósito. Cada tarefa, quando oferecida ao divino, torna-se ritual. Trabalhe com devoção e o trabalho te libertará.';
    }

    // Resposta padrão
    return 'O campo akáshico pulsa com sabedoria ancestral. Sua pergunta encontra eco nas correntes cósmicas que nos conectam. Permita que a resposta emerja de dentro, pois você já possui o conhecimento que busca.';
  }

  private chunkResponse(response: string): string[] {
    const chunks: string[] = [];
    const words = response.split(' ');

    for (let i = 0; i < words.length; i++) {
      // Agrupa 1-3 palavras por chunk
      const groupSize = Math.floor(Math.random() * 3) + 1;
      const group = words.slice(i, i + groupSize).join(' ');

      if (group.trim()) {
        chunks.push(group + ' ');
      }

      i += groupSize - 1;
    }

    return chunks;
  }
}
