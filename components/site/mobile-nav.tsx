"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface MobileNavProps {
  categories: { id: string; name: string; slug: string }[];
}

export function MobileNav({ categories }: MobileNavProps): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          <Link href="/produits" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
            Tous les produits
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              {category.name}
            </Link>
          ))}
          <div className="my-2 border-t" />
          <Link href="/a-propos" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
            À propos
          </Link>
          <Link href="/contact" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
            Contact
          </Link>
          <Link href="/faq" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
            FAQ
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
