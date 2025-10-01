import { ChartBlockNode as ChartBlockNodeComponent } from "@shared/tiptap/components/tiptap-node/chart-block-node/chart-block-node";
import type { NodeType } from "@tiptap/pm/model";
import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react";

export interface ChartData {
	labels: string[];
	datasets: Array<{
		label: string;
		data: number[];
		backgroundColor?: string[];
		borderColor?: string[];
		borderWidth?: number;
	}>;
}

export interface ChartBlockNodeOptions {
	type?: string | NodeType | undefined;
	HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/react" {
	interface Commands<ReturnType> {
		chartBlock: {
			setChartBlock: (options?: {
				chartType?: "bar" | "line" | "pie";
				data?: ChartData;
				width?: number;
				height?: number;
			}) => ReturnType;
		};
	}
}

/**
 * A Tiptap node extension that creates a chart block component.
 */
export const ChartBlockNode = Node.create<ChartBlockNodeOptions>({
	name: "chartBlock",

	group: "block",

	draggable: true,

	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes() {
		return {
			chartType: {
				default: "bar",
				parseHTML: (element) => element.getAttribute("data-chart-type"),
				renderHTML: (attributes) => ({
					"data-chart-type": attributes.chartType,
				}),
			},
			data: {
				default: {
					labels: ["Sample 1", "Sample 2", "Sample 3"],
					datasets: [
						{
							label: "Sample Data",
							data: [10, 20, 30],
							backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
						},
					],
				},
				parseHTML: (element) => {
					const dataStr = element.getAttribute("data-chart-data");
					return dataStr ? JSON.parse(dataStr) : null;
				},
				renderHTML: (attributes) => ({
					"data-chart-data": JSON.stringify(attributes.data),
				}),
			},
			width: {
				default: 400,
				parseHTML: (element) =>
					Number.parseInt(
						element.getAttribute("data-width") || "400",
					),
				renderHTML: (attributes) => ({
					"data-width": attributes.width.toString(),
				}),
			},
			height: {
				default: 300,
				parseHTML: (element) =>
					Number.parseInt(
						element.getAttribute("data-height") || "300",
					),
				renderHTML: (attributes) => ({
					"data-height": attributes.height.toString(),
				}),
			},
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="chart-block"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(
				{ "data-type": "chart-block" },
				this.options.HTMLAttributes,
				HTMLAttributes,
			),
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(ChartBlockNodeComponent);
	},

	addCommands() {
		return {
			setChartBlock:
				(options = {}) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: {
							chartType: options.chartType || "bar",
							data: options.data || {
								labels: ["Sample 1", "Sample 2", "Sample 3"],
								datasets: [
									{
										label: "Sample Data",
										data: [10, 20, 30],
										backgroundColor: [
											"#FF6384",
											"#36A2EB",
											"#FFCE56",
										],
									},
								],
							},
							width: options.width || 400,
							height: options.height || 300,
						},
					});
				},
		};
	},
});

export default ChartBlockNode;
