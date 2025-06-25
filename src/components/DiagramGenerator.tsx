import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useMsal } from '@azure/msal-react';
import { apiRequest } from '../authConfig';
import DiagramViewerSimple from './DiagramViewerSimple';
import type { DiagramViewerHandle } from './DiagramViewerSimple';
import ActionMenu from './ActionMenu';
import { Download, FileCode, Image, FileText, Copy, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface DiagramResponse {
  message: string;
  mermaidCode: string;
  diagramType: 'flowchart' | 'sequence' | 'class' | 'state' | 'er' | 'gantt';
  suggestions: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  exportHints?: {
    recommendedFormat: 'svg' | 'png' | 'html';
    reason: string;
  };
}

interface DiagramHistoryItem {
  prompt: string;
  response: DiagramResponse;
  timestamp: number;
}

const DiagramGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [diagramResponse, setDiagramResponse] = useState<DiagramResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConfig] = useState<{apiKey: string, apiUrl: string} | null>(
    () => {
      const saved = localStorage.getItem('openai-api-config');
      return saved ? JSON.parse(saved) : null;
    }
  );
  const [diagramHistory, setDiagramHistory] = useState<DiagramHistoryItem[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const diagramViewerRef = useRef<DiagramViewerHandle>(null);
  const diagramRenderedRef = useRef<string | null>(null);
  const { instance, accounts } = useMsal();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    if (diagramResponse?.mermaidCode && diagramViewerRef.current) {
      // Reset rendered ref when diagram response changes
      if (diagramRenderedRef.current !== diagramResponse.mermaidCode) {
        diagramRenderedRef.current = null;
      }
      renderDiagram();
    }
  }, [diagramResponse]);

  const renderDiagram = async () => {
    const diagramContainer = diagramViewerRef.current?.getDiagramContainer();
    if (!diagramContainer || !diagramResponse?.mermaidCode) return;

    // Check if we've already rendered this exact diagram
    if (diagramRenderedRef.current === diagramResponse.mermaidCode) {
      return;
    }

    try {
      const element = diagramContainer;
      element.innerHTML = `<div class="mermaid">${diagramResponse.mermaidCode}</div>`;
      await mermaid.run();
      
      // Mark this diagram as rendered
      diagramRenderedRef.current = diagramResponse.mermaidCode;
    } catch (err) {
      console.error('Error rendering diagram:', err);
      setError('Failed to render diagram');
    }
  };


  const addToHistory = (prompt: string, response: DiagramResponse) => {
    const historyItem: DiagramHistoryItem = {
      prompt,
      response,
      timestamp: Date.now(),
    };
    
    // Remove any items after current index (if user went back and created new diagram)
    const newHistory = diagramHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(historyItem);
    
    // Keep only last 10 items
    const trimmedHistory = newHistory.slice(-10);
    
    setDiagramHistory(trimmedHistory);
    setCurrentHistoryIndex(trimmedHistory.length - 1);
  };

  const goToPreviousDiagram = () => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const historyItem = diagramHistory[newIndex];
      setCurrentHistoryIndex(newIndex);
      setPrompt(historyItem.prompt);
      setDiagramResponse(historyItem.response);
      setError(null);
    }
  };

  const goToNextDiagram = () => {
    if (currentHistoryIndex < diagramHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const historyItem = diagramHistory[newIndex];
      setCurrentHistoryIndex(newIndex);
      setPrompt(historyItem.prompt);
      setDiagramResponse(historyItem.response);
      setError(null);
    }
  };

  const clearHistory = () => {
    setDiagramHistory([]);
    setCurrentHistoryIndex(-1);
  };

  const generateWithOpenAI = async (prompt: string) => {
    if (!apiConfig) {
      throw new Error('OpenAI API configuration not found');
    }

    const response = await fetch(`${apiConfig.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a specialized Mermaid diagram generator. Generate a JSON response with this exact structure:
{
  "message": "Brief description of what was created",
  "mermaidCode": "Valid Mermaid diagram code",
  "diagramType": "flowchart|sequence|class|state|er|gantt",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "complexity": "simple|moderate|complex",
  "exportHints": {
    "recommendedFormat": "svg|png|html",
    "reason": "Explanation for format recommendation"
  }
}

Create diagrams based on user descriptions. Use appropriate Mermaid syntax and suggest the best diagram type for their needs.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    try {
      return JSON.parse(content);
    } catch {
      // If JSON parsing fails, create a basic response
      return {
        message: "Generated a basic diagram from your description",
        mermaidCode: `graph TD\n    A[${prompt}] --> B[Generated Diagram]`,
        diagramType: "flowchart",
        suggestions: ["Try being more specific about the components", "Add more details about the relationships"],
        complexity: "simple",
        exportHints: {
          recommendedFormat: "svg",
          reason: "SVG recommended for scalability"
        }
      };
    }
  };

  const generateDiagram = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Try Azure OpenAI first
      const tokenResponse = await instance.acquireTokenSilent({
        ...apiRequest,
        account: accounts[0],
      });

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenResponse.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Azure OpenAI service unavailable');
      }

      const result: DiagramResponse = await response.json();
      setDiagramResponse(result);
      addToHistory(prompt, result);
    } catch (azureError) {
      console.warn('Azure OpenAI failed, trying fallback:', azureError);
      
      // Try OpenAI fallback if available
      if (apiConfig) {
        try {
          const result = await generateWithOpenAI(prompt);
          setDiagramResponse(result);
          addToHistory(prompt, result);
          setError(null);
        } catch (openaiError) {
          console.error('OpenAI fallback also failed:', openaiError);
          setError('Both Azure OpenAI and OpenAI fallback failed. Please check your configuration.');
          showMockResponse();
        }
      } else {
        // No fallback configured, show option to configure
        setError('Azure OpenAI service is unavailable. You can configure OpenAI API as a fallback.');
        showMockResponse();
      }
    } finally {
      setLoading(false);
    }
  };

  const showMockResponse = () => {
    // Show a mock response for demonstration
    const mockResponse: DiagramResponse = {
      message: "Demo: Created a simple flowchart based on your description.",
      mermaidCode: `graph TD
    A[Start] --> B[Process Input]
    B --> C{Valid Input?}
    C -->|Yes| D[Generate Diagram]
    C -->|No| E[Show Error]
    D --> F[Display Result]
    E --> B`,
      diagramType: 'flowchart',
      suggestions: ['Configure OpenAI API for full functionality', 'This is a demo diagram'],
      complexity: 'simple',
      exportHints: {
        recommendedFormat: 'svg',
        reason: 'SVG recommended for scalability and clarity'
      }
    };
    setDiagramResponse(mockResponse);
  };

  const exportDiagram = async (format: 'png' | 'svg' | 'html' | 'mermaid') => {
    if (!diagramResponse?.mermaidCode) return;

    try {
      if (format === 'mermaid') {
        downloadFile('diagram.mmd', diagramResponse.mermaidCode, 'text/plain');
        return;
      }

      const diagramContainer = diagramViewerRef.current?.getDiagramContainer();
      const element = diagramContainer?.querySelector('svg');
      if (!element) throw new Error('No diagram to export');

      switch (format) {
        case 'svg':
          const svgData = new XMLSerializer().serializeToString(element);
          downloadFile(`diagram.svg`, svgData, 'image/svg+xml');
          break;
        case 'png':
          // Use html2canvas for PNG export
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(element as unknown as HTMLElement);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'diagram.png';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          });
          break;
        case 'html':
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
              <script>mermaid.initialize({ startOnLoad: true });</script>
            </head>
            <body>
              <div class="mermaid">${diagramResponse.mermaidCode}</div>
            </body>
            </html>`;
          downloadFile(`diagram.html`, htmlContent, 'text/html');
          break;
      }
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export diagram');
    }
  };

  const copyMermaidCode = () => {
    if (!diagramResponse?.mermaidCode) return;
    
    navigator.clipboard.writeText(diagramResponse.mermaidCode).then(() => {
      // Could add a toast notification here
      console.log('Mermaid code copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
    });
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="diagram-generator">
      <div className="input-panel">
        <h2>Describe Your Diagram</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the diagram you want to create (e.g., 'Create a flowchart showing user login process' or 'Show how our web app, database, and cache interact')"
          rows={10}
          className="prompt-input"
        />
        <div className="action-buttons">
          <button 
            onClick={generateDiagram} 
            disabled={loading || !prompt.trim()}
            className="generate-button"
          >
            {loading ? 'Generating...' : 'Generate Diagram'}
          </button>
        </div>
        
        
        {apiConfig && (
          <div className="api-status">
            <span className="api-configured">✅ OpenAI API configured as fallback</span>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
            {!apiConfig && error.includes('unavailable') && (
              <div className="configure-fallback-hint">
                Use the menu to configure OpenAI API as fallback
              </div>
            )}
          </div>
        )}
        
        {diagramResponse && (
          <div className="response-info">
            <p><strong>Message:</strong> {diagramResponse.message}</p>
            {diagramResponse.suggestions.length > 0 && (
              <div>
                <strong>Suggestions:</strong>
                <ul>
                  {diagramResponse.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            {diagramResponse.exportHints && (
              <div className="export-hints">
                <strong>Export Recommendation:</strong> {diagramResponse.exportHints.recommendedFormat.toUpperCase()} - {diagramResponse.exportHints.reason}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="diagram-panel relative">
        <div className="diagram-header">
          <h2>Diagram Preview</h2>
          {diagramResponse && (
            <ActionMenu
              groups={[
                {
                  title: 'Export',
                  items: [
                    {
                      id: 'export-svg',
                      label: 'Export as SVG',
                      icon: <FileText className="w-4 h-4" />,
                      action: () => exportDiagram('svg')
                    },
                    {
                      id: 'export-png',
                      label: 'Export as PNG',
                      icon: <Image className="w-4 h-4" />,
                      action: () => exportDiagram('png')
                    },
                    {
                      id: 'export-html',
                      label: 'Export as HTML',
                      icon: <FileCode className="w-4 h-4" />,
                      action: () => exportDiagram('html')
                    },
                    {
                      id: 'export-mermaid',
                      label: 'Export Mermaid Code',
                      icon: <Download className="w-4 h-4" />,
                      action: () => exportDiagram('mermaid')
                    },
                    {
                      id: 'copy-code',
                      label: 'Copy Mermaid Code',
                      icon: <Copy className="w-4 h-4" />,
                      action: copyMermaidCode
                    }
                  ]
                },
                {
                  title: 'History',
                  items: [
                    {
                      id: 'prev-diagram',
                      label: `Previous (${currentHistoryIndex + 1}/${diagramHistory.length})`,
                      icon: <ChevronLeft className="w-4 h-4" />,
                      action: goToPreviousDiagram,
                      disabled: currentHistoryIndex <= 0 || diagramHistory.length === 0
                    },
                    {
                      id: 'next-diagram',
                      label: 'Next',
                      icon: <ChevronRight className="w-4 h-4" />,
                      action: goToNextDiagram,
                      disabled: currentHistoryIndex >= diagramHistory.length - 1 || diagramHistory.length === 0
                    },
                    {
                      id: 'clear-history',
                      label: 'Clear History',
                      icon: <Trash2 className="w-4 h-4" />,
                      action: clearHistory,
                      disabled: diagramHistory.length === 0
                    }
                  ]
                }
              ]}
            />
          )}
        </div>
        <DiagramViewerSimple ref={diagramViewerRef} className="h-full" />
        {!diagramResponse && (
          <div className="placeholder absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p>Your diagram will appear here</p>
              <p>Enter a description on the left and click "Generate Diagram" to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagramGenerator;