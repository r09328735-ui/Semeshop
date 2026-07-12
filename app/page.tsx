export default function HomePage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24 text-center">
      <h1 className="text-3xl font-bold">Semeshop</h1>
      <p className="max-w-md text-muted-foreground">
        Le site public arrive à l&apos;étape suivante. L&apos;authentification est déjà
        opérationnelle :{" "}
        <a href="/login" className="underline underline-offset-4">
          se connecter
        </a>{" "}
        ou{" "}
        <a href="/register" className="underline underline-offset-4">
          créer un compte
        </a>
        .
      </p>
    </main>
  );
}
