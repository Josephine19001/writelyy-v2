"use client";

import React, { useRef, useEffect, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export const DrawingBlockNode: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { width, height, drawingData, isDrawingMode: attrDrawingMode } = node.attrs as {
    width: number;
    height: number;
    drawingData: string | null;
    isDrawingMode?: boolean;
  };
  const [isDrawingMode, setIsDrawingMode] = useState(attrDrawingMode || false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Load existing drawing data
    if (drawingData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = drawingData;
    } else {
      // Clear canvas with white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
    }
  }, [width, height, drawingData]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Save the drawing
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      updateAttributes({ drawingData: dataURL });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    updateAttributes({ drawingData: null });
  };

  const toggleDrawingMode = () => {
    const newMode = !isDrawingMode;
    setIsDrawingMode(newMode);
    updateAttributes({ isDrawingMode: newMode });
  };

  // Sync with attribute changes
  useEffect(() => {
    setIsDrawingMode(attrDrawingMode || false);
  }, [attrDrawingMode]);

  // Resize functionality
  const handleResize = (e: React.MouseEvent, direction: 'se' | 's' | 'e') => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction === 'se' || direction === 'e') {
        newWidth = Math.max(200, startWidth + (e.clientX - startX));
      }
      if (direction === 'se' || direction === 's') {
        newHeight = Math.max(150, startHeight + (e.clientY - startY));
      }

      updateAttributes({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <NodeViewWrapper
      className={`drawing-block ${selected ? "ProseMirror-selectednode" : ""}`}
    >
      <div className="canvas-container" style={{ width: `${width}px`, height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            cursor: isDrawingMode ? "crosshair" : "default",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
        
        {/* Resize handles */}
        <div className="resize-handle resize-handle-se" onMouseDown={(e) => handleResize(e, 'se')} />
        <div className="resize-handle resize-handle-s" onMouseDown={(e) => handleResize(e, 's')} />
        <div className="resize-handle resize-handle-e" onMouseDown={(e) => handleResize(e, 'e')} />
      </div>
      
      {!drawingData && !isDrawingMode && (
        <div className="drawing-placeholder">
          <p>🎨 Select this drawing area to start sketching</p>
        </div>
      )}

      <style jsx>{`
        .drawing-block {
          margin: 1rem 0;
        }
        
        .drawing-block.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 8px;
        }
        
        .canvas-container {
          position: relative;
          display: inline-block;
          min-width: 200px;
          min-height: 150px;
        }
        
        .resize-handle {
          position: absolute;
          background: #3b82f6;
          border: 1px solid #2563eb;
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .canvas-container:hover .resize-handle,
        .drawing-block.ProseMirror-selectednode .resize-handle {
          opacity: 1;
        }
        
        .resize-handle-se {
          bottom: -4px;
          right: -4px;
          width: 8px;
          height: 8px;
          cursor: se-resize;
        }
        
        .resize-handle-s {
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          cursor: s-resize;
        }
        
        .resize-handle-e {
          right: -4px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          cursor: e-resize;
        }
        
        .drawing-placeholder {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
          pointer-events: none;
        }
        
        .drawing-placeholder p {
          margin: 0;
        }
      `}</style>
    </NodeViewWrapper>
  );
};