import React from "react";

interface CardProps {
  children: React.ReactNode; // Correct type for children
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  // Destructure children from props
  return (
    <>
      <div
        className={`w-full border border-primary-500 dark:border-dark-outline-variant dark:bg-dark-surface p-6 rounded-lg ${className}`}
      >
        {children}
      </div>
    </>
  );
};

export default Card;
