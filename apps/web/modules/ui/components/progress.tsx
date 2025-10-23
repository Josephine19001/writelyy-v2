"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@ui/lib";
import * as React from "react";

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
	indicatorClassName?: string;
}

const Progress = ({
	className,
	value,
	indicatorClassName,
	...props
}: ProgressProps) => (
	<ProgressPrimitive.Root
		className={cn(
			"relative h-4 w-full overflow-hidden rounded-full bg-border",
			className,
		)}
		{...props}
	>
		<ProgressPrimitive.Indicator
			className={cn(
				"size-full flex-1 rounded-full bg-primary transition-all",
				indicatorClassName,
			)}
			style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
		/>
	</ProgressPrimitive.Root>
);

export { Progress };
