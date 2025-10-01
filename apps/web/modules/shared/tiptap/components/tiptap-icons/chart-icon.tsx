import * as React from "react"

export const ChartIcon = React.memo(
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
        <title>Chart Icon</title>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 11C8 10.4477 8.44772 10 9 10C9.55228 10 10 10.4477 10 11V19C10 19.5523 9.55228 20 9 20C8.44772 20 8 19.5523 8 19V11ZM14 7C14 6.44772 14.4477 6 15 6C15.5523 6 16 6.44772 16 7V19C16 19.5523 15.5523 20 15 20C14.4477 20 14 19.5523 14 19V7ZM3 5C3 4.44772 3.44772 4 4 4C4.55228 4 5 4.44772 5 5V19C5 19.5523 4.55228 20 4 20C3.44772 20 3 19.5523 3 19V5ZM20 13C20 12.4477 20.4477 12 21 12C21.5523 12 22 12.4477 22 13V19C22 19.5523 21.5523 20 21 20C20.4477 20 20 19.5523 20 19V13Z"
          fill="currentColor"
        />
      </svg>
    )
  }
)

ChartIcon.displayName = "ChartIcon"