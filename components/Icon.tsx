import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className, size = 20 }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LucideIcon = (LucideIcons as any)[name];

  if (!LucideIcon) {
    console.warn(`Icon ${name} not found`);
    return <LucideIcons.HelpCircle className={className} size={size} />;
  }

  return <LucideIcon className={className} size={size} />;
};