import Image from "next/image";

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  return (
    <div className="flex items-center justify-between p-3 border border-l-4 border-red-500 bg-red-50 shadow-sm w-full h-[40px] mt-4 mb-8">
      <div className="flex items-center gap-2">
        {/* Error Icon (SVG) */}
            <Image
              src="/images/red-cross.svg"
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

export default ErrorAlert;
