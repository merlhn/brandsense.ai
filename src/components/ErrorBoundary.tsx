import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to console in development
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <h1 className="text-foreground tracking-tight mb-3">
                Something went wrong
              </h1>
              <p className="text-muted-foreground tracking-tight mb-2">
                We're sorry for the inconvenience. An unexpected error occurred.
              </p>
              {typeof import.meta !== 'undefined' && import.meta.env?.DEV && this.state.error && (
                <p className="text-muted-foreground tracking-tight mt-4 p-4 bg-card border border-border rounded-lg text-left overflow-auto max-h-32">
                  <span className="text-destructive font-medium">Error:</span>{' '}
                  {this.state.error.message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={this.handleReload}
                className="w-full h-11 bg-primary hover:bg-primary/90"
              >
                Reload Page
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full h-11 bg-card border-border hover:bg-secondary/80"
              >
                Go Back
              </Button>
            </div>

            {/* Support Link */}
            <p className="text-center text-muted-foreground tracking-tight mt-6">
              If the problem persists, please{' '}
              <a
                href="mailto:support@brandsense.io"
                className="text-primary hover:underline"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
