"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage, validateImageFile } from "@/lib/upload-utils";
import { toast } from "sonner";
import { AutoSignedImage } from "@/components/ui/auto-signed-image";

interface CloudflareImageUploadProps {
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  type: "organization" | "event";
  maxFileSize?: number;
  disabled?: boolean;
  className?: string;
  currentImageUrl?: string | null;
}

export function CloudflareImageUpload({
  onImageUploaded,
  onImageRemoved,
  type,
  maxFileSize = 10,
  disabled = false,
  className,
  currentImageUrl,
}: CloudflareImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const [dragOver, setDragOver] = useState(false);

  const handleImageUpload = useCallback(
    async (file: File) => {
      const validation = validateImageFile(file, maxFileSize);
      if (!validation.isValid) {
        toast.error(validation.error || "Fichier invalide");
        return;
      }

      setIsUploading(true);

      try {
        const result = await uploadImage(file, type);
        setPreviewUrl(result.url);
        onImageUploaded(result.url);
        toast.success("Image uploadée avec succès");
      } catch (error) {
        console.error("Erreur upload:", error);
        toast.error(
          error instanceof Error ? error.message : "Erreur lors de l'upload"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [type, maxFileSize, onImageUploaded]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(false);

      if (disabled || isUploading) return;

      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload, disabled, isUploading]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!disabled && !isUploading) {
        setDragOver(true);
      }
    },
    [disabled, isUploading]
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(false);
    },
    []
  );

  const handleRemoveImage = useCallback(() => {
    setPreviewUrl(null);
    onImageRemoved?.();
  }, [onImageRemoved]);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-60 pointer-events-none",
          isUploading && "pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() =>
          !disabled &&
          !isUploading &&
          document.getElementById("file-input")?.click()
        }
      >
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}

          <div className="text-sm text-muted-foreground">
            {isUploading ? (
              <p>Upload en cours...</p>
            ) : (
              <>
                <p>Glissez-déposez une image ici ou</p>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  disabled={disabled}
                >
                  cliquez pour sélectionner
                </Button>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Formats acceptés: JPEG, PNG, WebP (max {maxFileSize}MB)
          </p>
        </div>

        <input
          id="file-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>

      {previewUrl && (
        <div className="relative w-full max-w-xs mx-auto">
          <AutoSignedImage
            src={previewUrl}
            alt="Aperçu"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
