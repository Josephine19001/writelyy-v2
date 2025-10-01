import * as React from "react"

export const SourcesIcon = React.memo(
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
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6ZM6 5C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V6C19 5.44772 18.5523 5 18 5H6Z"
          fill="currentColor"
        />
        <path
          d="M8 8C8 7.44772 8.44772 7 9 7H15C15.5523 7 16 7.44772 16 8C16 8.55228 15.5523 9 15 9H9C8.44772 9 8 8.55228 8 8Z"
          fill="currentColor"
        />
        <path
          d="M8 12C8 11.4477 8.44772 11 9 11H13C13.5523 11 14 11.4477 14 12C14 12.5523 13.5523 13 13 13H9C8.44772 13 8 12.5523 8 12Z"
          fill="currentColor"
        />
        <path
          d="M8 16C8 15.4477 8.44772 15 9 15H11C11.5523 15 12 15.4477 12 16C12 16.5523 11.5523 17 11 17H9C8.44772 17 8 16.5523 8 16Z"
          fill="currentColor"
        />
        <circle cx="14" cy="10" r="1" fill="currentColor" />
        <circle cx="16" cy="13" r="1" fill="currentColor" />
        <circle cx="15" cy="16" r="1" fill="currentColor" />
      </svg>
    )
  }
)

SourcesIcon.displayName = "SourcesIcon"