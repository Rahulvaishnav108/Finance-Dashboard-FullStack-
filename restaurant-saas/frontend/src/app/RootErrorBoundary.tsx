import React, { useState } from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';

export default function RootErrorBoundary(): JSX.Element {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  let errorMessage = 'An unexpected error occurred.';
  let errorStack = '';

  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}`;
    errorStack = typeof error.data === 'string' ? error.data : JSON.stringify(error.data);
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  const handleGoBack = () => {
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="relative max-w-lg w-full flex flex-col items-center text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center text-red-500 mb-6">
          <span className="material-symbols-outlined text-4xl">error</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight font-sans">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="text-slate-600 text-sm mb-8 max-w-md leading-relaxed font-sans">
          We encountered an unexpected error on this page. Our team has been notified, and we&apos;re working to get it resolved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full mb-8">
          <button
            onClick={handleReload}
            className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh Page
          </button>

          <button
            onClick={handleGoBack}
            className="flex-1 bg-sd-primary hover:bg-orange-600 active:scale-95 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Go to Home
          </button>
        </div>

        {/* Developer details accordion */}
        <div className="w-full text-left border-t border-slate-200 pt-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <span>DEVELOPER DETAILS</span>
            <span className="material-symbols-outlined text-[16px] transition-transform duration-300" style={{ transform: showDetails ? 'rotate(180deg)' : 'none' }}>
              expand_more
            </span>
          </button>

          {showDetails && (
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto max-h-48 text-left text-xs font-mono text-red-600 leading-relaxed sd-custom-scrollbar">
              <div className="font-bold text-slate-900 mb-1.5">{errorMessage}</div>
              {errorStack && <pre className="whitespace-pre text-[10px] text-slate-500 select-all">{errorStack}</pre>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
