"use client";

import React, { useState, useEffect } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import type { ChartData } from "./chart-block-node-extension";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const ChartBlockNode: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const { chartType, data, width, height } = node.attrs as {
    chartType: "bar" | "line" | "pie";
    data: ChartData;
    width: number;
    height: number;
  };
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ChartData>(data);

  useEffect(() => {
    setEditData(data);
  }, [data]);

  const handleSave = () => {
    updateAttributes({ data: editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(data);
    setIsEditing(false);
  };

  const renderChart = () => {
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: true,
          text: editData.datasets[0]?.label || "Chart",
        },
      },
    };

    const commonProps = {
      data: editData,
      options: chartOptions,
      width,
      height,
    };

    switch (chartType) {
      case "line":
        return <Line {...commonProps} />;
      case "pie":
        return <Pie {...commonProps} />;
      case "bar":
      default:
        return <Bar {...commonProps} />;
    }
  };

  return (
    <NodeViewWrapper
      className={`chart-block-wrapper ${selected ? "ProseMirror-selectednode" : ""}`}
      style={{ width: `${width}px`, minHeight: `${height}px` }}
    >
      <div className="chart-block">
        {isEditing ? (
          <div className="chart-editor">
            <div className="chart-controls">
              <select
                value={chartType}
                onChange={(e) =>
                  updateAttributes({ chartType: e.target.value as "bar" | "line" | "pie" })
                }
                className="chart-type-select"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
              
              <div className="chart-data-editor">
                <textarea
                  value={JSON.stringify(editData, null, 2)}
                  onChange={(e) => {
                    try {
                      const newData = JSON.parse(e.target.value);
                      setEditData(newData);
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                  className="chart-data-input"
                  rows={8}
                  placeholder="Chart data in JSON format"
                />
              </div>
              
              <div className="chart-actions">
                <button onClick={handleSave} className="save-btn">
                  Save
                </button>
                <button onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="chart-display">
            <div className="chart-container" style={{ width, height }}>
              {renderChart()}
            </div>
            {selected && (
              <div className="chart-toolbar">
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-chart-btn"
                >
                  Edit Chart
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .chart-block-wrapper {
          margin: 1rem 0;
          border: 2px solid transparent;
          border-radius: 8px;
          padding: 1rem;
        }
        
        .chart-block-wrapper.ProseMirror-selectednode {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }
        
        .chart-container {
          position: relative;
        }
        
        .chart-editor {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 1rem;
          background: #f9fafb;
        }
        
        .chart-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .chart-type-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          max-width: 200px;
        }
        
        .chart-data-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.875rem;
        }
        
        .chart-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .save-btn, .cancel-btn, .edit-chart-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .save-btn {
          background: #3b82f6;
          color: white;
        }
        
        .cancel-btn {
          background: #6b7280;
          color: white;
        }
        
        .edit-chart-btn {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }
        
        .chart-toolbar {
          margin-top: 0.5rem;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </NodeViewWrapper>
  );
};