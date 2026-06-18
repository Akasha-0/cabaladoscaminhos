/**
 * RAG do Grimório para o Mentor IA — F-233
 *
 * O Mentor (`/api/mentor/ask`) usa o LLM para responder perguntas do
 * usuário sobre seu mapa. Antes do F-233, o Mentor só tinha os dados
 * BRUTOS (numerologia, signos, Odu, hexagrama). Agora, este módulo
 * injeta no system prompt:
 *
 *   1. Significado ESPECÍFICO de cada Pilar (F-221)
 *   2. Insight do Dia (F-230) — síntese dos 5 Pilares em 1 voz
 *   3. Tradução Pilar → Áreas (F-229) — para CADA área da vida
 *   4. Conexões entre Pilares (F-232) — como eles se FALAM
 *
 * O LLM passa a ter ACESSO AO GRIMÓRIO CURADO, não só aos números
 * brutos. Isso ENTREGA respostas fundamentadas em fonte (axioma 4).
 *
 * Pilar 4 (Odu) marca `requer_terreiro: true` em todas as áreas
 * e conexões (R-022 §4.4) — o system prompt instrui o LLM a NUNCA
 * "interpretar" Odu diretamente, apenas REFERENCIAR o terreiro.
 *
 * Princípios:
 *   - O RAG é gerado em RUNTIME a partir dos Pilares do dia
 *     (mesmo mapa → mesmo RAG, garantindo reprodutibilidade)
 *   - O RAG é puramente DETERMINÍSTICO (sem random) — combina com
 *     R-022 §1.2: tecnologia de autocura, não magia
 *   - O RAG cabe em ~2-3k tokens (não estoura a janela)
 *   - O LLM recebe INSTRUÇÕES ÉTICAS explícitas (CVV 188, R-022)
 */
import { conexoesDe } from './conexoes-pilares';
import { gerarInsightDoDia } from './insight-do-dia';
import { significadosEspecificos, type PilaresDados, type Pilar } from './significados-curados';
import { traducoesDaArea, AREAS } from './traducao-areas';

const PILAR_NOME: Record<Pilar, string> = {
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantrica: 'Tântrica',
  odu: 'Odu',
  iching: 'I Ching',
};

const INSTRUCOES_ETICAS = `
DIRETRIZES ÉTICAS (NÃO NEGOCIÁVEIS):
1. Pilar 4 (Odu) é herança ancestral iorubá. NUNCA interprete o Odu do
   usuário — apenas REFERENCIE a necessidade de babalaô/yaô de
   confiança (R-022 §4.4).
2. Se detectar crise (ideação suicida, autolesão, abuso), responda
   CVV-188 (Centro de Valorização da Vida) e suspenda interpretação
   simbólica. Não tente curar — REFERENCIE.
3. Linguagem acessível, 2ª pessoa, sem jargão sem tradução.
4. Toda afirmação cita FONTE. Sem afirmações inventadas.
5. O usuário vive em ÁREAS (paz, saúde, relações, dinheiro, trabalho,
   propósito, criatividade, espiritualidade). USE o campo "conexao"
   de cada Pilar para mostrar COMO os saberes se entrelaçam.
`.trim();

/** Monta o RAG do Grimório para um mapa de usuário. */
export function ragForPilares(pilares: PilaresDados): string {
  const sigs = significadosEspecificos(pilares);
  const insight = gerarInsightDoDia(pilares);

  const secoes: string[] = [];

  // 1. Insight do Dia (síntese)
  secoes.push(
    [
      '## INSIGHT DO DIA (síntese integrando os 5 Pilares)',
      insight.titulo_curto,
      '',
      insight.sintese,
      '',
      `Prática do dia: ${insight.pratica_do_dia}`,
      `Pilares destacados HOJE: ${insight.pilares_destacados.map((p) => PILAR_NOME[p]).join(', ')}`,
    ].join('\n')
  );

  // 2. Significado ESPECÍFICO de cada Pilar
  secoes.push('\n## SIGNIFICADO ESPECÍFICO DOS 5 PILARES');
  (['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as Pilar[]).forEach((p) => {
    const s = sigs[p];
    const oduAviso = p === 'odu' ? ' ⚠ requer terreiro + consentimento (R-022)' : '';
    secoes.push(
      [
        `\n### ${PILAR_NOME[p]} — ${s.titulo}${oduAviso}`,
        `Essência: ${s.essencia}`,
        `Missão: ${s.missao}`,
        `Sombra: ${s.sombra}`,
        `Prática: ${s.pratica}`,
        `Conexão com os outros: ${s.conexao}`,
        `Fonte: ${s.fonte}`,
      ].join('\n')
    );
  });

  // 3. Tradução Pilar → Áreas da vida
  secoes.push('\n## O QUE OS PILARES DIZEM PARA CADA ÁREA DA VIDA');
  AREAS.forEach((area) => {
    const ts = traducoesDaArea(area);
    secoes.push(`\n### ${area.toUpperCase()}`);
    ts.forEach((t) => {
      const aviso = t.requer_terreiro ? ' ⚠' : '';
      secoes.push(`- **${PILAR_NOME[t.pilar]}**${aviso}: ${t.frase}`);
    });
  });

  // 4. Conexões entre os 5 Pilares (F-232)
  secoes.push('\n## COMO OS 5 PILARES SE FALAM ENTRE SI');
  (['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as Pilar[]).forEach((origem) => {
    const saindo = conexoesDe(origem);
    saindo.forEach((c) => {
      const aviso = c.requer_terreiro ? ' ⚠' : '';
      secoes.push(`- ${PILAR_NOME[c.origem]} → ${PILAR_NOME[c.destino]}${aviso}: ${c.frase}`);
    });
  });

  // 5. Instruções éticas
  secoes.push('\n## DIRETRIZES ÉTICAS');
  secoes.push(INSTRUCOES_ETICAS);

  return secoes.join('\n');
}

/** Tipo do @akasha/mentor (defensivo). */
export interface UserMapsLike {
  cabala?: { lifePath?: number | null; yearNumber?: number | null };
  astrology?: { sunSign?: string | null; ascendant?: string | null; moonPhase?: string | null };
  tantra?: { activeBodies?: number[]; soul?: number | null };
  odus?: { oduName?: string | null };
  iching?: { hexagramNumber?: number | null; hexagramName?: string | null };
}

/** Versão defensiva que recebe `UserMaps` (tipo do @akasha/mentor). */
export function ragForUserMaps(maps: UserMapsLike | null | undefined): string {
  if (!maps) {
    return '\n(mapa do usuário ainda não carregado — responda pedindo para ele completar o perfil)';
  }
  const pil: PilaresDados = {
    cabala: {
      life_path: maps.cabala?.lifePath ?? 0,
      birthday: 0,
      expression: 0,
      ano_pessoal: maps.cabala?.yearNumber ?? 0,
    },
    astrologia: {
      sol_signo: maps.astrology?.sunSign ?? '',
      asc_signo: maps.astrology?.ascendant ?? null,
      lua_signo: '',
      lua_fase:
        (maps.astrology?.moonPhase as 'nova' | 'crescente' | 'cheia' | 'minguante') ?? 'nova',
      trinity: { sombra: 0, dom: 0, graca: 0 },
      trinity_dominante: 'sombra',
      lilith_signo: null,
      casa_8_signo: null,
    },
    tantrica: {
      corpo_predominante: maps.tantra?.soul ?? 1,
      trigemeo: 'fisico',
      temperamento_atual: 'sanguineo',
    },
    odu: {
      odu_principal: maps.odus?.oduName ?? '',
      odu_secundario: null,
      fonte: 'Ifá',
    },
    iching: {
      hexagrama_natal: 0,
      hexagrama_dia: maps.iching?.hexagramNumber ?? 0,
      level: 'gift',
    },
  };
  return ragForPilares(pil);
}
