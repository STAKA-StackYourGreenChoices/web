"use client";

import { LogOut, UserRound } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu({ name, email }: { name: string; email: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Account menu for ${name}`}
          className="rounded-full text-paper hover:bg-paper/10 hover:text-paper aria-expanded:bg-paper/10 aria-expanded:text-paper"
        >
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full bg-paper/15 font-heading text-sm font-semibold"
          >
            {name.trim()[0]?.toUpperCase() ?? <UserRound className="size-4" />}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="font-medium text-ink">{name}</span>
          <span className="truncate text-xs text-ink-muted">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={logout}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full min-h-11 sm:min-h-9">
              <LogOut aria-hidden />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
