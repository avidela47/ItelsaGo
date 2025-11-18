"use client";

import { useEffect, useState, useRef } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

type ImageLightboxProps = {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
};

export default function ImageLightbox({ images, initialIndex = 0, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // Fullscreen API
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    resetZoom();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    resetZoom();
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Pan con mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "rgba(0, 0, 0, 0.95)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header con controles */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(180deg, rgba(0,0,0,0.8), transparent)",
          zIndex: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "#fff" }}>
          {currentIndex + 1} / {images.length}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={handleZoomOut} disabled={zoom <= 1} sx={{ color: "#fff" }}>
            <ZoomOutIcon />
          </IconButton>
          <IconButton onClick={handleZoomIn} disabled={zoom >= 4} sx={{ color: "#fff" }}>
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={toggleFullscreen} sx={{ color: "#fff" }}>
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Imagen principal */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          userSelect: "none",
        }}
        onMouseDown={handleMouseDown}
      >
        <img
          ref={imageRef}
          src={images[currentIndex]}
          alt={`Imagen ${currentIndex + 1}`}
          style={{
            maxWidth: zoom === 1 ? "90vw" : "none",
            maxHeight: zoom === 1 ? "80vh" : "none",
            width: zoom > 1 ? `${zoom * 100}%` : "auto",
            height: "auto",
            objectFit: "contain",
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? "none" : "transform 0.3s ease",
          }}
        />
      </Box>

      {/* Navegación anterior */}
      {images.length > 1 && (
        <IconButton
          onClick={handlePrev}
          sx={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "rgba(0,0,0,0.6)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
            zIndex: 3,
          }}
        >
          <NavigateBeforeIcon fontSize="large" />
        </IconButton>
      )}

      {/* Navegación siguiente */}
      {images.length > 1 && (
        <IconButton
          onClick={handleNext}
          sx={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "rgba(0,0,0,0.6)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
            zIndex: 3,
          }}
        >
          <NavigateNextIcon fontSize="large" />
        </IconButton>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            display: "flex",
            gap: 1,
            justifyContent: "center",
            background: "linear-gradient(0deg, rgba(0,0,0,0.8), transparent)",
            overflowX: "auto",
            zIndex: 2,
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.3)", borderRadius: 3 },
          }}
        >
          {images.map((img, idx) => (
            <Box
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                resetZoom();
              }}
              sx={{
                width: 80,
                height: 60,
                flexShrink: 0,
                cursor: "pointer",
                border: idx === currentIndex ? "3px solid #00d0ff" : "3px solid transparent",
                borderRadius: 1,
                overflow: "hidden",
                transition: "all 0.2s ease",
                opacity: idx === currentIndex ? 1 : 0.6,
                "&:hover": { opacity: 1, transform: "scale(1.05)" },
              }}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
