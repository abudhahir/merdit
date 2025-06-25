import React from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from './ui/button';

const LogoutButton: React.FC = () => {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutPopup().catch((e) => {
      console.error(e);
    });
  };

  return (
    <Button onClick={handleLogout} variant="ghost" size="default" className="text-background hover:bg-background/10">
      Sign out
    </Button>
  );
};

export default LogoutButton;