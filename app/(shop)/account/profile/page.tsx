import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AvatarUpload } from "@/components/account/avatar-upload";
import { ProfileForm } from "@/components/account/profile-form";
import { PasswordForm } from "@/components/account/password-form";
import { DeleteAccountSection } from "@/components/account/delete-account-section";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Mon profil" };
export const dynamic = "force-dynamic";

export default async function ProfilePage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold">Photo de profil</h2>
        <AvatarUpload currentImage={user.image} name={user.name} />
      </section>

      <Separator />

      <section>
        <h2 className="mb-4 text-lg font-semibold">Informations personnelles</h2>
        <ProfileForm
          defaultValues={{ name: user.name ?? "", phone: user.phone ?? "", email: user.email }}
        />
      </section>

      {user.password && (
        <>
          <Separator />
          <section>
            <h2 className="mb-4 text-lg font-semibold">Mot de passe</h2>
            <PasswordForm />
          </section>
        </>
      )}

      <Separator />

      <section>
        <DeleteAccountSection hasPassword={Boolean(user.password)} />
      </section>
    </div>
  );
}
