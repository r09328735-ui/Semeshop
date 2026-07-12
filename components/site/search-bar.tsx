"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { Input } from "@/components/ui/input";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

export function SearchBar(): JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json() as Promise<{ products: SearchResult[] }>)
        .then((data) => {
          setResults(data.products);
          setOpen(true);
        })
        .catch(() => undefined);
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    if (query.trim().length === 0) return;
    setOpen(false);
    router.push(`/produits?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un produit..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-9 pr-8"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/produits/${product.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border-b p-2 last:border-0 hover:bg-accent"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                {product.image && (
                  <Image src={product.image} alt={product.name} fill sizes="40px" className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm">{product.name}</span>
                <span className="text-xs text-muted-foreground">{formatPrice(product.price)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
