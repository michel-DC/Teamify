"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadZoneProps {
  onImageChange: (file: File | null) => void;
  imagePreviewUrl?: string | null;
  maxFileSize?: number; // en MB
  disabled?: boolean;
}

/**
 * @param Composant d'upload d'image unique avec prévisualisation
 *
 * Permet à l'utilisateur de sélectionner une image (drag & drop ou input),
 * valide le type et la taille, et affiche un aperçu. UX et accessibilité optimisées.
 */
export function ImageUploadZone({
  onImageChange,
  imagePreviewUrl = null,
  maxFileSize = 5,
  disabled = false,
}: ImageUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(
    imagePreviewUrl
  );

  /**
   * Valide le type et la taille du fichier image
   */
  const validateFile = useCallback(
    (file: File): boolean => {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Type de fichier non supporté. Utilisez JPEG, PNG ou WebP.");
        return false;
      }
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSize) {
        alert(
          `Le fichier est trop volumineux. Taille maximale: ${maxFileSize}MB`
        );
        return false;
      }
      return true;
    },
    [maxFileSize]
  );

  /**
   * Gère la sélection de fichier via input ou drop
   */
  const handleFile = useCallback(
    (file: File) => {
      if (!validateFile(file)) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setLocalPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onImageChange(file);
    },
    [onImageChange, validateFile]
  );

  /**
   * Gère le drop de fichier
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile, disabled]
  );

  /**
   * Gère le drag over
   */
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  /**
   * Gère le drag leave
   */
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  /**
   * Gère la sélection via input
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = "";
  };

  /**
   * Supprime l'image sélectionnée
   */
  const handleRemoveImage = () => {
    setLocalPreview(null);
    onImageChange(null);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-60 pointer-events-none"
        )}
        tabIndex={0}
        aria-disabled={disabled}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() =>
          !disabled && document.getElementById("file-input")?.click()
        }
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            document.getElementById("file-input")?.click();
          }
        }}
        role="button"
      >
        <div className="flex flex-col items-center gap-2">
          <Upload
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="text-sm text-muted-foreground">
            <p>Glissez-déposez une image ici ou</p>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto"
              tabIndex={-1}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("file-input")?.click();
              }}
            >
              cliquez pour sélectionner
            </Button>
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
          disabled={disabled}
          tabIndex={-1}
        />
      </div>

      {localPreview && (
        <div className="relative w-full max-w-xs mx-auto">
          <img
            src={localPreview}
            alt="Aperçu de l'image"
            className="w-full h-40 object-cover rounded-md border"
            style={{ aspectRatio: "4/3" }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-7 w-7"
            aria-label="Supprimer l'image"
            onClick={handleRemoveImage}
            tabIndex={0}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
