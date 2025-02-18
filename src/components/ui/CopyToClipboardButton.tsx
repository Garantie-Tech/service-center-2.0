import { useState } from "react";
import Image from "next/image";

const CopyToClipboardButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <button onClick={copyToClipboard} className="relative group">
      <Image
        src="/images/copy-icon.svg"
        alt="Copy"
        width={24}
        height={24}
        className="cursor-pointer"
      />
      {/* Tooltip */}
      <span
        className={`absolute -top-7 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs rounded bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      >
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
};

export default CopyToClipboardButton;
