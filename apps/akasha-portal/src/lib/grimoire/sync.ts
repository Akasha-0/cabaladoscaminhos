import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { prisma } from '@/lib/infrastructure/prisma';

/** Return type matching test expectations */
export interface SyncResult {
  success: boolean;
  count: number;
  warnings: string[];
}

/**
 * Sincroniza o Grimório (Markdown → embeddings → pgvector)
 */
export async function syncGrimoire(options?: SyncOptions): Promise<SyncResult> {
  const baseDir = path.resolve(process.cwd(), 'grimoire');
  const warnings: string[] = [];

  if (!fs.existsSync(baseDir)) {
    warnings.push(`Directory ${baseDir} not found`);
    return { success: false, count: 0, warnings };
  }

  function walkDir(dir: string): string[] {
    const entries = fs.readdirSync(dir);
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...walkDir(fullPath));
      } else if (entry.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    return files;
  }
  const allFiles = walkDir(baseDir);

  let count = 0;
  const embeddingUrl = process.env.OLLAMA_URL ?? 'http://localhost:11434/api/embeddings';
  const embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text';

  for (const filePath of allFiles) {
    const relativePath = path.relative(baseDir, filePath);

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content } = matter(raw);

      let embedding: number[] | null = null;
      try {
        const res = await fetch(embeddingUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: embeddingModel, prompt: content.slice(0, 2000) }),
        });
        if (res.ok) {
          const json = await res.json() as { embedding?: number[] };
          embedding = json.embedding ?? null;
        }
      } catch {
        // Ollama offline — continue without embedding
      }

      const slug = (frontmatter.slug as string)
        ?? (frontmatter.id as string)
        ?? relativePath.replace(/\.md$/, '').replace(/\//g, '-');

      // gray-matter parses YAML `category:` as frontmatter.category
      const categoria = (frontmatter.category as string)
        ?? (frontmatter.categoria as string)
        ?? 'general';

      // biblioteca: explicit field first, then derive from category/categoria
      const biblioteca = (frontmatter.biblioteca as string)
        ?? (frontmatter.library as string)
        ?? (frontmatter.category as string)
        ?? (frontmatter.categoria as string)
        ?? 'general';

      await (prisma.grimoireEntry as unknown as {
        upsert: (args: {
          where: { slug: string };
          create: Record<string, unknown>;
          update: Record<string, unknown>;
        }) => Promise<unknown>;
      }).upsert({
        where: { slug },
        create: {
          slug,
          id: frontmatter.id as string,
          title: (frontmatter.title as string) ?? slug,
          conteudo: content,
          categoria,
          biblioteca,
          metadata: frontmatter as Record<string, unknown>,
          embedding: embedding ?? undefined,
          sourcePath: relativePath,
        },
        update: {
          title: (frontmatter.title as string) ?? slug,
          conteudo: content,
          categoria,
          biblioteca,
          metadata: frontmatter as Record<string, unknown>,
          embedding: embedding ?? undefined,
        },
      });
      count += 1;
    } catch (err) {
      warnings.push(`Error syncing ${relativePath}: ${String(err)}`);
    }
  }

  return { success: true, count, warnings };
}
