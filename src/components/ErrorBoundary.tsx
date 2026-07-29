import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production this is where you'd send to an error-tracking service (e.g. Sentry)
    console.error("Uncaught application error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="bg-white rounded-lg shadow p-10 text-center max-w-md">
            <AlertTriangle size={48} className="mx-auto text-[#d62828] mb-4" />
            <h1 className="text-xl font-bold text-[#003049] mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-6">
              An unexpected error occurred. You can try again, or return to the homepage.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-[#f77f00] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d62828] transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="bg-white border border-gray-300 text-[#003049] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
