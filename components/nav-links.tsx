"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
}

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * "inline": links in the app bar, from 768px up.
 * "sheet": a menu button that opens a slide-over, below 768px.
 */
export function NavLinks({
  items,
  mode,
}: {
  items: NavItem[];
  mode: "inline" | "sheet";
}) {
  const pathname = usePathname();

  if (mode === "inline") {
    return (
      <nav aria-label="Main" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-11 items-center rounded-lg px-3.5 text-[0.9375rem] font-medium transition-colors",
                    active
                      ? "text-paper after:absolute after:inset-x-3.5 after:bottom-1 after:h-0.5 after:rounded-full after:bg-moss"
                      : "text-paper/75 hover:bg-paper/10 hover:text-paper",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-paper hover:bg-paper/10 hover:text-paper md:hidden"
          aria-label="Open menu"
        >
          <Menu aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(320px,85vw)] bg-paper">
        <SheetHeader>
          <SheetTitle className="font-heading text-lg">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Go to another section of STAKA
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Main">
          <ul className="flex flex-col gap-1 px-2">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center rounded-lg px-4 text-base font-medium",
                      active
                        ? "bg-forest text-paper"
                        : "text-ink hover:bg-wash",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
