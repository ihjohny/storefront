"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallbackTitle?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep fallback UI simple for storefront; logs can be wired later.
    void error;
    void info;
  }

  private onRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          <p className="font-medium">{this.props.fallbackTitle || "Something went wrong."}</p>
          <button
            type="button"
            onClick={this.onRetry}
            className="mt-3 inline-flex items-center justify-center rounded-md border border-rose-300 px-3 py-1.5 text-xs transition hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-900/40"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
