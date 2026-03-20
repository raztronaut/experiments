"use client";

import type React from "react";
import { Component, type ReactNode } from "react";
import { captureExperimentError } from "@/lib/sentry";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
  hasError: boolean;
}

/**
 * Error boundary for experiment components.
 * Catches JavaScript errors in child component tree and displays a fallback UI.
 */
export class ExperimentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Experiment error:", error, errorInfo);
    captureExperimentError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-4xl">💥</div>
          <h2 className="mb-2 font-semibold text-xl">Something went wrong</h2>
          <p className="mb-4 text-muted-foreground">
            This experiment encountered an error.
          </p>
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={() => this.setState({ hasError: false, error: null })}
            type="button"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
