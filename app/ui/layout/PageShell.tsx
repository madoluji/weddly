import type React from "react";

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  className?: string;
}

const PageShell: React.FC<PageShellProps> = ({
  children,
  title,
  description,
  header,
  className = "",
}) => {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${className}`.trim()}
    >
      {(header || title || description) && (
        <div className="mb-8">
          {header ? (
            header
          ) : (
            <>
              {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
              {description && <p className="text-gray-500 mt-2">{description}</p>}
            </>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default PageShell;
