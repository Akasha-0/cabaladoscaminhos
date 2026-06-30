// loader.mjs — Node.js loader hook to handle .js → .ts/.tsx resolution.
// Cycle 82 lesson: --experimental-strip-types does not handle
// .js extensions pointing to .ts/.tsx files. We use this loader
// ONLY for path resolution; Node's strip-types does the type removal.

import { existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve as pathResolve, dirname } from 'node:path';

export async function resolve(specifier, context, nextResolve) {
  if (
    (specifier.startsWith('./') || specifier.startsWith('../')) &&
    specifier.endsWith('.js')
  ) {
    const parentURL = context.parentURL;
    if (parentURL) {
      const parentPath = dirname(fileURLToPath(parentURL));
      const stripped = specifier.slice(0, -3);
      for (const ext of ['.tsx', '.ts']) {
        const candidate = pathResolve(parentPath, stripped + ext);
        if (existsSync(candidate) && statSync(candidate).isFile()) {
          return nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
  }
  return nextResolve(specifier, context);
}
