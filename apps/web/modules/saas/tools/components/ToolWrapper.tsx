"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@ui/components/textarea";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import { InfoIcon } from "lucide-react";

interface TrialData {
	content: string;
	product: string;
	timestamp: number;
	wordCount: number;
}

interface ToolWrapperProps {
	productKey: string;
	children?: React.ReactNode;
}

export function ToolWrapper({ productKey, children }: ToolWrapperProps) {
	const [trialContent, setTrialContent] = useState<string>("");
	const [isFromTrial, setIsFromTrial] = useState(false);

	useEffect(() => {
		// Check if user came from trial
		const trialDataStr = localStorage.getItem("writelyy_trial_data");

		if (trialDataStr) {
			try {
				const trialData: TrialData = JSON.parse(trialDataStr);

				// Check if the trial data is for this product
				if (trialData.product === productKey) {
					setTrialContent(trialData.content);
					setIsFromTrial(true);

					// Clear the trial data after loading
					localStorage.removeItem("writelyy_trial_data");
				}
			} catch (error) {
				console.error("Error parsing trial data:", error);
			}
		}
	}, [productKey]);

	if (children) {
		return <>{children}</>;
	}

	return (
		<div className="container mx-auto py-8">
			{isFromTrial && (
				<Alert className="mb-6">
					<InfoIcon className="h-4 w-4" />
					<AlertTitle>Welcome!</AlertTitle>
					<AlertDescription>
						We've loaded your content from the homepage. You can
						now use this tool to process it.
					</AlertDescription>
				</Alert>
			)}

			<div className="rounded-lg border bg-card p-6">
				<div className="mb-4">
					<h3 className="mb-2 font-semibold text-lg">
						Your Content
					</h3>
					<Textarea
						value={trialContent}
						onChange={(e) => setTrialContent(e.target.value)}
						placeholder="Enter your text here..."
						rows={12}
						className="resize-none"
					/>
				</div>

				<div className="rounded-lg border border-dashed bg-muted/50 p-8 text-center">
					<p className="text-foreground/60">
						This tool is currently in development. The full
						functionality will be available soon.
					</p>
				</div>
			</div>
		</div>
	);
}
