import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback component. If omitted, a default retry UI is shown. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Class-based ErrorBoundary that catches render errors in its subtree.
 * Provides a retry button to re-mount children.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
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
        <div className={styles.errorBoundary} role="alert">
          <div className={styles.icon} aria-hidden="true">
            ⚠️
          </div>
          <h3 className={styles.title}>Something went wrong</h3>
          <p className={styles.message}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            className={styles.retryButton}
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
