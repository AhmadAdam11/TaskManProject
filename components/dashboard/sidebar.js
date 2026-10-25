"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "h-4 w-4 shrink-0",
  "aria-hidden": true,
};

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    label: "My Workspace",
    href: "/dashboard/my-workspace",
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    label: "Join Workspace",
    href: "/dashboard/join-workspace",
    icon: (
      <svg {...iconProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  function isActive(href) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-[#121212] p-4">
      <div className="mb-8 flex items-center gap-2 px-2 pt-1">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-[#e4ff7a]/70 text-[7px] font-medium uppercase text-[#e4ff7a]/70"
          aria-label="Logo placeholder"
        >
          Logo
        </div>
        <span className="text-base font-semibold tracking-tight text-[#e4ff7a]">
          Taskman
        </span>
      </div>

      <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-white/40">
        Menu
      </p>

      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-white/10 text-[#e4ff7a]"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute -left-4 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#e4ff7a]" />
              )}
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl border border-white/15 px-3 py-2.5 text-left text-sm font-medium text-white/70 transition hover:border-[#e4ff7a]/60 hover:bg-white/5 hover:text-[#e4ff7a]"
      >
        <svg {...iconProps}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        Logout
      </button>
    </aside>
  );
}