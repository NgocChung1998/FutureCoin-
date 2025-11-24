"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingDown, TrendingUp, Menu, X, List, Coins } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  badge?: number;
};

const baseNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/lists", label: "Lists", icon: List },
  { href: "/coins", label: "Coins", icon: Coins },
  { href: "/short", label: "SHORT", icon: TrendingDown },
  { href: "/long", label: "LONG", icon: TrendingUp },
];

export const Navigation = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>(baseNavItems);

  useEffect(() => {
    // Fetch list count để hiển thị badge
    fetch("/api/lists/count")
      .then((res) => res.json())
      .then((data) => {
        if (data.count) {
          setNavItems((items) =>
            items.map((item) =>
              item.href === "/lists" ? { ...item, badge: data.count } : item
            )
          );
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }, []);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap relative",
                isActive
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/30 text-indigo-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {mobileOpen && (
          <div className="absolute top-16 left-4 right-4 bg-[#0b1221] border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-500/30 text-indigo-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

