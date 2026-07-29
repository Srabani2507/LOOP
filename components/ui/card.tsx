import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div 
      className={`bg-card rounded-[28px] border border-border shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
