import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="felt-bg flex min-h-screen items-center justify-center page-bg p-6">
          <div className="w-full max-w-sm rounded-2xl border border-separator-strong bg-surface-raised p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red/8">
              <AlertTriangle size={28} className="text-red" />
            </div>
            <h2 className="mb-2 font-display text-xl text-ivory">Something went wrong</h2>
            <p className="mb-6 text-sm text-text-secondary">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 rounded-xl gradient-accent px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
            >
              <RefreshCw size={14} />
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
