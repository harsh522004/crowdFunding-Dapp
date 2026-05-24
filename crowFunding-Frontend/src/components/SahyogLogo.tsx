interface SahyogLogoProps {
  size?: "sm" | "md";
}

export default function SahyogLogo({ size = "md" }: SahyogLogoProps) {
  const iconSize = size === "sm" ? 24 : 30;
  const textClass = size === "sm" ? "text-base" : "text-xl";

  return (
    <div className="flex items-center gap-2">
      {/* Icon — geometric diamond with people/hands motif matching the original */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sg-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        {/* Diamond shape */}
        <path
          d="M20 3L37 14V26L20 37L3 26V14L20 3Z"
          stroke="url(#sg-grad)"
          strokeWidth="2"
          fill="none"
        />
        {/* Inner connecting lines */}
        <path
          d="M20 3V37M3 14L37 26M3 26L37 14"
          stroke="url(#sg-grad)"
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />
        {/* Center dot */}
        <circle cx="20" cy="20" r="3" fill="url(#sg-grad)" />
        {/* Top person */}
        <circle cx="20" cy="8" r="2.5" fill="url(#sg-grad)" />
        {/* Left person */}
        <circle cx="8" cy="22" r="2" fill="url(#sg-grad)" fillOpacity="0.8" />
        {/* Right person */}
        <circle cx="32" cy="22" r="2" fill="url(#sg-grad)" fillOpacity="0.8" />
      </svg>

      {/* Wordmark */}
      <span
        className={`font-bold tracking-wide bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent ${textClass}`}
      >
        Sahyog
      </span>
    </div>
  );
}
