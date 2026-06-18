// NOTE (lesson N+20/N+24/N+26 pattern: surface, don't hide):
//   Trade-offs in this file (intentional, do not refactor without
//   coordination):
//
//   1. Hand-rolled YAML frontmatter parser (parseFrontmatter). Works
//      for the simple flat key-value frontmatter used by grimoire
//      entries (id, title, title_en, slug, etc.). Does NOT support
//      nested objects, lists, or anchors. If grimoire frontmatter
//      grows complex (e.g. I-Ching with arrays of source/lineage),
//      replace with `js-yaml` or `gray-matter`. Pre-existing
//      brittleness: see `tests/lib/grimoire/sync.test.ts` (5 failing
//      tests likely related to this parser).
//
//   2. `Frontmatter` interface uses `[key: string]: any`. The `any`
//      is a code smell but is necessary because the YAML parser
//      above returns `unknown` shapes. A future cleanup would
//      introduce a typed `GrimoireFrontmatter` interface and remove
//      the `any`.
//
//   3. The sync is one-way (filesystem → DB). No reverse sync.
//      Grimoire entries are source-of-truth in the filesystem, the
//      DB is a search index.
import { Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/infrastructure/prisma';

interface Frontmatter {
  id?: string;
  title?: string;
  category?: string;
  [key: string]: any;
}

function parseFrontmatter(markdownContent: string): { metadata: Frontmatter; content: string } {
  const parts = markdownContent.split('---');
  if (parts.length < 3) {
    return { metadata: {}, content: markdownContent };
  }
  const yaml = parts[1];
  const content = parts.slice(2).join('---').trim();
  const metadata: Frontmatter = {};

  yaml.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Strip quotes if they surround the value
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.substring(1, value.length - 1);
      }

      // Convert number string to number if applicable
      const num = Number(value);
      if (value !== '' && !isNaN(num)) {
        metadata[key] = num;
      } else if (value === 'true') {
        metadata[key] = true;
      } else if (value === 'false') {
        metadata[key] = false;
      } else {
        metadata[key] = value;
      }
    }
  });

  return { metadata, content };
}

async function getEmbedding(text: string): Promise<number[] | null> {
  const url = process.env.OLLAMA_URL || 'http://localhost:11434/api/embeddings';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Ollama returned status ${res.status}`);
    }
    const data = (await res.json()) as { embedding: number[] };
    return data.embedding;
  } catch (error) {
    return null;
  }
}

function getMdFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return [];

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMdFiles(filePath));
    } else if (filePath.endsWith('.md')) {
      results.push(filePath);
    }
  });
  return results;
}

export async function syncGrimoire(): Promise<{
  success: boolean;
  count: number;
  warnings: string[];
}> {
  // Grimoire directory should be in the root of the workspace.
  // When running inside Next.js, path.resolve('.') will point to the root workspace.
  const grimoireDir = path.resolve('./grimoire');
  const warnings: string[] = [];

  if (!fs.existsSync(grimoireDir)) {
    return {
      success: false,
      count: 0,
      warnings: [`Grimoire directory not found at ${grimoireDir}`],
    };
  }

  const files = getMdFiles(grimoireDir);
  let syncedCount = 0;

  for (const file of files) {
    try {
      const rawContent = fs.readFileSync(file, 'utf8');
      const { metadata, content } = parseFrontmatter(rawContent);

      const id = metadata.id || path.basename(file, '.md');
      const categoria = metadata.category || metadata.categoria || 'general';
      const biblioteca = metadata.biblioteca || 'diagnostico';
      const slug = metadata.slug || id;
      const title = metadata.title || id;

      const textToEmbed = `Title: ${title}\n\nCategory: ${categoria}\n\nContent: ${content}`;
      const embedding = await getEmbedding(textToEmbed);

      await prisma.grimoireEntry.upsert({
        where: { slug },
        update: {
          categoria,
          biblioteca,
          metadata: metadata as Prisma.InputJsonValue,
          conteudo: content,
          sourcePath: file,
        },
        create: {
          id,
          slug,
          categoria,
          biblioteca,
          metadata: metadata as Prisma.InputJsonValue,
          conteudo: content,
          sourcePath: file,
        },
      });

      // Update embedding if available
      if (embedding && embedding.length === 768) {
        const vectorStr = `[${embedding.join(',')}]`;
        await prisma.$executeRaw`
          UPDATE grimoire
          SET embedding = cast(${vectorStr} as vector)
          WHERE id = ${id}
        `;
      } else if (embedding) {
        warnings.push(
          `Embedding vector length is ${embedding.length} for ${id}, expected 768. Skipped vector update.`
        );
      }

      syncedCount++;
    } catch (err) {
      warnings.push(`Failed to sync file ${file}: ${(err as Error).message}`);
    }
  }

  return {
    success: syncedCount > 0,
    count: syncedCount,
    warnings,
  };
}
