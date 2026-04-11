import type React from "react";

interface PageCardProps {
  children: React.ReactNode;
  className?: string;
}

const PageCard: React.FC<PageCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`.trim()}>
      {children}
    </div>
  );
};

export default PageCard;
