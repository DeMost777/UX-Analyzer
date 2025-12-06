export function Logo({ className }: { className?: string }) {
    return (
      <svg
        width="68"
        height="68"
        viewBox="0 0 68 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="68" height="68" rx="16" className="fill-primary" />
        <path
          d="M20 24C20 21.7909 21.7909 20 24 20H44C46.2091 20 48 21.7909 48 24V28H20V24Z"
          className="fill-primary-foreground"
        />
        <rect x="20" y="32" width="28" height="4" rx="2" className="fill-primary-foreground/80" />
        <rect x="20" y="40" width="20" height="4" rx="2" className="fill-primary-foreground/60" />
        <circle cx="42" cy="46" r="8" className="fill-primary-foreground" />
        <path
          d="M39 46L41 48L45 44"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-primary"
        />
      </svg>
    )
  }