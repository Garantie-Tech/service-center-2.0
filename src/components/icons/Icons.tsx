const CheckmarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="#3C63FC"
    className="h-5 w-5"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clipRule="evenodd"
    />
  </svg>
);

const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9.75L12 3l9 6.75M4.5 10.5V19.5A1.5 1.5 0 006 21h3.75a.75.75 0 00.75-.75v-4.5c0-.414.336-.75.75-.75h1.5c.414 0 .75.336.75.75v4.5c0 .414.336.75.75.75H18a1.5 1.5 0 001.5-1.5V10.5"
    />
  </svg>
);

const DuplicateClaimsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}
  >
    {/* Back document */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5.5h6a1.5 1.5 0 011.5 1.5v7"
    />

    {/* Front document */}
    <rect
      x="6"
      y="8"
      width="8"
      height="10"
      rx="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export { CheckmarkIcon, HomeIcon, DuplicateClaimsIcon };
