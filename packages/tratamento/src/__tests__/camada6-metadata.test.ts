/**
 * Wave 7.4 — A.2 tests: arquetipo_jung + estilo_terapeutico surfaced through
 * TextRecord → TextSource → recordParaSource helper.
 *
 * Camada 6 (Psicanálise) é a principal consumidora desses campos.
 */
import { describe, it, expect } from 'vitest';
import { recordParaSource } from '../camadas/_helpers';
import type { TextRecord } from '../types';

function makeRecord(overrides: Partial<TextRecord> = {}): TextRecord {
  return {
    id: 'rec-001',
    categoria: 'pergunta_clinica',
    texto: 'Exemplo de texto-fonte para o corpus.',
    ...overrides,
  } as TextRecord;
}

describe('Wave 7.4 — A.2: arquetipo_jung + estilo_terapeutico surfaced', () => {
  it('test_metadata_extraction: inclui arquetipo_jung + estilo_terapeutico quando presentes no TextRecord', () => {
    const rec = makeRecord({
      arquetipo_jung: 'Sombra',
      estilo_terapeutico: 'psicanalise',
    });
    const src = recordParaSource(rec, 'textos/test.json');

    expect(src.arquetipo_jung).toBe('Sombra');
    expect(src.estilo_terapeutico).toBe('psicanalise');
    expect(src.conteudo).toBe('Exemplo de texto-fonte para o corpus.');
  });

  it('test_camada6_com_metadata: TextRecord com ambos campos → TextSource com ambos', () => {
    const rec = makeRecord({
      arquetipo_jung: 'Anima',
      estilo_terapeutico: 'gestalt',
      texto: 'A Anima representa o princípio feminino na psique masculina.',
    });
    const src = recordParaSource(rec);

    expect(src.arquetipo_jung).toBe('Anima');
    expect(src.estilo_terapeutico).toBe('gestalt');
    // Conteúdo preservado
    expect(src.conteudo).toContain('Anima');
  });

  it('test_camada6_sem_metadata: TextRecord sem campos → TextSource com campos undefined (regressão)', () => {
    const rec = makeRecord({
      texto: 'Texto sem metadados psicanalíticos.',
      // arquetipo_jung e estilo_terapeutico NÃO definidos
    });
    const src = recordParaSource(rec, 'textos/test.json'); // passa relPath explicitamente

    // Campos opcionais — devem ser undefined, não quebrar o consumo
    expect(src.arquetipo_jung).toBeUndefined();
    expect(src.estilo_terapeutico).toBeUndefined();
    // Conteúdo preservado normalmente
    expect(src.conteudo).toBe('Texto sem metadados psicanalíticos.');
    // Outros campos do TextSource permanecem intactos
    expect(src.id).toBe('rec-001');
    expect(src.path).toBe('textos/test.json');
  });
});