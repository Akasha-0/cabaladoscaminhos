/**
 * Cloud backup service using Supabase storage.
 */

import { createClient } from '@/lib/supabase-server';

export interface CloudBackup {
  id: string;
  userId: string;
  filename: string;
  size: number;
  createdAt: string;
  metadata: {
    version: number;
    type: string;
  };
}

export interface BackupPayload {
  version: number;
  timestamp: string;
  data: {
    favorites?: unknown[];
    history?: unknown[];
    reminders?: unknown[];
    userPreferences?: unknown;
    [key: string]: unknown;
  };
}

/**
 * Upload a backup to Supabase storage.
 */
export async function backupToCloud(
  userId: string,
  payload: BackupPayload
): Promise<CloudBackup> {
  const supabase = await createClient();

  const filename = `backup-${userId}-${Date.now()}.json`;
  const content = JSON.stringify(payload, null, 2);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('backups')
    .upload(filename, content, {
      contentType: 'application/json',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload backup: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('backups')
    .getPublicUrl(filename);

  void publicUrlData;

  const { data: fileMetadata, error: metadataError } = await supabase.storage
    .from('backups')
    .info(filename);

  if (metadataError) {
    throw new Error(`Failed to get backup metadata: ${metadataError.message}`);
  }

  return {
    id: uploadData?.id ?? filename,
    userId,
    filename,
    size: fileMetadata?.metadata?.size ?? content.length,
    createdAt: fileMetadata?.createdAt ?? new Date().toISOString(),
    metadata: {
      version: payload.version,
      type: 'user-backup',
    },
  };
}

/**
 * Retrieve the latest cloud backup for a user.
 */
export async function getCloudBackup(userId: string): Promise<BackupPayload | null> {
  const supabase = await createClient();

  const { data: files, error: listError } = await supabase.storage
    .from('backups')
    .list(undefined, {
      search: `backup-${userId}-`,
      sortBy: { column: 'created_at', order: 'desc' },
      limit: 1,
    });

  if (listError) {
    throw new Error(`Failed to list backups: ${listError.message}`);
  }

  if (!files || files.length === 0) {
    return null;
  }

  const latestFile = files[0];

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('backups')
    .download(latestFile.name);

  if (downloadError) {
    throw new Error(`Failed to download backup: ${downloadError.message}`);
  }

  const text = await fileData.text();
  const payload = JSON.parse(text) as BackupPayload;

  return payload;
}
