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
        <div className="p-8 text-center bg-surface border border-border rounded-xl" role="alert">
          <h3 className="font-sans text-lg font-semibold text-text-primary mb-2">Something went wrong</h3>
          <p className="font-sans text-sm text-text-secondary mb-5 max-w-md mx-auto">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            className="px-5 py-2 bg-transparent border border-accent-cyan rounded-md text-accent-cyan font-mono text-sm cursor-pointer transition-colors hover:bg-accent-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
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
