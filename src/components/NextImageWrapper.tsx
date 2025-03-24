'use client';

import React from 'react';
import Image from 'next/image';

interface NextImageWrapperProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  fill?: boolean;
  onClick?: () => void;
}

const NextImageWrapper: React.FC<NextImageWrapperProps> = ({
  src,
  alt,
  width = 0,
  height = 0,
  className = '',
  priority = false,
  style,
  fill = false,
  onClick,
}) => {
  // Handle empty or undefined src
  if (!src) {
    src = '/placeholder.png'; // Fallback image
  }

  // Default size for non-fill images
  const defaultWidth = width || 100;
  const defaultHeight = height || 100;

  return (
    <div className={`relative ${className}`} style={style} onClick={onClick}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : defaultWidth}
        height={fill ? undefined : defaultHeight}
        priority={priority}
        fill={fill}
        style={fill ? { objectFit: 'cover' } : undefined}
        className={fill ? 'object-cover' : ''}
      />
    </div>
  );
};

export default NextImageWrapper; 