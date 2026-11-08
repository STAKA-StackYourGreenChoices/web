import { AppHeader } from "@/components/app-header";
import { api } from "@/lib/api";
import { navFor } from "@/lib/nav";
import { requireAdmin } from "@/lib/session";
import type { User } from "@/lib/types";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();
  const me = await api<User>("/auth/me");
  return (
    <>
      <AppHeader user={me} nav={navFor(session.role)} />
      <main id="main" className="mx-auto w-full max-w-[1120px] flex-1 px-5 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </>
  );
}
