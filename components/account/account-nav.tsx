"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, User, MapPin, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/account", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/account/orders", label: "Mes commandes", icon: Package },
  { href: "/account/profile", label: "Mon profil", icon: User },
  { href: "/account/addresses", label: "Mes adresses", icon: MapPin },
  { href: "/account/wishlist", label: "Liste de souhaits", icon: Heart },
];

export function AccountNav(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b pb-2 md:w-56 md:shrink-0 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:pb-0 md:pr-4">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/account" ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium",
              isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
