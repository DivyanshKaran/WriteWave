import { useCallback, useMemo, useRef, useState } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { contentService } from '@/lib/api-client';

type UploadState = 'idle' | 'validating' | 'uploading' | 'success' | 'error' | 'cancelled';

export interface UseUploadOptions {
  maxFileSize?: number; // bytes
  allowedTypes?: string[];
}

export function useUploadMedia(options?: UseUploadOptions) {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<CancelTokenSource | null>(null);

  const { maxFileSize, allowedTypes } = useMemo(() => ({
    maxFileSize: options?.maxFileSize ?? 10 * 1024 * 1024,
    allowedTypes: options?.allowedTypes ?? ['image/jpeg','image/png','image/webp','video/mp4']
  }), [options?.maxFileSize, options?.allowedTypes]);

  const validate = useCallback((file: File) => {
    if (file.size > maxFileSize) {
      throw new Error(`File is too large. Max ${(maxFileSize / (1024*1024)).toFixed(0)}MB`);
    }
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  }, [maxFileSize, allowedTypes]);

  const upload = useCallback(async (file: File, metadata?: Record<string, any>) => {
    try {
      setError(null);
      setState('validating');
      validate(file);

      setState('uploading');
      setProgress(0);
      const source = axios.CancelToken.source();
      cancelRef.current = source;

      const res = await contentService.uploadMedia(file, metadata, {
        cancelToken: source.token as any,
        onUploadProgress: (evt: ProgressEvent) => {
          if (evt.total) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setProgress(pct);
          }
        },
      } as any);

      setState('success');
      setProgress(100);
      return res.data;
    } catch (e: any) {
      if (axios.isCancel(e)) {
        setState('cancelled');
        setError('Upload cancelled');
      } else {
        setState('error');
        setError(e?.message || 'Upload failed');
      }
      throw e;
    } finally {
      cancelRef.current = null;
    }
  }, [validate]);

  const cancel = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current.cancel('User cancelled upload');
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setProgress(0);
    setError(null);
  }, []);

  return { state, progress, error, upload, cancel, reset };
}


