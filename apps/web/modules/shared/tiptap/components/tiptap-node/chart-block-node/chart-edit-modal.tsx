import React, { useState, useEffect } from "react";
import type { ChartData } from "./chart-block-node-extension";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Trash2 } from "lucide-react";

interface ChartEditModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: ChartData) => void;
	initialData: ChartData;
	chartType: "bar" | "line" | "pie";
}

// Color palettes
const COLOR_PALETTES = {
	default: {
		name: "Default",
		colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#FF6384", "#C9CBCF"]
	},
	vibrant: {
		name: "Vibrant",
		colors: ["#E74C3C", "#3498DB", "#F39C12", "#2ECC71", "#9B59B6", "#E67E22", "#1ABC9C", "#34495E"]
	},
	pastel: {
		name: "Pastel",
		colors: ["#FFB3BA", "#BFEFFF", "#FFFFBA", "#BFFFBF", "#E6E6FA", "#FFD1DC", "#B5EAD7", "#F0E68C"]
	},
	earth: {
		name: "Earth Tones",
		colors: ["#8B4513", "#CD853F", "#D2691E", "#A0522D", "#DEB887", "#F4A460", "#BC8F8F", "#DAA520"]
	},
	ocean: {
		name: "Ocean Blues",
		colors: ["#006994", "#1E90FF", "#4682B4", "#87CEEB", "#B0E0E6", "#ADD8E6", "#87CEFA", "#00CED1"]
	}
};

// Predefined chart templates
const CHART_TEMPLATES = {
	bar: {
		labels: ["Q1", "Q2", "Q3", "Q4"],
		datasets: [{
			label: "Sales",
			data: [65, 59, 80, 81],
			backgroundColor: COLOR_PALETTES.default.colors.slice(0, 4),
		}]
	},
	line: {
		labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
		datasets: [{
			label: "Revenue",
			data: [12, 19, 3, 5, 2, 3],
			borderColor: COLOR_PALETTES.default.colors[1],
			backgroundColor: `${COLOR_PALETTES.default.colors[1]}33`,
		}]
	},
	pie: {
		labels: ["Desktop", "Mobile", "Tablet"],
		datasets: [{
			label: "Traffic",
			data: [45, 35, 20],
			backgroundColor: COLOR_PALETTES.default.colors.slice(0, 3),
		}]
	}
};

export function ChartEditModal({ open, onOpenChange, onSave, initialData, chartType }: ChartEditModalProps) {
	const [editData, setEditData] = useState<ChartData>(initialData);
	const [activeTab, setActiveTab] = useState<"simple" | "advanced">("simple");
	const [selectedPalette, setSelectedPalette] = useState<keyof typeof COLOR_PALETTES>("default");
	const [chartTitle, setChartTitle] = useState<string>(
		initialData.datasets[0]?.label || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`
	);


	useEffect(() => {
		setEditData(initialData);
		setChartTitle(initialData.datasets[0]?.label || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`);
	}, [initialData, chartType]);

	const handleSave = () => {
		// Update the chart title in the first dataset
		const updatedData = { ...editData };
		if (updatedData.datasets[0]) {
			updatedData.datasets[0].label = chartTitle;
		}
		onSave(updatedData);
		onOpenChange(false);
	};

	const handleCancel = () => {
		setEditData(initialData);
		setChartTitle(initialData.datasets[0]?.label || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`);
		onOpenChange(false);
	};

	const handleUseTemplate = () => {
		setEditData(CHART_TEMPLATES[chartType]);
	};

	const handleApplyPalette = (paletteKey: keyof typeof COLOR_PALETTES) => {
		setSelectedPalette(paletteKey);
		const palette = COLOR_PALETTES[paletteKey];
		const newData = { ...editData };
		
		newData.datasets = newData.datasets.map(dataset => ({
			...dataset,
			backgroundColor: chartType === "line" 
				? `${palette.colors[0]}33` // For line charts, use transparent background
				: palette.colors.slice(0, newData.labels.length),
			borderColor: chartType === "line" 
				? palette.colors[0] // For line charts, use solid border color
				: dataset.borderColor
		}));
		
		setEditData(newData);
	};

	const updateLabel = (index: number, value: string) => {
		const newData = { ...editData };
		newData.labels[index] = value;
		setEditData(newData);
	};

	const updateDataValue = (datasetIndex: number, valueIndex: number, value: number) => {
		const newData = { ...editData };
		newData.datasets[datasetIndex].data[valueIndex] = value;
		setEditData(newData);
	};

	const addDataPoint = () => {
		const newData = { ...editData };
		newData.labels.push(`Item ${newData.labels.length + 1}`);
		newData.datasets.forEach(dataset => {
			dataset.data.push(0);
		});
		setEditData(newData);
	};

	const removeDataPoint = (index: number) => {
		const newData = { ...editData };
		newData.labels.splice(index, 1);
		newData.datasets.forEach(dataset => {
			dataset.data.splice(index, 1);
		});
		setEditData(newData);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle>
						Edit {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
					</DialogTitle>
				</DialogHeader>

				<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "simple" | "advanced")} className="flex-1 flex flex-col min-h-0">
					<TabsList className="grid w-full grid-cols-2 flex-shrink-0">
						<TabsTrigger value="simple">Simple Edit</TabsTrigger>
						<TabsTrigger value="advanced">Advanced</TabsTrigger>
					</TabsList>

					<TabsContent value="simple" className="flex-1 overflow-y-auto space-y-4 mt-0 pr-2">
						<div className="template-section">
							<Button 
								onClick={handleUseTemplate} 
								variant="outline"
								size="sm"
								className="w-full"
							>
								Use {chartType} Template
							</Button>
						</div>

						<div className="chart-title-section space-y-1.5">
							<h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Chart Title</h4>
							<Input
								type="text"
								value={chartTitle}
								onChange={(e) => setChartTitle(e.target.value)}
								placeholder="Enter chart title"
								className="text-sm"
							/>
						</div>

						<div className="color-palette-section space-y-2">
							<h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Color Palettes</h4>
							<div className="grid grid-cols-3 gap-2">
								{Object.entries(COLOR_PALETTES).map(([key, palette]) => (
									<div 
										key={key}
										className={`
											p-2 border rounded-md cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm 
											${selectedPalette === key ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-card'}
										`}
										onClick={() => handleApplyPalette(key as keyof typeof COLOR_PALETTES)}
									>
										<div className="flex justify-center gap-0.5 mb-1.5">
											{palette.colors.slice(0, 4).map((color, index) => (
												<div 
													key={index}
													className="w-3 h-3 rounded-full border border-border/20"
													style={{ backgroundColor: color }}
												/>
											))}
										</div>
										<span className="text-[10px] font-medium text-center text-muted-foreground block">{palette.name}</span>
									</div>
								))}
							</div>
						</div>

						<div className="data-editor space-y-3">
							<h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Chart Data</h4>
							<div className="grid grid-cols-12 gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
								<span className="col-span-5">X-Axis Labels</span>
								<span className="col-span-5">Y-Axis Values</span>
								<span className="col-span-2 text-center">Del</span>
							</div>
							<div className="space-y-1.5">
								{editData.labels.map((label, labelIndex) => (
									<div key={labelIndex} className="grid grid-cols-12 gap-2 items-center">
										<Input
											className="col-span-5 text-sm h-8"
											type="text"
											value={label}
											onChange={(e) => updateLabel(labelIndex, e.target.value)}
											placeholder="X-axis label"
										/>
										{editData.datasets.map((dataset, datasetIndex) => (
											<Input
												key={datasetIndex}
												className="col-span-5 text-sm h-8"
												type="number"
												value={dataset.data[labelIndex] || 0}
												onChange={(e) => updateDataValue(datasetIndex, labelIndex, parseFloat(e.target.value) || 0)}
												placeholder="Y-axis value"
											/>
										))}
										{editData.labels.length > 1 && (
											<Button 
												variant="destructive"
												size="sm"
												className="col-span-2 h-8 w-8 p-0"
												onClick={() => removeDataPoint(labelIndex)}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										)}
									</div>
								))}
							</div>
							<Button onClick={addDataPoint} variant="outline" size="sm" className="w-full">
								Add Data Point
							</Button>
						</div>
					</TabsContent>
					
					<TabsContent value="advanced" className="flex-1 overflow-y-auto space-y-3 mt-0 pr-2">
						<div className="advanced-editor space-y-3">
							<h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">JSON Data</h4>
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
								className="w-full p-2 border border-border rounded-md font-mono text-xs bg-muted/30 text-foreground resize-none"
								rows={10}
								placeholder="Chart data in JSON format"
							/>
						</div>
					</TabsContent>
				</Tabs>

				<DialogFooter className="gap-2 flex-shrink-0 mt-4">
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button onClick={handleSave}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}