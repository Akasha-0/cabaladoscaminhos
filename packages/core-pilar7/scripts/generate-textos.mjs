#!/usr/bin/env node
/**
 * generate-textos.mjs
 *
 * Gera os 192 arquivos placeholder de texto para Pilar 7.
 * 64 chaves × 3 estagios (sombra | dom | siddhi) = 192 arquivos.
 *
 * CONTEUDO:
 * - 1-2 paragrafos originais em PT-BR por arquivo.
 * - NAO copia de nenhuma fonte comercial.
 * - Substituidos por textos finais em Wave 5+.
 *
 * NAMING: chave-XX-{estagio}.md onde XX = 01..64.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'src', 'textos');

mkdirSync(OUT_DIR, { recursive: true });

const ESTAGIOS = ['sombra', 'dom', 'siddhi'];

// Mapa das 64 chaves com nome universalista (espelha CHAVES_DATA em chave.ts).
// Apenas para o titulo do arquivo de texto — nao duplica logica.
const CHAVES = {
  1: 'A Forca Criadora', 2: 'A Receptividade', 3: 'O Despertar Inicial',
  4: 'A Busca do Mestre', 5: 'A Espera Feunda', 6: 'O Litigio',
  7: 'A Disciplina Coletiva', 8: 'A Alianca', 9: 'O Refinamento',
  10: 'A Conduta', 11: 'A Prosperidade', 12: 'A Estagnacao',
  13: 'A Comunhao', 14: 'A Grande Posse', 15: 'A Modestia',
  16: 'O Entusiasmo', 17: 'O Seguimento', 18: 'A Restauracao',
  19: 'A Aproximacao', 20: 'A Contemplacao', 21: 'A Desobstrucao',
  22: 'A Beleza', 23: 'A Desintegracao', 24: 'O Retorno',
  25: 'A Inocencia', 26: 'A Contencao', 27: 'A Nutricao',
  28: 'A Excedencia', 29: 'O Abismo', 30: 'O Brilho',
  31: 'A Influencia', 32: 'A Duracao', 33: 'A Retirada',
  34: 'O Grande Poder', 35: 'O Progresso', 36: 'A Luz Protegida',
  37: 'A Familia', 38: 'A Oposicao', 39: 'O Obstaculo',
  40: 'A Liberacao', 41: 'A Diminuicao', 42: 'O Aumento',
  43: 'A Decisao', 44: 'O Encontro', 45: 'A Reuniao',
  46: 'A Ascensao', 47: 'O Esgotamento', 48: 'O Poco',
  49: 'A Revisao', 50: 'O Caldeirao', 51: 'O Trovao',
  52: 'A Imobilidade', 53: 'O Desenvolvimento', 54: 'A Noiva',
  55: 'A Abundancia', 56: 'O Andante', 57: 'O Suave',
  58: 'A Alegria', 59: 'A Dispersao', 60: 'A Limitacao',
  61: 'A Verdade Interior', 62: 'A Pequena Excedencia',
  63: 'Apos a Conclusao', 64: 'Antes da Conclusao',
};

// Textos placeholder originais por estagio. Estes NAO sao copias.
// Sao paragrafos curtos que descrevem a dinamica do estagio de forma
// universalista (Cumino, Saraceni, Camargo). Serao substituidos por
// textos finais em Wave 5+ por escritor proprio + revisao teologica.

const TEXTOS = {
  sombra: (num, nome) => `---
chave: ${num}
nome: ${nome}
estagio: sombra
versao: v1 (placeholder Wave 4)
---

# ${nome} — Sombra

Esta chave, em sua feicao de sombra, indica o ponto onde o consulente se perde em automatismos, repeticoes inconscientes ou padroes herdados. E a regiao onde a forca vital se cristaliza em resistencia, e onde o visivel (o que se mostra) esconde o invisivel (o que precisa ser visto).

A sombra nao e inimiga: e a sombra do sol que torna visivel o que seria cegante. Reconhece-la e o primeiro movimento do trabalho consciente sobre esta chave. Quem a atravessa descobre que aquilo que parecia destino era apenas habito.

Texto definitivo em Wave 5+ (ver D-ZZZ §Migration Plan).
`,

  dom: (num, nome) => `---
chave: ${num}
nome: ${nome}
estagio: dom
versao: v1 (placeholder Wave 4)
---

# ${nome} — Dom

Esta chave, em sua feicao de dom, representa a qualidade cultivada que o consulente pode oferecer ao mundo quando transmutou a sombra em substancia. E a virtude pratica, a capacidade especifica que distingue o caminho deste consulente entre os caminhos possiveis.

O dom nao se recebe por acaso — ele se exercita. E a ponte entre o visivel e o invisivel: o que se e (sombra) atravessado pelo que se pratica (dom), ate virar o que se transmite (siddhi).

Texto definitivo em Wave 5+ (ver D-ZZZ §Migration Plan).
`,

  siddhi: (num, nome) => `---
chave: ${num}
nome: ${nome}
estagio: siddhi
versao: v1 (placeholder Wave 4)
---

# ${nome} — Siddhi

Esta chave, em sua feicao de siddhi, indica o estado raro em que o dom se dissolve em sabedoria pura. Quando o consulente integra a sombra e cultiva o dom ao longo de tempo suficiente, a acao deixa de ser pessoal: o que ele faz passa a ser feito atraves dele, e nao por ele.

Siddhi nao e meta prescritiva — e horizonte. Cada um chega quando chega. O importante e nao confundir brilho passageiro com permanencia: a siddhi sustenta-se em silencio, depois de muito trabalho invisivel.

Texto definitivo em Wave 5+ (ver D-ZZZ §Migration Plan).
`,
};

let count = 0;
for (let i = 1; i <= 64; i++) {
  const numero = String(i).padStart(2, '0');
  const nome = CHAVES[i];
  for (const estagio of ESTAGIOS) {
    const filename = `chave-${numero}-${estagio}.md`;
    const filepath = join(OUT_DIR, filename);
    const content = TEXTOS[estagio](i, nome);
    writeFileSync(filepath, content, 'utf8');
    count++;
  }
}

console.log(`Gerados ${count} arquivos placeholder em ${OUT_DIR}`);
