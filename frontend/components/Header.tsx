"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticPath, setOptimisticPath] = useState(pathname);

  const isActive = (path: string) => {
    const currentPath = optimisticPath || pathname;
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const linkClass = (path: string) =>
    isActive(path)
      ? "text-gray-900 font-bold cursor-pointer"
      : "text-gray-600 hover:text-gray-900 cursor-pointer";

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOptimisticPath(path);
    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )}
      <header className="bg-white shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Life Context System</h1>
            <nav className="flex gap-1.5 items-center">
              <button type="button" onClick={handleNavigation("/")} className={linkClass("/")}>Dashboard</button>
              <div className="h-6 w-px bg-gray-300 mx-2.5"></div>
              <button type="button" onClick={handleNavigation("/entities")} className={linkClass("/entities")}>Entities</button>
              <span className="text-gray-400">•</span>
              <button type="button" onClick={handleNavigation("/experiments")} className={linkClass("/experiments")}>Experiments</button>
              <span className="text-gray-400">•</span>
              <button type="button" onClick={handleNavigation("/metrics")} className={linkClass("/metrics")}>Metrics</button>
              <span className="text-gray-400">•</span>
              <button type="button" onClick={handleNavigation("/observations")} className={linkClass("/observations")}>Observations</button>
              <span className="text-gray-400">•</span>
              <button type="button" onClick={handleNavigation("/projects")} className={linkClass("/projects")}>Projects</button>
              <span className="text-gray-400">•</span>
              <button type="button" onClick={handleNavigation("/sessions")} className={linkClass("/sessions")}>Sessions</button>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
