import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink } from 'lucide-react';

export function FirebaseSetupBanner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <Alert className="max-w-2xl border-2 border-destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-xl font-bold">Firebase Configuration Required</AlertTitle>
        <AlertDescription className="mt-4 space-y-4">
          <p className="text-base">
            This application requires Firebase credentials to function. Please follow these steps:
          </p>
          
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Create a Firebase project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.firebase.google.com</a></li>
            <li>Enable Authentication (Google provider), Firestore, and Storage</li>
            <li>Get your Firebase configuration from Project Settings</li>
            <li>Add the following environment variables via the Lovable Secrets UI:</li>
          </ol>

          <div className="bg-muted p-3 rounded-md font-mono text-xs">
            <div>VITE_FIREBASE_API_KEY</div>
            <div>VITE_FIREBASE_AUTH_DOMAIN</div>
            <div>VITE_FIREBASE_PROJECT_ID</div>
            <div>VITE_FIREBASE_APP_ID</div>
            <div className="text-muted-foreground">VITE_FIREBASE_STORAGE_BUCKET (optional)</div>
            <div className="text-muted-foreground">VITE_FIREBASE_MESSAGING_SENDER_ID (optional)</div>
            <div className="text-muted-foreground">VITE_FIREBASE_MEASUREMENT_ID (optional)</div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button asChild>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Firebase Console
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://docs.lovable.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                View Documentation
              </a>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            After adding the credentials, refresh this page to continue.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
