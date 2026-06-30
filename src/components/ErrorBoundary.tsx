import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Automatically reload on chunk loading errors (usually due to a new deployment)
    const msg = error.message.toLowerCase();
    if (msg.includes('failed to fetch dynamically imported module') || msg.includes('importing a module script failed')) {
      window.location.reload();
    }
  }

  handleRetry = () => {
    const msg = this.state.error?.message.toLowerCase() || '';
    if (msg.includes('failed to fetch dynamically imported module') || msg.includes('importing a module script failed')) {
      window.location.reload();
    } else {
      this.setState({ hasError: false, error: undefined });
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            We encountered an error while loading this section. Please try again.
          </p>
          {this.state.error && (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md mb-4 max-w-md overflow-auto text-left w-full break-all">
              <p className="font-semibold mb-1">Error details:</p>
              <code>{this.state.error.message}</code>
              {this.state.error.stack && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer">Stack trace</summary>
                  <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                </details>
              )}
            </div>
          )}
          <Button onClick={this.handleRetry} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
