import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib";

const iconButtonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline:
					"border border-input bg-background hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
				primary: "bg-primary text-primary-foreground hover:bg-primary/90",
				muted: "bg-muted text-muted-foreground hover:bg-muted/80",
			},
			size: {
				xs: "h-6 w-6 p-1",
				sm: "h-8 w-8 p-1.5",
				default: "h-10 w-10 p-2",
				lg: "h-12 w-12 p-2.5",
				xl: "h-14 w-14 p-3",
			},
			iconSize: {
				12: "[&>svg]:h-3 [&>svg]:w-3",
				14: "[&>svg]:h-3.5 [&>svg]:w-3.5", 
				16: "[&>svg]:h-4 [&>svg]:w-4",
				18: "[&>svg]:h-[18px] [&>svg]:w-[18px]",
				20: "[&>svg]:h-5 [&>svg]:w-5",
				24: "[&>svg]:h-6 [&>svg]:w-6",
				28: "[&>svg]:h-7 [&>svg]:w-7",
				32: "[&>svg]:h-8 [&>svg]:w-8",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			iconSize: 20,
		},
	},
);

export interface IconButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof iconButtonVariants> {
	asChild?: boolean;
	icon: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	({ className, variant, size, iconSize, asChild = false, icon, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(iconButtonVariants({ variant, size, iconSize, className }))}
				ref={ref}
				{...props}
			>
				{icon}
			</Comp>
		);
	},
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };