import * as React from "react"

export const DrawIcon = React.memo(
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
        <title>Draw Icon</title>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21.2635 2.29289C20.873 1.90237 20.2398 1.90237 19.8493 2.29289L18.9769 3.16525C17.8618 2.63254 16.4857 2.82801 15.5621 3.75165L4.95549 14.3582L10.6123 20.0151L21.2189 9.40854C22.1426 8.48491 22.338 7.1088 21.8053 5.99367L22.6777 5.12132C23.0682 4.7308 23.0682 4.09763 22.6777 3.70711L21.2635 2.29289ZM16.9955 5.17582C17.3357 4.83559 17.8882 4.83559 18.2284 5.17582L18.7955 5.74293C19.1357 6.08316 19.1357 6.63559 18.7955 6.97582L7.80751 17.9638L6.17086 16.3271L16.9955 5.17582ZM5.41371 19.5794L3 21.0137L4.43431 18.5996L5.41371 19.5794Z"
          fill="currentColor"
        />
      </svg>
    )
  }
)

DrawIcon.displayName = "DrawIcon"