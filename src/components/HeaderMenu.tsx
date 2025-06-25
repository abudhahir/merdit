import React, { useState, useRef, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import { Menu, Key, LogIn, LogOut, X } from 'lucide-react';

interface HeaderMenuProps {
  apiConfig: { apiKey: string; apiUrl: string } | null;
  onApiKeyClick: () => void;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ apiConfig, onApiKeyClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => {
      console.error(e);
    });
    setIsOpen(false);
  };

  const handleLogout = () => {
    instance.logoutPopup().catch((e) => {
      console.error(e);
    });
    setIsOpen(false);
  };

  const handleApiKeyClick = () => {
    onApiKeyClick();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-background hover:bg-background/10 rounded-lg transition-colors"
        aria-label="Menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Microsoft</span>
              </button>
              
              {apiConfig && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleApiKeyClick}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <Key className="w-4 h-4" />
                    <span>Update API Key</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderMenu;