"use client";

import { cn } from "@ui/lib";
import { useState, type PropsWithChildren } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { IconButton } from "@ui/components/icon-button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface ThreePanelLayoutProps {
	leftPanel: React.ReactNode;
	rightPanel: React.ReactNode;
	className?: string;
	onAIToggle?: (isOpen: boolean) => void;
	initialRightPanelCollapsed?: boolean;
	initialLeftPanelCollapsed?: boolean;
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
		<PanelResizeHandle
			className={cn(
				"w-0 hover:w-0.5 hover:bg-primary/20 transition-all cursor-col-resize",
				"data-[resize-handle-active]:w-1 data-[resize-handle-active]:bg-primary/40",
			)}
		/>
	);
}

function CollapseButton({
	direction,
	isCollapsed,
	onClick,
}: {
	direction: "left" | "right";
	isCollapsed: boolean;
	onClick: () => void;
}) {
	const icon =
		direction === "left" ? (
			isCollapsed ? (
				<ChevronRight />
			) : (
				<ChevronLeft />
			)
		) : isCollapsed ? (
			<ChevronLeft />
		) : (
			<ChevronRight />
		);

	return (
		<div
			className={cn(
				"absolute top-1/2 -translate-y-1/2 z-20",
				direction === "left" ? "-right-3" : "-left-3",
			)}
		>
			<IconButton
				variant="outline"
				size="sm"
				icon={icon}
				onClick={onClick}
				className="bg-background border-2 border-border shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary"
			/>
		</div>
	);
}

function CollapsedRightPanel({ onExpand }: { onExpand: () => void }) {
	return (
		<div className="w-12 bg-muted/50 flex flex-col items-center py-6 space-y-4 shadow-sm">
			{/* AI Icon - Main action to open AI panel */}
			{/* Commented out temporarily */}
			{/* <IconButton
				variant="ghost"
				size="default"
				icon={<Bot />}
				onClick={onExpand}
				title="Open AI Panel"
				className="bg-background hover:bg-primary hover:text-primary-foreground shadow-md"
			/> */}

			{/* Search Icon */}
			<IconButton
				variant="ghost"
				size="default"
				icon={<Search />}
				onClick={onExpand}
				title="Search"
				className="bg-background hover:bg-primary hover:text-primary-foreground shadow-md"
			/>
		</div>
	);
}

function CollapsedLeftPanel({ onExpand }: { onExpand: () => void }) {
	return (
		<div className="w-12 bg-muted/50 flex flex-col items-center py-6 space-y-4 shadow-sm">
			{/* File Panel Icon - Main action to open file panel */}
			<IconButton
				variant="ghost"
				size="default"
				icon={<ChevronRight />}
				onClick={onExpand}
				title="Open File Panel"
				className="bg-background hover:bg-primary hover:text-primary-foreground shadow-md"
			/>

			{/* Quick Search */}
			<IconButton
				variant="ghost"
				size="default"
				icon={<Search />}
				title="Search"
				className="bg-background hover:bg-primary hover:text-primary-foreground shadow-md"
			/>
		</div>
	);
}

export function ThreePanelLayout({
	leftPanel,
	rightPanel,
	children,
	className,
	onAIToggle,
	initialRightPanelCollapsed = false,
	initialLeftPanelCollapsed = false,
}: ThreePanelLayoutProps & PropsWithChildren) {
	const [leftCollapsed, setLeftCollapsed] = useState(initialLeftPanelCollapsed);
	const [rightCollapsed, setRightCollapsed] = useState(
		initialRightPanelCollapsed,
	);

	const toggleRightPanel = (collapsed: boolean) => {
		setRightCollapsed(collapsed);
		onAIToggle?.(!collapsed);
	};

	return (
		<div className={cn("h-screen bg-background", className)}>
			<PanelGroup direction="horizontal">
				{/* Left Panel or Collapsed Left Panel */}
				{leftCollapsed ? (
					<Panel defaultSize={3} minSize={3} maxSize={3}>
						<CollapsedLeftPanel
							onExpand={() => setLeftCollapsed(false)}
						/>
					</Panel>
				) : (
					<>
						<Panel
							defaultSize={22}
							minSize={18}
							maxSize={35}
							className="min-w-[280px] relative overflow-visible"
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

				{/* Editor Panel - Takes remaining space */}
				<Panel
					defaultSize={
						leftCollapsed && rightCollapsed
							? 94
							: leftCollapsed
								? 78
								: rightCollapsed
									? 81
									: 64
					}
					minSize={30}
				>
					<EditorPanel>{children}</EditorPanel>
				</Panel>

				{/* Right Panel or Collapsed Right Panel */}
				{rightCollapsed ? (
					<Panel defaultSize={3} minSize={3} maxSize={3}>
						<CollapsedRightPanel
							onExpand={() => toggleRightPanel(false)}
						/>
					</Panel>
				) : (
					<>
						<ResizeHandle />
						<Panel
							defaultSize={20}
							minSize={15}
							maxSize={30}
							className="min-w-[280px] relative overflow-visible"
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
