import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import { Button } from './ui/button';

const LoginButton: React.FC = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => {
      console.error(e);
    });
  };

  return (
    <Button onClick={handleLogin} variant="secondary" size="default" className="bg-background text-foreground hover:bg-background/80">
      Sign in with Microsoft
    </Button>
  );
};

export default LoginButton;