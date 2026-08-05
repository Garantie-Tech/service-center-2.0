"use client";

interface DocumentDateInfoProps {
  document?: {
    uploaded_at_formatted?: string | null;
    validated_at_formatted?: string | null;
    created_at?: string | null;
  } | null;
}

export default function DocumentDateInfo({ document }: DocumentDateInfoProps) {
  const uploadedAt =
    document?.uploaded_at_formatted ?? document?.created_at ?? null;
  const validatedAt = document?.validated_at_formatted ?? null;

  if (!uploadedAt && !validatedAt) {
    return null;
  }

  return (
    <span className="relative inline-flex align-middle group">
      <button
        type="button"
        aria-label="Document dates"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-500 hover:text-primaryBlue focus:outline-none focus:ring-1 focus:ring-primaryBlue/40"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M10 8.75V14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="10" cy="6" r="1" fill="currentColor" />
        </svg>
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 min-w-[190px] -translate-x-1/2 rounded-md bg-[#1f2937] px-3 py-2 text-left text-xs font-semibold leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <span className="block">Uploaded: {uploadedAt ?? "Not available"}</span>
        <span className="block">Validated: {validatedAt ?? "Pending"}</span>
      </span>
    </span>
  );
}
