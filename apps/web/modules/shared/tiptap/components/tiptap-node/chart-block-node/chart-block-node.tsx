"use client";

import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import type { ChartData } from "./chart-block-node-extension";
import { ChartEditModal } from "./chart-edit-modal";

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
	Legend,
);

export const ChartBlockNode: React.FC<NodeViewProps> = ({
	node,
	updateAttributes,
	selected,
}) => {
	const {
		chartType,
		data,
		width,
		height,
		isEditing: attrIsEditing,
	} = node.attrs as {
		chartType: "bar" | "line" | "pie";
		data: ChartData;
		width: number;
		height: number;
		isEditing?: boolean;
	};
	const [isEditing, setIsEditing] = useState(attrIsEditing || false);
	const [editData, setEditData] = useState<ChartData>(data);

	useEffect(() => {
		setEditData(data);
	}, [data]);

	// Sync with attribute changes
	useEffect(() => {
		setIsEditing(attrIsEditing || false);
	}, [attrIsEditing]);

	const handleSave = (newData: ChartData) => {
		updateAttributes({ data: newData, isEditing: false });
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditData(data);
		setIsEditing(false);
		updateAttributes({ isEditing: false });
	};

	// Resize functionality
	const handleResize = (e: React.MouseEvent, direction: "se" | "s" | "e") => {
		e.preventDefault();
		e.stopPropagation();

		const startX = e.clientX;
		const startY = e.clientY;
		const startWidth = width;
		const startHeight = height;

		const handleMouseMove = (e: MouseEvent) => {
			let newWidth = startWidth;
			let newHeight = startHeight;

			if (direction === "se" || direction === "e") {
				newWidth = Math.max(300, startWidth + (e.clientX - startX));
			}
			if (direction === "se" || direction === "s") {
				newHeight = Math.max(200, startHeight + (e.clientY - startY));
			}

			updateAttributes({ width: newWidth, height: newHeight });
		};

		const handleMouseUp = () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const renderChart = () => {
		const isDark =
			document.documentElement.classList.contains("dark") ||
			document.documentElement.getAttribute("data-theme") === "dark" ||
			window.matchMedia("(prefers-color-scheme: dark)").matches;

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

		// Ensure line borders are visible in dark mode
		const themedData = {
			...editData,
			datasets: editData.datasets.map((dataset) => {
				if (chartType === "line") {
					return {
						...dataset,
						borderColor:
							dataset.borderColor ||
							(isDark ? "#d1d5db" : "#374151"),
						borderWidth: dataset.borderWidth || 1,
						pointRadius: dataset?.pointRadius || 6,
						pointHoverRadius: dataset.pointHoverRadius || 8,
					};
				}
				return dataset;
			}),
		};

		const commonProps = {
			data: themedData,
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
			className={`chart-block ${selected ? "ProseMirror-selectednode" : ""}`}
		>
			<div
				className="chart-container"
				style={{ width: `${width}px`, height: `${height}px` }}
			>
				{renderChart()}

				{/* Resize handles */}
				<button
					type="button"
					className="resize-handle resize-handle-se"
					onMouseDown={(e) => handleResize(e, "se")}
					aria-label="Resize chart diagonally"
				/>
				<button
					type="button"
					className="resize-handle resize-handle-s"
					onMouseDown={(e) => handleResize(e, "s")}
					aria-label="Resize chart vertically"
				/>
				<button
					type="button"
					className="resize-handle resize-handle-e"
					onMouseDown={(e) => handleResize(e, "e")}
					aria-label="Resize chart horizontally"
				/>
			</div>

			{!data.labels.length && (
				<div className="chart-placeholder">
					<p>📊 Select this chart to add data</p>
				</div>
			)}

			{/* Edit Modal */}
			<ChartEditModal
				open={isEditing}
				onOpenChange={(open) => {
					if (!open) {
						handleCancel();
					}
				}}
				onSave={handleSave}
				initialData={editData}
				chartType={chartType}
			/>

			<style jsx>{`
        .chart-block {
          margin: 1rem 0;
        }
        
        .chart-block.ProseMirror-selectednode .chart-container {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        .chart-container {
          position: relative;
          display: inline-block;
          min-width: 300px;
          min-height: 200px;
          border-radius: 6px;
          border: 1px solid #f3f4f6;
          overflow: hidden;
        }
        
        :global(.dark) .chart-container {
          border-color: #4b5563;
        }
        
        .resize-handle {
          position: absolute;
          background: #3b82f6;
          border: 1px solid #2563eb;
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.2s;
          padding: 0;
          outline: none;
        }
        
        .resize-handle:focus {
          opacity: 1;
          outline: 2px solid #3b82f6;
          outline-offset: 1px;
        }
        
        .chart-container:hover .resize-handle,
        .chart-block.ProseMirror-selectednode .resize-handle {
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
        
        .chart-placeholder {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: var(--text-muted, #6b7280);
          font-size: 0.875rem;
          pointer-events: none;
        }
        
        :global(.dark) .chart-placeholder {
          color: #9ca3af;
        }
        
        .chart-placeholder p {
          margin: 0;
        }
      `}</style>
		</NodeViewWrapper>
	);
};
