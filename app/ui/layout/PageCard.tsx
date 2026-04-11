import type React from "react";

interface PageCardProps {
  children: React.ReactNode;
  className?: string;
}

const PageCard: React.FC<PageCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-dark-surface rounded-xl shadow-sm border dark:border-dark-outline-variant p-6 ${className}`.trim()}>
      {children}
    </div>
  );
};

export default PageCard;
