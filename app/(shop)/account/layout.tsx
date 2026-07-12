import { AccountNav } from "@/components/account/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-semibold">Mon compte</h1>
      <div className="flex flex-col gap-8 md:flex-row">
        <AccountNav />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
