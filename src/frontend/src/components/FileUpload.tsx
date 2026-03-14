import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, FileText, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useScanContext } from "../context/ScanContext";
import { useUploadFile } from "../hooks/useQueries";

const ACCEPTED_TYPES = [".apk", ".ipa", ".appx"];

function getFileTypeLabel(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "apk") return "APK";
  if (ext === "ipa") return "IPA";
  if (ext === "appx") return "APPX";
  return ext?.toUpperCase() ?? "Unknown";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadFile, isPending, isSuccess } = useUploadFile();
  const { setSelectedJobId } = useScanContext();

  const validateFile = useCallback((f: File): boolean => {
    const ext = `.${f.name.split(".").pop()?.toLowerCase()}`;
    if (!ACCEPTED_TYPES.includes(ext)) {
      setError(
        `Invalid file type. Only ${ACCEPTED_TYPES.join(", ")} files are accepted.`,
      );
      return false;
    }
    setError(null);
    return true;
  }, []);

  const handleFile = useCallback(
    (f: File) => {
      if (validateFile(f)) setFile(f);
    },
    [validateFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);

  const handleUpload = async () => {
    if (!file) return;
    try {
      const job = await uploadFile({
        name: file.name,
        fileType: getFileTypeLabel(file.name),
        size: BigInt(file.size),
      });
      setSelectedJobId(job.id);
      toast.success(`Analysis started for ${file.name}`);
      setFile(null);
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Upload File for Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <label
          data-ocid="upload.dropzone"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".apk,.ipa,.appx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {file ? (
            <>
              <FileText className="h-10 w-10 text-primary" />
              <div className="text-center">
                <p className="font-semibold text-sm text-foreground">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatBytes(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFile(null);
                }}
                className="absolute top-2 right-2 p-1 rounded hover:bg-muted"
                aria-label="Remove file"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop your file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports APK, IPA, and APPX files
                </p>
              </div>
            </>
          )}
        </label>

        {error && (
          <div
            className="flex items-center gap-2 mt-2 text-red-600 text-xs"
            data-ocid="upload.error_state"
          >
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {isSuccess && (
          <div
            className="flex items-center gap-2 mt-2 text-green-600 text-xs"
            data-ocid="upload.success_state"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            File uploaded successfully. Analysis in progress.
          </div>
        )}

        <Button
          data-ocid="upload.button"
          className="w-full mt-3"
          disabled={!file || isPending}
          onClick={handleUpload}
        >
          {isPending ? (
            <span
              data-ocid="upload.loading_state"
              className="flex items-center gap-2"
            >
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            "Start Analysis"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
