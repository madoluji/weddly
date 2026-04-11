"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

// JobNavBar: A navigation bar component with three links (Best Matches, Most Recent, Saved Jobs)
const JobNavBar = () => {
  const currentPath = usePathname(); // Get the current path from Next.js router

  const navItems = [
    { label: "Best Matches", href: "/user/best-matches" },
    { label: "Most Recent", href: "/user/most-recent" },
    { label: "Saved Wedding Gigs", href: "/user/saved-jobs" },
  ];

  const isActive = (href: string) => {
    if (href === "/user/best-matches") {
      return currentPath === "/user" || currentPath === href || currentPath.startsWith(`${href}/`);
    }
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  const activeItem = navItems.find((item) => isActive(item.href));

  const baseLinkClass =
    "rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition";

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.11em] text-slate-500 dark:text-dark-on-surface-variant">
        You are viewing: <span className="text-primary-700">{activeItem?.label || "Jobs"}</span>
      </p>

      <ul className="flex flex-row flex-wrap gap-2 text-slate-600 dark:text-dark-on-surface-variant">
        {navItems.map((item) => (
          <li key={item.href} className="relative">
            <Link
              className={clsx(
                baseLinkClass,
                isActive(item.href)
                  ? "border-primary-200 bg-primary-50 text-primary-700"
                  : "hover:border-slate-200 dark:hover:border-dark-outline-variant hover:bg-slate-50 dark:hover:bg-dark-surface-container hover:text-primary-600"
              )}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobNavBar;
