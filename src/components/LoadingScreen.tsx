/**
 * LoadingScreen Component
 * 
 * Reusable loading screen with optional message.
 * Used throughout the app for session validation and async operations.
 */

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-6">
        {/* Spinner */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>

        {/* Message */}
        <p className="text-muted-foreground tracking-tight text-[14px]">
          {message}
        </p>
      </div>
    </div>
  );
}