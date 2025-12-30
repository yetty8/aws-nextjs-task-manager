"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavButtonProps {
  label: string;
  href: string;
  className?: string;
  isMobile?: boolean;
  onClick?: () => void;
}

const NavButton: FC<NavButtonProps> = ({
  label,
  href,
  className,
  isMobile = false,
  onClick,
}) => {
  const pathname = usePathname();

  // Active logic:
  //  - '/' must match exactly
  //  - other paths are active if pathname starts with href + '/' or equals href
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative flex items-center font-medium transition-colors group",
        isMobile
          ? "px-4 py-2 text-sm rounded-md w-full justify-start"
          : "px-3 py-2 text-sm rounded-md",
        isActive
          ? isMobile
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
        className,
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
      {!isMobile && (
        <span
          className={cn(
            "absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-all duration-300",
            isActive ? "w-full" : "w-0 group-hover:w-full",
          )}
        />
      )}
    </Link>
  );
};

export default NavButton;
