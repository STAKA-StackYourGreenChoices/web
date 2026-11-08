import { AccountMenu } from "@/components/account-menu";
import { NavLinks, type NavItem } from "@/components/nav-links";
import { Wordmark } from "@/components/wordmark";

/** The Forest app bar shared by the shopper and admin areas. */
export function AppHeader({
  user,
  nav,
}: {
  user: { name: string; email: string };
  nav: NavItem[];
}) {
  return (
    // Focus rings switch to paper here: indigo would vanish against forest.
    <header className="sticky top-0 z-40 bg-forest text-paper [&_:focus-visible]:outline-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-2 px-3 sm:px-6">
        <NavLinks items={nav} mode="sheet" />
        <div className="flex items-center gap-3 md:mr-6">
          <Wordmark href="/" className="px-1 text-paper" />
        </div>
        <NavLinks items={nav} mode="inline" />
        <div className="ml-auto">
          <AccountMenu name={user.name} email={user.email} />
        </div>
      </div>
    </header>
  );
}
