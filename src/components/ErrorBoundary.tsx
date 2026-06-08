import { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-black">
          <div className="text-center max-w-md">
            <h1 className="text-6xl font-bold text-slate-200 dark:text-[#1a1a1a] tracking-tight">Oops</h1>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-4">
              Something went wrong
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-5 py-2.5 bg-slate-100 dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-[#262626] transition-colors"
              >
                Reintentar
              </button>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
