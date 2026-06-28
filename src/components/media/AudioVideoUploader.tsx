// TODO(w24): real upload to R2/S3 + transcoding pipeline
'use client';

import { type FC } from 'react';

export interface AudioVideoUploaderProps {
  onSelect?: (file: File) => void;
  accept?: string;
}

export const AudioVideoUploader: FC<AudioVideoUploaderProps> = () => {
  return (
    <div data-component="audio-video-uploader">
      <p>Upload de áudio/vídeo em breve</p>
      <button type="button" disabled>
        Selecionar arquivo
      </button>
    </div>
  );
};

export default AudioVideoUploader;
