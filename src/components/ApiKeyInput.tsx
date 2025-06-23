import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

interface ApiKeyInputProps {
  onSave: (apiKey: string, apiUrl: string) => void;
  onCancel: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave, onCancel }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('https://api.openai.com/v1');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API Key is required');
      return;
    }
    if (!apiUrl.trim()) {
      setError('API URL is required');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(apiUrl);
    } catch {
      setError('Please enter a valid API URL');
      return;
    }

    setError(null);
    onSave(apiKey.trim(), apiUrl.trim());
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configure OpenAI API</CardTitle>
        <CardDescription>
          Enter your OpenAI API credentials as a fallback option:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="apiKey">OpenAI API Key:</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="apiUrl">API Base URL:</Label>
          <Input
            id="apiUrl"
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
          />
          <div className="mt-3 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Note:</strong> Due to browser CORS restrictions, direct OpenAI API calls may not work. The app will automatically try using a CORS proxy. For production use, deploy with a backend proxy.
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-primary hover:underline mb-2">
                Setup options to avoid CORS issues
              </summary>
              <div className="space-y-3 mt-2">
                <div className="p-3 bg-background border rounded">
                  <strong className="text-foreground">Option 1: Local Proxy Server (Recommended)</strong>
                  <p className="text-muted-foreground mt-1">Use API URL: <code className="bg-muted px-1 rounded">http://localhost:3001</code></p>
                  <p className="text-muted-foreground">Run: <code className="bg-muted px-1 rounded">npm run proxy</code></p>
                </div>
                <div className="p-3 bg-background border rounded">
                  <strong className="text-foreground">Option 2: CORS Proxy</strong>
                  <p className="text-muted-foreground mt-1">Use API URL: <code className="bg-muted px-1 rounded text-xs">https://cors-anywhere.herokuapp.com/https://api.openai.com/v1</code></p>
                  <p className="text-muted-foreground">Note: May require requesting access first</p>
                </div>
                <div className="p-3 bg-background border rounded">
                  <strong className="text-foreground">Option 3: Browser Extension</strong>
                  <p className="text-muted-foreground mt-1">Install a CORS browser extension and use: <code className="bg-muted px-1 rounded">https://api.openai.com/v1</code></p>
                  <p className="text-muted-foreground">Warning: Only for development, not production</p>
                </div>
              </div>
            </details>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save & Continue
          </Button>
        </div>
        
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Security Note:</strong> Your API key will be stored locally in your browser and used only for making requests to the OpenAI API. It will not be sent to any other servers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;