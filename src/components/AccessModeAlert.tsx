import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import './AccessModeAlert.css';

interface AccessModeAlertProps {
  authMode: 'entra' | 'openai';
  apiKey: string;
  onSignInClick: () => void;
  onApiKeyClick: () => void;
}

const AccessModeAlert: React.FC<AccessModeAlertProps> = ({ 
  authMode, 
  apiKey, 
  onSignInClick, 
  onApiKeyClick 
}) => {
  const { accounts } = useMsal();
  const [showAlert, setShowAlert] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if access mode is incomplete
    const isIncomplete = 
      (authMode === 'entra' && accounts.length === 0) || 
      (authMode === 'openai' && !apiKey);

    // Only show alert if not dismissed and access is incomplete
    if (isIncomplete && !dismissed) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [authMode, apiKey, accounts, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowAlert(false);
  };

  if (!showAlert) return null;

  return (
    <div className="access-mode-alert-overlay">
      <div className="access-mode-alert">
        <div className="alert-header">
          <h3>Access Required</h3>
          <button 
            className="dismiss-button" 
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
        <div className="alert-content">
          <p>
            Choose an authentication method to use the diagram generator:
          </p>
          <div className="alert-buttons">
            <button 
              className="alert-button primary"
              onClick={() => {
                onSignInClick();
                handleDismiss();
              }}
            >
              Sign in with Microsoft
            </button>
            <button 
              className="alert-button secondary"
              onClick={() => {
                onApiKeyClick();
                handleDismiss();
              }}
            >
              Use OpenAI API Key
            </button>
          </div>
          <p className="alert-note">
            You can switch between authentication methods anytime from the settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessModeAlert;