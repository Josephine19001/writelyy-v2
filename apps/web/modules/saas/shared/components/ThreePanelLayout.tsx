"use client";

import { cn } from "@ui/lib";
import { useState, type PropsWithChildren } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "@ui/components/button";
import { ChevronLeft, ChevronRight, Search, Bot } from "lucide-react";

interface ThreePanelLayoutProps {
	leftPanel: React.ReactNode;
	rightPanel: React.ReactNode;
	className?: string;
	onAIToggle?: (isOpen: boolean) => void;
	initialRightPanelCollapsed?: boolean;
}

interface PanelProps extends PropsWithChildren {
	className?: string;
}

function LeftPanel({ children, className }: PanelProps) {
	return (
		<div className={cn("flex flex-col h-full bg-background", className)}>
			{children}
		</div>
	);
}

function EditorPanel({ children, className }: PanelProps) {
	return (
		<div className={cn("flex flex-col h-full bg-card", className)}>
			{children}
		</div>
	);
}

function RightPanel({ children, className }: PanelProps) {
	return (
		<div className={cn("flex flex-col h-full bg-background", className)}>
			{children}
		</div>
	);
}

function ResizeHandle() {
	return (
		<PanelResizeHandle className={cn(
			"w-0 hover:w-0.5 hover:bg-primary/20 transition-all cursor-col-resize",
			"data-[resize-handle-active]:w-1 data-[resize-handle-active]:bg-primary/40"
		)} />
	);
}

function CollapseButton({ 
	direction, 
	isCollapsed, 
	onClick 
}: { 
	direction: "left" | "right"; 
	isCollapsed: boolean; 
	onClick: () => void; 
}) {
	return (
		<Button
			variant="outline"
			size="sm"
			className={cn(
				"absolute top-1/2 -translate-y-1/2 z-20 h-10 w-8 p-0 bg-background border-2 border-border shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary",
				direction === "left" ? "-right-4" : "-left-4"
			)}
			onClick={onClick}
		>
			{direction === "left" ? (
				isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />
			) : (
				isCollapsed ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />
			)}
		</Button>
	);
}

function CollapsedRightPanel({ onExpand }: { onExpand: () => void }) {
	return (
		<div className="w-12 bg-muted/50 flex flex-col items-center py-6 space-y-4 shadow-sm">
			{/* AI Icon - Main action to open AI panel */}
			<Button
				variant="ghost"
				size="sm"
				className="h-10 w-10 p-0 bg-background hover:bg-primary hover:text-primary-foreground shadow-md border-0"
				onClick={onExpand}
				title="Open AI Panel"
			>
				<Bot className="h-5 w-5" />
			</Button>

			{/* Search Icon */}
			<Button
				variant="ghost"
				size="sm"
				className="h-10 w-10 p-0 bg-background hover:bg-primary hover:text-primary-foreground shadow-md border-0"
				title="Search"
			>
				<Search className="h-5 w-5" />
			</Button>
		</div>
	);
}

function CollapsedLeftPanel({ onExpand }: { onExpand: () => void }) {
	return (
		<div className="w-12 bg-muted/50 flex flex-col items-center py-6 space-y-4 shadow-sm">
			{/* File Panel Icon - Main action to open file panel */}
			<Button
				variant="ghost"
				size="sm"
				className="h-10 w-10 p-0 bg-background hover:bg-primary hover:text-primary-foreground shadow-md border-0"
				onClick={onExpand}
				title="Open File Panel"
			>
				<ChevronRight className="h-5 w-5" />
			</Button>
			
			{/* Quick Search */}
			<Button
				variant="ghost"
				size="sm"
				className="h-10 w-10 p-0 bg-background hover:bg-primary hover:text-primary-foreground shadow-md border-0"
				title="Search"
			>
				<Search className="h-5 w-5" />
			</Button>
		</div>
	);
}

export function ThreePanelLayout({ 
	leftPanel, 
	rightPanel, 
	children, 
	className,
	onAIToggle,
	initialRightPanelCollapsed = false
}: ThreePanelLayoutProps & PropsWithChildren) {
	const [leftCollapsed, setLeftCollapsed] = useState(false);
	const [rightCollapsed, setRightCollapsed] = useState(initialRightPanelCollapsed);

	const toggleRightPanel = (collapsed: boolean) => {
		setRightCollapsed(collapsed);
		onAIToggle?.(!collapsed);
	};

	return (
		<div className={cn("h-screen bg-background", className)}>
			<PanelGroup direction="horizontal">
				{/* Left Panel */}
				{!leftCollapsed && (
					<>
						<Panel 
							defaultSize={20} 
							minSize={15} 
							maxSize={30}
							className="min-w-[200px] relative overflow-visible"
						>
							<div className="relative h-full overflow-visible">
								<LeftPanel>{leftPanel}</LeftPanel>
								<CollapseButton 
									direction="left"
									isCollapsed={leftCollapsed}
									onClick={() => setLeftCollapsed(true)}
								/>
							</div>
						</Panel>
						<ResizeHandle />
					</>
				)}

				{/* Collapsed Left Panel */}
				{leftCollapsed && (
					<Panel defaultSize={3} minSize={3} maxSize={3}>
						<CollapsedLeftPanel onExpand={() => setLeftCollapsed(false)} />
					</Panel>
				)}

				{/* Editor Panel - Takes remaining space */}
				<Panel 
					defaultSize={
						leftCollapsed && rightCollapsed ? 94 : 
						leftCollapsed ? 72 : 
						rightCollapsed ? 72 : 55
					} 
					minSize={30}
				>
					<EditorPanel>{children}</EditorPanel>
				</Panel>

				{/* Collapsed Right Panel */}
				{rightCollapsed && (
					<Panel defaultSize={3} minSize={3} maxSize={3}>
						<CollapsedRightPanel onExpand={() => toggleRightPanel(false)} />
					</Panel>
				)}

				{/* Right Panel */}
				{!rightCollapsed && (
					<>
						<ResizeHandle />
						<Panel 
							defaultSize={25} 
							minSize={20} 
							maxSize={35}
							className="min-w-[300px] relative overflow-visible"
						>
							<div className="relative h-full overflow-visible">
								<RightPanel>{rightPanel}</RightPanel>
								<CollapseButton 
									direction="right"
									isCollapsed={rightCollapsed}
									onClick={() => toggleRightPanel(true)}
								/>
							</div>
						</Panel>
					</>
				)}
			</PanelGroup>
		</div>
	);
}

// Export individual panel components for composition
ThreePanelLayout.LeftPanel = LeftPanel;
ThreePanelLayout.EditorPanel = EditorPanel;
ThreePanelLayout.RightPanel = RightPanel;