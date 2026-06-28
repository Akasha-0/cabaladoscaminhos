-- ============================================================================
-- Wave 21 — Supabase Storage RLS policies + bucket metadata (2026-06-28)
-- ============================================================================
-- Storage no Supabase é gerenciado via Dashboard / CLI (`supabase storage`)
-- — buckets NÃO são tabelas Prisma. Esta migration portanto NÃO cria
-- buckets; em vez disso:
--
--   1. Habilita RLS em `storage.objects` (managed table do Supabase Storage)
--   2. Cria policies canônicas para os 4 buckets do projeto:
--        - avatars              (PUBLIC  — read all, write own)
--        - post-media           (AUTH    — read all auth, write own)
--        - library-covers       (PUBLIC  — read all, write admin/curator)
--        - message-attachments  (AUTH    — read own, write own)
--
--   3. Cria um índice helper para lookups por bucket+path (usado por
--      getPublicUrl / getSignedUrl em src/lib/supabase/storage.ts).
--
-- Os BUCKETS em si são criados via script `scripts/setup-supabase-storage.sh`
-- ou manualmente em Supabase Dashboard → Storage → New bucket.
--
-- Aplicar com:  psql $DATABASE_URL -f migration.sql
-- Idempotente: tudo usa IF NOT EXISTS / DROP POLICY IF EXISTS.
-- ============================================================================

-- 0. Garante que RLS está ligado na tabela managed do Supabase Storage.
-- (o Supabase já liga por default; este statement é defensivo)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. BUCKET: avatars (PUBLIC — read all, write own)
-- ============================================================================
-- Path convention:  {userId}/avatar.{ext}
-- Public read para servir avatares no feed / sidebar.
-- Write/update/delete apenas pelo próprio dono (auth.uid() match no path).

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_owner_insert" ON storage.objects;
CREATE POLICY "avatars_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "avatars_owner_update" ON storage.objects;
CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;
CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 2. BUCKET: post-media (AUTH — read all auth, write own)
-- ============================================================================
-- Path convention:  {userId}/{postId}/{filename}
-- Read: qualquer usuário autenticado pode ver mídias de posts (community).
-- Write: apenas o autor pode fazer upload/update/delete.

DROP POLICY IF EXISTS "postmedia_auth_read" ON storage.objects;
CREATE POLICY "postmedia_auth_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "postmedia_owner_insert" ON storage.objects;
CREATE POLICY "postmedia_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "postmedia_owner_update" ON storage.objects;
CREATE POLICY "postmedia_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'post-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "postmedia_owner_delete" ON storage.objects;
CREATE POLICY "postmedia_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 3. BUCKET: library-covers (PUBLIC — read all, write admin/curator)
-- ============================================================================
-- Path convention:  {articleId}/cover.{ext}
-- Read público (capas de artigos da biblioteca são públicas).
-- Write protegido: apenas ADMIN ou CURATOR podem subir/atualizar capas.
-- A checagem de role é feita via tabela `user_roles` (project-level role).

DROP POLICY IF EXISTS "librarycovers_public_read" ON storage.objects;
CREATE POLICY "librarycovers_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'library-covers');

DROP POLICY IF EXISTS "librarycovers_admin_insert" ON storage.objects;
CREATE POLICY "librarycovers_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'library-covers'
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur."userId" = auth.uid()::text
        AND ur.role IN ('ADMIN', 'CURATOR')
    )
  );

DROP POLICY IF EXISTS "librarycovers_admin_update" ON storage.objects;
CREATE POLICY "librarycovers_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'library-covers'
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur."userId" = auth.uid()::text
        AND ur.role IN ('ADMIN', 'CURATOR')
    )
  );

DROP POLICY IF EXISTS "librarycovers_admin_delete" ON storage.objects;
CREATE POLICY "librarycovers_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'library-covers'
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur."userId" = auth.uid()::text
        AND ur.role IN ('ADMIN', 'CURATOR')
    )
  );

-- ============================================================================
-- 4. BUCKET: message-attachments (AUTH — read own, write own)
-- ============================================================================
-- Path convention:  {conversationId}/{userId}/{filename}
-- Read/Write estritos: apenas participantes da conversa podem ler/escrever.
-- Para simplificar, usamos match do userId no path (o app valida membership
-- adicional na camada de service antes de gerar signed URLs).

DROP POLICY IF EXISTS "msgattach_owner_read" ON storage.objects;
CREATE POLICY "msgattach_owner_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

DROP POLICY IF EXISTS "msgattach_owner_insert" ON storage.objects;
CREATE POLICY "msgattach_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

DROP POLICY IF EXISTS "msgattach_owner_update" ON storage.objects;
CREATE POLICY "msgattach_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

DROP POLICY IF EXISTS "msgattach_owner_delete" ON storage.objects;
CREATE POLICY "msgattach_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- ============================================================================
-- 5. Índice helper (bucket_id, name) para lookups em getPublicUrl/getSignedUrl
-- ============================================================================
-- O Supabase Storage já indexa (bucket_id, name) na própria tabela managed,
-- mas o índice explícito ajuda em queries analíticas ("quanta mídia por
-- bucket?"). Idempotente.

DROP INDEX IF EXISTS idx_storage_objects_bucket_name;
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_name
  ON storage.objects (bucket_id, name);

-- ============================================================================
-- 6. Verificação (idempotente)
-- ============================================================================
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname IN (
        'avatars_public_read',
        'avatars_owner_insert',
        'avatars_owner_update',
        'avatars_owner_delete',
        'postmedia_auth_read',
        'postmedia_owner_insert',
        'postmedia_owner_update',
        'postmedia_owner_delete',
        'librarycovers_public_read',
        'librarycovers_admin_insert',
        'librarycovers_admin_update',
        'librarycovers_admin_delete',
        'msgattach_owner_read',
        'msgattach_owner_insert',
        'msgattach_owner_update',
        'msgattach_owner_delete'
      );
  RAISE NOTICE 'storage.objects policies criadas = % (esperado: 16)', policy_count;

  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND indexname = 'idx_storage_objects_bucket_name'
  ) INTO policy_count;
  RAISE NOTICE 'idx_storage_objects_bucket_name = %', policy_count;
END $$;