import { useState } from 'react';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './authConfig';
import DiagramGenerator from './components/DiagramGenerator';
import UnauthenticatedDiagramGenerator from './components/UnauthenticatedDiagramGenerator';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import ApiKeyInput from './components/ApiKeyInput';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';

const msalInstance = new PublicClientApplication(msalConfig);

function App() {
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiConfig, setApiConfig] = useState<{apiKey: string, apiUrl: string} | null>(
    () => {
      const saved = localStorage.getItem('openai-api-config');
      return saved ? JSON.parse(saved) : null;
    }
  );

  const handleApiKeySave = (apiKey: string, apiUrl: string) => {
    const config = { apiKey, apiUrl };
    setApiConfig(config);
    localStorage.setItem('openai-api-config', JSON.stringify(config));
    setShowApiKeyInput(false);
  };

  return (
    <MsalProvider instance={msalInstance}>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <h1 className="text-2xl font-bold text-foreground">Mermaid Diagram Generator</h1>
            <div className="flex items-center gap-4">
              <AuthenticatedTemplate>
                <LogoutButton />
              </AuthenticatedTemplate>
              <UnauthenticatedTemplate>
                {apiConfig && (
                  <button 
                    onClick={() => setShowApiKeyInput(true)} 
                    className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    title="Update OpenAI API configuration"
                  >
                    ⚙️ Update API Key
                  </button>
                )}
                <LoginButton />
              </UnauthenticatedTemplate>
            </div>
          </div>
        </header>

        <main className="container mx-auto py-8 px-4 flex-1">
          <AuthenticatedTemplate>
            <div className="h-full">
              <DiagramGenerator />
            </div>
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <div className="max-w-7xl mx-auto">
              <UnauthenticatedDiagramGenerator 
                apiConfig={apiConfig}
                onApiKeyRequest={() => setShowApiKeyInput(true)}
              />
            </div>
          </UnauthenticatedTemplate>
        </main>
        
        {showApiKeyInput && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ApiKeyInput
                onSave={handleApiKeySave}
                onCancel={() => setShowApiKeyInput(false)}
              />
            </div>
          </div>
        )}
      </div>
    </MsalProvider>
  );
}

export default App;