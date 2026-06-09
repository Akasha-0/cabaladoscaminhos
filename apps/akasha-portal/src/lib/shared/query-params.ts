// ============================================================
// QUERY PARAMS UTILITIES - CABALA DOS CAMINHOS
// ============================================================
// Helpers para converter URLSearchParams em objeto pronto para Zod safeParse.
//
// searchParams.get() devolve `null` (não `undefined`) quando a chave não existe.
// Campos `optional()` do Zod só tratam `undefined`. Passar `null` faz o Zod
// tentar validar `null` contra o schema interno (ex: `z.coerce.number()` em
// `null` → NaN → falha no `.min(1)`).
//
// Usar `searchParamsToObject(params, ['key1', 'key2', ...])` para obter um
// objeto com `null` convertido em `undefined` para os campos nomeados.
// ============================================================

/**
 * Converte um URLSearchParams em um objeto com `null` → `undefined` apenas
 * nas chaves listadas em `keys`. Chaves ausentes ficam `undefined` (não `null`).
 *
 * @example
 * const sp = new URLSearchParams('a=1&b=');
 * searchParamsToObject(sp, ['a', 'b', 'c']);
 * // { a: '1', b: '', c: undefined }
 */
export function searchParamsToObject(
  searchParams: URLSearchParams,
  keys: readonly string[]
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const key of keys) {
    const v = searchParams.get(key);
    result[key] = v === null ? undefined : v;
  }
  return result;
}
