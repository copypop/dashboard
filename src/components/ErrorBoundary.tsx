import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
          <Card className="max-w-2xl w-full">
            <CardHeader className="bg-red-50 border-b border-red-200">
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-6 w-6" />
                <span>Something went wrong</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-gray-700">
                  An unexpected error occurred while loading the dashboard.
                </p>
                {this.state.error && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-mono text-gray-600">
                      {this.state.error.message}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">You can try:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Refreshing the page</li>
                  <li>Checking your Excel file format</li>
                  <li>Clearing your browser cache</li>
                  <li>Contacting support if the issue persists</li>
                </ul>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    View error details (Development only)
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-auto max-h-96">
                    {this.state.error?.stack}
                    {'\n\n'}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="pt-4 flex space-x-3">
                <Button
                  onClick={this.handleReset}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}