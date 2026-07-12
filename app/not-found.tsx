import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-xl font-semibold">Page introuvable</h2>
      <p className="max-w-md text-muted-foreground">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Button asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
