import * as React from "react";

export const TableIcon = React.memo(
	({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		return (
			<svg
				width="24"
				height="24"
				className={className}
				viewBox="0 0 24 24"
				fill="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				{...props}
			>
				<title>Table Icon</title>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6ZM6 5C5.44772 5 5 5.44772 5 6V8H11V5H6ZM13 5V8H19V6C19 5.44772 18.5523 5 18 5H13ZM19 10H13V14H19V10ZM19 16H13V19H18C18.5523 19 19 18.5523 19 18V16ZM11 19V16H5V18C5 18.5523 5.44772 19 6 19H11ZM5 14H11V10H5V14Z"
					fill="currentColor"
				/>
			</svg>
		);
	},
);

TableIcon.displayName = "TableIcon";
