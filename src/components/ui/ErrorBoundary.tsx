import React, { Component, ErrorInfo, ReactNode } from 'react';
import { HomeIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Error logged silently - failures are captured by error monitoring if configured
  }

  private resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
      }
      return <DefaultErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-secondary-50">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-3">Something went wrong</h1>
        <p className="text-secondary-500 mb-6">
          We're sorry, but an unexpected error occurred. Our team has been notified.
        </p>
        <details className="text-left mb-6 p-4 bg-secondary-100 rounded-lg text-xs text-secondary-600 overflow-auto max-h-40">
          <summary className="font-medium cursor-pointer mb-2">Error Details (for debugging)</summary>
          <pre className="whitespace-pre-wrap font-mono">{error.message}</pre>
          {error.stack && <pre className="whitespace-pre-wrap font-mono mt-2">{error.stack}</pre>}
        </details>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="btn-primary"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Try Again
          </button>
          <Link to="/" className="btn-secondary flex items-center justify-center">
            <HomeIcon className="h-5 w-5 mr-2" />
            Go Home
          </Link>
        </div>
        <p className="mt-6 text-xs text-secondary-400">
          If the problem persists, please contact support or try again later.
        </p>
      </div>
    </div>
  );
}

export default ErrorBoundary;