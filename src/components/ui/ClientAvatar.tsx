import React from 'react';
import { cn } from '@/lib/utils';

interface ClientAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ClientAvatar: React.FC<ClientAvatarProps> = ({ 
  name, 
  size = 'md', 
  className 
}) => {
  // Generate initials from name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 0) return '?';
    return words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
  };

  const initials = getInitials(name);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  return (
    <div 
      className={cn(
        'relative flex items-center justify-center rounded-full bg-primary',
        sizeClasses[size],
        className
      )}
    >
      {/* Just the initials with primary button background */}
      <span className="font-bold text-primary-foreground">
        {initials}
      </span>
    </div>
  );
};

export default ClientAvatar;