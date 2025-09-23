import Image from "next/image";

interface WarningAlertProps {
  message: string;
  onClose?: () => void;
}

const WarningAlert: React.FC<WarningAlertProps> = ({ message, onClose }) => {
  return (
    <div className="flex items-center justify-between p-3 border border-l-4 border-yellow-500 bg-yellow-50 shadow-sm w-full h-[40px] mt-4 mb-8">
      <div className="flex items-center gap-2">
        {/* Error Icon (SVG) */}
            <Image
              src="/images/action-required-icon.svg"
              alt="Cancel Icon"
              width={20}
              height={20}
              className="relative"
            />

        <span className="text-xs text-[#181818]">{message}</span>
      </div>

      {/* Close Button (SVG) */}
      {onClose && (
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default WarningAlert;
