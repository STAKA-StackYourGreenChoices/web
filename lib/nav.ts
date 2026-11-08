import type { NavItem } from "@/components/nav-links";
import type { Role } from "./types";

/**
 * The one main menu. Admins see the same links everywhere, so moving between
 * their wardrobe and the catalog never changes the bar under them.
 */
export function navFor(role: Role): NavItem[] {
  const items: NavItem[] = [
    { href: "/wardrobe", label: "Wardrobe" },
    { href: "/scan", label: "Scan" },
  ];
  if (role === "ADMIN") {
    items.push(
      { href: "/admin/products", label: "Products" },
      { href: "/admin/brands", label: "Brands" },
      { href: "/admin/import", label: "Import" },
      { href: "/admin/claims", label: "Claims" },
    );
  }
  return items;
}
