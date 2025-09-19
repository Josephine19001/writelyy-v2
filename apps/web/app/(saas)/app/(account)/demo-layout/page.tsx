import { NewAppWrapper } from "@saas/shared/components/NewAppWrapper";

export default function DemoLayoutPage() {
	return (
		<NewAppWrapper>
			<div className="p-8">
				<h1 className="text-2xl font-bold mb-4">Demo 3-Panel Layout</h1>
				<p className="text-muted-foreground mb-6">
					This is a demonstration of the new VSCode-inspired 3-panel layout with:
				</p>
				<ul className="space-y-2 text-sm">
					<li className="flex items-center gap-2">
						<span className="w-2 h-2 bg-blue-500 rounded-full" />
						<strong>Left Panel:</strong> File explorer with workspace dropdown, documents tree, sources, and assets
					</li>
					<li className="flex items-center gap-2">
						<span className="w-2 h-2 bg-green-500 rounded-full" />
						<strong>Middle Panel:</strong> Notion-inspired block editor with toolbar (placeholder)
					</li>
					<li className="flex items-center gap-2">
						<span className="w-2 h-2 bg-purple-500 rounded-full" />
						<strong>Right Panel:</strong> AI assistant with chat, analysis, and quick actions
					</li>
				</ul>
				<div className="mt-6 p-4 bg-muted rounded-lg">
					<h3 className="font-medium mb-2">Features:</h3>
					<ul className="text-sm space-y-1 text-muted-foreground">
						<li>• Resizable panels with proper constraints</li>
						<li>• Clean, modern design with proper theming</li>
						<li>• Responsive layout that works on different screen sizes</li>
						<li>• Ready for TipTap editor integration</li>
						<li>• AI-first functionality in the right panel</li>
					</ul>
				</div>
			</div>
		</NewAppWrapper>
	);
}