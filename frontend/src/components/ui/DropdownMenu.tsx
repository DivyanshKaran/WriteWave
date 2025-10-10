"use client";

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export interface DropdownMenuGroup {
  id: string;
  items: DropdownMenuItem[];
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[] | DropdownMenuGroup[];
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export const DropdownMenuComponent: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'end',
  className = ''
}) => {
  const renderMenuItem = (item: DropdownMenuItem) => (
    <DropdownMenu.Item
      key={item.id}
      className="
        h-10 px-4 body text-base flex items-center cursor-pointer
        hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-150
      "
      disabled={item.disabled}
      onSelect={item.onClick}
    >
      {item.icon && (
        <span className="w-5 h-5 mr-3 flex items-center justify-center">
          {item.icon}
        </span>
      )}
      {item.label}
    </DropdownMenu.Item>
  );

  const renderMenuGroup = (group: DropdownMenuGroup) => (
    <DropdownMenu.Group key={group.id}>
      {group.items.map(renderMenuItem)}
    </DropdownMenu.Group>
  );

  const renderSeparator = () => (
    <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger}
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={`
            min-w-[200px] bg-white border-base shadow-lg z-50
            focus:outline-none
            ${className}
          `}
          align={align}
          sideOffset={4}
        >
          {items.map((item, index) => {
            const isGroup = 'items' in item;
            const shouldShowSeparator = index > 0 && !isGroup;
            
            return (
              <React.Fragment key={isGroup ? item.id : item.id}>
                {shouldShowSeparator && renderSeparator()}
                {isGroup ? renderMenuGroup(item) : renderMenuItem(item)}
              </React.Fragment>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

// Convenience component for common dropdown patterns
interface SimpleDropdownProps {
  label: string;
  items: DropdownMenuItem[];
  className?: string;
}

export const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  label,
  items,
  className = ''
}) => {
  return (
    <DropdownMenuComponent
      trigger={
        <button
          className={`
            h-12 px-4 body text-base bg-white text-black border-base
            flex items-center justify-between
            hover:border-strong focus:border-2 focus:border-black
            focus:outline-none transition-colors duration-200
            ${className}
          `}
        >
          {label}
          <ChevronDown className="w-4 h-4 ml-2" strokeWidth={1.5} />
        </button>
      }
      items={items}
    />
  );
};
