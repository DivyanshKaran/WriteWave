"use client";

import React from 'react';
import Image from 'next/image';
import { isJapaneseText, getJapaneseStyles } from '@/lib/utils';

interface AccessibleImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  decorative?: boolean;
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  decorative = false
}) => {
  // Determine if image is decorative
  const isDecorative = decorative || alt === '';
  
  // Get Japanese text styles if alt contains Japanese
  const japaneseStyles = isJapaneseText(alt) ? getJapaneseStyles() : {};

  return (
    <Image
      src={src}
      alt={isDecorative ? '' : alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      aria-hidden={isDecorative}
      style={japaneseStyles}
    />
  );
};

// Decorative image component
export const DecorativeImage: React.FC<Omit<AccessibleImageProps, 'alt' | 'decorative'>> = (props) => {
  return (
    <AccessibleImage
      {...props}
      alt=""
      decorative={true}
    />
  );
};

// Icon image component
export const IconImage: React.FC<{
  src: string;
  alt: string;
  size?: number;
  className?: string;
}> = ({ src, alt, size = 24, className = '' }) => {
  return (
    <AccessibleImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      decorative={false}
    />
  );
};

// Avatar image component
export const AvatarImage: React.FC<{
  src: string;
  alt: string;
  size?: number;
  className?: string;
}> = ({ src, alt, size = 32, className = '' }) => {
  return (
    <AccessibleImage
      src={src}
      alt={`${alt} avatar`}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      decorative={false}
    />
  );
};

// Hero image component
export const HeroImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}> = ({ src, alt, width, height, className = '', priority = true }) => {
  return (
    <AccessibleImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      decorative={false}
    />
  );
};
