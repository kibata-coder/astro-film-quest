import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * SectionErrorBoundary - A lightweight error boundary for individual sections.
 * Unlike the global ErrorBoundary, this one is designed for use within widgets
 * like MovieGrid or HeroBanner. If a section fails, it shows a compact "Retry"
 * UI instead of crashing the whole page.
 */
class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`SectionErrorBoundary caught an error in ${this.props.sectionName || 'section'}:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-muted/30 rounded-lg border border-border/50">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            {this.props.sectionName 
              ? `Failed to load ${this.props.sectionName}`
              : 'This section failed to load'}
          </p>
          <Button onClick={this.handleRetry} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-3 h-3" />
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
