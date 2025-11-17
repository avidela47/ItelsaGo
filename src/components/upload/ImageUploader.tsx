"use client";

import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

type UploadedImage = {
  file: File;
  preview: string;
  uploaded: boolean;
  url?: string;
  error?: string;
};

type Props = {
  value: string[]; // URLs de imágenes ya subidas
  onChange: (urls: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
};

export default function ImageUploader({ value, onChange, maxImages = 18, maxSizeMB = 5 }: Props) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validar archivo
  const validateFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    
    if (!validTypes.includes(file.type)) {
      return "Solo se permiten imágenes JPG, PNG o WebP";
    }
    
    const maxSize = maxSizeMB * 1024 * 1024; // Convertir MB a bytes
    if (file.size > maxSize) {
      return `La imagen no puede pesar más de ${maxSizeMB}MB`;
    }
    
    return null;
  };

  // Manejar archivos seleccionados
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setError(null);
    const newImages: UploadedImage[] = [];
    const currentTotal = value.length + images.length;
    
    // Validar cantidad máxima
    if (currentTotal + files.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }
    
    // Procesar cada archivo
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        continue;
      }
      
      // Crear preview
      const preview = URL.createObjectURL(file);
      newImages.push({
        file,
        preview,
        uploaded: false,
      });
    }
    
    setImages(prev => [...prev, ...newImages]);
  }, [value, images, maxImages, maxSizeMB]);

  // Upload de imágenes al servidor (múltiples a la vez)
  const uploadImages = async () => {
    setUploading(true);
    setError(null);
    
    const toUpload = images.filter(img => !img.uploaded);
    
    try {
      const formData = new FormData();
      
      // Agregar todos los archivos al FormData
      toUpload.forEach(image => {
        formData.append("files", image.file);
      });
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Error al subir imágenes");
      }
      
      // Marcar todas como subidas
      setImages(prev =>
        prev.map((img, i) => {
          if (!img.uploaded && data.urls && data.urls[i]) {
            return { ...img, uploaded: true, url: data.urls[i] };
          }
          return img;
        })
      );
      
      // Agregar URLs a las existentes
      onChange([...value, ...(data.urls || [])]);
      
    } catch (err: any) {
      setError(err.message);
      
      // Marcar todas con error
      setImages(prev =>
        prev.map(img =>
          !img.uploaded ? { ...img, error: err.message } : img
        )
      );
    }
    
    setUploading(false);
  };

  // Eliminar imagen antes de subir
  const removeImage = (index: number) => {
    const image = images[index];
    URL.revokeObjectURL(image.preview);
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Eliminar imagen ya subida
  const removeUploadedImage = (url: string) => {
    onChange(value.filter(u => u !== url));
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        📷 Imágenes del inmueble
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Zona de drag & drop */}
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: "2px dashed",
          borderColor: dragActive ? "primary.main" : "rgba(255,255,255,.2)",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          bgcolor: dragActive ? "rgba(0,208,132,.05)" : "rgba(255,255,255,.02)",
          cursor: "pointer",
          transition: "all 0.2s",
          mb: 2,
        }}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleChange}
          style={{ display: "none" }}
          id="image-upload-input"
        />
        
        <label htmlFor="image-upload-input" style={{ cursor: "pointer", display: "block" }}>
          <CloudUploadIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
          <Typography variant="body1" sx={{ mb: 0.5 }}>
            Arrastrá las imágenes acá o hacé clic para seleccionar
          </Typography>
          <Typography variant="caption" color="text.secondary">
            JPG, PNG o WebP • Máximo {maxSizeMB}MB por imagen • Hasta {maxImages} imágenes
          </Typography>
        </label>
      </Box>

      {/* Preview de imágenes a subir */}
      {images.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
            Imágenes para subir ({images.length})
          </Typography>
          
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 1, mb: 2 }}>
            {images.map((image, index) => (
              <Box
                key={index}
                sx={{
                  position: "relative",
                  paddingTop: "75%",
                  borderRadius: 1,
                  overflow: "hidden",
                  border: image.error ? "2px solid #f44336" : "1px solid rgba(255,255,255,.1)",
                }}
              >
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {!image.uploaded && !image.error && (
                  <IconButton
                    size="small"
                    onClick={() => removeImage(index)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0,0,0,.6)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(0,0,0,.8)" },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
                {image.uploaded && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 4,
                      left: 4,
                      bgcolor: "#4caf50",
                      color: "white",
                      px: 0.5,
                      py: 0.25,
                      borderRadius: 0.5,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    ✓ Subida
                  </Box>
                )}
                {image.error && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(244,67,54,.8)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 1,
                      fontSize: 10,
                      textAlign: "center",
                    }}
                  >
                    {image.error}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
          
          {images.some(img => !img.uploaded) && (
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={uploadImages}
              disabled={uploading}
              fullWidth
            >
              {uploading ? "Subiendo imágenes..." : `Subir ${images.filter(img => !img.uploaded).length} imagen(es)`}
            </Button>
          )}
          
          {uploading && <LinearProgress sx={{ mt: 1 }} />}
        </Box>
      )}

      {/* Imágenes ya subidas */}
      {value.length > 0 && (
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
            Imágenes subidas ({value.length})
          </Typography>
          
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 1 }}>
            {value.map((url, index) => (
              <Box
                key={url}
                sx={{
                  position: "relative",
                  paddingTop: "75%",
                  borderRadius: 1,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,.1)",
                }}
              >
                <img
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeUploadedImage(url)}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "rgba(0,0,0,.6)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(0,0,0,.8)" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            
            {/* Botón para agregar más */}
            {value.length < maxImages && (
              <label htmlFor="image-upload-input">
                <Box
                  sx={{
                    paddingTop: "75%",
                    position: "relative",
                    border: "2px dashed rgba(255,255,255,.2)",
                    borderRadius: 1,
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "rgba(0,208,132,.05)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AddPhotoAlternateIcon sx={{ fontSize: 32, opacity: 0.5, mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      Agregar
                    </Typography>
                  </Box>
                </Box>
              </label>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
