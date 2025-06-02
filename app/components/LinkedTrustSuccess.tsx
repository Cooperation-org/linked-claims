import React from 'react';

interface LinkedTrustSuccessProps {
  message: string;
  claimUrl?: string;
  isExisting?: boolean;
}

export const LinkedTrustSuccess: React.FC<LinkedTrustSuccessProps> = ({ 
  message, 
  claimUrl,
  isExisting = false
}) => {
  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {isExisting ? 'Credential Already Shared' : 'Success!'}
          </p>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
          {claimUrl && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">
                A new tab will open to claim your credential. If it doesn't, click below:
              </p>
              <a
                href={claimUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Open Claim Page
                <svg
                  className="ml-1 h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
