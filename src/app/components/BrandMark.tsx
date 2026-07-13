interface BrandMarkProps {
  className?: string;
}

/**
 * The Katalume Ensemble Spark: deliberate practice paths converge into an
 * illuminated result. The custom geometry remains recognizable at favicon size.
 */
export default function BrandMark({ className = "h-9 w-9" }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[30%] bg-[linear-gradient(145deg,#8686ac_0%,#505081_44%,#0f0e47_100%)] shadow-[0_6px_18px_-7px_rgba(39,39,87,0.82)] ${className}`}
    >
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none">
        <path
          d="M10 13.5C17.2 13.5 18.4 19.3 25 24M10 24H25M10 34.5C17.2 34.5 18.4 28.7 25 24"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.88"
        />
        <circle cx="10" cy="13.5" r="2.25" fill="#D8D8E8" />
        <circle cx="10" cy="24" r="2.25" fill="white" />
        <circle cx="10" cy="34.5" r="2.25" fill="#B7B7D2" />
        <path
          d="M25 24H31.2"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M36 14.5C36.9 19.4 40.6 23.1 45.5 24C40.6 24.9 36.9 28.6 36 33.5C35.1 28.6 31.4 24.9 26.5 24C31.4 23.1 35.1 19.4 36 14.5Z"
          fill="white"
        />
        <circle cx="36" cy="24" r="2.1" fill="#505081" />
        <path
          d="M4.5 15V10.5C4.5 7.2 7.2 4.5 10.5 4.5H15M33 43.5H37.5C40.8 43.5 43.5 40.8 43.5 37.5V33"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.28"
        />
      </svg>
      <span className="absolute inset-0 rounded-[30%] ring-1 ring-inset ring-white/25" />
    </span>
  );
}
