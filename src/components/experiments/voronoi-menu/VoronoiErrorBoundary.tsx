import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class VoronoiErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("VoronoiErrorBoundary caught an error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-950 p-6 text-center border border-red-900/50 rounded-lg">
                    <div className="bg-red-900/20 p-4 rounded-full mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-red-400 mb-2">
                        Simulation Offline
                    </h2>
                    <p className="text-zinc-500 text-sm mb-6 max-w-md">
                        The active scenario encountered a critical error and had to be
                        terminated.
                    </p>
                    <div className="bg-zinc-900/50 p-3 rounded font-mono text-xs text-zinc-400 w-full overflow-x-auto mb-6 max-h-32 text-left">
                        {this.state.error?.message}
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors text-sm font-medium"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reload Scenario
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
