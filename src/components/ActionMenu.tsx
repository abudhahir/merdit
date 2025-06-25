import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu
} from 'lucide-react';

interface ActionMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface ActionMenuProps {
  groups: {
    title: string;
    items: ActionMenuItem[];
  }[];
  className?: string;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ groups, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (action: () => void, disabled?: boolean) => {
    if (!disabled) {
      action();
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Actions menu"
      >
        <Menu className="w-4 h-4" />
        <span className="text-sm font-medium">Actions</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {groups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {groupIndex > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700" />
              )}
              {group.title && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.action, item.disabled)}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    item.disabled 
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;