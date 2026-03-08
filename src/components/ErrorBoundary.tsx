import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 text-center bg-white border border-slate-200/60 rounded-xl shadow-sm" role="alert">
          <h3 className="text-base font-medium text-slate-900 mb-1">Something went wrong</h3>
          <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-800 transition-colors"
            onClick={this.handleRetry}
            type="button"
            aria-label="Retry loading this section"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
