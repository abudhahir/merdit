import { useState } from 'react';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './authConfig';
import DiagramGenerator from './components/DiagramGenerator';
import UnauthenticatedDiagramGenerator from './components/UnauthenticatedDiagramGenerator';
import ApiKeyInput from './components/ApiKeyInput';
import HeaderMenu from './components/HeaderMenu';

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
        <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-[calc(100%-2rem)]">
          <div className="bg-foreground/90 backdrop-blur-md border border-background/20 rounded-2xl shadow-lg px-6 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-background">Mermaid Diagram Generator</h1>
              <HeaderMenu 
                apiConfig={apiConfig}
                onApiKeyClick={() => setShowApiKeyInput(true)}
              />
            </div>
          </div>
        </header>

        <main className="container mx-auto py-8 px-4 flex-1 pt-24">
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