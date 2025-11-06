import type { SupportedLanguage } from '../locales/config';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  language: SupportedLanguage;
  isDangerous?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText,
  cancelText,
  isDangerous = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconBgClass = isDangerous ? 'bg-red-100' : 'bg-blue-100';
  const iconColorClass = isDangerous ? 'text-red-600' : 'text-blue-600';
  const confirmButtonClass = isDangerous
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-blue-600 hover:bg-blue-700';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBgClass} rounded-full flex items-center justify-center flex-shrink-0`}>
              <svg
                className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColorClass}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          <p className="text-sm sm:text-base text-gray-700">{message}</p>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 flex gap-2 sm:gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base ${confirmButtonClass} text-white rounded-lg transition-colors font-medium`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes scale-in {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out;
          }
        `}
      </style>
    </div>
  );
}
