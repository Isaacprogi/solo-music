import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("Caught error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <span className="text-2xl text-red-500">⚠️</span>
            </div>

            <h1 className="text-xl font-semibold text-white">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              An unexpected error occurred. Please refresh the page or try again
              later.
            </p>

            <button
              onClick={this.handleReload}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
