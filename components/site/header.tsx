import Link from "next/link";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SearchBar } from "@/components/site/search-bar";
import { UserMenu } from "@/components/site/user-menu";
import { MobileNav } from "@/components/site/mobile-nav";

interface HeaderProps {
  siteName: string;
  categories: { id: string; name: string; slug: string }[];
}

export function Header({ siteName, categories }: HeaderProps): JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        <MobileNav categories={categories} />
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">
          {siteName}
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/produits" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Tous les produits
          </Link>
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden flex-1 justify-end sm:flex">
          <SearchBar />
        </div>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <UserMenu />
          <CartSheet />
        </div>
      </div>
      <div className="container pb-3 sm:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
