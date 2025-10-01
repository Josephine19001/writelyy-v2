import * as React from "react"

export const SnippetIcon = React.memo(
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
        <title>Snippet Icon</title>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 2C6.34315 2 5 3.34315 5 5V19C5 20.6569 6.34315 22 8 22H16C17.6569 22 19 20.6569 19 19V9L14 4H8ZM7 5C7 4.44772 7.44772 4 8 4H13V8C13 8.55228 13.4477 9 14 9H17V19C17 19.5523 16.5523 20 16 20H8C7.44772 20 7 19.5523 7 19V5ZM15 6.41421L15.5858 7H15V6.41421ZM9 11C8.44772 11 8 11.4477 8 12C8 12.5523 8.44772 13 9 13H15C15.5523 13 16 12.5523 16 12C16 11.4477 15.5523 11 15 11H9ZM8 15C8 14.4477 8.44772 14 9 14H15C15.5523 14 16 14.4477 16 15C16 15.5523 15.5523 16 15 16H9C8.44772 16 8 15.5523 8 15ZM9 17C8.44772 17 8 17.4477 8 18C8 18.5523 8.44772 19 9 19H12C12.5523 19 13 18.5523 13 18C13 17.4477 12.5523 17 12 17H9Z"
          fill="currentColor"
        />
      </svg>
    )
  }
)

SnippetIcon.displayName = "SnippetIcon"