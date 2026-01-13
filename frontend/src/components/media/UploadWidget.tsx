import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useUploadMedia } from '@/hooks/useUpload';

interface UploadWidgetProps {
  maxFileSize?: number;
  allowedTypes?: string[];
  onUploaded?: (result: any) => void;
}

export function UploadWidget({ maxFileSize, allowedTypes, onUploaded }: UploadWidgetProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<File | null>(null);
  const { state, progress, error, upload, cancel, reset } = useUploadMedia({ maxFileSize, allowedTypes });

  const onPick = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelected(file || null);
  };

  const onStart = async () => {
    if (!selected) return;
    try {
      const result = await upload(selected);
      onUploaded?.(result);
    } catch {}
  };

  return (
    <div className="space-y-3">
      <Input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onPick}>Choose File</Button>
        <Button onClick={onStart} disabled={!selected || state === 'uploading'}>
          {state === 'uploading' ? 'Uploading...' : 'Upload'}
        </Button>
        {state === 'uploading' && (
          <Button variant="ghost" onClick={cancel}>Cancel</Button>
        )}
        {(state === 'error' || state === 'success' || state === 'cancelled') && (
          <Button variant="ghost" onClick={reset}>Reset</Button>
        )}
      </div>
      {selected && (
        <div className="text-sm text-muted-foreground">{selected.name} ({Math.round(selected.size/1024)} KB)</div>
      )}
      {state === 'uploading' && (
        <div className="space-y-2">
          <Progress value={progress} />
          <div className="text-xs text-muted-foreground">{progress}%</div>
        </div>
      )}
      {error && <div className="text-sm text-destructive">{error}</div>}
      {state === 'success' && <div className="text-sm text-green-600">Upload complete</div>}
    </div>
  );
}


