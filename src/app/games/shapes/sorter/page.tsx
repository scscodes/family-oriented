"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { shapeStyles } from "../styles";
import { Circle, Square, ChangeHistory, Star } from "@mui/icons-material";
import ResponsiveOptionGrid from "@/shared/components/layout/ResponsiveOptionGrid";

const SHAPES = [
  { name: "circle", icon: <Circle sx={{ fontSize: 60 }} /> },
  { name: "square", icon: <Square sx={{ fontSize: 60 }} /> },
  { name: "triangle", icon: <ChangeHistory sx={{ fontSize: 60 }} /> },
  { name: "star", icon: <Star sx={{ fontSize: 60 }} /> },
];

function shuffle<T>(array: T[]): T[] {
  return array.sort(() => 0.5 - Math.random());
}

export default function ShapeSorterGame() {
  const [mounted, setMounted] = useState(false);
  const [placed, setPlaced] = useState<{ [key: string]: boolean }>({});
  const [shapes, setShapes] = useState(() => shuffle([...SHAPES]));
  const [complete, setComplete] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleDrop = (shapeName: string) => {
    setPlaced((prev) => {
      const updated = { ...prev, [shapeName]: true };
      if (Object.keys(updated).length === SHAPES.length) {
        setComplete(true);
      }
      return updated;
    });
  };

  const handleReset = () => {
    setPlaced({});
    setShapes(shuffle([...SHAPES]));
    setComplete(false);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Shape Sorter
      </Typography>
      <Typography align="center" color="text.secondary" mb={3}>
        Drag each shape into its matching outline!
      </Typography>
      <ResponsiveOptionGrid count={shapes.length} sx={{ mb: 4 }}>
        {shapes.map((shape) => (
          <Paper
            key={shape.name}
            elevation={3}
            sx={{
              p: 2,
              textAlign: "center",
              opacity: placed[shape.name] ? 0.3 : 1,
              cursor: placed[shape.name] ? "default" : "grab",
              transition: "opacity 0.3s",
              ...shapeStyles[shape.name],
            }}
            draggable={!placed[shape.name]}
            onDragStart={(e) => {
              e.dataTransfer.setData("shape", shape.name);
            }}
          >
            {shape.icon}
          </Paper>
        ))}
      </ResponsiveOptionGrid>
      <ResponsiveOptionGrid count={SHAPES.length} sx={{ mb: 4 }}>
        {SHAPES.map((shape) => (
          <Paper
            key={shape.name}
            elevation={2}
            sx={{
              p: 2,
              minHeight: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: placed[shape.name] ? "2px solid #2ec4b6" : "2px dashed #ccc",
              background: placed[shape.name] ? "#e0f7fa" : "#fafbfc",
              transition: "background 0.3s, border 0.3s",
              ...shapeStyles[shape.name],
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const dropped = e.dataTransfer.getData("shape");
              if (dropped === shape.name && !placed[shape.name]) {
                handleDrop(shape.name);
              }
            }}
          >
            {shape.icon}
          </Paper>
        ))}
      </ResponsiveOptionGrid>
      {complete && (
        <Box textAlign="center" mt={3}>
          <Typography variant="h5" color="success.main" gutterBottom>
            Great job! All shapes sorted!
          </Typography>
          <Button variant="contained" onClick={handleReset} sx={{ mt: 2 }}>
            Play Again
          </Button>
        </Box>
      )}
    </Box>
  );
} 